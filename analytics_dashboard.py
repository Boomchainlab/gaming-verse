#!/usr/bin/env python3
"""
📊 Boombot Analytics Dashboard
Real-time monitoring and success tracking
"""

import sqlite3
import json
import asyncio
from datetime import datetime, timedelta
from flask import Flask, render_template, jsonify
import matplotlib.pyplot as plt
import pandas as pd
from typing import Dict, List

app = Flask(__name__)

class BoomBotAnalytics:
    def __init__(self):
        self.db_path = 'boombot.db'
        self.developer_info = {
            "name": "David Okeamah",
            "twitter": "@okeamah_eth",
            "portfolio": "$107K (↗ 28.49%)",
            "rank": "#91 on 0xppl",
            "bot": "@OkeamahBot"
        }
    
    def get_real_time_metrics(self) -> Dict:
        """Get real-time bot and game metrics"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Total users
        cursor.execute('SELECT COUNT(*) FROM bot_users')
        total_users = cursor.fetchone()[0]
        
        # Active users (last 24 hours)
        cursor.execute('''
        SELECT COUNT(DISTINCT user_id) FROM bot_analytics 
        WHERE timestamp > datetime('now', '-1 day')
        ''')
        active_users_24h = cursor.fetchone()[0]
        
        # Active users (last hour)
        cursor.execute('''
        SELECT COUNT(DISTINCT user_id) FROM bot_analytics 
        WHERE timestamp > datetime('now', '-1 hour')
        ''')
        active_users_1h = cursor.fetchone()[0]
        
        # Total spins
        cursor.execute('SELECT SUM(total_spins) FROM bot_users')
        total_spins = cursor.fetchone()[0] or 0
        
        # Total tokens distributed
        cursor.execute('SELECT SUM(total_tokens_won) FROM bot_users')
        total_tokens = cursor.fetchone()[0] or 0
        
        # New users today
        cursor.execute('''
        SELECT COUNT(*) FROM bot_users 
        WHERE DATE(joined_date) = DATE('now')
        ''')
        new_users_today = cursor.fetchone()[0]
        
        # Average session length (estimated)
        cursor.execute('''
        SELECT AVG(spins_count) FROM game_sessions 
        WHERE session_start > datetime('now', '-1 day')
        ''')
        avg_session_spins = cursor.fetchone()[0] or 0
        
        # Top performing hours
        cursor.execute('''
        SELECT strftime('%H', timestamp) as hour, COUNT(*) as activity
        FROM bot_analytics 
        WHERE timestamp > datetime('now', '-1 day')
        GROUP BY hour 
        ORDER BY activity DESC 
        LIMIT 3
        ''')
        peak_hours = cursor.fetchall()
        
        conn.close()
        
        # Calculate growth rate
        growth_rate = (new_users_today / max(total_users - new_users_today, 1)) * 100
        
        # Calculate engagement rate
        engagement_rate = (active_users_24h / max(total_users, 1)) * 100
        
        # Calculate viral coefficient (simplified)
        viral_coefficient = (new_users_today / max(active_users_24h, 1)) if active_users_24h > 0 else 0
        
        return {
            "total_users": total_users,
            "active_users_24h": active_users_24h,
            "active_users_1h": active_users_1h,
            "new_users_today": new_users_today,
            "total_spins": total_spins,
            "total_tokens_distributed": total_tokens,
            "avg_session_spins": round(avg_session_spins, 1),
            "growth_rate": round(growth_rate, 2),
            "engagement_rate": round(engagement_rate, 2),
            "viral_coefficient": round(viral_coefficient, 2),
            "peak_hours": [{"hour": f"{hour}:00", "activity": activity} for hour, activity in peak_hours],
            "timestamp": datetime.now().isoformat()
        }
    
    def get_user_acquisition_data(self) -> Dict:
        """Get user acquisition analytics"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Daily user acquisition (last 7 days)
        cursor.execute('''
        SELECT DATE(joined_date) as date, COUNT(*) as new_users
        FROM bot_users 
        WHERE joined_date > datetime('now', '-7 days')
        GROUP BY DATE(joined_date)
        ORDER BY date
        ''')
        daily_acquisition = cursor.fetchall()
        
        # Hourly acquisition (last 24 hours)
        cursor.execute('''
        SELECT strftime('%H', joined_date) as hour, COUNT(*) as new_users
        FROM bot_users 
        WHERE joined_date > datetime('now', '-1 day')
        GROUP BY hour
        ORDER BY hour
        ''')
        hourly_acquisition = cursor.fetchall()
        
        # Acquisition sources (from analytics events)
        cursor.execute('''
        SELECT 
            CASE 
                WHEN data LIKE '%twitter%' THEN 'Twitter'
                WHEN data LIKE '%telegram%' THEN 'Telegram'
                WHEN data LIKE '%reddit%' THEN 'Reddit'
                WHEN data LIKE '%discord%' THEN 'Discord'
                ELSE 'Direct'
            END as source,
            COUNT(*) as users
        FROM bot_analytics 
        WHERE event_type = 'bot_start' AND timestamp > datetime('now', '-7 days')
        GROUP BY source
        ORDER BY users DESC
        ''')
        acquisition_sources = cursor.fetchall()
        
        conn.close()
        
        return {
            "daily_acquisition": [{"date": date, "users": users} for date, users in daily_acquisition],
            "hourly_acquisition": [{"hour": f"{hour}:00", "users": users} for hour, users in hourly_acquisition],
            "acquisition_sources": [{"source": source, "users": users} for source, users in acquisition_sources]
        }
    
    def get_engagement_analytics(self) -> Dict:
        """Get user engagement analytics"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Command usage
        cursor.execute('''
        SELECT event_type, COUNT(*) as usage_count
        FROM bot_analytics 
        WHERE timestamp > datetime('now', '-7 days')
        AND event_type IN ('play_command', 'stats_view', 'leaderboard_view', 'portfolio_view', 'help_view')
        GROUP BY event_type
        ORDER BY usage_count DESC
        ''')
        command_usage = cursor.fetchall()
        
        # User retention (users who returned after first day)
        cursor.execute('''
        SELECT COUNT(DISTINCT user_id) as retained_users
        FROM bot_analytics a1
        WHERE EXISTS (
            SELECT 1 FROM bot_analytics a2 
            WHERE a2.user_id = a1.user_id 
            AND DATE(a2.timestamp) > DATE(a1.timestamp)
        )
        ''')
        retained_users = cursor.fetchone()[0]
        
        # Session duration distribution
        cursor.execute('''
        SELECT 
            CASE 
                WHEN spins_count <= 1 THEN '1 spin'
                WHEN spins_count <= 3 THEN '2-3 spins'
                WHEN spins_count <= 5 THEN '4-5 spins'
                WHEN spins_count <= 10 THEN '6-10 spins'
                ELSE '10+ spins'
            END as session_length,
            COUNT(*) as sessions
        FROM game_sessions
        WHERE session_start > datetime('now', '-7 days')
        GROUP BY session_length
        ORDER BY sessions DESC
        ''')
        session_distribution = cursor.fetchall()
        
        conn.close()
        
        return {
            "command_usage": [{"command": cmd.replace('_', ' ').title(), "count": count} for cmd, count in command_usage],
            "retained_users": retained_users,
            "session_distribution": [{"length": length, "sessions": sessions} for length, sessions in session_distribution]
        }
    
    def get_viral_metrics(self) -> Dict:
        """Get viral growth metrics"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Referral data
        cursor.execute('''
        SELECT COUNT(*) as total_referrals
        FROM bot_users 
        WHERE referred_by IS NOT NULL
        ''')
        total_referrals = cursor.fetchone()[0]
        
        # Top referrers
        cursor.execute('''
        SELECT u1.first_name as referrer, COUNT(*) as referrals
        FROM bot_users u1
        JOIN bot_users u2 ON u1.user_id = u2.referred_by
        GROUP BY u1.user_id, u1.first_name
        ORDER BY referrals DESC
        LIMIT 10
        ''')
        top_referrers = cursor.fetchall()
        
        # Social sharing events
        cursor.execute('''
        SELECT COUNT(*) as total_shares
        FROM bot_analytics 
        WHERE event_type = 'social_share' AND timestamp > datetime('now', '-7 days')
        ''')
        total_shares = cursor.fetchone()[0]
        
        # Viral coefficient calculation
        cursor.execute('''
        SELECT 
            DATE(joined_date) as date,
            COUNT(*) as new_users,
            LAG(COUNT(*)) OVER (ORDER BY DATE(joined_date)) as prev_day_users
        FROM bot_users 
        WHERE joined_date > datetime('now', '-7 days')
        GROUP BY DATE(joined_date)
        ORDER BY date
        ''')
        daily_growth = cursor.fetchall()
        
        conn.close()
        
        # Calculate viral coefficient
        viral_coefficients = []
        for date, new_users, prev_users in daily_growth:
            if prev_users and prev_users > 0:
                coefficient = new_users / prev_users
                viral_coefficients.append(coefficient)
        
        avg_viral_coefficient = sum(viral_coefficients) / len(viral_coefficients) if viral_coefficients else 0
        
        return {
            "total_referrals": total_referrals,
            "total_shares": total_shares,
            "avg_viral_coefficient": round(avg_viral_coefficient, 2),
            "top_referrers": [{"name": name or "Anonymous", "referrals": refs} for name, refs in top_referrers],
            "daily_growth": [{"date": date, "new_users": users, "growth_rate": round((users / prev_users - 1) * 100, 1) if prev_users else 0} for date, users, prev_users in daily_growth if prev_users]
        }
    
    def get_success_indicators(self) -> Dict:
        """Calculate success indicators and predictions"""
        metrics = self.get_real_time_metrics()
        
        # Success scoring (0-100)
        success_score = 0
        
        # User base score (25 points max)
        if metrics['total_users'] >= 1000:
            success_score += 25
        elif metrics['total_users'] >= 500:
            success_score += 20
        elif metrics['total_users'] >= 100:
            success_score += 15
        elif metrics['total_users'] >= 50:
            success_score += 10
        elif metrics['total_users'] >= 10:
            success_score += 5
        
        # Engagement score (25 points max)
        if metrics['engagement_rate'] >= 50:
            success_score += 25
        elif metrics['engagement_rate'] >= 40:
            success_score += 20
        elif metrics['engagement_rate'] >= 30:
            success_score += 15
        elif metrics['engagement_rate'] >= 20:
            success_score += 10
        elif metrics['engagement_rate'] >= 10:
            success_score += 5
        
        # Growth score (25 points max)
        if metrics['growth_rate'] >= 20:
            success_score += 25
        elif metrics['growth_rate'] >= 15:
            success_score += 20
        elif metrics['growth_rate'] >= 10:
            success_score += 15
        elif metrics['growth_rate'] >= 5:
            success_score += 10
        elif metrics['growth_rate'] >= 1:
            success_score += 5
        
        # Viral score (25 points max)
        if metrics['viral_coefficient'] >= 2.0:
            success_score += 25
        elif metrics['viral_coefficient'] >= 1.5:
            success_score += 20
        elif metrics['viral_coefficient'] >= 1.2:
            success_score += 15
        elif metrics['viral_coefficient'] >= 1.0:
            success_score += 10
        elif metrics['viral_coefficient'] >= 0.5:
            success_score += 5
        
        # Success level determination
        if success_score >= 80:
            success_level = "🚀 VIRAL SUCCESS!"
            prediction = "Exponential growth expected"
        elif success_score >= 60:
            success_level = "📈 STRONG GROWTH"
            prediction = "Sustained growth trajectory"
        elif success_score >= 40:
            success_level = "✅ GOOD PROGRESS"
            prediction = "Steady user acquisition"
        elif success_score >= 20:
            success_level = "🌱 EARLY STAGE"
            prediction = "Building momentum"
        else:
            success_level = "🎯 GETTING STARTED"
            prediction = "Focus on user acquisition"
        
        return {
            "success_score": success_score,
            "success_level": success_level,
            "prediction": prediction,
            "recommendations": self.generate_recommendations(metrics, success_score)
        }
    
    def generate_recommendations(self, metrics: Dict, success_score: int) -> List[str]:
        """Generate actionable recommendations"""
        recommendations = []
        
        if metrics['total_users'] < 100:
            recommendations.append("🎯 Launch aggressive social media campaign - target 500 users in 48 hours")
        
        if metrics['engagement_rate'] < 30:
            recommendations.append("🔔 Implement push notifications for daily spins and big wins")
        
        if metrics['viral_coefficient'] < 1.2:
            recommendations.append("🎁 Add referral rewards - 1000 tokens per successful referral")
        
        if metrics['growth_rate'] < 10:
            recommendations.append("📱 Create TikTok/Instagram content showcasing particle effects")
        
        if success_score < 40:
            recommendations.append("🤝 Partner with crypto influencers for sponsored content")
        
        if metrics['avg_session_spins'] < 3:
            recommendations.append("🎮 Add daily challenges and achievement system")
        
        recommendations.append("🚀 Continue building - you're creating the future of Web3 gaming!")
        
        return recommendations

@app.route('/')
def dashboard():
    """Main analytics dashboard"""
    analytics = BoomBotAnalytics()
    
    real_time = analytics.get_real_time_metrics()
    acquisition = analytics.get_user_acquisition_data()
    engagement = analytics.get_engagement_analytics()
    viral = analytics.get_viral_metrics()
    success = analytics.get_success_indicators()
    
    return render_template('analytics_dashboard.html', 
                         real_time=real_time,
                         acquisition=acquisition,
                         engagement=engagement,
                         viral=viral,
                         success=success,
                         developer=analytics.developer_info)

@app.route('/api/metrics')
def api_metrics():
    """API endpoint for real-time metrics"""
    analytics = BoomBotAnalytics()
    return jsonify(analytics.get_real_time_metrics())

@app.route('/api/success')
def api_success():
    """API endpoint for success indicators"""
    analytics = BoomBotAnalytics()
    return jsonify(analytics.get_success_indicators())

if __name__ == "__main__":
    print("📊 Starting Boombot Analytics Dashboard")
    print("=" * 50)
    print("👨‍💻 Developer: David Okeamah (@okeamah_eth)")
    print("💰 Portfolio: $107K (↗ 28.49%)")
    print("📊 Rank: #91 on 0xppl")
    print("🦊 Bot: @OkeamahBot")
    print("🌐 Dashboard: http://localhost:5000")
    print("=" * 50)
    
    app.run(host='0.0.0.0', port=5000, debug=True)
