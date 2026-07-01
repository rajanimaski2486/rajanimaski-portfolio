import { PageFrame } from "@/components/page-frame";
import { InlineInvite } from "@/components/inline-invite";
import { about } from "@/lib/content";

export const metadata = { title: "About · Rajani Maski" };

export default function AboutPage() {
  return (
    <PageFrame
      eyebrow="OFF THE CLOCK"
      title="Interests"
      intro="The parts that are not on the resume."
    >
      <div className="space-y-5">
        {about.map((block) => (
          <section key={block.title}>
            <h2 className="font-meta text-[11px] uppercase tracking-[0.2em] text-tertiary">
              {block.title}
            </h2>
            <p className="mt-2 max-w-[560px] text-[14px] leading-relaxed text-secondary">
              {block.body}
            </p>
          </section>
        ))}
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
