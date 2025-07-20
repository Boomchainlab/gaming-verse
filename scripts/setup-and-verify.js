const { execSync } = require("child_process")
const path = require("path")

async function main() {
  console.log("🚀 Running full setup and verification for Creator Coin Spin...")
  console.log("======================================================")

  try {
    // Step 1: Install Node.js dependencies
    console("\n📦 Installing Node.js dependencies...")
    execSync("npm install", { stdio: "inherit" })
    console("✅ Node.js dependencies installed.")

    // Step 2: Install Python dependencies
    console("\n🐍 Installing Python dependencies...")
    execSync("pip install -r requirements.txt", { stdio: "inherit" })
    console("✅ Python dependencies installed.")

    // Step 3: Run Hardhat setup verification
    console("\n🔍 Running Hardhat setup verification...")
    execSync("npx hardhat run scripts/verify-setup.js", { stdio: "inherit" })
    console("✅ Hardhat setup verified.")

    // Step 4: Run automated checks
    console("\n🔍 Running automated project checks...")
    execSync("npx hardhat run scripts/auto-check.js", { stdio: "inherit" })
    console("✅ Automated checks completed.")

    // Step 5: Initialize bot database (if not already)
    console("\n🗄️ Initializing bot database...")
    execSync("python -c \"from telegram_bot import BoomBot; bot = BoomBot(); print('✅ Bot database initialized.')\"", {
      stdio: "inherit",
    })
    console("✅ Bot database initialized.")

    // Step 6: Setup Telegram bot commands via API
    console("\n🤖 Setting up Telegram bot commands and description...")
    execSync("python setup_telegram_bot.py", { stdio: "inherit" })
    console("✅ Telegram bot commands and description set.")

    console("\n🎉 Full setup and verification complete! Your project is ready.")
    console("======================================================")
    console("Next steps:")
    console(
      "1. Deploy your smart contract if not already: `npx hardhat run scripts/deploy-token.js --network <your-network>`",
    )
    console("2. Update TOKEN_ADDRESS in your .env with the deployed contract address.")
    console("3. Run the full Docker Compose deployment: `bash deploy-boombot.sh`")
    console("4. Configure your Telegram bot's webhook URL via BotFather to: `YOUR_WEBHOOK_URL`")
    console("5. Start your viral marketing campaign!")
  } catch (error) {
    console.error("\n❌ Setup and verification failed:", error.message)
    process.exit(1)
  }
}

main()
