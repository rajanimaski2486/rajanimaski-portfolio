import { ArrowUpRight } from "lucide-react";
import { GithubIcon } from "@/components/icons";
import { currentWork } from "@/lib/content";

// CURRENT WORK: a few compact cards, then a pointer to the full projects page.
export function CurrentWork() {
  return (
    <section>
      <h2 className="font-meta text-[11px] uppercase tracking-[0.2em] text-tertiary">
        Current work
      </h2>
      <div className="mt-4 grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(170px,1fr))]">
        {currentWork.map((w) => (
          <a
            key={w.name}
            href={w.href}
            target="_blank"
            rel="noreferrer"
            className="group rounded-md border bg-surface p-4 transition-colors hover:border-hover"
          >
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-medium text-primary">{w.name}</span>
              {w.deployed ? (
                <ArrowUpRight className="h-4 w-4 text-accent" />
              ) : (
                <GithubIcon className="h-3.5 w-3.5 text-secondary transition-colors group-hover:text-primary" />
              )}
            </div>
            <p className="mt-2 text-[11.5px] leading-snug text-secondary">{w.what}</p>
          </a>
        ))}
      </div>
    </section>
  );
}
