
from pathlib import Path

import joblib
import numpy as np
import pandas as pd

from sklearn.ensemble import IsolationForest
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import RobustScaler


# ==================================================
# 1. PROJECT PATHS
# ==================================================

BASE_DIR = Path(__file__).resolve().parent.parent

INPUT_FILE = (
    BASE_DIR / "data" / "processed" / "wallet_features.csv"
)

OUTPUT_DIR = BASE_DIR / "data" / "processed"
MODEL_DIR = BASE_DIR / "models"

OUTPUT_FILE = OUTPUT_DIR / "wallet_anomaly_predictions.csv"
MODEL_FILE = MODEL_DIR / "isolation_forest_model.joblib"
REPORT_FILE = OUTPUT_DIR / "anomaly_detection_report.txt"


# ==================================================
# 2. LOAD WALLET FEATURES
# ==================================================

def load_features():

    if not INPUT_FILE.exists():
        raise FileNotFoundError(
            f"Wallet features not found: {INPUT_FILE}"
        )

    df = pd.read_csv(INPUT_FILE)

    if "wallet_address" not in df.columns:
        raise ValueError("wallet_address column is missing")

    if df.empty:
        raise ValueError("Wallet feature dataset is empty")

    if df["wallet_address"].isnull().any():
        raise ValueError("Missing wallet addresses found")

    if df["wallet_address"].duplicated().any():
        raise ValueError("Duplicate wallet addresses found")

    return df


# ==================================================
# 3. SELECT NUMERICAL FEATURES
# ==================================================

def prepare_features(df):

    excluded_columns = [
        "wallet_address",
        "first_transaction_time",
        "last_transaction_time"
    ]

    feature_columns = [
        col for col in df.select_dtypes(include="number").columns
        if col not in excluded_columns
    ]

    if not feature_columns:
        raise ValueError("No numerical features available")

    X = df[feature_columns].replace(
        [np.inf, -np.inf], np.nan
    )

    # Remove features that contain no usable values
    feature_columns = [
        col for col in X.columns
        if not X[col].isna().all()
    ]

    X = X[feature_columns]

    if X.empty:
        raise ValueError("No usable numerical data found")

    return X, feature_columns


# ==================================================
# 4. HANDLE MISSING VALUES AND SCALE FEATURES
# ==================================================

def preprocess_features(X):

    # Median imputation preserves missing-gap distinctions
    # through additional missingness indicator columns.
    imputer = SimpleImputer(
        strategy="median",
        add_indicator=True
    )

    X_imputed = imputer.fit_transform(X)

    scaler = RobustScaler()

    X_scaled = scaler.fit_transform(X_imputed)

    return X_scaled, imputer, scaler


# ==================================================
# 5. TRAIN ISOLATION FOREST
# ==================================================

def train_model(X_scaled):

    model = IsolationForest(
        n_estimators=200,
        contamination="auto",
        random_state=42,
        n_jobs=-1
    )

    model.fit(X_scaled)

    return model


# ==================================================
# 6. GENERATE ANOMALY SCORES
# ==================================================

def generate_predictions(df, model, X_scaled):

    predictions = df[
        ["wallet_address"]
    ].copy()

    # Lower decision function = more anomalous
    decision_scores = model.decision_function(X_scaled)

    predictions["decision_score"] = decision_scores

    # Convert scores into a relative 0-100 anomaly ranking.
    # Higher score = more unusual compared with this dataset.
    predictions["anomaly_score"] = (
        (1 - pd.Series(decision_scores).rank(pct=True))
        * 100
    ).round(2)

    # Flag the 5% most anomalous wallets for review.
    # This is a review threshold, not a fraud probability.
    threshold = np.percentile(
        predictions["anomaly_score"],
        95
    )

    predictions["anomaly_flag"] = (
        predictions["anomaly_score"] >= threshold
    )

    # Relative anomaly categories
    predictions["anomaly_category"] = np.select(
        [
            predictions["anomaly_score"] >= 95,
            predictions["anomaly_score"] >= 80
        ],
        [
            "High Anomaly",
            "Moderate Anomaly"
        ],
        default="Lower Anomaly"
    )

    return predictions


# ==================================================
# 7. SAVE MODEL AND PREDICTIONS
# ==================================================

def save_results(
    df,
    predictions,
    model,
    imputer,
    scaler,
    feature_columns
):

    OUTPUT_DIR.mkdir(
        parents=True,
        exist_ok=True
    )

    MODEL_DIR.mkdir(
        parents=True,
        exist_ok=True
    )

    predictions.to_csv(
        OUTPUT_FILE,
        index=False
    )

    # Save the model and preprocessing objects together
    joblib.dump(
        {
            "model": model,
            "imputer": imputer,
            "scaler": scaler,
            "feature_columns": feature_columns
        },
        MODEL_FILE
    )

    high = (
        predictions["anomaly_category"] == "High Anomaly"
    ).sum()

    moderate = (
        predictions["anomaly_category"] == "Moderate Anomaly"
    ).sum()

    lower = (
        predictions["anomaly_category"] == "Lower Anomaly"
    ).sum()

    report = [
        "===== ISOLATION FOREST REPORT =====",
        f"Transactions represented: {len(df)}",
        f"Wallets analyzed: {len(predictions)}",
        f"Numerical features used: {len(feature_columns)}",
        "",
        "ANOMALY CATEGORY SUMMARY",
        f"High Anomaly: {high}",
        f"Moderate Anomaly: {moderate}",
        f"Lower Anomaly: {lower}",
        "",
        f"Prediction file: {OUTPUT_FILE}",
        f"Saved model: {MODEL_FILE}",
        "",
        "IMPORTANT LIMITATIONS:",
        "Anomaly scores are relative rankings, not fraud probabilities.",
        "No confirmed fraud labels are available for validation.",
        "The dataset covers a short observation period.",
        "High anomaly does not establish fraudulent activity."
    ]

    REPORT_FILE.write_text(
        "\n".join(report),
        encoding="utf-8"
    )

    print("\n===== ISOLATION FOREST COMPLETED =====")
    print(f"Wallets analyzed: {len(predictions)}")
    print(f"Numerical features used: {len(feature_columns)}")
    print(f"High anomaly: {high}")
    print(f"Moderate anomaly: {moderate}")
    print(f"Lower anomaly: {lower}")
    print(f"Predictions saved: {OUTPUT_FILE}")
    print(f"Model saved: {MODEL_FILE}")
    print(f"Report saved: {REPORT_FILE}")


# ==================================================
# 8. MAIN EXECUTION
# ==================================================

def main():

    print("Loading wallet features...")

    df = load_features()

    print("Selecting numerical features...")

    X, feature_columns = prepare_features(df)

    print(f"Features selected: {len(feature_columns)}")

    print("Handling missing values and scaling...")

    X_scaled, imputer, scaler = preprocess_features(X)

    print("Training Isolation Forest...")

    model = train_model(X_scaled)

    print("Generating anomaly predictions...")

    predictions = generate_predictions(
        df,
        model,
        X_scaled
    )

    save_results(
        df,
        predictions,
        model,
        imputer,
        scaler,
        feature_columns
    )


if __name__ == "__main__":
    main()
