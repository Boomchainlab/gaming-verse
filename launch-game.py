#!/usr/bin/env python3
"""
Creator Coin Spin Game Launcher
Sets up environment and starts the Flask app
"""

import os
import sys

def setup_environment():
    """Set up the environment variables"""
    print("🔧 Setting up environment...")
    
    # Set your private key
    os.environ['PRIVATE_KEY'] = ''
    
    print("✅ Environment configured")

def check_dependencies():
    """Check if required packages are installed"""
    print("📦 Checking dependencies...")
    
    required_packages = ['flask', 'web3', 'flask_sqlalchemy', 'eth_account']
    missing_packages = []
    
    for package in required_packages:
        try:
            __import__(package)
        except ImportError:
            missing_packages.append(package)
    
    if missing_packages:
        print(f"❌ Missing packages: {', '.join(missing_packages)}")
        print("Run: pip install -r requirements.txt")
        return False
    
    print("✅ All dependencies installed")
    return True

def main():
    """Main launcher function"""
    print("🎰 CREATOR COIN SPIN GAME LAUNCHER")
    print("=" * 50)
    
    # Setup environment
    setup_environment()
    
    # Check dependencies
    if not check_dependencies():
        sys.exit(1)
    
    print("\n🚀 Starting the game...")
    print("🌐 Game will be available at: http://localhost:5000")
    print("🎮 Connect MetaMask and start spinning!")
    print("\n" + "=" * 50)
    
    # Import and run the Flask app
    try:
        from app import app
        app.run(host="0.0.0.0", port=5000, debug=True)
    except Exception as e:
        print(f"❌ Failed to start game: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
