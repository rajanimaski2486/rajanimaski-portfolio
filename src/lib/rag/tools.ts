import type { ChatCompletionTool } from "openai/resources/chat/completions";
import { hybridSearch, type Retrieved } from "./opensearch";
import { site, projects } from "@/lib/content";
import type { SourceType } from "./config";

// Name every project in the routing description so the router picks
// search_projects for any of them, including the newer/lighter apps.
const PROJECT_NAMES = projects.map((p) => p.name).join(", ");

/*
  SDK-native tool routing. The model selects among distinct retrieval tools,
  each mapped to a targeted OpenSearch query. This earns its place because the
  corpus spans distinct domains. It is RAG with tool routing, NOT a ReAct agent.
*/

export const TOOL_NAMES = [
  "search_projects",
  "search_talks",
  "get_resume_section",
  "search_about",
  "get_contact",
] as const;

export type ToolName = (typeof TOOL_NAMES)[number];

// Which source_type(s) each tool retrieves over.
const TOOL_SOURCES: Record<Exclude<ToolName, "get_contact">, SourceType | SourceType[]> = {
  search_projects: "projects",
  search_talks: "talks",
  get_resume_section: ["resume", "courses"], // courses/certs are resume-adjacent
  search_about: "about",
};

export const tools: ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "search_projects",
      description:
        `Search Rajani's projects (${PROJECT_NAMES}, and past IR work): purpose, stack, role, hardest decision, results. Use for any question naming or about one of these projects, what was built, how, the 2000+ RPS Generative Discovery retrieval system at Shutterstock, and the fun or educational apps.`,
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "The retrieval query." },
        },
        required: ["query"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "search_talks",
      description:
        "Search Rajani's conference talks and writing: abstracts and takeaways on retrieval, ranking, and framework-free design.",
      parameters: {
        type: "object",
        properties: { query: { type: "string" } },
        required: ["query"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_resume_section",
      description:
        "Retrieve resume content by role or theme, plus courses and certifications detail. Use for what Rajani is working on now / currently / right now / these days, her current role, title, and focus at Shutterstock, where she is located / based / lives (New York, NY), her employment history and past companies with dates, career history, years of experience, core skills and tech stack, programming languages, and her NVIDIA and ML infrastructure experience.",
      parameters: {
        type: "object",
        properties: { query: { type: "string" } },
        required: ["query"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "search_about",
      description:
        "Search personal/interests content: running, hiking, autism advocacy.",
      parameters: {
        type: "object",
        properties: { query: { type: "string" } },
        required: ["query"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_contact",
      description:
        "Return Rajani's contact and profile links (email, GitHub, LinkedIn). No query needed.",
      parameters: { type: "object", properties: {} },
    },
  },
];

export type ToolResult = {
  tool: ToolName;
  chunks: Retrieved[];
  // get_contact returns a synthetic chunk so the answer can still cite a source
  text?: string;
};

export async function runTool(
  name: ToolName,
  args: { query?: string }
): Promise<ToolResult> {
  if (name === "get_contact") {
    const text = `Email: ${site.email}. GitHub: ${site.github}. LinkedIn: ${site.linkedin}.`;
    return {
      tool: name,
      chunks: [
        {
          id: "contact-01",
          source_type: "about",
          title: "Contact",
          section: "contact",
          text,
          url: `mailto:${site.email}`,
          score: 1,
          relevance: 1,
        },
      ],
      text,
    };
  }

  const query = args.query ?? "";
  const chunks = await hybridSearch(query, TOOL_SOURCES[name]);
  return { tool: name, chunks };
}
