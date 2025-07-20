const { expect } = require("chai")
const { ethers } = require("hardhat")

describe("SlerfToken", () => {
  let SlerfToken
  let slerfToken
  let owner
  let addr1
  let addr2
  let addrs

  beforeEach(async () => {
    SlerfToken = await ethers.getContractFactory("SlerfToken")
    ;[owner, addr1, addr2, ...addrs] = await ethers.getSigners()
    slerfToken = await SlerfToken.deploy(ethers.parseUnits("1000000", 18)) // 1,000,000 tokens
    await slerfToken.waitForDeployment()
  })

  describe("Deployment", () => {
    it("Should assign the total supply of tokens to the owner", async () => {
      const ownerBalance = await slerfToken.balanceOf(owner.address)
      expect(await slerfToken.totalSupply()).to.equal(ownerBalance)
    })

    it("Should have the correct name and symbol", async () => {
      expect(await slerfToken.name()).to.equal("SlerfToken")
      expect(await slerfToken.symbol()).to.equal("SLERF")
    })
  })

  describe("Transactions", () => {
    it("Should transfer tokens between accounts", async () => {
      // Transfer 50 tokens from owner to addr1
      await slerfToken.transfer(addr1.address, ethers.parseUnits("50", 18))
      expect(await slerfToken.balanceOf(addr1.address)).to.equal(ethers.parseUnits("50", 18))

      // Transfer 50 tokens from addr1 to addr2
      await slerfToken.connect(addr1).transfer(addr2.address, ethers.parseUnits("50", 18))
      expect(await slerfToken.balanceOf(addr2.address)).to.equal(ethers.parseUnits("50", 18))
    })

    it("Should fail if sender doesn’t have enough tokens", async () => {
      const initialOwnerBalance = await slerfToken.balanceOf(owner.address)

      // Try to send 1M tokens from addr1 (who has 0)
      await expect(
        slerfToken.connect(addr1).transfer(owner.address, ethers.parseUnits("1000000", 18)),
      ).to.be.revertedWith("ERC20: transfer amount exceeds balance")

      // Owner balance shouldn't have changed
      expect(await slerfToken.balanceOf(owner.address)).to.equal(initialOwnerBalance)
    })

    it("Should update balances after transfers", async () => {
      const initialOwnerBalance = await slerfToken.balanceOf(owner.address)

      await slerfToken.transfer(addr1.address, ethers.parseUnits("100", 18))
      await slerfToken.transfer(addr2.address, ethers.parseUnits("50", 18))

      const finalOwnerBalance = await slerfToken.balanceOf(owner.address)
      expect(finalOwnerBalance).to.equal(initialOwnerBalance - ethers.parseUnits("150", 18))

      const addr1Balance = await slerfToken.balanceOf(addr1.address)
      expect(addr1Balance).to.equal(ethers.parseUnits("100", 18))

      const addr2Balance = await slerfToken.balanceOf(addr2.address)
      expect(addr2Balance).to.equal(ethers.parseUnits("50", 18))
    })
  })

  describe("Minting", () => {
    it("Should allow owner to mint new tokens", async () => {
      const initialSupply = await slerfToken.totalSupply()
      const initialOwnerBalance = await slerfToken.balanceOf(owner.address)

      await slerfToken.mint(owner.address, ethers.parseUnits("1000", 18))

      expect(await slerfToken.totalSupply()).to.equal(initialSupply + ethers.parseUnits("1000", 18))
      expect(await slerfToken.balanceOf(owner.address)).to.equal(initialOwnerBalance + ethers.parseUnits("1000", 18))
    })

    it("Should not allow non-owners to mint tokens", async () => {
      await expect(slerfToken.connect(addr1).mint(addr1.address, ethers.parseUnits("1000", 18))).to.be.revertedWith(
        "Ownable: caller is not the owner",
      )
    })
  })

  describe("Burning", () => {
    it("Should allow users to burn their own tokens", async () => {
      const initialSupply = await slerfToken.totalSupply()
      const initialOwnerBalance = await slerfToken.balanceOf(owner.address)

      await slerfToken.burn(ethers.parseUnits("100", 18))

      expect(await slerfToken.totalSupply()).to.equal(initialSupply - ethers.parseUnits("100", 18))
      expect(await slerfToken.balanceOf(owner.address)).to.equal(initialOwnerBalance - ethers.parseUnits("100", 18))
    })

    it("Should fail if user tries to burn more tokens than they have", async () => {
      await expect(slerfToken.connect(addr1).burn(ethers.parseUnits("1", 18))).to.be.revertedWith(
        "ERC20: burn amount exceeds balance",
      )
    })
  })
})
