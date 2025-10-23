# Planet Integration Plan — 3I/ATLAS Camera Views

Status: Planning document (no code changes yet)

## Context (Verified)
- Working 3D: Vite tracker (R3F) embedded via iframe in Next.js
- Data sources exist: `SOLAR_SYSTEM_OBJECTS`, `fetchSolarSystemData` in `lib/solar-system-data.ts`
- Active views: "true-scale", "ride-atlas" (Explorer commented out)
- Default speed: 10x; keep Printify intact; no mock data; strict TS

## Decision Framework
- Primary path: Add planets using existing NASA Horizons infrastructure
- Phased approach: Start with 3 inner planets (Mercury, Venus, Earth) for performance safety
- Guardrails: Feature branch, staging-first, visual verification, rollback ready

## Phases & Acceptance Criteria

### Phase 1 — Core Infrastructure (1-2 hours)
Goal: Create texture loading hook and basic planet rendering for 3 inner planets.

Steps:
1) Create `hooks/usePlanetTextures.ts` with fallback to `/textures/default.jpg`
2) Verify texture files exist: `/textures/mercury.jpg`, `/textures/venus.jpg`, `/textures/earth_diffuse.jpg`
3) Update `CelestialBodies.tsx` to render Mercury, Venus, Earth using `SOLAR_SYSTEM_OBJECTS`
4) Update `Atlas3DTrackerEnhanced.tsx` to load planet data via `fetchSolarSystemData`

Acceptance Criteria:
- Planets render without errors; texture fallbacks work; no crashes

### Phase 2 — View Mode Integration (1-2 hours)
Goal: Ensure planets visible in both "ride-atlas" and "true-scale" modes.

Steps:
1) Add view mode scaling to `SceneContent.tsx` (smaller planets in ride-atlas mode)
2) Implement camera offset calculations: planets visible at +30° elevation during comet following
3) Test camera transitions between view modes

Acceptance Criteria:
- Planets visible as reference points in ride-atlas mode
- Full solar system view in true-scale mode
- Smooth camera transitions

### Phase 3 — Performance Testing & LOD (2-3 hours)
Goal: Maintain 60 FPS target with LOD rendering system.

Steps:
1) Add distance-based LOD to planet geometry (16-32 segments based on camera distance)
2) Test frame rate with 3 planets (target: 60 FPS)
3) Monitor GPU memory usage (< 128MB), draw calls (< 20), texture memory (< 32MB)
4) Test memory stability over 5+ minutes; test texture loading without crashes

Acceptance Criteria:
- 60 FPS maintained; no console errors; smooth performance; no memory leaks

### Phase 4 — Expansion (Conditional - 2-4 hours)
Goal: Add remaining planets if performance allows.

Steps:
1) Expand to Mars, Jupiter, Saturn (Phase 4A)
2) Add Uranus, Neptune, Pluto (Phase 4B) if performance allows
3) Implement visibility-based rendering:
   - Inner planets (Mercury, Venus, Earth, Mars): opacity 1.0, emissive 0.1
   - Gas giants (Jupiter, Saturn): opacity 0.9, emissive 0.05
   - Outer planets (Uranus, Neptune, Pluto): opacity 0.6, emissive 0.02

Acceptance Criteria:
- All planets render without performance degradation
- Visual hierarchy maintained (inner planets prominent)
- Performance still meets 60 FPS target

## Risks & Mitigations
- Performance: LOD system, start with 3 planets, monitor FPS
- Texture loading: Fallback to default.jpg prevents crashes
- Camera conflicts: Relative positioning offsets in ride-atlas mode
- Scope creep: Keep Explorer disabled, only maintain existing view modes

## Rollback Plan
- Immediate: Feature flag to disable planets
- Structural: Revert branch; `vercel rollback` to known-good deployment

## Branch & Deploy Protocol (Mandatory)
- Work on `feature/planet-integration`
- Staging first; provide clickable links; wait for approval
- Production only after approval; document in `PROJECT_MEMORY.md`

## Evidence Checklist (per phase)
- Code diffs with before/after snippets
- Screenshots or short clips (staging) showing working state
- Notes: FPS, memory, console output
- Performance metrics: GPU memory, draw calls, texture memory
- Visual regression testing between view modes

## Success Criteria (Go/No-Go)
- Technical: Planets render without errors; 60 FPS maintained; no crashes
- UX: Planets visible in both view modes; smooth camera transitions
- Performance: Stable memory usage; no frame rate drops

## Out of Scope (for this implementation)
- Re-enabling Explorer view (textures incomplete)
- Adding new view modes not already present
- Real-time orbital mechanics (using static positions)

## Performance Benchmarks
- **GPU Memory**: < 128MB for 3 planets, < 256MB for 9 planets
- **Draw Calls**: < 20 for 3 planets, < 50 for 9 planets
- **Texture Memory**: < 32MB for 3 planets, < 64MB for 9 planets
- **Frame Rate**: 60 FPS target maintained
- **Memory Stability**: No leaks over 5+ minute sessions

## Files to Modify
1) `hooks/usePlanetTextures.ts` (new)
2) `components/CelestialBodies.tsx` (add planet rendering)
3) `components/Atlas3DTrackerEnhanced.tsx` (add planet data loading)
4) `components/SceneContent.tsx` (add view mode scaling)

---

# 3I/ATLAS Scientific Evolution Plan — R3F Implementation

## Context (Verified)
- Current: Static comet visualization with basic nucleus/coma/tail
- Desired: Three-stage scientific evolution (July 1 → October 2 → October 23, 2025)
- Scientific basis: JWST/Hubble observations with refined measurements
- Performance target: Maintain 60 FPS with enhanced visual complexity

## Phases & Implementation

### Phase 1: Core Stage System (2-3 hours)
**Goal**: Implement stage-based comet rendering with scientific accuracy

**Files to Create/Modify**:
1) `lib/comet-stages.ts` - Stage data structure with scientific measurements
2) `components/Comet3D.tsx` - Add stage prop and conditional rendering
3) `components/CometStages/` - Individual stage components (Nucleus, Coma, DustTail, AntiTail, SunPlume, Filaments)

**Acceptance Criteria**:
- Three distinct visual stages render without errors
- Scientific measurements accurately scaled
- Stage switching via props works correctly

### Phase 2: UI Controls & Integration (2-3 hours)
**Goal**: Add stage selector and URL parameter support

**Files to Modify**:
1) `components/PlaybackControls.tsx` - Add stage selector dropdown
2) `components/Atlas3DTrackerEnhanced.tsx` - Pass stage to Comet3D
3) `App.tsx` - URL parameter reading for stage selection

**Acceptance Criteria**:
- Stage selector dropdown functional
- URL parameters control initial stage
- Smooth integration with existing controls

### Phase 3: Scientific Accuracy & Performance (3-4 hours)
**Goal**: Precise measurements, material tuning, performance optimization

**Enhancements**:
1) Accurate astronomical scaling (km to scene units)
2) Material properties tuning (emissive, metallic, transparency)
3) LOD system for complex geometries
4) Smooth stage transition animations (2-3 seconds)

**Acceptance Criteria**:
- Visual properties match documented observations
- 60 FPS maintained across all stages
- Smooth transitions between stages

### Phase 4: Testing & Validation (2-3 hours)
**Goal**: Comprehensive testing and educational enhancement

**Testing**:
1) Visual verification against scientific specifications
2) Performance testing (FPS, memory, stage switching)
3) Cross-browser compatibility
4) Educational context (tooltips/overlays explaining each stage)

**Acceptance Criteria**:
- All stages scientifically accurate
- Performance targets met
- Educational value enhanced

## Success Criteria
- **Technical**: 60 FPS maintained, no errors, smooth transitions
- **Scientific**: Accurate visual representation of comet evolution
- **Educational**: Clear understanding of 3I/ATLAS activity progression
- **UX**: Intuitive stage selection and exploration

## Timeline: 9-13 hours total
## Branch: `feature/comet-evolution-stages`
## Risk Level: Low-Medium (phased approach with performance monitoring)

---

# Mobile Optimization Plan — Post Planet Integration & Comet Evolution

## Context (Current Status)
- ✅ **Mobile Access Fixed**: Tracker now loads and runs smoothly on mobile devices
- ✅ **Functionality Verified**: All controls work (play/pause, speed, view modes)
- ✅ **Performance Confirmed**: Smooth 60 FPS on mobile devices
- ⚠️ **Layout Issue**: Requires landscape mode and scrolling (extends beyond viewport)

## Mobile Optimization Strategy (Options 2 & 3)

### Option 2: Mobile-Specific Page (Recommended)
**Goal**: Create dedicated mobile experience with optimized layout

#### Phase 1: Mobile Route Setup (2-3 hours)
**Files to Create/Modify**:
1) `app/mobile-tracker/page.tsx` - Dedicated mobile route
2) `components/MobileTrackerLayout.tsx` - Mobile-optimized layout component
3) `components/MobileControls.tsx` - Touch-friendly control interface
4) `middleware.ts` - Mobile detection and routing

**Acceptance Criteria**:
- `/mobile-tracker` route accessible on mobile devices
- Automatic redirect from main tracker on mobile
- Mobile-specific layout loads without errors

#### Phase 2: Mobile UI Optimization (3-4 hours)
**Components to Build**:
1) **Compact Telemetry Panel**: 
   - Collapsible telemetry with essential data only
   - Swipe gestures to expand/collapse
   - Larger touch targets (44px minimum)

2) **Gesture Controls**:
   - Swipe left/right to scrub timeline
   - Pinch to zoom in/out
   - Two-finger pan for camera movement
   - Tap to play/pause

3) **Responsive Layout**:
   - Portrait mode support (vertical stacking)
   - Floating action buttons (FAB) for primary controls
   - Bottom sheet for secondary controls
   - Full-screen 3D view option

**Acceptance Criteria**:
- All controls accessible via touch gestures
- Portrait mode fully functional
- No horizontal scrolling required
- Intuitive mobile-first interface

#### Phase 3: Performance & Polish (2-3 hours)
**Optimizations**:
1) **Mobile-Specific Rendering**:
   - Reduced LOD for mobile GPUs
   - Lower texture resolution for mobile
   - Simplified particle effects
   - Battery optimization (reduce frame rate when backgrounded)

2) **Progressive Enhancement**:
   - Graceful degradation for older devices
   - WebGL fallback detection
   - Touch event optimization
   - Memory management for mobile constraints

**Acceptance Criteria**:
- Smooth performance on mid-range mobile devices
- Battery usage optimized
- No crashes on older devices
- WebGL fallbacks work correctly

### Option 3: Progressive Enhancement (Complementary)
**Goal**: Enhance existing tracker with mobile-specific features

#### Phase 1: Adaptive UI System (2-3 hours)
**Files to Modify**:
1) `components/Atlas3DTrackerEnhanced.tsx` - Add mobile detection
2) `components/PlaybackControls.tsx` - Mobile-responsive controls
3) `hooks/useMobileDetection.ts` - Mobile detection hook
4) `styles/mobile.css` - Mobile-specific styles

**Features**:
1) **Smart Layout Adaptation**:
   - Auto-detect mobile viewport
   - Dynamically adjust control panel size
   - Collapsible telemetry panel
   - Responsive button sizing

2) **Touch Optimization**:
   - Larger touch targets (minimum 44px)
   - Touch-friendly spacing
   - Haptic feedback (where supported)
   - Touch gesture recognition

**Acceptance Criteria**:
- Existing tracker adapts to mobile viewports
- Touch controls work intuitively
- No layout breaking on mobile
- Smooth transitions between orientations

#### Phase 2: Advanced Mobile Features (3-4 hours)
**Enhancements**:
1) **Gesture Integration**:
   - Swipe gestures for timeline scrubbing
   - Pinch-to-zoom for camera control
   - Two-finger rotation for 3D navigation
   - Long-press for context menus

2) **Mobile-Specific Features**:
   - Device orientation lock option
   - Full-screen immersive mode
   - Share functionality (screenshot, current view)
   - Offline mode with cached data

**Acceptance Criteria**:
- Gesture controls feel natural
- Full-screen mode works correctly
- Share functionality operational
- Offline mode functional

## Implementation Priority

### Phase 1: Core Mobile Experience (After Planet Integration)
1. **Mobile-Specific Page** (Option 2, Phase 1-2)
2. **Basic Progressive Enhancement** (Option 3, Phase 1)

### Phase 2: Advanced Mobile Features (After Comet Evolution)
1. **Performance Optimization** (Option 2, Phase 3)
2. **Advanced Gestures** (Option 3, Phase 2)

## Success Criteria
- **Technical**: Smooth 60 FPS on mobile, no crashes, responsive layout
- **UX**: Intuitive touch controls, portrait mode support, no scrolling required
- **Performance**: Battery optimized, memory efficient, works on mid-range devices
- **Accessibility**: Touch-friendly, gesture-based, full-screen options

## Timeline: 12-18 hours total (across both phases)
## Branch: `feature/mobile-optimization`
## Risk Level: Low (mobile-specific features, no breaking changes to desktop)

## Files to Create/Modify (Summary)
1) `app/mobile-tracker/page.tsx` (new)
2) `components/MobileTrackerLayout.tsx` (new)
3) `components/MobileControls.tsx` (new)
4) `hooks/useMobileDetection.ts` (new)
5) `middleware.ts` (modify)
6) `components/Atlas3DTrackerEnhanced.tsx` (modify)
7) `components/PlaybackControls.tsx` (modify)
8) `styles/mobile.css` (new)

## Performance Benchmarks (Mobile)
- **Frame Rate**: 60 FPS on flagship, 30 FPS minimum on mid-range
- **Memory Usage**: < 100MB on mobile devices
- **Battery Impact**: < 5% per 10 minutes of usage
- **Load Time**: < 3 seconds on 3G connection
- **Touch Response**: < 100ms touch-to-visual feedback
