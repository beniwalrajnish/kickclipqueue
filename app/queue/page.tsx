"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { PlayCircle, Trash2, LogOut } from "lucide-react"
import { ChatManager } from "@/lib/chat"
import { VideoPlayer } from "@/components/video-player"
import { UserProfile } from "@/components/user-profile"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface Clip {
  id: string
  url: string
  submitter: string
  timestamp: string
  votes: number
  platform: "youtube" | "twitch" | "kick" | "streamable"
}

interface UserData {
  username: string
  avatar_url: string
  channel: {
    id: number
    slug: string
  }
}

export default function QueuePage() {
  const [clips, setClips] = useState<Clip[]>([])
  const [currentClip, setCurrentClip] = useState<Clip | null>(null)
  const [chatManager, setChatManager] = useState<ChatManager | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [userData, setUserData] = useState<UserData | null>(null)
  const router = useRouter()

  const handleClip = useCallback((clipInfo: any) => {
    console.log("Received clip:", clipInfo)
    setClips((prevClips) => {
      const isDuplicate = prevClips.some((clip) => clip.url === clipInfo.url)
      if (isDuplicate) {
        return prevClips
          .map((clip) => (clip.url === clipInfo.url ? { ...clip, votes: clip.votes + 1 } : clip))
          .sort((a, b) => b.votes - a.votes)
      }

      const newClip: Clip = {
        id: Math.random().toString(36).substr(2, 9),
        url: clipInfo.url,
        submitter: clipInfo.sender,
        timestamp: clipInfo.timestamp,
        platform: clipInfo.platform,
        votes: 1,
      }
      return [...prevClips, newClip]
    })
  }, [])

  const connectToChat = useCallback(async () => {
    if (isConnecting) return

    setIsConnecting(true)
    try {
      const manager = new ChatManager()
      const userData = await manager.initialize({
        onMessage: (msg) => {
          if (msg.type === "clip") handleClip(msg)
        },
      })
      setChatManager(manager)
      setUserData(userData)
      console.log("Connected with user data:", userData)
    } catch (error) {
      console.error("Failed to connect:", error)
      toast.error("Failed to connect to chat. Please try logging in again.")
    } finally {
      setIsConnecting(false)
    }
  }, [handleClip, isConnecting])

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      if (chatManager) {
        chatManager.disconnect()
      }
      router.push("/")
    } catch (error) {
      console.error("Logout error:", error)
      toast.error("Failed to logout")
    }
  }

  const removeClip = (id: string) => {
    setClips(clips.filter((clip) => clip.id !== id))
  }

  const playNext = () => {
    if (clips.length > 0) {
      setCurrentClip(clips[0])
      setClips(clips.slice(1))
    } else {
      setCurrentClip(null)
    }
  }

  const clearQueue = () => {
    setClips([])
    setCurrentClip(null)
  }

  useEffect(() => {
    connectToChat()
  }, [connectToChat])

  return (
    <div className="min-h-screen bg-[#0E0E10] text-white">
      <div className="container py-6 grid gap-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-[#00FF00]">Big Dog Clip Queue</h1>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-sm text-[#00FF00]">{clips.length} clips in queue</div>
            <Button onClick={clearQueue} variant="destructive" className="bg-red-600 hover:bg-red-700">
              Clear Queue
            </Button>
            {userData && (
              <div className="flex items-center gap-4">
                <UserProfile username={userData.username} avatar={userData.avatar_url} />
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="border-[#2D2D2F] hover:bg-[#2D2D2F] text-[#00FF00]"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          <Card className="col-span-9 bg-[#18181B] border-[#2D2D2F]">
            <div className="p-4">
              <h2 className="font-semibold mb-4 text-[#00FF00]">Current Clip</h2>
              {currentClip ? (
                <div>
                  <div className="aspect-video">
                    <VideoPlayer url={currentClip.url} />
                  </div>
                  <div className="flex justify-between items-center mt-4">
                    <div className="text-sm text-gray-400">
                      Submitted by {currentClip.submitter} • {currentClip.platform}
                    </div>
                    <Button onClick={playNext} className="bg-[#00FF00] hover:bg-[#00DD00] text-black">
                      Next Clip
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="aspect-video bg-[#0E0E10] rounded-lg flex items-center justify-center text-gray-400">
                  No clip playing
                </div>
              )}
            </div>
          </Card>

          <Card className="col-span-3 bg-[#18181B] border-[#2D2D2F]">
            <div className="p-4">
              <h2 className="font-semibold mb-4 text-[#00FF00]">Queue</h2>
              <ScrollArea className="h-[calc(100vh-240px)]">
                <div className="space-y-2">
                  {clips.map((clip) => (
                    <div
                      key={clip.id}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-[#2D2D2F] transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <PlayCircle className="h-4 w-4 text-[#00FF00]" />
                        <div>
                          <div className="font-medium truncate max-w-[160px]">{clip.platform} clip</div>
                          <div className="text-sm text-gray-400">
                            by {clip.submitter} • {clip.votes} votes
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeClip(clip.id)}
                        className="hover:bg-red-600/10 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

