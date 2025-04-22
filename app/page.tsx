"use client"
import { InSpace } from "../InSpace"

export default function Page() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-900">
      <InSpace
        mode="transform"
        initialSettings={{
          size: 220,
          lineSize: 2.5,
          handleSize: 12,
          showBothModes: false,
        }}
      />
    </main>
  )
}
