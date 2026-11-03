
import pandas as pd
from pathlib import Path

# Locate project
project_folder = Path(__file__).resolve().parent.parent

file_path = (
    project_folder / "data" / "processed" /
    "wallet_features.csv"
)

# Load wallet features
df = pd.read_csv(file_path)

print("\n===== WALLET FEATURE VALIDATION =====")

# 1. Dataset size
print("\n1. DATASET SIZE")
print("Wallets:", df.shape[0])
print("Features:", df.shape[1] - 1)

# 2. Column names
print("\n2. FEATURE COLUMNS")
print(df.columns.tolist())

# 3. Missing values
print("\n3. MISSING VALUES")
print(df.isnull().sum())

# 4. Duplicate wallets
print("\n4. DUPLICATE WALLETS")
print(df["wallet"].duplicated().sum())

# 5. Numeric data types
print("\n5. DATA TYPES")
print(df.dtypes)

# 6. Statistical summary
print("\n6. FEATURE STATISTICS")
print(df.describe())

# 7. Constant features
print("\n7. CONSTANT FEATURES")

numeric_df = df.drop(columns=["wallet"])

constant_features = [
    col for col in numeric_df.columns
    if numeric_df[col].nunique() <= 1
]

print(constant_features)

# 8. Infinite values
print("\n8. INFINITE VALUES")
print(
    numeric_df.isin([float("inf"), float("-inf")]).sum()
)

# 9. Final dataset preview
print("\n9. DATASET PREVIEW")
print(df.head(10))

print("\n===== VALIDATION COMPLETED =====")
