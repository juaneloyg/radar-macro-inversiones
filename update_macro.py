import yfinance as yf
import pandas as pd
from supabase import create_client, Client
from datetime import datetime, timedelta
import ssl
import json
import os

# Bypass SSL verify limits if running on older windows certs
ssl._create_default_https_context = ssl._create_unverified_context

# --- CONFIGURACIÓN DE SUPABASE ---
URL = os.environ.get("SUPABASE_URL", "https://lkoizdlmsbwyzjvgtoej.supabase.co")
# Usa la SERVICE_ROLE_KEY para evitar errores de RLS (Row Level Security)
KEY = os.environ.get("SUPABASE_KEY", "sb_publishable_xGHZRrtthdqIwAOanNtEgA_56QLeKmS")

supabase: Client = create_client(URL, KEY)

# --- DICCIONARIOS DE ACTIVOS ---
# 1. Yahoo Finance (Diario)
yf_tickers = {
    # INDICADORES MACRO
    "vix": "^VIX",
    "dolar": "DX-Y.NYB",
    "tipos": "^TNX",
    "move": "^MOVE",
    
    # ACTIVOS DEL EXPLORADOR
    "asset_gold": "GC=F",
    "asset_silver": "SI=F",
    "asset_copper": "HG=F",
    "asset_brent": "BZ=F",
    "asset_crude": "CL=F",
    "asset_natgas": "NG=F",
    "asset_wheat": "ZW=F",
    "asset_corn": "ZC=F",
    "asset_soy": "ZS=F",
    "asset_btc": "BTC-USD",
    "asset_ndx": "^NDX",
    "asset_sp500": "^GSPC"
}

# 2. FRED St. Louis (Mezcla de diario, semanal y mensual)
fred_tickers = {
    "credito": "BAA10Y", # Corporate Credit Spreads (Baa) - Full history
    "curva": "T10Y2Y",         # Curva 10Y-2Y (Diario)
    "inflacion": "T5YIFR",     # Expectativas 5 años (Diario)
    "liquidez": "WALCL",       # Balance FED (Semanal)
    "crecimiento": "CFNAI",     # Chicago Fed Nat Activity (Mensual)
    "cds_us": "BAMLH0A0HYM2",  # US High Yield OAS (Proxy CDS US)
    "cds_eu": "BAMLHE00EHYIOAS", # Euro High Yield OAS (Proxy CDS EU) - CORRECTED
    "cds_em": "BAMLEMCBPIOAS"  # Emerging Markets Corporate Plus Index OAS - CORRECTED
}

print("Arrancando descarga de 25 años de histórico...")
start_date = (datetime.now() - timedelta(days=25*365)).strftime('%Y-%m-%d')
end_date = (datetime.now() + timedelta(days=1)).strftime('%Y-%m-%d')

# Dataframe maestro para unir todo
master_df = pd.DataFrame()

# DESCARGA YAHOO FINANCE
for indicator_id, ticker in yf_tickers.items():
    print(f"Descargando {indicator_id} desde Yahoo Finance ({ticker})...")
    data = yf.download(ticker, start=start_date, end=end_date, progress=False)
    if not data.empty:
        # Tomar precio de cierre
        series = data['Close']
        if isinstance(series, pd.DataFrame):
            series = series.iloc[:, 0]
        
        # Eliminar zona horaria si existe para evitar problemas de merge
        if series.index.tz is not None:
            series.index = series.index.tz_localize(None)
        
        # Quedarse solo con la fecha (eliminar horas si las hay)
        series.index = pd.to_datetime(series.index).normalize()
            
        series.name = indicator_id
        master_df = pd.merge(master_df, series, left_index=True, right_index=True, how='outer')

# DESCARGA FRED ST. LOUIS (Simplificado)
import time
for indicator_id, ticker in fred_tickers.items():
    print(f"Descargando {indicator_id} desde FRED ({ticker})...")
    time.sleep(1) # Pequeña pausa
    try:
        url = f"https://fred.stlouisfed.org/graph/fredgraph.csv?id={ticker}"
        # pd.read_csv maneja los headers y la conexión de forma nativa a menudo más estable
        data = pd.read_csv(url, index_col=0, parse_dates=True, na_values=['.'])
        
        data = data.loc[start_date:end_date]
        if not data.empty:
            series = data.iloc[:, 0].astype(float)
            series.index = pd.to_datetime(series.index).normalize()
            series.name = indicator_id
            master_df = pd.merge(master_df, series, left_index=True, right_index=True, how='outer')
            print(f"  OK: {len(series)} registros unidos.")
        else:
            print(f"  ADVERTENCIA: {indicator_id} no tiene datos.")
    except Exception as e:
        print(f"  ERROR en {indicator_id}: {e}")

# LIMPIEZA Y FORWARD-FILL
print("Limpiando y unificando fechas...")
master_df = master_df.sort_index()

# Rellenar huecos para que los datos semanales/mensuales de FRED se vean continuos
master_df.ffill(inplace=True)

# Limpiar filas completamente vacías (que no tengan ningún indicador)
master_df.dropna(how='all', inplace=True)

# Solo queremos filas que tengan al menos una fecha válida, 
# pero ya no forzamos que el VIX esté presente para no recortar histórico
# si otros indicadores (como Crédito) tienen más historial.

# --- INSERCIÓN EN SUPABASE ---
print(f"Empezando inyección a Supabase (Total filas: {len(master_df)})...")

records = []
for index, row in master_df.iterrows():
    day_str = index.strftime('%Y-%m-%d')
    for col in master_df.columns:
        val = row[col]
        if pd.isna(val):
            continue
        
        records.append({
            "date": day_str,
            "indicator_id": col,
            "value": round(float(val), 4)
        })

# Enviar en paquetes de 1000
batch_size = 1000
total_records = len(records)
print(f"Lotes listos. Total registros a subir: {total_records}")

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
        print("EL PROCESO HA FALLADO. Los datos de Supabase pueden estar incompletos.")
        exit(1)

print("¡PROCESO COMPLETADO! Todo el histórico de 25 años está ahora en Supabase.")
