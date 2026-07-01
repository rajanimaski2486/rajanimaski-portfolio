import { ArrowUpRight } from "lucide-react";
import { PageFrame } from "@/components/page-frame";
import { InlineInvite } from "@/components/inline-invite";
import { talks, writing, certifications } from "@/lib/content";

export const metadata = { title: "Talks & writing · Rajani Maski" };

export default function TalksPage() {
  return (
    <PageFrame
      eyebrow="SPEAKING"
      title="Talks & writing"
      intro="Conference talks and short writing on retrieval, ranking, and keeping the stack framework-free."
    >
      {/* Talks */}
      <section>
        <h2 className="font-meta text-[11px] uppercase tracking-[0.2em] text-tertiary">
          Talks
        </h2>
        <ul className="mt-3 space-y-3">
          {talks.map((t) => (
            <li key={t.title} className="rounded-md border bg-surface p-4">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-[13px] font-medium text-primary">{t.title}</h3>
                {t.href ? (
                  <a
                    href={t.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Slides"
                    className="shrink-0 text-accent"
                  >
                    <ArrowUpRight className="h-4 w-4" />
                  </a>
                ) : null}
              </div>
              <p className="mt-1 font-meta text-[11px] text-tertiary">{t.venue}</p>
              <p className="mt-1.5 text-[12.5px] leading-snug text-secondary">
                {t.takeaway}
              </p>
            </li>
          ))}
        </ul>
      </section>

      {/* Writing */}
      <section className="mt-8">
        <h2 className="font-meta text-[11px] uppercase tracking-[0.2em] text-tertiary">
          Writing
        </h2>
        <ul className="mt-3 space-y-3">
          {writing.map((w) => (
            <li key={w.title} className="rounded-md border bg-surface p-4">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-[13px] font-medium text-primary">{w.title}</h3>
                <a
                  href={w.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Read"
                  className="shrink-0 text-accent"
                >
                  <ArrowUpRight className="h-4 w-4" />
                </a>
              </div>
              <p className="mt-1.5 text-[12.5px] leading-snug text-secondary">
                {w.takeaway}
              </p>
            </li>
          ))}
        </ul>
      </section>

      {/* Certifications strip — named certs only, one row. */}
      <section className="mt-8">
        <h2 className="font-meta text-[11px] uppercase tracking-[0.2em] text-tertiary">
          Certifications
        </h2>
        <ul className="mt-3 flex flex-wrap gap-2">
          {certifications.map((c) => (
            <li
              key={c}
              className="rounded-full border px-2.5 py-1 font-meta text-[11px] text-secondary"
            >
              {c}
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-8">
        <InlineInvite prompt="What is the framework-free position on retrieval, and why?">
          <span className="text-accent">Framework-free retrieval</span>. Ask the
          agent why that is the deliberate position.
        </InlineInvite>
      </div>
    </PageFrame>
  );
}
