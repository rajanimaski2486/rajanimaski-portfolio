"use client";

import { useEffect, useRef } from "react";

/*
  Hero backdrop: a drifting point field ("latent space"). ~60 points.
  - Points near the cursor brighten toward the accent and connect to it with thin lines.
  - Faint white links join near neighbors.
  - On mobile or prefers-reduced-motion: render ONE static frame, no rAF, no cursor.
  The one moment of motion on the site; everything below is calm and static.
*/

const ACCENT: [number, number, number] = [93, 204, 165]; // #5dcca5
const POINT_COUNT = 60;
const NEIGHBOR_DIST = 92; // px, white near-neighbor links
const CURSOR_DIST = 150; // px, accent cursor links

type Point = { x: number; y: number; vx: number; vy: number };

export function LatentSpaceCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const isMobile = window.matchMedia("(max-width: 767px)").matches;
    const animate = !reduceMotion && !isMobile;

    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let points: Point[] = [];
    const cursor = { x: -9999, y: -9999, active: false };
    let raf = 0;

    function seed() {
      points = Array.from({ length: POINT_COUNT }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.18,
      }));
    }

    function resize() {
      const rect = canvas!.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas!.width = Math.round(width * dpr);
      canvas!.height = Math.round(height * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
      if (!animate) draw(); // static field needs an explicit repaint on resize
    }

    function draw() {
      ctx!.clearRect(0, 0, width, height);

      // Near-neighbor white links.
      for (let i = 0; i < points.length; i++) {
        for (let j = i + 1; j < points.length; j++) {
          const a = points[i];
          const b = points[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d = Math.hypot(dx, dy);
          if (d < NEIGHBOR_DIST) {
            const alpha = (1 - d / NEIGHBOR_DIST) * 0.06;
            ctx!.strokeStyle = `rgba(255,255,255,${alpha})`;
            ctx!.lineWidth = 1;
            ctx!.beginPath();
            ctx!.moveTo(a.x, a.y);
            ctx!.lineTo(b.x, b.y);
            ctx!.stroke();
          }
        }
      }

      // Points, plus accent cursor links.
      for (const p of points) {
        let intensity = 0;
        if (cursor.active) {
          const cd = Math.hypot(p.x - cursor.x, p.y - cursor.y);
          if (cd < CURSOR_DIST) {
            intensity = 1 - cd / CURSOR_DIST;
            ctx!.strokeStyle = `rgba(${ACCENT[0]},${ACCENT[1]},${ACCENT[2]},${
              intensity * 0.5
            })`;
            ctx!.lineWidth = 1;
            ctx!.beginPath();
            ctx!.moveTo(p.x, p.y);
            ctx!.lineTo(cursor.x, cursor.y);
            ctx!.stroke();
          }
        }

        // Brighten toward accent based on cursor proximity.
        const r = Math.round(122 + (ACCENT[0] - 122) * intensity);
        const g = Math.round(130 + (ACCENT[1] - 130) * intensity);
        const b = Math.round(143 + (ACCENT[2] - 143) * intensity);
        const radius = 1.1 + intensity * 1.1;
        const alpha = 0.4 + intensity * 0.6;
        ctx!.fillStyle = `rgba(${r},${g},${b},${alpha})`;
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, radius, 0, Math.PI * 2);
        ctx!.fill();
      }
    }

    function step() {
      for (const p of points) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;
      }
      draw();
      raf = requestAnimationFrame(step);
    }

    function onMove(e: MouseEvent) {
      const rect = canvas!.getBoundingClientRect();
      cursor.x = e.clientX - rect.left;
      cursor.y = e.clientY - rect.top;
      cursor.active = true;
    }
    function onLeave() {
      cursor.active = false;
    }

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    if (animate) {
      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseout", onLeave);
      raf = requestAnimationFrame(step);
    } else {
      draw(); // single static frame
    }

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseout", onLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  );
}
