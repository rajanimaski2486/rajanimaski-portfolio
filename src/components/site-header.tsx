import Link from "next/link";
import { FileText } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/components/icons";
import { site } from "@/lib/content";

// Mono header row. On the landing it sits over the hero canvas; on other pages
// it sits on the base background. `handleHref` lets inner pages link the name home.
export function SiteHeader({ handleHref = "/" }: { handleHref?: string }) {
  return (
    <header className="flex flex-wrap items-center gap-x-3 gap-y-1.5 font-meta text-[12px] text-secondary">
      <Link href={handleHref} className="text-accent" aria-label="Home">
        {site.handle}
      </Link>
      <span className="text-tertiary">·</span>
      <a
        href={site.github}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-1.5 transition-colors hover:text-primary"
      >
        <GithubIcon className="h-3.5 w-3.5" />
        github
      </a>
      <span className="text-tertiary">·</span>
      <a
        href={site.linkedin}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-1.5 transition-colors hover:text-primary"
      >
        <LinkedinIcon className="h-3.5 w-3.5" />
        linkedin
      </a>
      <span className="text-tertiary">·</span>
      <a
        href={site.resume}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-1.5 text-accent underline decoration-accent/50 underline-offset-2 transition-colors hover:decoration-accent"
      >
        <FileText className="h-3.5 w-3.5" />
        resume.pdf
      </a>
    </header>
  );
}
