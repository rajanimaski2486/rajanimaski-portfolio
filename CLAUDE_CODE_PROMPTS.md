# Claude Code build prompts

Use these in order. Each assumes PORTFOLIO_SPEC.md is in the repo root and readable. Paste the spec in first, then run the day prompt. Deploy at the end of every day.

## How to use this package

1. Put PORTFOLIO_SPEC.md in the repo root.
2. Open Claude Code in the repo and run the Setup prompt below.
3. Run Day 1 through Day 5 in order, one per working block. Deploy after each.
4. Prepare the corpus (see spec "Corpus readiness") during Day 1 and Day 2 downtime, before Day 3.

## Prerequisites to provision before Day 3 (do not let these block a build day)

- Aiven OpenSearch instance (free tier), connection URL + auth as Vercel env vars.
- NVIDIA NIM API key as env var; OpenAI key for gpt-4o-mini fallback as env var.
- Embedding model decided (drives the knn_vector dimension in the mapping).
- Corpus chunks written in the JSON format from the spec.

## Setup (once)

> Read PORTFOLIO_SPEC.md fully before writing any code. Scaffold a Next.js 14 App Router project with Tailwind and shadcn/ui, configured for the dark design tokens in the spec. Set up the accent color, fonts (a clean sans for body/headline, a mono for metadata), and the base/surface/panel background layers as CSS variables and Tailwind theme extensions. Initialize a git repo and a Vercel project. Do not build pages yet. Confirm the token system renders by making a single test page that shows the palette.

## Day 1: static landing (the floor)

> Build the landing page per the spec hero and current-work sections. Include: the latent-space canvas backdrop (about 60 drifting points, cursor-proximity brightening to accent with connecting lines, faint white links between near neighbors, frozen to static on mobile and prefers-reduced-motion), the mono header row, the headline "Staff / Principal AI engineer" with NYC beside it, the positioning paragraph verbatim from the spec, the five mono skill chips, the 96px circular portrait top-right with a 1.5px accent ring (use a placeholder image, stack above headline and center on mobile), the three current-work cards, the inline chat-invite bar (visual only for now, no chat wired), and the mono nav-out links. Wire a resume.pdf download in the header (placeholder PDF for now). Respect the writing-style rules. Deploy to Vercel and give me the URL.

## Day 2: content pages

> Build /projects, /talks, and /about per the spec.
> /projects: one filterable grid (filter chips by stack or type), active and past together, each tile with thumbnail, name, one-line purpose, a compact mono tech strip (frameworks, models, domain, infra, purpose), and github + deployed links. Use the projects listed in the spec; I will supply copy and thumbnails inline.
> /talks: talks and writing entries (title, venue/date, one-line takeaway, link), plus the compact mono certifications strip (named certs only, no course enumeration).
> /about: three short blocks, running, hiking, autism advocacy.
> Add a per-page inline chat-invite bar hooked to each page's strongest claim. Keep every page brief and one-glance. Deploy.

## Day 3: RAG endpoint with tool routing (no UI)

> Read the RAG section of the spec. Keep the stack framework-free: OpenAI SDK directly, OpenSearch, no LangChain and no LangSmith. Build a Vercel serverless function that uses OpenAI SDK tool-calling to route among distinct retrieval tools (search_projects, search_talks, get_resume_section, search_about, get_contact), each mapping to a targeted OpenSearch query. Support a light plan-then-answer path for comparison questions (retrieve both subjects, then synthesize). Use NVIDIA NIM as primary and gpt-4o-mini as fallback. Add an out-of-scope guardrail: a relevance check that refuses anything not about Rajani's work or background with a fixed line, and the same refusal on empty or low-confidence retrieval. The answer must cite the chunk(s) used and return the tool(s) chosen. Never fabricate. Also write the indexing script (corpus loaded into OpenSearch with a source_type field for routing) and a hand-rolled Python grounding-eval harness: an eval set of questions with expected source and a faithfulness check, plus guardrail cases that must produce the refusal. No LangChain anywhere. Provide curl examples for a grounded answer, a comparison question, and an out-of-scope refusal.

## Day 4: chat panel

> Build the chat UI per the spec. Docked pill bottom-right, collapsed, with the green status dot, "Ask me anything" label, mic icon, 1px accent border, and a one-time double pulse about 1.2s after load that then settles (never loops). Clicking the pill or any inline invite opens a side panel (not a full takeover). Panel shows the three suggested-prompt buttons on open, streams responses from the Day 3 endpoint, renders accent citation chips under each answer, shows the chosen tool(s) as a small mono tag (e.g. → search_projects), and renders the fixed refusal line for out-of-scope questions. Add the recruiter-mode toggle that preloads the three hiring-manager questions. Deploy.

## Day 5: voice + polish

> Add voice to the existing chat panel using the browser Web Speech API. A mic toggle in the panel header switches to voice mode: speech-to-text feeds the same Day 3 endpoint, and text-to-speech reads the grounded answer back. Same agent, no new endpoint. Then do a polish pass: mobile layout (portrait stacks and centers, canvas freezes, panel goes full-width), prefers-reduced-motion (canvas static), spacing and type consistency against the tokens, and a Lighthouse check. Deploy final.

## Maintenance: extract standard resume facts into the corpus

Run this when the chat cannot answer a standard recruiter question (location,
current title, employment history, skills) that the resume plainly states. It
turns the resume PDF into new `corpus/corpus.json` chunks and was used to add the
`resume-location-01`, `resume-current-title-01`, `resume-employment-history-01`,
`resume-skills-01`, and `resume-nvidia-infra-01` chunks after "where is Rajani
located" returned "I do not know."

> I am attaching Rajani's resume PDF. The grounded chat could not answer a
> standard recruiter question ("where is Rajani located") even though the answer
> is on the resume. This is a retrieval gap: the corpus has no chunk stating that
> fact. Read `corpus/corpus.json`, `src/lib/rag/tools.ts`, and
> `src/lib/rag/guardrail.ts` first so new content is actually retrievable and in
> scope. Then extract the important, standard, commonly asked recruiter facts from
> the resume — location, current title and employer, employment history with
> companies and dates, years of experience, core skills and languages, NVIDIA and
> ML infrastructure experience, education, and certifications — and, for anything
> not already covered by an existing chunk, add a new chunk to `corpus/corpus.json`.
> Rules: use `source_type: "resume"` so `get_resume_section` retrieves it; write
> in the first person to match the existing resume chunks; ground every sentence in
> the resume and invent nothing (no work-authorization, relocation, remote, or
> phone claims the resume does not state); give each chunk a unique kebab-case id,
> a section, and specific tags including the literal words a recruiter would use
> (located, based, where, city). Then add the location and skills keywords to the
> guardrail keyword list and mention location/skills/employment in the
> `get_resume_section` tool description so routing and the scope gate pick these up.
> Re-index with `python scripts/index_corpus.py --recreate` and confirm the failing
> question now answers correctly.

## If time compresses

Cut in this order: voice, then recruiter-mode toggle, then degrade citation chips to plain "source: name" text. Never cut grounding. Never cut the Day 1 static landing + resume PDF.

## Reminders to give Claude Code

- Do not introduce LangChain, LangGraph, LlamaIndex, or LangSmith anywhere. Framework-free is the deliberate position; routing and eval are SDK-native and hand-rolled.
- It is RAG with tool routing, not a ReAct agent. Label it precisely in the UI; do not call retrieval an "agent."
- Do not use browser localStorage/sessionStorage in any client component.
- Keep the accent color to only the elements the spec names.
- No apostrophe-contractions and no dashes in any user-facing copy.
- Make no performance claim the corpus or a project page cannot substantiate.
EOF
echo done