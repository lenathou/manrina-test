import * as React from "react"
import { cn } from "@/lib/utils"

interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  orientation?: "vertical" | "horizontal"
  className?: string
}

interface ScrollBarProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "vertical" | "horizontal"
  className?: string
}

const ScrollArea = React.forwardRef<HTMLDivElement, ScrollAreaProps>(
  ({ className, children, orientation = "vertical", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative overflow-hidden",
          className
        )}
        {...props}
      >
        <div
          className={cn(
            "h-full w-full rounded-[inherit] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400",
            orientation === "vertical" ? "overflow-y-auto" : "overflow-x-auto"
          )}
        >
          {children}
        </div>
      </div>
    )
  }
)
ScrollArea.displayName = "ScrollArea"

const ScrollBar = React.forwardRef<HTMLDivElement, ScrollBarProps>(
  ({ className, orientation = "vertical", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex touch-none select-none transition-colors",
          orientation === "vertical"
            ? "h-full w-2.5 border-l border-l-transparent p-[1px]"
            : "h-2.5 w-full border-t border-t-transparent p-[1px]",
          className
        )}
        {...props}
      >
        <div
          className={cn(
            "relative flex-1 rounded-full bg-border",
            orientation === "vertical" ? "w-full" : "h-full"
          )}
        />
      </div>
    )
  }
)
ScrollBar.displayName = "ScrollBar"

export { ScrollArea, ScrollBar }