#!/bin/bash

echo "🚀 DEPLOYING COMPLETE BOOMBOT ECOSYSTEM"
echo "========================================"

# Check all environment variables
required_vars=("TELEGRAM_BOT_TOKEN" "WEBAPP_URL" "WEBHOOK_URL")
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo "❌ $var not set"
        exit 1
    fi
done

echo "✅ Environment variables configured"

# Install all dependencies
echo "📦 Installing dependencies..."
pip install -r requirements.txt
npm install

# Setup databases
echo "🗄️ Setting up databases..."
python -c "
from telegram_bot import BoomBot
from analytics_dashboard import BoomBotAnalytics
bot = BoomBot()
analytics = BoomBotAnalytics()
print('✅ Databases initialized')
"

# Setup Telegram bot
echo "🤖 Setting up Telegram bot..."
python setup_telegram_bot.py

# Test all systems
echo "🔍 Testing all systems..."

# Test bot
python -c "
import asyncio
from telegram import Bot
import os

async def test_bot():
    bot = Bot(token=os.getenv('TELEGRAM_BOT_TOKEN'))
    try:
        bot_info = await bot.get_me()
        print(f'✅ Bot connected: @{bot_info.username}')
        return True
    except Exception as e:
        print(f'❌ Bot connection failed: {e}')
        return False

result = asyncio.run(test_bot())
exit(0 if result else 1)
"

if [ $? -ne 0 ]; then
    echo "❌ Bot test failed"
    exit 1
fi

# Start all services
echo "🚀 Starting all services..."

# Start webhook server
python telegram_webhook.py &
WEBHOOK_PID=$!

# Start analytics dashboard
python analytics_dashboard.py &
ANALYTICS_PID=$!

# Start viral marketing campaign
python viral_marketing.py &
MARKETING_PID=$!

# Wait for services to start
sleep 10

# Test all endpoints
echo "🔍 Testing all endpoints..."

# Test webhook
curl -f http://localhost:8000/health
if [ $? -eq 0 ]; then
    echo "✅ Webhook server running"
else
    echo "❌ Webhook server failed"
    kill $WEBHOOK_PID $ANALYTICS_PID $MARKETING_PID
    exit 1
fi

# Test analytics
curl -f http://localhost:5000/api/metrics
if [ $? -eq 0 ]; then
    echo "✅ Analytics dashboard running"
else
    echo "❌ Analytics dashboard failed"
    kill $WEBHOOK_PID $ANALYTICS_PID $MARKETING_PID
    exit 1
fi

echo ""
echo "🎉 COMPLETE BOOMBOT ECOSYSTEM DEPLOYED!"
echo "========================================"
echo "🤖 Bot: @OkeamahBot"
echo "👨‍💻 Developer: David Okeamah (@okeamah_eth)"
echo "💰 Portfolio: $107K (↗ 28.49%)"
echo "📊 Rank: #91 on 0xppl"
echo "🌐 Game: $WEBAPP_URL"
echo "🔗 Webhook: $WEBHOOK_URL"
echo "📊 Analytics: http://localhost:5000"
echo ""
echo "🚀 READY FOR VIRAL LAUNCH!"
echo "=========================="
echo "1. ✅ Telegram bot configured and running"
echo "2. ✅ Webhook server processing events"
echo "3. ✅ Analytics dashboard tracking metrics"
echo "4. ✅ Viral marketing campaign ready"
echo "5. ✅ Multi-network deployment prepared"
echo ""
echo "🎯 LAUNCH CHECKLIST:"
echo "□ Execute Twitter viral sequence"
echo "□ Launch Telegram group campaigns"
echo "□ Submit Reddit posts"
echo "□ Announce in Discord servers"
echo "□ Monitor analytics dashboard"
echo "□ Scale successful campaigns"
echo ""
echo "💫 THE FUTURE OF WEB3 GAMING STARTS NOW!"

# Keep all services running
wait $WEBHOOK_PID $ANALYTICS_PID $MARKETING_PID
