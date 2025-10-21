# 3I/ATLAS Project Rules Summary

**Last Updated**: January 22, 2025, 5:10 PM PST
**Purpose**: Complete overview of all project rules and where they live

---

## Rule Files Location

All project rules are in `/Users/kfitz/3iatlas/.cursor/rules/`

### Rule Files (In Priority Order)

1. **`00-project-core.mdc`** ⭐ MOST IMPORTANT
   - Core project rules
   - Memory system (NO ByteRover MCP)
   - Current status (what's working vs broken)
   - Absolute rules (never violate)
   - Before/during/after work protocols
   - **Read this FIRST every session**

2. **`01-development-workflow.mdc`**
   - Proven development patterns
   - Step-by-step workflow
   - Testing protocols
   - 30-minute stuck rule
   - Commit discipline
   - Based on actual project experience

3. **`02-technical-constraints.mdc`**
   - Technical stack details
   - Known compatibility issues
   - Architecture patterns
   - Performance requirements
   - Environment variables
   - **Critical**: Documents R3F incompatibility

---

## Quick Reference

### BEFORE Starting ANY Work

```bash
cd /Users/kfitz/3iatlas

# Read these 3 files (10 minutes):
cat docs/PROJECT_MEMORY.md        # Source of truth
cat docs/CURRENT_STATE.md          # What's broken NOW
cat docs/MIGRATION_TASKS.md        # How to fix it

# Check recent work:
git log --oneline -10

# State your understanding in first reply:
# "Context: [working features] [broken features] [current blocker]"
```

### Core Absolute Rules

1. **NO ByteRover MCP** - Use local markdown files
2. **NO mock/stub data** - Real NASA data only
3. **NO breaking Printify** - It's the revenue source (currently working ✅)
4. **NO TypeScript errors** - Clean code always
5. **NO "any" types** - Type everything
6. **Test immediately** - Change → Test → Commit
7. **30-minute stuck rule** - Document and request handoff

### Current Project Status (Jan 22, 2025)

#### ✅ WORKING (Don't Break)
- Next.js site on port 3030
- All Printify products (4 brands)
- Site structure and layout
- Data files (trajectory_static.json, timeline_events.json)
- All component code migrated

#### ❌ BROKEN (Needs Fix)
- React Three Fiber initialization
- All 3D visualization
- Shows "Loading Enhanced Solar System..." indefinitely

#### 🎯 Current Blocker
**React reconciler error**: React 18.2 + Next.js 15 + R3F 8.x incompatibility
**Time invested**: 6+ hours, multiple versions tried
**Decision needed**: Try R3F 8.16.0 OR implement iframe fallback

---

## Memory System (NO EXTERNAL MCPS)

### Why No ByteRover MCP

**What happened**: During development, ByteRover MCP:
- Storage calls appeared to work
- Retrieval calls failed
- No persistent knowledge accumulation
- Had to re-explain context each session
- Wasted ~2 hours with no benefit

**Decision**: Use local markdown files instead

### What Actually Works

```
/docs/PROJECT_MEMORY.md           ← Source of truth
/docs/CURRENT_STATE.md             ← What's broken right now
/docs/MIGRATION_TASKS.md           ← Step-by-step fixes
/docs/RECONCILIATION_SUMMARY.md    ← Honest project assessment
/docs/COMPLETE_CODE_CONSOLIDATION.md  ← All tracker code
git commit history                 ← Permanent record
```

### Update Protocol

**After completing any work (MANDATORY):**
```markdown
## Update: [Date/Time]

### Files Changed
- [list with what changed]

### Status
✅ Working: [features that now work]
❌ Broken: [issues still remaining]

### Learned
- [key lessons from this work]

### Next Steps
1. [specific actionable tasks]
```

Add this to `/docs/PROJECT_MEMORY.md` and commit.

---

## Development Workflow (Battle-Tested)

### The Working Process

```
1. Read docs (10 min)
   ↓
2. Make ONE small change
   ↓
3. Test immediately
   ↓
4. If works → commit
   If breaks → revert
   ↓
5. Update docs
   ↓
6. Repeat
```

### The 30-Minute Rule

**If stuck for >30 minutes on same issue:**
1. STOP trying random fixes
2. Document what was tried (exact errors, approaches, time)
3. Update `/docs/CURRENT_STATE.md`
4. Request handoff with full context

**Don't waste hours struggling. Document and ask for help.**

### Protecting Working Features

**Before modifying ANY file:**
1. Check if it's marked "✅ WORKING" in docs
2. Test the feature BEFORE your change
3. Make your change
4. Test the feature AFTER your change
5. If broken → revert immediately

**Files to NEVER break:**
- `/components/ProductCarousel.tsx` (Printify revenue)
- `/components/FeaturedRow.tsx` (Printify revenue)
- `/lib/printify.ts` (Printify API)
- Any file marked ✅ in CURRENT_STATE.md

---

## Technical Constraints

### Known Compatibility Issues

**React Three Fiber** (CRITICAL BLOCKER):
- Won't initialize in Next.js environment
- Error: `Cannot read properties of undefined (reading 'ReactCurrentOwner')`
- Versions tried: 8.13.0, 8.15.0, React 19 combo
- All failed with same error
- **Same code works in Vite** at `/Users/kfitz/3dsolardeepagent/code_artifacts/3iatlas-flight-tracker/`

**Options**:
- A: Try @react-three/fiber 8.16.0 (15 min, 30% success)
- B: Implement iframe embed (30 min, 100% success)

### NASA Horizons Data

**Correct format for 3I/ATLAS:**
```typescript
// CORRECT
const command = "DES=1004083";

// WRONG
const command = "1004083";
```

**Coordinate conversion:**
```typescript
// Horizons (Z-up) → Three.js (Y-up)
mesh.position.set(
  data.x,    // X → X
  data.z,    // Z → Y
  -data.y    // Y → -Z
);
```

---

## File Structure

```
/Users/kfitz/3iatlas/
├── .cursor/rules/          ← All project rules here
│   ├── 00-project-core.mdc          ⭐ Read first
│   ├── 01-development-workflow.mdc
│   └── 02-technical-constraints.mdc
│
├── docs/                   ← All documentation here
│   ├── PROJECT_MEMORY.md            ⭐ Source of truth
│   ├── CURRENT_STATE.md             ⭐ What's broken
│   ├── MIGRATION_TASKS.md           ⭐ How to fix
│   ├── RECONCILIATION_SUMMARY.md
│   └── COMPLETE_CODE_CONSOLIDATION.md
│
├── components/            ← React components
│   ├── Atlas3DTrackerEnhanced.tsx   ❌ Broken (R3F)
│   ├── ProductCarousel.tsx          ✅ Working (Printify)
│   ├── FeaturedRow.tsx              ✅ Working (Printify)
│   └── [11 other tracker components]
│
├── public/data/           ← Static data files
│   ├── trajectory_static.json       ✅ 1,093 data points
│   └── timeline_events.json         ✅ Events data
│
├── app/page.tsx           ✅ Main page (working)
└── lib/printify.ts        ✅ Printify API (working)
```

---

## Communication Style

### With User
- ✅ Be honest about what's working vs broken
- ✅ Don't sugarcoat failures
- ✅ Provide clear options with probabilities
- ✅ Request decisions when blocked

### In Documentation
- ✅ Use ✅ for working features
- ❌ Use ❌ for broken features
- ⚠️ Use ⚠️ for warnings
- Include exact file paths
- Include exact error messages
- Document time spent

---

## Success Metrics

### Good Development Session
- [ ] Read docs before starting
- [ ] Made incremental commits
- [ ] Preserved working features
- [ ] Updated documentation
- [ ] Clear next steps documented

### Bad Development Session
- [ ] Didn't read docs
- [ ] Broke working features
- [ ] Unclear commits
- [ ] Undocumented changes
- [ ] No clear next steps

---

## Common Commands

```bash
# Start work session
cd /Users/kfitz/3iatlas
cat docs/PROJECT_MEMORY.md
cat docs/CURRENT_STATE.md
git log --oneline -10

# During development
npm run dev              # Port 3030
# Make change → Test → Commit

# Test working Vite version (reference)
cd /Users/kfitz/3dsolardeepagent/code_artifacts/3iatlas-flight-tracker/frontend
npm run dev              # Port 5173

# End session
# Update docs/PROJECT_MEMORY.md
git add docs/PROJECT_MEMORY.md
git commit -m "docs: update memory with [changes]"
```

---

## Key Learning Points

### What Works
1. ✅ Local markdown documentation
2. ✅ Incremental development (change → test → commit)
3. ✅ Protecting working features (especially Printify)
4. ✅ 30-minute stuck rule (request help early)
5. ✅ Honest failure documentation

### What Doesn't Work
1. ❌ ByteRover MCP (failed for this project)
2. ❌ Making many changes before testing
3. ❌ Trying same approach for hours
4. ❌ Breaking working features to fix broken ones
5. ❌ "I'll document it later" (you won't)

### Hard-Learned Lessons
- **Lesson 1**: Same code can work in Vite but fail in Next.js (environment matters)
- **Lesson 2**: External memory tools aren't always reliable (local files > MCPs)
- **Lesson 3**: Working features > New features (protect revenue source)
- **Lesson 4**: Documenting failures is as important as documenting successes
- **Lesson 5**: 30 minutes stuck = time to request handoff (don't waste hours)

---

## For Next Developer

### Good News
- 95% of migration is complete
- All code is migrated and structured
- Printify integration works perfectly
- Data files are correct
- Only ONE issue blocking completion
- Issue is well-documented
- Multiple solution paths available

### The Blocker
- React Three Fiber won't initialize in Next.js
- Not a code problem (works in Vite)
- Environment compatibility issue
- Needs architectural decision

### Recommended Approach
1. Try Option A (R3F 8.16.0) - takes 15 minutes
2. If fails → Go straight to Option B (iframe) - takes 30 minutes
3. Don't waste days debugging - iframe is valid solution

### Remember
- Read `/docs/PROJECT_MEMORY.md` first
- Don't break Printify integration (revenue source)
- Test incrementally
- Document as you go
- Request help at 30 minutes

---

## Rule Compliance Checklist

Before each session:
- [ ] Read PROJECT_MEMORY.md
- [ ] Read CURRENT_STATE.md
- [ ] Checked git log
- [ ] Stated understanding in first reply

During work:
- [ ] Making small incremental changes
- [ ] Testing after each change
- [ ] Committing working changes
- [ ] Not breaking Printify features
- [ ] Documenting as I go

When stuck:
- [ ] At 30-minute mark
- [ ] Documented what was tried
- [ ] Updated CURRENT_STATE.md
- [ ] Requesting handoff with full context

After work:
- [ ] Updated PROJECT_MEMORY.md
- [ ] Marked completed items ✅
- [ ] Listed what's broken ❌
- [ ] Added learned lessons
- [ ] Clear next steps documented

---

## Final Notes

**These rules are based on 10+ hours of intensive development on this specific project.**

They document:
- What worked
- What didn't work
- Why external MCPs failed
- Why the R3F blocker exists
- How to move forward

**They are honest, specific, and actionable.**

Use them. They'll save you hours of repeated mistakes.

---

**Last Updated**: January 22, 2025, 5:10 PM PST
**Status**: Complete and verified
**Next Action**: User decision on R3F fix approach
