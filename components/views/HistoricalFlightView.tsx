"use client";

import { OrbitControls, Ring, Stars } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import React, { useMemo, useRef } from "react";
import * as THREE from "three";
import trajectoryData from "../../public/trajectory.json";

// --- Reusable 3D Sub-components (Defined ONLY ONCE) ---

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
  <mesh>
    <sphereGeometry args={[0.3, 64, 64]} />
    <meshStandardMaterial
      color="#ffff00"
      emissive="#ffff00"
      emissiveIntensity={3}
    />
  </mesh>
);

const Planet = ({
  trajectory,
  currentIndex,
  color,
  size,
}: {
  trajectory: any[];
  currentIndex: number;
  color: string;
  size: number;
}) => {
  const position = useMemo(() => {
    const frame = trajectory[Math.floor(currentIndex)];
    return frame
      ? [frame.position.x, frame.position.z, -frame.position.y]
      : [0, 0, 0];
  }, [trajectory, currentIndex]);
  return (
    <mesh position={position as [number, number, number]}>
      <sphereGeometry args={[size, 32, 32]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
};

const Comet = ({
  trajectory,
  currentIndex,
  targetRef,
}: {
  trajectory: any[];
  currentIndex: number;
  targetRef: React.RefObject<THREE.Group>;
}) => {
  const position = useMemo(() => {
    const frame = trajectory[Math.floor(currentIndex)];
    return frame
      ? [frame.position.x, frame.position.z, -frame.position.y]
      : [10, 5, 0];
  }, [trajectory, currentIndex]);
  return (
    <group ref={targetRef} position={position as [number, number, number]}>
      <mesh>
        <sphereGeometry args={[0.05, 32, 32]} />
        <meshStandardMaterial
          color="#00ff88"
          emissive="#00ff88"
          emissiveIntensity={3}
          toneMapped={false}
        />
      </mesh>
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
  );
};

// --- Main 3D Scene ---
const Scene = ({ currentIndex }: { currentIndex: number }) => {
  const cometRef = useRef<THREE.Group>(null!);
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
        count={10000}
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
      />
      <Planet
        trajectory={trajectoryData.mars}
        currentIndex={currentIndex}
        color="#ff6666"
        size={0.04}
      />
      <Comet
        trajectory={trajectoryData.atlas}
        currentIndex={currentIndex}
        targetRef={cometRef}
      />
      <FollowCamera targetRef={cometRef} />
    </>
  );
};

// --- The Main HistoricalFlightView Component ---
interface HistoricalFlightViewProps {
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
    isPlaying,
    speed,
    currentIndex,
    onPlayPause,
    onReset,
    onIndexChange,
    onSpeedChange,
  } = props;
  const data = trajectoryData.atlas;

  if (!data || data.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-black">
        <p className="text-white">
          Trajectory data not found. Please run 'npm run generate-data'.
        </p>
      </div>
    );
  }

  const currentDate = data[Math.floor(currentIndex)]?.date || "...";

  return (
    <div className={`w-full h-full flex flex-col bg-black`}>
      <div className="w-full flex-grow rounded-lg overflow-hidden">
        <Canvas camera={{ position: [7, 4, 7], fov: 75 }} frameloop="always">
          <Scene currentIndex={currentIndex} />
        </Canvas>
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
