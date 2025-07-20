document.addEventListener("DOMContentLoaded", () => {
  const tokenAddressInput = document.getElementById("tokenAddress")
  const recipientAddressInput = document.getElementById("recipientAddress")
  const transferAmountInput = document.getElementById("transferAmount")
  const transferButton = document.getElementById("transferButton")
  const mintAmountInput = document.getElementById("mintAmount")
  const mintRecipientInput = document.getElementById("mintRecipient")
  const mintButton = document.getElementById("mintButton")
  const burnAmountInput = document.getElementById("burnAmount")
  const burnButton = document.getElementById("burnButton")
  const messageDiv = document.getElementById("message")
  const tokenInfoDiv = document.getElementById("tokenInfo")
  const tokenNameSpan = document.getElementById("tokenName")
  const tokenSymbolSpan = document.getElementById("tokenSymbol")
  const totalSupplySpan = document.getElementById("totalSupply")
  const ownerBalanceSpan = document.getElementById("ownerBalance")
  const checkTokenButton = document.getElementById("checkTokenButton")

  const displayMessage = (msg, type) => {
    messageDiv.textContent = msg
    messageDiv.className = `message ${type}`
  }

  const updateTokenInfo = async () => {
    const tokenAddress = tokenAddressInput.value
    if (!tokenAddress) {
      tokenInfoDiv.style.display = "none"
      return
    }

    try {
      const response = await fetch(`/api/token-info?address=${tokenAddress}`)
      const data = await response.json()

      if (data.error) {
        displayMessage(`Error fetching token info: ${data.error}`, "error")
        tokenInfoDiv.style.display = "none"
        return
      }

      tokenNameSpan.textContent = data.name
      tokenSymbolSpan.textContent = data.symbol
      totalSupplySpan.textContent = Number.parseFloat(data.totalSupply).toLocaleString()
      ownerBalanceSpan.textContent = Number.parseFloat(data.ownerBalance).toLocaleString()
      tokenInfoDiv.style.display = "block"
      displayMessage("Token info updated.", "success")
    } catch (error) {
      console.error("Error:", error)
      displayMessage("Failed to fetch token info.", "error")
      tokenInfoDiv.style.display = "none"
    }
  }

  checkTokenButton.addEventListener("click", updateTokenInfo)

  transferButton.addEventListener("click", async () => {
    const tokenAddress = tokenAddressInput.value
    const recipientAddress = recipientAddressInput.value
    const amount = transferAmountInput.value

    if (!tokenAddress || !recipientAddress || !amount) {
      displayMessage("Please fill all transfer fields.", "error")
      return
    }

    transferButton.disabled = true
    displayMessage("Transferring tokens...", "info")

    try {
      const response = await fetch("/api/transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tokenAddress, recipientAddress, amount }),
      })
      const data = await response.json()

      if (data.success) {
        displayMessage(`Transfer successful! Tx Hash: ${data.txHash}`, "success")
        updateTokenInfo()
      } else {
        displayMessage(`Transfer failed: ${data.error}`, "error")
      }
    } catch (error) {
      console.error("Error:", error)
      displayMessage("Failed to transfer tokens.", "error")
    } finally {
      transferButton.disabled = false
    }
  })

  mintButton.addEventListener("click", async () => {
    const tokenAddress = tokenAddressInput.value
    const recipientAddress = mintRecipientInput.value
    const amount = mintAmountInput.value

    if (!tokenAddress || !recipientAddress || !amount) {
      displayMessage("Please fill all mint fields.", "error")
      return
    }

    mintButton.disabled = true
    displayMessage("Minting tokens...", "info")

    try {
      const response = await fetch("/api/mint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tokenAddress, recipientAddress, amount }),
      })
      const data = await response.json()

      if (data.success) {
        displayMessage(`Mint successful! Tx Hash: ${data.txHash}`, "success")
        updateTokenInfo()
      } else {
        displayMessage(`Mint failed: ${data.error}`, "error")
      }
    } catch (error) {
      console.error("Error:", error)
      displayMessage("Failed to mint tokens.", "error")
    } finally {
      mintButton.disabled = false
    }
  })

  burnButton.addEventListener("click", async () => {
    const tokenAddress = tokenAddressInput.value
    const amount = burnAmountInput.value

    if (!tokenAddress || !amount) {
      displayMessage("Please fill burn amount.", "error")
      return
    }

    burnButton.disabled = true
    displayMessage("Burning tokens...", "info")

    try {
      const response = await fetch("/api/burn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tokenAddress, amount }),
      })
      const data = await response.json()

      if (data.success) {
        displayMessage(`Burn successful! Tx Hash: ${data.txHash}`, "success")
        updateTokenInfo()
      } else {
        displayMessage(`Burn failed: ${data.error}`, "error")
      }
    } catch (error) {
      console.error("Error:", error)
      displayMessage("Failed to burn tokens.", "error")
    } finally {
      burnButton.disabled = false
    }
  })

  // Initial load
  updateTokenInfo()
})
