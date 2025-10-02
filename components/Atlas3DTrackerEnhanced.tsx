'use client';

/**
 * 3I/ATLAS Enhanced 3D Orbital Tracker
 * Complete solar system visualization with real NASA Horizons data
 * All objects move based on actual positions - NO static placeholders
 */

import { type VectorData } from '@/lib/horizons-api';
import { fetchSolarSystemData, SOLAR_SYSTEM_OBJECTS, type SolarSystemObjectKey } from '@/lib/solar-system-data';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface Props {
  startDate?: string;
  endDate?: string;
  stepSize?: '1h' | '6h' | '12h' | '1d';
  autoPlay?: boolean;
  playbackSpeed?: number;
  className?: string;
}

export default function Atlas3DTrackerEnhanced({
  startDate = '2025-10-01',
  endDate = '2025-10-31',
  stepSize = '6h',
  autoPlay = true,
  playbackSpeed = 2,
  className = '',
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    objects: Map<string, THREE.Mesh>;
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [solarSystemData, setSolarSystemData] = useState<Record<string, VectorData[]>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [speed, setSpeed] = useState(playbackSpeed);
  const [cameraView, setCameraView] = useState<'default' | 'followComet' | 'topDown' | 'closeup'>('default');

  const isPlayingRef = useRef(isPlaying);
  const speedRef = useRef(speed);
  const currentIndexRef = useRef(0);

  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);
  useEffect(() => { speedRef.current = speed; }, [speed]);

  // Fetch all solar system data
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(null);

      try {
        console.log('[Enhanced Tracker] Loading solar system data...');
        
        const objectsToLoad: SolarSystemObjectKey[] = [
          'atlas',      // 3I/ATLAS - the star!
          'earth',
          'mars',
          'jupiter',
          'saturn',
          'mercury',
          'venus',
        ];

        const data = await fetchSolarSystemData(objectsToLoad, startDate, endDate, stepSize);
        
        if (Object.keys(data).length === 0) {
          throw new Error('No data received from NASA Horizons');
        }

        setSolarSystemData(data);
        setLoading(false);
        console.log(`[Enhanced Tracker] Loaded ${Object.keys(data).length} objects`);
        
      } catch (err) {
        console.error('[Enhanced Tracker] Load failed:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
        setLoading(false);
      }
    }

    loadData();
  }, [startDate, endDate, stepSize]);

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current || loading || error || Object.keys(solarSystemData).length === 0) {
      return;
    }

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000508);

    const camera = new THREE.PerspectiveCamera(
      60,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.01,
      1000
    );
    camera.position.set(8, 6, 8);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x222222, 1);
    scene.add(ambientLight);

    const sunLight = new THREE.PointLight(0xffffff, 3, 100);
    sunLight.position.set(0, 0, 0);
    scene.add(sunLight);

    // Sun
    const sunGeo = new THREE.SphereGeometry(0.15, 32, 32);
    const sunMat = new THREE.MeshBasicMaterial({ color: 0xffaa00 });
    const sun = new THREE.Mesh(sunGeo, sunMat);
    scene.add(sun);

    const sunGlowGeo = new THREE.SphereGeometry(0.25, 32, 32);
    const sunGlowMat = new THREE.MeshBasicMaterial({
      color: 0xffaa00,
      transparent: true,
      opacity: 0.3,
    });
    const sunGlow = new THREE.Mesh(sunGlowGeo, sunGlowMat);
    scene.add(sunGlow);

    // Create meshes for each object
    const objectMeshes = new Map<string, THREE.Mesh>();

    console.log('[3D Scene] Available data:', Object.keys(solarSystemData));

    for (const [key, obj] of Object.entries(SOLAR_SYSTEM_OBJECTS)) {
      if (!solarSystemData[key]) {
        // console.log(`[3D Scene] ⚠️ Skipping ${key} - no data`);
        continue;
      }

      const isAtlas = key === 'atlas';
      if (isAtlas) {
        console.log(`[3D Scene] Creating 3I/ATLAS: color=${obj.color.toString(16)}, size=${obj.size}`);
      }
      
      const geometry = new THREE.SphereGeometry(obj.size, isAtlas ? 32 : 20, isAtlas ? 32 : 20);
      const material = new THREE.MeshBasicMaterial({ color: obj.color });
      const mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);
      objectMeshes.set(key, mesh);
      
      if (isAtlas) {
        console.log(`[3D Scene] ✅ Added GREEN 3I/ATLAS to scene`);
      }

      // Add glow to 3I/ATLAS
      if (isAtlas) {
        const glowGeo = new THREE.SphereGeometry(obj.size * 1.5, 24, 24);
        const glowMat = new THREE.MeshBasicMaterial({
          color: obj.color,
          transparent: true,
          opacity: 0.4,
        });
        const glow = new THREE.Mesh(glowGeo, glowMat);
        scene.add(glow);
        objectMeshes.set('atlas_glow', glow);
      }

      // Draw orbital path
      if (solarSystemData[key].length > 0) {
        const pathPoints = solarSystemData[key].map(
          v => new THREE.Vector3(v.position.x, v.position.z, -v.position.y)
        );
        const pathGeo = new THREE.BufferGeometry().setFromPoints(pathPoints);
        const pathMat = new THREE.LineBasicMaterial({
          color: key === 'atlas' ? 0x00ff88 : obj.color,
          opacity: key === 'atlas' ? 0.8 : 0.3,
          transparent: true,
        });
        const path = new THREE.Line(pathGeo, pathMat);
        scene.add(path);
      }
    }

    // Star field
    const starGeo = new THREE.BufferGeometry();
    const starVerts = [];
    for (let i = 0; i < 2000; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 50 + Math.random() * 100;
      starVerts.push(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.sin(phi) * Math.sin(theta),
        r * Math.cos(phi)
      );
    }
    starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starVerts, 3));
    const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.1, sizeAttenuation: true });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    sceneRef.current = { scene, camera, renderer, objects: objectMeshes };

    // Mouse controls
    let isDragging = false;
    let prevMouse = { x: 0, y: 0 };

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouse = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = (e.clientX - prevMouse.x) * 0.01;
      const deltaY = (e.clientY - prevMouse.y) * 0.01;

      const rotY = new THREE.Matrix4().makeRotationY(deltaX);
      camera.position.applyMatrix4(rotY);

      const camDir = new THREE.Vector3();
      camera.getWorldDirection(camDir);
      const right = new THREE.Vector3().crossVectors(camera.up, camDir).normalize();
      const rotX = new THREE.Matrix4().makeRotationAxis(right, deltaY);
      camera.position.applyMatrix4(rotX);

      camera.lookAt(0, 0, 0);
      prevMouse = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => { isDragging = false; };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.5 : -0.5;
      const dir = new THREE.Vector3();
      camera.getWorldDirection(dir);
      const newPos = camera.position.clone().add(dir.multiplyScalar(delta));
      if (newPos.length() > 1 && newPos.length() < 100) {
        camera.position.copy(newPos);
      }
    };

    renderer.domElement.addEventListener('mousedown', onMouseDown);
    renderer.domElement.addEventListener('mousemove', onMouseMove);
    renderer.domElement.addEventListener('mouseup', onMouseUp);
    renderer.domElement.addEventListener('mouseleave', onMouseUp);
    renderer.domElement.addEventListener('wheel', onWheel, { passive: false });

    const handleResize = () => {
      if (!containerRef.current) return;
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      renderer.domElement.removeEventListener('mousedown', onMouseDown);
      renderer.domElement.removeEventListener('mousemove', onMouseMove);
      renderer.domElement.removeEventListener('mouseup', onMouseUp);
      renderer.domElement.removeEventListener('mouseleave', onMouseUp);
      renderer.domElement.removeEventListener('wheel', onWheel);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (containerRef.current?.contains(renderer.domElement)) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, [loading, error, solarSystemData]);

  // Animation loop
  useEffect(() => {
    if (!sceneRef.current || Object.keys(solarSystemData).length === 0) return;

    const { scene, camera, renderer, objects } = sceneRef.current;
    let animationId: number | null = null;
    let lastTime = Date.now();
    let localIndex = 0;

    function animate() {
      animationId = requestAnimationFrame(animate);

      if (isPlayingRef.current) {
        const now = Date.now();
        const dt = (now - lastTime) / 1000;
        lastTime = now;

        localIndex += dt * speedRef.current * 3; // 3 frames/sec at 1x

        const maxFrames = Math.max(...Object.values(solarSystemData).map(v => v.length));
        if (localIndex >= maxFrames) {
          localIndex = 0;
        }

        const idx = Math.floor(localIndex);
        if (idx !== currentIndexRef.current) {
          setCurrentIndex(idx);
          currentIndexRef.current = idx;
        }
      }

      // Update ALL object positions from NASA data
      const idx = Math.floor(localIndex);
      for (const [key, vectors] of Object.entries(solarSystemData)) {
        if (idx >= vectors.length) continue;
        
        const vec = vectors[idx];
        const mesh = objects.get(key);
        if (mesh && vec) {
          mesh.position.set(vec.position.x, vec.position.z, -vec.position.y);
        }

        // Update glow for 3I/ATLAS
        if (key === 'atlas') {
          const glow = objects.get('atlas_glow');
          if (glow && vec) {
            glow.position.set(vec.position.x, vec.position.z, -vec.position.y);
          }
        }
      }

      // Camera views
      if (cameraView === 'followComet') {
        const atlasData = solarSystemData['atlas'];
        if (atlasData && idx < atlasData.length) {
          const cometPos = atlasData[idx].position;
          camera.position.set(cometPos.x + 2, cometPos.z + 2, -cometPos.y + 2);
          camera.lookAt(cometPos.x, cometPos.z, -cometPos.y);
        }
      }

      renderer.render(scene, camera);
    }

    animate();

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, [solarSystemData, cameraView]);

  const atlasData = solarSystemData['atlas'] || [];
  const currentDate = atlasData[currentIndex]?.date || startDate;
  const progress = atlasData.length > 0 ? (currentIndex / atlasData.length) * 100 : 0;
  
  // Debug: Why aren't controls showing? (only log once per state change)
  useEffect(() => {
    console.log('[Controls] loading:', loading, 'error:', error, 'atlasData.length:', atlasData.length, 'should show:', !loading && !error && atlasData.length > 0);
  }, [loading, error, atlasData.length]);

  return (
    <div className={`relative w-full h-full ${className}`}>
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-10">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-500 mb-4" />
          <p className="text-white text-lg">Loading Solar System Data...</p>
          <p className="text-white/60 text-sm mt-2">Fetching from NASA JPL Horizons</p>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-10">
          <div className="text-red-500 text-xl mb-2">⚠ Error</div>
          <p className="text-white text-center max-w-md px-4">{error}</p>
        </div>
      )}

      <div ref={containerRef} className="w-full h-full bg-black rounded-xl overflow-hidden" />

      {!loading && !error && atlasData.length > 0 && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 to-transparent p-6 space-y-3">
          <div className="text-center">
            <div className="text-green-400 text-3xl font-mono font-bold">
              {currentDate.split('T')[0]}
            </div>
            <div className="text-white/70 text-sm mt-1">
              {currentDate.split('T')[1]?.substring(0, 8)} UTC • 3I/ATLAS Perihelion Approach
            </div>
          </div>

          <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
            <div className="bg-green-500 h-full transition-all" style={{ width: `${progress}%` }} />
          </div>

          <div className="flex items-center justify-center gap-3 flex-wrap">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors"
            >
              {isPlaying ? '⏸ Pause' : '▶ Play'}
            </button>

            <button
              onClick={() => { setCurrentIndex(0); setIsPlaying(false); }}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
            >
              ⏮ Reset
            </button>

            <select
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="px-4 py-2 bg-white/10 text-white rounded-lg border border-white/20 focus:outline-none focus:border-green-500"
            >
              <option value={0.5}>Slow (0.5x)</option>
              <option value={1}>Normal (1x)</option>
              <option value={2}>Fast (2x)</option>
              <option value={5}>Very Fast (5x)</option>
              <option value={10}>Ultra Fast (10x)</option>
            </select>

            <select
              value={cameraView}
              onChange={(e) => setCameraView(e.target.value as typeof cameraView)}
              className="px-4 py-2 bg-white/10 text-white rounded-lg border border-white/20 focus:outline-none focus:border-green-500"
            >
              <option value="default">Solar System View</option>
              <option value="followComet">Follow 3I/ATLAS</option>
              <option value="topDown">Top-Down View</option>
              <option value="closeup">Perihelion Closeup</option>
            </select>
          </div>

          <div className="text-center text-white/50 text-xs">
            Frame {currentIndex + 1} / {atlasData.length} • NASA JPL Horizons Data
          </div>
        </div>
      )}

      {!loading && !error && (
        <div className="absolute top-4 right-4 bg-black/80 text-white/90 text-sm p-4 rounded-lg max-w-xs backdrop-blur-sm border border-white/10">
          <div className="font-semibold mb-2 text-green-400">🌌 Interactive Solar System</div>
          <div className="space-y-1 text-xs">
            <div>🟢 Green: 3I/ATLAS (Interstellar Comet)</div>
            <div>🔵 Blue: Earth</div>
            <div>🔴 Red: Mars</div>
            <div>🟡 Yellow: Sun</div>
            <div className="pt-2 border-t border-white/20 mt-2">
              <strong>Controls:</strong> Click + drag to rotate • Scroll to zoom
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
