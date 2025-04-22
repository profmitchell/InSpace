"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence, useMotionValue } from "framer-motion"

type GizmoMode = "transform" | "rotate"
type RotationAxis = "x" | "y" | "z" | null
type Axis = "x" | "y" | "z"

interface GizmoControllerProps {
  mode: GizmoMode
  onToggleMode?: () => void
}

export const InSpace: React.FC<GizmoControllerProps> = ({ mode, onToggleMode }) => {
  const [currentMode, setCurrentMode] = useState<GizmoMode>(mode)
  const [isDragging, setIsDragging] = useState(false)
  const [pathProgress, setPathProgress] = useState(0)
  const [activeRotationAxis, setActiveRotationAxis] = useState<RotationAxis>(null)
  const [activeAxis, setActiveAxis] = useState<Axis>("x")

  // Box position and rotation state
  const [boxPosition, setBoxPosition] = useState({ x: 0, y: 0, z: 0 })
  const [boxRotation, setBoxRotation] = useState({ x: 0, y: 0, z: 0 })

  // Motion values for the handle
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  // Reference to the SVG element for coordinate calculations
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    setCurrentMode(mode)
  }, [mode])

  const handleToggle = () => {
    const newMode = currentMode === "transform" ? "rotate" : "transform"
    setCurrentMode(newMode)
    onToggleMode?.()
  }

  // Calculate the closest point on the path for a given position
  const calculateClosestPointOnPath = (dragX: number, dragY: number) => {
    if (!svgRef.current) return { x: 0, y: 0, progress: 0 }

    // Get SVG dimensions
    const svgRect = svgRef.current.getBoundingClientRect()
    const centerX = svgRect.width / 2
    const centerY = svgRect.height / 2

    // Calculate relative position from center
    const relX = dragX - centerX
    const relY = dragY - centerY

    if (currentMode === "transform") {
      // For transform mode, we'll use the closest point on one of the three axes
      // Calculate distances to each axis
      const distToXAxis = Math.abs(relY)
      const distToYAxis = Math.abs(relX)
      const distToZAxis = Math.abs(relX * 0.707 + relY * 0.707) // Approximate for 45-degree Z axis

      // Find the closest axis
      const minDist = Math.min(distToXAxis, distToYAxis, distToZAxis)

      if (minDist === distToXAxis) {
        // Closest to X axis
        // Clamp x between -45 and 45
        const clampedX = Math.max(-45, Math.min(45, relX))
        // Calculate progress from -1 to 1 (centered at 0)
        const normalizedProgress = clampedX / 45

        setActiveAxis("x")

        // Update box position
        setBoxPosition((prev) => ({ ...prev, x: normalizedProgress * 50 }))

        return {
          x: clampedX,
          y: 0,
          progress: normalizedProgress,
          axis: "x",
        }
      } else if (minDist === distToYAxis) {
        // Closest to Y axis
        // Clamp y between -45 and 45
        const clampedY = Math.max(-45, Math.min(45, relY))
        // Calculate progress from -1 to 1 (centered at 0)
        const normalizedProgress = -clampedY / 45 // Invert Y for natural up/down

        setActiveAxis("y")

        // Update box position
        setBoxPosition((prev) => ({ ...prev, y: normalizedProgress * 50 }))

        return {
          x: 0,
          y: clampedY,
          progress: normalizedProgress,
          axis: "y",
        }
      } else {
        // Closest to Z axis
        // Calculate projection onto Z axis (which is at -45 degrees)
        const projectionLength = (relX * -0.707 + relY * 0.707) * 0.707
        // Clamp projection between -45 and 45
        const clampedProj = Math.max(-45, Math.min(45, projectionLength))
        // Calculate progress from -1 to 1 (centered at 0)
        const normalizedProgress = clampedProj / 45

        setActiveAxis("z")

        // Update box position
        setBoxPosition((prev) => ({ ...prev, z: normalizedProgress * 50 }))

        return {
          x: -clampedProj * 0.707,
          y: clampedProj * 0.707,
          progress: normalizedProgress,
          axis: "z",
        }
      }
    } else {
      // For rotate mode, determine which axis to rotate around based on drag direction
      // Calculate distance from center
      const distance = Math.sqrt(relX * relX + relY * relY)

      // If we're just starting to drag, determine which axis to rotate around
      if (distance > 10 && activeRotationAxis === null) {
        // Determine which axis based on drag direction
        const angle = Math.atan2(relY, relX) * (180 / Math.PI)

        // X axis (red) - horizontal drag
        if ((angle > -45 && angle < 45) || angle > 135 || angle < -135) {
          setActiveRotationAxis("x")
        }
        // Y axis (green) - vertical drag
        else if ((angle > 45 && angle < 135) || (angle < -45 && angle > -135)) {
          setActiveRotationAxis("y")
        }
      }

      // If no axis is selected yet, return center position
      if (activeRotationAxis === null) {
        return { x: 0, y: 0, progress: 0, axis: null }
      }

      // Calculate angle from center
      const angle = Math.atan2(relY, relX)

      // Calculate rotation angle in degrees (0-360)
      const degrees = ((angle + Math.PI) / (2 * Math.PI)) * 360

      // Get radius based on active axis
      const radius = 45

      // Calculate position on the circle
      let posX = 0
      let posY = 0

      // Different calculation based on which axis we're rotating around
      if (activeRotationAxis === "x") {
        // Rotation around X axis - YZ plane (red)
        posX = Math.cos(angle) * radius
        posY = Math.sin(angle) * radius

        // Update box rotation
        setBoxRotation((prev) => ({ ...prev, x: degrees }))
      } else if (activeRotationAxis === "y") {
        // Rotation around Y axis - XZ plane (green)
        posX = Math.cos(angle) * radius
        posY = Math.sin(angle) * radius

        // Update box rotation
        setBoxRotation((prev) => ({ ...prev, y: degrees }))
      } else if (activeRotationAxis === "z") {
        // Rotation around Z axis - XY plane (blue)
        posX = Math.cos(angle) * radius
        posY = Math.sin(angle) * radius

        // Update box rotation
        setBoxRotation((prev) => ({ ...prev, z: degrees }))
      }

      return {
        x: posX,
        y: posY,
        progress: angle / Math.PI, // -1 to 1 range
        axis: activeRotationAxis,
      }
    }
  }

  const handleDragStart = () => {
    setIsDragging(true)
  }

  const handleDragEnd = () => {
    setIsDragging(false)

    // Reset active rotation axis
    setActiveRotationAxis(null)

    // In both modes, snap the handle back to center
    x.set(0)
    y.set(0)
    setPathProgress(0)
  }

  const handleDrag = (event: MouseEvent | TouchEvent | PointerEvent, info: { point: { x: number; y: number } }) => {
    if (!svgRef.current) return

    // Get SVG coordinates
    const svgRect = svgRef.current.getBoundingClientRect()
    const localX = info.point.x - svgRect.left
    const localY = info.point.y - svgRect.top

    // Calculate closest point on path
    const result = calculateClosestPointOnPath(localX, localY)

    // Update position
    x.set(result.x)
    y.set(result.y)
    setPathProgress(result.progress)
  }

  // Get axis color
  const getAxisColor = (axis: Axis | null) => {
    if (axis === null) return "#ffffff"

    const colors = {
      x: "#FF4136", // Red
      y: "#2ECC40", // Green
      z: "#0074D9", // Blue
    }
    return colors[axis]
  }

  // Get handle color based on active axis
  const getHandleColor = () => {
    if (currentMode === "transform") {
      return isDragging ? getAxisColor(activeAxis) : "#f0f0f0"
    } else {
      return isDragging && activeRotationAxis ? getAxisColor(activeRotationAxis) : "#f0f0f0"
    }
  }

  // Format progress value for display
  const formatProgress = (value: number) => {
    // Convert to percentage and round to nearest integer
    const percentage = Math.round(value * 100)
    // Add + sign for positive values
    return percentage > 0 ? `+${percentage}%` : `${percentage}%`
  }

  // Format rotation angle for display
  const formatRotationAngle = (axis: Axis) => {
    const angle = Math.round(boxRotation[axis])
    return `${angle}°`
  }

  return (
    <div className="flex flex-row items-center justify-center gap-8 p-4">
      {/* Demo Canvas */}
      <div className="w-48 h-48 bg-gray-800/50 backdrop-blur-md rounded-xl shadow-inner flex items-center justify-center perspective-500">
        <div
          className="w-24 h-24 bg-white/20 border border-white/30 rounded-sm"
          style={{
            transform: `
              translateX(${boxPosition.x}px) 
              translateY(${boxPosition.y}px) 
              translateZ(${boxPosition.z}px)
              rotateX(${boxRotation.x}deg) 
              rotateY(${boxRotation.y}deg) 
              rotateZ(${boxRotation.z}deg)
            `,
            transition: isDragging ? "none" : "transform 0.1s ease-out",
          }}
        >
          <div className="w-full h-full flex items-center justify-center text-white/70 text-xs">
            {currentMode === "transform" ? "Position" : "Rotation"}
          </div>
        </div>
      </div>

      {/* Gizmo Controller */}
      <div className="backdrop-blur-md bg-white/10 rounded-xl p-3 shadow-inner w-[160px] h-[160px] select-none">
        <div className="flex flex-col items-center gap-2 h-full">
          <div className="text-sm font-medium text-white">Gizmo Mode</div>

          <div className="relative w-[120px] h-[120px] flex-grow flex items-center justify-center">
            <AnimatePresence mode="wait">
              {currentMode === "transform" ? (
                <motion.div
                  key="transform"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.25 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <svg ref={svgRef} width="100%" height="100%" viewBox="-60 -60 120 120" className="select-none">
                    {/* X Axis (Red) - Extended */}
                    <line
                      x1="0"
                      y1="0"
                      x2="50"
                      y2="0"
                      stroke="#FF4136"
                      strokeWidth={activeAxis === "x" ? 2.5 : 1.5}
                      strokeOpacity={activeAxis === "x" ? 1 : 0.7}
                    />
                    <polygon points="50,0 45,-3 45,3" fill="#FF4136" stroke="#FF4136" strokeWidth="1.5" />
                    <line x1="0" y1="0" x2="-50" y2="0" stroke="#FF4136" strokeWidth="1.5" strokeOpacity="0.5" />

                    {/* Y Axis (Green) - Extended */}
                    <line
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="-50"
                      stroke="#2ECC40"
                      strokeWidth={activeAxis === "y" ? 2.5 : 1.5}
                      strokeOpacity={activeAxis === "y" ? 1 : 0.7}
                    />
                    <polygon points="0,-50 -3,-45 3,-45" fill="#2ECC40" stroke="#2ECC40" strokeWidth="1.5" />
                    <line x1="0" y1="0" x2="0" y2="50" stroke="#2ECC40" strokeWidth="1.5" strokeOpacity="0.5" />

                    {/* Z Axis (Blue) - Extended with isometric angle */}
                    <line
                      x1="0"
                      y1="0"
                      x2="-35"
                      y2="35"
                      stroke="#0074D9"
                      strokeWidth={activeAxis === "z" ? 2.5 : 1.5}
                      strokeOpacity={activeAxis === "z" ? 1 : 0.7}
                    />
                    <polygon points="-35,35 -29,32 -32,29" fill="#0074D9" stroke="#0074D9" strokeWidth="1.5" />
                    <line x1="0" y1="0" x2="35" y2="-35" stroke="#0074D9" strokeWidth="1.5" strokeOpacity="0.5" />

                    {/* Axis labels */}
                    <text
                      x="52"
                      y="4"
                      fill="#FF4136"
                      fontSize="8"
                      fontWeight="bold"
                      opacity="0.8"
                      className="select-none pointer-events-none"
                    >
                      X
                    </text>
                    <text
                      x="2"
                      y="-52"
                      fill="#2ECC40"
                      fontSize="8"
                      fontWeight="bold"
                      opacity="0.8"
                      className="select-none pointer-events-none"
                    >
                      Y
                    </text>
                    <text
                      x="-38"
                      y="38"
                      fill="#0074D9"
                      fontSize="8"
                      fontWeight="bold"
                      opacity="0.8"
                      className="select-none pointer-events-none"
                    >
                      Z
                    </text>

                    {/* Center dot */}
                    <circle cx="0" cy="0" r="2" fill="white" />

                    {/* Draggable handle */}
                    <motion.g
                      style={{ x, y }}
                      drag
                      dragElastic={0}
                      dragMomentum={false}
                      onDragStart={handleDragStart}
                      onDrag={handleDrag}
                      onDragEnd={handleDragEnd}
                      whileDrag={{ scale: 1.1 }}
                    >
                      <circle
                        r="7"
                        fill={isDragging ? "#ffffff" : "#f0f0f0"}
                        stroke={isDragging ? getAxisColor(activeAxis) : "#000000"}
                        strokeWidth="1.5"
                        className="cursor-grab active:cursor-grabbing"
                      />
                      <circle r="3.5" fill={getHandleColor()} />
                    </motion.g>
                  </svg>
                </motion.div>
              ) : (
                <motion.div
                  key="rotate"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.25 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <svg ref={svgRef} width="100%" height="100%" viewBox="-60 -60 120 120" className="select-none">
                    {/* Subtle grid for better spatial awareness */}
                    <line x1="-50" y1="0" x2="50" y2="0" stroke="#ffffff" strokeWidth="0.5" strokeOpacity="0.1" />
                    <line x1="0" y1="-50" x2="0" y2="50" stroke="#ffffff" strokeWidth="0.5" strokeOpacity="0.1" />

                    {/* 3D Coordinate Axes */}
                    <line x1="0" y1="0" x2="20" y2="0" stroke="#FF4136" strokeWidth="1" strokeOpacity="0.7" />
                    <text
                      x="22"
                      y="4"
                      fill="#FF4136"
                      fontSize="8"
                      opacity="0.8"
                      className="select-none pointer-events-none"
                    >
                      X
                    </text>

                    <line x1="0" y1="0" x2="0" y2="-20" stroke="#2ECC40" strokeWidth="1" strokeOpacity="0.7" />
                    <text
                      x="2"
                      y="-22"
                      fill="#2ECC40"
                      fontSize="8"
                      opacity="0.8"
                      className="select-none pointer-events-none"
                    >
                      Y
                    </text>

                    <line x1="0" y1="0" x2="-14" y2="14" stroke="#0074D9" strokeWidth="1" strokeOpacity="0.7" />
                    <text
                      x="-18"
                      y="18"
                      fill="#0074D9"
                      fontSize="8"
                      opacity="0.8"
                      className="select-none pointer-events-none"
                    >
                      Z
                    </text>

                    {/* Rotation Rings - All three are always visible */}
                    {/* X Axis Rotation (Red) */}
                    <circle
                      cx="0"
                      cy="0"
                      r="45"
                      fill="none"
                      stroke="#FF4136"
                      strokeWidth={activeRotationAxis === "x" ? 2.5 : 1.5}
                      strokeOpacity={activeRotationAxis === "x" ? 1 : 0.3}
                      strokeDasharray={activeRotationAxis !== "x" && activeRotationAxis !== null ? "3,3" : ""}
                    />

                    {/* Y Axis Rotation (Green) */}
                    <circle
                      cx="0"
                      cy="0"
                      r="35"
                      fill="none"
                      stroke="#2ECC40"
                      strokeWidth={activeRotationAxis === "y" ? 2.5 : 1.5}
                      strokeOpacity={activeRotationAxis === "y" ? 1 : 0.3}
                      strokeDasharray={activeRotationAxis !== "y" && activeRotationAxis !== null ? "3,3" : ""}
                    />

                    {/* Z Axis Rotation (Blue) */}
                    <circle
                      cx="0"
                      cy="0"
                      r="25"
                      fill="none"
                      stroke="#0074D9"
                      strokeWidth={activeRotationAxis === "z" ? 2.5 : 1.5}
                      strokeOpacity={activeRotationAxis === "z" ? 1 : 0.3}
                      strokeDasharray={activeRotationAxis !== "z" && activeRotationAxis !== null ? "3,3" : ""}
                    />

                    {/* Rotation indicators */}
                    {activeRotationAxis === "x" && (
                      <line
                        x1="0"
                        y1="0"
                        x2="45"
                        y2="0"
                        stroke="#FF4136"
                        strokeWidth="1.5"
                        transform={`rotate(${boxRotation.x})`}
                      />
                    )}
                    {activeRotationAxis === "y" && (
                      <line
                        x1="0"
                        y1="0"
                        x2="35"
                        y2="0"
                        stroke="#2ECC40"
                        strokeWidth="1.5"
                        transform={`rotate(${boxRotation.y})`}
                      />
                    )}
                    {activeRotationAxis === "z" && (
                      <line
                        x1="0"
                        y1="0"
                        x2="25"
                        y2="0"
                        stroke="#0074D9"
                        strokeWidth="1.5"
                        transform={`rotate(${boxRotation.z})`}
                      />
                    )}

                    {/* Center dot */}
                    <circle cx="0" cy="0" r="2" fill="white" />

                    {/* Draggable handle */}
                    <motion.g
                      style={{ x, y }}
                      drag
                      dragElastic={0}
                      dragMomentum={false}
                      onDragStart={handleDragStart}
                      onDrag={handleDrag}
                      onDragEnd={handleDragEnd}
                      whileDrag={{ scale: 1.1 }}
                    >
                      <circle
                        r="7"
                        fill={isDragging ? "#ffffff" : "#f0f0f0"}
                        stroke={isDragging && activeRotationAxis ? getAxisColor(activeRotationAxis) : "#000000"}
                        strokeWidth="1.5"
                        className="cursor-grab active:cursor-grabbing"
                      />
                      <circle r="3.5" fill={getHandleColor()} />
                    </motion.g>
                  </svg>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Position/Rotation indicator */}
          <div className="text-xs text-white/70 mb-1 h-6 flex items-center">
            {currentMode === "rotate" ? (
              <div className="flex items-center justify-center">
                {activeRotationAxis ? (
                  <span>
                    <span style={{ color: getAxisColor(activeRotationAxis) }}>{activeRotationAxis.toUpperCase()}</span>:{" "}
                    {formatRotationAngle(activeRotationAxis)}
                  </span>
                ) : (
                  <span>Drag to rotate</span>
                )}
              </div>
            ) : (
              <span>
                {isDragging ? (
                  <>
                    <span style={{ color: getAxisColor(activeAxis) }}>{activeAxis.toUpperCase()}</span>:{" "}
                    {formatProgress(pathProgress)}
                  </>
                ) : (
                  <span>Drag to move</span>
                )}
              </span>
            )}
          </div>

          <button
            onClick={handleToggle}
            className="flex items-center justify-center w-8 h-8 bg-white/20 hover:bg-white/30 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
            tabIndex={0}
            aria-label={`Switch to ${currentMode === "transform" ? "rotate" : "transform"} mode`}
          >
            {currentMode === "transform" ? (
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M3 17L9 11L13 15L21 7"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M17 7H21V11"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
