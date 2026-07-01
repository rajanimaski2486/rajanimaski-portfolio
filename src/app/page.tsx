import Link from "next/link";
import { LatentSpaceCanvas } from "@/components/latent-space-canvas";
import { SiteHeader } from "@/components/site-header";
import { Portrait } from "@/components/portrait";
import { CurrentWork } from "@/components/current-work";
import { InlineInvite } from "@/components/inline-invite";
import { positioning, skillChips, navOut, site, roleNow, rolePrior } from "@/lib/content";

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
              <h1 className="text-[26px] font-medium leading-tight">
                {site.role}
                <span className="ml-2.5 align-baseline font-meta text-[12px] font-normal text-tertiary">
                  {site.location}
                </span>
              </h1>

              {/* Current role + prior background */}
              <div className="mt-2.5 space-y-1 font-meta text-[12px] leading-relaxed">
                <p className="text-secondary">
                  <span className="text-tertiary">now</span> ·{" "}
                  <span className="text-primary">{roleNow.employer}</span> ·{" "}
                  {roleNow.focus} · {roleNow.tenure}
                </p>
                <p className="text-tertiary">
                  <span>prior</span> · {rolePrior}
                </p>
              </div>

              <p className="mt-4 max-w-[460px] text-[15px] leading-relaxed text-secondary">
                {positioning}
              </p>
              <ul className="mt-5 flex flex-wrap gap-2">
                {skillChips.map((chip) => (
                  <li
                    key={chip}
                    className="rounded-full border px-2.5 py-1 font-meta text-[11px] text-secondary"
                  >
                    {chip}
                  </li>
                ))}
              </ul>
            </div>

            {/* Right column — portrait (stacks above, centered, on mobile) */}
            <Portrait />
          </div>
        </div>
      </section>

      {/* Calm scroll below the fold. */}
      <div className="mx-auto max-w-content space-y-10 px-6 pb-20 pt-4">
        <CurrentWork />

        {/* Inline chat invite — hooked to the strongest claim (2000+ RPS). */}
        <InlineInvite prompt="What is the 2000+ RPS retrieval system and how was it built?">
          Curious about the <span className="text-accent">2000+ RPS</span> or any
          project? Ask the agent, by chat or voice.
        </InlineInvite>

        {/* Nav out + footer */}
        <nav className="flex flex-wrap gap-x-5 gap-y-2 border-t pt-6 font-meta text-[12px]">
          {navOut.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="text-secondary transition-colors hover:text-accent"
            >
              {n.label} →
            </Link>
          ))}
        </nav>
        <footer className="font-meta text-[11px] text-tertiary">
          {site.name} · {site.location}
        </footer>
      </div>
    </main>
  );
}
