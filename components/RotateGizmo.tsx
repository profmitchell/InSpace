"use client"

import type React from "react"

import { motion } from "framer-motion"
import type { GizmoVisualizationProps } from "../types"
import { formatRotationAngle } from "../utils"

export const RotateGizmo: React.FC<GizmoVisualizationProps> = ({
  svgRef,
  settings,
  state,
  x,
  y,
  handleDragStart,
  handleDrag,
  handleDragEnd,
  getAxisColor,
  getHandleColor,
}) => {
  const { activeRotationAxis, boxRotation, isDragging, isAxisLocked } = state
  const { lineSize, handleSize, showLabels, useColors } = settings

  // Calculate ring sizes with proper spacing
  const xRingSize = 60
  const yRingSize = 50
  const zRingSize = 40

  return (
    <svg ref={svgRef} width="100%" height="100%" viewBox="-80 -80 160 160" className="select-none">
      {/* Subtle grid for better spatial awareness */}
      <line x1="-60" y1="0" x2="60" y2="0" stroke="#ffffff" strokeWidth="0.5" strokeOpacity="0.1" />
      <line x1="0" y1="-60" x2="0" y2="60" stroke="#ffffff" strokeWidth="0.5" strokeOpacity="0.1" />

      {/* 3D Coordinate Axes */}
      <line x1="0" y1="0" x2="25" y2="0" stroke={getAxisColor("x")} strokeWidth={lineSize} strokeOpacity="0.7" />
      {showLabels && (
        <text
          x="27"
          y="4"
          fill={getAxisColor("x")}
          fontSize="10"
          opacity="0.8"
          className="select-none pointer-events-none"
        >
          X
        </text>
      )}

      <line x1="0" y1="0" x2="0" y2="-25" stroke={getAxisColor("y")} strokeWidth={lineSize} strokeOpacity="0.7" />
      {showLabels && (
        <text
          x="2"
          y="-27"
          fill={getAxisColor("y")}
          fontSize="10"
          opacity="0.8"
          className="select-none pointer-events-none"
        >
          Y
        </text>
      )}

      <line x1="0" y1="0" x2="-18" y2="18" stroke={getAxisColor("z")} strokeWidth={lineSize} strokeOpacity="0.7" />
      {showLabels && (
        <text
          x="-22"
          y="22"
          fill={getAxisColor("z")}
          fontSize="10"
          opacity="0.8"
          className="select-none pointer-events-none"
        >
          Z
        </text>
      )}

      {/* Rotation Rings - Overlapping isometric design */}
      {/* X Axis Rotation (Red) */}
      <ellipse
        cx="0"
        cy="0"
        rx={xRingSize}
        ry={xRingSize * 0.4}
        fill="none"
        stroke={getAxisColor("x")}
        strokeWidth={activeRotationAxis === "x" ? lineSize * 1.5 : lineSize}
        strokeOpacity={activeRotationAxis === "x" ? 1 : 0.3}
        strokeDasharray={activeRotationAxis !== "x" && activeRotationAxis !== null ? "3,3" : ""}
        transform="rotate(0)"
      />

      {/* Y Axis Rotation (Green) */}
      <ellipse
        cx="0"
        cy="0"
        rx={yRingSize * 0.4}
        ry={yRingSize}
        fill="none"
        stroke={getAxisColor("y")}
        strokeWidth={activeRotationAxis === "y" ? lineSize * 1.5 : lineSize}
        strokeOpacity={activeRotationAxis === "y" ? 1 : 0.3}
        strokeDasharray={activeRotationAxis !== "y" && activeRotationAxis !== null ? "3,3" : ""}
        transform="rotate(0)"
      />

      {/* Z Axis Rotation (Blue) - Full circle */}
      <circle
        cx="0"
        cy="0"
        r={zRingSize}
        fill="none"
        stroke={getAxisColor("z")}
        strokeWidth={activeRotationAxis === "z" ? lineSize * 1.5 : lineSize}
        strokeOpacity={activeRotationAxis === "z" ? 1 : 0.3}
        strokeDasharray={activeRotationAxis !== "z" && activeRotationAxis !== null ? "3,3" : ""}
      />

      {/* Y-shaped selection guides */}
      <g opacity="0.2">
        {/* X axis guide (2 o'clock) */}
        <line x1="0" y1="0" x2="40" y2="0" stroke={getAxisColor("x")} strokeWidth="1" strokeDasharray="2,2" />

        {/* Y axis guide (10 o'clock) */}
        <line x1="0" y1="0" x2="-35" y2="-35" stroke={getAxisColor("y")} strokeWidth="1" strokeDasharray="2,2" />

        {/* Z axis guide (6 o'clock) */}
        <line x1="0" y1="0" x2="0" y2="40" stroke={getAxisColor("z")} strokeWidth="1" strokeDasharray="2,2" />
      </g>

      {/* Rotation indicators */}
      {activeRotationAxis === "x" && (
        <line
          x1="0"
          y1="0"
          x2={xRingSize}
          y2="0"
          stroke={getAxisColor("x")}
          strokeWidth={lineSize * 1.5}
          transform={`rotate(${boxRotation.x})`}
        />
      )}
      {activeRotationAxis === "y" && (
        <line
          x1="0"
          y1="0"
          x2="0"
          y2={-yRingSize}
          stroke={getAxisColor("y")}
          strokeWidth={lineSize * 1.5}
          transform={`rotate(${boxRotation.y})`}
        />
      )}
      {activeRotationAxis === "z" && (
        <line
          x1="0"
          y1="0"
          x2={zRingSize}
          y2="0"
          stroke={getAxisColor("z")}
          strokeWidth={lineSize * 1.5}
          transform={`rotate(${boxRotation.z})`}
        />
      )}

      {/* Axis lock indicator */}
      {isAxisLocked && (
        <g className="axis-lock-indicator">
          <circle cx="0" cy="0" r="20" fill="none" stroke="#ffffff" strokeWidth="1" strokeDasharray="2,2" />
          <text
            x="0"
            y="-25"
            fill="#ffffff"
            fontSize="8"
            textAnchor="middle"
            opacity="0.8"
            className="select-none pointer-events-none"
          >
            LOCKED
          </text>
        </g>
      )}

      {/* Rotation angle display */}
      {activeRotationAxis && (
        <text x="0" y="70" fill="#ffffff" fontSize="10" textAnchor="middle" className="select-none pointer-events-none">
          {formatRotationAngle(boxRotation[activeRotationAxis])}
        </text>
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
          r={handleSize}
          fill={isDragging ? "#ffffff" : "#f0f0f0"}
          stroke={isDragging && activeRotationAxis ? getAxisColor(activeRotationAxis) : "#000000"}
          strokeWidth="2"
          className="cursor-grab active:cursor-grabbing"
        />
        <circle r={handleSize / 2} fill={getHandleColor()} />
      </motion.g>
    </svg>
  )
}
