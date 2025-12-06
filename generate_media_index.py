#!/usr/bin/env python3
import os
import json
from pathlib import Path

ROOT = Path(__file__).parent
MEDIA_DIR = ROOT / "media"
OUTPUT_FILE = MEDIA_DIR / "media-index.json"

IMAGE_EXTS = {".png", ".jpg", ".jpeg", ".gif", ".webp"}
VIDEO_EXTS = {".mp4", ".mkv", ".webm", ".mov"}
AUDIO_EXTS = {".mp3", ".wav", ".ogg", ".flac"}


def classify_type(path: Path) -> str:
    ext = path.suffix.lower()

    if ext in IMAGE_EXTS:
        return "image"
    if ext in VIDEO_EXTS:
        return "video"
    if ext in AUDIO_EXTS:
        return "audio"

    # fallback based on folder name
    parts = path.as_posix().split("/")
    if "images" in parts:
        return "image"
    if "videos" in parts:
        return "video"
    if "audio" in parts:
        return "audio"

    return "image"  # default


def collect_media_items() -> list[dict]:
    items = []

    if not MEDIA_DIR.exists():
        return items

    for sub in ["images", "videos", "audio"]:
        subdir = MEDIA_DIR / sub
        if not subdir.exists():
            continue

        for root, _, files in os.walk(subdir):
            for fname in files:
                if fname.startswith("."):
                    continue

                path = Path(root) / fname
                rel = path.relative_to(ROOT).as_posix()  # e.g. "media/images/foo.png"

                media_type = classify_type(path)
                title = path.stem.replace("_", " ").replace("-", " ")

                items.append(
                    {
                        "src": rel,
                        "title": title,
                        "type": media_type,
                    }
                )

    # sort a bit: by type then title
    items.sort(key=lambda x: (x["type"], x["title"].lower()))
    return items


def main():
    items = collect_media_items()
    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)

    data = {"items": items}

    with OUTPUT_FILE.open("w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f"Wrote {len(items)} media items to {OUTPUT_FILE}")


if __name__ == "__main__":
    main()
