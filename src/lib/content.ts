/*
  Single source of truth for site copy and metadata.
  Verbatim strings from PORTFOLIO_SPEC.md are marked. Writing-style rules:
  no apostrophe-contractions, no dashes in prose, no unverified perf claims.

  NOTE: links marked TODO are placeholders — confirm the real URLs/handles.
*/

export const site = {
  name: "Rajani Maski",
  handle: "rajanim", // mono, accent, header
  role: "Staff / Principal AI engineer",
  location: "NYC",
  email: "rajani.maski@gmail.com",
  github: "https://github.com/rajanim",
  linkedin: "https://www.linkedin.com/in/rajanimaski/",
  resume: "/RajaniMaski_Resume_June_2026.pdf",
};

// Verbatim from spec — do not paraphrase.
export const positioning =
  "15+ years from classical IR to modern AI: model training, relevance ranking, and learning-to-rank, retrieval serving 2000+ RPS in production. Now building agentic and multimodal systems spanning retrieval, ranking, and image generation. Working the line between retrieval and intelligence.";

// Mono, bordered chips (spec order).
export const skillChips = [
  "model training",
  "learning-to-rank",
  "multimodal retrieval",
  "agentic systems",
  "LLMOps",
];

export type CurrentWork = {
  name: string;
  what: string; // one line
  href: string;
  deployed: boolean; // true -> external-link accent icon; false -> github secondary icon
};

// CURRENT WORK cards (landing). One line of "what" each; stack lives on /projects.
export const currentWork: CurrentWork[] = [
  {
    name: "Reveal",
    what: "Agentic retrieval and culling over large image sets.",
    href: "https://intent-context-cognition-brown.vercel.app/",
    deployed: true,
  },
  {
    name: "GridWatch",
    what: "Anomaly detection and ranking over operational telemetry.",
    href: "https://github.com/rajanim/GridWatch",
    deployed: false,
  },
  {
    name: "Selective search",
    what: "Topic-based selective search over document shards.",
    href: "https://github.com/rajanim/selective-search",
    deployed: false,
  },
];

// Nav-out links (mono, landing footer area).
export const navOut = [
  { label: "projects", href: "/projects" },
  { label: "talks", href: "/talks" },
  { label: "interests", href: "/about" },
];

// Chat suggested prompts (shown on panel open; removes blank-box hesitation).
export const suggestedPrompts = [
  "What is the 2000+ RPS retrieval system?",
  "How does Reveal differ from Scene Finder?",
  "Why keep retrieval framework-free?",
];

// Recruiter mode preloads the hiring-manager questions (pre-frames Staff signals).
export const recruiterPrompts = [
  "What is the scope and impact of your work?",
  "What was the hardest technical decision you made?",
  "What would you do differently?",
];

/* ---------------------------------------------------------------------------
   /projects
   One filterable grid, active + past together. Compact mono tech strip per tile.
   TODO: confirm copy, links, and tech details with real values.
--------------------------------------------------------------------------- */

export type Project = {
  slug: string;
  name: string;
  purpose: string; // one line
  status: "active" | "past";
  // mono tech strip (all fields optional — only known ones render)
  tech: {
    frameworks?: string;
    models?: string;
    domain?: string;
    infra?: string;
  };
  tags: string[]; // filter chips (stack / type)
  github?: string;
  deployed?: string; // live app
  video?: string; // youtube demo / talk / presentation
};

export const projects: Project[] = [
  {
    slug: "reveal",
    name: "Reveal",
    purpose: "Agentic retrieval and culling over large image sets.",
    status: "active",
    tech: {
      frameworks: "OpenAI SDK, Next.js",
      models: "NVIDIA NIM",
      domain: "Multimodal retrieval",
      infra: "Aiven OpenSearch, Vercel",
    },
    tags: ["Retrieval", "Multimodal", "Agentic"],
    github: "https://github.com/rajanimaski2486/intent-context-cognition",
    deployed: "https://intent-context-cognition-brown.vercel.app/",
  },
  {
    slug: "gridwatch",
    name: "GridWatch",
    purpose: "Anomaly detection and ranking over operational telemetry.",
    status: "active",
    tech: {
      models: "Learning-to-rank",
      domain: "Observability",
    },
    tags: ["Ranking", "LLMOps"],
    github: "https://github.com/rajanim/GridWatch",
    video: "https://youtu.be/zSUSf-1iJh8",
  },
  {
    slug: "selective-search",
    name: "Selective search",
    purpose:
      "Topic-based shard partitioning that searches fewer shards without losing search quality.",
    status: "past",
    tech: {
      domain: "Classical IR, distributed retrieval",
      models: "Topic-based partitioning",
      infra: "Distributed search shards",
    },
    tags: ["Retrieval", "Ranking", "Research"],
    github: "https://github.com/rajanim/selective-search",
    video: "https://youtu.be/CLX41ePTk3Q",
  },
  {
    slug: "am-i-replaceable-by-ai",
    name: "Am I replaceable by AI",
    purpose: "A playful calculator that estimates how replaceable a job is by AI.",
    status: "active",
    tech: {
      domain: "Educational, entertainment",
      models: "LLM",
    },
    tags: ["Apps", "LLM"],
    github: "https://github.com/rajanimaski2486/am_i_replacable_by_ai_calculator",
  },
  {
    slug: "dessert-near-me",
    name: "Dessert near me",
    purpose: "A fun app to find desserts near you.",
    status: "active",
    tech: {
      domain: "Location, discovery",
    },
    tags: ["Apps"],
    github: "https://github.com/rajanimaski2486/dessert-near-me",
    video: "https://youtu.be/UhyNPlpYpj0",
  },
  {
    slug: "scene-finder",
    name: "Scene Finder",
    purpose: "Multimodal scene search across video and stills.",
    status: "active",
    tech: {
      domain: "Video + image search",
    },
    tags: ["Retrieval", "Multimodal"],
  },
  {
    slug: "openclaw",
    name: "OpenClaw",
    purpose: "Open retrieval tooling for grounded answers.",
    status: "active",
    tech: {
      domain: "RAG tooling",
    },
    tags: ["Retrieval", "Agentic"],
  },
];

// Stable list of filter tags, derived once.
export const projectTags = Array.from(
  new Set(projects.flatMap((p) => p.tags))
).sort();

/* ---------------------------------------------------------------------------
   /talks  — talks, writing, certifications strip
--------------------------------------------------------------------------- */

export type Talk = {
  title: string;
  venue: string; // venue + date
  takeaway: string; // one line
  href?: string; // slides
};

export const talks: Talk[] = [
  {
    title: "Tool routing for grounded retrieval without a framework",
    venue: "OpenSearchCon India 2026",
    takeaway: "Tool routing because the corpus spans domains; framework-free because the SDK was enough.",
    href: "#",
  },
  {
    title: "From learning-to-rank to agentic retrieval",
    venue: "Optimized AI Conference 2026, Atlanta",
    takeaway: "What classical IR still teaches the agentic era about relevance.",
    href: "#",
  },
];

export type Writing = {
  title: string;
  takeaway: string;
  href: string;
};

export const writing: Writing[] = [
  {
    title: "Why I keep retrieval framework-free",
    takeaway: "The SDK tool API is sufficient; the framework is the liability.",
    href: "#",
  },
  {
    title: "Grounding evals you can actually run",
    takeaway: "A small hand-rolled harness beats a hosted black box for a static corpus.",
    href: "#",
  },
];

// Named certs only. No course enumeration (those live in the resume + RAG corpus).
export const certifications: string[] = [
  "AWS GenAI Professional",
  "NVIDIA NCP-AAI",
  "NVIDIA NCA-AIIO",
];

/* ---------------------------------------------------------------------------
   /about  — three short blocks, humanizing
--------------------------------------------------------------------------- */

export type AboutBlock = { title: string; body: string };

export const about: AboutBlock[] = [
  {
    title: "Running",
    body: "Long, steady mileage. The same patience that retrieval work rewards: show up, log the distance, let the curve bend over months not days.",
  },
  {
    title: "Hiking",
    body: "Weekends on trail, often with elevation as the only metric that matters. A reset from screens and a reminder that good systems, like good routes, are mostly preparation.",
  },
  {
    title: "Autism advocacy",
    body: "Work close to my heart: supporting autistic people and their families, and pushing for environments that assume capability and accommodate difference. It informs how I think about access and design in everything else.",
  },
];
