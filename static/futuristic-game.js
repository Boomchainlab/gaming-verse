document.addEventListener("DOMContentLoaded", () => {
  const gameWheel = document.getElementById("gameWheel")
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
  const particleContainer = document.getElementById("particle-container")
  const cosmicBackground = document.getElementById("cosmic-background")

  let currentPlayerAddress = null
  let isSpinning = false

  // --- Visual Effects Configuration (from environment variables or defaults) ---
  const ENHANCED_EFFECTS = window.ENHANCED_EFFECTS === "true"
  const PARTICLE_COUNT = Number.parseInt(window.PARTICLE_COUNT || "80")
  const FIREWORKS_ENABLED = window.FIREWORKS_ENABLED === "true"
  const SCREEN_FLASH_ENABLED = window.SCREEN_FLASH_ENABLED === "true"
  const WHEEL_GLOW_ENABLED = window.WHEEL_GLOW_ENABLED === "true"
  const BUTTON_SHINE_ENABLED = window.BUTTON_SHINE_ENABLED === "true"
  const AMBIENT_PARTICLES = window.AMBIENT_PARTICLES === "true"
  const BRAND_THEME = window.BRAND_THEME || "default" // 'default', 'pink-purple', 'cyan-gold', etc.
  const ANIMATION_SPEED = window.ANIMATION_SPEED || "normal" // 'slow', 'normal', 'fast'
  const MOBILE_OPTIMIZED = window.MOBILE_OPTIMIZED === "true"

  // Apply brand theme colors (simplified, in a real app this would load from brand-config.js)
  const applyTheme = (theme) => {
    const root = document.documentElement
    switch (theme) {
      case "pink-purple":
        root.style.setProperty("--primary-color", "#FF00FF") // Pink
        root.style.setProperty("--secondary-color", "#8A2BE2") // Purple
        root.style.setProperty("--accent-color", "#00FFFF") // Cyan
        root.style.setProperty("--highlight-color", "#FFD700") // Gold
        break
      case "cyan-gold":
        root.style.setProperty("--primary-color", "#00FFFF")
        root.style.setProperty("--secondary-color", "#FFD700")
        root.style.setProperty("--accent-color", "#FF00FF")
        root.style.setProperty("--highlight-color", "#8A2BE2")
        break
      default: // Default theme (already in CSS)
        break
    }
  }

  if (ENHANCED_EFFECTS) {
    applyTheme(BRAND_THEME)
    if (WHEEL_GLOW_ENABLED) {
      gameWheel.classList.add("glow")
    }
    if (BUTTON_SHINE_ENABLED) {
      spinButton.classList.add("shine")
    }
    if (AMBIENT_PARTICLES) {
      createAmbientStars()
    }
  }

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

    spinButton.disabled = !player.can_spin_today || isSpinning
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

  // --- Visual Effects Functions ---
  function createParticle(x, y, color) {
    if (!ENHANCED_EFFECTS) return
    const particle = document.createElement("div")
    particle.className = "particle"
    particle.style.left = `${x}px`
    particle.style.top = `${y}px`
    particle.style.backgroundColor = color
    particle.style.width = `${Math.random() * 5 + 5}px`
    particle.style.height = particle.style.width
    particleContainer.appendChild(particle)

    const angle = Math.random() * Math.PI * 2
    const distance = Math.random() * 100 + 50
    const targetX = x + distance * Math.cos(angle)
    const targetY = y + distance * Math.sin(angle)

    particle.animate(
      [
        { transform: `translate(0, 0) scale(1)`, opacity: 1 },
        { transform: `translate(${targetX - x}px, ${targetY - y}px) scale(0)`, opacity: 0 },
      ],
      {
        duration: 1500 + Math.random() * 500,
        easing: "ease-out",
        fill: "forwards",
      },
    ).onfinish = () => particle.remove()
  }

  function createFireworks(x, y, colors) {
    if (!ENHANCED_EFFECTS || !FIREWORKS_ENABLED) return
    for (let i = 0; i < 20; i++) {
      const firework = document.createElement("div")
      firework.className = "firework"
      firework.style.left = `${x}px`
      firework.style.top = `${y}px`
      firework.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)]
      particleContainer.appendChild(firework)

      const angle = Math.random() * Math.PI * 2
      const distance = Math.random() * 80 + 20
      const targetX = x + distance * Math.cos(angle)
      const targetY = y + distance * Math.sin(angle)

      firework.animate(
        [
          { transform: `translate(0, 0) scale(0)`, opacity: 1 },
          { transform: `translate(${targetX - x}px, ${targetY - y}px) scale(1.5)`, opacity: 0 },
        ],
        {
          duration: 800 + Math.random() * 200,
          easing: "ease-out",
          fill: "forwards",
        },
      ).onfinish = () => firework.remove()
    }
  }

  function triggerScreenFlash() {
    if (!ENHANCED_EFFECTS || !SCREEN_FLASH_ENABLED) return
    const flash = document.createElement("div")
    flash.className = "screen-flash"
    document.body.appendChild(flash)
    flash.addEventListener("animationend", () => flash.remove())
  }

  function createAmbientStars() {
    if (!ENHANCED_EFFECTS || !AMBIENT_PARTICLES) return
    for (let i = 0; i < 100; i++) {
      const star = document.createElement("div")
      star.className = "star"
      star.style.left = `${Math.random() * 100}%`
      star.style.top = `${Math.random() * 100}%`
      star.style.width = `${Math.random() * 2 + 1}px`
      star.style.height = star.style.width
      star.style.animationDelay = `${Math.random() * 5}s`
      cosmicBackground.appendChild(star)
    }
  }

  // --- Spin Logic ---
  spinButton.addEventListener("click", async () => {
    if (!currentPlayerAddress || isSpinning) {
      displayMessage("Please connect your wallet and wait for the current spin to finish.", "error")
      return
    }

    isSpinning = true
    spinButton.disabled = true
    displayMessage("Spinning the cosmic wheel...", "info")
    rewardDisplay.textContent = "..."

    // Simulate spin animation
    const randomDegree = Math.floor(Math.random() * 360) + 360 * 5 // Spin at least 5 full rotations
    gameWheel.style.transition = `transform ${ANIMATION_SPEED === "fast" ? 3 : ANIMATION_SPEED === "slow" ? 6 : 4}s cubic-bezier(0.25, 0.1, 0.25, 1)`
    gameWheel.style.transform = `rotate(${randomDegree}deg)`

    // Fetch spin result from backend after a delay (simulating spin duration)
    setTimeout(
      async () => {
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

            // Trigger visual effects for win
            if (ENHANCED_EFFECTS) {
              triggerScreenFlash()
              const wheelRect = gameWheel.getBoundingClientRect()
              const centerX = wheelRect.left + wheelRect.width / 2
              const centerY = wheelRect.top + wheelRect.height / 2

              for (let i = 0; i < PARTICLE_COUNT; i++) {
                createParticle(centerX, centerY, `hsl(${Math.random() * 360}, 100%, 50%)`)
              }
              if (data.reward >= 10000 && FIREWORKS_ENABLED) {
                // Big win threshold
                createFireworks(centerX, centerY, ["#FF00FF", "#00FFFF", "#FFD700"])
              }
            }

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
          isSpinning = false
          spinButton.disabled = false
          // Reset wheel transition for next spin
          gameWheel.style.transition = "none"
          gameWheel.style.transform = `rotate(${randomDegree % 360}deg)` // Keep final orientation
        }
      },
      ANIMATION_SPEED === "fast" ? 3000 : ANIMATION_SPEED === "slow" ? 6000 : 4000,
    ) // Match spin duration
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
        body: JSON.stringify({ address: currentPlayerAddress, platform: "web" }), // Assuming web share
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

  // Initialize Web3 and connect wallet (simplified for demo)
  const initWeb3 = async () => {
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
