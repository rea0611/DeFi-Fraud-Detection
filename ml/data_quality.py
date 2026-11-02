
import pandas as pd
from pathlib import Path

# =====================================
# 1. LOCATE PROJECT AND DATASET
# =====================================

project_folder = Path(__file__).resolve().parent.parent

file_path = (
    project_folder / "data" / "raw" /
    "ethereum_transactions.csv"
)

report_folder = project_folder / "data" / "processed"
report_folder.mkdir(parents=True, exist_ok=True)

# =====================================
# 2. LOAD DATASET
# =====================================

df = pd.read_csv(file_path)

if df.empty:
    raise ValueError("Dataset is empty!")

print("\n===== DEFI DATA QUALITY ANALYSIS =====")

# Store report lines
report = []

def log(message=""):
    print(message)
    report.append(str(message))

# =====================================
# 3. DATASET OVERVIEW
# =====================================

log("\n1. DATASET OVERVIEW")

log(f"Total rows: {len(df)}")
log(f"Total columns: {len(df.columns)}")

log("\nColumns:")
log(str(list(df.columns)))

# =====================================
# 4. DATA TYPES
# =====================================

log("\n2. DATA TYPES")

log(str(df.dtypes))

# =====================================
# 5. MISSING VALUES
# =====================================

log("\n3. MISSING VALUES")

missing = df.isnull().sum()

log(str(missing))

# A missing receiver can indicate contract creation.
if "to" in df.columns:
    log(
        "\nMissing receiver addresses: "
        f"{df['to'].isnull().sum()}"
    )
    log(
        "Note: Missing 'to' can represent "
        "contract creation transactions."
    )

# =====================================
# 6. DUPLICATE TRANSACTIONS
# =====================================

log("\n4. DUPLICATE TRANSACTIONS")

if "hash" in df.columns:
    duplicates = df["hash"].duplicated().sum()
    log(f"Duplicate hashes: {duplicates}")

# =====================================
# 7. TRANSACTION VALUE ANALYSIS
# =====================================

log("\n5. TRANSACTION VALUE ANALYSIS")

if "value_eth" in df.columns:

    values = pd.to_numeric(
        df["value_eth"], errors="coerce"
    )

    log(str(values.describe()))

    log(f"Invalid value entries: {values.isnull().sum()}")
    log(f"Negative values: {(values < 0).sum()}")

# =====================================
# 8. GAS ANALYSIS
# =====================================

log("\n6. GAS ANALYSIS")

if "gas_limit" in df.columns:

    gas = pd.to_numeric(
        df["gas_limit"], errors="coerce"
    )

    log(str(gas.describe()))

# =====================================
# 9. WALLET FREQUENCY
# =====================================

log("\n7. TOP SENDER WALLETS")

if "from" in df.columns:
    log(str(df["from"].value_counts().head(10)))

# =====================================
# 10. TIMESTAMP ANALYSIS
# =====================================

log("\n8. TIMESTAMP ANALYSIS")

if "timestamp" in df.columns:

    timestamps = pd.to_datetime(
        df["timestamp"],
        errors="coerce",
        utc=True
    )

    log(f"Earliest: {timestamps.min()}")
    log(f"Latest: {timestamps.max()}")

    log(
        f"Invalid timestamps: {timestamps.isnull().sum()}"
    )

# =====================================
# 11. UNIQUE WALLETS
# =====================================

log("\n9. WALLET ANALYSIS")

if "from" in df.columns:
    log(
        f"Unique senders: {df['from'].nunique()}"
    )

if "to" in df.columns:
    log(
        f"Unique receivers: {df['to'].nunique()}"
    )

# =====================================
# 12. SAVE REPORT
# =====================================

report_file = (
    report_folder / "data_quality_report.txt"
)

report_file.write_text(
    "\n".join(report),
    encoding="utf-8"
)

log("\n===== ANALYSIS COMPLETED =====")
print("\nReport saved at:", report_file)
