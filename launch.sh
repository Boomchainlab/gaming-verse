#!/bin/bash

# 🚀 Creator Coin Spin Game - Enhanced Launch Script
# Launch your branded game with all visual effects

echo "🚀🎰🚀🎰🚀🎰🚀🎰🚀🎰🚀🎰🚀🎰🚀🎰🚀🎰🚀"
echo "    CREATOR COIN SPIN - ENHANCED VISUAL EFFECTS"
echo "🚀🎰🚀🎰🚀🎰🚀🎰🚀🎰🚀🎰🚀🎰🚀🎰🚀🎰🚀"
echo ""
echo "🎨 Brand Colors: Pink • Purple • Cyan • Gold"
echo "✨ Features: Particles • Fireworks • Glows • Animations"
echo ""

# Set environment variables for enhanced effects
export ENHANCED_EFFECTS=true
export PARTICLE_COUNT=80
export FIREWORKS_ENABLED=true
export SCREEN_FLASH_ENABLED=true
export WHEEL_GLOW_ENABLED=true
export BUTTON_SHINE_ENABLED=true
export AMBIENT_PARTICLES=true
export BRAND_THEME=default
export ANIMATION_SPEED=normal
export MOBILE_OPTIMIZED=true

# Set the private key
export PRIVATE_KEY="0xf2fb82b350cbf5a09b60a0e89ccbc766c59d1e1a66d9747041f864353b76dfde"

echo "🔧 Enhanced visual effects: ENABLED"
echo "🎨 Brand theme: DEFAULT"
echo "💫 Particle count: 80"
echo "🎆 Fireworks: ENABLED"
echo "⚡ Screen flash: ENABLED"
echo "🌟 Wheel glow: ENABLED"
echo "✨ Button shine: ENABLED"
echo "🌌 Ambient particles: ENABLED"
echo ""

echo "🚀 Starting enhanced game server..."
echo "🌐 Game will be available at: http://localhost:5000"
echo "📱 Mobile-optimized interface: ACTIVE"
echo ""

echo "🎯 EXPERIENCE THESE ENHANCED EFFECTS:"
echo "   • Cosmic animated background with brand colors"
echo "   • Pulsing wheel with 3D glow effects"
echo "   • 80 celebration particles on wins"
echo "   • Firework bursts in your brand colors"
echo "   • Screen flash effects for big wins"
echo "   • Smooth button animations with shine"
echo "   • Branded particle trails and physics"
echo "   • 5 different theme variations"
echo ""

echo "⚡ PRO TIPS:"
echo "   • Try all three spin types (Normal/Mega/Ultra)"
echo "   • Watch for achievement popup animations"
echo "   • Share on social media for bonus effects"
echo "   • Switch themes using the theme selector"
echo ""

echo "🌐 Auto-opening browser in 3 seconds..."
sleep 3

# Open browser (works on most systems)
if command -v xdg-open > /dev/null; then
    xdg-open http://localhost:5000
elif command -v open > /dev/null; then
    open http://localhost:5000
elif command -v start > /dev/null; then
    start http://localhost:5000
fi

echo "🎮 Launching enhanced game..."
echo "=" * 60

# Launch the Python app
python3 app.py
