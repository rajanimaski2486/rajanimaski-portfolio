/*
  Single source of truth for site copy and metadata.
  Verbatim strings from PORTFOLIO_SPEC.md are marked. Writing-style rules:
  no apostrophe-contractions, no dashes in prose, no unverified perf claims.

  NOTE: links marked TODO are placeholders — confirm the real URLs/handles.
*/

export const site = {
  name: "Rajani Maski",
  role: "Staff / Principal AI engineer",
  location: "NYC",
  email: "rajani.maski@gmail.com",
  github: "https://github.com/rajanim",
  linkedin: "https://www.linkedin.com/in/rajanimaski/",
  resume: "/RajaniMaski_Resume_June_2026.pdf",
};

// Current role + prior background (mono lines under the headline).
export const roleNow = {
  employer: "Shutterstock",
  focus: "Multimodal Generative Discovery",
  tenure: "4 yrs",
};
export const rolePrior =
  "Professional Services Consulting Engineer, Customer Facing · 6 yrs · Software Engineering · 7 yrs";

// Positioning statement under the headline.
export const positioning =
  "17+ years spanning the evolution from classical IR and relevance engineering to modern AI-driven discovery.";

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
    name: "Shutterstock AI Search",
    what: "Conversational AI search that finds images, video, and music from a natural-language brief.",
    href: "https://www.shutterstock.com/search?mode=ai",
    deployed: true,
  },
  {
    name: "Reveal",
    what: "Search finds. Reveal discovers. Generative Discovery on OpenSearch, an agentic query workflow built as a conference presentation for education and demo.",
    href: "https://intent-context-cognition-brown.vercel.app/",
    deployed: true,
  },
  {
    name: "GridWatch",
    what: "Anomaly detection and ranking over operational telemetry.",
    href: "https://github.com/rajanim/GridWatch",
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
  "What's the largest system you've built?",
  "What did you do before Shutterstock?",
  "How does your consulting background help you?",
  "What are you passionate about beyond AI?",
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
    slug: "shutterstock-ai-search",
    name: "Shutterstock AI Search",
    purpose:
      "Conversational, generative AI search: describe your creative vision in natural language and get cross-media results across image, video, and music.",
    status: "active",
    tech: {
      domain: "Multimodal discovery, generative search",
      models: "generative AI",
    },
    tags: ["Retrieval", "Multimodal", "Generative"],
    deployed: "https://www.shutterstock.com/search?mode=ai",
  },
  {
    slug: "reveal",
    name: "Reveal",
    purpose:
      "Single page app built during OpenSearchCon to demonstrate the three pillars of Generative Discovery. Intent: the query analyzed and encoded as a semantic vector that captures meaning and purpose, not just a bag of words. Context: a session vector that remembers the conversation, recency weighted. Cognition: reasoning that decomposes contradictory queries, filters, then LLM reranks.",
    status: "active",
    tech: {
      frameworks: "OpenAI SDK, Next.js",
      models: "NVIDIA NIM",
      domain: "Generative Discovery: Intent, Context, Cognition",
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
  takeaway: string; // brief on what the talk is
  href?: string; // primary link (session page or live demo)
  video?: string; // recorded talk
  embed?: string; // YouTube embed URL, rendered inline on /talks
};

export const talks: Talk[] = [
  {
    title: "Generative Discovery on OpenSearch: Intent, Context, Cognition",
    venue: "OpenSearchCon India 2026 · June 15, 2026",
    takeaway:
      "Search finds; discovery reveals. Generative Discovery treats every interaction as a signal of intent, builds context across modalities with session aware RAG on OpenSearch, and applies cognition so agents surface what users did not know to ask for, all at 2000+ requests per second.",
    href: "https://opensearchconin2026.sched.com/event/2KF73/generative-discovery-on-opensearch-intent-context-cognition-rajani-maski-shutterstock",
    embed:
      "https://www.youtube.com/embed/CxE2YHK1qh8?si=82g6KwBlF7NgFb6Z&start=107",
  },
  {
    title: "From Boolean Search to Agentic Generative Discovery",
    venue: "Orchestrating 25 years of IR innovation",
    takeaway:
      "Twenty five years of IR folded into modern agentic systems: agents decide when to use BM25 for exact matches, embeddings for semantic recall, cross encoders for precision, and CLIP for visual search. Lexical foundations, multimodal retrieval, and hybrid fusion, built for Shutterstock's media library.",
    href: "https://intent-context-cognition-brown.vercel.app/",
    embed:
      "https://www.youtube.com/embed/LP59ugyd0vQ?si=H8myGibavhgu4tn3&start=8",
  },
  {
    title: "GridWatch App Demo",
    venue: "Built for Spark Hack NYC 2026",
    takeaway:
      "Demo walkthrough of GridWatch, an app built for the Spark Hack NYC 2026 hackathon.",
    embed: "https://www.youtube.com/embed/zSUSf-1iJh8?si=UwMUbMiVJYCBOy7B",
  },
  {
    title:
      "Reduce Query Time up to 60% with Selective Search - Rajani Maski, Lucidworks",
    venue: "Activate · Lucidworks",
    takeaway:
      "Selective search partitions a large index into topically coherent shards and queries only the most relevant ones, cutting query time by up to 60% while preserving relevance.",
    embed: "https://www.youtube.com/embed/CLX41ePTk3Q?si=2AwxGzomE6pKLsen",
  },
];

export type Writing = {
  title: string;
  takeaway: string;
  href: string;
};

export const writing: Writing[] = [
  {
    title: "Writing and posts on LinkedIn",
    takeaway:
      "Short notes and articles on modern generative AI, retrieval, ranking, agentic systems, and Robotics. Latest activity and long form posts.",
    href: "https://www.linkedin.com/in/rajanimaski/recent-activity/all/",
  },
];

export type Certification = {
  name: string;
  status?: "in progress";
};

// Named certs plus the DeepLearning.AI body of work. In-progress credentials
// are marked, not hidden. Full list lives on LinkedIn (certsLink).
export const certifications: Certification[] = [
  { name: "AWS GenAI Professional" },
  { name: "40+ DeepLearning.AI courses: Agentic, Voice, Generative AI" },
  { name: "NVIDIA NCP-AAI", status: "in progress" },
  { name: "NVIDIA NCA-AIIO", status: "in progress" },
];

export const certsLink =
  "https://www.linkedin.com/in/rajanimaski/details/certifications/";

/* ---------------------------------------------------------------------------
   /about  — three short blocks, humanizing
--------------------------------------------------------------------------- */

export type AboutBlock = {
  title: string;
  body: string;
  link?: { label: string; href: string };
};

export const about: AboutBlock[] = [
  {
    title: "Running",
    body: "🏃 Running is my happy place. Always up for a marathon or the next challenge. Nothing beats the runner's high, a clear mind, and the feeling of crossing the finish line. Reward me with a cold beer 🍺 and a slice (or three) of pizza 🍕, and that is pretty much a perfect day.",
    link: { label: "Follow me on Strava", href: "https://strava.app.link/qKkdST7cz4b" },
  },
  {
    title: "Hiking",
    body: "Weekends on the trail with family and friends are my favorite way to recharge. The combination of fresh air, mountain views, cool breezes, and peaceful trails surrounded by trees and water brings joy and connection, and keeps the oxytocin flowing.",
    link: {
      label: "Follow me on AllTrails",
      href: "https://www.alltrails.com/members/rajani-maski",
    },
  },
  {
    title: "AI for Autism",
    body: "AI for Autism is where my passion and personal journey meet. As the mother of an autistic son, I have spent years learning, advocating, and supporting his growth in communication and confidence. This journey inspires me to explore how AI can provide practical, evidence informed support for autistic children and their families. I would be happy to connect and share experiences.",
    link: { label: "Watch on YouTube", href: "https://www.youtube.com/playlist?list=PLODD7Ooke9w4" },
  },
];
