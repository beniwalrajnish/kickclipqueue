type MessageHandler = (message: any) => void
type ChatOptions = {
  onMessage?: MessageHandler
  onClip?: (clip: ClipInfo) => void
  onCommand?: (command: CommandInfo) => void
}

type ClipInfo = {
  url: string
  sender: string
  timestamp: string
  platform: "youtube" | "twitch" | "kick" | "streamable"
}

type CommandInfo = {
  command: string
  sender: string
  isModerator: boolean
}

type KickUserData = {
  id: number
  username: string
  email: string
  avatar_url: string
  channel: {
    id: number
    user_id: number
    slug: string
    chatroom: {
      id: number
      chatable_type: string
      channel_id: number
    }
  }
}

export class ChatManager {
  private ws: WebSocket | null = null
  private messageHandlers: Set<MessageHandler> = new Set()
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private username = ""
  private chatroomId = ""
  private accessToken = ""
  private channelId = ""

  async initialize(options: ChatOptions) {
    try {
      // First get the access token
      const tokenResponse = await fetch("/api/auth/token")
      if (!tokenResponse.ok) {
        throw new Error("Failed to get access token")
      }
      const { accessToken } = await tokenResponse.json()
      this.accessToken = accessToken

      // Get user info to get the channel name and chatroom ID
      const userResponse = await fetch("https://kick.com/api/v2/channels/me", {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${this.accessToken}`,
        },
      })

      if (!userResponse.ok) {
        console.error("User info response:", await userResponse.text())
        throw new Error("Failed to get user info")
      }

      const channelData = await userResponse.json()
      console.log("Channel data:", channelData)

      // Get user profile data
      const profileResponse = await fetch("https://kick.com/api/v2/user/me", {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${this.accessToken}`,
        },
      })

      if (!profileResponse.ok) {
        console.error("Profile response:", await profileResponse.text())
        throw new Error("Failed to get profile info")
      }

      const profileData = await profileResponse.json()
      console.log("Profile data:", profileData)

      this.username = profileData.username
      this.chatroomId = channelData.chatroom.id.toString()
      this.channelId = channelData.id.toString()

      if (options.onMessage) this.messageHandlers.add(options.onMessage)

      await this.connect()
      return {
        username: profileData.username,
        avatar_url: profileData.avatar_url,
        channel: {
          id: channelData.id,
          slug: channelData.slug,
        },
      }
    } catch (error) {
      console.error("Failed to initialize chat:", error)
      throw error
    }
  }

  private async connect() {
    if (!this.username || !this.chatroomId || !this.channelId) {
      console.error("Missing required data:", {
        username: this.username,
        chatroomId: this.chatroomId,
        channelId: this.channelId,
      })
      return
    }

    try {
      console.log("Connecting to chat with:", {
        username: this.username,
        chatroomId: this.chatroomId,
        channelId: this.channelId,
      })

      // Get chat connection info
      const connectResponse = await fetch(`https://kick.com/api/v2/channels/${this.channelId}/chat`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${this.accessToken}`,
        },
      })

      if (!connectResponse.ok) {
        throw new Error("Failed to get chat connection info")
      }

      const connectData = await connectResponse.json()
      console.log("Chat connection data:", connectData)

      // Connect to Kick's chat websocket using the provided data
      this.ws = new WebSocket(connectData.websocket.endpoint)

      this.ws.onopen = () => {
        if (this.ws?.readyState === WebSocket.OPEN) {
          // Send connection message
          const connectMessage = {
            event: "pusher:subscribe",
            data: {
              auth: connectData.websocket.auth,
              channel: `chatrooms.${this.chatroomId}.v2`,
            },
          }
          console.log("Sending connect message:", connectMessage)
          this.ws.send(JSON.stringify(connectMessage))

          // Send presence message
          const presenceMessage = {
            event: "pusher:subscribe",
            data: {
              auth: connectData.websocket.auth,
              channel: `presence-chatrooms.${this.chatroomId}.v2`,
            },
          }
          console.log("Sending presence message:", presenceMessage)
          this.ws.send(JSON.stringify(presenceMessage))
        }
        this.reconnectAttempts = 0
        console.log("Connected to chat")
      }

      this.ws.onmessage = this.handleWebSocketMessage.bind(this)

      this.ws.onclose = (event) => {
        console.log("Disconnected from chat:", event)
        this.handleReconnect()
      }

      this.ws.onerror = (error) => {
        console.error("WebSocket error:", error)
        this.handleReconnect()
      }
    } catch (error) {
      console.error("Connection error:", error)
      this.handleReconnect()
    }
  }

  private handleWebSocketMessage(event: MessageEvent) {
    try {
      const data = JSON.parse(event.data)
      console.log("Received message:", data)

      // Handle different message types
      switch (data.event) {
        case "pusher:connection_established":
          console.log("Connection established")
          break
        case "pusher_internal:subscription_succeeded":
          console.log("Subscription succeeded")
          break
        case "App\\Events\\ChatMessageEvent":
          const message = JSON.parse(data.data)
          console.log("Chat message:", message)
          this.messageHandlers.forEach((handler) => handler(message))

          // Check for clips using improved URL detection
          const urls = this.extractUrls(message.content)
          console.log("Extracted URLs:", urls)

          urls.forEach(({ url, platform }) => {
            this.handleClip({
              url,
              sender: message.sender.username,
              timestamp: new Date().toISOString(),
              platform,
            })
          })
          break
        default:
          console.log("Unhandled message type:", data.event)
      }
    } catch (error) {
      console.error("Error handling message:", error)
    }
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000)
      setTimeout(() => this.connect(), delay)
    }
  }

  private extractUrls(content: string): Array<{ url: string; platform: ClipInfo["platform"] }> {
    const patterns = [
      {
        pattern: /https?:\/\/(?:www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)(?:&\S*)?/i,
        platform: "youtube" as const,
        process: (match: RegExpMatchArray) => {
          const videoId = match[2]
          return `https://www.youtube.com/watch?v=${videoId}`
        },
      },
      {
        pattern: /https?:\/\/(?:www\.)?twitch\.tv\/\w+\/clip\/([a-zA-Z0-9_-]+)/i,
        platform: "twitch" as const,
        process: (match: RegExpMatchArray) => match[0],
      },
      {
        pattern: /https?:\/\/(?:www\.)?kick\.com\/(?:[a-zA-Z0-9-]+\/)?clip\/([a-zA-Z0-9-]+)/i,
        platform: "kick" as const,
        process: (match: RegExpMatchArray) => match[0],
      },
      {
        pattern: /https?:\/\/(?:www\.)?streamable\.com\/([a-zA-Z0-9]+)/i,
        platform: "streamable" as const,
        process: (match: RegExpMatchArray) => match[0],
      },
    ]

    const urls: Array<{ url: string; platform: ClipInfo["platform"] }> = []

    const words = content.split(/\s+/)
    console.log("Processing words:", words)

    words.forEach((word) => {
      patterns.forEach(({ pattern, platform, process }) => {
        const match = word.match(pattern)
        if (match) {
          console.log(`Found ${platform} URL:`, word)
          urls.push({
            url: process(match),
            platform,
          })
        }
      })
    })

    return urls
  }

  private handleClip(clipInfo: ClipInfo) {
    console.log("Handling clip:", clipInfo)
    this.messageHandlers.forEach((handler) =>
      handler({
        type: "clip",
        ...clipInfo,
      }),
    )
  }

  disconnect() {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    this.messageHandlers.clear()
  }

  onMessage(handler: MessageHandler) {
    this.messageHandlers.add(handler)
    return () => this.messageHandlers.delete(handler)
  }
}

