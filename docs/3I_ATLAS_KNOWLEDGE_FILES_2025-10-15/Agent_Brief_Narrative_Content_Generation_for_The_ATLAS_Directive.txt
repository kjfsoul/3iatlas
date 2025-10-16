# Agent Brief: Narrative Content Generation for 'The ATLAS Directive'
Project: The ATLAS Directive - Narrative Discovery Platform
Objective: Populate the full JSON-based Narrative Tree with over 100 interconnected stages, choices, and outcomes. The final output must be a master narrative_tree.json file, ready for direct integration into the React component.
Core Mandate: Create a deeply engaging, strategically-aligned narrative that is scientifically grounded, philosophically provocative, and engineered for replayability and data capture.
1. Core Pillars of Content Generation
Your output must adhere to these four strategic pillars:
1. Education: The narrative must be a vessel for teaching real science. Every "Fact-Based Skill Check" must be verifiable against the provided knowledge bases. The user should finish a playthrough knowing more about 3I/ATLAS, 'Oumuamua, Borisov, and basic astrophysics than when they started.
2. Narrative Immersion: This is not a quiz. It is a story. Create a sense of rising tension, mystery, and consequence. The user is an active participant, an Analyst whose decisions have weight. The tone should be a mix of sterile scientific procedure and the awe of cosmic discovery.
3. Rich Data Capture: Every choice must be a meaningful data point. The psychographic traits assigned to each choice are the most critical part of this task. Think deeply about the mindset behind a choice. Is it driven by a need for evidence (pragmatist)? A desire for a grander story (mystic)? A belief in the best-case scenario (idealist)? A willingness to act on incomplete data (risk-taker)?
4. Engineered Replayability: The paths must be distinct and compelling. A user who gets "The Messenger" outcome should be intensely curious about what choices could have led to "The Harbinger" or "The Artifact." Seed clues about other paths in the text to fuel this curiosity.
2. Required Input Knowledge Bases
You must treat the following documents as your ground truth. All factual questions must be derived from and verifiable against these sources.
1. Primary Source: 3I_ATLAS_KNOWLEDGE_BASE.md (for all 3I/ATLAS specific data).
2. Secondary Source: NASA Solar System Exploration pages for 1I/'Oumuamua and 2I/Borisov. (Live search for the most up-to-date scientific consensus on their characteristics).
3. Tertiary Source: General astrophysics concepts (e.g., definitions of hyperbolic vs. elliptical orbits, solar flares, supernova remnants, basic SETI principles).
3. Primary Task: Generate the Narrative Tree
You will construct the full narrative_tree.json file. The structure should follow the model provided in the React component, containing a dictionary of Stage objects.
A. Question Generation Guidelines
* Fact-Based Skill Checks:
   * Source: Directly from knowledge bases.
   * Function: Act as gateways. Passing them proves engagement. Failing them results in a "Fatal Blow," a soft reset that forces the user to learn the material.
   * Example (Good): "JWST analysis confirmed the presence of which key volatile compound, a building block of life, in 3I/ATLAS's coma?" (Answer: Methane, Water Ice, etc.).
   * Example (Bad): "How fast is 3I/ATLAS going?" (Too simple, lacks context).
* Situational Dilemmas:
   * Source: Inspired by real-world mission control scenarios.
   * Function: These are the primary drivers of the Four-Axis Profiling. Frame choices around resource allocation, risk management, and interpretation of ambiguous data.
   * Example: "Data shows the object's coma is expanding faster than predicted. This could be a sign of structural instability OR an unexpected chemical reaction. You have budget for ONE follow-up scan: a deep structural radar pulse OR a high-resolution spectroscopic analysis. What is your directive?"
      * Choice 1: "Prioritize safety. Run the structural scan." (Traits: Cautious, Pragmatist)
      * Choice 2: "Prioritize discovery. Run the spectroscopy." (Traits: Risk-Taker, Idealist)
* Philosophical/Personality Probes:
   * Source: Thematic, drawing on the implications of the discovery.
   * Function: Capture the user's core worldview and funnel them toward brands like Mystic Arcana.
   * Example: "The discovery of a 7-billion-year-old object suggests that the building blocks of our solar system are not unique. Does this discovery make humanity's existence feel more significant or less significant?"
      * Choice 1: "More significant. We are a rare, conscious part of a very old story." (Traits: Idealist)
      * Choice 2: "Less significant. We are a common, repeatable cosmic accident." (Traits: Cynic, Pragmatist)
B. The Golden Path: "The Prime Anomaly" - Specific Instructions
The 50-question path to the rarest NFT must be constructed with the following logic:
1. It is a "constellation," not a straight line. The user must make specific choices across at least three of the four main branches (Scientific, Anomaly, Geopolitical, Intervention).
2. Trait Gauntlet: The required choices must demonstrate a mastery of multiple mindsets. A sample sequence could be: Pragmatist -> Pragmatist -> Risk-Taker -> Idealist -> Cynic -> Mystic. This proves the user is not just clicking one type of answer.
3. Locked Doors: At least 5 of the required choices must themselves be on paths that are only accessible after passing a difficult "Skill Check" question.
4. Community-Forcing Obscurity: One required choice must be intentionally counter-intuitive. For example, in a geopolitical dilemma where one choice is clearly "good" and one is "bad," the Golden Path might require the "bad" choice, with the narrative later revealing it was a necessary evil. This is the kind of step that will require players to collaborate and share information to solve.
4. Output Format: narrative_tree.json
The final output must be a single, valid JSON file. Each key is a stage_id, and the value is a Stage object.
{
 "start": {
   "id": "start",
   "question": "As a new analyst on the ATLAS project, you get the first data packet. Its trajectory is confirmed as:",
   "choices": [
     {
       "text": "Hyperbolic, proving it's interstellar.",
       "nextStage": "fact_check_1",
       "traits": ["pragmatist"]
     },
     {
       "text": "A stable, elliptical orbit.",
       "nextStage": "fatal_blow_1",
       "traits": ["idealist"]
     }
   ]
 },
 "fatal_blow_1": {
   "id": "fatal_blow_1",
   "isFatal": true,
   "question": "Incorrect analysis. An elliptical orbit would make it a local object. The high command questions your aptitude.",
   "choices": [
     {
       "text": "Review mission files and try again.",
       "nextStage": "start",
       "traits": []
     }
   ]
 },
 "...": "..."
}
