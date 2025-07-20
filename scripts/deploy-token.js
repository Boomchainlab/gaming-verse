const { ethers } = require("hardhat")

async function deployToken() {
  console.log("🚀 Starting token deployment...")

  // Choose network based on available environment variables
  let provider, networkName

  if (process.env.POLYGON_RPC_URL) {
    provider = new ethers.JsonRpcProvider(process.env.POLYGON_RPC_URL)
    networkName = "Polygon"
  } else if (process.env.BSC_RPC_URL) {
    provider = new ethers.JsonRpcProvider(process.env.BSC_RPC_URL)
    networkName = "BSC"
  } else if (process.env.MAINNET_RPC_URL) {
    provider = new ethers.JsonRpcProvider(process.env.MAINNET_RPC_URL)
    networkName = "Ethereum"
  } else {
    throw new Error("No RPC URL found in environment variables")
  }

  console.log(`📡 Connecting to ${networkName} network...`)

  // Create wallet from private key
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider)
  console.log(`👤 Deployer address: ${wallet.address}`)

  // Check balance
  const balance = await provider.getBalance(wallet.address)
  console.log(`💰 Balance: ${ethers.formatEther(balance)} ETH`)

  if (balance === 0n) {
    throw new Error("Insufficient balance for deployment")
  }

  // Deploy token contract
  const initialSupply = ethers.parseUnits("1000000000", 18) // 1 Billion tokens
  console.log(`🪙 Deploying SlerfToken with ${ethers.formatUnits(initialSupply, 18)} initial supply...`)

  try {
    // Create contract factory
    const SlerfToken = await ethers.getContractFactory("SlerfToken", wallet)

    // Deploy with initial supply
    const slerfToken = await SlerfToken.deploy(initialSupply)

    console.log(`⏳ Transaction sent: ${slerfToken.deploymentTransaction().hash}`)
    console.log("⏳ Waiting for confirmation...")

    // Wait for deployment
    await slerfToken.waitForDeployment()
    const contractAddress = await slerfToken.getAddress()

    console.log("✅ Token deployed successfully!")
    console.log(`📍 Contract Address: ${contractAddress}`)

    // Get token details
    const name = await slerfToken.name()
    const symbol = await slerfToken.symbol()
    const decimals = await slerfToken.decimals()
    const totalSupply = await slerfToken.totalSupply()
    const ownerBalance = await slerfToken.balanceOf(wallet.address)

    console.log("\n📊 Token Details:")
    console.log(`   Name: ${name}`)
    console.log(`   Symbol: ${symbol}`)
    console.log(`   Decimals: ${decimals}`)
    console.log(`   Total Supply: ${ethers.formatUnits(totalSupply, 18)} ${symbol}`)
    console.log(`   Owner Balance: ${ethers.formatUnits(ownerBalance, 18)} ${symbol}`)

    console.log("\n🔧 Next Steps:")
    console.log(`1. Update your Flask app's TOKEN_ADDRESS to: ${contractAddress}`)
    console.log(
      `2. Your Flask app wallet (${wallet.address}) now has ${ethers.formatUnits(ownerBalance, 18)} ${symbol} tokens`,
    )
    console.log("3. You can now use this token in your Slerf Spin game!")

    return {
      contractAddress,
      name,
      symbol,
      totalSupply: totalSupply.toString(),
      deployerAddress: wallet.address,
      network: networkName,
    }
  } catch (error) {
    console.error("❌ Deployment failed:", error.message)
    throw error
  }
}

// Run deployment
deployToken()
  .then((result) => {
    console.log("\n🎉 Deployment completed successfully!")
    console.log("📋 Summary:", JSON.stringify(result, null, 2))
  })
  .catch((error) => {
    console.error("💥 Deployment failed:", error)
    process.exit(1)
  })
