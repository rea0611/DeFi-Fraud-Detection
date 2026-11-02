# DeFi Fraud Detection
# ML Feature Analysis Module

import pandas as pd
import numpy as np

print("DeFi Fraud Detection")
print("Machine Learning Module")
print("Libraries imported successfully!")

features = [
    "Transaction Count",
    "Total Transaction Value",
    "Average Transaction Value",
    "Unique Counterparties",
    "Smart Contract Interactions",
    "Average Time Gap",
    "Rapid Transfer Count"
]

print("\nInitial ML Features:")

for feature in features:
    print("-", feature)