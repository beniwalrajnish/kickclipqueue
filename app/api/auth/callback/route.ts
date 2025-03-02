import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)

    console.log("Received callback with params:", Object.fromEntries(searchParams.entries()))

    const code = searchParams.get("code")
    const state = searchParams.get("state")
    const error = searchParams.get("error")

    if (error) {
      throw new Error(`OAuth error: ${error}`)
    }

    // Verify state
    const storedState = cookies().get("oauth_state")?.value
    if (!state || !storedState || state !== storedState) {
      throw new Error("Invalid state parameter")
    }

    // Get code verifier
    const codeVerifier = cookies().get("code_verifier")?.value
    if (!codeVerifier) {
      throw new Error("Missing code verifier")
    }

    if (!code) {
      throw new Error("Missing authorization code")
    }

    // Clear cookies
    cookies().delete("oauth_state")
    cookies().delete("code_verifier")

    // Prepare token exchange
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, "")
    const redirectUri = `${baseUrl}/api/auth/callback`

    const formData = new URLSearchParams()
    formData.append("grant_type", "authorization_code")
    formData.append("client_id", process.env.KICK_CLIENT_ID!)
    formData.append("client_secret", process.env.KICK_CLIENT_SECRET!)
    formData.append("code", code)
    formData.append("redirect_uri", redirectUri)
    formData.append("code_verifier", codeVerifier)

    console.log("Token exchange parameters:", {
      grantType: "authorization_code",
      clientId: process.env.KICK_CLIENT_ID,
      redirectUri,
      code,
      hasCodeVerifier: !!codeVerifier,
    })

    // Exchange code for token
    const tokenResponse = await fetch("https://id.kick.com/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: formData,
    })

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text()
      console.error("Token exchange failed:", {
        status: tokenResponse.status,
        error: errorText,
      })
      throw new Error("Failed to exchange code for token")
    }

    const tokenData = await tokenResponse.json()
    console.log("Token exchange successful")

    // Create response with redirect
    const response = NextResponse.redirect(`${baseUrl}/queue`)

    // Set the access token in an HTTP-only cookie
    response.cookies.set("kick_access_token", tokenData.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: tokenData.expires_in || 3600,
      path: "/",
    })

    return response
  } catch (error) {
    console.error("Callback error:", error)
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, "")
    const errorMessage = error instanceof Error ? error.message : "Authentication failed"

    return NextResponse.redirect(`${baseUrl}?error=${encodeURIComponent(errorMessage)}`)
  }
}

export const dynamic = "force-dynamic"

