# AI-Based DeFi Fraud & Risk Detection System
## Machine Learning – Feature Engineering & Model Documentation

### 1. Project Overview

The project aims to identify unusual wallet transaction behaviour on the Ethereum blockchain using Machine Learning.

The system analyses transaction-level data, generates wallet-level behavioural features, applies an unsupervised anomaly detection algorithm, and assigns review-priority risk scores.

**Primary algorithm:** Isolation Forest

**ML approach:** Unsupervised Anomaly Detection

### 2. Dataset Information

**Input dataset:** `raw_transactions.csv`

**Cleaned dataset:** `cleaned_transactions.csv`

**Transaction records:** 4,814

**Unique wallets identified:** 4,085

**Observation period:** Approximately 228 seconds

The dataset contains the following transaction attributes:

| Column | Description |
|---|---|
| hash | Unique transaction identifier |
| from | Sender wallet address |
| to | Receiver wallet address |
| value_wei | Transaction value in Wei |
| value_eth | Transaction value in ETH |
| gas | Gas-related transaction field |
| block | Ethereum block number |
| timestamp | Transaction timestamp |

### 3. Data Preprocessing

The preprocessing module performs:

- Missing-value inspection.
- Duplicate transaction detection.
- Invalid identifier validation.
- Numeric value validation.
- Negative transaction value detection.
- Timestamp validation.
- Wei/ETH consistency checks.
- Transaction sorting.

**Preprocessing result:**

- Original records: 4,814
- Cleaned records: 4,814
- Duplicate records removed: 0
- Invalid records removed: 0
- Missing receiver addresses retained: 4

Output: `data/processed/cleaned_transactions.csv`

### 4. Wallet-Level Feature Engineering

The system generates 20 features grouped into three categories.

#### A. Transaction Behaviour Features

| Feature | Description |
|---|---|
| outgoing_tx_count | Number of outgoing transactions |
| total_eth_sent | Total ETH sent by a wallet |
| average_eth_sent | Average ETH sent per outgoing transaction |
| maximum_eth_sent | Maximum ETH sent in a single transaction |
| incoming_tx_count | Number of incoming transactions |
| total_eth_received | Total ETH received by a wallet |
| average_eth_received | Average ETH received per incoming transaction |
| maximum_eth_received | Maximum ETH received in a single transaction |
| zero_value_outgoing_count | Number of outgoing zero-value transactions |
| zero_value_incoming_count | Number of incoming zero-value transactions |
| net_eth_flow | Total ETH received minus total ETH sent |

#### B. Wallet Interaction Features

| Feature | Description |
|---|---|
| unique_outgoing_counterparties | Number of distinct outgoing counterparties |
| unique_incoming_counterparties | Number of distinct incoming counterparties |
| total_counterparties | Sum of incoming and outgoing counterparty counts |
| wallet_transaction_count | Number of unique transactions associated with a wallet |

#### C. Time-Based Behaviour Features

| Feature | Description |
|---|---|
| first_transaction_time | First observed transaction timestamp |
| last_transaction_time | Last observed transaction timestamp |
| average_time_gap_seconds | Average time gap between observed wallet transactions |
| minimum_time_gap_seconds | Minimum observed time gap |
| active_duration_seconds | Time between first and last observed transactions |

**Note:** The feature list contains 20 columns in total, including the wallet address identifier. Therefore, 20 generated features means 19 behavioural features plus the wallet address identifier.

Output: `data/processed/wallet_features.csv`

### 5. Anomaly Detection – Isolation Forest

Isolation Forest is an unsupervised Machine Learning algorithm used to identify observations that differ from the general data distribution.

The model analyses numerical wallet features and identifies unusual behavioural patterns.

**Model configuration:**

- Algorithm: Isolation Forest
- Number of estimators: 200
- Random state: 42
- Contamination: Auto
- Feature scaling: RobustScaler
- Missing-value handling: Median imputation with missingness indicators

**Model results:**

- Wallets analysed: 4,085
- Numerical features used: 18
- High anomaly: 204
- Moderate anomaly: 613
- Lower anomaly: 3,268

Output: `data/processed/wallet_anomaly_predictions.csv`

Model file: `models/isolation_forest_model.joblib`

### 6. Risk Scoring

The system combines the Isolation Forest anomaly score with behavioural indicators to calculate a review-priority score.

**Scoring methodology:**

Risk Score = (0.70 × Anomaly Score) + (0.30 × Behavioural Score)

The behavioural score is calculated using six indicators:

1. High outgoing transaction activity.
2. Unusually high total ETH sent.
3. Unusually high total ETH received.
4. High number of counterparties.
5. High zero-value outgoing activity.
6. Unusually short positive average transaction gap.

Each indicator contributes equally to the behavioural score.

**Risk categories:**

| Risk score | Category |
|---|---|
| 80–100 | Critical Review |
| 60–79.99 | High Review |
| 40–59.99 | Moderate Review |
| Below 40 | Low Review |

**Current results:**

- Critical Review: 59 wallets
- High Review: 660 wallets
- Moderate Review: 868 wallets
- Low Review: 2,498 wallets

Output: `data/processed/wallet_risk_scores.csv`

### 7. Explainability

The system generates textual explanations based on the behavioural indicators triggered for each wallet.

Examples include:

- Outgoing transaction count is unusually high.
- Total ETH sent is unusually high.
- Number of counterparties is unusually high.
- Average positive transaction gap is unusually short.

These explanations help users understand why a wallet received a particular review-priority score.

### 8. ML Pipeline Workflow

1. Blockchain transaction data collection.
2. Data quality analysis.
3. Exploratory Data Analysis.
4. Data preprocessing.
5. Wallet-level feature engineering.
6. Numerical feature selection.
7. Missing-value handling and feature scaling.
8. Isolation Forest training.
9. Anomaly score generation.
10. Behavioural indicator analysis.
11. Risk scoring.
12. Explainable output generation.

### 9. Limitations

- The current dataset contains only 4,814 transactions.
- The observation period is approximately 228 seconds.
- No confirmed fraud labels are available.
- Anomaly scores are relative rankings, not fraud probabilities.
- Risk thresholds are derived from the current dataset.
- High-value transactions or unusual transaction patterns do not independently establish fraudulent activity.
- The model requires testing against larger datasets and independently verified fraud labels.

### 10. Future Enhancements

- Integrate live Ethereum transaction collection.
- Expand the dataset across longer observation periods.
- Add smart contract interaction analysis.
- Develop graph-based wallet relationship features.
- Incorporate verified fraud labels when available.
- Evaluate models using suitable labelled datasets.
- Integrate ML predictions with the backend and dashboard.

### 11. Final Objective

The ML module aims to provide an explainable wallet anomaly detection and risk assessment system that helps identify unusual DeFi transaction behaviour for further investigation.

The system supports risk screening and investigation; it does not independently confirm fraudulent activity.
