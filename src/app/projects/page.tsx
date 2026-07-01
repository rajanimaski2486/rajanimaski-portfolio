import { PageFrame } from "@/components/page-frame";
import { ProjectsGrid } from "@/components/projects-grid";
import { InlineInvite } from "@/components/inline-invite";

export const metadata = { title: "Projects · Rajani Maski" };

export default function ProjectsPage() {
  return (
    <PageFrame
      eyebrow="WORK"
      title="Projects"
      intro="Active and past work together. Retrieval, ranking, multimodal, and the agentic systems built on top."
    >
      <ProjectsGrid />

      <div className="mt-8">
        <InlineInvite prompt="How was Reveal built, and what was the hardest decision?">
          Want the reasoning behind any of these?{" "}
          <span className="text-accent">Ask how any of these were built.</span>
        </InlineInvite>
      </div>
    </PageFrame>
  );
}
