const { ethers } = require("hardhat")

async function main() {
  console.log("Running automated checks for the SlerfToken project...")

  // 1. Check network connection
  const network = await ethers.provider.getNetwork()
  console.log(`\n1. Connected to network: ${network.name} (Chain ID: ${network.chainId})`)

  // 2. Check deployer account balance
  const [deployer] = await ethers.getSigners()
  const deployerBalance = await ethers.provider.getBalance(deployer.address)
  console.log(`2. Deployer (${deployer.address}) balance: ${ethers.formatEther(deployerBalance)} ETH`)
  if (deployerBalance < ethers.parseEther("0.001")) {
    console.warn("   ⚠️ Warning: Deployer balance is low. May not be enough for transactions.")
  }

  // 3. Check if TOKEN_ADDRESS is set and valid
  const tokenAddress = process.env.TOKEN_ADDRESS
  if (tokenAddress) {
    try {
      const SlerfToken = await ethers.getContractFactory("SlerfToken")
      const slerfToken = SlerfToken.attach(tokenAddress)
      const name = await slerfToken.name()
      const symbol = await slerfToken.symbol()
      const totalSupply = await slerfToken.totalSupply()
      console.log(`3. ✅ SlerfToken found at ${tokenAddress}`)
      console.log(`   Name: ${name}, Symbol: ${symbol}, Total Supply: ${ethers.formatUnits(totalSupply, 18)}`)
    } catch (error) {
      console.error(`3. ❌ SlerfToken not found or invalid at ${tokenAddress}: ${error.message}`)
    }
  } else {
    console.log("3. ℹ️ TOKEN_ADDRESS not set in .env. Skipping SlerfToken contract check.")
  }

  // 4. Check if required environment variables are set for the game (example)
  const requiredGameEnvVars = ["PRIVATE_KEY", "TOKEN_ADDRESS", "BASE_RPC_URL"]
  let allGameEnvVarsSet = true
  console("\n4. Checking game environment variables:")
  for (const envVar of requiredGameEnvVars) {
    if (!process.env[envVar]) {
      console.error(`   ❌ ${envVar} is not set.`)
      allGameEnvVarsSet = false
    } else {
      console.log(`   ✅ ${envVar} is set.`)
    }
  }
  if (allGameEnvVarsSet) {
    console.log("   All essential game environment variables are set.")
  } else {
    console.warn("   ⚠️ Some game environment variables are missing. Game might not function correctly.")
  }

  // 5. Check if Telegram bot environment variables are set (example)
  const requiredBotEnvVars = ["TELEGRAM_BOT_TOKEN", "WEBAPP_URL", "WEBHOOK_URL"]
  let allBotEnvVarsSet = true
  console("\n5. Checking Telegram bot environment variables:")
  for (const envVar of requiredBotEnvVars) {
    if (!process.env[envVar]) {
      console.error(`   ❌ ${envVar} is not set.`)
      allBotEnvVarsSet = false
    } else {
      console.log(`   ✅ ${envVar} is set.`)
    }
  }
  if (allBotEnvVarsSet) {
    console.log("   All essential Telegram bot environment variables are set.")
  } else {
    console.warn("   ⚠️ Some Telegram bot environment variables are missing. Bot might not function correctly.")
  }

  console("\nAutomated checks complete. Review the output for any warnings or errors.")
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
