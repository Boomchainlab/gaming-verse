console.log("🔍 STARTING SIMPLE TOKEN CHECK...")
console.log("=".repeat(50))

// Check environment variables first
console.log("📋 ENVIRONMENT VARIABLES CHECK:")
console.log("PRIVATE_KEY:", process.env.PRIVATE_KEY ? "✅ Set" : "❌ Missing")
console.log("MAINNET_RPC_URL:", process.env.MAINNET_RPC_URL ? "✅ Set" : "❌ Missing")
console.log("POLYGON_RPC_URL:", process.env.POLYGON_RPC_URL ? "✅ Set" : "❌ Missing")
console.log("BSC_RPC_URL:", process.env.BSC_RPC_URL ? "✅ Set" : "❌ Missing")

if (!process.env.PRIVATE_KEY) {
  console.log("❌ PRIVATE_KEY is required but not set!")
  process.exit(1)
}

// Import ethers after env check
import { ethers } from "ethers"

async function simpleCheck() {
  try {
    console.log("\n👤 WALLET INFO:")
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY)
    console.log("Address:", wallet.address)

    console.log("\n🪙 CURRENT FLASK TOKEN:")
    const FLASK_TOKEN = "0x233df63325933fa3f2dac8e695cd84bb2f91ab07"
    console.log("Address:", FLASK_TOKEN)

    // Simple ERC20 functions
    const ERC20_ABI = [
      "function name() view returns (string)",
      "function symbol() view returns (string)",
      "function balanceOf(address) view returns (uint256)",
    ]

    console.log("\n🌐 NETWORK CHECKS:")

    // Check Polygon if available
    if (process.env.POLYGON_RPC_URL) {
      console.log("\n📡 Checking Polygon...")
      try {
        const provider = new ethers.JsonRpcProvider(process.env.POLYGON_RPC_URL)

        // Check wallet balance
        const balance = await provider.getBalance(wallet.address)
        console.log("Your MATIC balance:", ethers.formatEther(balance))

        // Check if token exists
        const code = await provider.getCode(FLASK_TOKEN)
        if (code !== "0x") {
          console.log("✅ Token contract found on Polygon")

          const contract = new ethers.Contract(FLASK_TOKEN, ERC20_ABI, provider)
          try {
            const name = await contract.name()
            const symbol = await contract.symbol()
            const yourTokens = await contract.balanceOf(wallet.address)

            console.log("Token name:", name)
            console.log("Token symbol:", symbol)
            console.log("Your tokens:", ethers.formatEther(yourTokens))
          } catch (e) {
            console.log("❌ Not a valid ERC20 token")
          }
        } else {
          console.log("❌ Token not found on Polygon")
        }
      } catch (error) {
        console.log("❌ Polygon check failed:", error.message)
      }
    }

    // Check BSC if available
    if (process.env.BSC_RPC_URL) {
      console.log("\n📡 Checking BSC...")
      try {
        const provider = new ethers.JsonRpcProvider(process.env.BSC_RPC_URL)

        const balance = await provider.getBalance(wallet.address)
        console.log("Your BNB balance:", ethers.formatEther(balance))

        const code = await provider.getCode(FLASK_TOKEN)
        if (code !== "0x") {
          console.log("✅ Token contract found on BSC")

          const contract = new ethers.Contract(FLASK_TOKEN, ERC20_ABI, provider)
          try {
            const name = await contract.name()
            const symbol = await contract.symbol()
            const yourTokens = await contract.balanceOf(wallet.address)

            console.log("Token name:", name)
            console.log("Token symbol:", symbol)
            console.log("Your tokens:", ethers.formatEther(yourTokens))
          } catch (e) {
            console.log("❌ Not a valid ERC20 token")
          }
        } else {
          console.log("❌ Token not found on BSC")
        }
      } catch (error) {
        console.log("❌ BSC check failed:", error.message)
      }
    }

    // Check Ethereum if available
    if (process.env.MAINNET_RPC_URL) {
      console.log("\n📡 Checking Ethereum...")
      try {
        const provider = new ethers.JsonRpcProvider(process.env.MAINNET_RPC_URL)

        const balance = await provider.getBalance(wallet.address)
        console.log("Your ETH balance:", ethers.formatEther(balance))

        const code = await provider.getCode(FLASK_TOKEN)
        if (code !== "0x") {
          console.log("✅ Token contract found on Ethereum")

          const contract = new ethers.Contract(FLASK_TOKEN, ERC20_ABI, provider)
          try {
            const name = await contract.name()
            const symbol = await contract.symbol()
            const yourTokens = await contract.balanceOf(wallet.address)

            console.log("Token name:", name)
            console.log("Token symbol:", symbol)
            console.log("Your tokens:", ethers.formatEther(yourTokens))
          } catch (e) {
            console.log("❌ Not a valid ERC20 token")
          }
        } else {
          console.log("❌ Token not found on Ethereum")
        }
      } catch (error) {
        console.log("❌ Ethereum check failed:", error.message)
      }
    }

    console.log("\n📋 SUMMARY:")
    console.log("1. If no tokens were found, you need to deploy one")
    console.log("2. If tokens were found, your Flask app should work")
    console.log("3. Make sure your Flask app uses the same network as your token")
  } catch (error) {
    console.log("❌ Check failed:", error.message)
    console.log("Stack:", error.stack)
  }
}

simpleCheck()
  .then(() => {
    console.log("\n✅ Check completed!")
  })
  .catch((error) => {
    console.log("💥 Fatal error:", error.message)
  })
