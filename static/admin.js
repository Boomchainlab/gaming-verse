document.addEventListener("DOMContentLoaded", () => {
  const messageDiv = document.getElementById("message")

  const displayMessage = (msg, type) => {
    messageDiv.textContent = msg
    messageDiv.className = `message ${type}`
  }

  // Player Management
  const playerAddressInput = document.getElementById("playerAddress")
  const usernameInput = document.getElementById("username")
  const levelInput = document.getElementById("level")
  const xpInput = document.getElementById("xp")
  const tokensWonInput = document.getElementById("tokensWon")
  const dailyStreakInput = document.getElementById("dailyStreak")
  const referralCodeInput = document.getElementById("referralCode")
  const referredByInput = document.getElementById("referredBy")
  const socialSharesInput = document.getElementById("socialShares")
  const achievementsInput = document.getElementById("achievements")
  const savePlayerButton = document.getElementById("savePlayerButton")
  const deletePlayerButton = document.getElementById("deletePlayerButton")
  const fetchPlayerButton = document.getElementById("fetchPlayerButton")
  const playerListBody = document.getElementById("playerListBody")

  const fetchPlayers = async () => {
    try {
      const response = await fetch("/admin/api/players")
      const players = await response.json()
      playerListBody.innerHTML = ""
      players.forEach((player) => {
        const row = playerListBody.insertRow()
        row.insertCell().textContent =
          player.address.substring(0, 6) + "..." + player.address.substring(player.address.length - 4)
        row.insertCell().textContent = player.username
        row.insertCell().textContent = player.level
        row.insertCell().textContent = player.total_tokens_won
        row.insertCell().textContent = player.daily_streak
        const actionsCell = row.insertCell()
        const editButton = document.createElement("button")
        editButton.textContent = "Edit"
        editButton.onclick = () => loadPlayerForEdit(player.address)
        actionsCell.appendChild(editButton)
      })
    } catch (error) {
      console.error("Error fetching players:", error)
      displayMessage("Failed to fetch players.", "error")
    }
  }

  const loadPlayerForEdit = async (address) => {
    try {
      const response = await fetch(`/admin/api/player/${address}`)
      const player = await response.json()
      if (player) {
        playerAddressInput.value = player.address
        usernameInput.value = player.username
        levelInput.value = player.level
        xpInput.value = player.xp
        tokensWonInput.value = player.total_tokens_won
        dailyStreakInput.value = player.daily_streak
        referralCodeInput.value = player.referral_code
        referredByInput.value = player.referred_by || ""
        socialSharesInput.value = player.social_shares
        achievementsInput.value = JSON.stringify(player.achievements)
        displayMessage(`Player ${player.username} loaded for editing.`, "info")
      } else {
        displayMessage("Player not found.", "error")
      }
    } catch (error) {
      console.error("Error loading player:", error)
      displayMessage("Failed to load player for editing.", "error")
    }
  }

  fetchPlayerButton.addEventListener("click", () => {
    const address = playerAddressInput.value
    if (address) {
      loadPlayerForEdit(address)
    } else {
      displayMessage("Please enter a player address to fetch.", "error")
    }
  })

  savePlayerButton.addEventListener("click", async () => {
    const address = playerAddressInput.value
    const playerData = {
      username: usernameInput.value,
      level: Number.parseInt(levelInput.value),
      xp: Number.parseInt(xpInput.value),
      total_tokens_won: Number.parseInt(tokensWonInput.value),
      daily_streak: Number.parseInt(dailyStreakInput.value),
      referral_code: referralCodeInput.value,
      referred_by: referredByInput.value || null,
      social_shares: Number.parseInt(socialSharesInput.value),
      achievements: JSON.parse(achievementsInput.value || "[]"),
    }

    try {
      const response = await fetch(`/admin/api/player/${address}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(playerData),
      })
      const result = await response.json()
      if (result.success) {
        displayMessage("Player updated successfully!", "success")
        fetchPlayers()
      } else {
        displayMessage(`Failed to update player: ${result.error}`, "error")
      }
    } catch (error) {
      console.error("Error saving player:", error)
      displayMessage("Failed to save player.", "error")
    }
  })

  deletePlayerButton.addEventListener("click", async () => {
    const address = playerAddressInput.value
    if (!address) {
      displayMessage("Please enter a player address to delete.", "error")
      return
    }
    if (!confirm(`Are you sure you want to delete player ${address}?`)) {
      return
    }

    try {
      const response = await fetch(`/admin/api/player/${address}`, {
        method: "DELETE",
      })
      const result = await response.json()
      if (result.success) {
        displayMessage("Player deleted successfully!", "success")
        playerAddressInput.value = "" // Clear form
        fetchPlayers()
      } else {
        displayMessage(`Failed to delete player: ${result.error}`, "error")
      }
    } catch (error) {
      console.error("Error deleting player:", error)
      displayMessage("Failed to delete player.", "error")
    }
  })

  // Achievement Management
  const achievementNameInput = document.getElementById("achievementName")
  const achievementDescriptionInput = document.getElementById("achievementDescription")
  const achievementIconInput = document.getElementById("achievementIcon")
  const achievementRewardInput = document.getElementById("achievementReward")
  const achievementRequirementTypeInput = document.getElementById("achievementRequirementType")
  const achievementRequirementValueInput = document.getElementById("achievementRequirementValue")
  const saveAchievementButton = document.getElementById("saveAchievementButton")
  const deleteAchievementButton = document.getElementById("deleteAchievementButton")
  const achievementListBody = document.getElementById("achievementListBody")

  const fetchAchievements = async () => {
    try {
      const response = await fetch("/admin/api/achievements")
      const achievements = await response.json()
      achievementListBody.innerHTML = ""
      achievements.forEach((achievement) => {
        const row = achievementListBody.insertRow()
        row.insertCell().textContent = achievement.name
        row.insertCell().textContent = achievement.description
        row.insertCell().textContent = achievement.reward_tokens
        row.insertCell().textContent = `${achievement.requirement_type}: ${achievement.requirement_value}`
        const actionsCell = row.insertCell()
        const editButton = document.createElement("button")
        editButton.textContent = "Edit"
        editButton.onclick = () => loadAchievementForEdit(achievement.id)
        actionsCell.appendChild(editButton)
      })
    } catch (error) {
      console.error("Error fetching achievements:", error)
      displayMessage("Failed to fetch achievements.", "error")
    }
  }

  const loadAchievementForEdit = async (id) => {
    try {
      const response = await fetch(`/admin/api/achievement/${id}`)
      const achievement = await response.json()
      if (achievement) {
        achievementNameInput.value = achievement.name
        achievementDescriptionInput.value = achievement.description
        achievementIconInput.value = achievement.icon
        achievementRewardInput.value = achievement.reward_tokens
        achievementRequirementTypeInput.value = achievement.requirement_type
        achievementRequirementValueInput.value = achievement.requirement_value
        saveAchievementButton.dataset.id = achievement.id // Store ID for update
        displayMessage(`Achievement ${achievement.name} loaded for editing.`, "info")
      } else {
        displayMessage("Achievement not found.", "error")
      }
    } catch (error) {
      console.error("Error loading achievement:", error)
      displayMessage("Failed to load achievement for editing.", "error")
    }
  }

  saveAchievementButton.addEventListener("click", async () => {
    const id = saveAchievementButton.dataset.id
    const achievementData = {
      name: achievementNameInput.value,
      description: achievementDescriptionInput.value,
      icon: achievementIconInput.value,
      reward_tokens: Number.parseInt(achievementRewardInput.value),
      requirement_type: achievementRequirementTypeInput.value,
      requirement_value: Number.parseInt(achievementRequirementValueInput.value),
    }

    const method = id ? "PUT" : "POST"
    const url = id ? `/admin/api/achievement/${id}` : "/admin/api/achievements"

    try {
      const response = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(achievementData),
      })
      const result = await response.json()
      if (result.success) {
        displayMessage(`Achievement ${id ? "updated" : "added"} successfully!`, "success")
        saveAchievementButton.dataset.id = "" // Clear ID after save
        fetchAchievements()
      } else {
        displayMessage(`Failed to ${id ? "update" : "add"} achievement: ${result.error}`, "error")
      }
    } catch (error) {
      console.error("Error saving achievement:", error)
      displayMessage("Failed to save achievement.", "error")
    }
  })

  deleteAchievementButton.addEventListener("click", async () => {
    const id = saveAchievementButton.dataset.id
    if (!id) {
      displayMessage("Please load an achievement to delete.", "error")
      return
    }
    if (!confirm(`Are you sure you want to delete achievement ID ${id}?`)) {
      return
    }

    try {
      const response = await fetch(`/admin/api/achievement/${id}`, {
        method: "DELETE",
      })
      const result = await response.json()
      if (result.success) {
        displayMessage("Achievement deleted successfully!", "success")
        saveAchievementButton.dataset.id = "" // Clear ID
        achievementNameInput.value = "" // Clear form
        fetchAchievements()
      } else {
        displayMessage(`Failed to delete achievement: ${result.error}`, "error")
      }
    } catch (error) {
      console.error("Error deleting achievement:", error)
      displayMessage("Failed to delete achievement.", "error")
    }
  })

  // Initial fetches
  fetchPlayers()
  fetchAchievements()
})
