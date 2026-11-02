
import pandas as pd
import matplotlib.pyplot as plt
from pathlib import Path

# =====================================
# 1. PROJECT PATHS
# =====================================

PROJECT = Path(__file__).resolve().parent.parent

INPUT_FILE = PROJECT / "data" / "raw" / "raw_transactions.csv"

OUTPUT_DIR = PROJECT / "data" / "processed"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

PLOT_DIR = OUTPUT_DIR / "eda_plots"
PLOT_DIR.mkdir(parents=True, exist_ok=True)

# =====================================
# 2. LOAD DATA
# =====================================

df = pd.read_csv(INPUT_FILE)

print("\n===== DEFI TRANSACTION EDA =====")
print("Total transactions:", len(df))

# Convert relevant columns
df["value_eth"] = pd.to_numeric(df["value_eth"], errors="coerce")
df["gas"] = pd.to_numeric(df["gas"], errors="coerce")
df["timestamp"] = pd.to_numeric(df["timestamp"], errors="coerce")

df["datetime"] = pd.to_datetime(
    df["timestamp"],
    unit="s",
    errors="coerce",
    utc=True
)

# =====================================
# 3. BASIC STATISTICS
# =====================================

print("\n1. TRANSACTION STATISTICS")

print("\nETH Value:")
print(df["value_eth"].describe())

print("\nGas Statistics:")
print(df["gas"].describe())

print("\nZero-value transactions:",
      (df["value_eth"] == 0).sum())

print("Non-zero transactions:",
      (df["value_eth"] > 0).sum())

print("\n2. WALLET STATISTICS")

print("Unique senders:", df["from"].nunique())
print("Unique receivers:", df["to"].nunique())

print("\nTop 10 senders:")
print(df["from"].value_counts().head(10))

# =====================================
# 4. TRANSACTION FREQUENCY
# =====================================

print("\n3. TRANSACTION FREQUENCY")

daily_transactions = (
    df.dropna(subset=["datetime"])
      .set_index("datetime")
      .resample("D")
      .size()
)

print(daily_transactions)

# =====================================
# 5. VALUE DISTRIBUTION
# =====================================

plt.figure(figsize=(9, 5))

plt.hist(
    df["value_eth"].dropna(),
    bins=50
)

plt.title("Transaction Value Distribution")
plt.xlabel("Transaction Value (ETH)")
plt.ylabel("Frequency")
plt.tight_layout()

plt.savefig(PLOT_DIR / "transaction_value_distribution.png")
plt.close()

# =====================================
# 6. GAS DISTRIBUTION
# =====================================

plt.figure(figsize=(9, 5))

plt.hist(
    df["gas"].dropna(),
    bins=50
)

plt.title("Gas Distribution")
plt.xlabel("Gas Field Value")
plt.ylabel("Frequency")
plt.tight_layout()

plt.savefig(PLOT_DIR / "gas_distribution.png")
plt.close()

# =====================================
# 7. DAILY TRANSACTION TREND
# =====================================

plt.figure(figsize=(10, 5))

daily_transactions.plot()

plt.title("Daily Transaction Frequency")
plt.xlabel("Date")
plt.ylabel("Number of Transactions")
plt.xticks(rotation=45)
plt.tight_layout()

plt.savefig(PLOT_DIR / "daily_transaction_frequency.png")
plt.close()

# =====================================
# 8. TOP SENDER WALLETS
# =====================================

top_senders = df["from"].value_counts().head(10)

plt.figure(figsize=(10, 5))

top_senders.plot(kind="bar")

plt.title("Top 10 Most Active Sender Wallets")
plt.xlabel("Wallet Address")
plt.ylabel("Transaction Count")
plt.xticks(rotation=75)
plt.tight_layout()

plt.savefig(PLOT_DIR / "top_sender_wallets.png")
plt.close()

# =====================================
# 9. SAVE EDA SUMMARY
# =====================================

summary = [
    "DEFI TRANSACTION EDA SUMMARY",
    f"Total transactions: {len(df)}",
    f"Unique senders: {df['from'].nunique()}",
    f"Unique receivers: {df['to'].nunique()}",
    f"Zero-value transactions: {(df['value_eth'] == 0).sum()}",
    f"Non-zero transactions: {(df['value_eth'] > 0).sum()}",
    f"Average ETH value: {df['value_eth'].mean()}",
    f"Maximum ETH value: {df['value_eth'].max()}",
    f"Invalid timestamps: {df['datetime'].isna().sum()}"
]

summary_file = OUTPUT_DIR / "eda_summary.txt"
summary_file.write_text("\n".join(summary), encoding="utf-8")

print("\nEDA COMPLETED!")
print("Summary saved:", summary_file)
print("Plots saved:", PLOT_DIR)
