const { ethers } = require("hardhat")

// ERC-20 ABI for transfer function
const ERC20_ABI = [
  "function transfer(address to, uint256 amount) returns (bool)",
  "function balanceOf(address account) view returns (uint256)",
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
]

async function transferTokens() {
  console.log("💸 Starting token transfer...")

  // Configuration - Update these values
  const TOKEN_ADDRESS = process.env.TOKEN_ADDRESS // Replace with deployed token address
  const RECIPIENT_ADDRESS = process.env.RECIPIENT_ADDRESS // Replace with Flask app wallet
  const TRANSFER_AMOUNT = process.env.TRANSFER_AMOUNT // Amount in tokens (not wei)

  if (!TOKEN_ADDRESS || !RECIPIENT_ADDRESS || !TRANSFER_AMOUNT) {
    console.error("❌ Please update TOKEN_ADDRESS, RECIPIENT_ADDRESS, and TRANSFER_AMOUNT in the script")
    return
  }

  // Setup provider and wallet
  const [deployer] = await ethers.getSigners()
  const provider = deployer.provider
  console.log(`👤 Sender: ${deployer.address}`)
  console.log(`🎯 Recipient: ${RECIPIENT_ADDRESS}`)

  // Connect to token contract
  const tokenContract = await ethers.getContractFactory("SlerfToken")
  const slerfToken = tokenContract.attach(TOKEN_ADDRESS)

  try {
    // Get token info
    const name = await slerfToken.name()
    const symbol = await slerfToken.symbol()
    const decimals = await slerfToken.decimals()

    console.log(`🪙 Token: ${name} (${symbol})`)

    // Check balances before transfer
    const senderBalance = await slerfToken.balanceOf(deployer.address)
    const recipientBalance = await slerfToken.balanceOf(RECIPIENT_ADDRESS)

    console.log(`💰 Sender balance: ${ethers.formatUnits(senderBalance, decimals)} ${symbol}`)
    console.log(`💰 Recipient balance: ${ethers.formatUnits(recipientBalance, decimals)} ${symbol}`)

    // Convert transfer amount to wei
    const transferAmountWei = ethers.parseUnits(TRANSFER_AMOUNT, decimals)

    // Check if sender has enough tokens
    if (senderBalance.lt(transferAmountWei)) {
      console.error(
        `❌ Insufficient balance! Need ${TRANSFER_AMOUNT} ${symbol}, have ${ethers.formatUnits(senderBalance, decimals)} ${symbol}`,
      )
      return
    }

    console.log(`📤 Transferring ${TRANSFER_AMOUNT} ${symbol}...`)

    // Execute transfer
    const tx = await slerfToken.transfer(RECIPIENT_ADDRESS, transferAmountWei)

    console.log(`⏳ Transaction sent: ${tx.hash}`)
    console.log("⏳ Waiting for confirmation...")

    const receipt = await tx.wait()
    console.log(`✅ Transfer confirmed in block ${receipt.blockNumber}`)

    // Check balances after transfer
    const newSenderBalance = await slerfToken.balanceOf(deployer.address)
    const newRecipientBalance = await slerfToken.balanceOf(RECIPIENT_ADDRESS)

    console.log("\n📊 Final Balances:")
    console.log(`   Sender: ${ethers.formatUnits(newSenderBalance, decimals)} ${symbol}`)
    console.log(`   Recipient: ${ethers.formatUnits(newRecipientBalance, decimals)} ${symbol}`)

    console.log("\n🎉 Transfer completed successfully!")
    console.log(`✅ Transferred ${TRANSFER_AMOUNT} ${symbol} to ${RECIPIENT_ADDRESS}`)
  } catch (error) {
    console.error("❌ Transfer failed:", error.message)
    throw error
  }
}

// Run transfer
transferTokens()
  .then(() => {
    console.log("🏁 Script completed")
    process.exit(0)
  })
  .catch((error) => {
    console.error("💥 Script failed:", error)
    process.exit(1)
  })
