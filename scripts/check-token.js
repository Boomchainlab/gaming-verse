const { ethers } = require("hardhat")

async function main() {
  const tokenAddress = process.env.TOKEN_ADDRESS // Ensure this is set in your .env
  const walletAddress = process.env.WALLET_ADDRESS // Ensure this is set

  if (!tokenAddress || !walletAddress) {
    console.error("Please set TOKEN_ADDRESS and WALLET_ADDRESS in your .env file.")
    process.exit(1)
  }

  console.log(`Checking token details for ${tokenAddress} and balance for ${walletAddress}`)

  const SlerfToken = await ethers.getContractFactory("SlerfToken")
  const slerfToken = SlerfToken.attach(tokenAddress)

  const name = await slerfToken.name()
  const symbol = await slerfToken.symbol()
  const totalSupply = await slerfToken.totalSupply()
  const balance = await slerfToken.balanceOf(walletAddress)

  console.log(`Token Name: ${name}`)
  console.log(`Token Symbol: ${symbol}`)
  console.log(`Total Supply: ${ethers.formatUnits(totalSupply, 18)} ${symbol}`)
  console.log(`Balance of ${walletAddress}: ${ethers.formatUnits(balance, 18)} ${symbol}`)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
