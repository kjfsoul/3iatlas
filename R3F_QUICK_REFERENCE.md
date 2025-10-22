# R3F Files - Quick Reference for Expert

## 📍 WORKING PROJECT LOCATION
`/Users/kfitz/3dsolardeepagent/code_artifacts/3iatlas-flight-tracker/frontend/`

## 📂 R3F Component Files (10 total)

### Primary Files (Must Review):
1. `src/components/Atlas3DTrackerEnhanced.tsx` - Main Canvas & orchestration
2. `src/components/SceneContent.tsx` - Animation loop & state management
3. `src/components/Comet3D.tsx` - Comet particle system (~10k particles) **⚠️ PERFORMANCE BOTTLENECK**
4. `src/components/CelestialBodies.tsx` - Planet meshes
5. `src/components/FollowCamera.tsx` - Camera controller

### Secondary Files (Performance Impact):
6. `src/components/AsteroidBelt.tsx` - Instanced mesh (~1000 instances)
7. `src/components/Starfield.tsx` - Background particles
8. `src/components/SunTextured.tsx` - Textured sun mesh
9. `src/components/PlanetLocators.tsx` - 2D overlays with <Html>
10. `src/components/PlaybackRecorder.tsx` - Video capture (WebGL interaction)

## 🎯 Priority Optimization Targets
1. **Comet3D.tsx** - Particle system (10k particles)
2. **SceneContent.tsx** - Animation loop efficiency
3. **AsteroidBelt.tsx** - Instanced rendering
4. **CelestialBodies.tsx** - Material/lighting optimization

## 📦 Package Versions
- @react-three/fiber: 8.13.0
- @react-three/drei: 9.88.0
- three: 0.159.0
- react: 18.2.0

## 🎮 Test Command
```bash
cd /Users/kfitz/3dsolardeepagent/code_artifacts/3iatlas-flight-tracker/frontend
npm run dev
# Opens at http://localhost:5173
```

## 🚫 IGNORE THIS LOCATION
`/Users/kfitz/3iatlas/components/` - Non-functional Next.js versions

