"use client";

import { useState } from "react";

/*
  96px circular portrait, 1.5px accent ring at 0.5 opacity, surface background.
  Uses the real photo at /public/portrait.jpg when present, and falls back to a
  neutral silhouette if it is missing, so the site never shows a broken image.
  Brief: head-and-shoulders, soft directional light, natural editorial.
  Stacks above the headline and centers on mobile (handled by the parent).
*/
export function Portrait() {
  const [failed, setFailed] = useState(false);

  return (
    <div
      className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full bg-surface"
      style={{ boxShadow: "0 0 0 1.5px rgba(93,204,165,0.5)" }}
    >
      {!failed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src="/portrait.jpg"
          alt="Rajani Maski"
          width={96}
          height={96}
          className="h-full w-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <svg viewBox="0 0 96 96" className="h-full w-full" aria-label="Rajani Maski">
          <rect width="96" height="96" fill="#10151d" />
          <circle cx="48" cy="38" r="16" fill="#1b2330" />
          <path d="M20 86c0-16 12.5-26 28-26s28 10 28 26" fill="#1b2330" />
        </svg>
      )}
    </div>
  );
}
