document.addEventListener("DOMContentLoaded", () => {
  const spinButton = document.getElementById("spinButton")
  const rewardDisplay = document.getElementById("rewardDisplay")
  const messageDisplay = document.getElementById("messageDisplay")
  const playerAddressDisplay = document.getElementById("playerAddressDisplay")
  const usernameDisplay = document.getElementById("usernameDisplay")
  const levelDisplay = document.getElementById("levelDisplay")
  const xpDisplay = document.getElementById("xpDisplay")
  const totalTokensWonDisplay = document.getElementById("totalTokensWonDisplay")
  const dailyStreakDisplay = document.getElementById("dailyStreakDisplay")
  const nextSpinInDisplay = document.getElementById("nextSpinInDisplay")
  const achievementsList = document.getElementById("achievementsList")
  const spinTypeSelect = document.getElementById("spinType")
  const socialShareButton = document.getElementById("socialShareButton")
  const referralCodeDisplay = document.getElementById("referralCodeDisplay")
  const referralInput = document.getElementById("referralInput")
  const applyReferralButton = document.getElementById("applyReferralButton")
  const leaderboardBody = document.getElementById("leaderboardBody")

  let currentPlayerAddress = null

  const displayMessage = (message, type = "info") => {
    messageDisplay.textContent = message
    messageDisplay.className = `message ${type}`
  }

  const fetchPlayerProfile = async (address) => {
    try {
      const response = await fetch(`/api/player/${address}`)
      const data = await response.json()
      if (data.error) {
        displayMessage(`Error: ${data.error}`, "error")
        return null
      }
      return data
    } catch (error) {
      console.error("Error fetching player profile:", error)
      displayMessage("Failed to fetch player profile.", "error")
      return null
    }
  }

  const updateUI = (player) => {
    if (!player) return

    playerAddressDisplay.textContent = player.address
    usernameDisplay.textContent = player.username
    levelDisplay.textContent = player.level
    xpDisplay.textContent = `${player.xp} / ${player.next_level_xp}`
    totalTokensWonDisplay.textContent = player.total_tokens_won.toLocaleString()
    dailyStreakDisplay.textContent = player.daily_streak
    referralCodeDisplay.textContent = player.referral_code

    spinButton.disabled = !player.can_spin_today
    nextSpinInDisplay.textContent = player.can_spin_today ? "Ready!" : "Tomorrow"

    achievementsList.innerHTML = ""
    if (player.achievements && player.achievements.length > 0) {
      player.achievements.forEach((ach) => {
        const li = document.createElement("li")
        li.textContent = `${ach.icon || "⭐"} ${ach.name}`
        achievementsList.appendChild(li)
      })
    } else {
      const li = document.createElement("li")
      li.textContent = "No achievements yet. Keep playing!"
      achievementsList.appendChild(li)
    }
  }

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch("/api/leaderboard")
      const data = await response.json()
      leaderboardBody.innerHTML = ""
      data.forEach((player) => {
        const row = leaderboardBody.insertRow()
        row.insertCell().textContent = player.rank
        row.insertCell().textContent = player.username
        row.insertCell().textContent = player.level
        row.insertCell().textContent = player.total_tokens.toLocaleString()
        row.insertCell().textContent = player.streak
      })
    } catch (error) {
      console.error("Error fetching leaderboard:", error)
      displayMessage("Failed to fetch leaderboard.", "error")
    }
  }

  spinButton.addEventListener("click", async () => {
    if (!currentPlayerAddress) {
      displayMessage("Please connect your wallet first.", "error")
      return
    }

    spinButton.disabled = true
    displayMessage("Spinning the wheel...", "info")
    rewardDisplay.textContent = "..."

    try {
      const spinType = spinTypeSelect.value
      const response = await fetch("/api/spin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: currentPlayerAddress, spin_type: spinType }),
      })
      const data = await response.json()

      if (data.success) {
        rewardDisplay.textContent = data.reward.toLocaleString()
        displayMessage(`You won ${data.reward.toLocaleString()} tokens!`, "success")
        const updatedPlayer = await fetchPlayerProfile(currentPlayerAddress)
        updateUI(updatedPlayer)
        fetchLeaderboard()
      } else {
        displayMessage(`Spin failed: ${data.error}`, "error")
        rewardDisplay.textContent = "0"
      }
    } catch (error) {
      console.error("Error during spin:", error)
      displayMessage("Failed to perform spin.", "error")
      rewardDisplay.textContent = "0"
    } finally {
      spinButton.disabled = false
    }
  })

  socialShareButton.addEventListener("click", async () => {
    if (!currentPlayerAddress) {
      displayMessage("Please connect your wallet first.", "error")
      return
    }

    try {
      const response = await fetch("/api/social-share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: currentPlayerAddress, platform: "telegram" }), // Assuming Telegram share
      })
      const data = await response.json()

      if (data.success) {
        displayMessage(`Shared on social media! You received ${data.bonus_tokens} bonus tokens.`, "success")
        const updatedPlayer = await fetchPlayerProfile(currentPlayerAddress)
        updateUI(updatedPlayer)
      } else {
        displayMessage(`Social share failed: ${data.error}`, "error")
      }
    } catch (error) {
      console.error("Error during social share:", error)
      displayMessage("Failed to record social share.", "error")
    }
  })

  applyReferralButton.addEventListener("click", async () => {
    const code = referralInput.value.trim()
    if (!code) {
      displayMessage("Please enter a referral code.", "error")
      return
    }

    try {
      const response = await fetch(`/api/referral/${code}`)
      const data = await response.json()
      if (data.valid) {
        displayMessage(`Referral code valid! You will receive a bonus when you sign up.`, "success")
        // In a real app, you'd store this referral code in session/local storage
        // and apply it when the user connects their wallet for the first time.
      } else {
        displayMessage("Invalid referral code.", "error")
      }
    } catch (error) {
      console.error("Error checking referral:", error)
      displayMessage("Failed to check referral code.", "error")
    }
  })

  // Initialize Web3 and connect wallet (simplified for Telegram WebApp context)
  const initWeb3 = async () => {
    // In a real Telegram WebApp, you'd use window.Telegram.WebApp.initDataUnsafe
    // to get user info and potentially a wallet address if Telegram provides it.
    // For this demo, we'll simulate a wallet connection.
    displayMessage("Connecting wallet...", "info")
    setTimeout(async () => {
      // Simulate a connected wallet address
      const simulatedAddress =
        "0x" +
        Array(40)
          .fill(0)
          .map(() => Math.floor(Math.random() * 16).toString(16))
          .join("")
      currentPlayerAddress = simulatedAddress
      displayMessage(
        `Wallet connected: ${simulatedAddress.substring(0, 6)}...${simulatedAddress.substring(simulatedAddress.length - 4)}`,
        "success",
      )

      const player = await fetchPlayerProfile(currentPlayerAddress)
      updateUI(player)
      fetchLeaderboard()
    }, 1000)
  }

  initWeb3()
})
