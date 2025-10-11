# 3IAtlas Prompt Addendum (Always Include)

Read these before doing any work:
- the_rules.md
- docs/3I_ATLAS_KNOWLEDGE_BASE.md
- docs/project_update_10.7.25.txt

## Ethics & Non‑Negotiables
- No mock/stub/hardcoded orbital data in code. Load elements from JSON config or real APIs only.
- No TypeScript or linting errors.
- No changes to Printify logic.
- Be explicit about what you changed. If you add debug logs, remove them before commit.
- Honor environment flags. For local vectors use NEXT_PUBLIC_DATA_SOURCE=astronomy.

## Data Sources
- Astronomy mode: Use astronomy‑engine for planets + 3I/ATLAS. Load 3I elements from `config/orbital-elements/3i-atlas.json`.
- Horizons mode: Existing NASA integration remains as fallback/validation. Do not mix the two in the same codepath.

## UI Principles
- Scene must never be blocked by overlays. Use small timestamp top‑left, legend collapsed by default.
- Perihelion Closeup must guarantee Sun in frame (frustum test + camera adjust).
- Zoom must work via +/− buttons and mouse wheel in all views.

## Validation Checklist
- HUD: “Data source: Astronomy Engine” when astronomy mode is active
- No network calls to Horizons in astronomy mode
- Timeline advances; comet motion visible
- Ride the Comet only when atlas vectors >= 2 frames
- Sun visible in Perihelion Closeup (around 2025‑10‑29)
- Metrics line shows RA/Dec, Elongation, Phase without overlap

## File Ownership Hints
- Data path: `lib/astronomy-engine-source.ts`, `lib/solar-system-data.ts`, `config/orbital-elements/3i-atlas.json`, `lib/observer-metrics.ts`
- Camera/UI: `components/Atlas3DTrackerEnhanced.tsx`

## Commit Message Style
`feat: <short summary>` + mention affected areas (data/camera/ui/metrics).
