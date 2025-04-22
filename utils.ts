import type { Axis, RotationAxis } from "./types"

// Format progress value for display
export const formatProgress = (value: number): string => {
  // Convert to percentage and round to nearest integer
  const percentage = Math.round(value * 100)
  // Add + sign for positive values
  return percentage > 0 ? `+${percentage}%` : `${percentage}%`
}

// Format rotation angle for display
export const formatRotationAngle = (angle: number): string => {
  const roundedAngle = Math.round(angle)
  return `${roundedAngle}°`
}

// Get axis color based on settings
export const getAxisColor = (axis: Axis | RotationAxis | null, useColors: boolean): string => {
  if (axis === null || !useColors) return "#ffffff"

  const colors = {
    x: "#FF4136", // Red
    y: "#2ECC40", // Green
    z: "#0074D9", // Blue
  }
  return colors[axis]
}

// Calculate viewBox to prevent clipping
export const calculateViewBox = (size: number, lineSize: number, handleSize: number): string => {
  // Base size with padding to prevent clipping
  const baseSize = 120
  // Add extra padding based on line size and handle size
  const padding = Math.max(lineSize * 1.5, handleSize * 1.5)
  const viewBoxSize = baseSize + padding * 2

  return `-${viewBoxSize / 2} -${viewBoxSize / 2} ${viewBoxSize} ${viewBoxSize}`
}

// Check if key is pressed
export const isShiftPressed = (event: KeyboardEvent | MouseEvent | TouchEvent | PointerEvent): boolean => {
  return "shiftKey" in event && event.shiftKey
}
