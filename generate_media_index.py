#!/usr/bin/env python3
import json
from pathlib import Path
from datetime import datetime

ROOT = Path(__file__).resolve().parent
MEDIA_DIR = ROOT / "media"
OUTPUT_FILE = MEDIA_DIR / "media-index.json"

IMAGE_EXTS = {".png", ".jpg", ".jpeg", ".gif", ".webp"}
VIDEO_EXTS = {".mp4", ".mkv", ".mov", ".webm"}
AUDIO_EXTS = {".mp3", ".wav", ".ogg", ".flac"}


def guess_type(path: Path) -> str | None:
    ext = path.suffix.lower()
    if ext in IMAGE_EXTS:
        return "image"
    if ext in VIDEO_EXTS:
        return "video"
    if ext in AUDIO_EXTS:
        return "audio"
    return None


def main() -> None:
    items: list[dict] = []

    # Honour your split:
    # media/images/*  -> image
    # media/videos/*  -> video
    # media/audio/*   -> audio
    for subdir, forced_type in [
        ("images", "image"),
        ("videos", "video"),
        ("audio", "audio"),
    ]:
        folder = MEDIA_DIR / subdir
        if not folder.exists():
            continue

        for path in sorted(folder.rglob("*")):
            if not path.is_file():
                continue

            ext_type = guess_type(path)
            if not ext_type or ext_type != forced_type:
                continue

            rel = path.relative_to(ROOT).as_posix()  # e.g. "media/images/foo.png"
            title = path.stem.replace("_", " ").replace("-", " ").strip()

            items.append(
                {
                    "src": rel,
                    "type": forced_type,
                    "title": title or path.name,
                }
            )

    data = {
        "generatedAt": datetime.utcnow().isoformat() + "Z",
        "items": items,
    }

    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    with OUTPUT_FILE.open("w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    print(f"Wrote {len(items)} media items to {OUTPUT_FILE}")


if __name__ == "__main__":
    main()
