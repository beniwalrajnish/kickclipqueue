"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface Clip {
  id: string
  timestamp: string
  creator: string
  status: "pending" | "processing" | "completed"
}

export function ClipQueue() {
  const [clips, setClips] = useState<Clip[]>([])

  const createClip = async () => {
    // Implementation for creating a clip via Kick API
    // This would typically involve:
    // 1. Getting current timestamp
    // 2. Making API call to create clip
    // 3. Adding clip to queue
    const newClip: Clip = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      creator: "System",
      status: "pending",
    }

    setClips((prev) => [...prev, newClip])
  }

  const removeClip = (id: string) => {
    setClips((prev) => prev.filter((clip) => clip.id !== id))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Clip Queue</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] w-full rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Creator</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clips.map((clip) => (
                <TableRow key={clip.id}>
                  <TableCell>{new Date(clip.timestamp).toLocaleTimeString()}</TableCell>
                  <TableCell>{clip.creator}</TableCell>
                  <TableCell>
                    <span
                      className={`capitalize ${
                        clip.status === "completed"
                          ? "text-green-500"
                          : clip.status === "processing"
                            ? "text-yellow-500"
                            : "text-blue-500"
                      }`}
                    >
                      {clip.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button variant="destructive" size="sm" onClick={() => removeClip(clip.id)}>
                      Remove
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

