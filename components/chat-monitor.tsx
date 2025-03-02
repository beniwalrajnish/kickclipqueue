"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

interface ChatMessage {
  id: string
  content: string
  sender: string
  timestamp: string
}

export function ChatMonitor() {
  const [channelId, setChannelId] = useState("")
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [connected, setConnected] = useState(false)
  const [ws, setWs] = useState<WebSocket | null>(null)

  useEffect(() => {
    return () => {
      if (ws) {
        ws.close()
      }
    }
  }, [ws])

  const connectToChat = () => {
    if (!channelId) return

    const websocket = new WebSocket(`wss://ws-us2.pusher.com/app/${channelId}`)

    websocket.onopen = () => {
      setConnected(true)
      console.log("Connected to chat")
    }

    websocket.onmessage = (event) => {
      const data = JSON.parse(event.data)
      if (data.event === "App\\Events\\ChatMessageEvent") {
        const message = JSON.parse(data.data)
        setMessages((prev) => [
          ...prev,
          {
            id: message.id,
            content: message.content,
            sender: message.sender.username,
            timestamp: new Date().toISOString(),
          },
        ])
      }
    }

    websocket.onclose = () => {
      setConnected(false)
      console.log("Disconnected from chat")
    }

    setWs(websocket)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Chat Monitor</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-4">
          <Input placeholder="Enter channel ID" value={channelId} onChange={(e) => setChannelId(e.target.value)} />
          <Button onClick={connectToChat} variant={connected ? "destructive" : "default"}>
            {connected ? "Disconnect" : "Connect"}
          </Button>
        </div>
        <ScrollArea className="h-[400px] w-full rounded-md border p-4">
          {messages.map((message) => (
            <div key={message.id} className="mb-2">
              <span className="font-bold">{message.sender}: </span>
              <span>{message.content}</span>
            </div>
          ))}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

