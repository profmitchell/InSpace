"use client"

import type React from "react"

import { useState } from "react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GizmoController, type GizmoSettings } from "../gizmo/GizmoController"
import { CompactSettings } from "../gizmo/CompactSettings"
import { DemoObject } from "./DemoObject"
import ThreeDObject from "./ThreeDObject"
import { HoverBorderGradient } from "../ui/hover-border-gradient"

// Add the Inter font import at the top
import { Inter } from "next/font/google"

// Initialize the Inter font with thin weight
const inter = Inter({ subsets: ["latin"], weight: ["300"] })

const defaultSettings: GizmoSettings = {
  size: 300,
  allowDragBeyondBounds: false,
  lockAxis: true,
  useColors: false,
  handleSize: 10,
  lineSize: 2,
  showLabels: true,
  showModeToggle: true,
}

export const GizmoWorkspace: React.FC = () => {
  const [mode, setMode] = useState<"transform" | "rotate">("transform")
  const [viewMode, setViewMode] = useState<"3d" | "2d">("3d")
  const [settings, setSettings] = useState<GizmoSettings>(defaultSettings)

  // State for position and rotation
  const [position, setPosition] = useState({ x: 0, y: 0, z: 0 })
  const [rotation, setRotation] = useState({ x: 0, y: 0, z: 0 })

  // Demo objects
  const [activeDemo, setActiveDemo] = useState<"cube" | "pyramid" | "sphere">("cube")
  const [use3DMeshes, setUse3DMeshes] = useState(true)

  const updateSettings = (newSettings: Partial<GizmoSettings>) => {
    setSettings((prev) => ({
      ...prev,
      ...newSettings,
    }))
  }

  // Add a reset function
  const resetObject = () => {
    setPosition({ x: 0, y: 0, z: 0 })
    setRotation({ x: 0, y: 0, z: 0 })
  }

  return (
    <div className="flex flex-col h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-white/10 p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">InSpace Gizmo Controller</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label htmlFor="use-3d-meshes" className="text-sm text-white/70">
              Use 3D Meshes
            </label>
            <input
              type="checkbox"
              id="use-3d-meshes"
              checked={use3DMeshes}
              onChange={(e) => setUse3DMeshes(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
          </div>
          <a
            href="https://cohen-concepts.com"
            target="_blank"
            rel="noopener noreferrer"
            className={`${inter.className} text-sm text-white/50 hover:text-white/80 transition-colors`}
          >
            By: Cohen-Concepts.com
          </a>
        </div>
      </header>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel - Objects */}
        <div className="w-64 border-r border-white/10 p-4 flex flex-col">
          <div className="mb-4">
            <Tabs defaultValue="3d" value={viewMode} onValueChange={(value) => setViewMode(value as "3d" | "2d")}>
              <TabsList className="w-full bg-black/40">
                <TabsTrigger value="3d" className="flex-1 data-[state=active]:bg-white/10">
                  3D
                </TabsTrigger>
                <TabsTrigger value="2d" className="flex-1 data-[state=active]:bg-white/10">
                  2D
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <h2 className="text-sm font-medium mb-3 text-white/70">Demo Objects</h2>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setActiveDemo("cube")}
              className={`p-2 rounded-lg ${activeDemo === "cube" ? "bg-white/20" : "bg-black/40 hover:bg-white/10"}`}
            >
              <div className="w-full aspect-square bg-white/20 border border-white/30 rounded-sm flex items-center justify-center">
                <span className="text-white/70 text-xs">Cube</span>
              </div>
            </button>
            <button
              onClick={() => setActiveDemo("pyramid")}
              className={`p-2 rounded-lg ${activeDemo === "pyramid" ? "bg-white/20" : "bg-black/40 hover:bg-white/10"}`}
            >
              <div className="w-full aspect-square relative">
                <div
                  className="absolute inset-0"
                  style={{
                    clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
                    backgroundColor: "rgba(255, 255, 255, 0.2)",
                    border: "1px solid rgba(255, 255, 255, 0.3)",
                  }}
                ></div>
                <div className="absolute inset-0 flex items-center justify-center pt-4">
                  <span className="text-white/70 text-xs">Pyramid</span>
                </div>
              </div>
            </button>
            <button
              onClick={() => setActiveDemo("sphere")}
              className={`p-2 rounded-lg ${activeDemo === "sphere" ? "bg-white/20" : "bg-black/40 hover:bg-white/10"}`}
            >
              <div className="w-full aspect-square rounded-full bg-white/20 border border-white/30 flex items-center justify-center">
                <span className="text-white/70 text-xs">Sphere</span>
              </div>
            </button>
          </div>

          <div className="mt-auto">
            <div className="text-xs text-white/50 mb-2">Current Values:</div>
            <div className="bg-black/40 rounded-lg p-3 text-xs space-y-1">
              <div>
                <span className="text-white/50">Position:</span> X: {position.x.toFixed(1)}, Y: {position.y.toFixed(1)},
                Z: {position.z.toFixed(1)}
              </div>
              <div>
                <span className="text-white/50">Rotation:</span> X: {rotation.x.toFixed(1)}°, Y: {rotation.y.toFixed(1)}
                °, Z: {rotation.z.toFixed(1)}°
              </div>
            </div>
          </div>
        </div>

        {/* Center panel - Canvas */}
        <div className="flex-1 flex items-center justify-center bg-gradient-to-b from-black to-gray-900">
          <div className="w-96 h-96 flex items-center justify-center">
            {use3DMeshes ? (
              <div className="w-full h-full">
                <ThreeDObject position={position} rotation={rotation} type={activeDemo} size={64} viewMode={viewMode} />
              </div>
            ) : (
              <div
                className={`${viewMode === "3d" ? "perspective-500" : ""} w-full h-full flex items-center justify-center`}
              >
                <DemoObject
                  position={position}
                  rotation={viewMode === "3d" ? rotation : { ...rotation, x: 0, y: 0 }}
                  type={activeDemo}
                  size={128}
                />
              </div>
            )}
          </div>
        </div>

        {/* Right panel - Gizmo & Settings */}
        <div className="w-80 border-l border-white/10 p-4 flex flex-col">
          <h2 className="text-sm font-medium mb-4 text-white/70">Gizmo Controller</h2>

          <div className="flex flex-col items-center mb-6">
            <HoverBorderGradient animateGradient={true} className="p-4">
              <GizmoController
                mode={mode}
                viewMode={viewMode}
                onModeChange={setMode}
                settings={settings}
                onPositionChange={setPosition}
                onRotationChange={setRotation}
              />
            </HoverBorderGradient>
            <div className="mt-2 text-sm text-white/70">
              Mode: <span className="font-medium">{mode === "transform" ? "Transform" : "Rotate"}</span>
            </div>
          </div>

          <div className="bg-black/40 rounded-lg p-4">
            <h3 className="text-sm font-medium mb-4 text-white/70">Gizmo Settings</h3>
            <CompactSettings settings={settings} updateSettings={updateSettings} onReset={resetObject} />
          </div>
        </div>
      </div>
    </div>
  )
}
