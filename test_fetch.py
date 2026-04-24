import yfinance as yf
import pandas as pd
from datetime import datetime, timedelta
import ssl
import time

ssl._create_default_https_context = ssl._create_unverified_context

yf_tickers = {
    "vix": "^VIX",
    "dolar": "DX-Y.NYB",
    "tipos": "^TNX",
    "move": "^MOVE"
}

fred_tickers = {
    "credito": "BAA10Y",
    "cds_us": "BAMLH0A0HYM2",
    "cds_eu": "BAMLEURH0A0HYM2",
    "cds_em": "BAMLEMCBPIT2YEY",
    "liquidez": "WALCL"
}

start_date = (datetime.now() - timedelta(days=365)).strftime('%Y-%m-%d')
end_date = (datetime.now() + timedelta(days=1)).strftime('%Y-%m-%d')

print(f"Testing for period: {start_date} to {end_date}")

for id, ticker in yf_tickers.items():
    data = yf.download(ticker, start=start_date, end=end_date, progress=False)
    print(f"YF {id} ({ticker}): {len(data)} rows")

for id, ticker in fred_tickers.items():
    url = f"https://fred.stlouisfed.org/graph/fredgraph.csv?id={ticker}"
    try:
        data = pd.read_csv(url, index_col=0, parse_dates=True, na_values=['.'])
        data = data.loc[start_date:end_date]
        print(f"FRED {id} ({ticker}): {len(data)} rows")
    except Exception as e:
        print(f"FRED {id} ({ticker}) ERROR: {e}")
    time.sleep(1)
