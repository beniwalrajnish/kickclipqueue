import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { generateCodeVerifier, generateCodeChallenge } from "@/lib/pkce"

export async function GET() {
  try {
    // Generate PKCE values
    const codeVerifier = generateCodeVerifier()
    const codeChallenge = await generateCodeChallenge(codeVerifier)

    // Generate state
    const state = crypto.randomUUID()

    // Store PKCE verifier and state in cookies
    cookies().set("code_verifier", codeVerifier, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 5,
      path: "/",
    })

    cookies().set("oauth_state", state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 5,
      path: "/",
    })

    // Construct redirect URI
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, "")
    const redirectUri = `${baseUrl}/api/auth/callback`

    // Construct OAuth URL exactly matching the working example
    const params = new URLSearchParams({
      response_type: "code",
      client_id: process.env.KICK_CLIENT_ID!,
      redirect_uri: redirectUri,
      scope: "chat:write chat:read channel:read user:read events:subscribe",
      code_challenge: codeChallenge,
      code_challenge_method: "S256",
      state: state,
    })

    const authUrl = `https://id.kick.com/oauth/authorize?${params}`

    console.log("Auth URL generated:", {
      url: authUrl,
      codeChallenge,
      state,
    })

    return NextResponse.json({ authUrl })
  } catch (error) {
    console.error("Login initialization error:", error)
    return NextResponse.json({ error: "Failed to initialize login" }, { status: 500 })
  }
}

