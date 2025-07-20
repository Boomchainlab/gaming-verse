from flask import Blueprint, request, jsonify, render_template
from app import db, Player, SpinResult, Achievement, can_spin_today
from datetime import datetime
import json

admin_bp = Blueprint('admin', __name__, url_prefix='/admin')

@admin_bp.route('/')
def admin_dashboard():
    return render_template('admin.html')

@admin_bp.route('/api/players', methods=['GET', 'POST'])
def manage_players():
    if request.method == 'GET':
        players = Player.query.all()
        return jsonify([{
            "id": p.id,
            "address": p.address,
            "username": p.username,
            "avatar_id": p.avatar_id,
            "level": p.level,
            "xp": p.xp,
            "total_tokens_won": p.total_tokens_won,
            "daily_streak": p.daily_streak,
            "last_spin_date": p.last_spin_date.isoformat() if p.last_spin_date else None,
            "referral_code": p.referral_code,
            "referred_by": p.referred_by,
            "social_shares": p.social_shares,
            "achievements": json.loads(p.achievements),
            "created_at": p.created_at.isoformat()
        } for p in players])
    elif request.method == 'POST':
        data = request.json
        address = data.get('address').lower()
        player = Player.query.filter_by(address=address).first()
        if player:
            return jsonify({"error": "Player already exists"}), 409
        
        new_player = Player(
            address=address,
            username=data.get('username', f"Player{random.randint(1000, 9999)}"),
            avatar_id=data.get('avatar_id', 1),
            level=data.get('level', 1),
            xp=data.get('xp', 0),
            total_tokens_won=data.get('total_tokens_won', 0),
            daily_streak=data.get('daily_streak', 0),
            referral_code=data.get('referral_code'),
            referred_by=data.get('referred_by'),
            social_shares=data.get('social_shares', 0),
            achievements=json.dumps(data.get('achievements', []))
        )
        db.session.add(new_player)
        db.session.commit()
        return jsonify({"success": True, "message": "Player added", "player_id": new_player.id})

@admin_bp.route('/api/player/<address>', methods=['GET', 'PUT', 'DELETE'])
def manage_single_player(address):
    player = Player.query.filter_by(address=address.lower()).first()
    if not player:
        return jsonify({"error": "Player not found"}), 404

    if request.method == 'GET':
        return jsonify({
            "id": player.id,
            "address": player.address,
            "username": player.username,
            "avatar_id": player.avatar_id,
            "level": player.level,
            "xp": player.xp,
            "total_tokens_won": player.total_tokens_won,
            "daily_streak": player.daily_streak,
            "last_spin_date": player.last_spin_date.isoformat() if player.last_spin_date else None,
            "referral_code": player.referral_code,
            "referred_by": player.referred_by,
            "social_shares": player.social_shares,
            "achievements": json.loads(player.achievements),
            "created_at": player.created_at.isoformat()
        })
    elif request.method == 'PUT':
        data = request.json
        player.username = data.get('username', player.username)
        player.avatar_id = data.get('avatar_id', player.avatar_id)
        player.level = data.get('level', player.level)
        player.xp = data.get('xp', player.xp)
        player.total_tokens_won = data.get('total_tokens_won', player.total_tokens_won)
        player.daily_streak = data.get('daily_streak', player.daily_streak)
        player.referral_code = data.get('referral_code', player.referral_code)
        player.referred_by = data.get('referred_by', player.referred_by)
        player.social_shares = data.get('social_shares', player.social_shares)
        player.achievements = json.dumps(data.get('achievements', json.loads(player.achievements)))
        db.session.commit()
        return jsonify({"success": True, "message": "Player updated"})
    elif request.method == 'DELETE':
        SpinResult.query.filter_by(player_address=address.lower()).delete()
        db.session.delete(player)
        db.session.commit()
        return jsonify({"success": True, "message": "Player deleted"})

@admin_bp.route('/api/achievements', methods=['GET', 'POST'])
def manage_achievements():
    if request.method == 'GET':
        achievements = Achievement.query.all()
        return jsonify([{
            "id": a.id,
            "name": a.name,
            "description": a.description,
            "icon": a.icon,
            "reward_tokens": a.reward_tokens,
            "requirement_type": a.requirement_type,
            "requirement_value": a.requirement_value
        } for a in achievements])
    elif request.method == 'POST':
        data = request.json
        new_achievement = Achievement(
            name=data.get('name'),
            description=data.get('description'),
            icon=data.get('icon'),
            reward_tokens=data.get('reward_tokens'),
            requirement_type=data.get('requirement_type'),
            requirement_value=data.get('requirement_value')
        )
        db.session.add(new_achievement)
        db.session.commit()
        return jsonify({"success": True, "message": "Achievement added", "achievement_id": new_achievement.id})

@admin_bp.route('/api/achievement/<int:id>', methods=['GET', 'PUT', 'DELETE'])
def manage_single_achievement(id):
    achievement = Achievement.query.get(id)
    if not achievement:
        return jsonify({"error": "Achievement not found"}), 404

    if request.method == 'GET':
        return jsonify({
            "id": achievement.id,
            "name": achievement.name,
            "description": achievement.description,
            "icon": achievement.icon,
            "reward_tokens": achievement.reward_tokens,
            "requirement_type": achievement.requirement_type,
            "requirement_value": achievement.requirement_value
        })
    elif request.method == 'PUT':
        data = request.json
        achievement.name = data.get('name', achievement.name)
        achievement.description = data.get('description', achievement.description)
        achievement.icon = data.get('icon', achievement.icon)
        achievement.reward_tokens = data.get('reward_tokens', achievement.reward_tokens)
        achievement.requirement_type = data.get('requirement_type', achievement.requirement_type)
        achievement.requirement_value = data.get('requirement_value', achievement.requirement_value)
        db.session.commit()
        return jsonify({"success": True, "message": "Achievement updated"})
    elif request.method == 'DELETE':
        db.session.delete(achievement)
        db.session.commit()
        return jsonify({"success": True, "message": "Achievement deleted"})
