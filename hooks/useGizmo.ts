"use client"

import { useState, useEffect, useCallback, useRef, type RefObject } from "react"
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

  // Use refs for values that shouldn't trigger re-renders
  const lockedAxisRef = useRef<Axis | null>(null)
  const initialDragPosRef = useRef({ x: 0, y: 0 })

  // Motion values for the handle
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  // Listen for shift key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Shift" && isDragging) {
        // When shift is pressed during drag, lock to current axis
        setIsAxisLocked(true)
        lockedAxisRef.current = activeAxis
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Shift") {
        setIsAxisLocked(false)
        lockedAxisRef.current = null
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
    }
  }, [isDragging, activeAxis])

  // Handle drag start
  const handleDragStart = useCallback(
    (event: MouseEvent | TouchEvent | PointerEvent) => {
      setIsDragging(true)

      // Store initial drag position
      if (event instanceof MouseEvent) {
        initialDragPosRef.current = { x: event.clientX, y: event.clientY }
      } else if (event instanceof TouchEvent && event.touches.length > 0) {
        initialDragPosRef.current = { x: event.touches[0].clientX, y: event.touches[0].clientY }
      } else if (event instanceof PointerEvent) {
        initialDragPosRef.current = { x: event.clientX, y: event.clientY }
      }

      // Check if shift is pressed at the start of drag
      if (isShiftPressed(event)) {
        setIsAxisLocked(true)
        // We'll determine the locked axis on the first drag event
      } else {
        setIsAxisLocked(false)
        lockedAxisRef.current = null
      }

      // Reset active rotation axis when starting a new drag in rotate mode
      if (currentMode === "rotate") {
        setActiveRotationAxis(null)
      }
    },
    [currentMode],
  )

  // Handle drag end
  const handleDragEnd = useCallback(() => {
    setIsDragging(false)
    setIsAxisLocked(false)
    lockedAxisRef.current = null

    // Reset active rotation axis
    setActiveRotationAxis(null)

    // In both modes, snap the handle back to center
    x.set(0)
    y.set(0)
    setPathProgress(0)
  }, [x, y])

  // Handle drag
  const handleDrag = useCallback(
    (event: MouseEvent | TouchEvent | PointerEvent, info: { point: { x: number; y: number } }) => {
      if (!svgRef.current) return

      // Check if shift is pressed during drag
      const shiftIsPressed = isShiftPressed(event)

      // Update axis lock state
      if (shiftIsPressed !== isAxisLocked) {
        setIsAxisLocked(shiftIsPressed)
        if (shiftIsPressed) {
          // Lock to current axis when shift is pressed
          lockedAxisRef.current = activeAxis
        } else {
          // Unlock when shift is released
          lockedAxisRef.current = null
        }
      }

      // Get SVG coordinates
      const svgRect = svgRef.current.getBoundingClientRect()
      const localX = info.point.x - svgRect.left
      const localY = info.point.y - svgRect.top

      // Center of the SVG
      const centerX = svgRect.width / 2
      const centerY = svgRect.height / 2

      // Calculate relative position from center
      const relX = localX - centerX
      const relY = localY - centerY

      if (currentMode === "transform") {
        // For transform mode
        const shouldLockAxis = settings.lockAxis || isAxisLocked

        // If we should lock to an axis
        if (shouldLockAxis && lockedAxisRef.current) {
          const maxDist = settings.allowDragBeyondBounds ? 1000 : 60

          if (lockedAxisRef.current === "x") {
            // Lock to X axis
            const clampedX = Math.max(-maxDist, Math.min(maxDist, relX))
            const normalizedProgress = clampedX / 60

            // Update position
            x.set(clampedX)
            y.set(0)
            setPathProgress(normalizedProgress)

            // Update box position
            setBoxPosition((prev) => ({ ...prev, x: normalizedProgress * 50 }))
          } else if (lockedAxisRef.current === "y") {
            // Lock to Y axis
            const clampedY = Math.max(-maxDist, Math.min(maxDist, relY))
            const normalizedProgress = -clampedY / 60 // Invert Y for natural up/down

            // Update position
            x.set(0)
            y.set(clampedY)
            setPathProgress(normalizedProgress)

            // Update box position
            setBoxPosition((prev) => ({ ...prev, y: normalizedProgress * 50 }))
          } else if (lockedAxisRef.current === "z") {
            // Lock to Z axis
            const projectionLength = (relX * -0.707 + relY * 0.707) * 0.707
            const clampedProj = Math.max(-maxDist, Math.min(maxDist, projectionLength))
            const normalizedProgress = clampedProj / 60

            // Update position
            x.set(-clampedProj * 0.707)
            y.set(clampedProj * 0.707)
            setPathProgress(normalizedProgress)

            // Update box position
            setBoxPosition((prev) => ({ ...prev, z: normalizedProgress * 50 }))
          }
        } else {
          // If not locking to an axis, determine the closest axis
          const distToXAxis = Math.abs(relY)
          const distToYAxis = Math.abs(relX)
          const distToZAxis = Math.abs(relX * 0.707 + relY * 0.707) // Approximate for 45-degree Z axis

          // Find the closest axis
          const minDist = Math.min(distToXAxis, distToYAxis, distToZAxis)

          // Determine which axis is closest
          let newAxis: Axis
          if (minDist === distToXAxis) {
            newAxis = "x"
          } else if (minDist === distToYAxis) {
            newAxis = "y"
          } else {
            newAxis = "z"
          }

          // Update active axis if it changed
          if (newAxis !== activeAxis) {
            setActiveAxis(newAxis)
          }

          // Handle movement based on the determined axis
          const maxDist = settings.allowDragBeyondBounds ? 1000 : 60

          if (newAxis === "x") {
            const clampedX = Math.max(-maxDist, Math.min(maxDist, relX))
            const normalizedProgress = clampedX / 60

            // Update position
            x.set(clampedX)
            y.set(0)
            setPathProgress(normalizedProgress)

            // Update box position
            setBoxPosition((prev) => ({ ...prev, x: normalizedProgress * 50 }))
          } else if (newAxis === "y") {
            const clampedY = Math.max(-maxDist, Math.min(maxDist, relY))
            const normalizedProgress = -clampedY / 60 // Invert Y for natural up/down

            // Update position
            x.set(0)
            y.set(clampedY)
            setPathProgress(normalizedProgress)

            // Update box position
            setBoxPosition((prev) => ({ ...prev, y: normalizedProgress * 50 }))
          } else {
            const projectionLength = (relX * -0.707 + relY * 0.707) * 0.707
            const clampedProj = Math.max(-maxDist, Math.min(maxDist, projectionLength))
            const normalizedProgress = clampedProj / 60

            // Update position
            x.set(-clampedProj * 0.707)
            y.set(clampedProj * 0.707)
            setPathProgress(normalizedProgress)

            // Update box position
            setBoxPosition((prev) => ({ ...prev, z: normalizedProgress * 50 }))
          }
        }
      } else {
        // For rotation mode
        const distance = Math.sqrt(relX * relX + relY * relY)

        // If we're just starting to drag, determine which axis to rotate around
        if (distance > 10 && activeRotationAxis === null) {
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

        // If no axis is selected yet, return
        if (activeRotationAxis === null) return

        // Calculate angle from center
        const angle = Math.atan2(relY, relX)
        const degrees = ((angle + Math.PI) / (2 * Math.PI)) * 360
        const radius = 60

        // Calculate position on the circle
        const posX = Math.cos(angle) * radius
        const posY = Math.sin(angle) * radius

        // Update position
        x.set(posX)
        y.set(posY)
        setPathProgress(angle / Math.PI)

        // Update box rotation based on active axis
        if (activeRotationAxis === "x") {
          setBoxRotation((prev) => ({ ...prev, x: degrees }))
        } else if (activeRotationAxis === "y") {
          setBoxRotation((prev) => ({ ...prev, y: degrees }))
        } else if (activeRotationAxis === "z") {
          setBoxRotation((prev) => ({ ...prev, z: degrees }))
        }
      }
    },
    [
      svgRef,
      currentMode,
      activeAxis,
      activeRotationAxis,
      settings.lockAxis,
      settings.allowDragBeyondBounds,
      isAxisLocked,
      x,
      y,
    ],
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
