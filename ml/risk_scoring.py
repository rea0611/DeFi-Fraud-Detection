
from pathlib import Path

import numpy as np
import pandas as pd


# ==================================================
# 1. PROJECT PATHS
# ==================================================

BASE_DIR = Path(__file__).resolve().parent.parent

PROCESSED_DIR = BASE_DIR / "data" / "processed"

FEATURE_FILE = PROCESSED_DIR / "wallet_features.csv"

PREDICTION_FILE = (
    PROCESSED_DIR / "wallet_anomaly_predictions.csv"
)

OUTPUT_FILE = PROCESSED_DIR / "wallet_risk_scores.csv"

REPORT_FILE = PROCESSED_DIR / "risk_scoring_report.txt"


# ==================================================
# 2. LOAD DATA
# ==================================================

def load_data():

    if not FEATURE_FILE.exists():
        raise FileNotFoundError(
            f"Feature file not found: {FEATURE_FILE}"
        )

    if not PREDICTION_FILE.exists():
        raise FileNotFoundError(
            f"Prediction file not found: {PREDICTION_FILE}"
        )

    features = pd.read_csv(FEATURE_FILE)

    predictions = pd.read_csv(PREDICTION_FILE)

    required_prediction_columns = [
        "wallet_address",
        "anomaly_score",
        "anomaly_category"
    ]

    for col in required_prediction_columns:
        if col not in predictions.columns:
            raise ValueError(
                f"Missing prediction column: {col}"
            )

    if features["wallet_address"].duplicated().any():
        raise ValueError(
            "Duplicate wallet addresses in feature dataset"
        )

    if predictions["wallet_address"].duplicated().any():
        raise ValueError(
            "Duplicate wallet addresses in prediction dataset"
        )

    df = features.merge(
        predictions,
        on="wallet_address",
        how="inner",
        validate="one_to_one"
    )

    if len(df) != len(features):
        raise ValueError(
            "Wallet records do not match between datasets"
        )

    if df.empty:
        raise ValueError("No wallet records available")

    if df["anomaly_score"].isna().any():
        raise ValueError("Missing anomaly scores found")

    if not df["anomaly_score"].between(0, 100).all():
        raise ValueError("Anomaly scores must be between 0 and 100")

    return df


# ==================================================
# 3. CALCULATE BEHAVIOURAL THRESHOLDS
# ==================================================

def calculate_thresholds(df):

    thresholds = {}

    upper_features = [
        "outgoing_tx_count",
        "total_eth_sent",
        "total_eth_received",
        "total_counterparties",
        "zero_value_outgoing_count"
    ]

    for col in upper_features:

        if col not in df.columns:
            raise ValueError(
                f"Missing behavioural feature: {col}"
            )

        thresholds[col] = df[col].quantile(0.95)

    # Only positive time gaps are used.
    # Zero gaps may represent timestamp ties.
    gap_values = (
        df["average_time_gap_seconds"]
        .dropna()
    )

    positive_gap_values = gap_values[
        gap_values > 0
    ]

    thresholds["average_time_gap_seconds"] = (
        positive_gap_values.quantile(0.05)
        if not positive_gap_values.empty
        else np.nan
    )

    thresholds["positive_gap_wallets"] = len(
        positive_gap_values
    )

    thresholds["zero_gap_wallets"] = int(
        (gap_values == 0).sum()
    )

    return thresholds


# ==================================================
# 4. IDENTIFY BEHAVIOURAL INDICATORS
# ==================================================

def identify_indicators(df, thresholds):

    result = df.copy()

    result["high_outgoing_activity"] = (
        (result["outgoing_tx_count"] >
         thresholds["outgoing_tx_count"])
        & (result["outgoing_tx_count"] > 0)
    )

    result["high_eth_sent"] = (
        (result["total_eth_sent"] >
         thresholds["total_eth_sent"])
        & (result["total_eth_sent"] > 0)
    )

    result["high_eth_received"] = (
        (result["total_eth_received"] >
         thresholds["total_eth_received"])
        & (result["total_eth_received"] > 0)
    )

    result["high_counterparty_activity"] = (
        (result["total_counterparties"] >
         thresholds["total_counterparties"])
        & (result["total_counterparties"] > 0)
    )

    result["high_zero_value_activity"] = (
        (result["zero_value_outgoing_count"] >
         thresholds["zero_value_outgoing_count"])
        & (result["zero_value_outgoing_count"] > 0)
    )

    gap_threshold = thresholds[
        "average_time_gap_seconds"
    ]

    if pd.notna(gap_threshold):

        result["rapid_transaction_pattern"] = (
            result["average_time_gap_seconds"].notna()
            & (result["average_time_gap_seconds"] > 0)
            & (
                result["average_time_gap_seconds"]
                <= gap_threshold
            )
        )

    else:

        result["rapid_transaction_pattern"] = False

    return result


# ==================================================
# 5. CALCULATE REVIEW-PRIORITY SCORES
# ==================================================

def calculate_risk_scores(df):

    indicator_columns = [
        "high_outgoing_activity",
        "high_eth_sent",
        "high_eth_received",
        "high_counterparty_activity",
        "high_zero_value_activity",
        "rapid_transaction_pattern"
    ]

    df["behavioural_indicator_count"] = (
        df[indicator_columns].sum(axis=1)
    )

    # Behavioural score from 0 to 100
    df["behavioural_score"] = (
        df["behavioural_indicator_count"]
        / len(indicator_columns)
        * 100
    )

    # Combined review-priority score
    df["risk_score"] = (
        0.70 * df["anomaly_score"]
        + 0.30 * df["behavioural_score"]
    ).round(2)

    # Risk review categories
    df["risk_category"] = np.select(
        [
            df["risk_score"] >= 80,
            df["risk_score"] >= 60,
            df["risk_score"] >= 40
        ],
        [
            "Critical Review",
            "High Review",
            "Moderate Review"
        ],
        default="Low Review"
    )

    return df


# ==================================================
# 6. GENERATE WALLET EXPLANATIONS
# ==================================================

def generate_explanations(df):

    explanations = []

    for _, row in df.iterrows():

        reasons = []

        if row["high_outgoing_activity"]:
            reasons.append(
                "Outgoing transaction count is unusually high"
            )

        if row["high_eth_sent"]:
            reasons.append(
                "Total ETH sent is unusually high"
            )

        if row["high_eth_received"]:
            reasons.append(
                "Total ETH received is unusually high"
            )

        if row["high_counterparty_activity"]:
            reasons.append(
                "Number of counterparties is unusually high"
            )

        if row["high_zero_value_activity"]:
            reasons.append(
                "Zero-value outgoing activity is unusually high"
            )

        if row["rapid_transaction_pattern"]:
            reasons.append(
                "Average positive transaction gap is unusually short"
            )

        if not reasons:
            reasons.append(
                "No selected behavioural indicator exceeded its threshold"
            )

        explanations.append(
            "; ".join(reasons)
        )

    df["explanation"] = explanations

    return df


# ==================================================
# 7. SAVE RESULTS AND REPORT
# ==================================================

def save_results(df, thresholds):

    PROCESSED_DIR.mkdir(
        parents=True,
        exist_ok=True
    )

    output_columns = [
        "wallet_address",
        "anomaly_score",
        "anomaly_category",
        "behavioural_indicator_count",
        "behavioural_score",
        "risk_score",
        "risk_category",
        "explanation"
    ]

    output = df[output_columns].copy()

    output = output.sort_values(
        "risk_score",
        ascending=False
    )

    output.to_csv(
        OUTPUT_FILE,
        index=False
    )

    category_counts = (
        output["risk_category"]
        .value_counts()
    )

    report_lines = [
        "===== RISK SCORING REPORT =====",
        f"Wallets analyzed: {len(output)}",
        "",
        "RISK CATEGORY SUMMARY:"
    ]

    categories = [
        "Critical Review",
        "High Review",
        "Moderate Review",
        "Low Review"
    ]

    for category in categories:

        count = category_counts.get(
            category, 0
        )

        percentage = (
            count / len(output) * 100
        )

        report_lines.append(
            f"{category}: {count} ({percentage:.2f}%)"
        )

    report_lines.extend([
        "",
        "BEHAVIOURAL THRESHOLDS:"
    ])

    for feature, threshold in thresholds.items():

        report_lines.append(
            f"{feature}: {threshold}"
        )

    report_lines.extend([
        "",
        "TIME GAP VALIDATION:",
        f"Wallets with positive average gaps: {thresholds['positive_gap_wallets']}",
        f"Wallets with zero average gaps: {thresholds['zero_gap_wallets']}",
        "",
        "SCORING METHOD:",
        "70% Isolation Forest anomaly score",
        "30% behavioural indicator score",
        "",
        f"Output file: {OUTPUT_FILE}",
        "",
        "LIMITATIONS:",
        "Risk score is a review-priority score, not fraud probability.",
        "Thresholds are calculated from the current dataset.",
        "No confirmed fraud labels are available.",
        "Unusual behaviour does not establish fraudulent activity."
    ])

    REPORT_FILE.write_text(
        "\n".join(report_lines),
        encoding="utf-8"
    )

    print("\n===== RISK SCORING COMPLETED =====")

    print(f"Wallets scored: {len(output)}")

    print("\nRisk category summary:")

    print(category_counts)

    print("\nTime gap threshold:")

    print(
        thresholds["average_time_gap_seconds"]
    )

    print(f"\nResults saved: {OUTPUT_FILE}")

    print(f"Report saved: {REPORT_FILE}")


# ==================================================
# 8. MAIN EXECUTION
# ==================================================

def main():

    print("Loading wallet features and predictions...")

    df = load_data()

    print(f"Wallets loaded: {len(df)}")

    print("Calculating behavioural thresholds...")

    thresholds = calculate_thresholds(df)

    print("Identifying unusual behavioural patterns...")

    df = identify_indicators(
        df,
        thresholds
    )

    print("Calculating review-priority scores...")

    df = calculate_risk_scores(df)

    print("Generating wallet explanations...")

    df = generate_explanations(df)

    save_results(
        df,
        thresholds
    )


if __name__ == "__main__":
    main()
