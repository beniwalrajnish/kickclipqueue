import * as React from "react"
import { cn } from "@/lib/utils"

const ScrollArea = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <div className={cn("relative overflow-hidden", className)} ref={ref} {...props}>
        <div className="overflow-y-auto scrollbar-hide relative">{children}</div>
      </div>
    )
  },
)
ScrollArea.displayName = "ScrollArea"

export { ScrollArea }

