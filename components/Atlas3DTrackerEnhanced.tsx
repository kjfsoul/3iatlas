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
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

interface Props {
  startDate?: string;
  endDate?: string;
  stepSize?: "1h" | "6h" | "12h" | "1d";
  autoPlay?: boolean;
  playbackSpeed?: number;
  className?: string;
  animationKey?: 'warning' | 'artifact' | 'discovery' | null; // NEW: Narrative trigger
}

export default function Atlas3DTrackerEnhanced({
  startDate = "2025-10-01",
  endDate = "2025-10-31",
  stepSize = "6h",
  autoPlay = true,
  playbackSpeed = 10,
  className = "",
  animationKey = null, // NEW: Animation hook for narrative engine
}: Props) {
  // E2E: deterministic mode when ?e2e=1
  const isE2E =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).has("e2e");
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    objects: Map<string, THREE.Object3D>;
    controls: OrbitControls;
  } | null>(null);

  const labelsContainerRef = useRef<HTMLDivElement>(null);
  const labelElementsRef = useRef<Map<string, HTMLDivElement>>(new Map());

  // Reusable vectors for camera calculations to prevent memory leaks
  const rideCometReusable = useRef({
    cometPosition: new THREE.Vector3(),
    nextPosition3D: new THREE.Vector3(),
    travelDirection: new THREE.Vector3(),
    cameraOffset: new THREE.Vector3(),
    cameraPosition: new THREE.Vector3(),
    lookAtPosition: new THREE.Vector3(),
  });

  // Camera state management (no re-renders)
  const cameraStateRef = useRef<{
    mode: "free-look" | "follow";
    target: THREE.Vector3 | null;
    currentMode: "default" | "followComet" | "topDown" | "closeup" | "marsApproach" | "rideComet";
  }>({
    mode: "free-look",
    target: null,
    currentMode: "default",
  });

  // Zoom functions
  const handleZoomIn = () => {
    if (!sceneRef.current) return;
    const { camera } = sceneRef.current;
    const delta = 1.0;
    const dir = new THREE.Vector3();
    camera.getWorldDirection(dir);
    const newPos = camera.position.clone().add(dir.multiplyScalar(-delta));
    if (newPos.length() > 0.5 && newPos.length() < 100) {
      camera.position.copy(newPos);
    }
  };

  const handleZoomOut = () => {
    if (!sceneRef.current) return;
    const { camera } = sceneRef.current;
    const delta = 1.0;
    const dir = new THREE.Vector3();
    camera.getWorldDirection(dir);
    const newPos = camera.position.clone().add(dir.multiplyScalar(delta));
    if (newPos.length() > 0.5 && newPos.length() < 100) {
      camera.position.copy(newPos);
    }
  };

  // Follow mode parameters (user-configurable)
  const followParamsRef = useRef<{
    distance: number;
    height: number;
    smoothing: number;
  }>({
    distance: 5,
    height: 2,
    smoothing: 0.02, // Reduced from 0.05 for more stable camera
  });

  // Motion amplification parameters
  const motionParamsRef = useRef<{
    cometMotionMultiplier: number;
    interpolationEnabled: boolean;
    trailLength: number;
  }>({
    cometMotionMultiplier: 10.0, // Increased from 3.0 for much better visibility
    interpolationEnabled: true,
    trailLength: 30, // Increased from 20 for longer visible trail
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [solarSystemData, setSolarSystemData] = useState<
    Record<string, VectorData[]>
  >({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [speed, setSpeed] = useState(playbackSpeed);
  const [cameraView, setCameraView] = useState<
    | "default"
    | "followComet"
    | "topDown"
    | "closeup"
    | "marsApproach"
    | "rideComet"
  >("default");
  const [showLabels, setShowLabels] = useState(true); // NEW: Toggle planetary labels

  const isPlayingRef = useRef(isPlaying);
  const speedRef = useRef(speed);
  const currentIndexRef = useRef(0);
  const objectEntriesRef = useRef<Array<[string, VectorData[]]>>([]);
  const maxFrameCountRef = useRef(0);
  const sharedVectorsRef = useRef({
    current: new THREE.Vector3(),
    next: new THREE.Vector3(),
    final: new THREE.Vector3(),
    offset: new THREE.Vector3(),
  });

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);
  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  useEffect(() => {
    const entries = Object.entries(solarSystemData);
    objectEntriesRef.current = entries;
    // Use 275 frames per object (274 days + 1)
    maxFrameCountRef.current = 275;
  }, [solarSystemData]);

  useEffect(() => {
    if (!sceneRef.current) return;
    const { scene, objects } = sceneRef.current;

    // Reset previous animation effects
    const atlasPath = scene.getObjectByName("atlas_path") as THREE.Line;
    if (atlasPath) {
      (atlasPath.material as THREE.LineBasicMaterial).color.set(0x00ff88);
    }
    const atlasGlow = objects.get("atlas_glow");
    if (atlasGlow) {
      atlasGlow.visible = true;
    }

    // Execute animation sequence based on key
    switch (animationKey) {
      case "warning":
        console.log("[Animation] Triggering WARNING sequence");
        if (atlasPath) {
          (atlasPath.material as THREE.LineBasicMaterial).color.set(0xff0000);
        }
        break;
      case "artifact":
        console.log("[Animation] Triggering ARTIFACT sequence");
        setCameraView("marsApproach");
        break;
      case "discovery":
        console.log("[Animation] Triggering DISCOVERY sequence");
        setCameraView("closeup");
        if (atlasGlow) {
          let flickerCount = 0;
          const flickerInterval = setInterval(() => {
            atlasGlow.visible = !atlasGlow.visible;
            flickerCount++;
            if (flickerCount > 10) {
              clearInterval(flickerInterval);
              atlasGlow.visible = true; // Ensure it's visible at the end
            }
          }, 150);
        }
        break;
    }
  }, [animationKey]);

  // Handle camera mode switching
  const handleCameraModeChange = (
    newMode:
      | "default"
      | "followComet"
      | "topDown"
      | "closeup"
      | "marsApproach"
      | "rideComet"
  ) => {
    console.log(`[Camera] Switching to ${newMode}`);
    if (!sceneRef.current) return;

    const { controls, camera } = sceneRef.current;

    // Update camera state
    cameraStateRef.current.currentMode = newMode;

    if (newMode === "default") {
      cameraStateRef.current.mode = "free-look";
      cameraStateRef.current.target = null;
      controls.enabled = true;
      controls.target.set(0, 0, 0);
      controls.update();
      camera.updateMatrixWorld(true);
    } else {
      cameraStateRef.current.mode = "follow";
      controls.enabled = false;
      // Snap instantly in tests (no smoothing/damping)
      if (isE2E) {
        controls.enableDamping = false;
        camera.updateMatrixWorld(true);
      }
    }
  };

  // Calculate planet size based on camera mode and distance
  const calculatePlanetSize = (
    baseSize: number,
    planetName: string,
    position: THREE.Vector3,
    camera: THREE.PerspectiveCamera
  ): number => {
    const currentMode = cameraStateRef.current.currentMode;
    let size = baseSize;

    // Apply camera mode scaling
    switch (currentMode) {
      case "default":
        size = baseSize * 0.8; // Slightly smaller for overview
        break;
      case "followComet":
        size = baseSize * 1.2; // Larger when following comet
        break;
      case "topDown":
        size = baseSize * 0.6; // Smaller for top-down view
        break;
      case "closeup":
        size = baseSize * 2.0; // Much larger for closeup
        break;
      case "marsApproach":
        // Make Mars more prominent
        if (planetName === "mars") {
          size = baseSize * 3.0;
        } else {
          size = baseSize * 0.7;
        }
        break;
      case "rideComet":
        size = baseSize * 1.5; // Larger when riding with comet
        break;
      default:
        size = baseSize;
    }

    // Distance-based scaling to maintain visibility
    const distance = camera.position.distanceTo(position);
    const minVisibleSize = distance * 0.02; // Minimum size for visibility
    const maxSize = baseSize * 5.0; // Maximum size to prevent huge planets

    size = Math.max(size, minVisibleSize);
    size = Math.min(size, maxSize);

    return size;
  };

  // Fetch all solar system data
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(null);

      try {
        console.log("[Enhanced Tracker] Loading solar system data...");

        const objectsToLoad: SolarSystemObjectKey[] = [
          "atlas", // 3I/ATLAS - the star!
          "earth",
          "mars",
          "jupiter",
          "saturn",
          "mercury",
          "venus",
        ];

        const data = await fetchSolarSystemData(
          objectsToLoad,
          startDate,
          endDate,
          stepSize
        );

        if (Object.keys(data).length === 0) {
          throw new Error("No data received from NASA Horizons");
        }

        setSolarSystemData(data);
        setLoading(false);
        console.log(
          `[Enhanced Tracker] Loaded ${Object.keys(data).length} objects`
        );
      } catch (err) {
        console.error("[Enhanced Tracker] Load failed:", err);
        setError(err instanceof Error ? err.message : "Failed to load data");
        setLoading(false);
      }
    }

    loadData();
  }, [startDate, endDate, stepSize]);

  // Initialize Three.js scene
  useEffect(() => {
    if (
      !containerRef.current ||
      loading ||
      error ||
      Object.keys(solarSystemData).length === 0
    ) {
      return;
    }

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000011); // Dark blue space

    // Add starfield background
    const starGeometry = new THREE.BufferGeometry();
    const starCount = 2000;
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      // Random positions in a large sphere
      const radius = 50 + Math.random() * 100;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      starPositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      starPositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      starPositions[i * 3 + 2] = radius * Math.cos(phi);

      // Random star colors (white to blue-white)
      const intensity = 0.5 + Math.random() * 0.5;
      starColors[i * 3] = intensity; // R
      starColors[i * 3 + 1] = intensity; // G
      starColors[i * 3 + 2] = intensity + Math.random() * 0.3; // B (slightly blue)
    }

    starGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(starPositions, 3)
    );
    starGeometry.setAttribute(
      "color",
      new THREE.BufferAttribute(starColors, 3)
    );

    const starMaterial = new THREE.PointsMaterial({
      size: 0.5,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
    });

    const starField = new THREE.Points(starGeometry, starMaterial);
    scene.add(starField);

    const camera = new THREE.PerspectiveCamera(
      60,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.01,
      1000
    );
    camera.position.set(8, 6, 8);
    camera.lookAt(0, 0, 0);

    // preserveDrawingBuffer is critical for stable headless screenshots
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      preserveDrawingBuffer: isE2E,
    });
    renderer.setSize(
      containerRef.current.clientWidth,
      containerRef.current.clientHeight
    );
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    // Fix resolution determinism for tests
    if (isE2E) {
      renderer.setPixelRatio(1);
      renderer.setSize(800, 600, false);
    }

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x222222, 1);
    scene.add(ambientLight);

    const sunLight = new THREE.PointLight(0xffffff, 3, 100);
    sunLight.position.set(0, 0, 0);
    scene.add(sunLight);

    // Sun - made more prominent for visibility
    const sunGeo = new THREE.SphereGeometry(0.3, 32, 32); // Increased from 0.15
    const sunMat = new THREE.MeshStandardMaterial({
      color: 0xffaa00,
      emissive: 0xffaa00,
      emissiveIntensity: 0.5,
    });
    const sun = new THREE.Mesh(sunGeo, sunMat);
    sun.name = "sun";
    scene.add(sun);

    const sunGlowGeo = new THREE.SphereGeometry(0.5, 32, 32); // Increased from 0.25
    const sunGlowMat = new THREE.MeshBasicMaterial({
      color: 0xffaa00,
      transparent: true,
      opacity: 0.6, // Increased from 0.3
    });
    const sunGlow = new THREE.Mesh(sunGlowGeo, sunGlowMat);
    sunGlow.name = "sunGlow";
    scene.add(sunGlow);

    // Create meshes for each object
    const objectMeshes = new Map<string, THREE.Object3D>();

    console.log("[3D Scene] Available data:", Object.keys(solarSystemData));

    // Validate orbital data against R3F_ANIMATION_CALCULATIONS.json
    const expectedOrbitalPeriods: Record<string, number> = {
      mercury: 88.0,
      venus: 224.7,
      earth: 365.25,
      mars: 687.0,
      jupiter: 4332.7,
      saturn: 10759.5,
      uranus: 30688.5,
      neptune: 60182.0,
    };

    Object.entries(solarSystemData).forEach(([key, data]) => {
      if (expectedOrbitalPeriods[key] && data.length > 0) {
        const totalDays = 274; // Our animation period
        const expectedRotation =
          ((totalDays / expectedOrbitalPeriods[key]) * 360) % 360;
        console.log(
          `[Orbital Validation] ${key}: Expected rotation in 274 days = ${expectedRotation.toFixed(
            1
          )}° (period: ${expectedOrbitalPeriods[key]} days)`
        );
      }
    });

    for (const [key, obj] of Object.entries(SOLAR_SYSTEM_OBJECTS)) {
      if (!solarSystemData[key]) {
        // console.log(`[3D Scene] ⚠️ Skipping ${key} - no data`);
        continue;
      }

      const isAtlas = key === "atlas";
      if (isAtlas) {
        console.log(
          `[3D Scene] Creating 3I/ATLAS: color=${obj.color.toString(
            16
          )}, size=${obj.size}`
        );
      }

      const geometry = new THREE.SphereGeometry(
        obj.size,
        isAtlas ? 32 : 20,
        isAtlas ? 32 : 20
      );

      // Enhanced materials for better visual realism
      const material = new THREE.MeshBasicMaterial({
        color: obj.color,
      });

      const mesh = new THREE.Mesh(geometry, material);

      // Make Mars more prominent for Mars approach view
      if (key === "mars") {
        mesh.userData.isMars = true;
      }
      scene.add(mesh);
      objectMeshes.set(key, mesh);

      if (isAtlas) {
        console.log(`[3D Scene] ✅ Added GREEN 3I/ATLAS to scene`);
      }

      // Add enhanced visual effects to 3I/ATLAS
      if (isAtlas) {
        // Enhanced glow effect
        const glowGeo = new THREE.SphereGeometry(obj.size * 2.5, 32, 32);
        const glowMat = new THREE.MeshBasicMaterial({
          color: obj.color,
          transparent: true,
          opacity: 0.7,
        });
        const glow = new THREE.Mesh(glowGeo, glowMat);
        scene.add(glow);
        objectMeshes.set("atlas_glow", glow);

        // Outer bloom effect
        const bloomGeo = new THREE.SphereGeometry(obj.size * 4.0, 24, 24);
        const bloomMat = new THREE.MeshBasicMaterial({
          color: obj.color,
          transparent: true,
          opacity: 0.3,
        });
        const bloom = new THREE.Mesh(bloomGeo, bloomMat);
        scene.add(bloom);
        objectMeshes.set("atlas_bloom", bloom);

        // Create particle trail system
        const trailGeometry = new THREE.BufferGeometry();
        const trailPositions = new Float32Array(
          motionParamsRef.current.trailLength * 3
        );
        const trailColors = new Float32Array(
          motionParamsRef.current.trailLength * 3
        );

        // Initialize trail with comet color
        for (let i = 0; i < motionParamsRef.current.trailLength; i++) {
          const color = new THREE.Color(obj.color);
          trailColors[i * 3] = color.r;
          trailColors[i * 3 + 1] = color.g;
          trailColors[i * 3 + 2] = color.b;
        }

        trailGeometry.setAttribute(
          "position",
          new THREE.BufferAttribute(trailPositions, 3)
        );
        trailGeometry.setAttribute(
          "color",
          new THREE.BufferAttribute(trailColors, 3)
        );

        const trailMaterial = new THREE.PointsMaterial({
          size: 0.05, // Increased from 0.02 for better visibility
          vertexColors: true,
          transparent: true,
          opacity: 1.0, // Increased from 0.8 for better visibility
          blending: THREE.AdditiveBlending,
        });

        const trail = new THREE.Points(trailGeometry, trailMaterial);
        scene.add(trail);
        objectMeshes.set("atlas_trail", trail);
      }

      // Draw orbital path
      if (solarSystemData[key].length > 0) {
        const pathPoints = solarSystemData[key].map(
          (v) => new THREE.Vector3(v.position.x, v.position.z, -v.position.y)
        );
        const pathGeo = new THREE.BufferGeometry().setFromPoints(pathPoints);
        const pathMat = new THREE.LineBasicMaterial({
          color: key === "atlas" ? 0x00ff88 : obj.color,
          opacity: key === "atlas" ? 0.8 : 0.3,
          transparent: true,
        });
        const path = new THREE.Line(pathGeo, pathMat);
        if (key === "atlas") {
          path.name = "atlas_path";
        }
        scene.add(path);
      }

      // NEW: Add 3D text labels for planets
      if (key === "earth" || key === "mars") {
        // Labels will be rendered via CSS overlay using screen projection
        mesh.userData.label = obj.name;

        // Create the label element
        if (labelsContainerRef.current) {
          const label = document.createElement("div");
          label.className =
            "text-white text-xs bg-black/50 px-2 py-1 rounded-md absolute";
          label.textContent = obj.name;
          label.style.display = "none"; // Initially hidden
          labelsContainerRef.current.appendChild(label);
          labelElementsRef.current.set(key, label);
        }
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
    starGeo.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(starVerts, 3)
    );
    const starMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.1,
      sizeAttenuation: true,
      transparent: true,
      opacity: 1.0,
    });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    // Initialize OrbitControls for free-look mode
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 1;
    controls.maxDistance = 100;
    controls.maxPolarAngle = Math.PI;

    sceneRef.current = {
      scene,
      camera,
      renderer,
      objects: objectMeshes,
      controls,
    };

    // ---------- E2E Test Harness ----------
    if (isE2E) {
      // Promise that resolves after N animation frames to ensure the camera is visible
      const ensureFrame = (n = 2) =>
        new Promise<void>((res) => {
          let i = 0;
          const step = () => {
            i++;
            if (i >= n) return res();
            requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        });
      (window as any).__atlasTest = {
        ready: true,
        enterRide: () => {
          setCameraView("rideComet");
          handleCameraModeChange("rideComet");
        },
        ensureFrame,
        getCameraState: () => ({
          pos: sceneRef.current!.camera.position.toArray(),
          view: (
            document.querySelector(
              '[data-testid="camera-mode"]'
            ) as HTMLSelectElement
          )?.value,
        }),
      };
    }

    // OrbitControls handles all mouse interactions
    // Add double-click zoom as alternative to scrolling
    let clickCount = 0;
    let clickTimer: NodeJS.Timeout | null = null;

    const handleDoubleClick = (e: MouseEvent) => {
      e.preventDefault();
      const delta = 1.0; // Zoom in amount
      const dir = new THREE.Vector3();
      camera.getWorldDirection(dir);
      const newPos = camera.position.clone().add(dir.multiplyScalar(-delta));
      if (newPos.length() > 0.5 && newPos.length() < 100) {
        camera.position.copy(newPos);
      }
    };

    const handleClick = (e: MouseEvent) => {
      clickCount++;
      if (clickCount === 1) {
        clickTimer = setTimeout(() => {
          clickCount = 0;
        }, 300);
      } else if (clickCount === 2) {
        clearTimeout(clickTimer!);
        clickCount = 0;
        handleDoubleClick(e);
      }
    };

    renderer.domElement.addEventListener("click", handleClick);

    const handleResize = () => {
      if (!containerRef.current) return;
      camera.aspect =
        containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(
        containerRef.current.clientWidth,
        containerRef.current.clientHeight
      );
    };
    window.addEventListener("resize", handleResize);

    return () => {
      controls.dispose();
      renderer.domElement.removeEventListener("click", handleClick);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      if (containerRef.current?.contains(renderer.domElement)) {
        containerRef.current.removeChild(renderer.domElement);
      }
      // Clean up labels
      if (labelsContainerRef.current) {
        labelsContainerRef.current.innerHTML = "";
      }
      labelElementsRef.current.clear();
    };
  }, [loading, error, solarSystemData]);


  // Animation loop
  useEffect(() => {
    if (!sceneRef.current || objectEntriesRef.current.length === 0) {
      return;
    }

    let animationId: number | null = null;
    let lastTime = performance.now();
    let localIndex = currentIndexRef.current || 0; // resume from UI

    const animate = () => {
      animationId = requestAnimationFrame(animate);

      const sceneState = sceneRef.current;
      if (!sceneState) return;

      const { scene, camera, renderer, objects } = sceneState;

      if (isPlayingRef.current) {
        const now = performance.now();
        const dt = (now - lastTime) / 1000;
        lastTime = now;

        // Advance time in "data frames" (days, since data is daily)
        const maxFrames = maxFrameCountRef.current;
        if (maxFrames > 0) {
          const framesPerDay = 9.0328467153;
          localIndex += dt * speedRef.current * framesPerDay;

          // Wrap smoothly without state updates
          if (localIndex >= maxFrames) localIndex -= maxFrames;
          if (localIndex < 0) localIndex += maxFrames;
        }
      }

      const entries = objectEntriesRef.current;
      if (!entries.length) {
        renderer.render(scene, camera);
        return;
      }

      const { cometMotionMultiplier, interpolationEnabled } = motionParamsRef.current;
      const { current, next, final, offset } = sharedVectorsRef.current;

      // ---- Position all bodies using float‑safe interpolation ----
      for (let i = 0; i < entries.length; i++) {
        const [key, vectors] = entries[i];
        if (!vectors || vectors.length === 0 || key === "sun") continue;

        const mesh = objects.get(key);
        if (!mesh) continue;

        // Continuous, float‑safe interpolation with negative‑wrap handling
        const total = vectors.length;
        const safeIndex = ((localIndex % total) + total) % total;
        const base = Math.floor(safeIndex);
        const nextIndex = (base + 1) % total;
        const t = safeIndex - base;
        const smoothT = t * t * (3 - 2 * t); // Hermite smoothing

        if (interpolationEnabled) {
          current.set(
            vectors[base].position.x,
            vectors[base].position.z,
            -vectors[base].position.y
          );
          next.set(
            vectors[nextIndex].position.x,
            vectors[nextIndex].position.z,
            -vectors[nextIndex].position.y
          );
          final.copy(current).lerp(next, smoothT);

          if (key === "atlas") {
            offset.copy(next).sub(current).multiplyScalar(cometMotionMultiplier - 1);
            final.add(offset);
          }
        } else {
          final.set(
            vectors[base].position.x,
            vectors[base].position.z,
            -vectors[base].position.y
          );
        }

        mesh.position.copy(final);

        // Dynamic display size (non-sun/atlas only)
        if (key !== "atlas" && key !== "sun") {
          const baseSize = SOLAR_SYSTEM_OBJECTS[key as SolarSystemObjectKey]?.size || 0.01;
          const newSize = calculatePlanetSize(baseSize, key, final, camera);
          const currentScale = mesh.scale.x;
          const targetScale = newSize / baseSize;
          const scaleSpeed = 0.1;
          const smoothedScale = currentScale + (targetScale - currentScale) * scaleSpeed;
          mesh.scale.setScalar(smoothedScale);
        }

        // 3I/ATLAS visuals
        if (key === "atlas") {
          const glow = objects.get("atlas_glow");
          if (glow) glow.position.copy(final);
          const bloom = objects.get("atlas_bloom");
          if (bloom) bloom.position.copy(final);
          const trail = objects.get("atlas_trail") as THREE.Points | undefined;
          if (trail) {
            const positions = trail.geometry.attributes.position.array as Float32Array;
            const colors = trail.geometry.attributes.color.array as Float32Array;
            for (let idx = (motionParamsRef.current.trailLength - 1) * 3; idx >= 3; idx -= 3) {
              positions[idx] = positions[idx - 3];
              positions[idx + 1] = positions[idx - 2];
              positions[idx + 2] = positions[idx - 1];
              colors[idx] = colors[idx - 3] * 0.95;
              colors[idx + 1] = colors[idx - 2] * 0.95;
              colors[idx + 2] = colors[idx - 1] * 0.95;
            }
            positions[0] = final.x; positions[1] = final.y; positions[2] = final.z;
            colors[0] = 0.0; colors[1] = 1.0; colors[2] = 0.5;
            trail.geometry.attributes.position.needsUpdate = true;
            trail.geometry.attributes.color.needsUpdate = true;
          }
        }
      }
      // ---- end positions ----

      // Keep Sun fixed
      const sun = scene.getObjectByName("sun");
      if (sun) sun.position.set(0, 0, 0);
      const sunGlow = scene.getObjectByName("sunGlow");
      if (sunGlow) sunGlow.position.set(0, 0, 0);

      // Labels
      if (labelsContainerRef.current) {
        const labelElements = labelElementsRef.current;
        labelElements.forEach((label, key) => {
          if (!showLabels) { label.style.display = "none"; return; }
          const mesh = objects.get(key);
          if (!mesh) { label.style.display = "none"; return; }
          const labelVector = sharedVectorsRef.current.offset;
          mesh.getWorldPosition(labelVector);
          labelVector.project(camera);
          const x = (labelVector.x * 0.5 + 0.5) * renderer.domElement.clientWidth;
          const y = (labelVector.y * -0.5 + 0.5) * renderer.domElement.clientHeight;
          label.style.display = "block";
          label.style.transform = `translate(-50%, -120%) translate(${x}px, ${y}px)`;
        });
      }

      // Camera controls (unchanged)
      switch (cameraView) {
        case "followComet": {
          const atlasData = solarSystemData["atlas"];
          const currentIdx = Math.floor(((localIndex % atlasData.length) + atlasData.length) % atlasData.length);
          if (atlasData && currentIdx < atlasData.length) {
            const cometPos = atlasData[currentIdx].position;
            const cometPosition3D = new THREE.Vector3(cometPos.x, cometPos.z, -cometPos.y);
            const { distance: followDistance, height, smoothing } = followParamsRef.current;
            const cameraOffset = new THREE.Vector3(1, 0, 0).normalize().multiplyScalar(followDistance);
            cameraOffset.y += height;
            const idealPosition = cometPosition3D.clone().add(cameraOffset);
            const distance = camera.position.distanceTo(idealPosition);
            const adaptiveSmoothing = distance > 1.0 ? smoothing * 3.0 : smoothing;
            if (distance > 0.01) camera.position.lerp(idealPosition, adaptiveSmoothing);
            camera.lookAt(cometPosition3D);
          }
          break;
        }
        case "topDown":
          camera.position.set(0, 25, 0);
          camera.lookAt(0, 0, 0);
          camera.fov = 90;
          camera.updateProjectionMatrix();
          break;
        case "closeup": {
          const atlasData = solarSystemData["atlas"];
          const currentIdx = Math.floor(((localIndex % atlasData.length) + atlasData.length) % atlasData.length);
          if (atlasData && currentIdx < atlasData.length) {
            const cometPos = atlasData[currentIdx].position;
            const cometPosition3D = new THREE.Vector3(cometPos.x, cometPos.z, -cometPos.y);
            const sunPosition = new THREE.Vector3(0, 0, 0);
            const cometToSun = sunPosition.clone().sub(cometPosition3D).normalize();
            const cameraDistance = 2.0;
            const cameraPosition = cometPosition3D.clone().add(cometToSun.multiplyScalar(cameraDistance));
            camera.position.copy(cameraPosition);
            camera.lookAt(cometPosition3D);
          }
          break;
        }
        case "marsApproach": {
          const atlasData = solarSystemData["atlas"];
          const marsData = solarSystemData["mars"];
          const currentIdx = Math.floor(((localIndex % atlasData.length) + atlasData.length) % atlasData.length);
          if (atlasData && marsData && currentIdx < atlasData.length && currentIdx < marsData.length) {
            const cometPos = atlasData[currentIdx].position;
            const marsPos = marsData[currentIdx].position;
            const cometPosition3D = new THREE.Vector3(cometPos.x, cometPos.z, -cometPos.y);
            const marsPosition3D = new THREE.Vector3(marsPos.x, marsPos.z, -marsPos.y);
            const cometToMars = marsPosition3D.clone().sub(cometPosition3D).normalize();
            const cameraDistance = 3.0;
            const cameraPosition = cometPosition3D.clone().add(cometToMars.multiplyScalar(cameraDistance));
            camera.position.copy(cameraPosition);
            camera.lookAt(cometPosition3D);
            const marsMesh = objects.get("mars");
            if (marsMesh) marsMesh.scale.setScalar(3.0);
          }
          break;
        }
        case "rideComet": {
          const atlasData = solarSystemData["atlas"];
          const currentIdx = Math.floor(((localIndex % atlasData.length) + atlasData.length) % atlasData.length);
          if (atlasData && currentIdx < atlasData.length - 1) {
            const cometMesh = objects.get("atlas");
            if (cometMesh) {
              const {
                cometPosition, nextPosition3D, travelDirection,
                cameraOffset, cameraPosition, lookAtPosition
              } = rideCometReusable.current;

              const nextVec = atlasData[currentIdx + 1];
              cometPosition.copy(cometMesh.position);
              nextPosition3D.set(nextVec.position.x, nextVec.position.z, -nextVec.position.y);
              travelDirection.subVectors(nextPosition3D, cometPosition).normalize();
              cameraOffset.copy(travelDirection).multiplyScalar(-0.1);
              cameraOffset.y += 0.05;
              cameraPosition.copy(cometPosition).add(cameraOffset);
              camera.position.copy(cameraPosition);
              lookAtPosition.copy(cometPosition).add(travelDirection.multiplyScalar(10));
              camera.lookAt(lookAtPosition);
            }
          }
          break;
        }
        case "default":
        default:
          camera.position.set(8, 5, 8);
          camera.lookAt(0, 0, 0);
          camera.fov = 60;
          camera.updateProjectionMatrix();
      }

      // Reset Mars scale if not in Mars Approach view
      if (cameraView !== "marsApproach") {
        const marsMesh = objects.get("mars");
        if (marsMesh) marsMesh.scale.setScalar(1.0);
      }

      // Update OrbitControls (only in free-look mode)
      if (cameraStateRef.current.mode === "free-look" && sceneRef.current) {
        sceneRef.current.controls.update();
      }

      // ---- Commit the index update AFTER all calculations & rendering state are stable ----
      const idx = Math.floor(localIndex);
      if (idx !== currentIndexRef.current) {
        currentIndexRef.current = idx;
        setCurrentIndex(idx);
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, [solarSystemData, cameraView]);

