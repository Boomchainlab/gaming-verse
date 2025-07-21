#!/usr/bin/env python3
"""
🦊 Boombot Webhook Server
Handles Telegram webhooks and game integration
"""

import os
import json
import asyncio
import logging
from datetime import datetime
from flask import Flask, request, jsonify
from telegram import Bot, Update
from telegram_bot import BoomBot
import sqlite3
import aiohttp
from typing import Dict

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
boom_bot = BoomBot()

# Bot configuration
BOT_TOKEN = os.getenv('TELEGRAM_BOT_TOKEN', '7779463152:AAHFq92ODXEhc41f3fDuHIuUkvaPJ8LVJSA')
WEBHOOK_URL = os.getenv('WEBHOOK_URL', 'https://webhook.boomchainlab.blog/telegram')

# Initialize Telegram bot application
telegram_app = Application.builder().token(BOT_TOKEN).build()

@app.route('/telegram', methods=['POST'])
async def telegram_webhook():
    """Handle incoming Telegram webhook updates"""
    try:
        # Get the update from Telegram
        update_data = request.get_json()
        
        if not update_data:
            return jsonify({"error": "No data received"}), 400
        
        # Create Update object
        update = Update.de_json(update_data, telegram_app.bot)
        
        # Process the update
        await telegram_app.process_update(update)
        
        return jsonify({"status": "ok"}), 200
        
    except Exception as e:
        logger.error(f"Error processing webhook: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/telegram', methods=['GET'])
def webhook_info():
    """Webhook info endpoint"""
    return jsonify({
        "status": "active",
        "webhook_url": WEBHOOK_URL,
        "bot_token": BOT_TOKEN[:10] + "..." if BOT_TOKEN else "Not set"
    })

@app.route('/game-event', methods=['POST'])
def game_event():
   """Handle game events from web app"""
   try:
       data = request.get_json()
       event_type = data.get('event_type')
       user_id = data.get('user_id')
       event_data = data.get('data', {})
       
       # Track event in database
       boom_bot.track_event(event_type, user_id, event_data)
       
       # Send notifications for big wins
       if event_type == 'spin_complete' and event_data.get('reward', 0) >= 10000:
           asyncio.create_task(send_big_win_notification(user_id, event_data))
       
       return jsonify({"status": "success"})
   except Exception as e:
       logger.error(f"Game event error: {e}")
       return jsonify({"error": str(e)}), 500

@app.route('/analytics', methods=['GET'])
def analytics():
   """Get bot analytics"""
   try:
       conn = sqlite3.connect(boom_bot.db_path)
       cursor = conn.cursor()
       
       # Get user count
       cursor.execute('SELECT COUNT(*) FROM bot_users')
       total_users = cursor.fetchone()[0]
       
       # Get active users (last 24 hours)
       cursor.execute('''
       SELECT COUNT(DISTINCT user_id) FROM bot_analytics 
       WHERE timestamp > datetime('now', '-1 day')
       ''')
       active_users = cursor.fetchone()[0]
       
       # Get total spins
       cursor.execute('SELECT SUM(total_spins) FROM bot_users')
       total_spins = cursor.fetchone()[0] or 0
       
       # Get total tokens distributed
       cursor.execute('SELECT SUM(total_tokens_won) FROM bot_users')
       total_tokens = cursor.fetchone()[0] or 0
       
       # Get top events
       cursor.execute('''
       SELECT event_type, COUNT(*) as count 
       FROM bot_analytics 
       WHERE timestamp > datetime('now', '-1 day')
       GROUP BY event_type 
       ORDER BY count DESC 
       LIMIT 10
       ''')
       top_events = cursor.fetchall()
       
       conn.close()
       
       analytics_data = {
           "total_users": total_users,
           "active_users_24h": active_users,
           "total_spins": total_spins,
           "total_tokens_distributed": total_tokens,
           "top_events": [{"event": event, "count": count} for event, count in top_events],
           "developer_info": boom_bot.developer_info,
           "timestamp": datetime.now().isoformat()
       }
       
       return jsonify(analytics_data)
   except Exception as e:
       logger.error(f"Analytics error: {e}")
       return jsonify({"error": str(e)}), 500

@app.route('/leaderboard', methods=['GET'])
def leaderboard():
   """Get leaderboard data"""
   try:
       conn = sqlite3.connect(boom_bot.db_path)
       cursor = conn.cursor()
       
       cursor.execute('''
       SELECT user_id, first_name, username, total_tokens_won, total_spins
       FROM bot_users 
       WHERE total_tokens_won > 0
       ORDER BY total_tokens_won DESC
       LIMIT 50
       ''')
       
       players = cursor.fetchall()
       conn.close()
       
       leaderboard_data = []
       for i, (user_id, first_name, username, tokens, spins) in enumerate(players, 1):
           leaderboard_data.append({
               "rank": i,
               "name": first_name or username or f"Player{user_id}",
               "tokens_won": tokens,
               "total_spins": spins,
               "avg_per_spin": tokens / max(spins, 1)
           })
       
       return jsonify({
           "leaderboard": leaderboard_data,
           "developer_info": boom_bot.developer_info,
           "timestamp": datetime.now().isoformat()
       })
   except Exception as e:
       logger.error(f"Leaderboard error: {e}")
       return jsonify({"error": str(e)}), 500

@app.route('/user-stats/<int:user_id>', methods=['GET'])
def user_stats(user_id):
   """Get specific user statistics"""
   try:
       stats = boom_bot.get_user_stats(user_id)
       return jsonify({
           "user_id": user_id,
           "stats": stats,
           "developer_info": boom_bot.developer_info,
           "timestamp": datetime.now().isoformat()
       })
   except Exception as e:
       logger.error(f"User stats error: {e}")
       return jsonify({"error": str(e)}), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "healthy", "service": "telegram_webhook"})

async def send_big_win_notification(user_id: int, event_data: Dict):
   """Send notification for big wins"""
   try:
       reward = event_data.get('reward', 0)
       
       message = f"""
🎉 **INCREDIBLE WIN!** 🎉

You just won **{reward:,} Creator tokens!** 🪙

🎆 That's a massive win! The celebration particles are going crazy!

Built by David Okeamah ({boom_bot.developer_info['rank']})

Keep spinning for more epic wins! 🚀
       """
       
       await telegram_app.bot.send_message(
           chat_id=user_id,
           text=message,
           parse_mode='Markdown'
       )
   except Exception as e:
       logger.error(f"Notification error: {e}")

if __name__ == "__main__":
   print("🤖 Starting Telegram Webhook Server...")
   print(f"📡 Webhook URL: {WEBHOOK_URL}")
   app.run(host='0.0.0.0', port=8000, debug=True)
