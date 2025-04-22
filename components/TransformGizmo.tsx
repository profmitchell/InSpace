"use client"

import type React from "react"

import { motion } from "framer-motion"
import type { GizmoVisualizationProps } from "../types"

export const TransformGizmo: React.FC<GizmoVisualizationProps> = ({
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
  const { activeAxis, isDragging, isAxisLocked } = state
  const { lineSize, handleSize, showLabels, useColors } = settings

  return (
    <svg ref={svgRef} width="100%" height="100%" viewBox="-80 -80 160 160" className="select-none">
      {/* X Axis (Red) - Extended */}
      <line
        x1="0"
        y1="0"
        x2="60"
        y2="0"
        stroke={getAxisColor("x")}
        strokeWidth={activeAxis === "x" ? lineSize * 1.5 : lineSize}
        strokeOpacity={activeAxis === "x" ? 1 : 0.7}
      />
      <polygon points="60,0 55,-3 55,3" fill={getAxisColor("x")} stroke={getAxisColor("x")} strokeWidth={lineSize} />
      <line x1="0" y1="0" x2="-60" y2="0" stroke={getAxisColor("x")} strokeWidth={lineSize} strokeOpacity="0.5" />

      {/* Y Axis (Green) - Extended */}
      <line
        x1="0"
        y1="0"
        x2="0"
        y2="-60"
        stroke={getAxisColor("y")}
        strokeWidth={activeAxis === "y" ? lineSize * 1.5 : lineSize}
        strokeOpacity={activeAxis === "y" ? 1 : 0.7}
      />
      <polygon points="0,-60 -3,-55 3,-55" fill={getAxisColor("y")} stroke={getAxisColor("y")} strokeWidth={lineSize} />
      <line x1="0" y1="0" x2="0" y2="60" stroke={getAxisColor("y")} strokeWidth={lineSize} strokeOpacity="0.5" />

      {/* Z Axis (Blue) - Extended with isometric angle */}
      <line
        x1="0"
        y1="0"
        x2="-42"
        y2="42"
        stroke={getAxisColor("z")}
        strokeWidth={activeAxis === "z" ? lineSize * 1.5 : lineSize}
        strokeOpacity={activeAxis === "z" ? 1 : 0.7}
      />
      <polygon
        points="-42,42 -36,39 -39,36"
        fill={getAxisColor("z")}
        stroke={getAxisColor("z")}
        strokeWidth={lineSize}
      />
      <line x1="0" y1="0" x2="42" y2="-42" stroke={getAxisColor("z")} strokeWidth={lineSize} strokeOpacity="0.5" />

      {/* Axis labels */}
      {showLabels && (
        <>
          <text
            x="62"
            y="4"
            fill={getAxisColor("x")}
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
            fill={getAxisColor("y")}
            fontSize="10"
            fontWeight="bold"
            opacity="0.8"
            className="select-none pointer-events-none"
          >
            Y
          </text>
          <text
            x="-45"
            y="45"
            fill={getAxisColor("z")}
            fontSize="10"
            fontWeight="bold"
            opacity="0.8"
            className="select-none pointer-events-none"
          >
            Z
          </text>
        </>
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
          stroke={isDragging ? getAxisColor(activeAxis) : "#000000"}
          strokeWidth="2"
          className="cursor-grab active:cursor-grabbing"
        />
        <circle r={handleSize / 2} fill={getHandleColor()} />
      </motion.g>
    </svg>
  )
}
