'use client';

/**
 * Historical Flight View - 3I/ATLAS Journey from Discovery to Current
 * This is a corrected and refactored component to be a "dumb" view controlled by parent state.
 * It fixes animation, state, layout, and control issues.
 */

import { getHistoricalAtlasData } from '@/lib/historical-data-generator';
import { SOLAR_SYSTEM_OBJECTS } from '@/lib/solar-system-data';
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// Props interface defining the component's state from the parent
interface HistoricalFlightViewProps {
  className?: string;
  isPlaying: boolean;
  speed: number;
  currentIndex: number;
  onPlayPause: () => void;
  onReset: () => void;
  onIndexChange: (index: number) => void;
  onSpeedChange: (speed: number) => void;
}

const HistoricalFlightView: React.FC<HistoricalFlightViewProps> = ({
  className = '',
  isPlaying,
  speed,
  currentIndex,
  onPlayPause,
  onReset,
  onIndexChange,
  onSpeedChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<any>(null); // Simplified for clarity
  const animationIdRef = useRef<number | undefined>(undefined);

  // Internal state for this view only
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [solarSystemData, setSolarSystemData] = useState<Record<string, any[]>>({});
  
  // UI-only state for visual controls
  const [showLabels, setShowLabels] = useState(true);
  const [showTail, setShowTail] = useState(true);
  const [tailLength, setTailLength] = useState(2.5);
  const [cameraDamping, setCameraDamping] = useState(0.05);

  // Data fetching is self-contained and runs only once on mount.
  useEffect(() => {
    try {
      setLoading(true);
      const data = getHistoricalAtlasData();
      if (!data || data.length === 0) {
        throw new Error('Failed to load historical data from cache or generator.');
      }
      // This view only needs the historical path of the comet itself.
      // Other objects can be added here if needed for context.
      setSolarSystemData({ atlas: data, sun: [{ position: { x: 0, y: 0, z: 0 } }] });
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
      setLoading(false);
    }
  }, []);

  // Effect for initializing and managing the Three.js scene
  useEffect(() => {
    if (!containerRef.current || loading || error) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000005);
    const camera = new THREE.PerspectiveCamera(75, containerRef.current.clientWidth / containerRef.current.clientHeight, 0.1, 2000);
    camera.position.set(7, 4, 7);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    containerRef.current.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 2);
    scene.add(ambientLight);
    const sunLight = new THREE.PointLight(0xffffff, 5, 300);
    scene.add(sunLight);

    const objects = new Map<string, THREE.Object3D>();
    const labels = new Map<string, THREE.Sprite>();

    // Sun
    const sunGeo = new THREE.SphereGeometry(0.3, 32, 32);
    const sunMat = new THREE.MeshStandardMaterial({ color: 0xffaa00, emissive: 0xffaa00, emissiveIntensity: 2 });
    const sun = new THREE.Mesh(sunGeo, sunMat);
    sun.name = 'sun';
    scene.add(sun);
    objects.set('sun', sun);

    // Comet material is emissive neon green
    const atlasGeo = new THREE.SphereGeometry(SOLAR_SYSTEM_OBJECTS.atlas.size, 32, 32);
    const atlasMat = new THREE.MeshStandardMaterial({
      color: SOLAR_SYSTEM_OBJECTS.atlas.color,
      emissive: SOLAR_SYSTEM_OBJECTS.atlas.color,
      emissiveIntensity: 3,
      toneMapped: false
    });
    const atlasMesh = new THREE.Mesh(atlasGeo, atlasMat);
    atlasMesh.name = 'atlas';
    scene.add(atlasMesh);
    objects.set('atlas', atlasMesh);

    // Comet Tail is a ConeGeometry attached to the comet
    const tailGeo = new THREE.ConeGeometry(0.1, 1, 16, 1, true);
    const tailMat = new THREE.MeshBasicMaterial({ 
      color: 0x00ffff, 
      transparent: true, 
      opacity: 0.4, 
      blending: THREE.AdditiveBlending 
    });
    const tailCone = new THREE.Mesh(tailGeo, tailMat);
    tailCone.translateY(-0.5); // Position cone base at the comet
    atlasMesh.add(tailCone); // Attach tail to comet

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    sceneRef.current = { scene, camera, renderer, controls, objects, labels, tailCone };

    // Simple render loop using requestAnimationFrame
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
        if (!containerRef.current || !sceneRef.current) return;
        const { camera, renderer } = sceneRef.current;
        camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationIdRef.current!);
      renderer.dispose();
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, [loading, error]);

  // Update logic is in a separate useEffect triggered by currentIndex
  useEffect(() => {
    if (!sceneRef.current || !solarSystemData.atlas) return;

    const { objects, tailCone } = sceneRef.current;
    const atlasMesh = objects.get('atlas');
    const atlasData = solarSystemData.atlas;
    const frameIndex = Math.floor(currentIndex);
    const boundedIndex = Math.min(frameIndex, atlasData.length - 1);
    const currentVec = atlasData[boundedIndex];

    if (currentVec && currentVec.position && atlasMesh) {
      const position = new THREE.Vector3(currentVec.position.x, currentVec.position.z, -currentVec.position.y);
      atlasMesh.position.copy(position);

      // Update tail visibility, length, and orientation
      tailCone.visible = showTail;
      if (showTail) {
        const sunPosition = new THREE.Vector3(0, 0, 0);
        const directionFromSun = position.clone().sub(sunPosition).normalize();
        tailCone.scale.y = tailLength;
        tailCone.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), directionFromSun);
      }
    }
    
    // Update camera controls damping
    sceneRef.current.controls.dampingFactor = cameraDamping;

  }, [currentIndex, solarSystemData, tailLength, showTail, cameraDamping]);

  const atlasData = solarSystemData.atlas || [];
  const currentDate = atlasData[Math.floor(currentIndex)]?.date || '';

  return (
    <div className={`w-full h-full flex flex-col bg-black ${className}`}>
      {/* Canvas grows to fill space */}
      <div ref={containerRef} className="w-full flex-grow rounded-lg overflow-hidden" />

      {/* Controls are in a non-shrinking container at the bottom */}
      {!loading && !error && (
        <div className="flex-shrink-0 p-2 bg-black/60 backdrop-blur-sm border-t border-white/10">
          {/* Timeline Scrubber */}
          <div className="px-4 pt-2 space-y-2">
            <div className="flex items-center justify-between text-white/70 text-xs">
              <span>{atlasData[0]?.date.split('T')[0]}</span>
              <span className='font-bold text-white'>{currentDate.split('T')[0]}</span>
              <span>{atlasData.length > 0 && atlasData[atlasData.length - 1]?.date.split('T')[0]}</span>
            </div>
            <input
              type="range"
              min="0"
              max={atlasData.length > 0 ? atlasData.length - 1 : 0}
              value={currentIndex}
              onChange={(e) => onIndexChange(Number(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>
          {/* Playback Controls */}
          <div className="flex items-center justify-center gap-4 flex-wrap p-3">
            <button onClick={onPlayPause} className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold w-24">
              {isPlaying ? 'Pause' : 'Play'}
            </button>
            <button onClick={onReset} className="px-4 py-2 bg-gray-600 text-white rounded-lg font-semibold w-24">
                Reset
            </button>
            {/* Speed slider with correct range */}
            <div className="flex items-center gap-2 text-white/70 text-sm w-48" title="Controls playback speed.">
              <span>Speed</span>
              <input type="range" min="1" max="25" step="1" value={speed} onChange={(e) => onSpeedChange(Number(e.target.value))} className="w-full" />
              <span className="w-8 text-right">{speed}x</span>
            </div>
            {/* Tail slider */}
            <div className="flex items-center gap-2 text-white/70 text-sm w-48" title="Controls the length of the comet's visual tail.">
              <span>Tail</span>
              <input type="range" min="0.1" max="5" step="0.1" value={tailLength} onChange={(e) => setTailLength(Number(e.target.value))} className="w-full" />
            </div>
            {/* Smooth slider */}
            <div className="flex items-center gap-2 text-white/70 text-sm w-48" title="Controls camera rotation inertia.">
              <span>Smooth</span>
              <input type="range" min="0.01" max="0.25" step="0.01" value={cameraDamping} onChange={(e) => setCameraDamping(Number(e.target.value))} className="w-full" />
            </div>
             {/* Labels button */}
             <button onClick={() => setShowLabels(!showLabels)} className={`px-3 py-2 rounded text-sm ${showLabels ? 'bg-blue-600 text-white' : 'bg-white/10 text-white'}`}>
              Labels
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoricalFlightView;
