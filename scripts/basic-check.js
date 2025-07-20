console.log("🔍 BASIC CHECK STARTING...")

// Check if we have the required environment variables
const hasPrivateKey = !!process.env.PRIVATE_KEY
const hasPolygonRPC = !!process.env.POLYGON_RPC_URL
const hasBscRPC = !!process.env.BSC_RPC_URL
const hasMainnetRPC = !!process.env.MAINNET_RPC_URL

console.log("\n📋 ENVIRONMENT VARIABLES:")
console.log("PRIVATE_KEY:", hasPrivateKey ? "✅ Present" : "❌ Missing")
console.log("POLYGON_RPC_URL:", hasPolygonRPC ? "✅ Present" : "❌ Missing")
console.log("BSC_RPC_URL:", hasBscRPC ? "✅ Present" : "❌ Missing")
console.log("MAINNET_RPC_URL:", hasMainnetRPC ? "✅ Present" : "❌ Missing")

if (!hasPrivateKey) {
  console.log("\n❌ Cannot proceed without PRIVATE_KEY")
  console.log("Please set your PRIVATE_KEY environment variable")
  process.exit(1)
}

if (!hasPolygonRPC && !hasBscRPC && !hasMainnetRPC) {
  console.log("\n❌ No RPC URLs found")
  console.log("Please set at least one RPC URL (POLYGON_RPC_URL, BSC_RPC_URL, or MAINNET_RPC_URL)")
  process.exit(1)
}

// Try to create wallet
try {
  const { ethers } = await import("ethers")

  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY)
  console.log("\n👤 WALLET:")
  console.log("Address:", wallet.address)

  console.log("\n🪙 FLASK APP TOKEN:")
  console.log("Current address: 0x233df63325933fa3f2dac8e695cd84bb2f91ab07")

  // Test one network connection
  if (hasPolygonRPC) {
    console.log("\n🌐 TESTING POLYGON CONNECTION...")
    try {
      const provider = new ethers.JsonRpcProvider(process.env.POLYGON_RPC_URL)
      const blockNumber = await provider.getBlockNumber()
      console.log("✅ Polygon connected, latest block:", blockNumber)

      const balance = await provider.getBalance(wallet.address)
      console.log("Your MATIC balance:", ethers.formatEther(balance))
    } catch (error) {
      console.log("❌ Polygon connection failed:", error.message)
    }
  }

  console.log("\n💡 NEXT STEPS:")
  console.log("1. If connections work, run the token deployment")
  console.log("2. If connections fail, check your RPC URLs")
  console.log("3. Your setup looks ready for token deployment!")
} catch (error) {
  console.log("\n❌ SETUP ERROR:", error.message)
  console.log("This might be a module loading issue")
}

console.log("\n✅ Basic check completed!")
