import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface UserProfileProps {
  username: string
  avatar?: string
}

export function UserProfile({ username, avatar }: UserProfileProps) {
  return (
    <div className="flex items-center gap-3">
      <Avatar className="h-8 w-8 border border-[#2D2D2F]">
        <AvatarImage src={avatar} alt={username} />
        <AvatarFallback className="bg-[#18181B] text-[#00FF00]">{username.slice(0, 2).toUpperCase()}</AvatarFallback>
      </Avatar>
      <span className="text-sm text-[#00FF00]">{username}</span>
    </div>
  )
}

