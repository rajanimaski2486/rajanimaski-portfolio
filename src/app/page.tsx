import Link from "next/link";
import { LatentSpaceCanvas } from "@/components/latent-space-canvas";
import { SiteHeader } from "@/components/site-header";
import { Portrait } from "@/components/portrait";
import { CurrentWork } from "@/components/current-work";
import { InlineInvite } from "@/components/inline-invite";
import { FeedbackTrigger } from "@/components/chat/feedback-modal";
import { positioning, navOut, site, roleNow, rolePrior } from "@/lib/content";

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero — the one moment of motion. Canvas sits behind header + intro. */}
      <section className="relative overflow-hidden">
        <LatentSpaceCanvas />
        <div className="relative z-10 mx-auto max-w-content px-6 pb-10 pt-6">
          <SiteHeader />

          <div className="mt-10 flex flex-col-reverse items-center gap-7 md:mt-12 md:flex-row md:items-start md:justify-between md:gap-8">
            {/* Left column */}
            <div className="w-full">
              {/* Name */}
              <h1 className="text-[28px] font-medium leading-tight text-primary">
                {site.name}
              </h1>
              {/* Title + location */}
              <p className="mt-1 text-[16px] leading-snug text-secondary">
                {site.role}
                <span className="ml-2 align-baseline font-meta text-[12px] text-tertiary">
                  {site.location}
                </span>
              </p>
              {/* Current employer */}
              <p className="mt-2 text-[15px] leading-snug text-secondary">
                <span className="text-primary">{roleNow.employer}</span>
                <span className="text-tertiary"> · </span>
                {roleNow.focus}
                <span className="text-tertiary"> · {roleNow.tenure}</span>
              </p>
              {/* Prior background — one subtle mono line */}
              <p className="mt-1.5 font-meta text-[13px] leading-relaxed text-tertiary">
                prior · {rolePrior}
              </p>

              {/* Positioning — smaller supporting text */}
              <p className="mt-4 max-w-[440px] text-[12.5px] leading-relaxed text-secondary">
                {positioning}
              </p>
            </div>

            {/* Right column — portrait (stacks above, centered, on mobile) */}
            <Portrait />
          </div>
        </div>
      </section>

      {/* Calm scroll below the fold. */}
      <div className="mx-auto max-w-content space-y-10 px-6 pb-20 pt-4">
        {/* Inline chat invite — hooked to the current work below. */}
        <InlineInvite prompt="What are you working on right now?">
          Ask about my <span className="text-accent">current work</span>
        </InlineInvite>

        <CurrentWork />

        {/* Nav out + footer */}
        <div className="flex flex-wrap items-center justify-between gap-x-5 gap-y-3 border-t pt-6 font-meta text-[12px]">
          <nav className="flex flex-wrap gap-x-5 gap-y-2">
            {navOut.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className="text-[15px] text-secondary transition-colors hover:text-accent"
              >
                {n.label} →
              </Link>
            ))}
          </nav>
          <FeedbackTrigger className="text-[12px] text-secondary hover:text-accent" />
        </div>
      </div>
    </main>
  );
}
