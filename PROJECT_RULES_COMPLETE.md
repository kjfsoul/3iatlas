# 3I/ATLAS Project Rules - Complete Package

**🚨 STOP! READ THIS FIRST - MANDATORY PROTOCOL:**

```
BEFORE ANY ACTION:
1. AM I ON FEATURE BRANCH? (Required for code changes)
2. DO I HAVE USER APPROVAL? (Required for deployments)
3. AM I DEPLOYING TO STAGING FIRST? (Required for deployments)

IF ANY CHECK FAILS: STOP. ASK PERMISSION. WAIT.

CRITICAL: This check MUST be performed before every action.
```

**Purpose**: All project rules, ready to insert into `.cursor/rules/`
**Date**: January 22, 2025
**Status**: Production-ready, battle-tested

---

## How to Use This Document

This file contains THREE rule files that should be placed in `/Users/kfitz/3iatlas/.cursor/rules/`:

1. `00-project-core.mdc` - Core rules, memory system, current status
2. `01-development-workflow.mdc` - Proven development process
3. `02-technical-constraints.mdc` - Technical details, known issues

**These files are already created in the project.** This document is for reference.

---

## File 1: 00-project-core.mdc

**Location**: `/Users/kfitz/3iatlas/.cursor/rules/00-project-core.mdc`
**Purpose**: Most important rules, read first every session
**Status**: ✅ Already created

Key contents:

- NO ByteRover MCP (use local files)
- Current status (what's working vs broken)
- Absolute rules (never violate)
- Before/during/after work protocols
- 30-minute stuck rule

---

## File 2: 01-development-workflow.mdc

**Location**: `/Users/kfitz/3iatlas/.cursor/rules/01-development-workflow.mdc`
**Purpose**: Battle-tested development process
**Status**: ✅ Already created

Key contents:

- Incremental development (change → test → commit)
- Testing protocols
- 30-minute stuck rule
- Protecting working features
- Emergency procedures

---

## File 3: 02-technical-constraints.mdc

**Location**: `/Users/kfitz/3iatlas/.cursor/rules/02-technical-constraints.mdc`
**Purpose**: Technical stack, known issues, patterns
**Status**: ✅ Already created

Key contents:

- Complete technical stack
- R3F compatibility issue documentation
- NASA Horizons data patterns
- Printify integration (do not modify)
- Performance requirements

---

## Quick Reference for Agents

### Before ANY Work (Mandatory 10 min)

```bash
cd /Users/kfitz/3iatlas

# Read these files:
cat docs/PROJECT_MEMORY.md      # 5 min
cat docs/CURRENT_STATE.md        # 2 min
cat docs/MIGRATION_TASKS.md      # 2 min
git log --oneline -10            # 1 min
```

### Absolute Rules

1. **NO ByteRover MCP** - Use `/docs/PROJECT_MEMORY.md`
2. **NO breaking Printify** - It's revenue (currently ✅ working)
3. **NO TypeScript errors** - Clean code always
4. **Test immediately** - After every change
5. **30-minute rule** - Document and request help if stuck

### Current Status (Jan 22, 2025)

**✅ Working:**

- Next.js site (port 3030)
- All Printify products (4 brands)
- Data files (1,093 trajectory points)

**❌ To Fix:**

- Implement iframe integration (Option B)
- Takes 30-45 minutes
- Guaranteed to work

### Development Commands

```bash
# Terminal 1: Vite Tracker
cd /Users/kfitz/3dsolardeepagent/code_artifacts/3iatlas-flight-tracker/frontend
npm run dev  # Port 5173

# Terminal 2: Next.js Site
cd /Users/kfitz/3iatlas
npm run dev  # Port 3030
```

### Enhanced Testing & Deployment Workflow (MANDATORY)

**PRE-COMMIT TESTING (MANDATORY):**
```bash
# 1. Code Quality Checks
npm run lint          # TypeScript & ESLint validation
npm run typecheck     # Type safety verification
npm run build         # Production build test (must succeed)

# 2. Local Testing
npm run dev           # Start development server
# Manual browser testing at localhost
# Test specific functionality changed
# Verify no regressions in existing features
```

**STAGING DEPLOYMENT (OPTIONAL):**
```bash
# 1. Deploy to Staging/Preview (ALWAYS OFFER)
cd /Users/kfitz/3iatlas
vercel --target preview

cd /Users/kfitz/3dsolardeepagent/code_artifacts/3iatlas-flight-tracker/frontend
vercel --target preview

# 2. Provide Preview Links to User (ALWAYS PROVIDE)
echo "Staging URLs:"
echo "Main Site: [vercel-preview-url]"
echo "Tracker: [vercel-preview-url]"

# 3. User Choice
# Option A: Test staging environment first (recommended for major changes)
# Option B: Deploy directly to production (for minor fixes)
# Option C: Continue making changes without immediate deployment
```

**PRODUCTION DEPLOYMENT (FLEXIBLE):**
```bash
# Option 1: Direct Production Deployment (for minor fixes)
# 1. Commit to both repositories
cd /Users/kfitz/3iatlas
git add .
git commit -m "feat: descriptive commit message"
git push origin main

cd /Users/kfitz/3dsolardeepagent/code_artifacts/3iatlas-flight-tracker/frontend
git add .
git commit -m "feat: descriptive commit message"
git push origin main

# 2. Deploy to Production
cd /Users/kfitz/3iatlas
vercel --prod --yes

cd /Users/kfitz/3dsolardeepagent/code_artifacts/3iatlas-flight-tracker/frontend
vercel --prod --yes

# Option 2: Feature Branch Workflow (for major changes)
git checkout -b feature/description-of-changes
# Make changes
git add .
git commit -m "feat: descriptive commit message"
git push origin feature/description-of-changes
# Create PR and merge after review
# AI handles merging after user approval
```

**POST-DEPLOYMENT TESTING (MANDATORY):**
```bash
# 1. Health Checks
curl -f https://production-url.com/api/health

# 2. Feature Validation
# Test changed functionality in production
# Verify existing features still work
# Check mobile and web presentation at different zoom levels

# 3. Performance Monitoring
# Monitor response times
# Check error rates
# Verify Printify integration status
```

**POST-DEPLOYMENT VISUAL VERIFICATION (MANDATORY):**

After any deployment (staging or production) that involves UI/UX changes, the AI Assistant MUST perform a thorough visual verification.

1. **Access Staging/Production Link:** Navigate to the deployed URL.
2. **Compare Against Requirements:**
   - Visually compare the deployed UI against the user's latest feedback, screenshots, and explicit requirements.
   - Confirm that all requested changes are accurately reflected.
   - Pay close attention to layout, spacing, element visibility, functionality (e.g., button states, interactive elements), and responsiveness across different viewports (if applicable).
3. **Document Findings:**
   - If discrepancies are found, immediately document them, identify the root cause (e.g., `search_replace` failure, incorrect target, overriding styles), and revert to the "in_progress" state for the relevant tasks.
   - If all changes are confirmed, explicitly state "Visual verification passed" in the update.
4. **Screenshot Evidence (Optional but Recommended):** For complex UI changes, include a screenshot of the *verified* staging/production UI in the `PROJECT_MEMORY.md` update or directly in the conversation, highlighting the fixed areas.

**CRITICAL RULE VIOLATION CONSEQUENCES:**
- Claiming completion without visual verification = RULE VIOLATION
- Fabricating results or misrepresenting UI state = RULE VIOLATION
- Must acknowledge violations and implement fixes immediately

**CODE EVIDENCE REQUIREMENT (MANDATORY):**

When making any code changes, the AI Assistant MUST provide before/after code evidence similar to this format:

**CLICKABLE LINKS REQUIREMENT (MANDATORY):**

All staging/preview links must be provided as clickable markdown links, not plain text URLs. Use format: `[Link Name](URL)`

```typescript
// BEFORE (Issue Description)
// [Original problematic code with comment explaining the issue]

// AFTER (Fix Description)
// [Fixed code with comment explaining the solution]
```

**Examples:**
```typescript
// BEFORE (Hardcoded Speed)
<Atlas3DTrackerEnhanced
  autoPlay={true}
  initialSpeed={2}  // ❌ Hardcoded to 2x
  initialViewMode="ride-atlas"
/>

// AFTER (URL Parameter Reading)
const urlParams = new URLSearchParams(window.location.search);
const initialSpeed = parseInt(urlParams.get('speed') || '10', 10);
<Atlas3DTrackerEnhanced
  autoPlay={autoPlay}
  initialSpeed={initialSpeed}  // ✅ Reads from URL parameters
  initialViewMode={initialViewMode}
/>
```

**Purpose:**
- Provides clear evidence of what was changed
- Shows exact before/after state
- Enables verification of fixes
- Prevents misrepresentation of changes

**MANDATORY COMPLIANCE SCRIPT (AI ASSISTANT MUST FOLLOW):**

```bash
# BEFORE ANY DEPLOYMENT:
1. Read PROJECT_RULES_COMPLETE.md
2. Make changes with code evidence
3. Deploy to STAGING ONLY
4. Provide preview links to user
5. WAIT for user approval
6. Only then deploy to production
7. NEVER push to GitHub without user approval
```

**🚨 STOP! READ THIS FIRST - MANDATORY PROTOCOL:**

```
BEFORE ANY ACTION:
1. AM I ON FEATURE BRANCH? (Required for code changes)
2. DO I HAVE USER APPROVAL? (Required for deployments)
3. AM I DEPLOYING TO STAGING FIRST? (Required for deployments)

IF ANY CHECK FAILS: STOP. ASK PERMISSION. WAIT.

CRITICAL: This check MUST be performed before every action.
```

**CRITICAL RULE VIOLATION CONSEQUENCES:**
- Pushing to GitHub without user approval = IMMEDIATE RULE VIOLATION
- Deploying without preview verification = IMMEDIATE RULE VIOLATION
- Not using visual testing tools = IMMEDIATE RULE VIOLATION
- Must acknowledge violations and implement fixes immediately

**BRANCH STRATEGY (RECOMMENDED):**
```bash
# For major changes, use feature branches
git checkout -b feature/responsive-layout-fix
# Develop and test on feature branch
# Create PR for review
# Merge to main after approval (AI will handle merging)
```

**ROLLBACK PROCEDURE (EMERGENCY):**
```bash
# Quick Rollback
vercel rollback [deployment-url]  # Immediate rollback
git revert [commit-hash]          # Code rollback

# Emergency Rollback on Critical Failures
# Automatic rollback triggers on:
# - Site availability < 95%
# - Error rate > 5%
# - Response time > 5 seconds
```

**CRITICAL RULES:**

- ✅ **ALWAYS run pre-commit tests** - Lint, typecheck, build must pass
- ✅ **ALWAYS offer staging deployment** - Provide preview links to user
- ✅ **ALWAYS get user choice** - Staging first, direct production, or continue changes
- ✅ **ALWAYS commit to both repos** - Changes affect both projects
- ✅ **ALWAYS push to GitHub** - Triggers automatic deployments
- ✅ **ALWAYS deploy to Vercel** - Ensures production is updated
- ✅ **ALWAYS test after deployment** - Verify changes work in production
- ✅ **ALWAYS test mobile/web presentation** - At different zoom levels
- ✅ **USE feature branches** - For major changes with PR workflow
- ❌ **NEVER skip deployment** - Local changes don't affect production
- ❌ **NEVER assume auto-deploy** - Manual deployment required
- ❌ **NEVER force staging** - User chooses deployment approach

**Why Both Repos:**

- `/Users/kfitz/3iatlas` - Main Next.js site
- `/Users/kfitz/3dsolardeepagent/code_artifacts/3iatlas-flight-tracker/frontend` - Vite tracker
- Changes to either affect the complete system
- Both must be synced for full functionality

---

## Flexible Deployment Workflow

### Deployment Options

**For Minor Fixes (Recommended):**
- Make changes directly on main branch
- Commit and push to GitHub
- Deploy directly to production
- No staging required unless user requests

**For Major Changes (Recommended):**
- Create feature branch: `git checkout -b feature/description`
- Make changes on feature branch
- Deploy to staging for user testing
- Create PR and merge after approval
- Deploy to production

**For Continuous Development:**
- Make multiple changes without immediate deployment
- Commit changes as you go
- Deploy when ready or when user requests
- Always offer staging links but don't require approval

### User Choice Protocol

**Always provide these options:**
1. **Deploy to staging first** - For testing before production
2. **Deploy directly to production** - For minor fixes
3. **Continue making changes** - Without immediate deployment
4. **Use feature branch** - For major changes with PR workflow

**AI Assistant Responsibilities:**
- Always offer staging deployment with clickable links
- Never force staging approval for minor changes
- Always provide user choice in deployment approach
- Use feature branches for major changes automatically

---

## Expert Modes & Testing Criteria

### Expert Mode Prompts for AI Developers

**RESPONSIVE DESIGN EXPERT MODE:**
```
EXPERT MODE: Responsive Layout Specialist
Focus: Mobile-first design, cross-browser compatibility, zoom-level testing
Testing Protocol: Test at 100%, 75%, 67%, 50% browser zoom levels
Critical Checks: Controls must fit at 100% zoom, no horizontal overflow
Success Criteria: All controls visible and functional across all zoom levels
```

**3D VISUALIZATION EXPERT MODE:**
```
EXPERT MODE: Three.js/React Three Fiber Specialist
Focus: 3D performance, camera controls, rendering optimization
Testing Protocol: FPS monitoring, memory leak detection, cross-device testing
Critical Checks: 60 FPS target, stable memory usage, responsive controls
Success Criteria: Smooth 3D experience across desktop and mobile
```

**API INTEGRATION EXPERT MODE:**
```
EXPERT MODE: API Integration Specialist
Focus: Printify integration, NASA Horizons API, data caching
Testing Protocol: API response validation, error handling, cache behavior
Critical Checks: Products load correctly, no 2MB cache warnings, fallback handling
Success Criteria: Reliable data fetching with proper error recovery
```

**DEPLOYMENT EXPERT MODE:**
```
EXPERT MODE: DevOps/Deployment Specialist
Focus: Staging workflows, rollback procedures, health monitoring
Testing Protocol: Multi-environment testing, automated rollback triggers
Critical Checks: Staging matches production, quick rollback capability
Success Criteria: Zero-downtime deployments with instant recovery
```

### Testing Criteria by Change Type

**UI/RESPONSIVE CHANGES:**
- [ ] Test at 100%, 75%, 67%, 50% browser zoom levels
- [ ] Test on mobile (375px), tablet (768px), desktop (1024px+)
- [ ] Verify no horizontal overflow or clipped controls
- [ ] Test dropdown menus remain fully visible
- [ ] Verify touch targets are adequate (44px minimum)

**3D VISUALIZATION CHANGES:**
- [ ] Monitor FPS (target: 60 FPS)
- [ ] Check memory usage stability (no leaks)
- [ ] Test camera controls responsiveness
- [ ] Verify zoom functionality works correctly
- [ ] Test across different view modes

**API INTEGRATION CHANGES:**
- [ ] Test API response handling
- [ ] Verify error states and fallbacks
- [ ] Check caching behavior
- [ ] Test offline scenarios
- [ ] Verify data consistency

**DEPLOYMENT CHANGES:**
- [ ] Test staging environment first
- [ ] Verify production deployment
- [ ] Check health monitoring
- [ ] Test rollback procedures
- [ ] Verify both repositories are synced

---

## Memory System (Local Files Only)

### Source of Truth

```
/Users/kfitz/3iatlas/docs/PROJECT_MEMORY.md     ← Read first
/Users/kfitz/3iatlas/docs/CURRENT_STATE.md      ← What's broken
/Users/kfitz/3iatlas/docs/MIGRATION_TASKS.md    ← How to fix
/Users/kfitz/3iatlas/docs/COMPLETE_MIGRATION_GUIDE.md  ← Full instructions
Git history                                      ← Permanent record
```

### Why No External MCPs

ByteRover MCP failed during development:

- Storage appeared to work but retrieval failed
- Had to re-explain context each session
- Wasted ~2 hours with no benefit
- Local files proved more reliable

### Update Protocol

After completing work:

```markdown
## Update: [Date/Time]

### Files Changed
- [list]

### Status
✅ Working: [features]
❌ Broken: [issues]

### Learned
- [lessons]

### Next Steps
1. [tasks]
```

Add to `/docs/PROJECT_MEMORY.md` and commit.

---

## Files to NEVER Break

```
/components/ProductCarousel.tsx   ← Printify revenue
/components/FeaturedRow.tsx       ← Printify revenue
/components/SocialLinks.tsx       ← Site navigation
/lib/printify.ts                  ← API integration
/app/page.tsx                     ← Site structure
```

**Before modifying any file:**

1. Check if marked ✅ WORKING in docs
2. Test feature BEFORE your change
3. Make your change
4. Test feature AFTER your change
5. If broken → revert immediately

---

## Success Metrics

### Good Session

- [ ] Read docs before starting
- [ ] Made incremental commits
- [ ] Preserved working features
- [ ] Updated documentation
- [ ] Clear next steps

### Bad Session

- [ ] Didn't read docs
- [ ] Broke working features
- [ ] Unclear commits
- [ ] Undocumented work

---

## Common Patterns

### Adding New Feature

```bash
# 1. Make minimal version
# 2. Test it works
# 3. Commit
# 4. Add one feature
# 5. Test it works
# 6. Commit
# 7. Repeat
```

### Fixing Issue

```bash
# 1. Reproduce issue
# 2. Make smallest fix
# 3. Test fix works
# 4. Commit
# 5. Document in PROJECT_MEMORY.md
```

### When Stuck

```bash
# After 30 minutes:
# 1. Document what tried
# 2. Update CURRENT_STATE.md
# 3. Request handoff
# Don't waste hours
```

---

## The Complete Process

```
Read docs (10 min)
  ↓
Make ONE change
  ↓
Test immediately
  ↓
Works? → Commit → Push → Deploy → Next change
Breaks? → Revert → Try different approach
  ↓
After 30 min stuck? → Document → Request help
  ↓
After completing? → Update docs → Commit → Push → Deploy
```

**MANDATORY DEPLOYMENT STEPS:**

1. **Commit** changes to both repos
2. **Push** to GitHub (triggers auto-deploy)
3. **Deploy** to Vercel (ensures production)
4. **Test** production site
5. **Document** results in PROJECT_MEMORY.md

---

## Key Learning Points

**What Works:**

- ✅ Local markdown documentation
- ✅ Incremental development
- ✅ Testing immediately
- ✅ Protecting working features
- ✅ Requesting help at 30 minutes

**What Doesn't Work:**

- ❌ External memory tools (for this project)
- ❌ Making many changes before testing
- ❌ Debugging same thing for hours
- ❌ Breaking working features

**Hard Lessons:**

- Same code: Vite ✅ works, Next.js ❌ doesn't (environment matters)
- Local files > External MCPs (reliability matters)
- Working features > New features (revenue matters)
- Iframe is valid architecture (don't overthink it)
- 30 minutes stuck = handoff time (don't waste hours)

---

## All Documentation Available

| File | Purpose | Location |
|------|---------|----------|
| PROJECT_MEMORY.md | Source of truth | /docs/ |
| CURRENT_STATE.md | What's broken | /docs/ |
| MIGRATION_TASKS.md | Step-by-step fixes | /docs/ |
| COMPLETE_MIGRATION_GUIDE.md | Full instructions | / |
| PASTE_THIS_TO_AGENT.md | Agent prompt | / |
| RECONCILIATION_SUMMARY.md | Honest assessment | / |
| RULES_SUMMARY.md | Rules overview | / |

---

## I-DON'T-KNOW PROTOCOL (MANDATORY)

**When to Use**: When you're uncertain about ANY aspect of the task, data, or requirements.

**CRITICAL**: This protocol MUST be followed before making any changes or assumptions. It prevents wasted time and ensures proper context gathering.

### Step 1: State the Gap Precisely

**Format**:

```
GAP IDENTIFIED: [Specific uncertainty]
BLOCKS PROGRESS BECAUSE: [Why this uncertainty prevents proper action]
```

**Examples**:

- "GAP IDENTIFIED: Whether Printify cache warning affects user experience or is just a console warning"
- "GAP IDENTIFIED: Which specific R3F version combinations have been tested and failed"
- "GAP IDENTIFIED: Current status of 3D tracker integration in production vs development"

### Step 2: List What You Checked

**Format**:

```
CHECKED SOURCES:
- [File path]: [What was found/not found]
- [Command run]: [Result]
- [Documentation]: [Relevant information]
```

**Examples**:

```
CHECKED SOURCES:
- /docs/PROJECT_MEMORY.md: Mentions cache warning as "non-blocking" but unclear impact
- /lib/printify.ts: Shows cache configuration but no impact assessment
- Browser console: Shows warning but products load correctly
```

### Step 3: Produce Retrieval Prompt

**Format**:

```
RETRIEVAL PROMPT FOR NEXT AGENT:
SEARCH: [Specific search terms]
SOURCE: [File paths to search]
PARAMS: [Specific parameters to look for]
REQUIRED FIELDS: [What information is needed]
SCHEMA: [Expected data structure]
VALIDATION: [How to verify the information is correct]
```

**Examples**:

```
RETRIEVAL PROMPT FOR NEXT AGENT:
SEARCH: Printify cache warning impact analysis
SOURCE: /docs/PROJECT_MEMORY.md, /docs/CURRENT_STATE.md, /lib/printify.ts
PARAMS: Look for "2MB cache limit", "Failed to set fetch cache", user experience impact
REQUIRED FIELDS: Error message, impact level (blocking/warning), solution status, test results
SCHEMA: { error: string, impact: "blocking"|"warning"|"cosmetic", solution: string, tested: boolean, userAffected: boolean }
VALIDATION: Check if products actually load for users, verify console vs functional impact
```

### Step 4: Offer Viable Next Steps

**Format**:

```
NEXT STEPS (Choose One):
A) [Specific action with success criteria]
B) [Alternative action with success criteria]
C) [Investigation action with deliverables]
```

**Examples**:

```
NEXT STEPS (Choose One):
A) Implement cache fix if confirmed as needed (success: no console warnings, products load)
B) Investigate actual user impact of cache warning (success: clear impact assessment)
C) Document current behavior and defer fix (success: clear documentation of non-blocking status)
```

### Step 5: Stop and Wait

**CRITICAL**: Do NOT proceed with implementation until the gap is resolved through proper information gathering.

---

## Enhanced Information Gathering Checklist

### Before Making ANY Changes

**Required Information**:

- [ ] What exactly is the current behavior?
- [ ] What is the expected behavior?
- [ ] What files/components are involved?
- [ ] What is the impact on users?
- [ ] What has been tried before?
- [ ] What are the constraints/limitations?
- [ ] What are the success criteria?

### Documentation Sources to Check

**Primary Sources** (Check in order):

1. `/docs/PROJECT_MEMORY.md` - Source of truth
2. `/docs/CURRENT_STATE.md` - Current status
3. `/docs/MIGRATION_TASKS.md` - Planned fixes
4. Git history - Recent changes
5. Browser console - Current errors
6. Production vs development differences

### Validation Requirements

**Before claiming completion**:

- [ ] Verified with actual browser testing
- [ ] Confirmed no regression in working features
- [ ] Checked both development and production environments
- [ ] Validated against success criteria
- [ ] Documented the solution

### Common Information Gaps

**Frequently Missing Information**:

- Production vs development environment differences
- User experience impact vs console warnings
- Previous attempts and why they failed
- Dependencies and version compatibility
- Performance implications
- Security considerations

---

**These rules are comprehensive, specific, and based on actual project experience.**

**Use them. They work.**
