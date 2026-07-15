import json
from pathlib import Path

data = json.loads(Path("danbooru_saya.json").read_text(encoding="utf-8-sig"))
print("count", len(data))
for post in data:
    tags = post.get("tag_string", "").split()
    multi = any(t in tags for t in ("2girls", "3girls", "multiple_girls", "2boys", "male_focus", "1boy"))
    print(
        post["id"],
        "r=" + post.get("rating"),
        "s=" + str(post.get("score")),
        f"{post.get('image_width')}x{post.get('image_height')}",
        "multi=" + str(multi),
    )
    print(" ", post.get("file_url") or post.get("large_file_url") or post.get("preview_file_url"))
    print(" ", " ".join(t for t in tags if t in ("1girl", "official_art", "scan", "comic", "hetero", "kiss", "nude", "sex", "cg_art") or "official" in t)[:160])
