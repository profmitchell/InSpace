"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence, useMotionValue } from "framer-motion"

type GizmoMode = "transform" | "rotate"
type RotationAxis = "x" | "y" | "z" | null
type Axis = "x" | "y" | "z"

export interface GizmoSettings {
  size: number
  allowDragBeyondBounds: boolean
  lockAxis: boolean
  useColors: boolean
  handleSize: number
  lineSize: number
  showLabels: boolean
  showModeToggle?: boolean
}

export interface GizmoControllerProps {
  mode: GizmoMode
  onModeChange?: (mode: GizmoMode) => void
  settings: GizmoSettings
  onPositionChange?: (position: { x: number; y: number; z: number }) => void
  onRotationChange?: (rotation: { x: number; y: number; z: number }) => void
}

export const GizmoController: React.FC<GizmoControllerProps> = ({
  mode,
  onModeChange,
  settings,
  onPositionChange,
  onRotationChange,
}) => {
  const [currentMode, setCurrentMode] = useState<GizmoMode>(mode)
  const [isDragging, setIsDragging] = useState(false)
  const [pathProgress, setPathProgress] = useState(0)
  const [activeRotationAxis, setActiveRotationAxis] = useState<RotationAxis>(null)
  const [activeAxis, setActiveAxis] = useState<Axis>("x")

  // Box position and rotation state
  const [boxPosition, setBoxPosition] = useState({ x: 0, y: 0, z: 0 })
  const [boxRotation, setBoxRotation] = useState({ x: 0, y: 0, z: 0 })

  // Add these after the existing state declarations
  const [cumulativeRotation, setCumulativeRotation] = useState({ x: 0, y: 0, z: 0 })
  const [lastAngle, setLastAngle] = useState({ x: 0, y: 0, z: 0 })

  // Motion values for the handle
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  // Reference to the SVG element for coordinate calculations
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    setCurrentMode(mode)
  }, [mode])

  useEffect(() => {
    if (onPositionChange) {
      onPositionChange(boxPosition)
    }
  }, [boxPosition, onPositionChange])

  useEffect(() => {
    if (onRotationChange) {
      onRotationChange(boxRotation)
    }
  }, [boxRotation, onRotationChange])

  const handleToggle = () => {
    const newMode = currentMode === "transform" ? "rotate" : "transform"
    setCurrentMode(newMode)
    if (onModeChange) {
      onModeChange(newMode)
    }
  }

  // Update the calculateClosestPointOnPath function to fix Z axis in MOVE mode
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
      const distToZAxis = Math.abs(relX * 0.707 - relY * 0.707) // Corrected for 45-degree Z axis

      // Find the closest axis
      const minDist = Math.min(distToXAxis, distToYAxis, distToZAxis)

      // If axis locking is enabled and we're already dragging, keep the current axis
      if (settings.lockAxis && isDragging && activeAxis) {
        if (activeAxis === "x") {
          // Clamp x between -60 and 60 (or allow beyond if setting is enabled)
          const maxDist = settings.allowDragBeyondBounds ? 1000 : 60
          const clampedX = Math.max(-maxDist, Math.min(maxDist, relX))
          const normalizedProgress = clampedX / 60

          // Update box position
          setBoxPosition((prev) => ({ ...prev, x: normalizedProgress * 50 }))

          // Ensure handle stays within the arrow head
          const visualX = settings.allowDragBeyondBounds
            ? Math.sign(clampedX) * Math.min(Math.abs(clampedX), 55)
            : clampedX

          return {
            x: visualX,
            y: 0,
            progress: normalizedProgress,
            axis: "x",
          }
        } else if (activeAxis === "y") {
          // Clamp y between -60 and 60 (or allow beyond if setting is enabled)
          const maxDist = settings.allowDragBeyondBounds ? 1000 : 60
          const clampedY = Math.max(-maxDist, Math.min(maxDist, relY))
          const normalizedProgress = -clampedY / 60 // Invert Y for natural up/down

          // Update box position
          setBoxPosition((prev) => ({ ...prev, y: normalizedProgress * 50 }))

          // Ensure handle stays within the arrow head
          const visualY = settings.allowDragBeyondBounds
            ? Math.sign(clampedY) * Math.min(Math.abs(clampedY), 55)
            : clampedY

          return {
            x: 0,
            y: visualY,
            progress: normalizedProgress,
            axis: "y",
          }
        } else {
          // Z axis
          const maxDist = settings.allowDragBeyondBounds ? 1000 : 60
          const projectionLength = (relX * 0.707 - relY * 0.707) * 0.707 // Corrected for 45-degree Z axis
          const clampedProj = Math.max(-maxDist, Math.min(maxDist, projectionLength))
          const normalizedProgress = clampedProj / 60

          // Update box position
          setBoxPosition((prev) => ({ ...prev, z: normalizedProgress * 50 }))

          // Ensure handle stays within the arrow head
          const visualProj = settings.allowDragBeyondBounds
            ? Math.sign(clampedProj) * Math.min(Math.abs(clampedProj), 38)
            : clampedProj

          return {
            x: visualProj * 0.707,
            y: -visualProj * 0.707,
            progress: normalizedProgress,
            axis: "z",
          }
        }
      }

      if (minDist === distToXAxis) {
        // Closest to X axis
        // Clamp x between -60 and 60 (or allow beyond if setting is enabled)
        const maxDist = settings.allowDragBeyondBounds ? 1000 : 60
        const clampedX = Math.max(-maxDist, Math.min(maxDist, relX))
        // Calculate progress from -1 to 1 (centered at 0)
        const normalizedProgress = clampedX / 60

        setActiveAxis("x")

        // Update box position
        setBoxPosition((prev) => ({ ...prev, x: normalizedProgress * 50 }))

        // Ensure handle stays within the arrow head
        const visualX = settings.allowDragBeyondBounds
          ? Math.sign(clampedX) * Math.min(Math.abs(clampedX), 55)
          : clampedX

        return {
          x: visualX,
          y: 0,
          progress: normalizedProgress,
          axis: "x",
        }
      } else if (minDist === distToYAxis) {
        // Closest to Y axis
        // Clamp y between -60 and 60 (or allow beyond if setting is enabled)
        const maxDist = settings.allowDragBeyondBounds ? 1000 : 60
        const clampedY = Math.max(-maxDist, Math.min(maxDist, relY))
        // Calculate progress from -1 to 1 (centered at 0)
        const normalizedProgress = -clampedY / 60 // Invert Y for natural up/down

        setActiveAxis("y")

        // Update box position
        setBoxPosition((prev) => ({ ...prev, y: normalizedProgress * 50 }))

        // Ensure handle stays within the arrow head
        const visualY = settings.allowDragBeyondBounds
          ? Math.sign(clampedY) * Math.min(Math.abs(clampedY), 55)
          : clampedY

        return {
          x: 0,
          y: visualY,
          progress: normalizedProgress,
          axis: "y",
        }
      } else {
        // Closest to Z axis
        // Calculate projection onto Z axis (which is at 45 degrees)
        const maxDist = settings.allowDragBeyondBounds ? 1000 : 60
        const projectionLength = (relX * 0.707 - relY * 0.707) * 0.707 // Corrected for 45-degree Z axis
        // Clamp projection between -60 and 60 (or allow beyond if setting is enabled)
        const clampedProj = Math.max(-maxDist, Math.min(maxDist, projectionLength))
        // Calculate progress from -1 to 1 (centered at 0)
        const normalizedProgress = clampedProj / 60

        setActiveAxis("z")

        // Update box position
        setBoxPosition((prev) => ({ ...prev, z: normalizedProgress * 50 }))

        // Ensure handle stays within the arrow head
        const visualProj = settings.allowDragBeyondBounds
          ? Math.sign(clampedProj) * Math.min(Math.abs(clampedProj), 38)
          : clampedProj

        return {
          x: visualProj * 0.707,
          y: -visualProj * 0.707,
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
        // Determine which axis based on drag direction in a Y-shape pattern
        const angle = Math.atan2(relY, relX) * (180 / Math.PI)

        // Y axis (green) - 10 o'clock direction (-120° to -60°)
        if (angle > -120 && angle < -60) {
          setActiveRotationAxis("y")
        }
        // X axis (red) - 2 o'clock direction (-30° to 30°)
        else if ((angle > -30 && angle < 30) || angle > 150 || angle < -150) {
          setActiveRotationAxis("x")
        }
        // Z axis (blue) - 6 o'clock direction (60° to 120°)
        else if (angle > 60 && angle < 120) {
          setActiveRotationAxis("z")
        }
        // Default to X if not in any specific zone
        else {
          setActiveRotationAxis("x")
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
      const radius = 60

      // Calculate position on the circle
      let posX = 0
      let posY = 0

      // Different calculation based on which axis we're rotating around
      if (activeRotationAxis === "x") {
        // Rotation around X axis - YZ plane (red)
        posX = Math.cos(angle) * radius
        posY = Math.sin(angle) * radius

        // Handle continuous rotation when allowDragBeyondBounds is true
        if (settings.allowDragBeyondBounds) {
          // Calculate the delta from last angle
          const lastDegrees = lastAngle.x
          let delta = degrees - lastDegrees

          // Handle the case when crossing the 0/360 boundary
          if (delta > 180) delta -= 360
          if (delta < -180) delta += 360

          // Update cumulative rotation
          setCumulativeRotation((prev) => ({
            ...prev,
            x: prev.x + delta,
          }))

          // Update last angle
          setLastAngle((prev) => ({
            ...prev,
            x: degrees,
          }))

          // Update box rotation with cumulative value
          setBoxRotation((prev) => ({
            ...prev,
            x: cumulativeRotation.x + delta,
          }))
        } else {
          // Standard behavior - reset at 360
          setBoxRotation((prev) => ({ ...prev, x: degrees }))
        }
      } else if (activeRotationAxis === "y") {
        // Rotation around Y axis - XZ plane (green)
        posX = Math.cos(angle) * radius
        posY = Math.sin(angle) * radius

        // Handle continuous rotation when allowDragBeyondBounds is true
        if (settings.allowDragBeyondBounds) {
          // Calculate the delta from last angle
          const lastDegrees = lastAngle.y
          let delta = degrees - lastDegrees

          // Handle the case when crossing the 0/360 boundary
          if (delta > 180) delta -= 360
          if (delta < -180) delta += 360

          // Update cumulative rotation
          setCumulativeRotation((prev) => ({
            ...prev,
            y: prev.y + delta,
          }))

          // Update last angle
          setLastAngle((prev) => ({
            ...prev,
            y: degrees,
          }))

          // Update box rotation with cumulative value
          setBoxRotation((prev) => ({
            ...prev,
            y: cumulativeRotation.y + delta,
          }))
        } else {
          // Standard behavior - reset at 360
          setBoxRotation((prev) => ({ ...prev, y: degrees }))
        }
      } else if (activeRotationAxis === "z") {
        // Rotation around Z axis - XY plane (blue)
        posX = Math.cos(angle) * radius
        posY = Math.sin(angle) * radius

        // Handle continuous rotation when allowDragBeyondBounds is true
        if (settings.allowDragBeyondBounds) {
          // Calculate the delta from last angle
          const lastDegrees = lastAngle.z
          let delta = degrees - lastDegrees

          // Handle the case when crossing the 0/360 boundary
          if (delta > 180) delta -= 360
          if (delta < -180) delta += 360

          // Update cumulative rotation
          setCumulativeRotation((prev) => ({
            ...prev,
            z: prev.z + delta,
          }))

          // Update last angle
          setLastAngle((prev) => ({
            ...prev,
            z: degrees,
          }))

          // Update box rotation with cumulative value
          setBoxRotation((prev) => ({
            ...prev,
            z: cumulativeRotation.z + delta,
          }))
        } else {
          // Standard behavior - reset at 360
          setBoxRotation((prev) => ({ ...prev, z: degrees }))
        }
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

    // Initialize lastAngle with current rotation values when starting a new drag
    if (currentMode === "rotate") {
      const angle = Math.atan2(y.get(), x.get()) * (180 / Math.PI)
      const degrees = ((angle + 180) / 360) * 360

      if (activeRotationAxis) {
        setLastAngle((prev) => ({
          ...prev,
          [activeRotationAxis]: degrees,
        }))
      }
    }
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
    if (axis === null || !settings.useColors) return "#ffffff"

    const colors = {
      x: "#FF4136", // Red
      y: "#2ECC40", // Green
      z: "#0074D9", // Blue
    }
    return colors[axis]
  }

  // Get handle color based on active axis
  const getHandleColor = () => {
    if (!settings.useColors) return "#f0f0f0"

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

  // Calculate viewBox based on settings.size
  const viewBoxSize = 180 // Enlarged from 120 to prevent clipping
  const viewBox = `-${viewBoxSize / 2} -${viewBoxSize / 2} ${viewBoxSize} ${viewBoxSize}`

  return (
    <div
      className="relative backdrop-blur-md bg-black/20 rounded-lg p-4 shadow-inner select-none"
      style={{ width: `${settings.size}px`, height: `${settings.size}px` }}
    >
      <div className="flex flex-col items-center gap-2 h-full">
        <div className="relative flex-grow flex items-center justify-center w-full">
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
                <svg ref={svgRef} width="100%" height="100%" viewBox={viewBox} className="select-none">
                  {/* X Axis (Red) - Extended */}
                  <line
                    x1="0"
                    y1="0"
                    x2="60"
                    y2="0"
                    stroke={settings.useColors ? "#FF4136" : "#ffffff"}
                    strokeWidth={activeAxis === "x" ? settings.lineSize + 1 : settings.lineSize}
                    strokeOpacity={activeAxis === "x" ? 1 : 0.7}
                  />
                  <polygon
                    points="60,0 55,-3 55,3"
                    fill={settings.useColors ? "#FF4136" : "#ffffff"}
                    stroke={settings.useColors ? "#FF4136" : "#ffffff"}
                    strokeWidth="2"
                  />
                  <line
                    x1="0"
                    y1="0"
                    x2="-60"
                    y2="0"
                    stroke={settings.useColors ? "#FF4136" : "#ffffff"}
                    strokeWidth={activeAxis === "x" ? settings.lineSize + 1 : settings.lineSize}
                    strokeOpacity="0.5"
                  />

                  {/* Y Axis (Green) - Extended */}
                  <line
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="-60"
                    stroke={settings.useColors ? "#2ECC40" : "#ffffff"}
                    strokeWidth={activeAxis === "y" ? settings.lineSize + 1 : settings.lineSize}
                    strokeOpacity={activeAxis === "y" ? 1 : 0.7}
                  />
                  <polygon
                    points="0,-60 -3,-55 3,-55"
                    fill={settings.useColors ? "#2ECC40" : "#ffffff"}
                    stroke={settings.useColors ? "#2ECC40" : "#ffffff"}
                    strokeWidth="2"
                  />
                  <line
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="60"
                    stroke={settings.useColors ? "#2ECC40" : "#ffffff"}
                    strokeWidth={activeAxis === "y" ? settings.lineSize + 1 : settings.lineSize}
                    strokeOpacity="0.5"
                  />

                  {/* Z Axis (Blue) - Extended with isometric angle */}
                  <line
                    x1="0"
                    y1="0"
                    x2="42"
                    y2="-42"
                    stroke={settings.useColors ? "#0074D9" : "#ffffff"}
                    strokeWidth={activeAxis === "z" ? settings.lineSize + 1 : settings.lineSize}
                    strokeOpacity={activeAxis === "z" ? 1 : 0.7}
                  />
                  <polygon
                    points="42,-42 39,-36 36,-39"
                    fill={settings.useColors ? "#0074D9" : "#ffffff"}
                    stroke={settings.useColors ? "#0074D9" : "#ffffff"}
                    strokeWidth="2"
                  />
                  <line
                    x1="0"
                    y1="0"
                    x2="-42"
                    y2="42"
                    stroke={settings.useColors ? "#0074D9" : "#ffffff"}
                    strokeWidth={activeAxis === "z" ? settings.lineSize + 1 : settings.lineSize}
                    strokeOpacity="0.5"
                  />

                  {/* Axis labels */}
                  {settings.showLabels && (
                    <>
                      <text
                        x="62"
                        y="4"
                        fill={settings.useColors ? "#FF4136" : "#ffffff"}
                        fontSize="10"
                        fontWeight="bold"
                        opacity="0.8"
                        className="select-none pointer-events-none"
                      >
                        X
                      </text>
                      <text
                        x="2"
                        y="-62"
                        fill={settings.useColors ? "#2ECC40" : "#ffffff"}
                        fontSize="10"
                        fontWeight="bold"
                        opacity="0.8"
                        className="select-none pointer-events-none"
                      >
                        Y
                      </text>
                      <text
                        x="45"
                        y="-45"
                        fill={settings.useColors ? "#0074D9" : "#ffffff"}
                        fontSize="10"
                        fontWeight="bold"
                        opacity="0.8"
                        className="select-none pointer-events-none"
                      >
                        Z
                      </text>
                    </>
                  )}

                  {/* Center dot */}
                  <circle cx="0" cy="0" r="3" fill="white" />

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
                      r={settings.handleSize}
                      fill={isDragging ? "#ffffff" : "#f0f0f0"}
                      stroke={isDragging ? getAxisColor(activeAxis) : "#000000"}
                      strokeWidth="2"
                      className="cursor-grab active:cursor-grabbing"
                    />
                    <circle r={settings.handleSize / 2} fill={getHandleColor()} />
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
                <svg ref={svgRef} width="100%" height="100%" viewBox={viewBox} className="select-none">
                  {/* Subtle grid for better spatial awareness */}
                  <line x1="-60" y1="0" x2="60" y2="0" stroke="#ffffff" strokeWidth="0.5" strokeOpacity="0.1" />
                  <line x1="0" y1="-60" x2="0" y2="60" stroke="#ffffff" strokeWidth="0.5" strokeOpacity="0.1" />

                  {/* 3D Coordinate Axes - Extended */}
                  <line
                    x1="0"
                    y1="0"
                    x2="70"
                    y2="0"
                    stroke={settings.useColors ? "#FF4136" : "#ffffff"}
                    strokeWidth="1.5"
                    strokeOpacity="0.7"
                  />
                  {settings.showLabels && (
                    <text
                      x="72"
                      y="4"
                      fill={settings.useColors ? "#FF4136" : "#ffffff"}
                      fontSize="10"
                      opacity="0.8"
                      className="select-none pointer-events-none"
                    >
                      X
                    </text>
                  )}

                  <line
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="-70"
                    stroke={settings.useColors ? "#2ECC40" : "#ffffff"}
                    strokeWidth="1.5"
                    strokeOpacity="0.7"
                  />
                  {settings.showLabels && (
                    <text
                      x="2"
                      y="-72"
                      fill={settings.useColors ? "#2ECC40" : "#ffffff"}
                      fontSize="10"
                      opacity="0.8"
                      className="select-none pointer-events-none"
                    >
                      Y
                    </text>
                  )}

                  <line
                    x1="0"
                    y1="0"
                    x2="-50"
                    y2="50"
                    stroke={settings.useColors ? "#0074D9" : "#ffffff"}
                    strokeWidth="1.5"
                    strokeOpacity="0.7"
                  />
                  {settings.showLabels && (
                    <text
                      x="-55"
                      y="55"
                      fill={settings.useColors ? "#0074D9" : "#ffffff"}
                      fontSize="10"
                      opacity="0.8"
                      className="select-none pointer-events-none"
                    >
                      Z
                    </text>
                  )}

                  {/* Y-shaped selection guides */}
                  <g opacity="0.2">
                    {/* X axis guide (2 o'clock) */}
                    <line
                      x1="0"
                      y1="0"
                      x2="40"
                      y2="0"
                      stroke={settings.useColors ? "#FF4136" : "#ffffff"}
                      strokeWidth="1"
                      strokeDasharray="2,2"
                    />

                    {/* Y axis guide (10 o'clock) */}
                    <line
                      x1="0"
                      y1="0"
                      x2="-35"
                      y2="-35"
                      stroke={settings.useColors ? "#2ECC40" : "#ffffff"}
                      strokeWidth="1"
                      strokeDasharray="2,2"
                    />

                    {/* Z axis guide (6 o'clock) */}
                    <line
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="40"
                      stroke={settings.useColors ? "#0074D9" : "#ffffff"}
                      strokeWidth="1"
                      strokeDasharray="2,2"
                    />
                  </g>

                  {/* Rotation Rings - Overlapping isometric design */}
                  {/* X Axis Rotation (Red) */}
                  <ellipse
                    cx="0"
                    cy="0"
                    rx="60"
                    ry="30"
                    fill="none"
                    stroke={settings.useColors ? "#FF4136" : "#ffffff"}
                    strokeWidth={activeRotationAxis === "x" ? settings.lineSize + 1 : settings.lineSize}
                    strokeOpacity={activeRotationAxis === "x" ? 1 : 0.3}
                    strokeDasharray={activeRotationAxis !== "x" && activeRotationAxis !== null ? "3,3" : ""}
                    transform="rotate(0)"
                  />

                  {/* Y Axis Rotation (Green) */}
                  <ellipse
                    cx="0"
                    cy="0"
                    rx="45"
                    ry="22.5"
                    fill="none"
                    stroke={settings.useColors ? "#2ECC40" : "#ffffff"}
                    strokeWidth={activeRotationAxis === "y" ? settings.lineSize + 1 : settings.lineSize}
                    strokeOpacity={activeRotationAxis === "y" ? 1 : 0.3}
                    strokeDasharray={activeRotationAxis !== "y" && activeRotationAxis !== null ? "3,3" : ""}
                    transform="rotate(90)"
                  />

                  {/* Z Axis Rotation (Blue) */}
                  <circle
                    cx="0"
                    cy="0"
                    r="30"
                    fill="none"
                    stroke={settings.useColors ? "#0074D9" : "#ffffff"}
                    strokeWidth={activeRotationAxis === "z" ? settings.lineSize + 1 : settings.lineSize}
                    strokeOpacity={activeRotationAxis === "z" ? 1 : 0.3}
                    strokeDasharray={activeRotationAxis !== "z" && activeRotationAxis !== null ? "3,3" : ""}
                  />

                  {/* Rotation indicators */}
                  {activeRotationAxis === "x" && (
                    <line
                      x1="0"
                      y1="0"
                      x2="60"
                      y2="0"
                      stroke={settings.useColors ? "#FF4136" : "#ffffff"}
                      strokeWidth={settings.lineSize}
                      transform={`rotate(${boxRotation.x})`}
                    />
                  )}
                  {activeRotationAxis === "y" && (
                    <line
                      x1="0"
                      y1="0"
                      x2="45"
                      y2="0"
                      stroke={settings.useColors ? "#2ECC40" : "#ffffff"}
                      strokeWidth={settings.lineSize}
                      transform={`rotate(${boxRotation.y})`}
                    />
                  )}
                  {activeRotationAxis === "z" && (
                    <line
                      x1="0"
                      y1="0"
                      x2="30"
                      y2="0"
                      stroke={settings.useColors ? "#0074D9" : "#ffffff"}
                      strokeWidth={settings.lineSize}
                      transform={`rotate(${boxRotation.z})`}
                    />
                  )}

                  {/* Center dot */}
                  <circle cx="0" cy="0" r="3" fill="white" />

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
                      r={settings.handleSize}
                      fill={isDragging ? "#ffffff" : "#f0f0f0"}
                      stroke={isDragging && activeRotationAxis ? getAxisColor(activeRotationAxis) : "#000000"}
                      strokeWidth="2"
                      className="cursor-grab active:cursor-grabbing"
                    />
                    <circle r={settings.handleSize / 2} fill={getHandleColor()} />
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

        {/* Mode toggle button */}
        {settings.showModeToggle !== false && (
          <button
            onClick={handleToggle}
            className="flex items-center justify-center w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
            tabIndex={0}
            aria-label={`Switch to ${currentMode === "transform" ? "rotate" : "transform"} mode`}
          >
            {currentMode === "transform" ? (
              // Rotation icon when in transform mode
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="2" />
                <path
                  d="M16 12C16 14.2091 14.2091 16 12 16C9.79086 16 8 14.2091 8 12C8 9.79086 9.79086 8 12 8"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M12 8L14 6M12 8L10 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : (
              // Transform/move icon when in rotate mode
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M5 9L2 12L5 15"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M9 5L12 2L15 5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M15 19L12 22L9 19"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M19 9L22 12L19 15"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path d="M2 12H22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M12 2V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>
        )}
      </div>
    </div>
  )
}
