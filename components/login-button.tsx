"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

export function LoginButton() {
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async () => {
    setIsLoading(true)
    try {
      // Make the request to our login endpoint
      const response = await fetch("/api/auth/login")
      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      if (!data.authUrl) {
        throw new Error("No authorization URL received")
      }

      // Log the URL we're redirecting to
      console.log("Redirecting to Kick OAuth:", data.authUrl)

      // Use direct window.location.href for the redirect
      window.location.href = data.authUrl
    } catch (error) {
      console.error("Login error:", error)
      toast.error(error instanceof Error ? error.message : "Failed to initialize login")
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={handleLogin}
      disabled={isLoading}
      className="bg-[#00FF00] hover:bg-[#00DD00] text-black font-semibold"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Connecting to Kick...
        </>
      ) : (
        "Login with Kick"
      )}
    </Button>
  )
}

