#!/usr/bin/env python3
"""
Cut the subject out of a headshot and composite onto a solid dark background so
the circular portrait blends into the dark hero with no halo or artifacts.

Uses rembg (U^2-Net human segmentation) for a clean matte, then fills the
background with the site base color (#0a0e14) so it is seamless on the hero.

  .venv/bin/python scripts/process_portrait.py public/portrait.png public/portrait.jpg
"""
import sys
from PIL import Image
from rembg import remove, new_session

BASE = (10, 14, 20)  # #0a0e14, the site base background (seamless on the hero)


def main(src: str, dst: str) -> int:
    img = Image.open(src).convert("RGBA")

    # Human-segmentation model gives the cleanest person cutout.
    session = new_session("u2net_human_seg")
    cut = remove(img, session=session)  # RGBA, background transparent

    bg = Image.new("RGBA", cut.size, (*BASE, 255))
    out = Image.alpha_composite(bg, cut).convert("RGB")

    # Square-crop centered (object-cover handles the circle either way).
    w, h = out.size
    side = min(w, h)
    left = (w - side) // 2
    top = (h - side) // 2
    out = out.crop((left, top, left + side, top + side))

    out.save(dst, quality=92)
    print(f"wrote {dst} ({out.size[0]}x{out.size[1]})")
    return 0


if __name__ == "__main__":
    src = sys.argv[1] if len(sys.argv) > 1 else "public/portrait.png"
    dst = sys.argv[2] if len(sys.argv) > 2 else "public/portrait.jpg"
    raise SystemExit(main(src, dst))
