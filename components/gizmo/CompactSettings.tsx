"use client"

import type React from "react"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import type { GizmoSettings } from "./GizmoController"

interface CompactSettingsProps {
  settings: GizmoSettings
  updateSettings: (settings: Partial<GizmoSettings>) => void
  onReset?: () => void
}

export const CompactSettings: React.FC<CompactSettingsProps> = ({ settings, updateSettings, onReset }) => {
  return (
    <div className="space-y-4">
      {onReset && (
        <button
          onClick={onReset}
          className="w-full py-2 px-4 bg-white/10 hover:bg-white/20 rounded-md text-white text-sm font-medium transition-colors"
        >
          Reset Object Position & Rotation
        </button>
      )}

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="handle-size" className="text-sm text-white/70">
            Handle Size: {settings.handleSize}px
          </Label>
          <Slider
            id="handle-size"
            min={6}
            max={20}
            step={1}
            value={[settings.handleSize]}
            onValueChange={(value) => updateSettings({ handleSize: value[0] })}
            className="w-full max-w-[180px]"
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="line-size" className="text-sm text-white/70">
            Line Size: {settings.lineSize}px
          </Label>
          <Slider
            id="line-size"
            min={1}
            max={5}
            step={0.5}
            value={[settings.lineSize]}
            onValueChange={(value) => updateSettings({ lineSize: value[0] })}
            className="w-full max-w-[180px]"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="flex items-center justify-between space-x-2">
          <Label htmlFor="allow-drag-beyond" className="text-sm text-white/70">
            Allow Beyond Bounds
          </Label>
          <Switch
            id="allow-drag-beyond"
            checked={settings.allowDragBeyondBounds}
            onCheckedChange={(checked) => updateSettings({ allowDragBeyondBounds: checked })}
          />
        </div>

        <div className="flex items-center justify-between space-x-2">
          <Label htmlFor="lock-axis" className="text-sm text-white/70">
            Lock Axis
          </Label>
          <Switch
            id="lock-axis"
            checked={settings.lockAxis}
            onCheckedChange={(checked) => updateSettings({ lockAxis: checked })}
          />
        </div>

        <div className="flex items-center justify-between space-x-2">
          <Label htmlFor="use-colors" className="text-sm text-white/70">
            Use Colors
          </Label>
          <Switch
            id="use-colors"
            checked={settings.useColors}
            onCheckedChange={(checked) => updateSettings({ useColors: checked })}
          />
        </div>

        <div className="flex items-center justify-between space-x-2">
          <Label htmlFor="show-labels" className="text-sm text-white/70">
            Show Labels
          </Label>
          <Switch
            id="show-labels"
            checked={settings.showLabels}
            onCheckedChange={(checked) => updateSettings({ showLabels: checked })}
          />
        </div>
      </div>
    </div>
  )
}
