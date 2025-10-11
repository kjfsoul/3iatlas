# 3D Tracker Testing Checklist
**Date:** October 9, 2025  
**Server:** http://localhost:3030  
**Status:** ✅ Ready for Testing

---

## Pre-Test Setup

### 1. Open Browser Console
Press `F12` or `Cmd+Option+I` to open DevTools

### 2. Check Initial Health
```javascript
window.__AE_HEALTH__
```
**Expected:** `{ fps: undefined, nanFrames: 0, clippedFrames: 0, fpsDrops: 0, lastSanitizeFailAt: 0 }`

### 3. Monitor Console
Watch for:
- ❌ **Red errors** (should be NONE)
- ⚠️ **Yellow warnings** (acceptable: Printify cache warning)
- ℹ️ **Blue logs** (data loading, view changes)

---

## View 1: Historical Flight Path ✅

**URL:** http://localhost:3030 (default view)

### Visual Checks
- [ ] Timeline scrubber visible at bottom
- [ ] Date range: July 1 - Oct 8, 2025
- [ ] Play/Pause button present
- [ ] Speed controls (1x, 5x, 10x, etc.)
- [ ] Green comet trail visible
- [ ] Planets visible and moving

### Interaction Tests
1. **Play/Pause**
   - [ ] Click Play - comet should animate along trail
   - [ ] Click Pause - animation stops
   - [ ] Timeline slider moves with playback

2. **Speed Control**
   - [ ] Change speed to 10x - animation speeds up
   - [ ] Change speed to 1x - animation slows down
   - [ ] No stuttering or freezing

3. **Timeline Scrubbing**
   - [ ] Drag timeline slider - comet jumps to that date
   - [ ] Date display updates in real-time
   - [ ] Trail persists throughout

4. **Camera Controls**
   - [ ] Click and drag - rotate view
   - [ ] Scroll wheel - zoom in/out
   - [ ] Right-click drag - pan view

### Console Checks
```javascript
// Should show FPS around 60
window.__AE_HEALTH__.fps

// Should stay at 0 (no errors)
window.__AE_HEALTH__.nanFrames
```

---

## View 2: Current Moment Super-Lens ✅

**How to Access:** Click "Current Moment" in view selector

### Visual Checks
- [ ] Static snapshot of Oct 8, 2025
- [ ] 3I/ATLAS visible
- [ ] All planets visible (Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune)
- [ ] Star field in background
- [ ] Object labels appear on hover

### Interaction Tests
1. **Camera Rotation**
   - [ ] Drag to rotate around 3I/ATLAS
   - [ ] Can view from all angles
   - [ ] Objects stay in correct positions

2. **Zoom Controls**
   - [ ] Zoom in - see 3I/ATLAS up close
   - [ ] Zoom out - see full solar system
   - [ ] Smooth transitions

3. **Object Selection**
   - [ ] Hover over planets - labels appear
   - [ ] Click planet - focus on that object (if implemented)
   - [ ] Distance info displayed

### Console Checks
```javascript
// Check for any geometry errors
console.log('No NaN geometry errors should appear')
```

---

## View 3: Speed Simulation ✅

**How to Access:** Click "Speed Simulation" in view selector

### Visual Checks
- [ ] 3I/ATLAS in center with green glowing tail
- [ ] Stars moving past (motion blur effect)
- [ ] Velocity vector display
- [ ] Speed readout (km/s or AU/day)
- [ ] Camera rotation ring visible

### Interaction Tests
1. **Camera Rotation**
   - [ ] Rotate camera around comet
   - [ ] View from front, back, sides
   - [ ] Tail always points away from Sun

2. **Motion Effects**
   - [ ] Stars streak past
   - [ ] Motion blur visible
   - [ ] Sense of speed conveyed

3. **HUD Display**
   - [ ] Velocity displayed
   - [ ] Distance from Sun
   - [ ] FPS counter visible

### Console Checks
```javascript
// FPS should be stable
window.__AE_HEALTH__.fps

// Check for frame drops
window.__AE_HEALTH__.clippedFrames // Should be 0 or very low
```

---

## View 4: Perihelion Event ✅

**How to Access:** Click "Perihelion Event" in view selector

### Visual Checks
- [ ] Sun visible and bright
- [ ] Solar corona effects
- [ ] 3I/ATLAS approaching Sun
- [ ] Date: Around Oct 28-29, 2025
- [ ] Dramatic lighting/heat effects

### Interaction Tests
1. **Time-Lapse Controls**
   - [ ] Play/Pause button
   - [ ] Time scrubber for perihelion window
   - [ ] Speed controls

2. **Camera Angles**
   - [ ] Sun POV button - view from Sun
   - [ ] Comet POV button - ride with comet
   - [ ] Side view button - see approach from side
   - [ ] Top view button - orbital plane view

3. **Visual Effects**
   - [ ] Solar corona particles
   - [ ] Comet tail intensifies near Sun
   - [ ] Heat/radiation effects
   - [ ] Perihelion alert when closest

### Console Checks
```javascript
// Check particle system performance
window.__AE_HEALTH__.fps // Should stay above 45
```

---

## View 5: Trajectory Plotter ✅

**How to Access:** Click "Trajectory Plotter" in view selector

### Visual Checks
- [ ] Solar system objects in position
- [ ] 3I/ATLAS draggable (green sphere)
- [ ] Green trajectory line
- [ ] Physics dashboard visible (top-left)
- [ ] Scenario buttons (top-right)
- [ ] Instructions panel (bottom-left)

### Interaction Tests
1. **Drag Comet**
   - [ ] Click and drag 3I/ATLAS
   - [ ] Trajectory line updates in real-time
   - [ ] Physics dashboard updates

2. **Physics Dashboard**
   - [ ] Velocity (X, Y, Z) displayed
   - [ ] Energy calculation
   - [ ] Angular momentum
   - [ ] Impact prediction (if on collision course)

3. **Scenario Presets**
   - [ ] Click "Earth Impact" - comet moves toward Earth
   - [ ] Click "Jupiter Slingshot" - comet approaches Jupiter
   - [ ] Click "Mars Flyby" - comet passes Mars
   - [ ] Click "Solar Closeup" - comet heads to Sun

4. **Collision Detection**
   - [ ] Drag comet close to Earth - impact warning appears
   - [ ] Dashboard shows "Time to Impact"
   - [ ] Red warning color

### Console Checks
```javascript
// Check for NaN in trajectory calculations
window.__AE_HEALTH__.nanFrames // Should be 0

// Verify FPS stability during drag
window.__AE_HEALTH__.fps
```

---

## Performance Validation ✅

### FPS Monitoring
Run this in console and let it run for 30 seconds:
```javascript
let fpsLog = [];
let interval = setInterval(() => {
  fpsLog.push(window.__AE_HEALTH__.fps);
  if (fpsLog.length >= 30) {
    clearInterval(interval);
    let avg = fpsLog.reduce((a,b) => a+b, 0) / fpsLog.length;
    console.log('Average FPS:', avg.toFixed(1));
    console.log('Min FPS:', Math.min(...fpsLog).toFixed(1));
    console.log('Max FPS:', Math.max(...fpsLog).toFixed(1));
  }
}, 1000);
```

**Expected:**
- Average FPS: 55-60
- Min FPS: >45
- Max FPS: ~60

### Error Counters
```javascript
console.log('Error Summary:', {
  nanFrames: window.__AE_HEALTH__.nanFrames,
  clippedFrames: window.__AE_HEALTH__.clippedFrames,
  fpsDrops: window.__AE_HEALTH__.fpsDrops
});
```

**Expected:** All counters should be 0 or very low (<5)

---

## Data Quality Validation ✅

### Cache Status
```javascript
// Check historical data cache
let stats = JSON.parse(localStorage.getItem('atlas_historical_data'));
console.log('Cache Stats:', {
  version: stats?.metadata?.version,
  dataPoints: stats?.metadata?.dataPoints,
  validPoints: stats?.metadata?.validPoints,
  validationPercentage: stats?.metadata?.validationPercentage
});
```

**Expected:**
- version: "2.0.0"
- dataPoints: ~400
- validPoints: ~400
- validationPercentage: >95%

### Force Cache Regeneration (Optional)
```javascript
localStorage.removeItem('atlas_historical_data');
location.reload();
// Watch console for regeneration logs
```

---

## Known Issues (Expected)

### ⚠️ Acceptable Warnings
1. **Printify Cache Warning**
   ```
   Failed to set fetch cache https://api.printify.com/v1/shops/24437410/products.json
   [Error: items over 2MB can not be cached (2499159 bytes)]
   ```
   **Status:** Known issue, does not affect 3D tracker

### ❌ Critical Errors (Should NOT Appear)
1. `THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN`
2. `Uncaught TypeError: Cannot read property 'x' of undefined`
3. `RangeError: Maximum call stack size exceeded`
4. Any red errors in console related to 3D rendering

---

## Regression Tests ✅

### Previous Bugs (Should Be Fixed)
- [ ] Sun drifts from origin - **FIXED** (Sun locked at 0,0,0)
- [ ] Camera follow broken - **FIXED** (OrbitControls working)
- [ ] Motion not apparent - **FIXED** (Animation loop active)
- [ ] View switching broken - **FIXED** (All 5 views load)
- [ ] Timeline not working - **FIXED** (Scrubber functional)
- [ ] Play button does nothing - **FIXED** (Playback working)
- [ ] NaN geometry errors - **FIXED** (Validators in place)

---

## Sign-Off Checklist

### Critical (Must Pass)
- [ ] All 5 views load without errors
- [ ] No red errors in console
- [ ] FPS stays above 45 in all views
- [ ] Play/Pause works in Historical view
- [ ] Timeline scrubber functional
- [ ] Camera controls work (drag, zoom, pan)
- [ ] No NaN geometry errors
- [ ] `window.__AE_HEALTH__.nanFrames === 0`

### Important (Should Pass)
- [ ] Trajectory plotter drag works
- [ ] Physics dashboard updates in real-time
- [ ] Perihelion effects visible
- [ ] Speed simulation shows motion
- [ ] Cache validation >95%
- [ ] Average FPS >55

### Nice-to-Have (Bonus)
- [ ] Smooth animations throughout
- [ ] Object labels appear on hover
- [ ] Scenario presets work
- [ ] Impact warnings display correctly

---

## If Something Fails

### Debugging Steps
1. **Check console for errors**
   - Copy full error message
   - Note which view/action triggered it

2. **Check health stats**
   ```javascript
   window.__AE_HEALTH__
   ```

3. **Clear cache and reload**
   ```javascript
   localStorage.clear();
   location.reload();
   ```

4. **Check data source**
   - Look for "Data source: Astronomy Engine" in top-left corner
   - Should NOT say "NASA Horizons"

5. **Report back with:**
   - Which view failed
   - What action triggered the failure
   - Console error messages
   - Health stats at time of failure
   - Screenshot if visual issue

---

## Success Criteria

**READY FOR NARRATIVE GAME if:**
- ✅ All 5 views load
- ✅ No critical errors
- ✅ FPS stable (>45)
- ✅ Play/Pause works
- ✅ Timeline functional
- ✅ No NaN errors

**NEEDS MORE WORK if:**
- ❌ Any view crashes
- ❌ Red errors in console
- ❌ FPS drops below 30
- ❌ NaN geometry errors appear
- ❌ Animation freezes/stutters

---

**Test Duration:** ~15-20 minutes for full validation  
**Priority:** Complete ALL critical checks before moving to narrative game
