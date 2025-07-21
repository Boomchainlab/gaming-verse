// Game state
const gameState = {
  connected: false,
  playerAddress: null,
  playerData: null,
  web3: null,
  spinning: false,
}

// Wheel configuration
const wheelSegments = [
  { label: "1,000", value: 1000, color: "#ff6b6b" },
  { label: "2,500", value: 2500, color: "#4ecdc4" },
  { label: "5,000", value: 5000, color: "#45b7d1" },
  { label: "10,000", value: 10000, color: "#96ceb4" },
  { label: "25,000", value: 25000, color: "#feca57" },
  { label: "50,000", value: 50000, color: "#ff9ff3" },
  { label: "100,000", value: 100000, color: "#54a0ff" },
  { label: "MEGA!", value: 250000, color: "#5f27cd" },
]

// Initialize the game
document.addEventListener("DOMContentLoaded", () => {
  initializeGame()
  setupEventListeners()
  drawWheel()
})

function initializeGame() {
  // Check if Web3 is available
  if (typeof window.ethereum !== "undefined") {
    const Web3 = window.Web3 // Declare Web3 variable
    gameState.web3 = new Web3(window.ethereum)
    console.log("Web3 detected")
  } else {
    console.log("Please install MetaMask")
    showError("Please install MetaMask to play this game")
  }
}

function setupEventListeners() {
  // Connect wallet button
  document.getElementById("connectWallet").addEventListener("click", connectWallet)

  // Spin button
  document.getElementById("spinButton").addEventListener("click", spinWheel)

  // Close result button
  document.getElementById("closeResult").addEventListener("click", closeResult)
}

async function connectWallet() {
  if (!gameState.web3) {
    showError("Web3 not available")
    return
  }

  try {
    showLoading(true)

    // Request account access
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    })

    if (accounts.length > 0) {
      gameState.playerAddress = accounts[0]
      gameState.connected = true

      // Update UI
      updateWalletUI()

      // Load player data
      await loadPlayerData()

      // Enable spin button
      document.getElementById("spinButton").disabled = false
    }
  } catch (error) {
    console.error("Error connecting wallet:", error)
    showError("Failed to connect wallet")
  } finally {
    showLoading(false)
  }
}

function updateWalletUI() {
  const connectBtn = document.getElementById("connectWallet")
  const walletInfo = document.getElementById("walletInfo")
  const playerStats = document.getElementById("playerStats")

  if (gameState.connected) {
    connectBtn.style.display = "none"
    walletInfo.style.display = "block"
    playerStats.style.display = "grid"

    // Update wallet address display
    const addressElement = document.getElementById("walletAddress")
    if (addressElement) {
      addressElement.textContent = `${gameState.playerAddress.slice(0, 6)}...${gameState.playerAddress.slice(-4)}`
    }
  }
}

async function loadPlayerData() {
  try {
    const response = await fetch(`/api/player/${gameState.playerAddress}`)
    const data = await response.json()

    if (response.ok) {
      gameState.playerData = data
      updatePlayerStats()
      loadAchievements()
      loadLeaderboard()
    } else {
      console.error("Error loading player data:", data.error)
    }
  } catch (error) {
    console.error("Error loading player data:", error)
  }
}

function updatePlayerStats() {
  if (!gameState.playerData) return

  const data = gameState.playerData

  // Update stat displays
  document.getElementById("playerLevel").textContent = data.level
  document.getElementById("playerStreak").textContent = data.daily_streak
  document.getElementById("totalWon").textContent = data.total_tokens_won.toLocaleString()
  document.getElementById("playerXP").textContent = data.xp.toLocaleString()

  // Update referral code
  document.getElementById("referralCode").value = data.referral_code

  // Update spin button state
  const spinButton = document.getElementById("spinButton")
  const spinText = spinButton.querySelector(".spin-cost")

  if (data.can_spin_today) {
    spinButton.disabled = false
    spinText.textContent = "Free Daily Spin"
  } else {
    spinButton.disabled = true
    spinText.textContent = "Come back tomorrow!"
  }
}

async function spinWheel() {
  if (gameState.spinning || !gameState.connected) return

  try {
    gameState.spinning = true
    showLoading(true)

    // Animate wheel spin
    animateWheelSpin()

    // Make API call to spin
    const response = await fetch("/api/spin", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        address: gameState.playerAddress,
        spin_type: "normal",
      }),
    })

    const result = await response.json()

    if (response.ok && result.success) {
      // Show result after animation
      setTimeout(() => {
        showSpinResult(result)
        updatePlayerStats()
      }, 3000)
    } else {
      showError(result.error || "Spin failed")
    }
  } catch (error) {
    console.error("Error spinning:", error)
    showError("Failed to spin")
  } finally {
    gameState.spinning = false
    showLoading(false)
  }
}

function animateWheelSpin() {
  const canvas = document.getElementById("wheelCanvas")
  const ctx = canvas.getContext("2d")
  let rotation = 0
  let speed = 0.3
  const deceleration = 0.99

  function animate() {
    rotation += speed
    speed *= deceleration

    // Clear and redraw wheel
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    drawWheel(rotation)

    if (speed > 0.01) {
      requestAnimationFrame(animate)
    }
  }

  animate()
}

function drawWheel(rotation = 0) {
  const canvas = document.getElementById("wheelCanvas")
  const ctx = canvas.getContext("2d")
  const centerX = canvas.width / 2
  const centerY = canvas.height / 2
  const radius = Math.min(centerX, centerY) - 10

  ctx.save()
  ctx.translate(centerX, centerY)
  ctx.rotate(rotation)

  const segmentAngle = (2 * Math.PI) / wheelSegments.length

  wheelSegments.forEach((segment, index) => {
    const startAngle = index * segmentAngle
    const endAngle = startAngle + segmentAngle

    // Draw segment
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.arc(0, 0, radius, startAngle, endAngle)
    ctx.closePath()
    ctx.fillStyle = segment.color
    ctx.fill()
    ctx.strokeStyle = "#fff"
    ctx.lineWidth = 2
    ctx.stroke()

    // Draw text
    ctx.save()
    ctx.rotate(startAngle + segmentAngle / 2)
    ctx.textAlign = "center"
    ctx.fillStyle = "#fff"
    ctx.font = "bold 16px Arial"
    ctx.fillText(segment.label, radius * 0.7, 5)
    ctx.restore()
  })

  ctx.restore()

  // Draw center circle
  ctx.beginPath()
  ctx.arc(centerX, centerY, 20, 0, 2 * Math.PI)
  ctx.fillStyle = "#333"
  ctx.fill()
  ctx.strokeStyle = "#fff"
  ctx.lineWidth = 3
  ctx.stroke()
}

function showSpinResult(result) {
  const resultDisplay = document.getElementById("resultDisplay")
  const resultTitle = document.getElementById("resultTitle")
  const resultMessage = document.getElementById("resultMessage")
  const rewardTokens = document.getElementById("rewardTokens")
  const rewardXP = document.getElementById("rewardXP")

  resultTitle.textContent = "Congratulations! 🎉"
  resultMessage.textContent = `You won ${result.reward.toLocaleString()} Creator Coins!`
  rewardTokens.textContent = result.reward.toLocaleString()
  rewardXP.textContent = result.xp_gained.toLocaleString()

  resultDisplay.style.display = "flex"

  // Track analytics
  const Analytics = window.Analytics // Declare Analytics variable
  if (typeof Analytics !== "undefined") {
    Analytics.track("spin_completed", {
      reward: result.reward,
      level: result.new_level,
      streak: result.streak,
    })
  }
}

function closeResult() {
  document.getElementById("resultDisplay").style.display = "none"
  loadPlayerData() // Refresh player data
}

async function loadAchievements() {
  if (!gameState.playerData) return

  const achievementsList = document.getElementById("achievementsList")
  const achievements = gameState.playerData.achievements || []

  const allAchievements = [
    { name: "First Spin", icon: "🎯", description: "Complete your first spin" },
    { name: "Token Collector", icon: "💰", description: "Collect 10,000 tokens" },
    { name: "Streak Master", icon: "🔥", description: "Maintain a 7-day streak" },
    { name: "Level Up", icon: "⭐", description: "Reach level 5" },
    { name: "Social Butterfly", icon: "📱", description: "Share 5 times" },
  ]

  achievementsList.innerHTML = ""

  allAchievements.forEach((achievement) => {
    const isUnlocked = achievements.includes(achievement.name)
    const achievementElement = document.createElement("div")
    achievementElement.className = `achievement-item ${isUnlocked ? "achievement-unlocked" : ""}`

    achievementElement.innerHTML = `
            <div class="achievement-icon">${achievement.icon}</div>
            <div class="achievement-info">
                <div class="achievement-name">${achievement.name}</div>
                <div class="achievement-description">${achievement.description}</div>
            </div>
            ${isUnlocked ? '<div class="achievement-status">✅</div>' : '<div class="achievement-status">🔒</div>'}
        `

    achievementsList.appendChild(achievementElement)
  })
}

async function loadLeaderboard() {
  try {
    const response = await fetch("/api/leaderboard")
    const leaderboard = await response.json()

    if (response.ok) {
      displayLeaderboard(leaderboard)
    }
  } catch (error) {
    console.error("Error loading leaderboard:", error)
  }
}

function displayLeaderboard(leaderboard) {
  const leaderboardElement = document.getElementById("leaderboard")
  leaderboardElement.innerHTML = ""

  leaderboard.slice(0, 10).forEach((player) => {
    const playerElement = document.createElement("div")
    playerElement.className = "leaderboard-item"

    let rankClass = ""
    if (player.rank === 1) rankClass = "gold"
    else if (player.rank === 2) rankClass = "silver"
    else if (player.rank === 3) rankClass = "bronze"

    playerElement.innerHTML = `
            <div class="player-info">
                <span class="rank ${rankClass}">#${player.rank}</span>
                <span class="username">${player.username}</span>
                <span class="address">${player.address}</span>
            </div>
            <div class="player-stats">
                <span class="level">Lv.${player.level}</span>
                <span class="tokens">${player.total_tokens.toLocaleString()} CC</span>
            </div>
        `

    leaderboardElement.appendChild(playerElement)
  })
}

// Social sharing functions
function shareToTelegram() {
  const text = `🚀 I'm playing Creator Coin Spin Game and earning tokens! Join me and use my referral code: ${gameState.playerData?.referral_code || "PLAY2024"}`
  const url = window.location.href
  window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, "_blank")

  // Track share
  trackSocialShare("telegram")
}

function shareToTwitter() {
  const text = `🚀 Just won tokens playing Creator Coin Spin Game! 🎮💰 Join the fun and earn crypto rewards daily! #CreatorCoin #Web3Gaming`
  const url = window.location.href
  window.open(
    `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
    "_blank",
  )

  // Track share
  trackSocialShare("twitter")
}

async function trackSocialShare(platform) {
  if (!gameState.connected) return

  try {
    const response = await fetch("/api/social-share", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        address: gameState.playerAddress,
        platform: platform,
      }),
    })

    const result = await response.json()

    if (result.success) {
      showSuccess(`+${result.bonus_tokens} tokens for sharing!`)
      loadPlayerData() // Refresh stats
    }
  } catch (error) {
    console.error("Error tracking share:", error)
  }
}

function copyReferralCode() {
  const referralInput = document.getElementById("referralCode")
  referralInput.select()
  document.execCommand("copy")
  showSuccess("Referral code copied!")
}

// Utility functions
function showLoading(show) {
  const overlay = document.getElementById("loadingOverlay")
  overlay.style.display = show ? "flex" : "none"
}

function showError(message) {
  // Simple alert for now - could be enhanced with custom modal
  alert(`Error: ${message}`)
}

function showSuccess(message) {
  // Simple alert for now - could be enhanced with custom toast
  alert(message)
}

// Auto-refresh player data every 30 seconds
setInterval(() => {
  if (gameState.connected) {
    loadPlayerData()
  }
}, 30000)
