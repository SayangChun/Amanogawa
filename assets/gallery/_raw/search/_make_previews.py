from pathlib import Path
from PIL import Image

search = Path(__file__).parent
out = search / "_preview2"
out.mkdir(exist_ok=True)

keys = (
    "if_img_gallery_cg",
    "if_img_special_shop_sample",
    "if_img_movie_thum",
    "if_img_special_Twitter",
    "if_img_special_shiki",
    "if_img_chara_chara01_00_00",
    "if_img_chara_chara01_01_00",
    "if_img_chara_chara01_02_00",
    "Saya.full.1931765",
    "Saya.full.2258455",
    "fd_img_chara_chara_saya_00",
    "fd_img_story_story_saya",
)

files = [p for p in sorted(search.iterdir()) if p.suffix.lower() in {".jpg", ".png", ".jpeg", ".webp"} and any(k in p.name for k in keys)]
print("count", len(files))
for p in files:
    try:
        im = Image.open(p).convert("RGB")
        size = im.size
        im.thumbnail((480, 320))
        safe = p.name.replace(".", "_")[:70] + ".jpg"
        im.save(out / safe, quality=80)
        print(f"{p.name[:95]} {size}")
    except Exception as e:
        print("err", p.name, e)
