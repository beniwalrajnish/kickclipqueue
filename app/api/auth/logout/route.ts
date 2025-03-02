import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST() {
  // Clear the access token cookie
  cookies().delete("kick_access_token")

  return NextResponse.json({ success: true })
}

