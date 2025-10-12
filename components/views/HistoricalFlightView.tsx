"use client";

/**
 * Historical Flight View - Final "Golden" Version
 * This version is a "dumb" presentation component that receives all data via props.
 * It includes a visually enhanced comet, sun, planetary orbits, and a starfield.
 */

import { OrbitControls, Ring, Stars } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import React, { useMemo, useRef } from "react";
import * as THREE from "three";

// --- Reusable 3D Sub-components ---

const EnhancedSun = () => (
  <group>
    <mesh>
      <sphereGeometry args={[0.3, 64, 64]} />
      <meshStandardMaterial
        color="#ffff00"
        emissive="#ffff00"
        emissiveIntensity={3}
      />
    </mesh>
    <mesh scale={[1.5, 1.5, 1.5]}>
      <sphereGeometry args={[0.3, 64, 64]} />
      <meshStandardMaterial
        color="#ffff00"
        emissive="#ffff00"
        emissiveIntensity={1}
        transparent
        opacity={0.3}
      />
    </mesh>
  </group>
);

const EnhancedComet = ({
  position,
}: {
  position: [number, number, number];
}) => {
  const cometRef = useRef<THREE.Group>(null!);

  useFrame(() => {
    // Make the tail always point away from the sun
    if (cometRef.current) {
      cometRef.current.lookAt(new THREE.Vector3(0, 0, 0));
    }
  });

  return (
    <group position={position}>
      {/* Coma (Glowing head) */}
      <mesh>
        <sphereGeometry args={[0.05, 32, 32]} />
        <meshStandardMaterial
          color="#00ff88"
          emissive="#00ff88"
          emissiveIntensity={3}
          toneMapped={false}
        />
      </mesh>
      {/* Tail */}
      <group ref={cometRef}>
        <mesh position={[0, 0, 0.75]}>
          <coneGeometry args={[0.02, 1.5, 16]} />
          <meshBasicMaterial
            color="#00ff88"
            transparent
            opacity={0.5}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      </group>
    </group>
  );
};

const OrbitalPath = ({ historicalData }: { historicalData: any[] }) => {
  const points = useMemo(
    () =>
      historicalData.map(
        (d) => new THREE.Vector3(d.position.x, d.position.z, -d.position.y)
      ),
    [historicalData]
  );
  if (points.length < 2) return null;
  return (
    <line>
      <bufferGeometry
        attach="geometry"
        onUpdate={(self) => self.setFromPoints(points)}
      />
      <lineBasicMaterial
        attach="material"
        color="#ffffff"
        transparent
        opacity={0.3}
      />
    </line>
  );
};

// --- Main 3D Scene ---

const Scene = ({
  currentIndex,
  historicalData,
}: {
  currentIndex: number;
  historicalData: any[];
}) => {
  const cometPosition: [number, number, number] = useMemo(() => {
    if (historicalData.length === 0) return [10, 0, 0];
    const frameIndex = Math.floor(currentIndex);
    const boundedIndex = Math.min(frameIndex, historicalData.length - 1);
    const currentVec = historicalData[boundedIndex];
    if (currentVec?.position) {
      return [
        currentVec.position.x,
        currentVec.position.z,
        -currentVec.position.y,
      ];
    }
    return [10, 0, 0];
  }, [currentIndex, historicalData]);

  return (
    <>
      <color attach="background" args={["#000005"]} />
      <ambientLight intensity={0.1} />
      <pointLight
        position={[0, 0, 0]}
        intensity={25}
        color="#ffffff"
        decay={2}
      />

      <Stars
        radius={150}
        depth={50}
        count={10000}
        factor={4}
        saturation={0}
        fade
        speed={1}
      />

      <EnhancedSun />
      <EnhancedComet position={cometPosition} />
      <OrbitalPath historicalData={historicalData} />

      {/* Planetary Orbits for context */}
      <Ring args={[1.0, 1.0, 128, 1, 0, Math.PI * 2]} rotation-x={Math.PI / 2}>
        <meshBasicMaterial
          color="skyblue"
          side={THREE.DoubleSide}
          transparent
          opacity={0.3}
          wireframe
        />
      </Ring>
      <Ring
        args={[1.52, 1.52, 128, 1, 0, Math.PI * 2]}
        rotation-x={Math.PI / 2}
      >
        <meshBasicMaterial
          color="#ff6666"
          side={THREE.DoubleSide}
          transparent
          opacity={0.3}
          wireframe
        />
      </Ring>

      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        autoRotate
        autoRotateSpeed={0.1}
      />
    </>
  );
};

// --- The Final HistoricalFlightView Component ---
interface HistoricalFlightViewProps {
  historicalData: any[];
  className?: string;
  isPlaying: boolean;
  speed: number;
  currentIndex: number;
  onPlayPause: () => void;
  onReset: () => void;
  onIndexChange: (index: number) => void;
  onSpeedChange: (speed: number) => void;
}

const HistoricalFlightView: React.FC<HistoricalFlightViewProps> = (props) => {
  const {
    historicalData,
    className = "",
    isPlaying,
    speed,
    currentIndex,
    onPlayPause,
    onReset,
    onIndexChange,
    onSpeedChange,
  } = props;

  const currentDate = historicalData[Math.floor(currentIndex)]?.date || "...";

  return (
    <div className={`w-full h-full flex flex-col bg-black ${className}`}>
      <div className="w-full flex-grow rounded-lg overflow-hidden">
        <Canvas camera={{ position: [7, 4, 7], fov: 75 }} frameloop="always">
          <Scene currentIndex={currentIndex} historicalData={historicalData} />
        </Canvas>
      </div>

      <div className="flex-shrink-0 p-2 bg-black/60 backdrop-blur-sm border-t border-white/10">
        <div className="px-4 pt-2 space-y-2">
          <div className="flex items-center justify-between text-white/70 text-xs">
            <span>{historicalData[0]?.date.split("T")[0]}</span>
            <span className="font-bold text-white">
              {currentDate.split("T")[0]}
            </span>
            <span>
              {historicalData.length > 0 &&
                historicalData[historicalData.length - 1]?.date.split("T")[0]}
            </span>
          </div>
          <input
            type="range"
            min="0"
            max={historicalData.length > 0 ? historicalData.length - 1 : 0}
            value={currentIndex}
            onChange={(e) => onIndexChange(Number(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
        </div>
        <div className="flex items-center justify-center gap-4 flex-wrap p-3">
          <button
            onClick={onPlayPause}
            className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold w-24"
          >
            {isPlaying ? "Pause" : "Play"}
          </button>
          <button
            onClick={onReset}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg font-semibold w-24"
          >
            Reset
          </button>
          <div className="flex items-center gap-2 text-white/70 text-sm w-48">
            <span>Speed</span>
            <input
              type="range"
              min="1"
              max="25"
              step="1"
              value={speed}
              onChange={(e) => onSpeedChange(Number(e.target.value))}
              className="w-full"
            />
            <span className="w-8 text-right">{speed}x</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistoricalFlightView;
