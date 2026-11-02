
import os
from pathlib import Path
from web3 import Web3
from dotenv import load_dotenv

# Find project root
project_folder = Path(__file__).resolve().parent.parent

# Load environment variables
load_dotenv(project_folder / ".env")

# Read Alchemy URL
rpc_url = os.getenv("ETHEREUM_RPC_URL")

if not rpc_url:
    print("Alchemy URL not found!")
else:
    # Connect to Ethereum
    web3 = Web3(Web3.HTTPProvider(rpc_url))

    if web3.is_connected():
        print("Successfully connected to Ethereum!")

        latest_block = web3.eth.block_number

        print("Latest Ethereum Block:", latest_block)

    else:
        print("Ethereum connection failed!")
