"use client";

import { useState } from "react";
import { ArrowUpRight, Video } from "lucide-react";
import { GithubIcon } from "@/components/icons";
import { cn } from "@/lib/utils";
import { projects, projectTags, type Project } from "@/lib/content";

// Deterministic neutral thumbnail (no accent — accent is reserved).
function Thumb({ name }: { name: string }) {
  const initials = name
    .split(/[\s-]+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  return (
    <div className="flex h-20 items-center justify-center rounded-md border bg-base">
      <span className="font-meta text-[15px] text-tertiary">{initials}</span>
    </div>
  );
}

function TechStrip({ tech }: { tech: Project["tech"] }) {
  // Only render the fields we actually know.
  const rows = (
    [
      ["frameworks", tech.frameworks],
      ["models", tech.models],
      ["domain", tech.domain],
      ["infra", tech.infra],
    ] as const
  ).filter(([, v]) => Boolean(v));
  if (rows.length === 0) return null;
  return (
    <dl className="mt-3 space-y-0.5 font-meta text-[10.5px] leading-relaxed">
      {rows.map(([k, v]) => (
        <div key={k} className="flex gap-2">
          <dt className="w-[68px] shrink-0 text-tertiary">{k}</dt>
          <dd className="text-secondary">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

const FILTERS = ["All", "Active", "Past", ...projectTags];

export function ProjectsGrid() {
  const [filter, setFilter] = useState("All");

  const shown = projects.filter((p) => {
    if (filter === "All") return true;
    if (filter === "Active") return p.status === "active";
    if (filter === "Past") return p.status === "past";
    return p.tags.includes(filter);
  });

  return (
    <div>
      {/* Filter chips (mono). Single-select. */}
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={cn(
              "rounded-full border px-2.5 py-1 font-meta text-[11px] transition-colors",
              filter === f
                ? "border-accent/50 text-accent"
                : "text-secondary hover:border-hover"
            )}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="mt-5 grid gap-3 [grid-template-columns:repeat(auto-fill,minmax(240px,1fr))]">
        {shown.map((p) => (
          <article
            key={p.slug}
            className="flex flex-col rounded-md border bg-surface p-4 transition-colors hover:border-hover"
          >
            <Thumb name={p.name} />
            <div className="mt-3 flex items-start justify-between gap-2">
              <h2 className="text-[13px] font-medium text-primary">{p.name}</h2>
              <div className="flex shrink-0 items-center gap-2">
                {p.github ? (
                  <a
                    href={p.github}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`${p.name} on GitHub`}
                    className="text-secondary transition-colors hover:text-primary"
                  >
                    <GithubIcon className="h-3.5 w-3.5" />
                  </a>
                ) : null}
                {p.video ? (
                  <a
                    href={p.video}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`${p.name} video`}
                    className="text-secondary transition-colors hover:text-primary"
                  >
                    <Video className="h-4 w-4" />
                  </a>
                ) : null}
                {p.deployed ? (
                  <a
                    href={p.deployed}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`${p.name} live app`}
                    className="text-accent"
                  >
                    <ArrowUpRight className="h-4 w-4" />
                  </a>
                ) : null}
              </div>
            </div>
            <p className="mt-1 text-[11.5px] leading-snug text-secondary">{p.purpose}</p>
            <TechStrip tech={p.tech} />
          </article>
        ))}
      </div>
    </div>
  );
}
