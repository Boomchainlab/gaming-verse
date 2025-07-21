// Telegram Web App specific game logic
const telegramGameState = {
  connected: false,
  playerAddress: null,
  playerData: null,
  web3: null,
  spinning: false,
  telegramUser: null,
}

// Declare Web3 variable
const Web3 = window.Web3

// Initialize Telegram Web App
document.addEventListener("DOMContentLoaded", () => {
  initializeTelegramGame()
  setupTelegramEventListeners()
  drawTelegramWheel()
})

function initializeTelegramGame() {
  // Initialize Telegram Web App
  if (window.Telegram && window.Telegram.WebApp) {
    const tg = window.Telegram.WebApp
    tg.ready()
    tg.expand()

    // Get user info
    telegramGameState.telegramUser = tg.initDataUnsafe?.user

    if (telegramGameState.telegramUser) {
      document.getElementById("userName").textContent = telegramGameState.telegramUser.first_name || "Player"
    }

    // Set theme
    document.body.style.backgroundColor = tg.themeParams.bg_color || "#ffffff"
    document.body.style.color = tg.themeParams.text_color || "#000000"
  }

  // Check if Web3 is available
  if (typeof window.ethereum !== "undefined") {
    telegramGameState.web3 = new Web3(window.ethereum)
    console.log("Web3 detected in Telegram")
  }
}

function setupTelegramEventListeners() {
  // Connect wallet button
  document.getElementById("connectTelegramWallet").addEventListener("click", connectTelegramWallet)

  // Spin button
  document.getElementById("telegramSpin").addEventListener("click", telegramSpin)

  // Close result button
  document.getElementById("closeResult").addEventListener("click", closeTelegramResult)
}

async function connectTelegramWallet() {
  if (!telegramGameState.web3) {
    showTelegramError("Web3 not available. Please use a Web3-enabled browser.")
    return
  }

  try {
    // Request account access
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    })

    if (accounts.length > 0) {
      telegramGameState.playerAddress = accounts[0]
      telegramGameState.connected = true

      // Update UI
      updateTelegramWalletUI()

      // Load player data
      await loadTelegramPlayerData()
    }
  } catch (error) {
    console.error("Error connecting wallet:", error)
    showTelegramError("Failed to connect wallet")
  }
}

function updateTelegramWalletUI() {
  const walletSection = document.getElementById("walletSection")
  const gameActions = document.getElementById("gameActions")
  const spinButton = document.getElementById("telegramSpin")

  if (telegramGameState.connected) {
    walletSection.style.display = "none"
    gameActions.style.display = "grid"
    spinButton.disabled = false
  }
}

async function loadTelegramPlayerData() {
  try {
    const response = await fetch(`/api/player/${telegramGameState.playerAddress}`)
    const data = await response.json()

    if (response.ok) {
      telegramGameState.playerData = data
      updateTelegramStats()
    } else {
      console.error("Error loading player data:", data.error)
    }
  } catch (error) {
    console.error("Error loading player data:", error)
  }
}

function updateTelegramStats() {
  if (!telegramGameState.playerData) return

  const data = telegramGameState.playerData

  // Update quick stats
  document.getElementById("level").textContent = data.level
  document.getElementById("streak").textContent = data.daily_streak
  document.getElementById("tokens").textContent = data.total_tokens_won.toLocaleString()

  // Update spin button state
  const spinButton = document.getElementById("telegramSpin")
  const spinText = spinButton.querySelector("small")

  if (data.can_spin_today) {
    spinButton.disabled = false
    spinText.textContent = "Daily Free Spin"
  } else {
    spinButton.disabled = true
    spinText.textContent = "Come back tomorrow!"
  }
}

async function telegramSpin() {
  if (telegramGameState.spinning || !telegramGameState.connected) return

  try {
    telegramGameState.spinning = true

    // Animate wheel spin
    animateTelegramWheelSpin()

    // Make API call to spin
    const response = await fetch("/api/spin", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        address: telegramGameState.playerAddress,
        spin_type: "normal",
      }),
    })

    const result = await response.json()

    if (response.ok && result.success) {
      // Show result after animation
      setTimeout(() => {
        showTelegramSpinResult(result)
        updateTelegramStats()
      }, 3000)
    } else {
      showTelegramError(result.error || "Spin failed")
    }
  } catch (error) {
    console.error("Error spinning:", error)
    showTelegramError("Failed to spin")
  } finally {
    telegramGameState.spinning = false
  }
}

function animateTelegramWheelSpin() {
  const canvas = document.getElementById("telegramWheel")
  const ctx = canvas.getContext("2d")
  let rotation = 0
  let speed = 0.3
  const deceleration = 0.99

  function animate() {
    rotation += speed
    speed *= deceleration

    // Clear and redraw wheel
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    drawTelegramWheel(rotation)

    if (speed > 0.01) {
      requestAnimationFrame(animate)
    }
  }

  animate()
}

function drawTelegramWheel(rotation = 0) {
  const canvas = document.getElementById("telegramWheel")
  const ctx = canvas.getContext("2d")
  const centerX = canvas.width / 2
  const centerY = canvas.height / 2
  const radius = Math.min(centerX, centerY) - 10

  const segments = [
    { label: "1K", color: "#ff6b6b" },
    { label: "2.5K", color: "#4ecdc4" },
    { label: "5K", color: "#45b7d1" },
    { label: "10K", color: "#96ceb4" },
    { label: "25K", color: "#feca57" },
    { label: "50K", color: "#ff9ff3" },
    { label: "100K", color: "#54a0ff" },
    { label: "MEGA", color: "#5f27cd" },
  ]

  ctx.save()
  ctx.translate(centerX, centerY)
  ctx.rotate(rotation)

  const segmentAngle = (2 * Math.PI) / segments.length

  segments.forEach((segment, index) => {
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
    ctx.font = "bold 14px Arial"
    ctx.fillText(segment.label, radius * 0.7, 5)
    ctx.restore()
  })

  ctx.restore()

  // Draw center circle
  ctx.beginPath()
  ctx.arc(centerX, centerY, 15, 0, 2 * Math.PI)
  ctx.fillStyle = "#333"
  ctx.fill()
  ctx.strokeStyle = "#fff"
  ctx.lineWidth = 2
  ctx.stroke()
}

function showTelegramSpinResult(result) {
  const resultModal = document.getElementById("telegramResult")
  const resultTitle = document.getElementById("resultTitle")
  const rewardAmount = document.getElementById("rewardAmount")
  const bonusInfo = document.getElementById("bonusInfo")

  resultTitle.textContent = "🎉 Congratulations!"
  rewardAmount.textContent = result.reward.toLocaleString()

  let bonusText = ""
  if (result.multipliers.total > 1) {
    bonusText = `Bonus multiplier: ${result.multipliers.total.toFixed(2)}x`
  }
  if (result.streak > 1) {
    bonusText += ` | Streak: ${result.streak} days`
  }
  bonusInfo.textContent = bonusText

  resultModal.style.display = "flex"

  // Haptic feedback if available
  if (window.Telegram && window.Telegram.WebApp) {
    window.Telegram.WebApp.HapticFeedback.impactOccurred("medium")
  }

  // Track analytics
  const Analytics = window.Analytics // Declare Analytics variable
  if (typeof Analytics !== "undefined") {
    Analytics.track("telegram_spin_completed", {
      reward: result.reward,
      level: result.new_level,
      streak: result.streak,
      user_id: telegramGameState.telegramUser?.id,
    })
  }
}

function closeTelegramResult() {
  document.getElementById("telegramResult").style.display = "none"
  loadTelegramPlayerData() // Refresh player data
}

// Telegram-specific functions
function showLeaderboard() {
  // Could open a new view or send data back to Telegram
  if (window.Telegram && window.Telegram.WebApp) {
    window.Telegram.WebApp.showAlert("Leaderboard feature coming soon!")
  }
}

function showAchievements() {
  // Could open a new view or send data back to Telegram
  if (window.Telegram && window.Telegram.WebApp) {
    window.Telegram.WebApp.showAlert("Achievements feature coming soon!")
  }
}

function shareGame() {
  const shareText = `🚀 I'm playing Creator Coin Spin Game and earning tokens! Join me: ${window.location.href}`

  if (window.Telegram && window.Telegram.WebApp) {
    window.Telegram.WebApp.switchInlineQuery(shareText, ["users", "groups"])
  } else {
    // Fallback to regular sharing
    if (navigator.share) {
      navigator.share({
        title: "Creator Coin Spin Game",
        text: shareText,
        url: window.location.href,
      })
    }
  }
}

function showTelegramError(message) {
  if (window.Telegram && window.Telegram.WebApp) {
    window.Telegram.WebApp.showAlert(`Error: ${message}`)
  } else {
    alert(`Error: ${message}`)
  }
}

// Auto-refresh player data every 30 seconds
setInterval(() => {
  if (telegramGameState.connected) {
    loadTelegramPlayerData()
  }
}, 30000)
