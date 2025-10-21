# 3I/ATLAS Enhanced Tracker Migration Tasks

## Current Status

- **Site URL**: <http://localhost:3030>
- **Site Structure**: ✅ Working (all Printify products loading correctly)
- **3D Tracker**: ❌ Broken (React reconciler error)

## Core Problem

React Three Fiber (`@react-three/fiber`) is failing to initialize with error:

```
TypeError: Cannot read properties of undefined (reading 'ReactCurrentOwner')
at $$$reconciler (react-reconciler/cjs/react-reconciler.development.js:498:46)
```

This is a version compatibility issue between React, React Three Fiber, and Next.js 15.5.4.

---

## Task 1: Revert to Working React Versions

**Goal**: Get back to a stable React version that works with R3F

**Files to modify**:

- `/Users/kfitz/3iatlas/package.json`

**Actions**:

1. Change React versions back to:

   ```json
   "react": "18.2.0",
   "react-dom": "18.2.0",
   "@types/react": "18.2.0"
   ```

2. Run `npm install`
3. Delete `.next` folder: `rm -rf .next`
4. Restart dev server: `npm run dev`

**Validation**: Check that the site still loads at <http://localhost:3030> and Printify products display.

---

## Task 2: Use Compatible R3F Versions

**Goal**: Find R3F versions that work with React 18.2.0 and Next.js 15.5.4

**Files to modify**:

- `/Users/kfitz/3iatlas/package.json`

**Research needed**:

- Check React Three Fiber compatibility matrix: <https://github.com/pmndrs/react-three-fiber>
- Find versions that explicitly support React 18.2.0

**Try these versions sequentially**:

1. First attempt:

   ```json
   "@react-three/fiber": "^8.16.0",
   "@react-three/drei": "^9.100.0"
   ```

2. If that fails, try:

   ```json
   "@react-three/fiber": "^8.14.0",
   "@react-three/drei": "^9.90.0"
   ```

3. If that fails, try:

   ```json
   "@react-three/fiber": "^8.11.0",
   "@react-three/drei": "^9.80.0"
   ```

**After each attempt**:

1. Run `npm install`
2. Delete `.next`: `rm -rf .next`
3. Restart server
4. Check browser console for the React reconciler error

**Validation**: Browser console should NOT show `ReactCurrentOwner` error.

---

## Task 3: Fix Missing Peer Dependencies

**Goal**: Resolve any peer dependency warnings from npm

**Check output of**: `npm install` for ERESOLVE warnings

**If there are peer dependency issues**:

1. Install missing packages explicitly
2. Or use `npm install --legacy-peer-deps` flag

**Validation**: `npm install` completes without errors or critical warnings.

---

## Task 4: Test Data Loading

**Goal**: Verify trajectory data loads correctly

**Files to check**:

- `/Users/kfitz/3iatlas/public/data/trajectory_static.json` - should exist
- `/Users/kfitz/3iatlas/public/data/timeline_events.json` - should exist

**Actions**:

1. Open browser dev tools
2. Go to <http://localhost:3030>
3. Check Network tab for successful loading of JSON files
4. Check Console for any data loading errors

**Validation**: Both JSON files load with 200 status, no console errors about missing data.

---

## Task 5: Simplify the Tracker Component

**Goal**: If R3F still doesn't work, create a simpler working version

**Files to modify**:

- `/Users/kfitz/3iatlas/components/Atlas3DTrackerEnhanced.tsx`

**Actions**:

1. Create a minimal R3F component that just renders a cube:

   ```tsx
   import { Canvas } from '@react-three/fiber';

   export default function Atlas3DTrackerEnhanced() {
     return (
       <div className="w-full h-full">
         <Canvas>
           <ambientLight />
           <mesh>
             <boxGeometry />
             <meshStandardMaterial color="orange" />
           </mesh>
         </Canvas>
       </div>
     );
   }
   ```

2. Test if this minimal version works
3. If it works, gradually add back features one by one:
   - Add camera
   - Add OrbitControls
   - Add data loading
   - Add planets
   - Add comet

**Validation**: Each step works before moving to the next. If any step breaks, you know exactly what caused it.

---

## Task 6: Alternative - Use Vite Project Instead

**Goal**: If Next.js + R3F is fundamentally incompatible, use the working Vite version

**Source project**: `/Users/kfitz/3dsolardeepagent/code_artifacts/3iatlas-flight-tracker/`

**This project already works** - the tracker renders correctly there.

**Actions**:

1. Copy the working tracker from Vite project
2. Build it as a standalone widget: `npm run build` in the Vite project
3. Host the built files separately
4. Embed in the Next.js site using an `<iframe>` or React portal

**Files to create in Next.js project**:

```tsx
// components/EmbeddedTracker.tsx
export function EmbeddedTracker() {
  return (
    <iframe
      src="http://localhost:5173"
      className="w-full h-full border-0"
      title="3I/ATLAS Tracker"
    />
  );
}
```

**Validation**: Tracker displays and works correctly inside the Next.js page.

---

## Task 7: Test in Production Build

**Goal**: Ensure it works in production, not just dev

**Actions**:

1. Run `npm run build` in `/Users/kfitz/3iatlas/`
2. Check for build errors
3. Run `npm start`
4. Test at production URL

**Validation**: Production build completes successfully, site works correctly.

---

## Current File Locations

### Working Vite Project (Reference)

- Base: `/Users/kfitz/3dsolardeepagent/code_artifacts/3iatlas-flight-tracker/`
- Components: `frontend/src/components/`
- Working tracker: `frontend/src/components/Atlas3DTrackerEnhanced.tsx`

### Target Next.js Project (Needs Fix)

- Base: `/Users/kfitz/3iatlas/`
- Components: `components/`
- Broken tracker: `components/Atlas3DTrackerEnhanced.tsx`
- Wrapper: `components/Atlas3DTrackerWrapper.tsx`
- Page: `app/page.tsx`

### Key Data Files

- Trajectory data: `/Users/kfitz/3iatlas/public/data/trajectory_static.json`
- Timeline events: `/Users/kfitz/3iatlas/public/data/timeline_events.json`

---

## Success Criteria

1. ✅ Site loads at <http://localhost:3030>
2. ✅ All Printify products display correctly
3. ❌ 3D tracker renders without errors
4. ❌ Browser console shows no React reconciler errors
5. ❌ Can see Sun, planets, and comet in 3D view
6. ❌ Can interact with OrbitControls (rotate, zoom, pan)
7. ❌ Playback controls work (play/pause, speed)
8. ❌ View mode toggle works (Explorer, True Scale, Ride With ATLAS)

**Currently: 2/8 criteria met**

---

## Priority Order

1. **Task 2** - Try different R3F versions (most likely to work)
2. **Task 5** - Simplify component (good for debugging)
3. **Task 6** - Use iframe embed (guaranteed to work, but not ideal)
4. **Task 1** - Revert versions (only if everything else fails)

---

## Notes for Next Developer

- The Printify integration MUST NOT be broken - it's already working
- The site structure is correct - don't change `app/page.tsx` layout
- The data files are correct and loading - don't regenerate them
- The issue is ONLY the React reconciler compatibility
- If you get stuck, the iframe solution (Task 6) will definitely work

---

## Contact Points

- Dev server runs on: <http://localhost:3030>
- Source tracker works on: <http://localhost:5173> (when running Vite project)
- Browser console errors are the key diagnostic tool

---

Generated: 2025-01-22 16:30 PST
Last updated by: Claude (Sonnet 4.5)
