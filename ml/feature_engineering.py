
import pandas as pd
from pathlib import Path

# =====================================
# 1. LOAD CLEANED DATA
# =====================================

project_folder = Path(__file__).resolve().parent.parent

input_file = (
    project_folder / "data" / "processed" /
    "cleaned_transactions.csv"
)

output_folder = project_folder / "data" / "processed"
output_folder.mkdir(parents=True, exist_ok=True)

df = pd.read_csv(input_file)

df["timestamp"] = pd.to_datetime(
    df["timestamp"], utc=True
)

# =====================================
# 2. CREATE WALLET ACTIVITY RECORDS
# =====================================

activity = []

for _, tx in df.iterrows():

    # Sender's outgoing activity
    activity.append({
        "wallet": tx["from"],
        "counterparty": tx["to"],
        "direction": "outgoing",
        "value_eth": tx["value_eth"],
        "timestamp": tx["timestamp"],
        "hash": tx["hash"]
    })

    # Receiver's incoming activity
    if pd.notna(tx["to"]) and str(tx["to"]).strip():

        activity.append({
            "wallet": tx["to"],
            "counterparty": tx["from"],
            "direction": "incoming",
            "value_eth": tx["value_eth"],
            "timestamp": tx["timestamp"],
            "hash": tx["hash"]
        })

activity_df = pd.DataFrame(activity)

# =====================================
# 3. CALCULATE WALLET FEATURES
# =====================================

features = []

for wallet, group in activity_df.groupby("wallet"):

    group = group.sort_values("timestamp")

    time_gaps = (
        group["timestamp"].diff().dt.total_seconds()
    )

    outgoing = group[
        group["direction"] == "outgoing"
    ]

    incoming = group[
        group["direction"] == "incoming"
    ]

    valid_counterparties = group[
        group["counterparty"].notna()
    ]["counterparty"]

    features.append({

        "wallet": wallet,

        "transaction_count": group["hash"].nunique(),

        "outgoing_count": len(outgoing),

        "incoming_count": len(incoming),

        "total_outgoing_eth": outgoing["value_eth"].sum(),

        "total_incoming_eth": incoming["value_eth"].sum(),

        "average_transaction_value": group[
            "value_eth"
        ].mean(),

        "unique_counterparties":
            valid_counterparties.nunique(),

        "average_time_gap_seconds":
            time_gaps.mean(),

        "rapid_transfer_count":
            (time_gaps <= 60).sum()

    })

# =====================================
# 4. CREATE FEATURE DATAFRAME
# =====================================

wallet_features = pd.DataFrame(features)

# =====================================
# 5. HANDLE MISSING VALUES
# =====================================

wallet_features = wallet_features.fillna(0)

# =====================================
# 6. SAVE WALLET FEATURES
# =====================================

output_file = output_folder / "wallet_features.csv"

wallet_features.to_csv(output_file, index=False)

print("\n===== FEATURE ENGINEERING REPORT =====")

print("Total wallets:", len(wallet_features))

print("\nWallet Features:")
print(wallet_features.head(10))

print("\nSaved successfully at:")
print(output_file)

print("\nFEATURE ENGINEERING COMPLETED!")
