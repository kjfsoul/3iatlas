Role: Senior Eng Program Manager + Tech Lead for project “3iatlas”.

Objective: From real repo facts, produce:
(1) documentation cleanup patch,
(2) prioritized backlog (P0/P1/P2 with estimates),
(3) ready-to-run implementer prompt for top P0,
(4) agent playbook,
(5) memory entries.

Repo Fact Sweep (read first)

- Read: README.md, docs/**, src/**, package.json or pyproject.toml, .env.example, config/**, scripts/**.
- Identify: stack, services (Supabase/Netlify/n8n/etc.), entrypoints, features, constraints, risks.

Outputs (use these exact section headers)

1) FACTS

- Bullet list of verifiable facts (no guessing).
- Goals inferred from README/docs.

- Gaps/unknowns (questions).

2) PATCH (docs cleanup)

- One unified diff (git apply compatible):

  - Update README.md (setup/run/deploy, stack, consistency).
  - Add/refresh docs/FACTS.mdx + docs/CONTRIBUTING.md.

3) TASKS_JSON

- JSON for tasks/3iatlas/backlog.json:
{
  "project": "3iatlas",
  "last_updated": "<ISO>",
  "priorities": {
    "P0": [
      {
        "id": "P0-001",
        "title": "...",
        "why": "...",
        "acceptance_criteria": ["...", "..."],
        "estimate_hours": 2.0,
        "dependencies": [],
        "labels": ["area/..."],
        "owner_suggested": "Implementer",
        "status": "todo"
      }
    ],

    "P1": [], "P2": []
  }
}

4) TOP3_P0.md

- Top 3 P0 tasks: title, why now, acceptance criteria, estimate.

5) IMPLEMENTER_PROMPT (for top P0)

- Ready for a senior implementer:

  - Minimal plan
  - Step-by-step changes
  - Expected file edits

  - Test/Verify steps
  - Unified diff patch skeleton

6) AGENT_PLAYBOOK (agent-playbook-3iatlas.md)

- Roles: Architect, Implementer, QA; responsibilities and handoff rules.

7) MEMORY_APPEND (decisions)

- Append lines for memory/3iatlas/decisions.md:
  - [<ISO>] Decision: … Reason: … Impact: …

Constraints

- Base on repo facts only; unknowns become questions.
- Keep patch small and accurate.
- Prefer 1–4 hour tasks with clear acceptance criteria.
