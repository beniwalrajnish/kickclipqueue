import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Log middleware execution
  console.log("Middleware executing for:", request.nextUrl.pathname)

  // Get the pathname
  const path = request.nextUrl.pathname

  // Get the token from cookies
  const token = request.cookies.get("kick_access_token")?.value

  // Log the token presence
  console.log("Token present:", !!token)

  // Paths that require authentication
  const protectedPaths = ["/queue"]

  // Check if the path requires authentication
  const isProtectedPath = protectedPaths.some((pp) => path.startsWith(pp))

  // Log the path check
  console.log("Path check:", { path, isProtectedPath })

  // Redirect to home if trying to access protected path without token
  if (isProtectedPath && !token) {
    console.log("Redirecting to home - no token")
    return NextResponse.redirect(new URL("/", request.url))
  }

  // Redirect to queue if already logged in and trying to access login page
  if (path === "/" && token) {
    console.log("Redirecting to queue - already logged in")
    return NextResponse.redirect(new URL("/queue", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/", "/queue/:path*"],
}

