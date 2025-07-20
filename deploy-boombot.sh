#!/bin/bash

echo "🚀 DEPLOYING BOOMBOT ECOSYSTEM WITH DOCKER COMPOSE"
echo "=================================================="

# Check for required environment variables
REQUIRED_VARS=("TELEGRAM_BOT_TOKEN" "WEBAPP_URL" "WEBHOOK_URL" "PRIVATE_KEY" "TOKEN_ADDRESS" "BASE_RPC_URL")
for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        echo "❌ Error: Environment variable $var is not set."
        echo "Please set all required environment variables before running this script."
        exit 1
    fi
done

echo "✅ All required environment variables are set."

# Create data directory for persistent storage if it doesn't exist
mkdir -p data
echo "✅ Data directory created/ensured."

# Create SSL directory if it doesn't exist (for Nginx)
mkdir -p ssl
echo "✅ SSL directory created/ensured. Remember to place your fullchain.pem and privkey.pem here."

# Build Docker images
echo "➡️  Building images…"
docker compose -f docker-compose.telegram.yml build

# Start Docker containers
echo "🚀  Starting containers…"
docker compose -f docker-compose.telegram.yml up -d

# Check if deployment was successful
if [ $? -eq 0 ]; then
    echo "✅  Deployment running!"
    docker compose -f docker-compose.telegram.yml ps
    echo "==========================================="
    echo "🌐 Your game and bot services are now running."
    echo "   - Game App: Accessible via Nginx (configured domain)"
    echo "   - Telegram Webhook: Accessible via Nginx (configured domain/telegram)"
    echo "   - Analytics Dashboard: http://localhost:5000 (if running locally, otherwise via Nginx)"
    echo ""
    echo "🚀 Next Steps:"
    echo "1. Ensure your domain (e.g., your_domain.com) points to this server's IP."
    echo "2. Place your SSL certificates (fullchain.pem, privkey.pem) in the 'ssl' directory."
    echo "3. Configure your Telegram bot's webhook URL via BotFather to: ${WEBHOOK_URL}"
    echo "4. Run 'python setup_telegram_bot.py' to update bot commands and description."
    echo "5. Start your viral marketing campaign!"
    echo ""
    echo "To stop the services: docker-compose -f docker-compose.telegram.yml down"
else
    echo "❌ DEPLOYMENT FAILED. Please check the logs above for errors."
    exit 1
fi
