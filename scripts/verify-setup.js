const { ethers } = require("hardhat")

async function main() {
  console.log("Verifying Hardhat and environment setup...")

  // Check if Hardhat is connected to a network
  try {
    const network = await ethers.provider.getNetwork()
    console.log(`✅ Connected to network: ${network.name} (Chain ID: ${network.chainId})`)
  } catch (error) {
    console.error("❌ Could not connect to a network. Is your RPC URL configured correctly?")
    console.error(error)
    process.exit(1)
  }

  // Check if a deployer account is available
  try {
    const [deployer] = await ethers.getSigners()
    console.log(`✅ Deployer account found: ${deployer.address}`)
    const balance = await ethers.provider.getBalance(deployer.address)
    console.log(`   Balance: ${ethers.formatEther(balance)} ETH`)
    if (balance < ethers.parseEther("0.0001")) {
      console.warn("   ⚠️ Warning: Deployer account balance is very low. May not be enough for transactions.")
    }
  } catch (error) {
    console.error("❌ No deployer account found. Ensure PRIVATE_KEY is set in your .env file.")
    console.error(error)
    process.exit(1)
  }

  // Check if essential environment variables are set
  const requiredEnvVars = [
    "PRIVATE_KEY",
    "MAINNET_RPC_URL",
    "TOKEN_ADDRESS",
    "TELEGRAM_BOT_TOKEN",
    "WEBAPP_URL",
    "WEBHOOK_URL",
  ]
  let allEnvVarsSet = true
  console("\nChecking essential environment variables:")
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      console.error(`❌ ${envVar} is not set.`)
      allEnvVarsSet = false
    } else {
      console.log(`✅ ${envVar} is set.`)
    }
  }

  if (!allEnvVarsSet) {
    console.error("\n❌ Some essential environment variables are missing. Please check your .env file.")
    process.exit(1)
  } else {
    console.log("\n✅ All essential environment variables are set.")
  }

  console("\nSetup verification complete. Your environment seems ready!")
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
