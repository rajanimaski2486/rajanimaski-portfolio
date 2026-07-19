import {
  ArrowUpRight,
  Footprints,
  Heart,
  Mountain,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { PageFrame } from "@/components/page-frame";
import { InlineInvite } from "@/components/inline-invite";
import { about } from "@/lib/content";

export const metadata = { title: "About · Rajani Maski" };

// Icon per interest, keyed by section title (falls back to a generic mark).
const sectionIcons: Record<string, LucideIcon> = {
  Running: Footprints,
  Hiking: Mountain,
  "AI for Autism": Heart,
};

export default function AboutPage() {
  return (
    <PageFrame
      eyebrow="OFF THE CLOCK"
      title="Interests"
      intro="The parts that are not on the resume."
    >
      <div className="space-y-5">
        {about.map((block) => {
          const Icon = sectionIcons[block.title] ?? Sparkles;
          return (
          <section key={block.title}>
            <h2 className="flex items-center gap-2 text-[15px] font-medium text-primary">
              <Icon className="h-4 w-4 shrink-0 text-accent" />
              {block.link ? (
                <a
                  href={block.link.href}
                  target="_blank"
                  rel="noreferrer"
                  className="transition-colors hover:text-accent"
                >
                  {block.title}
                </a>
              ) : (
                block.title
              )}
            </h2>
            <p className="mt-2 max-w-[560px] text-[14px] leading-relaxed text-secondary">
              {block.body}
            </p>
            {block.link ? (
              <a
                href={block.link.href}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex items-center gap-1 font-meta text-[11px] text-accent transition-colors hover:text-accent/80"
              >
                {block.link.label}
                <ArrowUpRight className="h-3 w-3" />
              </a>
            ) : null}
          </section>
          );
        })}
      </div>

      <div className="mt-8">
        <InlineInvite prompt="Tell me about Rajani's autism advocacy work.">
          Curious about the{" "}
          <span className="text-accent">autism advocacy work</span>? Ask the agent.
        </InlineInvite>
      </div>
    </PageFrame>
  );
}
