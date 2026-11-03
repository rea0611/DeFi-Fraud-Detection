# DeFiGuard – AI-Based DeFi Fraud & Risk Detection System

## 1. Introduction

DeFiGuard is an AI-based decentralized finance fraud and risk detection system designed to identify suspicious wallet activities and assess potential risks in blockchain transactions.

The system uses machine learning techniques for anomaly detection and wallet risk scoring. It provides a web-based dashboard to monitor transactions, analyze wallet risks, and display security alerts.

## 2. Objectives

- Detect anomalous wallet activities.
- Analyze blockchain transaction patterns.
- Calculate wallet risk scores.
- Identify high-risk and suspicious wallets.
- Provide an interactive dashboard for risk monitoring.
- Improve visibility into potential DeFi fraud.

## 3. Key Features

- **Dashboard:** Displays wallet statistics and risk summaries.
- **Wallet Search:** Search wallet addresses and view their risk information.
- **Transactions:** View and search blockchain transaction records.
- **Risk Analysis:** Visualize wallet risk categories and high-risk wallets.
- **Security Alerts:** Display alerts generated from ML risk results.
- **Analytics:** Interactive charts and statistical insights.
- **Settings:** Manage dashboard preferences.

## 4. Technologies Used

| Component | Technology |
|---|---|
| Frontend | React.js, HTML, CSS, JavaScript |
| UI Icons | Lucide React |
| Charts | Recharts |
| Backend | Node.js, Express.js |
| Data Processing | Python, Pandas |
| Machine Learning | Anomaly Detection, Risk Scoring |
| Database / Storage | CSV datasets |
| Development Tool | Visual Studio Code |

## 5. Project Structure

```text
DEFI Fraud Detection/
│
├── backend/
│   └── backend/
│       ├── src/
│       │   ├── config/
│       │   ├── controllers/
│       │   ├── routes/
│       │   └── server.js
│       ├── package.json
│       └── .env
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── app.css
│   └── package.json
│
├── DeFi-Fraud-Detection/
│   ├── data/
│   │   ├── raw/
│   │   └── processed/
│   └── ml/
│
└── README.md
```

## 6. Installation and Setup

### Prerequisites

- Node.js
- npm
- Python
- Visual Studio Code
- Git

### Step 1: Clone the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
```

### Step 2: Backend Setup

```bash
cd backend/backend
npm install
```

Create a `.env` file:

```env
PORT=5000
```

Start the backend:

```bash
node src/server.js
```

Backend runs at:

```text
http://localhost:5000
```

### Step 3: Frontend Setup

Open another terminal:

```bash
cd frontend
npm install
```

Create a `.env` file:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:

```bash
npm run dev
```

Open:

```text
http://localhost:5173
```

## 7. API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | / | Check backend status |
| GET | /api/wallets | Retrieve wallet records |
| GET | /api/wallets/:address | Search wallet details |
| GET | /api/risk/stats | Retrieve risk statistics |
| GET | /api/risk/high-risk | Retrieve high-risk wallets |
| GET | /api/transactions | Retrieve transaction records |

## 8. Dataset

The project uses blockchain transaction data and processed wallet-level datasets.

### Raw Dataset
- raw_transactions.csv

### Processed Datasets
- wallet_features.csv
- wallet_anomaly_predictions.csv
- wallet_risk_scores.csv

The processed datasets support wallet feature analysis, anomaly detection, and risk scoring.

## 9. Machine Learning

The machine learning component processes transaction data and generates wallet-level outputs.

Main processing modules include:

- Data preprocessing
- Exploratory data analysis
- Feature engineering
- Anomaly detection
- Wallet risk scoring

## 10. Team Contributions

The project is developed by a three-member team.

- **Person 1:** Data collection and preprocessing.
- **Person 2:** Machine learning and risk detection.
- **Person 3:** Frontend development, API integration, UI testing, documentation, and project demonstration.

## 11. Future Scope

- Real-time blockchain transaction monitoring.
- Smart contract vulnerability detection.
- Advanced fraud classification.
- Integration with live blockchain APIs.
- Improved alert notification mechanisms.
- Deployment to a cloud platform.

## 12. Conclusion

DeFiGuard demonstrates how machine learning and web technologies can be combined to analyze blockchain transactions, identify anomalous wallet behavior, and assess potential DeFi risks through an interactive monitoring dashboard.
