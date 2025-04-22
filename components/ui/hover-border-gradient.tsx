"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface HoverBorderGradientProps extends React.HTMLAttributes<HTMLDivElement> {
  containerClassName?: string
  as?: React.ElementType
  animateGradient?: boolean
}

export const HoverBorderGradient = React.forwardRef<HTMLDivElement, HoverBorderGradientProps>(
  ({ className, containerClassName, children, as: Component = "div", animateGradient = true, ...props }, ref) => {
    return (
      <div className={cn("group relative rounded-lg p-[1px] overflow-hidden", containerClassName)} ref={ref} {...props}>
        <div
          className={cn(
            "absolute inset-0 rounded-lg z-[1] opacity-80",
            animateGradient ? "animate-gradient-border" : "",
          )}
          style={{
            background:
              "linear-gradient(var(--gradient-angle, 0deg), rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0), rgba(255, 255, 255, 0), rgba(255, 255, 255, 0.3))",
          }}
        />
        <Component className={cn("relative z-[2] rounded-lg bg-black", className)}>{children}</Component>
      </div>
    )
  },
)

HoverBorderGradient.displayName = "HoverBorderGradient"
