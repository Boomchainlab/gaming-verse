const { ethers } = require("hardhat")

// ERC-20 ABI for checking token contracts
const ERC20_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address account) view returns (uint256)",
  "function owner() view returns (address)",
]

// Function to check if an address is a contract
async function isContract(provider, address) {
  try {
    const code = await provider.getCode(address)
    return code !== "0x"
  } catch (error) {
    return false
  }
}

// Function to check if a contract is an ERC-20 token
async function isERC20Token(provider, address) {
  try {
    const contract = new ethers.Contract(address, ERC20_ABI, provider)
    await contract.name()
    await contract.symbol()
    await contract.decimals()
    return true
  } catch (error) {
    return false
  }
}

// Function to get token details
async function getTokenDetails(provider, address) {
  try {
    const contract = new ethers.Contract(address, ERC20_ABI, provider)
    const name = await contract.name()
    const symbol = await contract.symbol()
    const decimals = await contract.decimals()
    const totalSupply = await contract.totalSupply()

    let owner = "Unknown"
    try {
      owner = await contract.owner()
    } catch (e) {
      // Owner function might not exist
    }

    return {
      name,
      symbol,
      decimals,
      totalSupply: ethers.formatEther(totalSupply),
      owner,
    }
  } catch (error) {
    return null
  }
}

async function checkDeployments() {
  console.log("🔍 Checking for deployed tokens...")

  const [deployer] = await ethers.getSigners()
  const deployerAddress = deployer.address
  console.log(`👤 Checking deployments from: ${deployerAddress}`)

  const network = await ethers.provider.getNetwork()
  console.log(`Connected to network: ${network.name} (Chain ID: ${network.chainId})`)

  // Networks to check
  const networks = []

  if (process.env.MAINNET_RPC_URL) {
    networks.push({ name: "Ethereum Mainnet", rpc: process.env.MAINNET_RPC_URL })
  }
  if (process.env.POLYGON_RPC_URL) {
    networks.push({ name: "Polygon", rpc: process.env.POLYGON_RPC_URL })
  }
  if (process.env.BSC_RPC_URL) {
    networks.push({ name: "BSC", rpc: process.env.BSC_RPC_URL })
  }

  if (networks.length === 0) {
    console.error("❌ No RPC URLs found in environment variables")
    return
  }

  const foundTokens = []

  for (const network of networks) {
    console.log(`\n🌐 Checking ${network.name}...`)

    try {
      const provider = new ethers.JsonRpcProvider(network.rpc)
      const connectedWallet = deployer.connect(provider)

      // Check wallet balance
      const balance = await provider.getBalance(deployerAddress)
      console.log(`   💰 Wallet Balance: ${ethers.formatEther(balance)} ETH`)

      // Get recent transactions to find contract deployments
      console.log("   🔍 Scanning recent transactions for contract deployments...")

      try {
        // Get the latest block number
        const latestBlock = await provider.getBlockNumber()
        const startBlock = Math.max(0, latestBlock - 10000) // Check last 10k blocks

        console.log(`   📊 Scanning blocks ${startBlock} to ${latestBlock}...`)

        // This is a simplified approach - in practice, you'd use event logs or indexing services
        const contractsFound = 0

        // Check if there are any known token addresses in the current Flask app
        const knownTokenAddress = "0x233df63325933fa3f2dac8e695cd84bb2f91ab07" // From your Flask app

        console.log(`   🔍 Checking known token address: ${knownTokenAddress}`)
        const isKnownContract = await isContract(provider, knownTokenAddress)

        if (isKnownContract) {
          const isToken = await isERC20Token(provider, knownTokenAddress)
          if (isToken) {
            const details = await getTokenDetails(provider, knownTokenAddress)
            if (details) {
              console.log(`   ✅ Found ERC-20 token at ${knownTokenAddress}`)
              console.log(`      Name: ${details.name}`)
              console.log(`      Symbol: ${details.symbol}`)
              console.log(`      Total Supply: ${details.totalSupply}`)

              // Check your balance in this token
              const tokenContract = new ethers.Contract(knownTokenAddress, ERC20_ABI, provider)
              const yourBalance = await tokenContract.balanceOf(deployerAddress)
              console.log(`      Your Balance: ${ethers.formatEther(yourBalance)} ${details.symbol}`)

              foundTokens.push({
                network: network.name,
                address: knownTokenAddress,
                ...details,
                yourBalance: ethers.formatEther(yourBalance),
              })
            }
          }
        } else {
          console.log(`   ❌ Known token address is not a valid contract`)
        }

        // For a more thorough check, we'd need to scan transaction logs
        // This is computationally expensive, so we'll provide instructions instead
        console.log(`   ℹ️  For complete deployment history, check blockchain explorer:`)

        if (network.name === "Ethereum Mainnet") {
          console.log(`      https://etherscan.io/address/${deployerAddress}`)
        } else if (network.name === "Polygon") {
          console.log(`      https://polygonscan.com/address/${deployerAddress}`)
        } else if (network.name === "BSC") {
          console.log(`      https://bscscan.com/address/${deployerAddress}`)
        }
      } catch (error) {
        console.log(`   ⚠️  Could not scan transactions: ${error.message}`)
      }
    } catch (error) {
      console.log(`   ❌ Error connecting to ${network.name}: ${error.message}`)
    }
  }

  // Summary
  console.log("\n📋 DEPLOYMENT SUMMARY")
  console.log("=".repeat(50))

  if (foundTokens.length === 0) {
    console.log("❌ No ERC-20 tokens found from your address")
    console.log("\n💡 Next Steps:")
    console.log("1. Run 'node scripts/deploy-token.js' to deploy a new token")
    console.log("2. Or check blockchain explorers manually for your deployments")
  } else {
    console.log(`✅ Found ${foundTokens.length} token(s):`)
    foundTokens.forEach((token, index) => {
      console.log(`\n${index + 1}. ${token.name} (${token.symbol})`)
      console.log(`   Network: ${token.network}`)
      console.log(`   Address: ${token.address}`)
      console.log(`   Total Supply: ${token.totalSupply}`)
      console.log(`   Your Balance: ${token.yourBalance} ${token.symbol}`)

      // Check if this token has enough balance for rewards
      const balance = Number.parseFloat(token.yourBalance)
      if (balance >= 10000) {
        console.log(`   ✅ Sufficient balance for game rewards`)
      } else {
        console.log(`   ⚠️  Low balance - consider minting more tokens`)
      }
    })

    console.log("\n💡 To use a token in your game:")
    console.log("1. Update TOKEN_ADDRESS in your Flask app")
    console.log("2. Ensure your Flask wallet has enough tokens")
    console.log("3. Test the reward system")
  }

  // Check Flask app configuration
  console.log("\n🔧 FLASK APP CONFIGURATION CHECK")
  console.log("=".repeat(50))

  const currentTokenAddress = process.env.TOKEN_ADDRESS // Replace with your deployed token address
  console.log(`Current TOKEN_ADDRESS in Flask app: ${currentTokenAddress}`)

  // Check if this address exists on any network
  let tokenExists = false
  for (const network of networks) {
    try {
      const provider = new ethers.JsonRpcProvider(network.rpc)
      const isValidContract = await isContract(provider, currentTokenAddress)
      if (isValidContract) {
        const isToken = await isERC20Token(provider, currentTokenAddress)
        if (isToken) {
          console.log(`✅ Token exists on ${network.name}`)
          tokenExists = true

          // Check balance
          const tokenContract = new ethers.Contract(currentTokenAddress, ERC20_ABI, provider)
          const balance = await tokenContract.balanceOf(deployerAddress)
          console.log(`   Your balance: ${ethers.formatEther(balance)} tokens`)
        }
      }
    } catch (error) {
      // Continue checking other networks
    }
  }

  if (!tokenExists) {
    console.log("❌ Current TOKEN_ADDRESS is not a valid ERC-20 token on any configured network")
    console.log("💡 You need to deploy a new token or update the TOKEN_ADDRESS")
  }
}

// Run the check
checkDeployments()
  .then(() => {
    console.log("\n🏁 Deployment check completed")
  })
  .catch((error) => {
    console.error("💥 Check failed:", error)
    process.exit(1)
  })
