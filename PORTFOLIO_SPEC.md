# Portfolio site build spec

One-week, time-boxed. Ship-fast then enhance. Resume-first, AI as reward for the curious.

This document is the build brief. Hand it to Claude Code section by section.

## Principles (do not violate)

- Landing is the resume. Full value with zero AI clicks. PDF download is the escape hatch.
- AI features are offered, never imposed. Chat pill collapsed by default.
- Every page brief, one-glance readable. No verbose prose. No self-declaratory Staff framing (show, do not tell).
- One accent color, used only where it means something.
- Motion only in the hero. Everything below is calm and static.
- Writing style: no apostrophe-contractions, no dashes in prose, no unverified performance claims.

## Stack

- Next.js 14 App Router, deployed Vercel free tier.
- Tailwind + shadcn/ui (dark palette overridden with tokens below).
- RAG: Aiven OpenSearch (free tier), OpenAI SDK only. NVIDIA NIM primary, gpt-4o-mini fallback.
- Voice: browser Web Speech API (STT + TTS). Zero extra infra.
- No LangChain/LlamaIndex for orchestration. Thin serverless function.

## Design tokens

- Base background: `#0a0e14` (near-black, blue-black).
- Surface (cards): `#10151d`.
- Panel (chat/elevated): `#151b24`.
- Accent: `#5dcca5` (cyan-green). Used ONLY for: name, active links, citation chips, send action, chat pill border, mic, status dots, portrait ring, inline-invite highlight. Nowhere else.
- Text primary: `#e6e9ee` (off-white, never pure white).
- Text secondary: `#9aa3af`.
- Text tertiary / metadata: `#7a828f`.
- Borders: `rgba(255,255,255,0.08)` default, `rgba(255,255,255,0.12)` hover.
- Mono font for all metadata: name, nav, skill chips, links, labels. Sans for body and headlines.
- Headline weight 500. Body weight 400. Two weights only.
- Reduced-motion + mobile: freeze hero canvas to a static point field.

## Routes

- `/` landing (the resume)
- `/projects` active + past, one filterable grid
- `/talks` talks, writing, certifications strip
- `/about` running, hiking, autism advocacy
- Chat + voice: persistent docked pill, not a route.

## Landing page (`/`)

Top to bottom: one distinctive hero, then calm scroll.

### Hero (top ~280px, the one moment of motion)

- Latent-space canvas backdrop: drifting point field, ~60 points; points near cursor brighten to accent and connect with thin lines; faint white links between near neighbors. Freeze to static on mobile / reduced-motion.
- Header row (mono): `rajanim` (accent) · github · linkedin · resume.pdf (accent-underlined, download icon).
- Left column:
  - Headline (sans, ~26px, weight 500): **Staff / Principal AI engineer**, with `NYC` (mono, tertiary) on the baseline beside it.
  - Positioning line (sans, secondary, max-width ~460px):
    "15+ years from classical IR to modern AI: model training, relevance ranking, and learning-to-rank, retrieval serving 2000+ RPS in production. Now building agentic and multimodal systems spanning retrieval, ranking, and image generation. Working the line between retrieval and intelligence."
  - Skill chips (mono, bordered): model training · learning-to-rank · multimodal retrieval · agentic systems · LLMOps
- Right column: portrait, 96px, circular, 1.5px accent ring at 0.5 opacity, surface background. On mobile: stacks above the headline, centered. Photo brief: head-and-shoulders, soft directional light, dark/neutral background to sit against base, natural editorial (not over-retouched corporate headshot).

### Current work (static, calm)

Section label (mono, uppercase, tracked): CURRENT WORK.
Three compact cards in an auto-fit grid (min ~170px): Reveal, Scene Finder, OpenClaw. Each card: name (primary, 13px, weight 500) + link icon (external-link in accent if deployed, github in secondary if repo only); one line of what underneath (secondary, ~11.5px). Stack details live here, not in the headline.

### Inline chat invite (second door)

Directly under the current-work cards. Subtle accent-tinted bar: `rgba(93,204,165,0.06)` background, `rgba(93,204,165,0.25)` border, sparkles icon (accent), text "Curious about the 2000+ RPS or any project? Ask the agent, by chat or voice." with "2000+ RPS" in accent, arrow-right icon at far end. Hover brightens. Clicking opens the chat panel. One inline invite per page, hooked to that page's strongest claim (on /projects: "ask how any of these were built").

### Nav out + footer

Mono links: projects → · talks → · interests →. Minimal footer.

## Chat + voice (persistent, both entry doors)

### Pill (first door)

- Bottom-right, docked, collapsed by default. Background panel color, 1px accent border at 0.4, rounded 22px.
- Green status dot (accent) + label "Ask me anything" + mic icon (accent).
- One-time attention: ~1.2s after load, pulse the border/box-shadow twice (1.4s ease-out, 2 iterations) then settle. Never loops.
- Expands to a panel (not a full takeover) so page content stays visible behind.

### Chat panel

- Dark panel. Accent ONLY on send action and citation chips.
- Three suggested-prompt buttons on open (removes blank-box hesitation, pre-frames around Staff signals):
  - "What is the scope and impact of your work?"
  - "What was the hardest technical decision you made?"
  - "What would you do differently?"
- Streamed responses.
- Citation chips under each answer (accent). The chips are where accent earns its keep: they signal RAG hygiene.
- Show the chosen tool(s) as a small mono tag above or beside the answer (e.g. `→ search_projects`), so the routing is visible.
- Out-of-scope questions render the fixed refusal line, not an answer or a citation.
- Optional recruiter-mode toggle: preloads the three hiring-manager questions. (Cuttable.)

### Voice (same brain, second input)

- Mic toggle in panel header. Switches panel to voice mode.
- Web Speech STT in, Web Speech TTS reads the grounded answer back.
- One agent, two front doors. Voice is the demo flourish and the explicit cut line if time compresses.

## RAG endpoint with SDK-native tool routing

Stack identity is fixed: OpenAI SDK directly, OpenSearch as the layer, NO LangChain/LlamaIndex, NO LangSmith. The portfolio must stay consistent with the architecture stated across all other projects. Framework-free is a deliberate Staff-level position; do not contradict it on the one artifact a hiring manager will click. (LangChain/LangGraph/LangSmith belong in a separate comparative project where the framework choice is the point, not here.)

This is RAG with SDK-native tool routing, not a ReAct agent. Be precise about that distinction in the UI: it is grounded retrieval over a small static corpus, with real tool selection. Do not call it an "agent" where it is retrieval. Knowing the difference is itself the senior signal.

### Corpus + index

- Index into Aiven OpenSearch: project descriptions, talk abstracts, resume content, about blurbs, AND course/cert detail. One doc per logical chunk.
- Separate logical indices or a `source_type` field so the routing layer can target them: projects, talks, resume, about, courses/certs.

### Index mapping + chunking (do this right up front; a bad mapping means a re-index)

Single index `portfolio_corpus` with a `source_type` keyword field for routing (simpler than five indices at this corpus size; each tool filters on `source_type`).

Mapping fields:
- `id` (keyword) stable chunk id, e.g. `reveal-decision-01`.
- `source_type` (keyword) one of: projects, talks, resume, about, courses.
- `title` (text + keyword subfield) e.g. "Reveal".
- `section` (keyword) e.g. purpose | stack | role | decision | result | takeaway | bio.
- `text` (text, standard analyzer) the chunk body, used for BM25.
- `embedding` (knn_vector, dimension matching the chosen embedding model) for vector search.
- `url` (keyword) link to repo / deployed / slides, for citation.
- `tags` (keyword array) optional, e.g. stack terms for filtering.

Enable kNN on the index. Each retrieval tool runs a hybrid query: BM25 on `text` + kNN on `embedding`, filtered by the relevant `source_type`. Low-confidence threshold on the top score feeds the guardrail refusal.

Chunking strategy:
- One chunk per logical unit, NOT fixed token windows. A project becomes several chunks by `section`: purpose, stack, your specific role, the hardest decision, the result. Keep each chunk self-contained (200 to 400 words) so a citation points at one coherent idea.
- Talks: one chunk for abstract, one for takeaway.
- Resume: one chunk per role or theme.
- Courses/certs: one summarizing chunk per domain (not one per course).
- Small corpus by design. Quality and self-containment beat volume; this is what makes citations precise.

### SDK-native tool routing (the legitimately agentic layer)

The model selects among distinct retrieval tools rather than querying one flat index. Built with OpenAI SDK tool-calling directly, no framework. The routing earns its place because the corpus spans distinct domains.

- Tools: `search_projects`, `search_talks`, `get_resume_section`, `search_about`, `get_contact`. Each maps to a targeted OpenSearch query.
- For comparison questions (e.g. "how does Reveal differ from Scene Finder"), allow a light plan-then-answer: retrieve both, then synthesize. This is orchestration the question genuinely requires, not theater.
- Surface the chosen tool(s) in the UI (a small mono tag like `→ search_projects`) so the routing is visible. This is what makes it demonstrably agentic.
- Interview line this supports: "tool routing because the corpus spans distinct domains, kept framework-free because the SDK tool API was sufficient."

### Guardrail (out-of-scope rejection)

- Before/around retrieval, a relevance check: if the question is not about Rajani's work, background, projects, talks, or interests, refuse with a fixed line, e.g. "I only answer questions about Rajani's work and background." 
- Also trigger the refusal on empty or low-confidence retrieval (score threshold). Never fabricate to fill a gap.
- This out-of-scope handling is a visible quality signal and the highest-value item in the chat. Make it explicit.

### Grounding + answers

- Serverless function (Vercel): route to tool(s), retrieve top-k, compose grounded answer via OpenAI SDK (NIM primary, gpt-4o-mini fallback).
- Grounded with citations: answer cites which chunk(s) it used. Explicit "I do not know" path. Never fabricate.
- Stream responses.
- The "2000+ RPS" claim must be substantiated here and on at least one project page. A number without a story reads as a claim.

### Grounding evaluation (own harness, NOT LangSmith)

- A small offline eval set: questions, expected source, a faithfulness/groundedness check. Run by a hand-rolled Python harness (the same flagship eval approach used across other projects), reusable, self-contained.
- Also cover guardrail cases: out-of-scope questions must produce the refusal, not an answer.
- Optionally surface results as a tiny "evaluated for grounding" note or a small metrics view. Self-contained artifact, on-brand.

## Projects page (`/projects`)

One filterable grid, active and past together (do not split, content too thin). Filter chips by type or stack.

Each tile, one-glance:
- Image/thumbnail.
- Name + one-line purpose.
- Compact labeled tech strip (mono, tiny), covering: frameworks/tools, models, domain, infra/environment, purpose. Brief, never a paragraph. Use a hover/expand if it crowds the tile.
- Links: github + deployed link if live.

Projects: Reveal, Scene Finder, GridWatch, OpenClaw (active); plus past work pulled from resume.

## Talks page (`/talks`)

Reframed from "visionary/leadership" (self-declared visionary is a flag at this level).

- Talks: OpenSearchCon India 2026, Optimized AI Conference 2026 Atlanta. Each: title, venue/date, one-line takeaway, link to slides.
- Writing: LinkedIn articles, blog. Each: title, one-line takeaway, link.
- Certifications strip (compact, mono, one row, named certs only): AWS GenAI Professional, NVIDIA NCP-AAI, NCA-AIIO (list once earned). Do NOT enumerate courses here. Courses become one summarizing line on the resume PDF and full detail in the RAG corpus only.

## About page (`/about`)

Clearly secondary, humanizing. One page, three short blocks: Running, Hiking, Autism advocacy (give it genuine weight, keep it brief). Optional fuller portrait here if landing is kept all-business.

## Resume PDF

Canonical document, linked from header. Carries the full certifications line and the summarized-courses line ("40+ completed courses across LLMs, RAG, and agentic systems" rather than an enumeration).

## NVIDIA note

If NVIDIA stays primary target: once NVIDIA certs are earned, reserve a single accent line near the hero/current-work, e.g. "NVIDIA-certified: Agentic AI, AI Infrastructure." One precise signal for one employer. Hold until exams pass; do not list in-progress certs.

## Time box (5 working blocks, weekend is buffer not work)

- Day 1: Scaffold + static landing. Next.js on Vercel, full landing (hero canvas, headline, positioning, chips, portrait, current-work cards, inline invite, nav), resume PDF wired, deployed live by EOD. THE FLOOR. If everything after fails, a shipped portfolio exists.
- Day 2: Three content pages. Projects grid, talks (+ certs strip), about. Static, brief. EOD = complete non-AI portfolio you would send anyone.
- Day 3: RAG endpoint. Index content into OpenSearch (incl. course/cert detail), build serverless function, NIM + gpt-4o-mini fallback, grounded + citations. Test via curl, no UI.
- Day 4: Chat panel. Wire pill (with one-time pulse) + inline invites, suggested prompts, streaming, citation chips.
- Day 5: Voice + polish. Web Speech in/out, mic toggle, visual cleanup, mobile + reduced-motion check (portrait stacks, canvas freezes).

### Cut lines (when time compresses, cut in this order)

1. Voice (Day 5) cuts first. Site stands without it.
2. Recruiter-mode toggle cuts second.
3. Citation chips can degrade to "source: project name" text if chip UI runs long, but do NOT cut grounding itself.
4. Never cut: the static landing + resume PDF (Day 1 floor).

## Corpus readiness (do before Day 3, ideally pull into Day 1 downtime)

The RAG agent is only as good as its corpus. Prepare clean, self-contained chunks following the mapping above. A thin or vague corpus makes the agent vague, which undercuts the "rewards the curious" premise.

Chunk format (one JSON object per chunk, fed to the indexing script):

```
{
  "id": "reveal-decision-01",
  "source_type": "projects",
  "title": "Reveal",
  "section": "decision",
  "text": "The hardest decision on Reveal was ... (200-400 words, self-contained, first person, your specific role and reasoning).",
  "url": "https://github.com/...",
  "tags": ["NVIDIA NIM", "OpenSearch", "culling"]
}
```

Prepare chunks for: each project (purpose, stack, your specific role, the hardest decision, the result), each talk (abstract + takeaway), resume (one per role/theme), about (running, hiking, autism), courses/certs (one summarizing chunk per domain). Substantiate the 2000+ RPS claim in at least one project chunk with the story behind the number.
