import type React from "react"
export type GizmoMode = "transform" | "rotate"
export type RotationAxis = "x" | "y" | "z" | null
export type Axis = "x" | "y" | "z"

export interface GizmoSettings {
  size: number
  allowDragBeyondBounds: boolean
  lockAxis: boolean
  useColors: boolean
  handleSize: number
  lineSize: number
  showLabels: boolean
}

export interface GizmoControllerProps {
  mode: GizmoMode
  onToggleMode?: () => void
  initialSettings?: Partial<GizmoSettings>
}

export interface SettingsProps {
  settings: GizmoSettings
  updateSettings: (settings: Partial<GizmoSettings>) => void
  onClose: () => void
}

export interface GizmoState {
  boxPosition: { x: number; y: number; z: number }
  boxRotation: { x: number; y: number; z: number }
  activeAxis: Axis
  activeRotationAxis: RotationAxis
  pathProgress: number
  isDragging: boolean
  isAxisLocked: boolean
}

export interface GizmoVisualizationProps {
  svgRef: React.RefObject<SVGSVGElement>
  settings: GizmoSettings
  state: GizmoState
  x: any // MotionValue
  y: any // MotionValue
  handleDragStart: () => void
  handleDrag: (event: any, info: any) => void
  handleDragEnd: () => void
  getAxisColor: (axis: Axis | null) => string
  getHandleColor: () => string
}
