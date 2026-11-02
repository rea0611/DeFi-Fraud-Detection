
import pandas as pd
from pathlib import Path

# =============================================
# 1. PROJECT PATHS
# =============================================

PROJECT_DIR = Path(__file__).resolve().parent.parent

INPUT_FILE = (
    PROJECT_DIR / "data" / "raw" /
    "raw_transactions.csv"
)

OUTPUT_DIR = PROJECT_DIR / "data" / "processed"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

OUTPUT_FILE = OUTPUT_DIR / "cleaned_transactions.csv"
REPORT_FILE = OUTPUT_DIR / "preprocessing_report.txt"

# =============================================
# 2. LOAD RAW DATA
# =============================================

print("\n===== DEFI DATA PREPROCESSING =====")

if not INPUT_FILE.exists():
    raise FileNotFoundError(
        f"Raw dataset not found: {INPUT_FILE}"
    )

df = pd.read_csv(INPUT_FILE)

if df.empty:
    raise ValueError("Raw dataset is empty!")

original_count = len(df)

print("Original records:", original_count)

# =============================================
# 3. VALIDATE DATASET STRUCTURE
# =============================================

required_columns = [
    "hash",
    "from",
    "to",
    "value_wei",
    "value_eth",
    "gas",
    "block",
    "timestamp"
]

missing_columns = [
    col for col in required_columns
    if col not in df.columns
]

if missing_columns:
    raise ValueError(
        f"Missing required columns: {missing_columns}"
    )

# Keep only the expected dataset columns.
df = df[required_columns].copy()

# =============================================
# 4. CLEAN TRANSACTION IDENTIFIERS
# =============================================

df["hash"] = df["hash"].astype("string").str.strip()

df["from"] = df["from"].astype("string").str.strip()

df["to"] = df["to"].astype("string").str.strip()

# Empty receiver values are treated as missing.
# Missing receivers may represent contract creation.

df["to"] = df["to"].replace("", pd.NA)

# =============================================
# 5. REMOVE INVALID IDENTIFIERS
# =============================================

before = len(df)

df = df.dropna(
    subset=["hash", "from"]
).copy()

invalid_identifiers_removed = before - len(df)

# =============================================
# 6. REMOVE DUPLICATE TRANSACTIONS
# =============================================

before = len(df)

df = df.drop_duplicates(
    subset=["hash"],
    keep="first"
).copy()

duplicates_removed = before - len(df)

# =============================================
# 7. CONVERT NUMERIC COLUMNS
# =============================================

numeric_columns = [
    "value_wei",
    "value_eth",
    "gas",
    "block",
    "timestamp"
]

for column in numeric_columns:
    df[column] = pd.to_numeric(
        df[column],
        errors="coerce"
    )

# =============================================
# 8. VALIDATE NUMERIC VALUES
# =============================================

before = len(df)

df = df.dropna(
    subset=numeric_columns
).copy()

invalid_numeric_removed = before - len(df)

# Remove impossible negative values.
before = len(df)

df = df[
    (df["value_wei"] >= 0) &
    (df["value_eth"] >= 0) &
    (df["gas"] >= 0) &
    (df["block"] >= 0) &
    (df["timestamp"] >= 0)
].copy()

negative_values_removed = before - len(df)

# =============================================
# 9. VERIFY ETH AND WEI CONSISTENCY
# =============================================

# Check whether the ETH value approximately matches
# the exact Wei value converted to ETH.

expected_eth = (
    df["value_wei"].astype("float64") / 10**18
)

wei_mismatch = ~(
    abs(expected_eth - df["value_eth"]) <=
    1e-12 + 1e-9 * abs(expected_eth)
)

print(
    "Wei/ETH consistency mismatches:",
    int(wei_mismatch.sum())
)

# Preserve both original columns.
# Do not silently overwrite transaction values.

# =============================================
# 10. CONVERT UNIX TIMESTAMP
# =============================================

df["timestamp"] = pd.to_datetime(
    df["timestamp"],
    unit="s",
    errors="coerce",
    utc=True
)

before = len(df)

df = df.dropna(
    subset=["timestamp"]
).copy()

invalid_timestamps_removed = before - len(df)

# =============================================
# 11. FINAL VALIDATION
# =============================================

if df.empty:
    raise ValueError(
        "No valid transactions remain after preprocessing."
    )

# Sort by block and transaction time.
df = df.sort_values(
    by=["block", "timestamp"],
    ascending=True
).reset_index(drop=True)

# =============================================
# 12. SAVE CLEANED DATASET
# =============================================

df.to_csv(
    OUTPUT_FILE,
    index=False
)

# =============================================
# 13. GENERATE PREPROCESSING REPORT
# =============================================

cleaned_count = len(df)

removed_count = original_count - cleaned_count

report = [
    "===== DEFI PREPROCESSING REPORT =====",
    f"Original records: {original_count}",
    f"Cleaned records: {cleaned_count}",
    f"Total records removed: {removed_count}",
    f"Invalid identifiers removed: {invalid_identifiers_removed}",
    f"Duplicate transactions removed: {duplicates_removed}",
    f"Invalid numeric records removed: {invalid_numeric_removed}",
    f"Negative-value records removed: {negative_values_removed}",
    f"Invalid timestamps removed: {invalid_timestamps_removed}",
    f"Wei/ETH consistency mismatches: {int(wei_mismatch.sum())}",
    "",
    "Remaining missing values:",
    str(df.isnull().sum()),
    "",
    f"Zero-value transactions: {(df['value_eth'] == 0).sum()}",
    f"Non-zero transactions: {(df['value_eth'] > 0).sum()}",
    f"Unique senders: {df['from'].nunique()}",
    f"Unique receivers: {df['to'].nunique()}",
    f"Missing receivers retained: {df['to'].isna().sum()}",
    "",
    f"Earliest timestamp: {df['timestamp'].min()}",
    f"Latest timestamp: {df['timestamp'].max()}",
    "",
    f"Cleaned dataset: {OUTPUT_FILE}"
]

REPORT_FILE.write_text(
    "\n".join(report),
    encoding="utf-8"
)

# =============================================
# 14. DISPLAY RESULTS
# =============================================

print("\n===== PREPROCESSING REPORT =====")

print("Original records:", original_count)
print("Cleaned records:", cleaned_count)
print("Removed records:", removed_count)

print("\nMissing values:")
print(df.isnull().sum())

print("\nZero-value transactions:",
      (df["value_eth"] == 0).sum())

print("Missing receivers retained:",
      df["to"].isna().sum())

print("\nEarliest timestamp:", df["timestamp"].min())
print("Latest timestamp:", df["timestamp"].max())

print("\nCleaned dataset saved at:")
print(OUTPUT_FILE)

print("\nReport saved at:")
print(REPORT_FILE)

print("\n===== PREPROCESSING COMPLETED =====")
