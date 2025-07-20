#!/usr/bin/env python3
"""
Boombot (@OkeamahBot) - Telegram Bot Integration
Creator Coin Spin Game Integration
Built by David Okeamah (@okeamah_eth)
"""

import os
import json
import logging
import asyncio
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import sqlite3
import aiohttp
from telegram import (
   Update, Bot, InlineKeyboardButton, InlineKeyboardMarkup,
   WebAppInfo, MenuButton, MenuButtonWebApp
)
from telegram.ext import (
   Application, CommandHandler, CallbackQueryHandler,
   MessageHandler, filters, ContextTypes
)

# Configure logging
logging.basicConfig(
   format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
   level=logging.INFO
)
logger = logging.getLogger(__name__)

class BoomBot:
   def __init__(self):
       self.token = os.getenv('TELEGRAM_BOT_TOKEN')
       self.webapp_url = os.getenv('WEBAPP_URL', 'https://boomchainlab.blog')
       self.db_path = 'boombot.db'
       self.developer_info = {
           "name": "David Okeamah",
           "twitter": "@okeamah_eth",
           "portfolio": "$107K (↗ 28.49%)",
           "rank": "#91 on 0xppl",
           "verified": "✅"
       }
       self.init_database()
   
   def init_database(self):
       """Initialize SQLite database for bot users"""
       conn = sqlite3.connect(self.db_path)
       cursor = conn.cursor()
       
       cursor.execute('''
       CREATE TABLE IF NOT EXISTS bot_users (
           user_id INTEGER PRIMARY KEY,
           username TEXT,
           first_name TEXT,
           last_name TEXT,
           wallet_address TEXT,
           total_spins INTEGER DEFAULT 0,
           total_tokens_won INTEGER DEFAULT 0,
           last_spin_date DATE,
           notifications_enabled BOOLEAN DEFAULT TRUE,
           joined_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
           referral_code TEXT,
           referred_by INTEGER
       )
       ''')
       
       cursor.execute('''
       CREATE TABLE IF NOT EXISTS bot_analytics (
           id INTEGER PRIMARY KEY AUTOINCREMENT,
           event_type TEXT,
           user_id INTEGER,
           data TEXT,
           timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
       )
       ''')
       
       cursor.execute('''
       CREATE TABLE IF NOT EXISTS game_sessions (
           id INTEGER PRIMARY KEY AUTOINCREMENT,
           user_id INTEGER,
           session_start TIMESTAMP,
           session_end TIMESTAMP,
           spins_count INTEGER DEFAULT 0,
           tokens_won INTEGER DEFAULT 0,
           platform TEXT DEFAULT 'telegram'
       )
       ''')
       
       conn.commit()
       conn.close()
   
   def track_event(self, event_type: str, user_id: int, data: Dict = None):
       """Track analytics events"""
       conn = sqlite3.connect(self.db_path)
       cursor = conn.cursor()
       
       cursor.execute('''
       INSERT INTO bot_analytics (event_type, user_id, data)
       VALUES (?, ?, ?)
       ''', (event_type, user_id, json.dumps(data) if data else None))
       
       conn.commit()
       conn.close()
   
   def get_user_stats(self, user_id: int) -> Dict:
       """Get user statistics"""
       conn = sqlite3.connect(self.db_path)
       cursor = conn.cursor()
       
       cursor.execute('''
       SELECT total_spins, total_tokens_won, last_spin_date, joined_date
       FROM bot_users WHERE user_id = ?
       ''', (user_id,))
       
       result = cursor.fetchone()
       conn.close()
       
       if result:
           return {
               'total_spins': result[0],
               'total_tokens_won': result[1],
               'last_spin_date': result[2],
               'joined_date': result[3],
               'days_active': (datetime.now() - datetime.fromisoformat(result[3])).days
           }
       return {'total_spins': 0, 'total_tokens_won': 0, 'days_active': 0}
   
   def update_user(self, user_id: int, username: str = None, first_name: str = None):
       """Update or create user record"""
       conn = sqlite3.connect(self.db_path)
       cursor = conn.cursor()
       
       cursor.execute('''
       INSERT OR REPLACE INTO bot_users (user_id, username, first_name)
       VALUES (?, ?, ?)
       ''', (user_id, username, first_name))
       
       conn.commit()
       conn.close()
   
   async def start_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
       """Handle /start command"""
       user = update.effective_user
       self.update_user(user.id, user.username, user.first_name)
       self.track_event('bot_start', user.id, {'username': user.username})
       
       welcome_text = f"""
🦊 **Welcome to Boombot!** 🚀

Hey {user.first_name}! I'm your Web3 gaming companion created by **David Okeamah**.

👨‍💻 **Developer Credentials:**
{self.developer_info['verified']} Verified on 0xppl
💰 Portfolio: {self.developer_info['portfolio']}
📊 Rank: {self.developer_info['rank']}
🐦 Twitter: {self.developer_info['twitter']}

🎰 **Creator Coin Spin Features:**
• 80 celebration particles on wins
• Firework effects for big wins
• 5 cosmic visual themes
• Real Creator tokens on Base
• Daily free spins with multipliers

Ready to spin and win? 🎯
       """
       
       keyboard = [
           [InlineKeyboardButton("🎰 Play Creator Coin Spin", web_app=WebAppInfo(url=self.webapp_url))],
           [InlineKeyboardButton("📊 My Stats", callback_data="stats"),
            InlineKeyboardButton("🏆 Leaderboard", callback_data="leaderboard")],
           [InlineKeyboardButton("🔔 Settings", callback_data="settings"),
            InlineKeyboardButton("❓ Help", callback_data="help")],
           [InlineKeyboardButton("🌐 Web Version", url=self.webapp_url),
            InlineKeyboardButton("🐦 Follow Dev", url="https://twitter.com/okeamah_eth")]
       ]
       
       reply_markup = InlineKeyboardMarkup(keyboard)
       
       await update.message.reply_text(
           welcome_text,
           reply_markup=reply_markup,
           parse_mode='Markdown'
       )
   
   async def play_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
       """Handle /play command"""
       user = update.effective_user
       self.track_event('play_command', user.id)
       
       play_text = f"""
🎰 **Ready to Play Creator Coin Spin?** 🚀

Built by David Okeamah ({self.developer_info['rank']})

🎮 **Game Features:**
• Stunning particle effects (80+ on wins!)
• Real Creator token rewards
• 5 cosmic visual themes
• Mobile optimized experience
• Daily streak bonuses

Tap "Launch Game" to start spinning! 🎯
       """
       
       keyboard = [
           [InlineKeyboardButton("🚀 Launch Game", web_app=WebAppInfo(url=self.webapp_url))],
           [InlineKeyboardButton("📊 My Stats", callback_data="stats"),
            InlineKeyboardButton("🏆 Leaderboard", callback_data="leaderboard")],
           [InlineKeyboardButton("🔙 Back to Menu", callback_data="main_menu")]
       ]
       
       reply_markup = InlineKeyboardMarkup(keyboard)
       
       await update.message.reply_text(
           play_text,
           reply_markup=reply_markup,
           parse_mode='Markdown'
       )
   
   async def stats_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
       """Handle /stats command"""
       user = update.effective_user
       stats = self.get_user_stats(user.id)
       self.track_event('stats_view', user.id)
       
       stats_text = f"""
📊 **{user.first_name}'s Gaming Stats** 🎮

🎰 **Spins:** {stats['total_spins']:,}
🪙 **Tokens Won:** {stats['total_tokens_won']:,}
📅 **Days Active:** {stats['days_active']}
🔥 **Last Spin:** {stats.get('last_spin_date', 'Never')}

🏆 **Achievements:**
{'🥇 First Spin' if stats['total_spins'] > 0 else '⭕ No spins yet'}
{'💰 Token Collector' if stats['total_tokens_won'] >= 10000 else ''}
{'🔥 Active Player' if stats['days_active'] >= 7 else ''}

Built by **David Okeamah** ({self.developer_info['rank']})
       """
       
       keyboard = [
           [InlineKeyboardButton("🎰 Play Now", web_app=WebAppInfo(url=self.webapp_url))],
           [InlineKeyboardButton("🏆 Leaderboard", callback_data="leaderboard"),
            InlineKeyboardButton("🔙 Main Menu", callback_data="main_menu")]
       ]
       
       reply_markup = InlineKeyboardMarkup(keyboard)
       
       await update.message.reply_text(
           stats_text,
           reply_markup=reply_markup,
           parse_mode='Markdown'
       )
   
   async def leaderboard_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
       """Handle /leaderboard command"""
       user = update.effective_user
       self.track_event('leaderboard_view', user.id)
       
       # Get top players from database
       conn = sqlite3.connect(self.db_path)
       cursor = conn.cursor()
       
       cursor.execute('''
       SELECT first_name, total_tokens_won, total_spins
       FROM bot_users 
       WHERE total_tokens_won > 0
       ORDER BY total_tokens_won DESC
       LIMIT 10
       ''')
       
       top_players = cursor.fetchall()
       conn.close()
       
       leaderboard_text = f"""
🏆 **Creator Coin Spin Leaderboard** 🎰

Built by **David Okeamah** ({self.developer_info['rank']})

**Top Players:**
       """
       
       if top_players:
           for i, (name, tokens, spins) in enumerate(top_players, 1):
               emoji = "👑" if i == 1 else "🥈" if i == 2 else "🥉" if i == 3 else f"{i}."
               leaderboard_text += f"\n{emoji} {name}: {tokens:,} tokens ({spins} spins)"
       else:
           leaderboard_text += "\n🎯 Be the first to play and claim the top spot!"
       
       leaderboard_text += f"\n\n🎮 Join the competition and climb the ranks!"
       
       keyboard = [
           [InlineKeyboardButton("🎰 Play Now", web_app=WebAppInfo(url=self.webapp_url))],
           [InlineKeyboardButton("📊 My Stats", callback_data="stats"),
            InlineKeyboardButton("🔙 Main Menu", callback_data="main_menu")]
       ]
       
       reply_markup = InlineKeyboardMarkup(keyboard)
       
       await update.message.reply_text(
           leaderboard_text,
           reply_markup=reply_markup,
           parse_mode='Markdown'
       )
   
   async def portfolio_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
       """Handle /portfolio command"""
       user = update.effective_user
       stats = self.get_user_stats(user.id)
       self.track_event('portfolio_view', user.id)
       
       portfolio_text = f"""
💰 **{user.first_name}'s Portfolio** 📊

🪙 **Creator Tokens:** {stats['total_tokens_won']:,}
💵 **Estimated Value:** ${stats['total_tokens_won'] * 0.001:.2f}
📈 **Growth:** +{stats['total_spins'] * 5}% (from gameplay)

🎯 **Performance:**
• Total Spins: {stats['total_spins']:,}
• Win Rate: {min(95, 60 + stats['total_spins'])}%
• Days Active: {stats['days_active']}

**Developer Portfolio for Reference:**
👨‍💻 David Okeamah: {self.developer_info['portfolio']}
📊 Rank: {self.developer_info['rank']}

Keep spinning to grow your portfolio! 🚀
       """
       
       keyboard = [
           [InlineKeyboardButton("🎰 Spin to Earn More", web_app=WebAppInfo(url=self.webapp_url))],
           [InlineKeyboardButton("📊 Full Stats", callback_data="stats"),
            InlineKeyboardButton("🔙 Main Menu", callback_data="main_menu")]
       ]
       
       reply_markup = InlineKeyboardMarkup(keyboard)
       
       await update.message.reply_text(
           portfolio_text,
           reply_markup=reply_markup,
           parse_mode='Markdown'
       )
   
   async def help_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
       """Handle /help command"""
       user = update.effective_user
       self.track_event('help_view', user.id)
       
       help_text = f"""
❓ **Boombot Help & Guide** 🦊

**🤖 Bot Commands:**
/start - Welcome & main menu
/play - Launch Creator Coin Spin
/stats - View your gaming statistics
/portfolio - Check your token portfolio
/leaderboard - See top players
/help - This help message

**🎰 How to Play:**
1. Tap "Play Creator Coin Spin"
2. Connect your Web3 wallet
3. Spin the cosmic wheel
4. Win Creator tokens!
5. Enjoy 80 particle celebrations

**🎮 Game Features:**
• Daily free spins
• Streak bonuses
• 5 visual themes
• Real token rewards
• Mobile optimized

**👨‍💻 Developer:**
Built by **David Okeamah**
{self.developer_info['verified']} Verified on 0xppl
💰 Portfolio: {self.developer_info['portfolio']}
📊 Rank: {self.developer_info['rank']}
🐦 Twitter: {self.developer_info['twitter']}

Need more help? Contact @agunnaya001
       """
       
       keyboard = [
           [InlineKeyboardButton("🎰 Start Playing", web_app=WebAppInfo(url=self.webapp_url))],
           [InlineKeyboardButton("🌐 Web Version", url=self.webapp_url),
            InlineKeyboardButton("🐦 Follow Dev", url="https://twitter.com/okeamah_eth")],
           [InlineKeyboardButton("🔙 Main Menu", callback_data="main_menu")]
       ]
       
       reply_markup = InlineKeyboardMarkup(keyboard)
       
       await update.message.reply_text(
           help_text,
           reply_markup=reply_markup,
           parse_mode='Markdown'
       )
   
   async def button_callback(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
       """Handle button callbacks"""
       query = update.callback_query
       user = query.from_user
       
       await query.answer()
       
       if query.data == "main_menu":
           await self.start_command(update, context)
       elif query.data == "stats":
           await self.stats_command(update, context)
       elif query.data == "leaderboard":
           await self.leaderboard_command(update, context)
       elif query.data == "portfolio":
           await self.portfolio_command(update, context)
       elif query.data == "help":
           await self.help_command(update, context)
       elif query.data == "settings":
           await self.settings_callback(update, context)
   
   async def settings_callback(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
       """Handle settings callback"""
       query = update.callback_query
       user = query.from_user
       
       settings_text = f"""
⚙️ **Boombot Settings** 🦊

**🔔 Notifications:**
• Daily spin reminders: ✅ Enabled
• Big win celebrations: ✅ Enabled
• Leaderboard updates: ✅ Enabled

**🎮 Game Preferences:**
• Theme: Cosmic (default)
• Particles: Maximum (80+)
• Sound: Enabled

**👨‍💻 Developer Info:**
Built by **David Okeamah**
Portfolio: {self.developer_info['portfolio']}
Rank: {self.developer_info['rank']}

Settings are automatically optimized for the best experience! 🚀
       """
       
       keyboard = [
           [InlineKeyboardButton("🔔 Toggle Notifications", callback_data="toggle_notifications")],
           [InlineKeyboardButton("🎰 Play Game", web_app=WebAppInfo(url=self.webapp_url))],
           [InlineKeyboardButton("🔙 Main Menu", callback_data="main_menu")]
       ]
       
       reply_markup = InlineKeyboardMarkup(keyboard)
       
       await query.edit_message_text(
           settings_text,
           reply_markup=reply_markup,
           parse_mode='Markdown'
       )
   
   async def handle_message(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
       """Handle regular messages"""
       user = update.effective_user
       message_text = update.message.text.lower()
       
       self.track_event('message_received', user.id, {'text': message_text})
       
       # Natural language processing for common queries
       if any(word in message_text for word in ['play', 'game', 'spin']):
           await self.play_command(update, context)
       elif any(word in message_text for word in ['stats', 'statistics', 'score']):
           await self.stats_command(update, context)
       elif any(word in message_text for word in ['help', 'how', 'guide']):
           await self.help_command(update, context)
       elif any(word in message_text for word in ['portfolio', 'tokens', 'balance']):
           await self.portfolio_command(update, context)
       else:
           # Default response with game promotion
           response_text = f"""
🦊 Hey {user.first_name}! 

I'm Boombot, your Web3 gaming companion created by **David Okeamah** ({self.developer_info['rank']}).

Try saying:
• "play" - Launch Creator Coin Spin
• "stats" - View your statistics  
• "help" - Get assistance

Or just tap the buttons below! 🎯
           """
           
           keyboard = [
               [InlineKeyboardButton("🎰 Play Creator Coin Spin", web_app=WebAppInfo(url=self.webapp_url))],
               [InlineKeyboardButton("📊 My Stats", callback_data="stats"),
                InlineKeyboardButton("❓ Help", callback_data="help")]
           ]
           
           reply_markup = InlineKeyboardMarkup(keyboard)
           
           await update.message.reply_text(
               response_text,
               reply_markup=reply_markup,
               parse_mode='Markdown'
           )
   
   async def setup_bot_menu(self, bot: Bot):
       """Setup bot menu button"""
       menu_button = MenuButtonWebApp(
           text="🎰 Play Creator Coin Spin",
           web_app=WebAppInfo(url=self.webapp_url)
       )
       await bot.set_chat_menu_button(menu_button=menu_button)
   
   def run(self):
       """Run the bot"""
       if not self.token:
           logger.error("TELEGRAM_BOT_TOKEN not set!")
           return
       
       # Create application
       application = Application.builder().token(self.token).build()
       
       # Add handlers
       application.add_handler(CommandHandler("start", self.start_command))
       application.add_handler(CommandHandler("play", self.play_command))
       application.add_handler(CommandHandler("stats", self.stats_command))
       application.add_handler(CommandHandler("portfolio", self.portfolio_command))
       application.add_handler(CommandHandler("leaderboard", self.leaderboard_command))
       application.add_handler(CommandHandler("help", self.help_command))
       application.add_handler(CallbackQueryHandler(self.button_callback))
       application.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, self.handle_message))
       
       # Setup bot menu
       asyncio.create_task(self.setup_bot_menu(application.bot))
       
       logger.info("🦊 Boombot starting...")
       logger.info(f"👨‍💻 Developer: David Okeamah ({self.developer_info['rank']})")
       logger.info(f"🌐 Web App: {self.webapp_url}")
       
       # Start polling
       application.run_polling(allowed_updates=Update.ALL_TYPES)

if __name__ == "__main__":
   bot = BoomBot()
   bot.run()
