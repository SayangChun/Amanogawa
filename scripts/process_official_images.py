"""Download-side processing: composite IF layers, upscale, save to official/."""
from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageEnhance, ImageFilter

RAW = Path("assets/gallery/_raw")
OUT = Path("assets/gallery/official")
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


def composite_face(body_path: Path, face_path: Path) -> Image.Image:
    body = Image.open(body_path).convert("RGBA")
    face = Image.open(face_path).convert("RGBA")
    if face.size != body.size:
        face = face.resize(body.size, Image.Resampling.LANCZOS)
    return Image.alpha_composite(body, face)


def crop_if_blue_border(im: Image.Image) -> Image.Image:
    """Trim white padding and blue UI chrome from IF portraits."""
    rgba = im.convert("RGBA")
    w, h = rgba.size
    px = rgba.load()
    minx, miny, maxx, maxy = w, h, 0, 0
    step = 2
    for y in range(0, h, step):
        for x in range(0, w, step):
            r, g, b, a = px[x, y]
            if a < 20:
                continue
            if r > 248 and g > 248 and b > 248:
                continue
            if b > 200 and r < 80 and g < 120:
                continue
            minx = min(minx, x)
            miny = min(miny, y)
            maxx = max(maxx, x)
            maxy = max(maxy, y)
    if maxx <= minx or maxy <= miny:
        return im
    pad = 8
    box = (
        max(0, minx - pad),
        max(0, miny - pad),
        min(w, maxx + pad + step),
        min(h, maxy + pad + step),
    )
    return im.crop(box)


def main() -> None:
    results: list[str] = []

    # New CG05 childhood trio (Saya center)
    im = to_rgb(Image.open(RAW / "cg05comp.png"))
    im = upscale(im, 2, 2560)
    save_jpg(im, OUT / "cg05-full.jpg")
    save_png(Image.open(RAW / "thum05.png").convert("RGBA"), OUT / "thum05.png")
    results.append("cg05 childhood")

    # Upscale remaining known Saya CGs
    for num, src in [
        ("06", "cg06diff.jpg"),
        ("10", "cg10comp.png"),
        ("12", "cg12diff.jpg"),
    ]:
        im = to_rgb(Image.open(RAW / src))
        if im.width <= 1400:
            im = upscale(im, 2, 2560)
        save_jpg(im, OUT / f"cg{num}-full.jpg")
        results.append(f"cg{num} upscaled")

    # IF summer uniforms
    for src, dest in [
        ("if_chara01_00_00.png", "saya-if-summer.png"),
        ("if_chara01_00_01.png", "saya-if-summer-smile.png"),
    ]:
        im = Image.open(RAW / src).convert("RGBA")
        im = crop_if_blue_border(im)
        im = upscale(im, 1.5, 2400)
        save_png(im, OUT / dest)
        results.append(dest)

    # IF nightgown / swimsuit with face layers
    for body, face, dest in [
        ("if_chara01_01_00.png", "if_chara01_01_01.png", "saya-if-nightgown.png"),
        ("if_chara01_02_00.png", "if_chara01_02_01.png", "saya-if-swimsuit.png"),
    ]:
        im = composite_face(RAW / body, RAW / face)
        im = crop_if_blue_border(im)
        im = upscale(im, 1.5, 2400)
        save_png(im, OUT / dest)
        results.append(dest)

    # Official promo icon (Saya)
    im = Image.open(RAW / "if_special_Twitter_yozoraif_icon02.png").convert("RGBA")
    im = upscale(im, 3, 1200)
    save_png(im, OUT / "saya-icon-if.png")
    results.append("saya-icon-if")

    h2 = RAW / "if_special_Twitter_yozoraif_header02.png"
    if h2.exists():
        im = upscale(Image.open(h2).convert("RGB"), 1.5, 2400)
        save_jpg(im, OUT / "saya-if-header.jpg")
        results.append("saya-if-header")

    # Upscale existing lower-res portraits
    for name in [
        "saya-child1.jpg",
        "saya-child2.jpg",
        "saya-uniform.jpg",
        "saya-coat.jpg",
        "saya-portrait.png",
    ]:
        p = OUT / name
        if not p.exists():
            continue
        im = Image.open(p)
        was_png = p.suffix.lower() == ".png"
        if im.width < 1600:
            if was_png:
                im = upscale(im.convert("RGBA"), 1.75, 2400)
                save_png(im, p)
            else:
                im = upscale(to_rgb(im), 1.75 if im.width >= 1200 else 2, 2400)
                save_jpg(im, p)
            results.append(f"upscaled {name}")

    # Small chara icon
    icon = RAW / "chara_icon_saya_on.png"
    if icon.exists():
        im = upscale(Image.open(icon).convert("RGBA"), 4, 800)
        save_png(im, OUT / "saya-chara-icon.png")
        results.append("saya-chara-icon")

    print("--- done ---")
    for r in results:
        print(r)


if __name__ == "__main__":
    main()
