const { ethers } = require("hardhat")

async function main() {
  const [deployer] = await ethers.getSigners()

  console.log("Deploying contracts with the account:", deployer.address)

  const initialSupply = ethers.parseUnits("1000000", 18) // 1,000,000 tokens
  const SlerfToken = await ethers.getContractFactory("SlerfToken")
  const slerfToken = await SlerfToken.deploy(initialSupply)

  await slerfToken.waitForDeployment()

  console.log("SlerfToken deployed to:", slerfToken.target)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
