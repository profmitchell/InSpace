"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence, useMotionValue } from "framer-motion"

type GizmoMode = "transform" | "rotate"
type RotationRing = "xy" | "xz" | "yz"
type Axis = "x" | "y" | "z"

interface GizmoControllerProps {
  mode: GizmoMode
  onToggleMode?: () => void
}

export const InSpace: React.FC<GizmoControllerProps> = ({ mode, onToggleMode }) => {
  const [currentMode, setCurrentMode] = useState<GizmoMode>(mode)
  const [isDragging, setIsDragging] = useState(false)
  const [pathProgress, setPathProgress] = useState(0)
  const [activeRing, setActiveRing] = useState<RotationRing>("xy")
  const [activeAxis, setActiveAxis] = useState<Axis>("x")

  // Box position and rotation state
  const [boxPosition, setBoxPosition] = useState({ x: 0, y: 0, z: 0 })
  const [boxRotation, setBoxRotation] = useState({ x: 0, y: 0, z: 0 })

  // Motion values for the handle
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  // Reference to the SVG element for coordinate calculations
  const svgRef = useRef<SVGSVGElement>(null)

  // Define ring sizes - now with even more distinct differences
  const ringSizes = {
    xy: { radius: 50 }, // Largest
    xz: { radiusX: 30, radiusY: 12 }, // Medium
    yz: { radiusX: 15, radiusY: 35 }, // Small but taller
  }

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
      // For rotate mode, we'll use the closest point on one of the three rings
      // Calculate angle from center
      const angle = Math.atan2(relY, relX)

      // Calculate positions on each ring
      // XY plane (blue) - horizontal circle (largest)
      const xyRadius = ringSizes.xy.radius
      const xyX = Math.cos(angle) * xyRadius
      const xyY = Math.sin(angle) * xyRadius

      // XZ plane (green) - vertical ellipse (medium)
      const xzRadiusX = ringSizes.xz.radiusX
      const xzRadiusY = ringSizes.xz.radiusY
      const xzX = Math.cos(angle) * xzRadiusX
      const xzY = Math.sin(angle) * xzRadiusY

      // YZ plane (red) - vertical ellipse (smallest)
      const yzRadiusX = ringSizes.yz.radiusX
      const yzRadiusY = ringSizes.yz.radiusY
      const yzX = Math.cos(angle) * yzRadiusX
      const yzY = Math.sin(angle) * yzRadiusY

      // Calculate distances to mouse position
      const distToXY = Math.sqrt(Math.pow(relX - xyX, 2) + Math.pow(relY - xyY, 2))
      const distToXZ = Math.sqrt(Math.pow(relX - xzX, 2) + Math.pow(relY - xzY, 2))
      const distToYZ = Math.sqrt(Math.pow(relX - yzX, 2) + Math.pow(relY - yzY, 2))

      // Add a bias to make it harder to switch between rings
      // This makes the active ring "sticky"
      const bias = 5 // pixels of "stickiness"
      let adjustedDistToXY = distToXY
      let adjustedDistToXZ = distToXZ
      let adjustedDistToYZ = distToYZ

      // Apply bias to make the current ring "sticky"
      if (activeRing === "xy") adjustedDistToXY -= bias
      if (activeRing === "xz") adjustedDistToXZ -= bias
      if (activeRing === "yz") adjustedDistToYZ -= bias

      // Find the closest ring with bias applied
      const minDist = Math.min(adjustedDistToXY, adjustedDistToXZ, adjustedDistToYZ)

      // Calculate rotation angle in degrees (0-360)
      const degrees = ((angle + Math.PI) / (2 * Math.PI)) * 360

      if (minDist === adjustedDistToXY) {
        // Closest to XY plane (blue) - rotates around Z axis
        setActiveRing("xy")

        // Update box rotation
        setBoxRotation((prev) => ({ ...prev, z: degrees }))

        return {
          x: xyX,
          y: xyY,
          progress: angle / Math.PI, // -1 to 1 range
          ring: "xy",
        }
      } else if (minDist === adjustedDistToXZ) {
        // Closest to XZ plane (green) - rotates around Y axis
        setActiveRing("xz")

        // Update box rotation
        setBoxRotation((prev) => ({ ...prev, y: degrees }))

        return {
          x: xzX,
          y: xzY,
          progress: angle / Math.PI, // -1 to 1 range
          ring: "xz",
        }
      } else {
        // Closest to YZ plane (red) - rotates around X axis
        setActiveRing("yz")

        // Update box rotation
        setBoxRotation((prev) => ({ ...prev, x: degrees }))

        return {
          x: yzX,
          y: yzY,
          progress: angle / Math.PI, // -1 to 1 range
          ring: "yz",
        }
      }
    }
  }

  const handleDragStart = () => {
    setIsDragging(true)
  }

  const handleDragEnd = () => {
    setIsDragging(false)

    // In transform mode, snap the handle back to center
    if (currentMode === "transform") {
      // Animate the handle back to center
      x.set(0)
      y.set(0)
      setPathProgress(0)
    }
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

  // Get ring color based on active ring
  const getRingColor = (ring: RotationRing) => {
    const colors = {
      xy: "#0074D9", // Blue
      xz: "#2ECC40", // Green
      yz: "#FF4136", // Red
    }
    return colors[ring]
  }

  // Get axis color
  const getAxisColor = (axis: Axis) => {
    const colors = {
      x: "#FF4136", // Red
      y: "#2ECC40", // Green
      z: "#0074D9", // Blue
    }
    return colors[axis]
  }

  // Get handle color based on active ring or axis
  const getHandleColor = () => {
    if (currentMode === "transform") {
      return isDragging ? getAxisColor(activeAxis) : "#f0f0f0"
    } else {
      const colors = {
        xy: "#0074D9", // Blue
        xz: "#2ECC40", // Green
        yz: "#FF4136", // Red
      }
      return isDragging ? colors[activeRing] : "#f0f0f0"
    }
  }

  // Format progress value for display
  const formatProgress = (value: number) => {
    // Convert to percentage and round to nearest integer
    const percentage = Math.round(value * 100)
    // Add + sign for positive values
    return percentage > 0 ? `+${percentage}%` : `${percentage}%`
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
      <div className="backdrop-blur-md bg-white/10 rounded-xl p-3 shadow-inner w-fit select-none">
        <div className="flex flex-col items-center gap-3">
          <div className="text-sm font-medium text-white">Gizmo Mode</div>

          <div className="relative w-48 h-48">
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

                    {/* XY Plane Ring (Blue) - Horizontal (LARGEST) */}
                    <circle
                      cx="0"
                      cy="0"
                      r={ringSizes.xy.radius}
                      fill="none"
                      stroke="#0074D9"
                      strokeWidth={activeRing === "xy" ? 3 : 2}
                      strokeOpacity={activeRing === "xy" ? 0.9 : 0.7}
                    />
                    <text
                      x="52"
                      y="0"
                      fill="#0074D9"
                      fontSize="8"
                      fontWeight="bold"
                      opacity="0.8"
                      className="select-none pointer-events-none"
                    >
                      XY
                    </text>

                    {/* XZ Plane Ring (Green) - Vertical front-facing (MEDIUM) */}
                    <ellipse
                      cx="0"
                      cy="0"
                      rx={ringSizes.xz.radiusX}
                      ry={ringSizes.xz.radiusY}
                      fill="none"
                      stroke="#2ECC40"
                      strokeWidth={activeRing === "xz" ? 3 : 2}
                      strokeOpacity={activeRing === "xz" ? 0.9 : 0.7}
                      transform="rotate(0)"
                    />
                    <text
                      x="0"
                      y="-15"
                      fill="#2ECC40"
                      fontSize="8"
                      fontWeight="bold"
                      opacity="0.8"
                      className="select-none pointer-events-none"
                    >
                      XZ
                    </text>

                    {/* YZ Plane Ring (Red) - Vertical side-facing (SMALLEST) */}
                    <ellipse
                      cx="0"
                      cy="0"
                      rx={ringSizes.yz.radiusX}
                      ry={ringSizes.yz.radiusY}
                      fill="none"
                      stroke="#FF4136"
                      strokeWidth={activeRing === "yz" ? 3 : 2}
                      strokeOpacity={activeRing === "yz" ? 0.9 : 0.7}
                      transform="rotate(0)"
                    />
                    <text
                      x="-18"
                      y="0"
                      fill="#FF4136"
                      fontSize="8"
                      fontWeight="bold"
                      opacity="0.8"
                      className="select-none pointer-events-none"
                    >
                      YZ
                    </text>

                    {/* Axis indicators for orientation */}
                    <line x1="0" y1="0" x2="15" y2="0" stroke="#FF4136" strokeWidth="1" strokeOpacity="0.7" />
                    <text
                      x="17"
                      y="4"
                      fill="#FF4136"
                      fontSize="8"
                      opacity="0.8"
                      className="select-none pointer-events-none"
                    >
                      X
                    </text>

                    <line x1="0" y1="0" x2="0" y2="-15" stroke="#2ECC40" strokeWidth="1" strokeOpacity="0.7" />
                    <text
                      x="2"
                      y="-17"
                      fill="#2ECC40"
                      fontSize="8"
                      opacity="0.8"
                      className="select-none pointer-events-none"
                    >
                      Y
                    </text>

                    <line x1="0" y1="0" x2="-15" y2="0" stroke="#0074D9" strokeWidth="1" strokeOpacity="0.7" />
                    <text
                      x="-20"
                      y="4"
                      fill="#0074D9"
                      fontSize="8"
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
                        stroke={getRingColor(activeRing)}
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

          {/* Position indicator with active ring/axis information */}
          <div className="text-xs text-white/70 mb-1">
            {currentMode === "rotate" ? (
              <span>
                Ring: <span style={{ color: getRingColor(activeRing) }}>{activeRing.toUpperCase()}</span> | Position:{" "}
                {formatProgress(pathProgress)}
              </span>
            ) : (
              <span>
                Axis: <span style={{ color: getAxisColor(activeAxis) }}>{activeAxis.toUpperCase()}</span> | Position:{" "}
                {formatProgress(pathProgress)}
              </span>
            )}
          </div>

          <button
            onClick={handleToggle}
            className="flex items-center gap-2 px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
            tabIndex={0}
            aria-label={`Switch to ${currentMode === "transform" ? "rotate" : "transform"} mode`}
          >
            {currentMode === "transform" ? (
              <>
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
                <span className="text-sm">Rotate</span>
              </>
            ) : (
              <>
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
                <span className="text-sm">Transform</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
