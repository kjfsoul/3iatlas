# 3I/ATLAS Project Rules - Complete Package

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
Works? → Commit → Next change
Breaks? → Revert → Try different approach
  ↓
After 30 min stuck? → Document → Request help
  ↓
After completing? → Update docs → Commit
```

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

**These rules are comprehensive, specific, and based on actual project experience.**

**Use them. They work.**
