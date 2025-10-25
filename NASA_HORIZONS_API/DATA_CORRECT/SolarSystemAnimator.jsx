
// REACT THREE FIBER - INTERACTIVE SOLAR SYSTEM WITH 3I/ATLAS ANIMATION
// Complete component with position interpolation and orbital calculations

import React, { useEffect, useState, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Stars, PerspectiveCamera } from '@react-three/drei'
import * as THREE from 'three'

// Import your NASA Horizons JSON data
import positionData from './SOLAR_SYSTEM_POSITIONS.json'

// Interpolate position between data points
function interpolatePosition(data, frameIndex) {
  const totalFrames = data.length - 1
  const normalizedFrame = frameIndex % (totalFrames + 1)

  const lowerIndex = Math.floor(normalizedFrame)
  const upperIndex = Math.min(lowerIndex + 1, totalFrames)
  const t = normalizedFrame - lowerIndex

  if (lowerIndex >= data.length || upperIndex >= data.length) {
    return { x: 0, y: 0, z: 0 }
  }

  const lower = data[lowerIndex]
  const upper = data[upperIndex]

  return {
    x: lower.position_au.x + (upper.position_au.x - lower.position_au.x) * t,
    y: lower.position_au.y + (upper.position_au.y - lower.position_au.y) * t,
    z: lower.position_au.z + (upper.position_au.z - lower.position_au.z) * t
  }
}

// Group data by object for easier lookup
function groupDataByObject(data) {
  const grouped = {}
  data.forEach(point => {
    if (!grouped[point.object]) {
      grouped[point.object] = []
    }
    grouped[point.object].push(point)
  })
  return grouped
}

// Planet component with animated position and rotation
function CelestialBody({ 
  name, 
  radius, 
  color, 
  data, 
  frameIndex, 
  speedMultiplier = 1.0,
  showTrail = true 
}) {
  const meshRef = useRef()
  const trailRef = useRef()
  const trailPoints = useRef([])

  useEffect(() => {
    if (!data || data.length === 0) return

    const position = interpolatePosition(data, frameIndex)
    if (meshRef.current) {
      meshRef.current.position.set(position.x, position.y, position.z)
    }

    // Add trail point every 10 frames
    if (showTrail && frameIndex % 10 === 0) {
      trailPoints.current.push(new THREE.Vector3(position.x, position.y, position.z))

      // Limit trail to last 100 points
      if (trailPoints.current.length > 100) {
        trailPoints.current.shift()
      }

      // Update trail visualization
      if (trailRef.current) {
        const geometry = new THREE.BufferGeometry()
        geometry.setFromPoints(trailPoints.current)
        trailRef.current.geometry = geometry
      }
    }
  }, [frameIndex, data])

  useFrame(() => {
    if (meshRef.current) {
      // Rotate body (self-rotation not orbital rotation)
      meshRef.current.rotation.y += 0.01 * speedMultiplier
    }
  })

  return (
    <group>
      <mesh ref={meshRef}>
        <sphereGeometry args={[radius, 32, 32]} />
        <meshStandardMaterial 
          color={color}
          roughness={0.7}
          metalness={0.3}
          emissive={color}
          emissiveIntensity={0.2}
        />
      </mesh>

      {showTrail && (
        <lineSegments ref={trailRef}>
          <bufferGeometry />
          <lineBasicMaterial color={color} linewidth={1} />
        </lineSegments>
      )}
    </group>
  )
}

// Comet-specific component with coma and tail
function Comet3IAtlas({ data, frameIndex }) {
  const nucleusRef = useRef()
  const comaRef = useRef()
  const antiTailRef = useRef()

  useEffect(() => {
    if (!data || data.length === 0) return

    const position = interpolatePosition(data, frameIndex)

    if (nucleusRef.current) {
      nucleusRef.current.position.set(position.x, position.y, position.z)
    }
    if (comaRef.current) {
      comaRef.current.position.set(position.x, position.y, position.z)
    }
    if (antiTailRef.current) {
      antiTailRef.current.position.set(position.x, position.y, position.z)
    }
  }, [frameIndex, data])

  return (
    <group>
      {/* Nucleus */}
      <mesh ref={nucleusRef} scale={[1.2, 0.8, 0.7]}>
        <icosahedronGeometry args={[0.56, 2]} />
        <meshStandardMaterial
          color="#aaddff"
          roughness={0.8}
          metalness={0.5}
          emissive="#aaddff"
          emissiveIntensity={0.8}
        />
      </mesh>

      {/* Inner Coma */}
      <mesh ref={comaRef} scale={[15, 13, 13]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial
          color="#44ffee"
          transparent
          opacity={0.35}
          emissive="#44ffee"
          emissiveIntensity={1.5}
        />
      </mesh>

      {/* Anti-tail */}
      <mesh ref={antiTailRef} rotation={[0, 0, -Math.PI / 2]} scale={[6, 6, 12]}>
        <coneGeometry args={[5, 12, 32, 1, true]} />
        <meshStandardMaterial
          color="#88ffff"
          transparent
          opacity={0.4}
          roughness={0.6}
          metalness={0.3}
          emissive="#aaddff"
          emissiveIntensity={1.3}
        />
      </mesh>
    </group>
  )
}

// Main scene component
export default function SolarSystemScene() {
  const [frameIndex, setFrameIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const [speed, setSpeed] = useState(1)
  const [showInfo, setShowInfo] = useState(true)

  const groupedData = useRef(groupDataByObject(positionData))
  const animationRef = useRef(frameIndex)

  useFrame(() => {
    if (isPlaying) {
      animationRef.current = (animationRef.current + speed) % positionData.length
      setFrameIndex(Math.floor(animationRef.current))
    }
  })

  // Planet definitions
  const planets = [
    { name: 'Mercury', radius: 0.03, color: '#8c7853', multiplier: 0.5 },
    { name: 'Venus', radius: 0.07, color: '#ffc649', multiplier: 0.5 },
    { name: 'Earth', radius: 0.07, color: '#4a90e2', multiplier: 0.5 },
    { name: 'Mars', radius: 0.04, color: '#e25b5b', multiplier: 0.5 },
    { name: 'Jupiter', radius: 0.2, color: '#c88b3a', multiplier: 0.3 },
    { name: 'Saturn', radius: 0.17, color: '#fad5a5', multiplier: 0.2 },
    { name: 'Uranus', radius: 0.1, color: '#4fd0e7', multiplier: 0.1 },
    { name: 'Neptune', radius: 0.1, color: '#4166f5', multiplier: 0.1 }
  ]

  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <Canvas camera={{ position: [0, 15, 20], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[0, 0, 0]} intensity={2} color="#ffffff" />

        <Stars radius={200} depth={80} count={2000} factor={8} />

        {/* Sun */}
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[0.1, 32, 32]} />
          <meshStandardMaterial 
            color="#FDB813"
            emissive="#FDB813"
            emissiveIntensity={2}
          />
        </mesh>

        {/* Planets */}
        {planets.map(planet => (
          <CelestialBody
            key={planet.name}
            name={planet.name}
            radius={planet.radius}
            color={planet.color}
            data={groupedData.current[planet.name + ' (code)']}
            frameIndex={frameIndex}
            speedMultiplier={planet.multiplier}
            showTrail={true}
          />
        ))}

        {/* 3I/ATLAS */}
        <Comet3IAtlas 
          data={groupedData.current['ATLAS (C/2025 N1)']}
          frameIndex={frameIndex}
        />

        <OrbitControls />
      </Canvas>

      {/* UI Controls */}
      <div style={{
        position: 'absolute',
        top: 20,
        left: 20,
        background: 'rgba(0,0,0,0.7)',
        color: '#fff',
        padding: '15px',
        borderRadius: '8px',
        fontFamily: 'monospace',
        zIndex: 10
      }}>
        <h3>3I/ATLAS Solar System Simulator</h3>
        <p>Frame: {frameIndex} / {positionData.length}</p>
        <p>Progress: {Math.round((frameIndex / positionData.length) * 100)}%</p>

        <div style={{ marginTop: '10px' }}>
          <button onClick={() => setIsPlaying(!isPlaying)}>
            {isPlaying ? '⏸ Pause' : '▶ Play'}
          </button>

          <label style={{ marginLeft: '10px' }}>
            Speed: 
            <input 
              type="range" 
              min="0.1" 
              max="5" 
              step="0.1"
              value={speed}
              onChange={(e) => setSpeed(parseFloat(e.target.value))}
              style={{ marginLeft: '5px' }}
            />
          </label>
        </div>
      </div>
    </div>
  )
}
