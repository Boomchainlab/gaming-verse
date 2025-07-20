// David Okeamah Brand Configuration
const DAVID_OKEAMAH_BRAND = {
  gameName: "Creator Coin Spin",
  tokenName: "Creator Coin",
  tokenSymbol: "SLERF",
  developer: {
    name: "David Okeamah",
    twitter: "@okeamah_eth",
    telegram: "@agunnaya001",
    github: "BoomchainLabs",
    oxppl: "@okeamah_eth",
    portfolioValue: "$107K",
    portfolioChange: "+28.49%",
    rank: "#91",
    verified: true,
    organization: "BoomchainLabs",
  },

  telegramBot: {
    name: "Boombot",
    username: "@OkeamahBot",
    icon: "🦊", // Orange cat-like mascot
    features: ["Creator Coin Spin", "Portfolio tracking", "Game notifications"],
  },

  visualEffects: {
    enabled: true,
    particleCount: 80,
    fireworksEnabled: true,
    screenFlashEnabled: true,
    wheelGlowEnabled: true,
    buttonShineEnabled: true,
    ambientParticles: true,
    animationSpeed: "normal", // 'slow', 'normal', 'fast'
    mobileOptimized: true,
    themes: {
      default: {
        primary: "#FF00FF", // Pink
        secondary: "#8A2BE2", // Blue Violet
        accent: "#00FFFF", // Cyan
        highlight: "#FFD700", // Gold
      },
      pinkPurple: {
        primary: "#FF00FF",
        secondary: "#6A0572",
        accent: "#00FFFF",
        highlight: "#FFD700",
      },
      cyanGreen: {
        primary: "#00FFFF",
        secondary: "#39FF14",
        accent: "#FF00FF",
        highlight: "#FFD700",
      },
      goldBlue: {
        primary: "#FFD700",
        secondary: "#00008B",
        accent: "#FF4500",
        highlight: "#00FFFF",
      },
      silverRed: {
        primary: "#C0C0C0",
        secondary: "#FF0000",
        accent: "#00FFFF",
        highlight: "#FFD700",
      },
    },
  },

  gameplay: {
    referralBonus: 500,
    dailyStreakMultiplier: 1.2,
    socialShareBonus: 100,
    leaderboardRewards: [5000, 3000, 1000],
  },

  social_links: {
    twitter: "https://twitter.com/okeamah_eth",
    telegram: "https://t.me/agunnaya001",
    github: "https://github.com/BoomchainLabs",
    oxppl: "https://0xppl.com/okeamah_eth",
    bot: "https://t.me/OkeamahBot",
  },

  apiEndpoints: {
    player: "/api/player",
    spin: "/api/spin",
    leaderboard: "/api/leaderboard",
    socialShare: "/api/social-share",
    referral: "/api/referral",
  },
}

// Export for use in other files
if (typeof module !== "undefined" && module.exports) {
  module.exports = DAVID_OKEAMAH_BRAND
}
