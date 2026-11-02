
import pandas as pd
from pathlib import Path

# =====================================
# 1. LOCATE PROJECT AND DATASET
# =====================================

project_folder = Path(__file__).resolve().parent.parent

file_path = (
    project_folder / "data" / "raw" /
    "raw_transactions.csv"
)

report_folder = project_folder / "data" / "processed"
report_folder.mkdir(parents=True, exist_ok=True)

report_file = report_folder / "data_quality_report.txt"

# =====================================
# 2. LOAD DATASET
# =====================================

if not file_path.exists():
    raise FileNotFoundError(
        f"Dataset not found: {file_path}"
    )

df = pd.read_csv(file_path)

if df.empty:
    raise ValueError("Dataset is empty!")

print("\n===== DEFI DATA QUALITY ANALYSIS =====")

report = []

def log(message=""):
    message = str(message)
    print(message)
    report.append(message)

# =====================================
# 3. DATASET OVERVIEW
# =====================================

log("\n1. DATASET OVERVIEW")
log(f"Dataset: {file_path.name}")
log(f"Total rows: {len(df)}")
log(f"Total columns: {len(df.columns)}")

log("\nColumn names:")
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
log(f"Total missing cells: {df.isnull().sum().sum()}")

if "to" in df.columns:
    log(
        f"Missing receiver addresses: "
        f"{df['to'].isnull().sum()}"
    )
    log(
        "Note: Missing 'to' addresses may represent "
        "contract creation transactions."
    )

# =====================================
# 6. DUPLICATE TRANSACTIONS
# =====================================

log("\n4. DUPLICATE TRANSACTIONS")

if "hash" in df.columns:
    duplicates = df["hash"].duplicated().sum()
    log(f"Duplicate transaction hashes: {duplicates}")
else:
    log("Transaction hash column not found.")

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

elif "value" in df.columns:

    values = pd.to_numeric(
        df["value"], errors="coerce"
    )

    log("Using value column for analysis.")
    log(str(values.describe()))
    log(f"Invalid value entries: {values.isnull().sum()}")

else:
    log("No recognised transaction value column found.")

# =====================================
# 8. GAS ANALYSIS
# =====================================

log("\n6. GAS ANALYSIS")

gas_column = None

for column in ["gas_limit", "gas", "gas_used"]:
    if column in df.columns:
        gas_column = column
        break

if gas_column:

    gas = pd.to_numeric(
        df[gas_column], errors="coerce"
    )

    log(f"Analysing column: {gas_column}")
    log(str(gas.describe()))

else:
    log("No recognised gas column found.")

# =====================================
# 9. SENDER WALLET FREQUENCY
# =====================================

log("\n7. TOP SENDER WALLETS")

if "from" in df.columns:
    log(str(df["from"].value_counts().head(10)))
else:
    log("Sender column not found.")

# =====================================
# 10. TIMESTAMP ANALYSIS
# =====================================

log("\n8. TIMESTAMP ANALYSIS")

if "timestamp" in df.columns:

    timestamps = pd.to_datetime(
        df["timestamp"],
        unit="s",
        errors="coerce",
        utc=True
    )

    log(f"Earliest timestamp: {timestamps.min()}")
    log(f"Latest timestamp: {timestamps.max()}")
    log(f"Invalid timestamps: {timestamps.isnull().sum()}")

else:
    log("Timestamp column not found.")

# =====================================
# 11. UNIQUE WALLET ANALYSIS
# =====================================

log("\n9. WALLET ANALYSIS")

if "from" in df.columns:
    log(f"Unique senders: {df['from'].nunique()}")

if "to" in df.columns:
    log(f"Unique receivers: {df['to'].nunique()}")

# =====================================
# 12. SAVE REPORT
# =====================================

report_file.write_text(
    "\n".join(report),
    encoding="utf-8"
)

print("\n===== ANALYSIS COMPLETED =====")
print(f"\nReport saved at: {report_file}")
