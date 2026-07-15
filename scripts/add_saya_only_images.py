"""Process newly found Saya-only game art into assets/gallery/official."""
from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
SEARCH = ROOT / "assets/gallery/_raw/search"
OUT = ROOT / "assets/gallery/official"
OUT.mkdir(parents=True, exist_ok=True)


def upscale(im: Image.Image, scale: float = 2, max_side: int = 2560) -> Image.Image:
    w, h = im.size
    nw, nh = int(w * scale), int(h * scale)
    if max(nw, nh) > max_side:
        r = max_side / max(nw, nh)
        nw, nh = int(nw * r), int(nh * r)
    if (nw, nh) == (w, h):
        return im
    up = im.resize((nw, nh), Image.Resampling.LANCZOS)
    return up.filter(ImageFilter.UnsharpMask(radius=1.2, percent=120, threshold=2))


def to_rgb(im: Image.Image, bg=(8, 12, 28)) -> Image.Image:
    if im.mode == "RGB":
        return im
    if im.mode == "P":
        im = im.convert("RGBA")
    if im.mode == "RGBA":
        base = Image.new("RGB", im.size, bg)
        base.paste(im, mask=im.split()[-1])
        return base
    return im.convert("RGB")


def save_jpg(im: Image.Image, path: Path, quality: int = 92) -> None:
    to_rgb(im).save(path, "JPEG", quality=quality, optimize=True)
    print(f"saved {path.name} {im.size} {path.stat().st_size // 1024}KB")


def save_png(im: Image.Image, path: Path) -> None:
    if im.mode not in ("RGBA", "RGB"):
        im = im.convert("RGBA")
    im.save(path, "PNG", optimize=True)
    print(f"saved {path.name} {im.size} {path.stat().st_size // 1024}KB")


def trim_alpha(im: Image.Image, pad: int = 8) -> Image.Image:
    """Trim transparent / near-black padding and pink outline fluff."""
    rgba = im.convert("RGBA")
    w, h = rgba.size
    px = rgba.load()
    minx, miny, maxx, maxy = w, h, 0, 0
    step = 2
    for y in range(0, h, step):
        for x in range(0, w, step):
            r, g, b, a = px[x, y]
            if a < 18:
                continue
            # skip pure black / near-black bg
            if r < 12 and g < 12 and b < 12:
                continue
            minx = min(minx, x)
            miny = min(miny, y)
            maxx = max(maxx, x)
            maxy = max(maxy, y)
    if maxx <= minx or maxy <= miny:
        return im
    box = (
        max(0, minx - pad),
        max(0, miny - pad),
        min(w, maxx + pad + step),
        min(h, maxy + pad + step),
    )
    return im.crop(box)


def main() -> None:
    results: list[str] = []

    # 1) Childhood chalkboard CG (main game, Saya alone)
    src = SEARCH / "static.zerochan.net_Amanogawa.Saya.full.1931765.jpg"
    im = to_rgb(Image.open(src))
    # strip thin bottom watermark strip if present (copyright text area)
    if im.height >= 1400:
        # keep full; official CG includes tiny corner mark
        pass
    save_jpg(im, OUT / "cg-child-blackboard.jpg")
    results.append("cg-child-blackboard")

    # 2) Upgrade daytime clear-sky CG if higher quality source available
    hi = SEARCH / "static.zerochan.net_Amanogawa.Saya.full.1931764.jpg"
    if hi.exists() and hi.stat().st_size > (OUT / "cg06-full.jpg").stat().st_size:
        im = to_rgb(Image.open(hi))
        save_jpg(im, OUT / "cg06-full.jpg", quality=93)
        results.append("cg06-full upgraded")

    # 4) IF beach ice cream — swimsuit, Saya alone
    src = SEARCH / "www.pulltop.com_full-of-stars_if_img_gallery_cg2.jpg"
    im = to_rgb(Image.open(src))
    im = upscale(im, 2, 2560)
    save_jpg(im, OUT / "cg-if-beach-icecream.jpg")
    results.append("cg-if-beach-icecream")

    # 5) FD official telescope standing art (Saya alone)
    src = SEARCH / "www.pulltop.com_full-of-stars_fd_img_chara_chara_saya_00.png"
    im = Image.open(src).convert("RGBA")
    im = trim_alpha(im, pad=6)
    im = upscale(im, 1.5, 2400)
    save_png(im, OUT / "saya-fd-telescope.png")
    results.append("saya-fd-telescope")

    # 6) Crop multi-person IF water fight → left-side Saya only
    src = SEARCH / "www.pulltop.com_full-of-stars_if_img_gallery_cg0.jpg"
    im = to_rgb(Image.open(src))
    w, h = im.size
    crop = im.crop((0, 0, int(w * 0.58), h))
    crop = upscale(crop, 2, 2560)
    save_jpg(crop, OUT / "cg-if-water-saya.jpg")
    results.append("cg-if-water-saya (cropped)")

    # 7) Crop IF Q-version duo → left-side Saya only (no red hair edge)
    src = SEARCH / "www.pulltop.com_full-of-stars_if_img_gallery_cg10.jpg"
    im = to_rgb(Image.open(src))
    w, h = im.size
    crop = im.crop((int(w * 0.02), int(h * 0.02), int(w * 0.42), int(h * 0.98)))
    crop = upscale(crop, 2.2, 2560)
    save_jpg(crop, OUT / "cg-if-q-saya-solo.jpg")
    results.append("cg-if-q-saya-solo (cropped)")

    print("--- done ---")
    for r in results:
        print(r)


if __name__ == "__main__":
    main()
