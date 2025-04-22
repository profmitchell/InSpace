"use client"
import { InSpace } from "../InSpace"
import { useState } from "react"

export default function Page() {
  const [mode, setMode] = useState<"transform" | "rotate">("transform")

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-900">
      <InSpace
        mode={mode}
        onToggleMode={() => setMode(mode === "transform" ? "rotate" : "transform")}
        initialSettings={{
          size: 260,
          lineSize: 2.5,
          handleSize: 12,
        }}
      />
    </main>
  )
}
