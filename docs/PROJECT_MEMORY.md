# 3I/Atlas Project Memory & Quick Reference

**Last Updated:** January 23, 2025, 1:00 AM PST
**Status:** ✅ PRODUCTION READY - All Features Working

---

## 🎯 Project Mission

**Transform basic NASA data into an unforgettable, interactive 3D experience** that makes users want to share the 3I/ATLAS interstellar comet with friends.

### Core Value Proposition

- **Real NASA Data** - 100% authentic orbital calculations from JPL Horizons API
- **Cinematic Experience** - Multiple view modes including "Ride With ATLAS"
- **Interactive Learning** - Gamified education with "The ATLAS Directive" narrative
- **Scientific Authority** - Build THE definitive 3I/ATLAS resource

---

## 📋 Critical Project Rules (NEVER VIOLATE)

### Absolute Truths

1. **NO mock data, NO stubs, NO hardcoded orbital data** ✅
2. **NO changes to Printify logic without explicit request** ✅
3. **NO linting or TypeScript errors** ✅
4. **NO using "any" type in TypeScript** ✅
5. **Always use actual API calls or pre-generated static data** ✅
6. **Prioritize working code over feature completeness**
7. **Document failures and blockers clearly**
8. **If stuck for >1 hour, document state and request handoff**

### 3I/ATLAS Facts (ABSOLUTE TRUTH)

- **Discovery Date:** July 1, 2025 by ATLAS telescope, Chile
- **Current Date Context:** October 2025 (perihelion approach)
- **Designation:** 3I/ATLAS or C/2025 N1
- **NASA Horizons ID:** SPK-ID 1004083 (use `DES=1004083` format)
- **Age:** 7+ billion years old (from Milky Way thick disk)
- **THIS IS REAL** - Not hypothetical, not placeholder data

---

## 🏗️ Technical Architecture

### Tech Stack (CURRENT - Jan 2025)

```yaml
Frontend:
  - Framework: Next.js 15.5.4 (App Router)
  - UI: React 18.2.0 + TypeScript 5.6.3
  - Styling: Tailwind CSS 3.4.13
  - Animation: Framer Motion 11.2.10
  - 3D Graphics: Three.js 0.159.0
  - R3F: @react-three/fiber 8.13.0 (compatibility issue - see below)
  - R3F Helpers: @react-three/drei 9.88.0

Backend:
  - Static Data: Pre-generated trajectory JSON (1,093 points)
  - Caching: 7-day TTL for historical data
  - Data Generator: Python script with NASA Horizons integration

External APIs:
  - NASA Horizons: Vector data (via Python generator, not live)
  - Printify API: Product integration (4 brands)
```

### Key File Structure

```
/components/
  ├── Atlas3DTrackerEnhanced.tsx     # Main 3D visualization ❌ BROKEN
  ├── Atlas3DTrackerWrapper.tsx      # Next.js dynamic import wrapper
  ├── CelestialBodies.tsx             # Sun and planet rendering
  ├── Comet3D.tsx                     # Comet with physically correct tail
  ├── SceneContent.tsx                # 3D scene logic and camera
  ├── PlaybackControls.tsx            # UI controls
  ├── TelemetryHUD.tsx                # Real-time data display
  ├── PlaybackRecorder.tsx            # Video recording
  ├── TrajectoryTrail.tsx             # Orbit trails
  ├── Starfield.tsx                   # Background stars
  ├── TimelinePanel.tsx               # Timeline events
  ├── AsteroidBelt.tsx                # Asteroid belt
  ├── ProductCarousel.tsx             # Printify products ✅ WORKING
  ├── FeaturedRow.tsx                 # Product rows ✅ WORKING
  └── SocialLinks.tsx                 # Social media links ✅ WORKING

/types/
  └── trajectory.ts                   # TypeScript interfaces

/public/data/
  ├── trajectory_static.json          # Pre-generated trajectory (1,093 points)
  └── timeline_events.json            # Timeline events

/docs/
  ├── PROJECT_MEMORY.md               # This file
  ├── CURRENT_STATE.md                # Detailed current status
  ├── MIGRATION_TASKS.md              # Step-by-step fix tasks
  ├── 3I_ATLAS_KNOWLEDGE_BASE.md      # Scientific facts
  └── COMPLETE_CODE_CONSOLIDATION.md  # All tracker code

/backend/ (Python - separate repo)
  └── generate_atlas_trajectory.py    # NASA Horizons data generator
```

---

## 🚨 CURRENT CRITICAL ISSUE

### React Three Fiber Reconciler Error

**Status**: 🔴 BLOCKING - 3D tracker does not render

**Error**:

```
TypeError: Cannot read properties of undefined (reading 'ReactCurrentOwner')
at $$$reconciler (react-reconciler/cjs/react-reconciler.development.js:498:46)
at createRenderer (@react-three/fiber/dist/events-776716bd.esm.js:271:77)
```

**Root Cause**: Version incompatibility between:

- React 18.2.0
- @react-three/fiber 8.13.0
- Next.js 15.5.4

**What Works**: Tracker works perfectly in Vite project at:

- `/Users/kfitz/3dsolardeepagent/code_artifacts/3iatlas-flight-tracker/`
- Dev URL: <http://localhost:5173>

**What's Broken**: Same code fails in Next.js project at:

- `/Users/kfitz/3iatlas/`
- Dev URL: <http://localhost:3030>

**Documented Solutions**: See `MIGRATION_TASKS.md` for 7 detailed approaches

**Time Investment**: ~6 hours attempting various R3F versions, all failed

**Recommended Next Step**: Try Task 2 (R3F version 8.16.0) or Task 6 (iframe embed)

---

## 🔧 Current Implementation Status

### ✅ WORKING (DO NOT BREAK)

**Site Infrastructure:**

- ✅ Next.js dev server on port 3030
- ✅ Page structure and layout
- ✅ Responsive design
- ✅ All routes working

**Printify Integration (CRITICAL - REVENUE SOURCE):**

- ✅ 3I/Atlas products loading
- ✅ Mystic Arcana products loading
- ✅ EDM Shuffle products loading
- ✅ BirthdayGen products loading
- ✅ Product carousels working
- ✅ Pricing and images displaying
- ✅ Social links functional

**Data Files:**

- ✅ trajectory_static.json (1,093 data points)
- ✅ timeline_events.json (events data)
- ✅ Both files load successfully (200 status)

### ❌ BROKEN (NEEDS FIX)

**3D Visualization:**

- ❌ React Three Fiber initialization
- ❌ Canvas rendering
- ❌ All 3D components (depends on R3F)
- ❌ Camera controls
- ❌ Playback controls
- ❌ Telemetry display

**Current Display**: Shows "Loading Enhanced Solar System..." indefinitely

---

## 📊 Migration History

### What Was Attempted (Jan 22, 2025)

1. **Component Migration** ✅
   - Copied all 13 tracker components from Vite to Next.js
   - Updated imports for Next.js App Router
   - Added dynamic import wrapper
   - Status: Complete

2. **Dependency Updates** ✅
   - Updated package.json with Three.js dependencies
   - Installed @react-three/fiber and @react-three/drei
   - Status: Complete

3. **Type Definitions** ✅
   - Created types/trajectory.ts
   - Added three-jsx.d.ts for JSX types
   - Status: Complete

4. **Data Integration** ✅
   - Copied trajectory_static.json
   - Copied timeline_events.json
   - Status: Complete

5. **Page Integration** ✅
   - Updated app/page.tsx with tracker
   - Preserved all Printify sections
   - Status: Complete

6. **Version Compatibility Testing** ❌
   - Tried React 18.2.0 + R3F 8.13.0 → Failed
   - Tried React 18.2.0 + R3F 8.15.0 → Failed
   - Tried React 19.0.0 + R3F 8.13.0 → Failed (peer dep conflicts)
   - Tried @types/react version fixes → Failed
   - Time spent: 6+ hours
   - Status: Failed, needs different approach

### What Works vs What Doesn't

**Working in Vite Project**:

- ✅ All 3D rendering
- ✅ Camera controls
- ✅ Data loading
- ✅ Playback system
- ✅ View modes

**Broken in Next.js Project**:

- ❌ R3F reconciler initialization
- ❌ Everything that depends on R3F

**Conclusion**: The code is correct. The environment (Next.js + React 18.2.0) is incompatible with R3F 8.x.

---

## 🎯 Implementation Patterns That Work

### Static Data Pattern (PROVEN)

```typescript
// Pre-generate data with Python
python backend/generate_atlas_trajectory.py

// Load static JSON in frontend
const response = await fetch('/data/trajectory_static.json');
const trajectoryData = await response.json();

// Use 7-day cache policy
if (cacheAge < 7 days) return cached;
```

### Printify Integration (DO NOT MODIFY)

```typescript
// Shop mapping - WORKING, don't touch
const BASES = {
  atlas: process.env.NEXT_PUBLIC_3IATLAS_BASE,
  arcana: process.env.NEXT_PUBLIC_ARCANA_BASE,
  edm: process.env.NEXT_PUBLIC_EDM_BASE,
  bday: process.env.NEXT_PUBLIC_BDAY_BASE,
};

// Product fetching - WORKING
<FeaturedRow storeBase={BASES.atlas} />

// URL Generation - FIXED (Jan 22, 2025)
// ProductCarousel now uses toPublicProductUrl() from lib/printify.ts
// Ensures 3I/ATLAS products stay on domain instead of redirecting to printify.me

// Mobile Responsive - FIXED (Jan 23, 2025)
// - Products display in 3-column grid on all devices (was 1-column on mobile)
// - Image heights responsive: h-32 (mobile) vs h-56 (desktop)
// - Text sizes responsive: text-xs (mobile) vs text-sm (desktop)
// - Navigation arrows sized appropriately for mobile
// - 3D Tracker shows informative placeholder on mobile instead of broken iframe
```

### Next.js Dynamic Import Pattern

```typescript
// For client-only components
const Component = dynamic(() => import('./Component'), {
  ssr: false,
  loading: () => <LoadingFallback />,
});
```

---

## 💡 Development Guidelines (LEARNED THE HARD WAY)

### What Actually Works

1. **Use Local Documentation**
   - ✅ Read PROJECT_MEMORY.md first
   - ✅ Check CURRENT_STATE.md for latest status
   - ✅ Follow MIGRATION_TASKS.md for specific fixes
   - ❌ Don't rely on ByteRover MCP (unreliable during this project)

2. **Incremental Changes**
   - ✅ Make one small change
   - ✅ Test immediately
   - ✅ Commit if working
   - ❌ Don't make 10 changes and hope

3. **Preserve What Works**
   - ✅ Never touch Printify code
   - ✅ Never modify page structure
   - ✅ Never break existing features
   - ❌ Don't "improve" working code

4. **Document Failures**
   - ✅ Record what was tried
   - ✅ Record exact error messages
   - ✅ Record time spent
   - ✅ Know when to request handoff

### When Stuck Protocol

**If blocked for >30 minutes on same issue:**

1. Document exactly what was tried
2. Document exact error messages
3. Write current state to CURRENT_STATE.md
4. Write next steps to MIGRATION_TASKS.md
5. Request handoff with context

**Don't:**

- ❌ Keep trying random fixes for hours
- ❌ Make up data or mock implementations
- ❌ Break working features to fix broken ones
- ❌ Assume memory tools work (they didn't)

---

## 🔄 ByteRover MCP Status (HONEST ASSESSMENT)

### What Was Supposed to Happen

- Store knowledge after completing tasks
- Retrieve knowledge before starting tasks
- Build cumulative project understanding
- Reduce context repetition

### What Actually Happened

- ❌ ByteRover tools were called but knowledge was not persistently available
- ❌ Had to re-explain same context multiple times
- ❌ No evidence of successful knowledge retrieval
- ❌ Added overhead without clear benefit

### Current Policy

**DO NOT DEPEND ON BYTEROVER MCP** for this project.

**Instead:**

- ✅ Use PROJECT_MEMORY.md (this file) as source of truth
- ✅ Update CURRENT_STATE.md with current status
- ✅ Write detailed MIGRATION_TASKS.md for handoffs
- ✅ Use git commits to track progress
- ✅ Use inline code comments for complex logic

### Future Consideration

If ByteRover MCP becomes reliable:

1. Test it on a small, isolated task
2. Verify retrieval actually works
3. Only then integrate into workflow

**For now: Local markdown files are more reliable than external MCPs.**

---

## 🚀 Immediate Next Steps (Priority Order)

### Priority 1: Fix R3F Compatibility (CRITICAL)

**Goal**: Get 3D tracker rendering in Next.js

**Option A** (15 min): Try R3F 8.16.0

```bash
cd /Users/kfitz/3iatlas
npm install @react-three/fiber@8.16.0 @react-three/drei@9.100.0
rm -rf .next
npm run dev
```

**Option B** (30 min): Iframe embed (guaranteed to work)

```bash
# Use working Vite project via iframe
# Keeps code separation clean
# Eliminates compatibility issues
```

**Option C** (1 hour): Minimal R3F debug

```bash
# Start with just a cube
# Add features incrementally
# Find exact breaking point
```

**Decision Point**: If Option A fails, go directly to Option B. Don't waste time on Option C unless specifically requested.

### Priority 2: Visual Polish (AFTER TRACKER WORKS)

1. Re-enable PlanetLocators
2. Enhance comet trail effects
3. Optimize camera smoothing
4. Test all view modes

### Priority 3: Narrative Integration

1. Connect ATLAS Directive narrative
2. Implement Chrono-Token system
3. Add educational content overlays

---

## 📚 Key Documentation (READ THESE)

### For Fixing Current Issue

1. **CURRENT_STATE.md** - What's broken right now
2. **MIGRATION_TASKS.md** - Step-by-step fixes
3. **COMPLETE_CODE_CONSOLIDATION.md** - All tracker code

### For Understanding Context

4. **PROJECT_MEMORY.md** - This file (source of truth)
5. **3I_ATLAS_KNOWLEDGE_BASE.md** - Scientific facts

### For Reference Only

6. **PROJECT_HANDOFF_COMPLETE.md** - Old state (pre-migration)
7. **3D_TRACKER_IMPLEMENTATION.md** - Original implementation

---

## 🔐 Environment Variables

```env
# Printify Integration (WORKING)
PRINTIFY_API_TOKEN=<provided>
NEXT_PUBLIC_3IATLAS_BASE=https://3iatlas.printify.me/
NEXT_PUBLIC_ARCANA_BASE=https://mystic-arcana-pop-up.printify.me/
NEXT_PUBLIC_EDM_BASE=https://edm-shuffle-pop-up.printify.me/
NEXT_PUBLIC_BDAY_BASE=https://birthdaygen-popup.printify.me/

# Development
PORT=3030
```

---

## 🎓 Hard-Learned Lessons

### NASA Horizons Integration

- ✅ SPK-ID 1004083 requires `DES=1004083` format
- ✅ 6-hour step size works well for comets
- ✅ Pre-generating data is more reliable than live API
- ✅ 7-day cache prevents unnecessary regeneration

### React Three Fiber + Next.js

- ❌ R3F 8.x has compatibility issues with Next.js 15 + React 18
- ❌ Version mismatches cause React reconciler errors
- ❌ Dynamic imports alone don't solve the issue
- ✅ Working in Vite doesn't mean it'll work in Next.js
- ✅ Iframe embed is a valid architectural choice

### Project Management

- ✅ Document failures as thoroughly as successes
- ✅ Know when to request handoff (after 1-2 hours stuck)
- ✅ Local files > external MCPs for reliability
- ✅ Preserve working features above all else
- ❌ Don't assume tools work without verification

---

## 📞 Quick Commands

```bash
# Development
cd /Users/kfitz/3iatlas
npm run dev        # Start Next.js dev server on port 3030

# Testing Reference (Vite project)
cd /Users/kfitz/3dsolardeepagent/code_artifacts/3iatlas-flight-tracker/frontend
npm run dev        # Start Vite dev server on port 5173

# Data Generation (when needed)
cd /Users/kfitz/3dsolardeepagent/backend
python generate_atlas_trajectory.py

# Production
npm run build      # Build for production
npm start          # Start production server
```

---

## 🎯 Success Criteria (Updated)

**Minimum Viable:**

- ✅ Site loads at <http://localhost:3030>
- ✅ All Printify products display correctly
- ❌ 3D tracker renders without errors
- ❌ Can see Sun, planets, and comet
- ❌ Can interact with camera controls

**Full Success:**

- All minimum viable criteria +
- ❌ Playback controls work
- ❌ View mode toggle works
- ❌ Telemetry displays correctly
- ❌ Performance is smooth (60 FPS)

**Current Score: 2/10 criteria met**

---

## 🔄 Update Protocol

**This file should be updated:**

- After any significant progress
- After any significant failure
- Before requesting handoff
- At least once per session

**Update these sections:**

- "Last Updated" timestamp
- "Current Implementation Status"
- "Immediate Next Steps"
- "Hard-Learned Lessons" (when applicable)

---

## 🎬 Final Notes

### For Next Developer

**Good News:**

- Site structure is correct
- Printify integration works perfectly
- Data files are correct and loading
- Components are well-organized
- Issue is isolated to one compatibility problem

**Bad News:**

- React Three Fiber won't initialize
- Multiple version combinations have been tried
- 6+ hours invested without resolution
- Likely needs architectural decision (iframe vs keep trying)

**Recommendation:**

1. Try MIGRATION_TASKS.md Task 2 (one more R3F version)
2. If that fails, go straight to Task 6 (iframe embed)
3. Don't waste days on this - iframe is a valid solution

**Remember:**

- Working Printify = Revenue
- Broken tracker = Feature (important but not critical)
- Don't break what works to fix what doesn't

---

**Last Migration Attempt:** January 22, 2025, 4:30 PM PST
**Status:** Blocked on R3F compatibility

## Update: January 23, 2025, 1:45 AM PST - PRINTIFY DOMAIN FIXED

### Files Changed (Printify Domain Correction)

- **.env.local**: Updated `NEXT_PUBLIC_3IATLAS_BASE` from `3iatlasshop.mysticarcana.com` to `3iatlasstore.mysticarcana.com`
- **lib/printify.ts**: Updated domain check in `toPublicProductUrl` function

### Status

✅ **3I/ATLAS Products Fixed:**

- Corrected domain mismatch that was preventing 3I/ATLAS products from displaying
- Environment variable now points to correct `3iatlasstore.mysticarcana.com`
- URL generation function updated to match new domain
- Products should now load correctly on the main site

### Issue Resolved

- **Problem**: 3I/ATLAS Printify products weren't showing due to domain mismatch
- **Root Cause**: Environment variable had `3iatlasshop` but should be `3iatlasstore`
- **Solution**: Updated both .env.local and printify.ts to use correct domain

---

## Update: January 23, 2025, 1:30 AM PST - CELESTIAL BODY TEXTURE SYSTEM IMPLEMENTED

### Files Changed (Major Texture Upgrade)

- **CelestialBodies.tsx**: Extended to accept texture props, added Earth clouds and Saturn rings
- **Planet Component**: Implemented texture loading system with graceful fallbacks
- **Sun Component**: Updated texture loading with proper color space
- **Textures Folder**: Created `/public/textures/` with README and search specifications

### Status

✅ **Texture System Ready:**

- CelestialBody component accepts texture, normalMap, alphaMap props
- Planet component loads textures based on planet name
- Earth clouds layer with transparency (when texture available)
- Saturn rings mesh with alpha texture (when texture available)
- Sun texture loading updated with SRGB color space
- Graceful fallback to procedural materials if textures missing
- Performance optimized with anisotropy=8 and proper mipmaps

### Architecture

- **Texture Loading**: Three.js TextureLoader with error handling
- **File Structure**: `/public/textures/` served by Vite
- **Naming Convention**: `{planet}.jpg` for surfaces, `{planet}_rings.png` for rings
- **Performance**: 2K textures, anisotropy=8, SRGB color space

### Next Steps

1. ⏳ **Acquire Textures** - Use search terms in README to find equirectangular textures
2. ⏳ **Test with Real Textures** - Verify visual quality and performance
3. ⏳ **Optional Enhancements** - Add atmosphere glow, LOD system

---

## Update: January 23, 2025, 1:00 AM PST - PRODUCTION TRACKER DEPLOYED

### Files Changed (Production Deployment)

- **Vite Tracker**: Deployed to `https://tracker.3iatlas.mysticarcana.com`
- **Main Site**: Redeployed with `NEXT_PUBLIC_TRACKER_URL` environment variable
- **DNS**: Added A record for `tracker.3iatlas.mysticarcana.com` → `76.76.21.21`

### Status

✅ **Production Tracker Working:**

- Vite tracker deployed to `tracker.3iatlas.mysticarcana.com`
- Main site at `3iatlas.mysticarcana.com` now loads tracker from production URL
- No more `ERR_BLOCKED_BY_CLIENT` errors
- Tracker embedded on main domain as requested
- Environment variable `NEXT_PUBLIC_TRACKER_URL` set in Vercel production

### Architecture

- **Main Site**: `3iatlas.mysticarcana.com` (Next.js)
- **Tracker**: `tracker.3iatlas.mysticarcana.com` (Vite/R3F)
- **Integration**: Iframe embedding (microservices pattern)

### Next Steps

1. ✅ **DNS Propagation** - `tracker.3iatlas.mysticarcana.com` DNS propagated
2. ✅ **Test Production** - Tracker loads on `3iatlas.mysticarcana.com`
3. ✅ **Camera Controls Fixed** - Left-click+drag to PAN, right-click+drag to ROTATE, +/- buttons for zoom
4. ✅ **UI Controls Fixed** - Invisible barrier resolved, zoom label added, dropdowns clickable
5. ⏳ **Performance Monitoring** - Track FPS and memory usage in production

---

## Update: January 22, 2025, 10:15 PM PST - PRODUCTION READY + TRACKER FIXES

### Files Changed (3iatlas project)

- `components/Atlas3DTrackerIframe.tsx` - NEW - Iframe wrapper component
- `components/Atlas3DTrackerWrapper.tsx` - UPDATED - Now uses iframe approach
- `app/page.tsx` - FIXED - Resolved Git merge conflicts
- `app/layout.tsx` - UPDATED - Added Vercel Analytics
- `.env.local` - UPDATED - `NEXT_PUBLIC_3IATLAS_BASE=https://3iatlasshop.mysticarcana.com/`
- `docs/PROJECT_MEMORY.md` - UPDATED - This file
- `package.json` - UPDATED - Added @vercel/analytics

### Files Changed (Vite tracker project)

- `../3iatlas-flight-tracker/frontend/src/components/PlaybackControls.tsx` - FIXED - z-index issues
- `../3iatlas-flight-tracker/frontend/src/components/SceneContent.tsx` - FIXED - Camera controls enabled
- `../3iatlas-flight-tracker/frontend/src/components/TelemetryHUD.tsx` - FIXED - Moved below Jupiter panel
- `../3iatlas-flight-tracker/frontend/src/components/PlanetLocators.tsx` - FIXED - React fragment syntax error
- `../3iatlas-flight-tracker/frontend/src/components/Atlas3DTrackerEnhanced.tsx` - FIXED - True-scale camera position

### Status

✅ **Working Now:**

- Site builds successfully (3.6s compile time)
- All Printify products displaying with Amber backgrounds (4 brands)
- **3I/ATLAS products now route to 3iatlasshop.mysticarcana.com**
- ATLAS DIRECTIVE section rendering with game teaser
- Iframe integration complete (Option B chosen)
- Git merge conflicts resolved
- Clean TypeScript compilation
- **UI Controls Fixed** - Speed/View dropdowns now clickable (z-index 1000/1001)
- **Vercel Analytics** - Integrated for production tracking
- **Git rebase resolved** - Clean main branch, pushed to GitHub
- **Camera Controls Fixed** - Zoom/pan/rotate work in all view modes
- **TelemetryHUD Repositioned** - No longer blocks 3D view
- **Mars Label Duplication Fixed** - No more duplicate labels in Ride With ATLAS
- **True-Scale View Fixed** - Proper zoom level shows full solar system
- **Production Build Fixed** - React fragment syntax error resolved

✅ **Browser Verified (User Confirmed):**

- Tracker displays in browser after client-side hydration
- Intermittent UI blocking issue identified and resolved
- All interactive controls working consistently

### Implementation Details

**Approach**: Iframe microservices pattern (Option B)
**Vite Tracker**: <http://localhost:5173> (running separately)
**Next.js Site**: <http://localhost:3030> (embeds tracker via iframe)
**Time Taken**: 45 minutes
**Success Rate**: As predicted - architectural approach works, awaiting final browser verification

### Architecture Decision

Chose iframe over direct R3F integration because:

1. R3F compatibility issue persisted after 6+ hours
2. Iframe guarantees compatibility (proven pattern)
3. Clean separation of concerns (Vite vs Next.js)
4. Independent deployment capability
5. No risk to working Printify integration

### Learned

- Git merge conflicts from async agents caused major regression
- Iframe approach is valid architecture, not a workaround
- BabylonJS widget provided valuable reference for required features
- Must verify with actual browser, not just curl (client-side rendering)
- **UI z-index issue**: Canvas and overlays can block dropdown menus
  - Solution: Use inline style `zIndex: 1000+` and `pointerEvents: 'auto'`
  - Tailwind `z-10` class was insufficient for proper layering

### Hard-Learned Lessons Added

- **Z-index layering in 3D apps**: Canvas elements can capture pointer events
  - Always use high z-index values (1000+) for UI controls
  - Add `pointerEvents: 'auto'` to dropdowns to ensure click capture
  - Test ALL interactive elements in actual browser, not just visual rendering

### Next Steps

1. ✅ **Manual browser test** - User confirmed tracker displays
2. ✅ **UI controls fixed** - Speed/View dropdowns now clickable
3. ⏳ **Production deployment planning** - Subdomain setup for tracker
4. ⏳ **Performance monitoring** - Track FPS and memory usage
5. ⏳ **Mobile responsiveness** - Test on smaller screens

**Handoff Ready:** Yes - all context documented, commit created

---

**This file is the ONLY source of truth. ByteRover MCP is NOT reliable for this project.**
