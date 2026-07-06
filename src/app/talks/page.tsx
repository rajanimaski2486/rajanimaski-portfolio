import { ArrowUpRight, Play } from "lucide-react";
import { PageFrame } from "@/components/page-frame";
import { InlineInvite } from "@/components/inline-invite";
import { talks, writing, certifications, certsLink } from "@/lib/content";

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
                    aria-label="Open talk"
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
              {t.video ? (
                <a
                  href={t.video}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex items-center gap-1 font-meta text-[11px] text-accent"
                >
                  <Play className="h-3 w-3" />
                  Watch the talk
                </a>
              ) : null}
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

      {/* Certifications strip — named certs + the DeepLearning.AI body of work. */}
      <section className="mt-8">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="font-meta text-[11px] uppercase tracking-[0.2em] text-tertiary">
            Certifications
          </h2>
          <a
            href={certsLink}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 font-meta text-[11px] text-accent"
          >
            View all
            <ArrowUpRight className="h-3 w-3" />
          </a>
        </div>
        <ul className="mt-3 flex flex-wrap gap-2">
          {certifications.map((c) => (
            <li
              key={c.name}
              className="rounded-full border px-2.5 py-1 font-meta text-[11px] text-secondary"
            >
              {c.name}
              {c.status ? (
                <span className="ml-1.5 text-tertiary">· {c.status}</span>
              ) : null}
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-8">
        <InlineInvite prompt="What is Generative Discovery, and what do Intent, Context, and Cognition mean?">
          <span className="text-accent">Generative Discovery</span>. Ask the agent
          about Intent, Context, and Cognition from the talks.
        </InlineInvite>
      </div>
    </PageFrame>
  );
}
