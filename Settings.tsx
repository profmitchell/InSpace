"use client"

import type React from "react"
import { motion } from "framer-motion"

interface GizmoSettings {
  size: number
  allowDragBeyondBounds: boolean
  lockAxis: boolean
  useColors: boolean
  handleSize: number
  lineSize: number
  showLabels: boolean
}

interface SettingsProps {
  settings: GizmoSettings
  updateSettings: (settings: Partial<GizmoSettings>) => void
  onClose: () => void
}

export const Settings: React.FC<SettingsProps> = ({ settings, updateSettings, onClose }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="absolute top-full left-0 right-0 mt-2 p-4 bg-gray-800/90 backdrop-blur-md rounded-lg shadow-lg z-10"
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-white font-medium">Settings</h3>
        <button onClick={onClose} className="text-white/70 hover:text-white" aria-label="Close settings">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M18 6L6 18M6 6L18 18"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      <div className="space-y-4">
        {/* Size Slider */}
        <div>
          <label htmlFor="size-slider" className="block text-sm text-white/70 mb-1">
            Size: {settings.size}px
          </label>
          <input
            id="size-slider"
            type="range"
            min="120"
            max="300"
            step="10"
            value={settings.size}
            onChange={(e) => updateSettings({ size: Number.parseInt(e.target.value) })}
            className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Handle Size Slider */}
        <div>
          <label htmlFor="handle-size-slider" className="block text-sm text-white/70 mb-1">
            Handle Size: {settings.handleSize}px
          </label>
          <input
            id="handle-size-slider"
            type="range"
            min="6"
            max="20"
            step="1"
            value={settings.handleSize}
            onChange={(e) => updateSettings({ handleSize: Number.parseInt(e.target.value) })}
            className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Line Size Slider */}
        <div>
          <label htmlFor="line-size-slider" className="block text-sm text-white/70 mb-1">
            Line Size: {settings.lineSize}px
          </label>
          <input
            id="line-size-slider"
            type="range"
            min="1"
            max="5"
            step="0.5"
            value={settings.lineSize}
            onChange={(e) => updateSettings({ lineSize: Number.parseFloat(e.target.value) })}
            className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Toggle Switches */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="allow-drag-beyond" className="text-sm text-white/70">
              Allow Drag Beyond Bounds
            </label>
            <div className="relative inline-block w-10 h-5 transition duration-200 ease-in-out rounded-full">
              <input
                id="allow-drag-beyond"
                type="checkbox"
                className="absolute w-5 h-5 opacity-0 z-10 cursor-pointer"
                checked={settings.allowDragBeyondBounds}
                onChange={(e) => updateSettings({ allowDragBeyondBounds: e.target.checked })}
              />
              <div
                className={`w-10 h-5 rounded-full transition-colors ${
                  settings.allowDragBeyondBounds ? "bg-blue-500" : "bg-gray-600"
                }`}
              ></div>
              <div
                className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                  settings.allowDragBeyondBounds ? "transform translate-x-5" : ""
                }`}
              ></div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label htmlFor="lock-axis" className="text-sm text-white/70">
              Lock Axis When Dragging
            </label>
            <div className="relative inline-block w-10 h-5 transition duration-200 ease-in-out rounded-full">
              <input
                id="lock-axis"
                type="checkbox"
                className="absolute w-5 h-5 opacity-0 z-10 cursor-pointer"
                checked={settings.lockAxis}
                onChange={(e) => updateSettings({ lockAxis: e.target.checked })}
              />
              <div
                className={`w-10 h-5 rounded-full transition-colors ${
                  settings.lockAxis ? "bg-blue-500" : "bg-gray-600"
                }`}
              ></div>
              <div
                className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                  settings.lockAxis ? "transform translate-x-5" : ""
                }`}
              ></div>
            </div>
          </div>
          <div className="text-xs text-white/50 mt-1 mb-2">
            Tip: Hold Shift to temporarily lock to axis while dragging
          </div>

          <div className="flex items-center justify-between">
            <label htmlFor="use-colors" className="text-sm text-white/70">
              Use Colors
            </label>
            <div className="relative inline-block w-10 h-5 transition duration-200 ease-in-out rounded-full">
              <input
                id="use-colors"
                type="checkbox"
                className="absolute w-5 h-5 opacity-0 z-10 cursor-pointer"
                checked={settings.useColors}
                onChange={(e) => updateSettings({ useColors: e.target.checked })}
              />
              <div
                className={`w-10 h-5 rounded-full transition-colors ${
                  settings.useColors ? "bg-blue-500" : "bg-gray-600"
                }`}
              ></div>
              <div
                className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                  settings.useColors ? "transform translate-x-5" : ""
                }`}
              ></div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label htmlFor="show-labels" className="text-sm text-white/70">
              Show Axis Labels
            </label>
            <div className="relative inline-block w-10 h-5 transition duration-200 ease-in-out rounded-full">
              <input
                id="show-labels"
                type="checkbox"
                className="absolute w-5 h-5 opacity-0 z-10 cursor-pointer"
                checked={settings.showLabels}
                onChange={(e) => updateSettings({ showLabels: e.target.checked })}
              />
              <div
                className={`w-10 h-5 rounded-full transition-colors ${
                  settings.showLabels ? "bg-blue-500" : "bg-gray-600"
                }`}
              ></div>
              <div
                className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                  settings.showLabels ? "transform translate-x-5" : ""
                }`}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
