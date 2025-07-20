#!/usr/bin/env python3
"""
📊 Creator Coin Spin - Success Tracker
Monitor your game's growth and success metrics
"""

import sqlite3
import json
from datetime import datetime, timedelta
import matplotlib.pyplot as plt
import pandas as pd
from typing import Dict, List

class SuccessTracker:
    def __init__(self):
        self.db_path = 'futuristic_game.db'
        self.metrics = {}
        self.kpis = {
            "daily_active_users": {
                "target": 500,
                "current": 0,
                "unit": "users",
                "description": "Number of unique players active in the last 24 hours."
            },
            "total_spins": {
                "target": 10000,
                "current": 0,
                "unit": "spins",
                "description": "Total number of spins performed across all players."
            },
            "tokens_distributed": {
                "target": 1000000,
                "current": 0,
                "unit": "tokens",
                "description": "Total Creator tokens distributed as rewards."
            },
            "viral_coefficient": {
                "target": 1.2,
                "current": 0.0,
                "unit": "x",
                "description": "Average number of new users brought in by an existing user."
            },
            "daily_retention_rate": {
                "target": 40, # percentage
                "current": 0.0,
                "unit": "%",
                "description": "Percentage of new users who return the next day."
            },
            "social_shares": {
                "target": 100,
                "current": 0,
                "unit": "shares",
                "description": "Total social media shares recorded."
            }
        }
        self.milestones = [
            {"name": "First 100 Users", "kpi": "daily_active_users", "value": 100, "achieved": False},
            {"name": "10K Spins", "kpi": "total_spins", "value": 10000, "achieved": False},
            {"name": "Viral Loop Initiated", "kpi": "viral_coefficient", "value": 1.0, "achieved": False},
            {"name": "1M Tokens Distributed", "kpi": "tokens_distributed", "value": 1000000, "achieved": False}
        ]
        self.last_update = datetime.now()
    
    def track_daily_metrics(self):
        """Track daily success metrics"""
        conn = sqlite3.connect(self.db_path)
        
        # Daily active users
        today = datetime.now().date()
        dau_query = """
        SELECT COUNT(DISTINCT player_address) as daily_active_users
        FROM spin_result 
        WHERE DATE(timestamp) = ?
        """
        dau = conn.execute(dau_query, (today,)).fetchone()[0]
        self.kpis['daily_active_users']['current'] = dau
        
        # Daily revenue (tokens distributed)
        revenue_query = """
        SELECT SUM(reward_amount) as daily_tokens_distributed
        FROM spin_result 
        WHERE DATE(timestamp) = ?
        """
        daily_tokens = conn.execute(revenue_query, (today,)).fetchone()[0] or 0
        self.kpis['tokens_distributed']['current'] = daily_tokens
        
        # New users today
        new_users_query = """
        SELECT COUNT(*) as new_users
        FROM player 
        WHERE DATE(created_at) = ?
        """
        new_users = conn.execute(new_users_query, (today,)).fetchone()[0]
        
        # Total spins today
        spins_query = """
        SELECT COUNT(*) as daily_spins
        FROM spin_result 
        WHERE DATE(timestamp) = ?
        """
        daily_spins = conn.execute(spins_query, (today,)).fetchone()[0]
        self.kpis['total_spins']['current'] = daily_spins
        
        # Calculate viral coefficient
        viral_query = """
        SELECT COUNT(DISTINCT referrer_address) as referrer_count
        FROM referral
        WHERE DATE(referral_date) = ?
        """
        referrer_count = conn.execute(viral_query, (today,)).fetchone()[0] or 0
        self.kpis['viral_coefficient']['current'] = referrer_count / max(dau, 1)
        
        # Calculate daily retention rate
        retention_query = """
        SELECT COUNT(DISTINCT player_address) as retained_users
        FROM spin_result s1
        WHERE EXISTS (
            SELECT 1 FROM spin_result s2 
            WHERE s2.player_address = s1.player_address 
            AND DATE(s2.timestamp) = DATE(s1.timestamp) + INTERVAL 1 DAY
        )
        """
        retained_users = conn.execute(retention_query).fetchone()[0]
        self.kpis['daily_retention_rate']['current'] = (retained_users / max(dau, 1)) * 100
        
        # Calculate social shares
        social_shares_query = """
        SELECT COUNT(*) as social_shares
        FROM social_share
        WHERE DATE(share_date) = ?
        """
        social_shares = conn.execute(social_shares_query, (today,)).fetchone()[0]
        self.kpis['social_shares']['current'] = social_shares
        
        conn.close()
        
        return {
            'date': str(today),
            'daily_active_users': dau,
            'daily_tokens_distributed': daily_tokens,
            'new_users': new_users,
            'daily_spins': daily_spins,
            'avg_tokens_per_user': daily_tokens / max(dau, 1),
            'avg_spins_per_user': daily_spins / max(dau, 1),
            'viral_coefficient': self.kpis['viral_coefficient']['current'],
            'daily_retention_rate': self.kpis['daily_retention_rate']['current'],
            'social_shares': self.kpis['social_shares']['current']
        }
    
    def track_growth_metrics(self):
        """Track overall growth metrics"""
        conn = sqlite3.connect(self.db_path)
        
        # Total users
        total_users = conn.execute("SELECT COUNT(*) FROM player").fetchone()[0]
        self.kpis['daily_active_users']['current'] = total_users
        
        # Total tokens distributed
        total_tokens = conn.execute("SELECT SUM(reward_amount) FROM spin_result").fetchone()[0] or 0
        self.kpis['tokens_distributed']['current'] = total_tokens
        
        # Total spins
        total_spins = conn.execute("SELECT COUNT(*) FROM spin_result").fetchone()[0]
        self.kpis['total_spins']['current'] = total_spins
        
        # Average session length (estimated)
        avg_session = conn.execute("""
        SELECT AVG(session_spins) FROM (
            SELECT player_address, COUNT(*) as session_spins
            FROM spin_result 
            GROUP BY player_address, DATE(timestamp)
        )
        """).fetchone()[0] or 0
        
        # Retention rate (users who came back)
        retention_query = """
        SELECT COUNT(DISTINCT player_address) as retained_users
        FROM spin_result s1
        WHERE EXISTS (
            SELECT 1 FROM spin_result s2 
            WHERE s2.player_address = s1.player_address 
            AND DATE(s2.timestamp) > DATE(s1.timestamp)
        )
        """
        retained_users = conn.execute(retention_query).fetchone()[0]
        retention_rate = (retained_users / max(total_users, 1)) * 100
        
        conn.close()
        
        return {
            'total_users': total_users,
            'total_tokens_distributed': total_tokens,
            'total_spins': total_spins,
            'avg_session_length': round(avg_session, 2),
            'retention_rate': round(retention_rate, 2),
            'avg_tokens_per_user': total_tokens / max(total_users, 1),
            'avg_spins_per_user': total_spins / max(total_users, 1)
        }
    
    def generate_success_report(self):
        """Generate comprehensive success report"""
        daily = self.track_daily_metrics()
        growth = self.track_growth_metrics()
        
        report = {
            'timestamp': datetime.now().isoformat(),
            'daily_metrics': daily,
            'growth_metrics': growth,
            'kpis': self.kpis,
            'milestones': self.check_milestones(),
            'success_indicators': self.calculate_success_indicators(daily, growth),
            'recommendations': self.generate_recommendations(daily, growth)
        }
        
        return report
    
    def check_milestones(self):
        """Check if any milestones have been achieved"""
        for milestone in self.milestones:
            if self.kpis[milestone['kpi']]['current'] >= milestone['value']:
                milestone['achieved'] = True
        return self.milestones
    
    def calculate_success_indicators(self, daily, growth):
        """Calculate key success indicators"""
        indicators = {}
        
        # Growth rate (if we have historical data)
        indicators['user_growth_rate'] = 'N/A'  # Would need historical data
        
        # Engagement score (spins per user)
        engagement = growth['avg_spins_per_user']
        if engagement >= 10:
            indicators['engagement_level'] = 'Excellent'
        elif engagement >= 5:
            indicators['engagement_level'] = 'Good'
        elif engagement >= 2:
            indicators['engagement_level'] = 'Fair'
        else:
            indicators['engagement_level'] = 'Needs Improvement'
        
        # Retention score
        retention = growth['retention_rate']
        if retention >= 40:
            indicators['retention_level'] = 'Excellent'
        elif retention >= 25:
            indicators['retention_level'] = 'Good'
        elif retention >= 15:
            indicators['retention_level'] = 'Fair'
        else:
            indicators['retention_level'] = 'Needs Improvement'
        
        # Overall success score
        success_score = 0
        if growth['total_users'] >= 1000:
            success_score += 25
        elif growth['total_users'] >= 100:
            success_score += 15
        elif growth['total_users'] >= 10:
            success_score += 5
        
        if retention >= 25:
            success_score += 25
        elif retention >= 15:
            success_score += 15
        elif retention >= 10:
            success_score += 5
        
        if engagement >= 5:
            success_score += 25
        elif engagement >= 3:
            success_score += 15
        elif engagement >= 1:
            success_score += 5
        
        if growth['total_tokens_distributed'] >= 1000000:
            success_score += 25
        elif growth['total_tokens_distributed'] >= 100000:
            success_score += 15
        elif growth['total_tokens_distributed'] >= 10000:
            success_score += 5
        
        indicators['overall_success_score'] = f"{success_score}/100"
        
        if success_score >= 80:
            indicators['success_level'] = 'Viral Success! 🚀'
        elif success_score >= 60:
            indicators['success_level'] = 'Strong Growth 📈'
        elif success_score >= 40:
            indicators['success_level'] = 'Good Progress ✅'
        elif success_score >= 20:
            indicators['success_level'] = 'Early Stage 🌱'
        else:
            indicators['success_level'] = 'Just Getting Started 🎯'
        
        return indicators
    
    def generate_recommendations(self, daily, growth):
        """Generate actionable recommendations"""
        recommendations = []
        
        # User acquisition recommendations
        if growth['total_users'] < 100:
            recommendations.append({
                'category': 'User Acquisition',
                'priority': 'High',
                'action': 'Launch aggressive social media campaign',
                'details': 'Post in 20+ crypto communities, reach out to 10 influencers'
            })
        
        # Retention recommendations
        if growth['retention_rate'] < 25:
            recommendations.append({
                'category': 'Retention',
                'priority': 'High', 
                'action': 'Add daily rewards and streak bonuses',
                'details': 'Implement daily login bonuses and achievement system'
            })
        
        # Engagement recommendations
        if growth['avg_spins_per_user'] < 3:
            recommendations.append({
                'category': 'Engagement',
                'priority': 'Medium',
                'action': 'Add more game modes and features',
                'details': 'Consider tournaments, challenges, or mini-games'
            })
        
        # Monetization recommendations
        if growth['total_tokens_distributed'] > 100000:
            recommendations.append({
                'category': 'Monetization',
                'priority': 'Medium',
                'action': 'Introduce premium features',
                'details': 'Add paid spins, VIP tiers, or exclusive rewards'
            })
        
        # Viral growth recommendations
        if daily['daily_active_users'] > 50:
            recommendations.append({
                'category': 'Viral Growth',
                'priority': 'High',
                'action': 'Launch referral program',
                'details': 'Offer significant bonuses for successful referrals'
            })
        
        return recommendations
    
    def save_report(self, report):
        """Save success report to file"""
        filename = f"success_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(filename, 'w') as f:
            json.dump(report, f, indent=2)
        
        print(f"📊 Success report saved to {filename}")
        return filename

def main():
    print("📊 CREATOR COIN SPIN - SUCCESS TRACKER")
    print("=" * 60)
    
    tracker = SuccessTracker()
    report = tracker.generate_success_report()
    
    print("📈 DAILY METRICS:")
    daily = report['daily_metrics']
    print(f"   • Daily Active Users: {daily['daily_active_users']}")
    print(f"   • New Users Today: {daily['new_users']}")
    print(f"   • Daily Spins: {daily['daily_spins']}")
    print(f"   • Tokens Distributed: {daily['daily_tokens_distributed']:,}")
    print(f"   • Viral Coefficient: {daily['viral_coefficient']:.2f}")
    print(f"   • Daily Retention Rate: {daily['daily_retention_rate']}%")
    print(f"   • Social Shares: {daily['social_shares']}")
    
    print("\n🚀 GROWTH METRICS:")
    growth = report['growth_metrics']
    print(f"   • Total Users: {growth['total_users']:,}")
    print(f"   • Total Spins: {growth['total_spins']:,}")
    print(f"   • Total Tokens: {growth['total_tokens_distributed']:,}")
    print(f"   • Retention Rate: {growth['retention_rate']}%")
    print(f"   • Avg Spins/User: {growth['avg_spins_per_user']:.1f}")
    
    print("\n🎯 SUCCESS INDICATORS:")
    indicators = report['success_indicators']
    print(f"   • Success Level: {indicators['success_level']}")
    print(f"   • Overall Score: {indicators['overall_success_score']}")
    print(f"   • Engagement: {indicators['engagement_level']}")
    print(f"   • Retention: {indicators['retention_level']}")
    
    print("\n💡 RECOMMENDATIONS:")
    for i, rec in enumerate(report['recommendations'], 1):
        print(f"   {i}. [{rec['priority']}] {rec['action']}")
        print(f"      {rec['details']}")
    
    # Save report
    filename = tracker.save_report(report)
    print(f"\n✅ Full report saved to {filename}")

if __name__ == "__main__":
    main()
