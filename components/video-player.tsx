"use client"

import { useEffect, useRef } from "react"

interface VideoPlayerProps {
  url: string
}

export function VideoPlayer({ url }: VideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Clear previous content
    containerRef.current.innerHTML = ""

    // Create appropriate embed based on URL
    const iframe = document.createElement("iframe")
    iframe.width = "100%"
    iframe.height = "100%"
    iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    iframe.allowFullscreen = true

    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      // Extract YouTube video ID
      let videoId = ""
      if (url.includes("youtube.com/watch?v=")) {
        videoId = url.split("v=")[1]?.split("&")[0] || ""
      } else if (url.includes("youtu.be/")) {
        videoId = url.split("youtu.be/")[1]?.split("?")[0] || ""
      }
      iframe.src = `https://www.youtube.com/embed/${videoId}`
    } else if (url.includes("twitch.tv")) {
      // Extract Twitch clip ID
      const clipId = url.split("clip/")[1]?.split("?")[0] || ""
      iframe.src = `https://clips.twitch.tv/embed?clip=${clipId}&parent=${window.location.hostname}`
    } else if (url.includes("kick.com")) {
      // For Kick clips, we'll need to implement their embed when available
      const div = document.createElement("div")
      div.textContent = "Kick clip player coming soon"
      div.className = "w-full h-full flex items-center justify-center bg-[#18181B] text-gray-400"
      containerRef.current.appendChild(div)
      return
    } else if (url.includes("streamable.com")) {
      // Extract Streamable video ID
      const videoId = url.split("streamable.com/")[1]?.split("?")[0] || ""
      iframe.src = `https://streamable.com/e/${videoId}`
    }

    if (iframe.src) {
      containerRef.current.appendChild(iframe)
    }
  }, [url])

  return <div ref={containerRef} className="aspect-video bg-black rounded-lg overflow-hidden" />
}

