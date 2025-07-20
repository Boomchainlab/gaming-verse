#!/usr/bin/env python3
"""
🎨 Quick Visual Effects Demo
Launch a demo version to experience all enhanced effects
"""

import os
import webbrowser
import time
from flask import Flask, render_template

# Set up enhanced environment
os.environ['PRIVATE_KEY'] = '0xf2fb82b350cbf5a09b60a0e89ccbc766c59d1e1a66d9747041f864353b76dfde'
os.environ['ENHANCED_EFFECTS'] = 'true'

app = Flask(__name__)

@app.route('/')
def demo():
    return render_template('enhanced-demo.html')

@app.route('/full-game')
def full_game():
    return render_template('futuristic_game.html')

def main():
    print("🎨" * 30)
    print("    CREATOR COIN SPIN - VISUAL EFFECTS DEMO")
    print("🎨" * 30)
    print()
    print("🚀 Features to Experience:")
    print("   ✨ Brand Colors: Pink, Purple, Cyan, Gold")
    print("   🌌 Cosmic Background Animation")
    print("   🎡 Pulsing Wheel with 3D Effects")
    print("   🎆 80 Celebration Particles")
    print("   🔥 Firework Bursts")
    print("   ⚡ Screen Flash Effects")
    print("   🌈 5 Different Themes")
    print("   📱 Mobile Optimized")
    print()
    print("🎮 Demo Controls:")
    print("   • Click 'DEMO SPIN' buttons to see effects")
    print("   • Use theme switcher (top right)")
    print("   • Try demo controls (bottom right)")
    print("   • Watch the effects showcase (bottom left)")
    print()
    print("🌐 Opening demo in browser...")
    
    # Auto-open browser
    time.sleep(2)
    webbrowser.open('http://localhost:5000')
    
    print("🚀 Demo server starting...")
    app.run(host="0.0.0.0", port=5000, debug=False)

if __name__ == "__main__":
    main()
