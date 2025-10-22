# React Three Fiber (R3F) Files - For R3F Expert

## 🎯 WORKING PROJECT (Vite - Currently Used in Production)
**Location**: `/Users/kfitz/3dsolardeepagent/code_artifacts/3iatlas-flight-tracker/frontend/`
**Status**: ✅ FULLY FUNCTIONAL - This is what's being embedded via iframe

### Core R3F Components (All Working):

1. **`src/components/Atlas3DTrackerEnhanced.tsx`** - Main component
   - Contains `<Canvas>` from @react-three/fiber
   - Orchestrates entire 3D scene
   - Handles view modes (Explorer, True-Scale, Ride-with-ATLAS)
   - Uses `PerspectiveCamera` from @react-three/drei

2. **`src/components/SceneContent.tsx`** - Scene manager
   - Uses `useFrame` hook (R3F)
   - Manages animation loop
   - Controls all celestial body rendering
   - Handles camera animations and transitions

3. **`src/components/CelestialBodies.tsx`** - Planets/Sun rendering
   - Uses R3F primitives: `<mesh>`, `<sphereGeometry>`, `<meshStandardMaterial>`
   - Renders all planets and the Sun
   - Uses `useThree` hook for camera access

4. **`src/components/Comet3D.tsx`** - 3I/ATLAS comet rendering
   - Complex particle system for coma and tail
   - Uses `useFrame` for dynamic animations
   - Custom shaders and materials
   - `<points>` and `<bufferGeometry>` from R3F

5. **`src/components/AsteroidBelt.tsx`** - Asteroid belt
   - Instanced rendering for performance
   - Uses `useFrame` for rotation
   - `<instancedMesh>` from R3F

6. **`src/components/Starfield.tsx`** - Background stars
   - Uses `<points>` primitive
   - Simple particle system
   - Static background

7. **`src/components/SunTextured.tsx`** - Textured Sun mesh
   - Uses `<Sphere>` from @react-three/drei
   - Texture mapping
   - Custom materials

8. **`src/components/FollowCamera.tsx`** - Camera controller
   - Uses `useFrame` for smooth camera following
   - Uses `useThree` to access camera
   - Implements "Ride-with-ATLAS" view mode

9. **`src/components/PlanetLocators.tsx`** - Screen-space labels
   - Uses `<Html>` from @react-three/drei
   - Projects 3D positions to 2D screen space
   - Uses `useThree` for projection matrix

10. **`src/components/PlaybackRecorder.tsx`** - Video recording
    - Uses `useThree` to access WebGL context
    - Captures canvas frames
    - Not core R3F but interacts with it

### Package Versions (Working Configuration):
```json
{
  "@react-three/drei": "9.88.0",
  "@react-three/fiber": "8.13.0",
  "three": "0.159.0",
  "react": "18.2.0"
}
```

---

## ❌ BROKEN PROJECT (Next.js - Not Working)
**Location**: `/Users/kfitz/3iatlas/components/`
**Status**: ❌ R3F FAILS TO INITIALIZE - Reconciler error
**Error**: `Cannot read properties of undefined (reading 'ReactCurrentOwner')`

### Attempted R3F Components (All Broken):

1. **`components/Atlas3DTracker.tsx`** - Basic tracker (broken)
2. **`components/Atlas3DTrackerEnhanced.tsx`** - Enhanced version (broken)
3. **`components/SceneContent.tsx`** - Scene manager (broken)
4. **`components/CelestialBodies.tsx`** - Planet rendering (broken)
5. **`components/Comet3D.tsx`** - Comet rendering (broken)
6. **`components/AsteroidBelt.tsx`** - Asteroids (broken)
7. **`components/Starfield.tsx`** - Stars (broken)
8. **`components/FollowCamera.tsx`** - Camera (broken)
9. **`components/PlanetLocators.tsx`** - Labels (broken)
10. **`components/PlaybackRecorder.tsx`** - Recording (broken)
11. **`components/views/*.tsx`** - Various view components (broken)

### Package Versions (Broken Configuration):
```json
{
  "@react-three/drei": "9.88.0",
  "@react-three/fiber": "8.13.0",
  "three": "0.159.0",
  "react": "18.2.0",
  "next": "15.5.4"
}
```

**Note**: Same versions as working Vite project, but incompatible with Next.js 15.5.4

---

## 🎯 OPTIMIZATION GOALS

### What Needs R3F Expert Attention:

1. **Performance Optimization** (Working Vite Project):
   - Improve FPS on lower-end devices
   - Optimize particle systems (comet tail has ~10k particles)
   - Reduce draw calls
   - Implement LOD (Level of Detail) for distant objects

2. **Memory Management**:
   - Prevent memory leaks during view mode switches
   - Optimize texture usage
   - Better geometry disposal

3. **Render Quality**:
   - Improve comet glow effects
   - Better lighting for planets
   - Enhanced particle effects for comet tail

4. **Camera System**:
   - Smoother transitions between view modes
   - Better camera interpolation in "Ride-with-ATLAS" mode
   - Prevent camera clipping issues

5. **OPTIONAL: Next.js Compatibility** (Low Priority):
   - Investigate R3F + Next.js 15.5.4 compatibility
   - Only if expert has experience with this specific setup
   - Current iframe solution works fine

---

## 📊 Current Performance Metrics

**Target**: 60 FPS
**Current**: 
- Desktop: ~55-60 FPS (good)
- Laptop: ~40-50 FPS (needs improvement)
- Tablet: ~30-40 FPS (needs improvement)

**Bottlenecks**:
1. Comet particle system (~10,000 particles)
2. Multiple planet meshes with standard materials
3. Asteroid belt instanced mesh (~1000 instances)

---

## 🔍 Key R3F Hooks Used

### In Working Project:
- `useFrame(callback)` - Animation loop (SceneContent, FollowCamera, Comet3D, AsteroidBelt)
- `useThree()` - Access to scene, camera, gl (SceneContent, FollowCamera, PlanetLocators)
- `useRef()` - Reference to meshes and groups (all components)
- `useEffect()` - Setup/cleanup (Atlas3DTrackerEnhanced)

### R3F Primitives Used:
- `<Canvas>` - Root component (Atlas3DTrackerEnhanced)
- `<mesh>` - All 3D objects
- `<sphereGeometry>` - Planets, Sun
- `<meshStandardMaterial>` - Planet materials
- `<points>` - Starfield, comet particles
- `<instancedMesh>` - Asteroid belt
- `<bufferGeometry>` - Custom geometries
- `<group>` - Object grouping
- `<primitive>` - Direct Three.js objects

### @react-three/drei Components Used:
- `<PerspectiveCamera>` - Camera setup
- `<OrbitControls>` - User interaction (disabled in some modes)
- `<Html>` - 2D overlays (PlanetLocators)
- `<Sphere>` - Textured sun
- `<Stars>` - Background stars (commented out, using custom)

---

## 📁 File Paths Summary

### ✅ WORKING (Pass these to expert):
```
/Users/kfitz/3dsolardeepagent/code_artifacts/3iatlas-flight-tracker/frontend/src/components/
├── Atlas3DTrackerEnhanced.tsx    # Main R3F Canvas
├── SceneContent.tsx               # Animation loop & state
├── CelestialBodies.tsx            # Planets rendering
├── Comet3D.tsx                    # Comet with particles
├── AsteroidBelt.tsx               # Instanced asteroids
├── Starfield.tsx                  # Background stars
├── SunTextured.tsx                # Textured sun
├── FollowCamera.tsx               # Camera controller
├── PlanetLocators.tsx             # Screen-space labels
└── PlaybackRecorder.tsx           # Video capture
```

### ❌ BROKEN (Don't focus on these):
```
/Users/kfitz/3iatlas/components/
└── [All R3F files here are non-functional due to Next.js incompatibility]
```

---

## 🚀 Deployment Info

- **Production URL**: http://localhost:5173 (Vite dev server)
- **Embedded in**: Next.js site at http://localhost:3031 via iframe
- **Browser Support**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **WebGL Version**: 2.0 required

---

## 📝 Notes for R3F Expert

1. **Priority**: Optimize the WORKING Vite project, not the broken Next.js one
2. **Don't break**: The iframe embedding pattern - it's the solution, not the problem
3. **Focus areas**: Performance (FPS), memory management, visual quality
4. **Test environment**: The Vite dev server must be running for testing
5. **Real data**: All orbital calculations use real NASA data - don't modify the math
6. **View modes**: Must maintain all 3 modes (Explorer, True-Scale, Ride-with-ATLAS)

