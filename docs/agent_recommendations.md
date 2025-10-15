# Agent Recommendations (Expanded)

Analysis Date: 2025-10-11  
Scope: Narrative, Orbital Explainer, Product Recommender, Observability

## Principles / guardrails
- Never fabricate orbital or product data; always cite sources
- Agents provide overlays, insights, or narrative—not core control flows
- Prefer deterministic prompts with strict output schemas

---

## Narrative Agent (Atlas Directive)
Role: Drive an interactive story using deterministic branching; persist state.

Citations:
- State/Types: `types/atlas-directive.d.ts` 14:36, 84:109, 152:160
- Modal entry: `components/AtlasDirectiveModal.tsx` 82:99
- CTA trigger: `components/AtlasDirectiveSection.tsx` 60:84

MVP responsibilities:
- Maintain `GameState` (currentNodeId, choices[], progress)
- Produce nextNode + 3 choices; short prose ≤120 words
- Persist via localStorage save/load hook

System prompt template:
```
You are the ATLAS Directive story engine. Maintain continuity using the supplied GameState: currentNodeId, choices[], variables, progress. Output strict JSON:
{
  "nextNodeId": string,
  "prose": string,        // <= 120 words
  "choices": [            // exactly 3
    {"id": string, "label": string},
    {"id": string, "label": string},
    {"id": string, "label": string}
  ],
  "variables": object,    // updated variables if any
  "progress": number      // 0..100
}
Do not invent science or external facts; stay within internal canon.
```

User prompt template:
```
state = {
  currentNodeId: "...",
  choices: [...],
  variables: {...},
  progress: 0
}
Advance one node; return updated state fields and three choices.
```

---

## Orbital Explainer Agent (3D Tracker)
Role: Explain visible motion and orbital context; generate educational overlays.

Citations:
- Tracker scene: `components/Atlas3DTracker.tsx` 1:12
- Vector parsing: `lib/horizons-api.ts` 213:241
- Views container perf area: `components/views/AtlasViewsContainer.tsx` 94:103

MVP responsibilities:
- Summarize motion using 5–10 recent `VectorData`
- Report AU positions and direction changes in ≤80 words
- If data missing, say “insufficient data”

System prompt template:
```
You are an orbital mechanics explainer. Given a sequence of 5–10 VectorData frames and a UTC window, explain position/velocity trends in <=80 words using AU and days. If fields are missing or NaN, respond “insufficient data.” Never invent numbers.
```

User prompt template:
```
frames = [{ date, position:{x,y,z}, velocity:{vx,vy,vz} }, ...],
window = { startISO, endISO }
Generate short explanation.
```

---

## Product Recommender Agent (Printify)
Role: Rank existing products based on minimal behavior signals.

Citations:
- Product URL/image: `components/ProductCarousel.tsx` 34:57, 106:113
- Product fetch: `lib/printify.ts` 91:120

MVP responsibilities:
- Accept {brand, tags, clicks} context
- Rank 3 known SKUs with reason
- Never suggest SKUs not present in input

System prompt template:
```
You are a product selector. Input is a list of products {id,title,tags,price} and interaction hints {brand,clicks}. Output top 3 productIds with a one-line reason. If no signal, say "no signal". Do not invent SKUs.
```

User prompt template:
```
products = [{id,title,tags,price},...]
hints = { brand:"3IAtlas", clicks:["hoodie"] }
Return: [{productId, reason}, ... up to 3]
```

---

## Observability Agent (API & Perf)
Role: Summarize Horizons API failure patterns and performance spikes.

Citations:
- Ephemeris proxy logs/retry: `app/api/horizons/ephemeris/route.ts` 29:36, 37:49, 55:63, 78:86

MVP responsibilities:
- Parse server logs (status codes, latency buckets)
- Suggest backoff/escalation threshold
- Output report only; no code changes

System prompt template:
```
You analyze API logs. Report error-code frequencies, latency buckets, and whether 503 backoff should increase. Recommend new backoff seconds if >3% 503s in last 10 min. Output markdown bullets only.
```

---

## Integration notes
- Agents must not block rendering; run async and render overlays only
- Cache short-lived results (5–10 min) to avoid repeated calls
- Add clear UI affordances to disable agent overlays

## Roadmap
- Phase 1: Narrative MVP + Explainer overlays
- Phase 2: Product recommender + Observability summaries
- Phase 3: Cross-agent context sharing (opt-in)
