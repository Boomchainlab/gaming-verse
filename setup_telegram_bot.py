#!/usr/bin/env python3
"""
🦊 Boombot Setup Script
Configure @OkeamahBot with BotFather commands
"""

import os
import asyncio
from telegram import Bot

async def setup_bot_commands():
    """Setup bot commands with BotFather"""
    token = os.getenv('TELEGRAM_BOT_TOKEN')
    if not token:
        print("❌ TELEGRAM_BOT_TOKEN not set!")
        return
    
    bot = Bot(token=token)
    
    # Bot commands
    commands = [
        ("start", "🚀 Welcome to Boombot - Start your Web3 gaming journey"),
        ("play", "🎰 Launch Creator Coin Spin game"),
        ("stats", "📊 View your gaming statistics and achievements"),
        ("portfolio", "💰 Check your Creator token portfolio"),
        ("leaderboard", "🏆 See top players and rankings"),
        ("help", "❓ Get help and game instructions")
    ]
    
    try:
        await bot.set_my_commands(commands)
        print("✅ Bot commands configured successfully!")
        
        # Get bot info
        bot_info = await bot.get_me()
        print(f"🤖 Bot: @{bot_info.username}")
        print(f"👨‍💻 Developer: David Okeamah (@okeamah_eth)")
        print(f"💰 Portfolio: $107K (↗ 28.49%)")
        print(f"📊 Rank: #91 on 0xppl")
        
        # Set bot description
        description = """🦊 Boombot - Your Web3 Gaming Companion

Built by David Okeamah (@okeamah_eth)
✅ Verified developer with $107K portfolio
📊 #91 rank on 0xppl

🎰 Play Creator Coin Spin directly in Telegram!
• 80 celebration particles on wins
• Real Creator token rewards
• 5 cosmic visual themes
• Daily free spins

Start with /play to begin your Web3 gaming journey! 🚀"""
        
        await bot.set_my_description(description)
        print("✅ Bot description set!")
        
        # Set short description
        short_description = "🦊 Web3 Gaming Bot by David Okeamah - Play Creator Coin Spin & win real tokens! 🎰"
        await bot.set_my_short_description(short_description)
        print("✅ Short description set!")
        
        print("\n🎉 Boombot setup complete!")
        print("Users can now find and start @OkeamahBot")
        
    except Exception as e:
        print(f"❌ Setup failed: {e}")

def print_botfather_commands():
    """Print commands for manual BotFather setup"""
    print("\n📋 BotFather Commands (if needed):")
    print("=" * 50)
    print("/setcommands")
    print("start - 🚀 Welcome to Boombot")
    print("play - 🎰 Launch Creator Coin Spin")
    print("stats - 📊 View your statistics")
    print("portfolio - 💰 Check your portfolio")
    print("leaderboard - 🏆 See top players")
    print("help - ❓ Get help")
    print()
    print("/setdescription")
    print("🦊 Boombot - Your Web3 Gaming Companion")
    print()
    print("Built by David Okeamah (@okeamah_eth)")
    print("✅ Verified developer with $107K portfolio")
    print("📊 #91 rank on 0xppl")
    print()
    print("🎰 Play Creator Coin Spin directly in Telegram!")
    print("• 80 celebration particles on wins")
    print("• Real Creator token rewards")
    print("• 5 cosmic visual themes")
    print("• Daily free spins")
    print()
    print("Start with /play to begin! 🚀")

if __name__ == "__main__":
    print("🦊 Setting up Boombot (@OkeamahBot)")
    print("=" * 40)
    
    asyncio.run(setup_bot_commands())
    print_botfather_commands()
