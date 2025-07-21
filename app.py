from flask import Flask, request, jsonify, render_template
from web3 import Web3
from eth_account.messages import encode_defunct
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timedelta
import os
import random
import json

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///futuristic_game.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# Futuristic Game Configuration
GAS_PAYER_PRIVATE_KEY = os.getenv("PRIVATE_KEY", "0xf2fb82b350cbf5a09b60a0e89ccbc766c59d1e1a66d9747041f864353b76dfde")
TOKEN_ADDRESS = os.getenv("TOKEN_ADDRESS", "0xcd96b6aded93fb64c295bdba10865765f5e7acbe")
BASE_RPC_URL = os.getenv("BASE_RPC_URL", "https://mainnet.base.org")

# Social & Viral Features
REFERRAL_BONUS = 500  # Bonus tokens for referrals
DAILY_STREAK_MULTIPLIER = 1.2  # 20% bonus for daily streaks
SOCIAL_SHARE_BONUS = 100  # Bonus for sharing
LEADERBOARD_REWARDS = [5000, 3000, 1000]  # Top 3 weekly rewards

# Initialize Web3
web3 = Web3(Web3.HTTPProvider(BASE_RPC_URL))

# Setup wallet
try:
    gas_account = web3.eth.account.from_key(GAS_PAYER_PRIVATE_KEY)
    GAS_PAYER_ADDRESS = gas_account.address
    print(f"🚀 Futuristic Game Wallet: {GAS_PAYER_ADDRESS}")
except Exception as e:
    print(f"❌ Wallet setup failed: {e}")
    GAS_PAYER_ADDRESS = None

# Database Models
class Player(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    address = db.Column(db.String(42), unique=True, nullable=False)
    username = db.Column(db.String(50))
    avatar_id = db.Column(db.Integer, default=1)
    level = db.Column(db.Integer, default=1)
    xp = db.Column(db.Integer, default=0)
    total_tokens_won = db.Column(db.Integer, default=0)
    daily_streak = db.Column(db.Integer, default=0)
    last_spin_date = db.Column(db.Date)
    referral_code = db.Column(db.String(10), unique=True)
    referred_by = db.Column(db.String(42))
    social_shares = db.Column(db.Integer, default=0)
    achievements = db.Column(db.Text, default='[]')  # JSON array
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class SpinResult(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    player_address = db.Column(db.String(42), nullable=False)
    reward_amount = db.Column(db.Integer, nullable=False)
    spin_type = db.Column(db.String(20), default='normal')  # normal, mega, ultra
    multiplier = db.Column(db.Float, default=1.0)
    tx_hash = db.Column(db.String(66))
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

class Achievement(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(200))
    icon = db.Column(db.String(10), default='🎯')
    reward_tokens = db.Column(db.Integer, default=0)
    requirement_type = db.Column(db.String(50))  # spins, tokens, streak, referrals
    requirement_value = db.Column(db.Integer)

@app.route('/')
def index():
    return render_template("futuristic_game.html")

@app.route('/telegram')
def telegram_version():
    return render_template("telegram_game.html")

@app.route('/api/player/<address>')
def get_player(address):
    """Get or create player profile"""
    player = Player.query.filter_by(address=address.lower()).first()
    
    if not player:
        # Generate referral code
        import string
        referral_code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))
        
        player = Player(
            address=address.lower(),
            referral_code=referral_code,
            username=f"Player{random.randint(1000, 9999)}"
        )
        db.session.add(player)
        db.session.commit()
    
    # Calculate level from XP
    level = min(100, max(1, int(player.xp / 1000) + 1))
    if level != player.level:
        player.level = level
        db.session.commit()
    
    return jsonify({
        "address": player.address,
        "username": player.username,
        "avatar_id": player.avatar_id,
        "level": player.level,
        "xp": player.xp,
        "total_tokens_won": player.total_tokens_won,
        "daily_streak": player.daily_streak,
        "referral_code": player.referral_code,
        "social_shares": player.social_shares,
        "achievements": json.loads(player.achievements),
        "next_level_xp": (level * 1000),
        "can_spin_today": can_spin_today(player)
    })

def can_spin_today(player):
    """Check if player can spin today"""
    if not player.last_spin_date:
        return True
    return player.last_spin_date < datetime.now().date()

@app.route('/api/spin', methods=['POST'])
def futuristic_spin():
    """Enhanced spinning with futuristic features"""
    try:
        data = request.json
        player_address = data['address'].lower()
        spin_type = data.get('spin_type', 'normal')  # normal, mega, ultra
        
        player = Player.query.filter_by(address=player_address).first()
        if not player:
            return jsonify({"error": "Player not found"}), 404
        
        # Check daily spin limit
        today = datetime.now().date()
        if player.last_spin_date == today:
            return jsonify({"error": "Already spun today! Come back tomorrow."}), 400
        
        # Calculate streak bonus
        streak_multiplier = 1.0
        if player.last_spin_date == today - timedelta(days=1):
            player.daily_streak += 1
            streak_multiplier = min(3.0, 1.0 + (player.daily_streak * 0.1))
        else:
            player.daily_streak = 1
        
        # Determine reward based on spin type and level
        base_rewards = {
            'normal': [1000, 2000, 3000, 5000, 7500, 10000, 15000, 25000],
            'mega': [5000, 10000, 15000, 25000, 50000, 75000, 100000, 250000],
            'ultra': [25000, 50000, 100000, 250000, 500000, 1000000, 2500000, 5000000]
        }
        
        # Level bonus (higher level = better rewards)
        level_multiplier = 1.0 + (player.level * 0.05)
        
        # Select reward
        reward_pool = base_rewards.get(spin_type, base_rewards['normal'])
        base_reward = random.choice(reward_pool)
        
        # Apply all multipliers
        final_reward = int(base_reward * level_multiplier * streak_multiplier)
        
        # Add XP
        xp_gained = final_reward // 100  # 1 XP per 100 tokens
        player.xp += xp_gained
        player.total_tokens_won += final_reward
        player.last_spin_date = today
        
        # Send tokens (simplified for demo)
        tx_hash = f"0x{''.join(random.choices('0123456789abcdef', k=64))}"
        
        # Save spin result
        spin_result = SpinResult(
            player_address=player_address,
            reward_amount=final_reward,
            spin_type=spin_type,
            multiplier=level_multiplier * streak_multiplier,
            tx_hash=tx_hash
        )
        db.session.add(spin_result)
        
        # Check for achievements
        new_achievements = check_achievements(player)
        
        db.session.commit()
        
        return jsonify({
            "success": True,
            "reward": final_reward,
            "tx_hash": tx_hash,
            "xp_gained": xp_gained,
            "new_level": player.level,
            "streak": player.daily_streak,
            "multipliers": {
                "level": level_multiplier,
                "streak": streak_multiplier,
                "total": level_multiplier * streak_multiplier
            },
            "new_achievements": new_achievements,
            "next_spin_in": "24 hours"
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def check_achievements(player):
    """Check and award achievements"""
    achievements = [
        {"name": "First Spin", "requirement": "spins", "value": 1, "reward": 500, "icon": "🎯"},
        {"name": "Token Collector", "requirement": "tokens", "value": 10000, "reward": 1000, "icon": "💰"},
        {"name": "Streak Master", "requirement": "streak", "value": 7, "reward": 2000, "icon": "🔥"},
        {"name": "Level Up", "requirement": "level", "value": 5, "reward": 1500, "icon": "⭐"},
        {"name": "Social Butterfly", "requirement": "shares", "value": 5, "reward": 1000, "icon": "📱"},
    ]
    
    current_achievements = json.loads(player.achievements)
    new_achievements = []
    
    for achievement in achievements:
        if achievement["name"] not in current_achievements:
            earned = False
            
            if achievement["requirement"] == "spins":
                spin_count = SpinResult.query.filter_by(player_address=player.address).count()
                earned = spin_count >= achievement["value"]
            elif achievement["requirement"] == "tokens":
                earned = player.total_tokens_won >= achievement["value"]
            elif achievement["requirement"] == "streak":
                earned = player.daily_streak >= achievement["value"]
            elif achievement["requirement"] == "level":
                earned = player.level >= achievement["value"]
            elif achievement["requirement"] == "shares":
                earned = player.social_shares >= achievement["value"]
            
            if earned:
                current_achievements.append(achievement["name"])
                new_achievements.append(achievement)
                player.total_tokens_won += achievement["reward"]
    
    player.achievements = json.dumps(current_achievements)
    return new_achievements

@app.route('/api/leaderboard')
def get_leaderboard():
    """Get top players leaderboard"""
    top_players = Player.query.order_by(Player.total_tokens_won.desc()).limit(50).all()
    
    leaderboard = []
    for i, player in enumerate(top_players, 1):
        leaderboard.append({
            "rank": i,
            "username": player.username,
            "address": player.address[:6] + "..." + player.address[-4:],
            "level": player.level,
            "total_tokens": player.total_tokens_won,
            "streak": player.daily_streak,
            "avatar_id": player.avatar_id
        })
    
    return jsonify(leaderboard)

@app.route('/api/social-share', methods=['POST'])
def social_share():
    """Track social media shares"""
    data = request.json
    player_address = data['address'].lower()
    platform = data['platform']  # telegram, twitter, discord, etc.
    
    player = Player.query.filter_by(address=player_address).first()
    if player:
        player.social_shares += 1
        player.total_tokens_won += SOCIAL_SHARE_BONUS
        db.session.commit()
        
        return jsonify({
            "success": True,
            "bonus_tokens": SOCIAL_SHARE_BONUS,
            "total_shares": player.social_shares
        })
    
    return jsonify({"error": "Player not found"}), 404

@app.route('/api/referral/<referral_code>')
def use_referral(referral_code):
    """Use referral code for bonus"""
    referrer = Player.query.filter_by(referral_code=referral_code.upper()).first()
    if referrer:
        return jsonify({
            "valid": True,
            "referrer": referrer.username,
            "bonus": REFERRAL_BONUS
        })
    return jsonify({"valid": False})

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    
    print("🚀" * 30)
    print("🎮 FUTURISTIC CREATOR COIN SPIN GAME")
    print("🚀" * 30)
    print(f"🪙 Token: Creator Coin")
    print(f"🌐 Network: Base")
    print(f"💫 Features: Levels, Achievements, Streaks, Referrals")
    print(f"📱 Platforms: Web, Telegram, Social Networks")
    print("🚀" * 30)
    
    app.run(host="0.0.0.0", port=5000, debug=True)
