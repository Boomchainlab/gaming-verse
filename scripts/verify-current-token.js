import { ethers } from "ethers"
const { run } = require("hardhat")

const ERC20_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address account) view returns (uint256)",
  "function owner() view returns (address)",
]

async function verifyCurrentToken() {
  // This is the token address currently in your Flask app
  const CURRENT_TOKEN_ADDRESS = process.env.TOKEN_ADDRESS // Ensure this is set in your .env

  if (!CURRENT_TOKEN_ADDRESS) {
    console.error("Please set TOKEN_ADDRESS in your .env file to verify.")
    process.exit(1)
  }

  console.log("🔍 Verifying current token address from Flask app...")
  console.log(`📍 Token Address: ${CURRENT_TOKEN_ADDRESS}`)

  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY)
  console.log(`👤 Your Wallet: ${wallet.address}`)

  // Networks to check
  const networks = [
    { name: "Ethereum Mainnet", rpc: process.env.MAINNET_RPC_URL },
    { name: "Polygon", rpc: process.env.POLYGON_RPC_URL },
    { name: "BSC", rpc: process.env.BSC_RPC_URL },
  ].filter((n) => n.rpc) // Only include networks with RPC URLs

  let tokenFound = false

  for (const network of networks) {
    console.log(`\n🌐 Checking ${network.name}...`)

    try {
      const provider = new ethers.JsonRpcProvider(network.rpc)

      // Check if address is a contract
      const code = await provider.getCode(CURRENT_TOKEN_ADDRESS)
      const isContract = code !== "0x"

      if (!isContract) {
        console.log(`   ❌ Address is not a contract on ${network.name}`)
        continue
      }

      console.log(`   ✅ Address is a contract on ${network.name}`)

      // Try to interact as ERC-20 token
      const tokenContract = new ethers.Contract(CURRENT_TOKEN_ADDRESS, ERC20_ABI, provider)

      try {
        const name = await tokenContract.name()
        const symbol = await tokenContract.symbol()
        const decimals = await tokenContract.decimals()
        const totalSupply = await tokenContract.totalSupply()

        console.log(`   🪙 Token Details:`)
        console.log(`      Name: ${name}`)
        console.log(`      Symbol: ${symbol}`)
        console.log(`      Decimals: ${decimals}`)
        console.log(`      Total Supply: ${ethers.formatEther(totalSupply)}`)

        // Check your balance
        const yourBalance = await tokenContract.balanceOf(wallet.address)
        console.log(`      Your Balance: ${ethers.formatEther(yourBalance)} ${symbol}`)

        // Check if you have enough for rewards
        const balanceNum = Number.parseFloat(ethers.formatEther(yourBalance))
        if (balanceNum >= 1000) {
          console.log(`   ✅ You have sufficient tokens for rewards`)
        } else {
          console.log(`   ⚠️  Low balance - you may need more tokens for rewards`)
        }

        // Try to get owner
        try {
          const owner = await tokenContract.owner()
          console.log(`      Owner: ${owner}`)

          if (owner.toLowerCase() === wallet.address.toLowerCase()) {
            console.log(`   ✅ You are the owner of this token`)
          } else {
            console.log(`   ⚠️  You are not the owner of this token`)
          }
        } catch (e) {
          console.log(`      Owner: Not available`)
        }

        tokenFound = true
      } catch (error) {
        console.log(`   ❌ Contract exists but is not a valid ERC-20 token: ${error.message}`)
      }
    } catch (error) {
      console.log(`   ❌ Error checking ${network.name}: ${error.message}`)
    }
  }

  console.log("\n📋 VERIFICATION SUMMARY")
  console.log("=".repeat(50))

  if (tokenFound) {
    console.log("✅ Current token address is valid and functional")
    console.log("💡 Your Flask app should work with this token")
    console.log("\n🔧 To test your setup:")
    console.log("1. Make sure your Flask app is running")
    console.log("2. Connect MetaMask to the same network")
    console.log("3. Try spinning the wheel in your game")
  } else {
    console.log("❌ Current token address is not valid on any configured network")
    console.log("\n💡 You have two options:")
    console.log("1. Deploy a new token: run 'node scripts/deploy-token.js'")
    console.log("2. Find and use an existing token address")
    console.log("\n🚨 Your Flask app will not work until you have a valid token address")
  }

  // Verify contract on Etherscan
  const constructorArgs = [] // Add constructor arguments if your token has any

  try {
    await run("verify:verify", {
      address: CURRENT_TOKEN_ADDRESS,
      constructorArguments: constructorArgs,
    })
    console.log("Contract verified successfully!")
  } catch (error) {
    if (error.message.toLowerCase().includes("already verified")) {
      console.log("Contract is already verified!")
    } else {
      console.error("Error verifying contract:", error)
    }
  }
}

verifyCurrentToken()
  .then(() => {
    console.log("\n🏁 Verification completed")
  })
  .catch((error) => {
    console.error("💥 Verification failed:", error)
    process.exit(1)
  })
