"use client"

import type React from "react"

import { useState, useRef } from "react"
import { AnimatePresence, motion } from "framer-motion"
import type { GizmoSettings, GizmoControllerProps } from "./types"
import { useGizmo } from "./hooks/useGizmo"
import { TransformGizmo } from "./components/TransformGizmo"
import { RotateGizmo } from "./components/RotateGizmo"
import { Settings } from "./components/Settings"
import { getAxisColor } from "./utils"

const defaultSettings: GizmoSettings = {
  size: 220,
  allowDragBeyondBounds: false,
  lockAxis: true,
  useColors: true,
  handleSize: 10,
  lineSize: 2,
  showLabels: true,
}

export const InSpace: React.FC<GizmoControllerProps> = ({ mode, onToggleMode, initialSettings = {} }) => {
  const [settings, setSettings] = useState<GizmoSettings>({
    ...defaultSettings,
    ...initialSettings,
  })
  const [showSettings, setShowSettings] = useState(false)

  // Reference to the SVG element for coordinate calculations
  const svgRef = useRef<SVGSVGElement>(null)

  // Use the gizmo hook
  const { currentMode, state, x, y, handleDragStart, handleDrag, handleDragEnd, toggleMode } = useGizmo(
    mode,
    settings,
    svgRef,
  )

  const handleSettingsToggle = () => {
    setShowSettings(!showSettings)
  }

  const updateSettings = (newSettings: Partial<GizmoSettings>) => {
    setSettings((prev) => ({
      ...prev,
      ...newSettings,
    }))
  }

  // Get handle color based on active axis
  const getHandleColor = () => {
    if (!settings.useColors) return "#f0f0f0"

    if (currentMode === "transform") {
      return state.isDragging ? getAxisColor(state.activeAxis, settings.useColors) : "#f0f0f0"
    } else {
      return state.isDragging && state.activeRotationAxis
        ? getAxisColor(state.activeRotationAxis, settings.useColors)
        : "#f0f0f0"
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
  const formatRotationAngle = (axis: "x" | "y" | "z") => {
    const angle = Math.round(state.boxRotation[axis])
    return `${angle}°`
  }

  return (
    <div className="flex flex-row items-center justify-center gap-8 p-4">
      {/* Demo Canvas */}
      <div className="w-64 h-64 bg-gray-800/50 backdrop-blur-md rounded-xl shadow-inner flex items-center justify-center perspective-500">
        <div
          className="w-32 h-32 bg-white/20 border border-white/30 rounded-sm"
          style={{
            transform: `
              translateX(${state.boxPosition.x}px) 
              translateY(${state.boxPosition.y}px) 
              translateZ(${state.boxPosition.z}px)
              rotateX(${state.boxRotation.x}deg) 
              rotateY(${state.boxRotation.y}deg) 
              rotateZ(${state.boxRotation.z}deg)
            `,
            transition: state.isDragging ? "none" : "transform 0.1s ease-out",
          }}
        >
          <div className="w-full h-full flex items-center justify-center text-white/70 text-xs">
            {currentMode === "transform" ? "Position" : "Rotation"}
          </div>
        </div>
      </div>

      {/* Gizmo Controller */}
      <div
        className="relative backdrop-blur-md bg-white/10 rounded-xl p-4 shadow-inner select-none"
        style={{ width: `${settings.size}px`, height: `${settings.size}px` }}
      >
        <div className="flex flex-col items-center gap-2 h-full">
          <div className="flex justify-between items-center w-full">
            <div className="text-sm font-medium text-white">Gizmo Mode</div>
            <button
              onClick={handleSettingsToggle}
              className="flex items-center justify-center w-8 h-8 bg-white/20 hover:bg-white/30 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
              aria-label="Settings"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M19.4 15C19.2669 15.3016 19.2272 15.6362 19.286 15.9606C19.3448 16.285 19.4995 16.5843 19.73 16.82L19.79 16.88C19.976 17.0657 20.1235 17.2863 20.2241 17.5291C20.3248 17.7719 20.3766 18.0322 20.3766 18.295C20.3766 18.5578 20.3248 18.8181 20.2241 19.0609C20.1235 19.3037 19.976 19.5243 19.79 19.71C19.6043 19.896 19.3837 20.0435 19.1409 20.1441C18.8981 20.2448 18.6378 20.2966 18.375 20.2966C18.1122 20.2966 17.8519 20.2448 17.6091 20.1441C17.3663 20.0435 17.1457 19.896 16.96 19.71L16.9 19.65C16.6643 19.4195 16.365 19.2648 16.0406 19.206C15.7162 19.1472 15.3816 19.1869 15.08 19.32C14.7842 19.4468 14.532 19.6572 14.3543 19.9255C14.1766 20.1938 14.0813 20.5082 14.08 20.83V21C14.08 21.5304 13.8693 22.0391 13.4942 22.4142C13.1191 22.7893 12.6104 23 12.08 23C11.5496 23 11.0409 22.7893 10.6658 22.4142C10.2907 22.0391 10.08 21.5304 10.08 21V20.91C10.0723 20.579 9.96512 20.258 9.77251 19.9887C9.5799 19.7194 9.31074 19.5143 9 19.4C8.69838 19.2669 8.36381 19.2272 8.03941 19.286C7.71502 19.3448 7.41568 19.4995 7.18 19.73L7.12 19.79C6.93425 19.976 6.71368 20.1235 6.47088 20.2241C6.22808 20.3248 5.96783 20.3766 5.705 20.3766C5.44217 20.3766 5.18192 20.3248 4.93912 20.2241C4.69632 20.1235 4.47575 19.976 4.29 19.79C4.10405 19.6043 3.95653 19.3837 3.85588 19.1409C3.75523 18.8981 3.70343 18.6378 3.70343 18.375C3.70343 18.1122 3.75523 17.8519 3.85588 17.6091C3.95653 17.3663 4.10405 17.1457 4.29 16.96L4.35 16.9C4.58054 16.6643 4.73519 16.365 4.794 16.0406C4.85282 15.7162 4.81312 15.3816 4.68 15.08C4.55324 14.7842 4.34276 14.532 4.07447 14.3543C3.80618 14.1766 3.49179 14.0813 3.17 14.08H3C2.46957 14.08 1.96086 13.8693 1.58579 13.4942C1.21071 13.1191 1 12.6104 1 12.08C1 11.5496 1.21071 11.0409 1.58579 10.6658C1.96086 10.2907 2.46957 10.08 3 10.08H3.09C3.42099 10.0723 3.742 9.96512 4.0113 9.77251C4.28059 9.5799 4.48572 9.31074 4.6 9C4.73312 8.69838 4.77282 8.36381 4.714 8.03941C4.65519 7.71502 4.50054 7.41568 4.27 7.18L4.21 7.12C4.02405 6.93425 3.87653 6.71368 3.77588 6.47088C3.67523 6.22808 3.62343 5.96783 3.62343 5.705C3.62343 5.44217 3.67523 5.18192 3.77588 4.93912C3.87653 4.69632 4.02405 4.47575 4.21 4.29C4.39575 4.10405 4.61632 3.95653 4.85912 3.85588C5.10192 3.75523 5.36217 3.70343 5.625 3.70343C5.88783 3.70343 6.14808 3.75523 6.39088 3.85588C6.63368 3.95653 6.85425 4.10405 7.04 4.29L7.1 4.35C7.33568 4.58054 7.63502 4.73519 7.95941 4.794C8.28381 4.85282 8.61838 4.81312 8.92 4.68H9C9.29577 4.55324 9.54802 4.34276 9.72569 4.07447C9.90337 3.80618 9.99872 3.49179 10 3.17V3C10 2.46957 10.2107 1.96086 10.5858 1.58579C10.9609 1.21071 11.4696 1 12 1C12.5304 1 13.0391 1.21071 13.4142 1.58579C13.7893 1.96086 14 2.46957 14 3V3.09C14.0013 3.41179 14.0966 3.72618 14.2743 3.99447C14.452 4.26276 14.7042 4.47324 15 4.6C15.3016 4.73312 15.6362 4.77282 15.9606 4.714C16.285 4.65519 16.5843 4.50054 16.82 4.27L16.88 4.21C17.0657 4.02405 17.2863 3.87653 17.5291 3.77588C17.7719 3.67523 18.0322 3.62343 18.295 3.62343C18.5578 3.62343 18.8181 3.67523 19.0609 3.77588C19.3037 3.87653 19.5243 4.02405 19.71 4.21C19.896 4.39575 20.0435 4.61632 20.1441 4.85912C20.2448 5.10192 20.2966 5.36217 20.2966 5.625C20.2966 5.88783 20.2448 6.14808 20.1441 6.39088C20.0435 6.63368 19.896 6.85425 19.71 7.04L19.65 7.1C19.4195 7.33568 19.2648 7.63502 19.206 7.95941C19.1472 8.28381 19.1869 8.61838 19.32 8.92V9C19.4468 9.29577 19.6572 9.54802 19.9255 9.72569C20.1938 9.90337 20.5082 9.99872 20.83 10H21C21.5304 10 22.0391 10.2107 22.4142 10.5858C22.7893 10.9609 23 11.4696 23 12C23 12.5304 22.7893 13.0391 22.4142 13.4142C22.0391 13.7893 21.5304 14 21 14H20.91C20.5882 14.0013 20.2738 14.0966 20.0055 14.2743C19.7372 14.452 19.5268 14.7042 19.4 15Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>

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
                  <TransformGizmo
                    svgRef={svgRef}
                    settings={settings}
                    state={state}
                    x={x}
                    y={y}
                    handleDragStart={handleDragStart}
                    handleDrag={handleDrag}
                    handleDragEnd={handleDragEnd}
                    getAxisColor={(axis) => getAxisColor(axis, settings.useColors)}
                    getHandleColor={getHandleColor}
                  />
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
                  <RotateGizmo
                    svgRef={svgRef}
                    settings={settings}
                    state={state}
                    x={x}
                    y={y}
                    handleDragStart={handleDragStart}
                    handleDrag={handleDrag}
                    handleDragEnd={handleDragEnd}
                    getAxisColor={(axis) => getAxisColor(axis, settings.useColors)}
                    getHandleColor={getHandleColor}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Position/Rotation indicator */}
          <div className="text-xs text-white/70 mb-1 h-6 flex items-center">
            {currentMode === "rotate" ? (
              <div className="flex items-center justify-center">
                {state.activeRotationAxis ? (
                  <span>
                    <span style={{ color: getAxisColor(state.activeRotationAxis, settings.useColors) }}>
                      {state.activeRotationAxis.toUpperCase()}
                    </span>
                    : {formatRotationAngle(state.activeRotationAxis)}
                  </span>
                ) : (
                  <span>Drag to rotate {state.isAxisLocked ? "(Axis Locked)" : ""}</span>
                )}
              </div>
            ) : (
              <span>
                {state.isDragging ? (
                  <>
                    <span style={{ color: getAxisColor(state.activeAxis, settings.useColors) }}>
                      {state.activeAxis.toUpperCase()}
                    </span>
                    : {formatProgress(state.pathProgress)}
                  </>
                ) : (
                  <span>Drag to move {state.isAxisLocked ? "(Axis Locked)" : ""}</span>
                )}
              </span>
            )}
          </div>

          <button
            onClick={toggleMode}
            className="flex items-center justify-center w-10 h-10 bg-white/20 hover:bg-white/30 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
            tabIndex={0}
            aria-label={`Switch to ${currentMode === "transform" ? "rotate" : "transform"} mode`}
          >
            {currentMode === "transform" ? (
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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

        {/* Settings Panel */}
        {showSettings && (
          <Settings settings={settings} updateSettings={updateSettings} onClose={() => setShowSettings(false)} />
        )}
      </div>
    </div>
  )
}
