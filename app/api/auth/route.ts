import { NextResponse } from "next/server"

export async function GET() {
  try {
    const response = await fetch("/api/auth")
    const data = await response.json()
    return NextResponse.json({ token: data.token })
  } catch (error) {
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 })
  }
}

