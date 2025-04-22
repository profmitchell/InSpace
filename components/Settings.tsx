"use client"

import type React from "react"

import { motion } from "framer-motion"
import type { SettingsProps } from "../types"

export const Settings: React.FC<SettingsProps> = ({ settings, updateSettings, onClose }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      className="absolute top-0 left-full ml-4 p-4 bg-gray-800/90 backdrop-blur-md rounded-lg shadow-lg z-10 w-64"
      style={{ maxHeight: "100%", overflowY: "auto" }}
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
        {/* Appearance Section */}
        <div className="bg-gray-700/30 p-2 rounded-lg">
          <h4 className="text-white text-xs font-medium uppercase mb-2">Appearance</h4>

          {/* Size Slider */}
          <div className="mb-2">
            <label htmlFor="size-slider" className="block text-xs text-white/70 mb-1">
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
          <div className="mb-2">
            <label htmlFor="handle-size-slider" className="block text-xs text-white/70 mb-1">
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
          <div className="mb-2">
            <label htmlFor="line-size-slider" className="block text-xs text-white/70 mb-1">
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

          {/* Use Colors Toggle */}
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="use-colors" className="text-xs text-white/70">
              Use Colors
            </label>
            <div className="relative inline-block w-8 h-4 transition duration-200 ease-in-out rounded-full">
              <input
                id="use-colors"
                type="checkbox"
                className="absolute w-4 h-4 opacity-0 z-10 cursor-pointer"
                checked={settings.useColors}
                onChange={(e) => updateSettings({ useColors: e.target.checked })}
              />
              <div
                className={`w-8 h-4 rounded-full transition-colors ${
                  settings.useColors ? "bg-blue-500" : "bg-gray-600"
                }`}
              ></div>
              <div
                className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full transition-transform ${
                  settings.useColors ? "transform translate-x-4" : ""
                }`}
              ></div>
            </div>
          </div>

          {/* Show Labels Toggle */}
          <div className="flex items-center justify-between">
            <label htmlFor="show-labels" className="text-xs text-white/70">
              Show Axis Labels
            </label>
            <div className="relative inline-block w-8 h-4 transition duration-200 ease-in-out rounded-full">
              <input
                id="show-labels"
                type="checkbox"
                className="absolute w-4 h-4 opacity-0 z-10 cursor-pointer"
                checked={settings.showLabels}
                onChange={(e) => updateSettings({ showLabels: e.target.checked })}
              />
              <div
                className={`w-8 h-4 rounded-full transition-colors ${
                  settings.showLabels ? "bg-blue-500" : "bg-gray-600"
                }`}
              ></div>
              <div
                className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full transition-transform ${
                  settings.showLabels ? "transform translate-x-4" : ""
                }`}
              ></div>
            </div>
          </div>
        </div>

        {/* Behavior Section */}
        <div className="bg-gray-700/30 p-2 rounded-lg">
          <h4 className="text-white text-xs font-medium uppercase mb-2">Behavior</h4>

          {/* Allow Drag Beyond Bounds Toggle */}
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="allow-drag-beyond" className="text-xs text-white/70">
              Allow Drag Beyond Bounds
            </label>
            <div className="relative inline-block w-8 h-4 transition duration-200 ease-in-out rounded-full">
              <input
                id="allow-drag-beyond"
                type="checkbox"
                className="absolute w-4 h-4 opacity-0 z-10 cursor-pointer"
                checked={settings.allowDragBeyondBounds}
                onChange={(e) => updateSettings({ allowDragBeyondBounds: e.target.checked })}
              />
              <div
                className={`w-8 h-4 rounded-full transition-colors ${
                  settings.allowDragBeyondBounds ? "bg-blue-500" : "bg-gray-600"
                }`}
              ></div>
              <div
                className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full transition-transform ${
                  settings.allowDragBeyondBounds ? "transform translate-x-4" : ""
                }`}
              ></div>
            </div>
          </div>

          {/* Auto-Lock Axis Toggle */}
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="lock-axis" className="text-xs text-white/70">
              Auto-Lock Axis When Dragging
            </label>
            <div className="relative inline-block w-8 h-4 transition duration-200 ease-in-out rounded-full">
              <input
                id="lock-axis"
                type="checkbox"
                className="absolute w-4 h-4 opacity-0 z-10 cursor-pointer"
                checked={settings.lockAxis}
                onChange={(e) => updateSettings({ lockAxis: e.target.checked })}
              />
              <div
                className={`w-8 h-4 rounded-full transition-colors ${
                  settings.lockAxis ? "bg-blue-500" : "bg-gray-600"
                }`}
              ></div>
              <div
                className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full transition-transform ${
                  settings.lockAxis ? "transform translate-x-4" : ""
                }`}
              ></div>
            </div>
          </div>

          {/* Show Both Modes Toggle */}
          <div className="flex items-center justify-between">
            <label htmlFor="show-both-modes" className="text-xs text-white/70">
              Show Both Modes
            </label>
            <div className="relative inline-block w-8 h-4 transition duration-200 ease-in-out rounded-full">
              <input
                id="show-both-modes"
                type="checkbox"
                className="absolute w-4 h-4 opacity-0 z-10 cursor-pointer"
                checked={settings.showBothModes}
                onChange={(e) => updateSettings({ showBothModes: e.target.checked })}
              />
              <div
                className={`w-8 h-4 rounded-full transition-colors ${
                  settings.showBothModes ? "bg-blue-500" : "bg-gray-600"
                }`}
              ></div>
              <div
                className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full transition-transform ${
                  settings.showBothModes ? "transform translate-x-4" : ""
                }`}
              ></div>
            </div>
          </div>
        </div>

        {/* Keyboard shortcuts info */}
        <div className="bg-gray-700/30 p-2 rounded-lg">
          <h4 className="text-white text-xs font-medium uppercase mb-2">Keyboard Shortcuts</h4>
          <ul className="text-white/70 text-xs space-y-1">
            <li className="flex items-center">
              <span className="bg-gray-600 px-1.5 py-0.5 rounded mr-1 text-[10px]">Shift</span>
              <span>+ Drag: Lock to current axis</span>
            </li>
            <li className="flex items-center">
              <span className="bg-gray-600 px-1.5 py-0.5 rounded mr-1 text-[10px]">Shift</span>
              <span>(while dragging): Lock current axis</span>
            </li>
          </ul>
        </div>
      </div>
    </motion.div>
  )
}
