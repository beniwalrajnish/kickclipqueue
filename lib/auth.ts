export async function validateKickToken(token: string) {
  try {
    const response = await fetch("https://kick.com/api/v2/user/me", {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    })

    return response.ok
  } catch (error) {
    console.error("Token validation error:", error)
    return false
  }
}

