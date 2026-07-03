import Link from "next/link";
import type { ReactNode } from "react";
import { SiteHeader } from "@/components/site-header";

// Calm, static chrome for inner pages. No hero motion below the landing.
export function PageFrame({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
  children: ReactNode;
}) {
  return (
    <main className="mx-auto max-w-content px-6 pb-20 pt-6">
      <SiteHeader />
      <div className="mt-10">
        <p className="font-meta text-[11px] uppercase tracking-[0.2em] text-tertiary">
          {eyebrow}
        </p>
        <h1 className="mt-2 text-[26px] font-medium leading-tight">{title}</h1>
        {intro ? (
          <p className="mt-2 max-w-[520px] text-[15px] leading-relaxed text-secondary">
            {intro}
          </p>
        ) : null}
      </div>

      <div className="mt-8">{children}</div>

      <footer className="mt-12 border-t pt-6 font-meta text-[11px] text-tertiary">
        <Link href="/" className="transition-colors hover:text-accent">
          ← home
        </Link>
      </footer>
    </main>
  );
}
