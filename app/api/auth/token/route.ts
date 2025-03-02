import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function GET() {
  const accessToken = cookies().get("kick_access_token")?.value

  if (!accessToken) {
    return NextResponse.json({ error: "No access token found" }, { status: 401 })
  }

  return NextResponse.json({ accessToken })
}

