
from pathlib import Path

import pandas as pd


# ==================================================
# 1. PROJECT PATHS
# ==================================================

BASE_DIR = Path(__file__).resolve().parent.parent

INPUT_FILE = (
    BASE_DIR / "data" / "processed" / "cleaned_transactions.csv"
)

OUTPUT_DIR = BASE_DIR / "data" / "processed"

OUTPUT_FILE = OUTPUT_DIR / "wallet_features.csv"

REPORT_FILE = OUTPUT_DIR / "feature_engineering_report.txt"


# ==================================================
# 2. LOAD CLEANED TRANSACTION DATA
# ==================================================

def load_data():

    if not INPUT_FILE.exists():
        raise FileNotFoundError(
            f"Cleaned dataset not found: {INPUT_FILE}"
        )

    df = pd.read_csv(INPUT_FILE)

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
            f"Missing columns: {missing_columns}"
        )

    # Convert numeric transaction fields
    for col in ["value_eth", "gas", "block"]:
        df[col] = pd.to_numeric(
            df[col],
            errors="coerce"
        )

    # Timestamp is already in datetime text format.
    # Do NOT convert it to Unix seconds again.
    df["datetime"] = pd.to_datetime(
        df["timestamp"],
        errors="coerce",
        utc=True
    )

    # Remove only records missing essential fields.
    # Missing receiver addresses are retained.
    df = df.dropna(
        subset=["hash", "from", "value_eth", "datetime"]
    )

    print(f"Transactions loaded: {len(df)}")

    return df


# ==================================================
# 3. OUTGOING WALLET FEATURES
# ==================================================

def outgoing_features(df):

    outgoing = df.groupby("from").agg(
        outgoing_tx_count=("hash", "nunique"),
        total_eth_sent=("value_eth", "sum"),
        average_eth_sent=("value_eth", "mean"),
        maximum_eth_sent=("value_eth", "max"),
        unique_outgoing_counterparties=("to", "nunique")
    )

    zero_outgoing = (
        df.assign(
            is_zero=df["value_eth"].eq(0)
        )
        .groupby("from")["is_zero"]
        .sum()
        .rename("zero_value_outgoing_count")
    )

    outgoing = outgoing.join(zero_outgoing)

    return outgoing


# ==================================================
# 4. INCOMING WALLET FEATURES
# ==================================================

def incoming_features(df):

    incoming_data = df.dropna(
        subset=["to"]
    ).copy()

    incoming = incoming_data.groupby("to").agg(
        incoming_tx_count=("hash", "nunique"),
        total_eth_received=("value_eth", "sum"),
        average_eth_received=("value_eth", "mean"),
        maximum_eth_received=("value_eth", "max"),
        unique_incoming_counterparties=("from", "nunique")
    )

    zero_incoming = (
        incoming_data.assign(
            is_zero=incoming_data["value_eth"].eq(0)
        )
        .groupby("to")["is_zero"]
        .sum()
        .rename("zero_value_incoming_count")
    )

    incoming = incoming.join(zero_incoming)

    return incoming


# ==================================================
# 5. WALLET ACTIVITY FEATURES
# ==================================================

def activity_features(df):

    sent = df[
        ["hash", "from", "datetime"]
    ].rename(
        columns={"from": "wallet"}
    )

    received = (
        df.dropna(subset=["to"])[
            ["hash", "to", "datetime"]
        ]
        .rename(columns={"to": "wallet"})
    )

    activity = pd.concat(
        [sent, received],
        ignore_index=True
    )

    # Prevent self-transactions from being counted twice
    activity = activity.drop_duplicates(
        subset=["wallet", "hash"]
    )

    activity = activity.sort_values(
        ["wallet", "datetime"]
    )

    # Calculate time difference between wallet transactions
    activity["time_gap_seconds"] = (
        activity.groupby("wallet")["datetime"]
        .diff()
        .dt.total_seconds()
    )

    activity_summary = activity.groupby("wallet").agg(
        wallet_transaction_count=("hash", "nunique"),
        first_transaction_time=("datetime", "min"),
        last_transaction_time=("datetime", "max"),
        average_time_gap_seconds=(
            "time_gap_seconds", "mean"
        ),
        minimum_time_gap_seconds=(
            "time_gap_seconds", "min"
        )
    )

    activity_summary["active_duration_seconds"] = (
        activity_summary["last_transaction_time"]
        - activity_summary["first_transaction_time"]
    ).dt.total_seconds()

    return activity_summary


# ==================================================
# 6. COMBINE ALL FEATURES
# ==================================================

def create_wallet_features(df):

    outgoing = outgoing_features(df)

    incoming = incoming_features(df)

    activity = activity_features(df)

    all_wallets = (
        set(outgoing.index)
        | set(incoming.index)
        | set(activity.index)
    )

    features = pd.DataFrame(
        index=sorted(all_wallets)
    )

    features.index.name = "wallet_address"

    features = features.join(outgoing)
    features = features.join(incoming)
    features = features.join(activity)

    # Fill missing transaction counts with zero
    count_columns = [
        "outgoing_tx_count",
        "incoming_tx_count",
        "unique_outgoing_counterparties",
        "unique_incoming_counterparties",
        "zero_value_outgoing_count",
        "zero_value_incoming_count",
        "wallet_transaction_count"
    ]

    features[count_columns] = (
        features[count_columns]
        .fillna(0)
        .astype(int)
    )

    # Fill missing ETH amounts with zero
    amount_columns = [
        "total_eth_sent",
        "average_eth_sent",
        "maximum_eth_sent",
        "total_eth_received",
        "average_eth_received",
        "maximum_eth_received"
    ]

    features[amount_columns] = (
        features[amount_columns].fillna(0)
    )

    # Net flow: received ETH minus sent ETH
    features["net_eth_flow"] = (
        features["total_eth_received"]
        - features["total_eth_sent"]
    )

    # Total unique counterparties
    features["total_counterparties"] = (
        features["unique_outgoing_counterparties"]
        + features["unique_incoming_counterparties"]
    )

    features = features.reset_index()

    return features


# ==================================================
# 7. SAVE FEATURES AND REPORT
# ==================================================

def save_results(features, df):

    OUTPUT_DIR.mkdir(
        parents=True,
        exist_ok=True
    )

    features.to_csv(
        OUTPUT_FILE,
        index=False
    )

    report_lines = [
        "===== FEATURE ENGINEERING REPORT =====",
        f"Input transactions: {len(df)}",
        f"Wallets identified: {len(features)}",
        f"Features generated: {len(features.columns) - 1}",
        "",
        f"Output file: {OUTPUT_FILE}",
        "",
        "Generated features:"
    ]

    report_lines.extend(
        [
            f"- {col}"
            for col in features.columns
            if col != "wallet_address"
        ]
    )

    report_lines.extend([
        "",
        "Missing values per feature:",
        features.isnull().sum().to_string(),
        "",
        "Note:",
        "Time-based features describe only the available dataset period.",
        "Missing time gaps are expected for wallets with one transaction.",
        "Anomaly scores must not be interpreted as confirmed fraud."
    ])

    REPORT_FILE.write_text(
        "\n".join(report_lines),
        encoding="utf-8"
    )

    print("\n===== FEATURE ENGINEERING COMPLETED =====")
    print(f"Input transactions: {len(df)}")
    print(f"Wallets processed: {len(features)}")
    print(f"Features generated: {len(features.columns) - 1}")
    print(f"Dataset saved: {OUTPUT_FILE}")
    print(f"Report saved: {REPORT_FILE}")


# ==================================================
# 8. MAIN FUNCTION
# ==================================================

def main():

    print("Loading cleaned transaction dataset...")

    df = load_data()

    print("Generating outgoing wallet features...")
    print("Generating incoming wallet features...")
    print("Generating wallet activity features...")

    features = create_wallet_features(df)

    save_results(features, df)


if __name__ == "__main__":
    main()
