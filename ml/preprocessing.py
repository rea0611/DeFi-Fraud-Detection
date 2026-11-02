
import pandas as pd
from pathlib import Path

# Locate project
project_folder = Path(__file__).resolve().parent.parent

input_file = (
    project_folder / "data" / "raw" /
    "ethereum_transactions.csv"
)

output_folder = project_folder / "data" / "processed"
output_folder.mkdir(parents=True, exist_ok=True)

output_file = output_folder / "cleaned_transactions.csv"

# Load raw data
df = pd.read_csv(input_file)

print("Original records:", len(df))

# 1. Remove duplicate transaction hashes
df = df.drop_duplicates(subset=["hash"], keep="first")

# 2. Clean wallet addresses
df["from"] = df["from"].astype("string").str.strip()

df["to"] = df["to"].astype("string").str.strip()

# 3. Convert numerical columns
for column in ["value_wei", "gas_limit",
               "gas_price_wei", "block"]:
    df[column] = pd.to_numeric(
        df[column], errors="coerce"
    )

# 4. Convert ETH values
df["value_eth"] = pd.to_numeric(
    df["value_eth"], errors="coerce"
)

# 5. Convert timestamps
df["timestamp"] = pd.to_datetime(
    df["timestamp"], errors="coerce", utc=True
)

# 6. Remove records with invalid essential fields
df = df.dropna(
    subset=["hash", "from", "value_wei",
            "value_eth", "block", "timestamp"]
)

# 7. Remove impossible negative values
df = df[
    (df["value_wei"] >= 0) &
    (df["value_eth"] >= 0) &
    (df["gas_limit"] >= 0)
]

# 8. Save cleaned data
df.to_csv(output_file, index=False)

print("\n===== PREPROCESSING REPORT =====")
print("Cleaned records:", len(df))
print("Removed records:", "See original and cleaned counts")
print("Missing values:")
print(df.isnull().sum())

print("\nCleaned dataset saved at:")
print(output_file)

print("\nPREPROCESSING COMPLETED!")
