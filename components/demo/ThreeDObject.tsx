"use client"

import type React from "react"
import { Canvas } from "@react-three/fiber"
import { Box, Sphere, Cone, OrbitControls, PerspectiveCamera } from "@react-three/drei"

interface ThreeDObjectProps {
  position: { x: number; y: number; z: number }
  rotation: { x: number; y: number; z: number }
  type?: "cube" | "pyramid" | "sphere"
  color?: string
  size?: number
  viewMode?: "2d" | "3d"
}

// Convert degrees to radians
const degToRad = (degrees: number) => degrees * (Math.PI / 180)

const ThreeDObject: React.FC<ThreeDObjectProps> = ({
  position,
  rotation,
  type = "cube",
  color = "#ffffff",
  size = 32,
  viewMode = "3d",
}) => {
  // Scale the size for Three.js (which uses different units)
  const scaledSize = size / 60

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* 
  Three.js uses a right-handed coordinate system:
  - Positive X goes right
  - Positive Y goes up
  - Positive Z comes out of the screen (towards the user)
*/}
      <Canvas shadows className="w-full h-full">
        <PerspectiveCamera makeDefault position={[0, 0, 5]} />
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
        <directionalLight position={[-10, -10, -5]} intensity={0.5} />

        {/* Apply position and rotation */}
        <group
          position={[position.x / 30, -position.y / 30, position.z / 30]} // Negative Y to invert, positive Z towards user
          rotation={[
            viewMode === "2d" ? 0 : degToRad(rotation.x),
            viewMode === "2d" ? 0 : degToRad(rotation.y),
            degToRad(rotation.z),
          ]}
        >
          {type === "cube" && (
            <Box args={[scaledSize, scaledSize, scaledSize]} castShadow receiveShadow>
              <meshStandardMaterial color={color} opacity={0.7} transparent />
            </Box>
          )}

          {type === "pyramid" && (
            <Cone args={[scaledSize * 0.7, scaledSize * 1.2, 4]} castShadow receiveShadow rotation={[0, 0, 0]}>
              <meshStandardMaterial color={color} opacity={0.7} transparent />
            </Cone>
          )}

          {type === "sphere" && (
            <Sphere args={[scaledSize * 0.6, 32, 32]} castShadow receiveShadow>
              <meshStandardMaterial color={color} opacity={0.7} transparent />
            </Sphere>
          )}

          {/* Add axis indicators to help visualize rotation */}
          <group scale={[scaledSize * 0.8, scaledSize * 0.8, scaledSize * 0.8]}>
            {/* X axis (red) */}
            <mesh position={[0.6, 0, 0]}>
              <boxGeometry args={[1.2, 0.05, 0.05]} />
              <meshBasicMaterial color="#FF4136" opacity={0.7} transparent />
            </mesh>

            {/* Y axis (green) */}
            <mesh position={[0, 0.6, 0]}>
              <boxGeometry args={[0.05, 1.2, 0.05]} />
              <meshBasicMaterial color="#2ECC40" opacity={0.7} transparent />
            </mesh>

            {/* Z axis (blue) */}
            <mesh position={[0, 0, 0.6]}>
              <boxGeometry args={[0.05, 0.05, 1.2]} />
              <meshBasicMaterial color="#0074D9" opacity={0.7} transparent />
            </mesh>
          </group>
        </group>

        {/* Add orbit controls for interactive viewing */}
        {viewMode === "3d" && <OrbitControls enableZoom={false} enablePan={false} />}
      </Canvas>
    </div>
  )
}

export default ThreeDObject
