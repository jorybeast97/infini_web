import * as React from "react"
import { cn } from "./utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "outline";
  className?: string;
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(({ className, variant = "secondary", ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "inline-flex items-center rounded-full border border-border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        variant === "outline" ? "text-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        className
      )}
      {...props}
    />
  )
})
Badge.displayName = "Badge"

export { Badge }