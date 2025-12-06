#!/usr/bin/env python3
"""
Scan ./media for image / video / audio files and write media/media-index.json

The JSON shape matches what scripts/script.js expects:

{
  "items": [
    {
      "src": "media/some-folder/file.jpg",
      "type": "image" | "video" | "audio",
      "title": "File name without extension"
    },
    ...
  ]
}
"""

import json
import os
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[1]
MEDIA_DIR = REPO_ROOT / "media"
OUTPUT_FILE = MEDIA_DIR / "media-index.json"

IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp"}
VIDEO_EXTS = {".mp4", ".webm", ".mov", ".mkv"}
AUDIO_EXTS = {".mp3", ".wav", ".ogg", ".flac", ".m4a"}


def detect_type(ext: str) -> str | None:
    ext = ext.lower()
    if ext in IMAGE_EXTS:
        return "image"
    if ext in VIDEO_EXTS:
        return "video"
    if ext in AUDIO_EXTS:
        return "audio"
    return None


def build_title(path: Path) -> str:
    """Nice readable title from filename (no extension, replace -/_ with spaces, capitalize)."""
    name = path.stem
    name = name.replace("_", " ").replace("-", " ")
    # collapse multiple spaces
    name = " ".join(name.split())
    if not name:
        return str(path.name)
    return name[0].upper() + name[1:]


def main() -> None:
    if not MEDIA_DIR.exists():
        print(f"[generate_media_index] media folder not found: {MEDIA_DIR}")
        OUTPUT_FILE.write_text(json.dumps({"items": []}, indent=2, ensure_ascii=False))
        return

    items: list[dict] = []

    for root, _, files in os.walk(MEDIA_DIR):
        for filename in files:
            p = Path(root) / filename
            ext = p.suffix.lower()
            media_type = detect_type(ext)
            if not media_type:
                # skip unknown types (e.g. .json, .txt)
                continue

            # path relative to repo root, so script.js can just use item.src directly
            rel_path = p.relative_to(REPO_ROOT).as_posix()

            item = {
                "src": rel_path,        # e.g. "media/photos/foo.jpg"
                "type": media_type,     # "image" | "video" | "audio"
                "title": build_title(p) # "Foo", "Holiday 2024", etc.
            }
            items.append(item)

    data = {"items": sorted(items, key=lambda x: x["src"].lower())}

    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_FILE.write_text(
        json.dumps(data, indent=2, ensure_ascii=False),
        encoding="utf-8"
    )

    print(f"[generate_media_index] Wrote {len(items)} items to {OUTPUT_FILE}")


if __name__ == "__main__":
    main()
