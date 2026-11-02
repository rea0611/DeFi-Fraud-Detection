
import os
import pandas as pd
from pathlib import Path
from web3 import Web3
from dotenv import load_dotenv

# ==================================
# 1. PROJECT CONFIGURATION
# ==================================

project_folder = Path(__file__).resolve().parent.parent

load_dotenv(project_folder / ".env")

rpc_url = os.getenv("ETHEREUM_RPC_URL")

if not rpc_url:
    raise ValueError("Alchemy URL not found in .env file")

# ==================================
# 2. CONNECT TO ETHEREUM
# ==================================

web3 = Web3(Web3.HTTPProvider(rpc_url))

if not web3.is_connected():
    raise ConnectionError("Ethereum connection failed")

print("Connected to Ethereum!")
print("Chain ID:", web3.eth.chain_id)

# ==================================
# 3. GET LATEST BLOCK
# ==================================

latest_block = web3.eth.block_number

print("Latest Block:", latest_block)

# Collect latest 5 blocks
start_block = max(0, latest_block - 4)

transactions = []

# ==================================
# 4. FETCH BLOCKCHAIN DATA
# ==================================

for block_number in range(start_block, latest_block + 1):

    print(f"Collecting block {block_number}...")

    block = web3.eth.get_block(
        block_number,
        full_transactions=True
    )

    block_timestamp = pd.to_datetime(
        block["timestamp"],
        unit="s",
        utc=True
    )

    for tx in block["transactions"]:

        transaction = {
            "hash": tx["hash"].hex(),
            "from": tx["from"],
            "to": tx["to"],
            "value_wei": int(tx["value"]),
            "value_eth": str(
                Web3.from_wei(tx["value"], "ether")
            ),
            "gas_limit": int(tx["gas"]),
            "gas_price_wei": int(tx["gasPrice"]),
            "block": block_number,
            "timestamp": block_timestamp,
            "transaction_index": int(tx["transactionIndex"])
        }

        transactions.append(transaction)

# ==================================
# 5. CREATE DATAFRAME
# ==================================

df = pd.DataFrame(transactions)

# ==================================
# 6. SAVE CSV FILE
# ==================================

output_folder = project_folder / "data" / "raw"

output_folder.mkdir(parents=True, exist_ok=True)

output_file = output_folder / "ethereum_transactions.csv"

df.to_csv(output_file, index=False)

# ==================================
# 7. DISPLAY RESULTS
# ==================================

print("\n========== COLLECTION REPORT ==========")

print("Blocks collected:", latest_block - start_block + 1)
print("Total transactions:", len(df))

print("\nDataset preview:")

print(df.head())

print("\nDataset saved successfully at:")
print(output_file)

print("\n========== COLLECTION COMPLETED ==========")
