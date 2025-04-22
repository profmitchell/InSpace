"use client"

import { useState, useEffect, useCallback, type RefObject } from "react"
import { useMotionValue } from "framer-motion"
import type { GizmoMode, GizmoSettings, GizmoState, Axis, RotationAxis } from "../types"
import { isShiftPressed } from "../utils"

export const useGizmo = (initialMode: GizmoMode, settings: GizmoSettings, svgRef: RefObject<SVGSVGElement>) => {
  // State
  const [currentMode, setCurrentMode] = useState<GizmoMode>(initialMode)
  const [isDragging, setIsDragging] = useState(false)
  const [pathProgress, setPathProgress] = useState(0)
  const [activeRotationAxis, setActiveRotationAxis] = useState<RotationAxis>(null)
  const [activeAxis, setActiveAxis] = useState<Axis>("x")
  const [boxPosition, setBoxPosition] = useState({ x: 0, y: 0, z: 0 })
  const [boxRotation, setBoxRotation] = useState({ x: 0, y: 0, z: 0 })
  const [isAxisLocked, setIsAxisLocked] = useState(false)

  // Motion values for the handle
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  // Listen for shift key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Shift" && isDragging) {
        setIsAxisLocked(true)
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Shift") {
        setIsAxisLocked(false)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
    }
  }, [isDragging])

  // Calculate the closest point on the path for a given position
  const calculateClosestPointOnPath = useCallback(
    (dragX: number, dragY: number, event?: MouseEvent | TouchEvent | PointerEvent) => {
      if (!svgRef.current) return { x: 0, y: 0, progress: 0 }

      // Get SVG dimensions
      const svgRect = svgRef.current.getBoundingClientRect()
      const centerX = svgRect.width / 2
      const centerY = svgRect.height / 2

      // Calculate relative position from center
      const relX = dragX - centerX
      const relY = dragY - centerY

      // Check if shift is pressed in the event
      const shiftPressed = event ? isShiftPressed(event) : false
      const shouldLockAxis = settings.lockAxis || isAxisLocked || shiftPressed

      if (currentMode === "transform") {
        // For transform mode, we'll use the closest point on one of the three axes
        // Calculate distances to each axis
        const distToXAxis = Math.abs(relY)
        const distToYAxis = Math.abs(relX)
        const distToZAxis = Math.abs(relX * 0.707 + relY * 0.707) // Approximate for 45-degree Z axis

        // Find the closest axis
        const minDist = Math.min(distToXAxis, distToYAxis, distToZAxis)

        // If axis locking is enabled and we're already dragging, keep the current axis
        if (shouldLockAxis && isDragging && activeAxis) {
          if (activeAxis === "x") {
            // Clamp x between -60 and 60 (or allow beyond if setting is enabled)
            const maxDist = settings.allowDragBeyondBounds ? 1000 : 60
            const clampedX = Math.max(-maxDist, Math.min(maxDist, relX))
            const normalizedProgress = clampedX / 60

            // Update box position
            setBoxPosition((prev) => ({ ...prev, x: normalizedProgress * 50 }))

            return {
              x: clampedX,
              y: 0,
              progress: normalizedProgress,
              axis: "x" as Axis,
            }
          } else if (activeAxis === "y") {
            // Clamp y between -60 and 60 (or allow beyond if setting is enabled)
            const maxDist = settings.allowDragBeyondBounds ? 1000 : 60
            const clampedY = Math.max(-maxDist, Math.min(maxDist, relY))
            const normalizedProgress = -clampedY / 60 // Invert Y for natural up/down

            // Update box position
            setBoxPosition((prev) => ({ ...prev, y: normalizedProgress * 50 }))

            return {
              x: 0,
              y: clampedY,
              progress: normalizedProgress,
              axis: "y" as Axis,
            }
          } else {
            // Z axis
            const maxDist = settings.allowDragBeyondBounds ? 1000 : 60
            const projectionLength = (relX * -0.707 + relY * 0.707) * 0.707
            const clampedProj = Math.max(-maxDist, Math.min(maxDist, projectionLength))
            const normalizedProgress = clampedProj / 60

            // Update box position
            setBoxPosition((prev) => ({ ...prev, z: normalizedProgress * 50 }))

            return {
              x: -clampedProj * 0.707,
              y: clampedProj * 0.707,
              progress: normalizedProgress,
              axis: "z" as Axis,
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

          return {
            x: clampedX,
            y: 0,
            progress: normalizedProgress,
            axis: "x" as Axis,
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

          return {
            x: 0,
            y: clampedY,
            progress: normalizedProgress,
            axis: "y" as Axis,
          }
        } else {
          // Closest to Z axis
          // Calculate projection onto Z axis (which is at -45 degrees)
          const maxDist = settings.allowDragBeyondBounds ? 1000 : 60
          const projectionLength = (relX * -0.707 + relY * 0.707) * 0.707
          // Clamp projection between -60 and 60 (or allow beyond if setting is enabled)
          const clampedProj = Math.max(-maxDist, Math.min(maxDist, projectionLength))
          // Calculate progress from -1 to 1 (centered at 0)
          const normalizedProgress = clampedProj / 60

          setActiveAxis("z")

          // Update box position
          setBoxPosition((prev) => ({ ...prev, z: normalizedProgress * 50 }))

          return {
            x: -clampedProj * 0.707,
            y: clampedProj * 0.707,
            progress: normalizedProgress,
            axis: "z" as Axis,
          }
        }
      } else {
        // For rotate mode, determine which axis to rotate around based on drag direction
        // Calculate distance from center
        const distance = Math.sqrt(relX * relX + relY * relY)

        // If we're just starting to drag, determine which axis to rotate around
        if (distance > 10 && activeRotationAxis === null && !shouldLockAxis) {
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
    },
    [
      svgRef,
      currentMode,
      isDragging,
      activeAxis,
      activeRotationAxis,
      settings.lockAxis,
      settings.allowDragBeyondBounds,
      isAxisLocked,
    ],
  )

  const handleDragStart = useCallback((event: MouseEvent | TouchEvent | PointerEvent) => {
    setIsDragging(true)

    // Check if shift is pressed at the start of drag
    if (isShiftPressed(event)) {
      setIsAxisLocked(true)
    }
  }, [])

  const handleDragEnd = useCallback(() => {
    setIsDragging(false)
    setIsAxisLocked(false)

    // Reset active rotation axis
    setActiveRotationAxis(null)

    // In both modes, snap the handle back to center
    x.set(0)
    y.set(0)
    setPathProgress(0)
  }, [x, y])

  const handleDrag = useCallback(
    (event: MouseEvent | TouchEvent | PointerEvent, info: { point: { x: number; y: number } }) => {
      if (!svgRef.current) return

      // Get SVG coordinates
      const svgRect = svgRef.current.getBoundingClientRect()
      const localX = info.point.x - svgRect.left
      const localY = info.point.y - svgRect.top

      // Calculate closest point on path
      const result = calculateClosestPointOnPath(localX, localY, event)

      // Update position
      x.set(result.x)
      y.set(result.y)
      setPathProgress(result.progress)
    },
    [svgRef, calculateClosestPointOnPath, x, y],
  )

  const toggleMode = useCallback(() => {
    setCurrentMode((prev) => (prev === "transform" ? "rotate" : "transform"))
  }, [])

  // Combine state for easier passing to components
  const state: GizmoState = {
    boxPosition,
    boxRotation,
    activeAxis,
    activeRotationAxis,
    pathProgress,
    isDragging,
    isAxisLocked,
  }

  return {
    currentMode,
    state,
    x,
    y,
    handleDragStart,
    handleDrag,
    handleDragEnd,
    toggleMode,
  }
}
