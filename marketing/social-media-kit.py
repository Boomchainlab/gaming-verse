#!/usr/bin/env python3
"""
Creator Coin Spin Game - Social Media Marketing Kit
Generate content for various social platforms
"""

import json
import datetime
from typing import Dict, List

class SocialMediaKit:
    def __init__(self):
        self.game_info = {
            "name": "Creator Coin Spin",
            "tagline": "Spin to win real Creator tokens on Base!",
            "features": [
                "Stunning particle effects",
                "Real Creator token rewards",
                "Daily free spins",
                "Achievements & Leaderboards",
                "Mobile optimized"
            ],
            "hashtags": ["#Web3Gaming", "#CreatorCoin", "#BaseNetwork", "#PlayToEarn", "#CryptoGame"],
            "call_to_action": "Play now at [YOUR_GAME_URL]",
            "developer_handle": "@your_dev_handle" # Placeholder
        }

    def generate_tweet(self) -> str:
        """Generates a generic launch tweet."""
        features_str = ", ".join(self.game_info["features"])
        hashtags_str = " ".join(self.game_info["hashtags"])
        
        tweet = f"""
🚀 Announcing {self.game_info["name"]}! 🎰
{self.game_info["tagline"]}

✨ Features include: {features_str}.
💰 Win real Creator tokens!
{self.game_info["call_to_action"]}

Follow {self.game_info["developer_handle"]} for updates!
{hashtags_str}
        """
        return tweet.strip()

    def generate_facebook_post(self) -> str:
        """Generates a generic Facebook post."""
        features_list = "\n".join([f"- {f}" for f in self.game_info["features"]])
        
        post = f"""
🎉 We're thrilled to announce the launch of {self.game_info["name"]}! 🎉

Get ready to spin and win real Creator tokens on the Base network! This isn't just another game; it's an experience designed for the future of Web3 gaming.

Key Features:
{features_list}

Join our community and start earning today!
👉 {self.game_info["call_to_action"]}

#Web3Gaming #CreatorCoin #BaseNetwork #PlayToEarn #CryptoGame #BlockchainGaming
        """
        return post.strip()

    def generate_instagram_caption(self) -> str:
        """Generates a generic Instagram caption."""
        hashtags_str = " ".join(self.game_info["hashtags"])
        
        caption = f"""
🚀 {self.game_info["name"]} is LIVE! 🎰
Spin to win real Creator tokens on Base! ✨
Stunning visuals, daily rewards, and endless fun.

Link in bio to play!
{hashtags_str} #Gaming #Crypto
        """
        return caption.strip()

    def generate_press_release_snippet(self) -> str:
        """Generates a snippet for a press release."""
        return f"""
FOR IMMEDIATE RELEASE

[DATE] – [Your Company Name/Developer Name] today announced the launch of **{self.game_info["name"]}**, a groundbreaking Web3 game designed to offer players a visually stunning and rewarding experience on the Base network. Players can spin to win real Creator tokens, engage in daily challenges, and climb global leaderboards.

"{self.game_info["tagline"]}" says [Your Name/CEO Name]. "We believe {self.game_info["name"]} sets a new standard for play-to-earn games with its immersive graphics and seamless blockchain integration."

Key features include: {', '.join(self.game_info["features"])}.

Play now at {self.game_info["call_to_action"].replace("Play now at ", "")}.
        """

    def generate_all_content(self) -> Dict[str, str]:
        """Generates all social media content."""
        return {
            "tweet": self.generate_tweet(),
            "facebook_post": self.generate_facebook_post(),
            "instagram_caption": self.generate_instagram_caption(),
            "press_release_snippet": self.generate_press_release_snippet()
        }

if __name__ == "__main__":
    kit = SocialMediaKit()
    content = kit.generate_all_content()

    print("--- Twitter ---")
    print(content["tweet"])
    print("\n--- Facebook ---")
    print(content["facebook_post"])
    print("\n--- Instagram ---")
    print(content["instagram_caption"])
    print("\n--- Press Release Snippet ---")
    print(content["press_release_snippet"])
    print("\nRemember to replace placeholders like [YOUR_GAME_URL] and [Your Company Name/Developer Name]!")
