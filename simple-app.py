"""
Simple Creator Coin Spin Game
Minimal version to get started quickly
"""

# Check if Flask is available
try:
    from flask import Flask, request, jsonify, render_template_string
    print("✅ Flask is available")
except ImportError:
    print("❌ Flask not found. Please run: pip install Flask")
    exit(1)

# Check other dependencies
try:
    from web3 import Web3
    print("✅ Web3 is available")
except ImportError:
    print("❌ Web3 not found. Please run: pip install web3")
    exit(1)

try:
    from eth_account.messages import encode_defunct
    print("✅ eth-account is available")
except ImportError:
    print("❌ eth-account not found. Please run: pip install eth-account")
    exit(1)

import os
import json
from datetime import datetime

app = Flask(__name__)

# Your configuration
GAS_PAYER_PRIVATE_KEY = "0xf2fb82b350cbf5a09b60a0e89ccbc766c59d1e1a66d9747041f864353b76dfde"
TOKEN_ADDRESS = "0xcd96b6aded93fb64c295bdba10865765f5e7acbe"
BASE_RPC_URL = "https://mainnet.base.org"

# Initialize Web3
web3 = Web3(Web3.HTTPProvider(BASE_RPC_URL))

# Setup wallet
try:
    gas_account = web3.eth.account.from_key(GAS_PAYER_PRIVATE_KEY)
    GAS_PAYER_ADDRESS = gas_account.address
    print(f"🔑 Gas payer wallet: {GAS_PAYER_ADDRESS}")
except Exception as e:
    print(f"❌ Invalid private key: {e}")
    GAS_PAYER_ADDRESS = None

# Simple HTML template
HTML_TEMPLATE = """
<!DOCTYPE html>
<html>
<head>
    <title>Creator Coin Spin Game</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script src="https://cdn.ethers.io/lib/ethers-5.2.umd.min.js"></script>
    <style>
        body {
            font-family: Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-align: center;
            padding: 20px;
            min-height: 100vh;
            margin: 0;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
        }
        .header {
            background: rgba(255,255,255,0.1);
            padding: 30px;
            border-radius: 20px;
            margin-bottom: 30px;
        }
        .wheel {
            width: 300px;
            height: 300px;
            border: 8px solid #ffd700;
            border-radius: 50%;
            margin: 20px auto;
            position: relative;
            background: conic-gradient(
                #ff6b6b 0deg 45deg,
                #4ecdc4 45deg 90deg,
                #45b7d1 90deg 135deg,
                #f093fb 135deg 180deg,
                #4facfe 180deg 225deg,
                #43e97b 225deg 270deg,
                #fa709a 270deg 315deg,
                #a8edea 315deg 360deg
            );
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            font-weight: bold;
            transition: transform 4s ease-out;
        }
        .spin-btn {
            background: linear-gradient(45deg, #ff6b6b, #ff8e53);
            color: white;
            border: none;
            padding: 20px 40px;
            font-size: 18px;
            border-radius: 50px;
            cursor: pointer;
            margin: 20px;
            transition: transform 0.3s;
        }
        .spin-btn:hover {
            transform: scale(1.05);
        }
        .spin-btn:disabled {
            background: #666;
            cursor: not-allowed;
            transform: none;
        }
        .connect-btn {
            background: linear-gradient(45deg, #4caf50, #45a049);
            color: white;
            border: none;
            padding: 15px 30px;
            font-size: 16px;
            border-radius: 25px;
            cursor: pointer;
            margin: 10px;
        }
        .status {
            background: rgba(255,255,255,0.1);
            padding: 20px;
            border-radius: 15px;
            margin: 20px 0;
        }
        .hidden { display: none; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎰 Creator Coin Spin</h1>
            <p>Win Creator tokens on Base network!</p>
        </div>
        
        <div class="status">
            <button id="connect-btn" class="connect-btn">Connect Wallet</button>
            <div id="wallet-info" class="hidden">
                <p id="account-display"></p>
                <p id="network-status"></p>
            </div>
            <p id="status-message"></p>
        </div>
        
        <div class="wheel" id="wheel">
            SPIN TO WIN!
        </div>
        
        <button id="spin-btn" class="spin-btn" disabled>
            🎲 SPIN THE WHEEL
        </button>
        
        <div class="status">
            <h3>🪙 Token Info</h3>
            <p>Token: {{ token_address }}</p>
            <p>Network: Base</p>
            <p>Gas Payer: {{ gas_payer }}</p>
        </div>
    </div>

    <script>
        let provider = null;
        let signer = null;
        let currentAccount = null;
        
        const connectBtn = document.getElementById('connect-btn');
        const spinBtn = document.getElementById('spin-btn');
        const walletInfo = document.getElementById('wallet-info');
        const accountDisplay = document.getElementById('account-display');
        const networkStatus = document.getElementById('network-status');
        const statusMessage = document.getElementById('status-message');
        const wheel = document.getElementById('wheel');
        
        // Base network config
        const BASE_NETWORK = {
            chainId: '0x2105',
            chainName: 'Base',
            nativeCurrency: { name: 'Ethereum', symbol: 'ETH', decimals: 18 },
            rpcUrls: ['https://mainnet.base.org'],
            blockExplorerUrls: ['https://basescan.org']
        };
        
        connectBtn.addEventListener('click', connectWallet);
        spinBtn.addEventListener('click', spinWheel);
        
        async function connectWallet() {
            if (typeof window.ethereum === 'undefined') {
                statusMessage.textContent = 'Please install MetaMask';
                return;
            }
            
            try {
                statusMessage.textContent = 'Connecting...';
                await window.ethereum.request({ method: 'eth_requestAccounts' });
                
                provider = new ethers.providers.Web3Provider(window.ethereum);
                signer = provider.getSigner();
                currentAccount = await signer.getAddress();
                
                // Check network
                const network = await provider.getNetwork();
                if (network.chainId !== 8453) {
                    await switchToBase();
                }
                
                updateUI();
                statusMessage.textContent = 'Connected successfully!';
            } catch (error) {
                statusMessage.textContent = 'Connection failed: ' + error.message;
            }
        }
        
        async function switchToBase() {
            try {
                await window.ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: BASE_NETWORK.chainId }]
                });
            } catch (error) {
                if (error.code === 4902) {
                    await window.ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [BASE_NETWORK]
                    });
                }
            }
        }
        
        function updateUI() {
            if (currentAccount) {
                accountDisplay.textContent = `Connected: ${currentAccount.substring(0,6)}...${currentAccount.substring(38)}`;
                networkStatus.textContent = '✅ Base Network';
                connectBtn.style.display = 'none';
                walletInfo.classList.remove('hidden');
                spinBtn.disabled = false;
            }
        }
        
        async function spinWheel() {
            if (!currentAccount) return;
            
            spinBtn.disabled = true;
            statusMessage.textContent = 'Spinning...';
            
            // Animate wheel
            const rotation = Math.floor(Math.random() * 360) + 1440; // 4+ full rotations
            wheel.style.transform = `rotate(${rotation}deg)`;
            
            // Simulate reward
            setTimeout(() => {
                const rewards = [1000, 2500, 5000, 7500, 10000];
                const reward = rewards[Math.floor(Math.random() * rewards.length)];
                statusMessage.textContent = `🎉 You won ${reward} Creator tokens!`;
                spinBtn.disabled = false;
            }, 4000);
        }
        
        // Auto-connect if already connected
        if (typeof window.ethereum !== 'undefined') {
            window.ethereum.request({ method: 'eth_accounts' }).then(accounts => {
                if (accounts.length > 0) {
                    connectWallet();
                }
            });
        }
    </script>
</body>
</html>
"""

@app.route('/')
def index():
    return render_template_string(HTML_TEMPLATE, 
                                token_address=TOKEN_ADDRESS,
                                gas_payer=GAS_PAYER_ADDRESS)

@app.route('/api/status')
def status():
    """Get system status"""
    return jsonify({
        "status": "running",
        "web3_connected": web3.is_connected(),
        "gas_payer": GAS_PAYER_ADDRESS,
        "token_address": TOKEN_ADDRESS,
        "network": "Base"
    })

@app.route('/verify', methods=['POST'])
def verify():
    """Verify wallet signature"""
    try:
        data = request.json
        msg = encode_defunct(text=data["message"])
        recovered = web3.eth.account.recover_message(msg, signature=data["signature"])
        
        if recovered.lower() == data["address"].lower():
            return jsonify({"status": "verified"})
        else:
            return jsonify({"error": "Invalid signature"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 400

if __name__ == '__main__':
    print("🎰 CREATOR COIN SPIN GAME - SIMPLE VERSION")
    print("=" * 60)
    print(f"🪙 Token: {TOKEN_ADDRESS}")
    print(f"🌐 Network: Base")
    print(f"💰 Gas Payer: {GAS_PAYER_ADDRESS}")
    print(f"🔗 Web3 Connected: {web3.is_connected()}")
    print("=" * 60)
    print("🚀 Starting server...")
    print("🌐 Open: http://localhost:5000")
    print("=" * 60)
    
    app.run(host="0.0.0.0", port=5000, debug=True)
