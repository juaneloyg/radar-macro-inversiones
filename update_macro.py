import yfinance as yf
import pandas as pd
from supabase import create_client, Client
from datetime import datetime, timedelta
import ssl
import json

# Bypass SSL verify limits if running on older windows certs
ssl._create_default_https_context = ssl._create_unverified_context

# --- CONFIGURACIÓN DE SUPABASE ---
URL = "https://lkoizdlmsbwyzjvgtoej.supabase.co"
# ATENCIÓN: Si tienes RLS activado (Row Level Security), la clave anónima (anon key) puede darte
# un error de permisos al guardar (insert). Si te da error, pega aquí tu SERVICE ROLE KEY:
KEY = "sb_publishable_xGHZRrtthdqIwAOanNtEgA_56QLeKmS"

supabase: Client = create_client(URL, KEY)

# --- DICCIONARIOS DE ACTIVOS ---
# 1. Yahoo Finance (Diario)
yf_tickers = {
    "vix": "^VIX",
    "dolar": "DX-Y.NYB",
    "tipos": "^TNX"
}

# 2. FRED St. Louis (Mezcla de diario, semanal y mensual)
fred_tickers = {
    "credito": "BAMLH0A0HYM2", # High Yield Spreads (Diario)
    "curva": "T10Y2Y",         # Curva 10Y-2Y (Diario)
    "inflacion": "T5YIFR",     # Expectativas 5 años (Diario)
    "liquidez": "WALCL",       # Balance FED (Semanal)
    "crecimiento": "CFNAI"     # Chicago Fed Nat Activity (Mensual)
}

print("Arrancando descarga de 25 años de histórico...")
start_date = (datetime.now() - timedelta(days=25*365)).strftime('%Y-%m-%d')
end_date = datetime.now().strftime('%Y-%m-%d')

# Dataframe maestro para unir todo
master_df = pd.DataFrame()

# DESCARGA YAHOO FINANCE
for indicator_id, ticker in yf_tickers.items():
    print(f"Descargando {indicator_id} desde Yahoo Finance ({ticker})...")
    data = yf.download(ticker, start=start_date, end=end_date, progress=False)
    if not data.empty:
        # Tomar precio de cierre
        series = data['Close']
        # Si es un MultiIndex (pasa en versiones nuevas de yfinance), aplanarlo
        if isinstance(series, pd.DataFrame):
            series = series.iloc[:, 0]
            
        series.name = indicator_id
        master_df = pd.merge(master_df, series, left_index=True, right_index=True, how='outer')

# DESCARGA FRED ST. LOUIS (Vía CSV directo para máxima compatibilidad)
for indicator_id, ticker in fred_tickers.items():
    print(f"Descargando {indicator_id} desde FRED ({ticker})...")
    try:
        url = f"https://fred.stlouisfed.org/graph/fredgraph.csv?id={ticker}"
        import requests
        import io
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
        response = requests.get(url, headers=headers, timeout=15)
        response.raise_for_status()
        data = pd.read_csv(io.StringIO(response.text), index_col=0, parse_dates=True, na_values=['.'])
        
        data = data.loc[start_date:end_date]
        if not data.empty:
            series = data[ticker].astype(float)
            series.name = indicator_id
            master_df = pd.merge(master_df, series, left_index=True, right_index=True, how='outer')
    except Exception as e:
        print(f"Error descargando {ticker}: {e}")

# LIMPIEZA Y FORWARD-FILL (Para datos semanales/mensuales)
print("Limpiando y unificando fechas (Fill Forward)...")
master_df.index = pd.to_datetime(master_df.index)
master_df = master_df.sort_index()

# Rellenar "hacia adelante" los datos mensuales (crecimiento) y semanales (liquidez)
master_df.ffill(inplace=True)

# Borrar filas sin datos críticos
master_df.dropna(subset=['tipos', 'dolar', 'vix'], inplace=True)

# --- INSERCIÓN EN SUPABASE ---
print("Empezando inyección a Supabase...")

# Formatear a lista de Json para Supabase
# Como son 25 años (7000+ filas * 8 indicadores), agruparemos en lotes para no saturar Supabase.
records = []
for index, row in master_df.iterrows():
    day_str = index.strftime('%Y-%m-%d')
    for col in master_df.columns:
        val = row[col]
        # Validar si es Nan para descartar
        if pd.isna(val):
            continue
        
        records.append({
            "date": day_str,
            "indicator_id": col,
            "value": round(float(val), 4)
        })

# Enviar a Supabase en paquetes de 1000
batch_size = 1000
total_records = len(records)
print(f"Total de registros históricos a inyectar: {total_records}")

# Primero: Borramos el histórico anterior para tener una base limpia si ejecutas esto varias veces
print("Limpiando tabla macro_history antigua...")
supabase.table("macro_history").delete().neq("indicator_id", "dummy").execute()

success_count = 0
for i in range(0, total_records, batch_size):
    batch = records[i:i + batch_size]
    try:
        res = supabase.table("macro_history").insert(batch).execute()
        success_count += len(batch)
        print(f"Enviados {success_count} / {total_records} registros...")
    except Exception as e:
        print(f"Subida abortada en lote {i}. Error: {e}")
        break

print("¡PROCESO COMPLETADO! Todo el histórico de 25 años está ahora en Supabase.")
