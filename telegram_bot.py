import os
import logging
import asyncio
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup, WebAppInfo
from telegram.ext import Application, CommandHandler, CallbackQueryHandler, ContextTypes
import json

# Configure logging
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)

# Bot configuration
BOT_TOKEN = os.getenv('TELEGRAM_BOT_TOKEN', '7779463152:AAHFq92ODXEhc41f3fDuHIuUkvaPJ8LVJSA')
WEBAPP_URL = os.getenv('WEBAPP_URL', 'https://boomchainlab.blog')

class BoomBot:
    def __init__(self):
        self.application = Application.builder().token(BOT_TOKEN).build()
        self.setup_handlers()
    
    def setup_handlers(self):
        """Setup command and callback handlers"""
        self.application.add_handler(CommandHandler("start", self.start_command))
        self.application.add_handler(CommandHandler("help", self.help_command))
        self.application.add_handler(CommandHandler("play", self.play_command))
        self.application.add_handler(CommandHandler("stats", self.stats_command))
        self.application.add_handler(CallbackQueryHandler(self.button_callback))
    
    async def start_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle /start command"""
        user = update.effective_user
        welcome_text = f"""
🚀 Welcome to Creator Coin Spin Game, {user.first_name}!

🎮 **Play & Earn Creator Coins**
🏆 **Level Up & Unlock Achievements**
🔥 **Build Daily Streaks for Bonuses**
👥 **Invite Friends & Get Rewards**

Ready to spin and win? Let's go! 🎯
        """
        
        keyboard = [
            [InlineKeyboardButton("🎮 Play Game", web_app=WebAppInfo(url=f"{WEBAPP_URL}/telegram"))],
            [InlineKeyboardButton("📊 My Stats", callback_data="stats")],
            [InlineKeyboardButton("🏆 Leaderboard", callback_data="leaderboard")],
            [InlineKeyboardButton("💡 Help", callback_data="help")]
        ]
        reply_markup = InlineKeyboardMarkup(keyboard)
        
        await update.message.reply_text(welcome_text, reply_markup=reply_markup)
    
    async def help_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle /help command"""
        help_text = """
🎮 **Creator Coin Spin Game Help**

**Commands:**
• `/start` - Start the bot and see main menu
• `/play` - Quick access to the game
• `/stats` - View your game statistics
• `/help` - Show this help message

**How to Play:**
1. Click "Play Game" to open the web app
2. Connect your wallet
3. Spin the wheel daily for rewards
4. Level up by earning XP
5. Complete achievements for bonus tokens
6. Share with friends for referral bonuses

**Features:**
🎯 Daily spins with increasing rewards
🔥 Streak bonuses for consecutive days
⭐ Level system with better rewards
🏆 Achievements and challenges
👥 Referral system
📊 Global leaderboard

Need more help? Contact @BoomchainLabs
        """
        await update.message.reply_text(help_text)
    
    async def play_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle /play command"""
        keyboard = [
            [InlineKeyboardButton("🎮 Launch Game", web_app=WebAppInfo(url=f"{WEBAPP_URL}/telegram"))]
        ]
        reply_markup = InlineKeyboardMarkup(keyboard)
        
        await update.message.reply_text(
            "🎮 Ready to spin and win Creator Coins?\n\nClick the button below to launch the game!",
            reply_markup=reply_markup
        )
    
    async def stats_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle /stats command"""
        user = update.effective_user
        # In a real implementation, you'd fetch stats from your database
        stats_text = f"""
📊 **{user.first_name}'s Game Stats**

🎯 **Spins:** 0
🪙 **Total Tokens Won:** 0
⭐ **Level:** 1
🔥 **Current Streak:** 0 days
🏆 **Achievements:** 0/10

Connect your wallet in the game to see real stats!
        """
        
        keyboard = [
            [InlineKeyboardButton("🎮 Play Now", web_app=WebAppInfo(url=f"{WEBAPP_URL}/telegram"))]
        ]
        reply_markup = InlineKeyboardMarkup(keyboard)
        
        await update.message.reply_text(stats_text, reply_markup=reply_markup)
    
    async def button_callback(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle inline button callbacks"""
        query = update.callback_query
        await query.answer()
        
        if query.data == "stats":
            await self.stats_command(update, context)
        elif query.data == "help":
            await self.help_command(update, context)
        elif query.data == "leaderboard":
            leaderboard_text = """
🏆 **Global Leaderboard**

1. 👑 Player1234 - 1,250,000 tokens
2. 🥈 CryptoGamer - 980,000 tokens
3. 🥉 SpinMaster - 750,000 tokens
4. TokenHunter - 650,000 tokens
5. LuckySpinner - 500,000 tokens

Your rank: Not ranked yet
            """
            keyboard = [
                [InlineKeyboardButton("🎮 Play to Rank Up", web_app=WebAppInfo(url=f"{WEBAPP_URL}/telegram"))]
            ]
            reply_markup = InlineKeyboardMarkup(keyboard)
            await query.edit_message_text(leaderboard_text, reply_markup=reply_markup)
    
    async def run(self):
        """Start the bot"""
        logger.info("🤖 BoomBot starting...")
        await self.application.initialize()
        await self.application.start()
        await self.application.updater.start_polling()
        
        logger.info("🚀 BoomBot is running!")
        
        # Keep the bot running
        try:
            await asyncio.Event().wait()
        except KeyboardInterrupt:
            logger.info("🛑 BoomBot stopping...")
        finally:
            await self.application.updater.stop()
            await self.application.stop()
            await self.application.shutdown()

if __name__ == '__main__':
    bot = BoomBot()
    asyncio.run(bot.run())
