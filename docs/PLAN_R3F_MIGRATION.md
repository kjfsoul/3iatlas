# R3F Migration Plan — 3I/ATLAS (Next.js Direct Rendering)

Status: Planning document (no code changes yet)

## Context (Verified)
- Current working 3D: Vite tracker (R3F) embedded via iframe in Next.js
- Next.js direct R3F fails (reconciler error) with React 18.2 + @react-three/fiber 8.13.0 + Next 15.5.4
- Explorer view is deactivated across repos; active views: "true-scale", "ride-atlas"
- Default speed: 10x; keep Printify integration intact; no mock data; strict TS

## Decision Framework
- Primary path: Version alignment to R3F 8.16.0+ (documented Next 15 fixes)
- Fallback path: Enhanced iframe (seamless UX + feature flags)
- Guardrails: Feature branch, staging-first, visual verification, rollback ready

## Phases & Acceptance Criteria

### Phase 1 — Minimal R3F viability test (Next.js)
Goal: Prove R3F 8.16.0+ renders a basic scene in Next.js app router without reconciler errors.

**Target Versions (Pre-researched)**:
- `@react-three/fiber`: 8.16.0 - 8.16.5
- `@react-three/drei`: 9.100.0 - 9.102.0
- `@react-three/postprocessing`: 2.16.0+ (if needed)

Steps (no business logic):
1) Create `components/r3f/TestR3F.tsx` (client-only) rendering a cube with `Canvas` + `OrbitControls`.
2) Add temporary test route `app/r3f-test/page.tsx` that renders `TestR3F` (dynamic import, `ssr:false`).
3) Run in dev and staging; verify no reconciler/hydration errors; controls work.

Acceptance Criteria:
- Canvas renders; OrbitControls work; no React warnings; no SSR hydration mismatch; clean console.

### Phase 2 — Dependency alignment & hardening
Goal: Lock versions that pass Phase 1; codify client-only patterns.

Steps:
1) Upgrade packages (exact versions TBD by Phase 1): `@react-three/fiber@8.16.x`, `@react-three/drei@9.100.x`.
2) Add a small lint rule/docs note: all R3F components must be client-only and dynamically imported.
3) Add `types/three-jsx.d.ts` verification to satisfy JSX IntrinsicElements.

Acceptance Criteria:
- `npm run build` succeeds; `npm run typecheck` passes; no new TS any/unsafe casts.

### Phase 3 — Incremental feature port from Vite → Next.js
Goal: Bring live 3D into Next.js without regressing UX.

Steps (one at a time; test after each):
1) Port `SceneContent` with just Sun + camera; verify.
2) Add comet (position/velocity, tail effects); verify.
3) Add trajectory line; verify.
4) Wire playback controls; verify.
5) Wire view modes (true-scale, ride-atlas); verify.

Acceptance Criteria:
- Each step renders and functions at parity with iframe view; 60 FPS target on desktop; no UI regression.

### Phase 4 — Integration, state, and URL params
Goal: Match iframe behavior: autoplay, speed=10 default, view mode via URL.

Steps:
1) Implement URL param reader for `autoPlay`, `speed`, `view` (client-side only).
2) Keep Explorer disabled; enforce allowed values.
3) Ensure controls and telemetry overlays match existing layout.

Acceptance Criteria:
- Speed defaults to 10x; view mode obeys URL; Explorer absent; visual parity confirmed.

### Phase 5 — Performance & quality gates
Goal: Sustained performance and reliability.

Steps:
1) Add LOD/culling where beneficial; avoid overdraw; memoize heavy meshes.
2) Validate memory stability over 5+ minutes; no leaks; no console spam.
3) Cross-browser (Chrome/Firefox/Safari) and capability-based fallback (WebGL detection, not user agent).
4) Monitor GPU memory usage, draw calls, texture memory, frame time variance.

Acceptance Criteria:
- 60 FPS desktop target; stable heap; no continuous warning logs; mobile fallback intact.

### Phase 6 — Launch readiness
Goal: Safe rollout with instant fallback.

Steps:
1) Feature-flag Next.js R3F rendering vs iframe.
2) Staging deploy; clickable links; visual verification checklist.
3) If approved, enable flag in production; keep instant rollback path to iframe.

Acceptance Criteria:
- Toggle can switch between implementations without redeploy; production verified visually.

## Risks & Mitigations
- Version breaks: Pin exact versions; port incrementally; keep iframe fallback.
- SSR/hydration: Force client-only for R3F; dynamic import with `ssr:false`.
- Performance: Add LOD/culling early; test each added object; measure FPS.
- Scope creep: Keep Explorer off; only maintain true-scale/ride-atlas.

## Rollback Plan
- Immediate: Flip feature flag to iframe integration.
- Structural: Revert branch; `vercel rollback` to known-good deployment.

## Branch & Deploy Protocol (Mandatory)
- Work on `feature/r3f-nextjs-fix`.
- Staging first; provide clickable links; wait for approval.
- Production only after approval; document in `PROJECT_MEMORY.md`.

## Evidence Checklist (per phase)
- Code diffs with before/after snippets.
- Screenshots or short clips (staging) showing working state.
- Notes: FPS, memory, console output.
- Bundle size analysis (before/after R3F integration).
- Integration tests with existing Printify components.

## Success Criteria (Go/No-Go)
- Technical: No reconciler/hydration errors; functional parity; 60 FPS target.
- UX: Controls, views, speed defaults match; no regressions to Printify sections.
- Operability: Feature-flag present; instant fallback proven.

## Out of Scope (for this migration)
- Re-enabling Explorer view (textures incomplete).
- Adding new view modes/features not already present.

## Performance Benchmarks
- **GPU Memory**: < 256MB for desktop, < 128MB for mobile
- **Draw Calls**: < 50 per frame for 3D scene
- **Texture Memory**: < 64MB total
- **Frame Time Variance**: < 5ms standard deviation
- **Bundle Size Impact**: < 500KB additional gzipped size
