import fs from "fs"

console.log("🚀 DEPLOYING CREATOR COIN SPIN TO PRODUCTION")
console.log("=" * 60)

// Production configuration
const PRODUCTION_CONFIG = {
  name: "creator-coin-spin",
  description: "🚀 Futuristic spin-to-win game with Creator tokens on Base",
  homepage: "https://creator-coin-spin.vercel.app",
  repository: "https://github.com/yourusername/creator-coin-spin",
  keywords: ["web3", "gaming", "crypto", "base", "tokens", "spin", "win"],
  author: "Your Name",
  license: "MIT",
}

async function deployToProduction() {
  try {
    console.log("📦 Preparing production build...")

    // Create production package.json
    const packageJson = {
      ...PRODUCTION_CONFIG,
      version: "1.0.0",
      main: "app.py",
      scripts: {
        start: "python app.py",
        dev: "python app.py",
        build: "echo 'Build complete'",
        deploy: "vercel --prod",
      },
      dependencies: {
        flask: "^2.3.3",
        web3: "^6.11.0",
      },
      engines: {
        python: "3.9.x",
      },
    }

    fs.writeFileSync("package.json", JSON.stringify(packageJson, null, 2))
    console.log("✅ Package.json created")

    // Create Vercel configuration
    const vercelConfig = {
      name: "creator-coin-spin",
      version: 2,
      builds: [
        {
          src: "app.py",
          use: "@vercel/python",
        },
      ],
      routes: [
        {
          src: "/(.*)",
          dest: "app.py",
        },
      ],
      env: {
        PRIVATE_KEY: "@private_key",
        ENHANCED_EFFECTS: "true",
      },
    }

    fs.writeFileSync("vercel.json", JSON.stringify(vercelConfig, null, 2))
    console.log("✅ Vercel config created")

    // Create requirements.txt for Python
    const requirements = `
Flask==2.3.3
web3==6.11.0
Flask-SQLAlchemy==3.0.5
eth-account==0.9.0
gunicorn==21.2.0
    `.trim()

    fs.writeFileSync("requirements.txt", requirements)
    console.log("✅ Requirements.txt created")

    console.log("\n🌐 DEPLOYMENT OPTIONS:")
    console.log("1. Vercel (Recommended): vercel --prod")
    console.log("2. Railway: railway deploy")
    console.log("3. Render: Connect GitHub repo")
    console.log("4. Heroku: git push heroku main")

    console.log("\n🔧 ENVIRONMENT VARIABLES TO SET:")
    console.log("- PRIVATE_KEY: Your wallet private key")
    console.log("- ENHANCED_EFFECTS: true")
    console.log("- TOKEN_ADDRESS: Your token contract address")

    console.log("\n✅ Production deployment ready!")
  } catch (error) {
    console.error("❌ Deployment preparation failed:", error)
  }
}

deployToProduction()
