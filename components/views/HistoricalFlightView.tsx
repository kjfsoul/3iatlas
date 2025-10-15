"use client";

import { OrbitControls, Stars } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import React, { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useAdaptiveQuality } from "../../hooks/useAdaptiveQuality";
import trajectoryData from "../../public/trajectory.json";
import { ThreeJSErrorBoundary } from "../ThreeJSErrorBoundary";
import CelestialLabel from "../ui/CelestialLabel";
import TelemetryHUD from "../ui/TelemetryHUD";

// --- Reusable 3D Sub-components (Defined ONLY ONCE) ---

// A scaling factor to make planetary orbits visible and distinct.
const ORBIT_SCALE = 50;

interface VectorData {
  date: string;
  position: { x: number; y: number; z: number };
  velocity: { vx: number; vy: number; vz: number };
}

const TrajectoryTrail = ({
  trajectory,
  currentIndex,
  quality,
}: {
  trajectory: VectorData[];
  currentIndex: number;
  quality: { geometryDetail: number };
}) => {
  const points = useMemo(() => {
    if (!trajectory || trajectory.length === 0) return [];

    // Create trail showing path up to current position
    const trailLength = Math.min(currentIndex + 1, trajectory.length);
    return trajectory
      .slice(0, trailLength)
      .map(
        (frame) =>
          new THREE.Vector3(
            frame.position.x,
            frame.position.z,
            -frame.position.y
          )
      );
  }, [trajectory, currentIndex]);

  if (points.length < 2) return null;

  return (
    <line>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={points.length}
          array={new Float32Array(points.flatMap((p) => [p.x, p.y, p.z]))}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial
        color="#00ff88"
        linewidth={2}
        transparent
        opacity={0.8}
      />
    </line>
  );
};

const FollowCamera = ({
  targetRef,
}: {
  targetRef: React.RefObject<THREE.Group>;
}) => {
  const { camera } = useThree();
  useFrame(() => {
    if (targetRef.current) {
      const targetPosition = targetRef.current.position;
      const offset = new THREE.Vector3(5, 3, 5);
      const cameraPosition = targetPosition.clone().add(offset);
      camera.position.lerp(cameraPosition, 0.05);
      camera.lookAt(targetPosition);
    }
  });
  return null;
};

const Sun = () => (
  <group>
    <mesh position={[0, 0, 0]}>
      <sphereGeometry args={[1.0, 64, 64]} />
      <meshStandardMaterial
        color="#ffff00"
        emissive="#ffff00"
        emissiveIntensity={5}
      />
    </mesh>
    <CelestialLabel
      position={[0, 0, 0]}
      label="Sun"
      color="#ffff00"
      fontSize={0.6}
      offset={[0, 1.5, 0]}
    />
  </group>
);

const Planet = ({
  trajectory,
  currentIndex,
  color,
  size,
  label,
}: {
  trajectory: VectorData[];
  currentIndex: number;
  color: string;
  size: number;
  label?: string;
}) => {
  const position = useMemo(() => {
    const frame = trajectory[Math.floor(currentIndex)];
    // FIX: Apply the scaling factor to make orbits visible.
    return frame
      ? [
          frame.position.x * ORBIT_SCALE,
          frame.position.z * ORBIT_SCALE,
          -frame.position.y * ORBIT_SCALE,
        ]
      : [0, 0, 0];
  }, [trajectory, currentIndex]);
  return (
    <group position={position as [number, number, number]}>
      <mesh>
        {/* FIX: Scale the planet mesh itself so it remains a visible size at the new orbit scale. */}
        <sphereGeometry args={[size * ORBIT_SCALE, 32, 32]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {label && (
        <CelestialLabel
          position={[0, 0, 0]}
          label={label}
          color={color}
          fontSize={0.4}
          offset={[0, 0.8, 0]}
        />
      )}
    </group>
  );
};

const Comet = ({
  trajectory,
  currentIndex,
  targetRef,
}: {
  trajectory: VectorData[];
  currentIndex: number;
  targetRef: React.RefObject<THREE.Group>;
}) => {
  useFrame(() => {
    if (targetRef.current) {
      const frame = trajectory[Math.floor(currentIndex)];
      if (frame) {
        // FIX: Apply the same scaling factor to the comet's position.
        targetRef.current.position.set(
          frame.position.x * ORBIT_SCALE,
          frame.position.z * ORBIT_SCALE,
          -frame.position.y * ORBIT_SCALE
        );
        // FIX: Point the entire comet group (including tail) away from the sun (origin).
        targetRef.current.lookAt(new THREE.Vector3(0, 0, 0));
      }
    }
  });
  return (
    <group ref={targetRef}>
      <mesh>
        {/* FIX: Make the nucleus larger to be visible. */}
        <sphereGeometry args={[0.5, 32, 32]} />
        {/* FIX: Change color from red to the correct project-specified green. */}
        <meshStandardMaterial
          color="#00ff88"
          emissive="#00ff88"
          emissiveIntensity={2}
        />
      </mesh>
      {/* FIX: This is the tail. Rotate it to point along the Z axis, as the group's lookAt handles world orientation. */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 2]}>
        <coneGeometry args={[0.4, 4.0, 16]} />
        <meshBasicMaterial
          color="#00ffaa"
          transparent
          opacity={0.8}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      <CelestialLabel
        position={[0, 0, 0]}
        label="3I/ATLAS"
        color="#00ff88"
        fontSize={0.5}
        offset={[0, 1.2, 0]}
      />
    </group>
  );
};

// --- Main 3D Scene ---
const Scene = ({
  currentIndex,
  atlasData,
  quality,
  onMetricsUpdate,
}: {
  currentIndex: number;
  atlasData: VectorData[];
  quality: {
    starCount: number;
    geometryDetail: number;
    shadowMapSize: number;
    pixelRatio: number;
  };
  onMetricsUpdate: (metrics: {
    fps: number;
    memoryUsage: number;
    renderTime: number;
    frameDrops: number;
  }) => void;
}) => {
  const cometRef = useRef<THREE.Group>(null);

  // Cleanup function for memory leak prevention
  useEffect(() => {
    return () => {
      // Clean up Three.js objects when component unmounts
      if (cometRef.current) {
        cometRef.current.clear();
      }
    };
  }, []);

  return (
    <>
      <color attach="background" args={["#000005"]} />
      <ambientLight intensity={0.2} />
      <pointLight
        position={[0, 0, 0]}
        intensity={25}
        color="#ffffff"
        decay={2}
      />
      <Stars
        radius={150}
        depth={50}
        count={Math.floor(quality.starCount)}
        factor={4}
        saturation={0}
        fade
        speed={1}
      />
      <Sun />
      <Planet
        trajectory={trajectoryData.earth}
        currentIndex={currentIndex}
        color="skyblue"
        size={0.06}
        label="Earth"
      />
      <Planet
        trajectory={trajectoryData.mars}
        currentIndex={currentIndex}
        color="#ff6666"
        size={0.04}
        label="Mars"
      />
      <Comet
        trajectory={atlasData}
        currentIndex={currentIndex}
        targetRef={cometRef}
      />
      <TrajectoryTrail
        trajectory={atlasData}
        currentIndex={currentIndex}
        quality={quality}
      />
      {/* Visual reference grid */}
      <gridHelper args={[20, 20, "#444444", "#222222"]} />
      <FollowCamera targetRef={cometRef} />
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        maxDistance={50}
        minDistance={5}
        enableDamping={true}
        dampingFactor={0.05}
      />
    </>
  );
};

// --- Loading Fallback Component ---
const LoadingFallback = () => (
  <div className="w-full h-full bg-black flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mx-auto mb-4"></div>
      <p className="text-white text-lg">Loading 3D Visualization...</p>
      <p className="text-gray-400 text-sm mt-2">
        Initializing NASA trajectory data
      </p>
    </div>
  </div>
);

// --- Error Fallback Component ---
const ErrorFallback = ({
  error,
  resetError,
}: {
  error: Error;
  resetError: () => void;
}) => (
  <div className="w-full h-full bg-gray-900 text-white flex items-center justify-center p-4">
    <div className="max-w-lg w-full bg-gray-800 rounded-lg p-6 border border-red-500">
      <div className="flex items-center mb-4">
        <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center mr-4">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        <div>
          <h1 className="text-xl font-bold text-red-400">
            3D Visualization Error
          </h1>
          <p className="text-gray-300">Failed to render 3I/ATLAS trajectory</p>
        </div>
      </div>

      <div className="mb-4">
        <div className="bg-gray-900 rounded p-3 text-sm">
          <div className="text-red-400 mb-1">
            <strong>Error:</strong> {error.message}
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={resetError}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          Retry 3D View
        </button>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
        >
          Reload Page
        </button>
      </div>
    </div>
  </div>
);

// --- The Main HistoricalFlightView Component ---
interface HistoricalFlightViewProps {
  atlasData: VectorData[];
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
    atlasData,
    isPlaying,
    speed,
    currentIndex,
    onPlayPause,
    onReset,
    onIndexChange,
    onSpeedChange,
  } = props;
  const data = atlasData || [];
  console.log("HistoricalFlightView data:", data.length, "points");

  // Adaptive quality management
  const { quality, metrics, handleMetricsUpdate } = useAdaptiveQuality();

  // State variables for real-time metrics
  const [distanceFromSun, setDistanceFromSun] = useState<number>(0);
  const [currentVelocity, setCurrentVelocity] = useState<number>(0);
  const [currentDate, setCurrentDate] = useState<string>("");

  // Constants for unit conversion
  const AU_TO_KM = 149597870.7; // km per AU
  const DAY_TO_SECONDS = 86400; // seconds per day

  // Calculate real-time metrics whenever currentIndex changes
  useEffect(() => {
    if (!data || data.length === 0) return;

    const currentFrame = data[Math.floor(currentIndex)];
    if (!currentFrame) return;

    // Calculate distance from Sun (origin [0,0,0]) in AU
    const { position } = currentFrame;
    const distance = Math.sqrt(
      position.x * position.x +
        position.y * position.y +
        position.z * position.z
    );
    setDistanceFromSun(distance);

    // Calculate velocity in km/s from AU/day
    const { velocity } = currentFrame;
    const velocityMagnitude = Math.sqrt(
      velocity.vx * velocity.vx +
        velocity.vy * velocity.vy +
        velocity.vz * velocity.vz
    );
    // Convert AU/day to km/s: (AU/day) * (km/AU) / (s/day)
    const velocityKmPerSec = (velocityMagnitude * AU_TO_KM) / DAY_TO_SECONDS;
    setCurrentVelocity(velocityKmPerSec);

    // Extract current date
    setCurrentDate(currentFrame.date || "");
  }, [currentIndex, data]);

  if (!data || data.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-black">
        <p className="text-white">
          Trajectory data not found. Please run 'npm run generate-data'.
        </p>
      </div>
    );
  }

  return (
    <div className={`w-full h-full flex flex-col bg-black relative`}>
      <TelemetryHUD
        distanceFromSun={distanceFromSun}
        currentVelocity={currentVelocity}
        currentDate={currentDate}
      />
      <div className="w-full flex-grow rounded-lg overflow-hidden">
        <ThreeJSErrorBoundary
          fallback={
            <ErrorFallback
              error={new Error("3D rendering failed")}
              resetError={() => window.location.reload()}
            />
          }
        >
          <Suspense fallback={<LoadingFallback />}>
            <Canvas
              camera={{ position: [7, 4, 7], fov: 75 }}
              frameloop="always"
              dpr={quality.pixelRatio}
              performance={{ min: 0.5 }}
            >
              <Scene
                currentIndex={currentIndex}
                atlasData={data}
                quality={quality}
                onMetricsUpdate={handleMetricsUpdate}
              />
            </Canvas>
          </Suspense>
        </ThreeJSErrorBoundary>
      </div>

      <div className="flex-shrink-0 p-2 bg-black/60 backdrop-blur-sm border-t border-white/10">
        <div className="px-4 pt-2 space-y-2">
          <div className="flex items-center justify-between text-white/70 text-xs">
            <span>{data[0]?.date.split("T")[0]}</span>
            <span className="font-bold text-white">
              {currentDate.split("T")[0]}
            </span>
            <span>{data[data.length - 1]?.date.split("T")[0]}</span>
          </div>
          <input
            type="range"
            min="0"
            max={data.length > 0 ? data.length - 1 : 0}
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
