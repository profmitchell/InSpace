"use client"

import type React from "react"

import { useState, useEffect } from "react"

interface DemoObjectProps {
  position: { x: number; y: number; z: number }
  rotation: { x: number; y: number; z: number }
  type?: "cube" | "pyramid" | "sphere"
  color?: string
  size?: number
}

export const DemoObject: React.FC<DemoObjectProps> = ({
  position,
  rotation,
  type = "cube",
  color = "#ffffff",
  size = 32,
}) => {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div
      className="relative transition-transform"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        transform: `
          translateX(${position.x}px) 
          translateY(${position.y}px) 
          translateZ(${position.z}px)
          rotateX(${rotation.x}deg) 
          rotateY(${rotation.y}deg) 
          rotateZ(${rotation.z}deg)
        `,
        transition: "transform 0.1s ease-out",
      }}
    >
      {type === "cube" && (
        <div className="w-full h-full bg-white/20 border border-white/30 rounded-sm flex items-center justify-center">
          <div className="text-white/70 text-xs">Cube</div>
        </div>
      )}

      {type === "pyramid" && (
        <div className="w-full h-full relative">
          <div
            className="absolute inset-0"
            style={{
              clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
              backgroundColor: "rgba(255, 255, 255, 0.2)",
              border: "1px solid rgba(255, 255, 255, 0.3)",
            }}
          ></div>
          <div className="absolute inset-0 flex items-center justify-center pt-4">
            <div className="text-white/70 text-xs">Pyramid</div>
          </div>
        </div>
      )}

      {type === "sphere" && (
        <div className="w-full h-full rounded-full bg-white/20 border border-white/30 flex items-center justify-center">
          <div className="text-white/70 text-xs">Sphere</div>
        </div>
      )}
    </div>
  )
}
