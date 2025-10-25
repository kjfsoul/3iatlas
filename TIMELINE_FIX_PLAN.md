# Timeline Fix Implementation Plan

## Problem Summary

1. **Discrete day indices for camera/telemetry** while meshes are interpolated → visible step at date boundaries (Sep 7/Nov 14 jump)
2. **Synthetic orbit path influencing positions** → Earth appears to complete >1 orbit in a ~274-day window

## Changes Required

### 1. Add Interpolation Helper Functions (DONE ✅)
Added to top of file:
- `mod()` function for safe modulo
- `getInterpolatedSample()` for smooth position interpolation
- `toR3F()` for coordinate conversion

### 2. Update Animation Loop (TO DO)
Replace `framesPerDay` constant with days-per-second calculation:
- Add `accumulator` variable (line 787)
- Replace lines 804-820 with fixed timestep logic
- Use `getInterpolatedSample()` for all position calculations

### 3. Update Camera Modes (TO DO)
Replace all `Math.floor(localIndex)` calls with `getInterpolatedSample()`:
- followComet (lines ~974-1003)
- closeup (lines ~1010-1033)
- marsApproach (lines ~1034-1070)
- rideComet (lines ~1071-1124)

### 4. Update Mesh Position Loop (TO DO)
Replace manual interpolation (lines 840-895) with `getInterpolatedSample()`:
- Use helper function for all object positions
- Remove duplicate interpolation code

### 5. Update Telemetry Display (TO DO)
Use `getInterpolatedSample()` for distance calculations (lines ~1162-1191)

## Git Workflow

✅ Branch created: `fix/timeline-interpolation-fixes`
⏳ Make changes
⏳ Test locally
⏳ Commit with message: "fix: timeline interpolation using days-per-second and single interpolator"
⏳ Push to branch
⏳ Get user approval
⏳ Deploy to staging
⏳ Get final approval
⏳ Merge to main

## Estimated Time

- Coding: 30 minutes
- Testing: 15 minutes
- Total: ~45 minutes
