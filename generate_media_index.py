#!/usr/bin/env python3
import json
import os
from pathlib import Path

# Root of the repo (this script sits in the repo root)
ROOT = Path(__file__).parent

MEDIA_DIR = ROOT / "media"
IMAGES_DIR = MEDIA_DIR / "images"
VIDEOS_DIR = MEDIA_DIR / "videos"
AUDIO_DIR  = MEDIA_DIR / "audio"

# Output file(s)
OUT_HYPHEN   = MEDIA_DIR / "media-index.json"
OUT_UNDERSCORE = MEDIA_DIR / "media_index.json"

IMAGE_EXTS = {".png", ".jpg", ".jpeg", ".gif", ".webp", ".avif", ".bmp"}
VIDEO_EXTS = {".mp4", ".webm", ".mkv", ".mov", ".avi"}
AUDIO_EXTS = {".mp3", ".wav", ".flac", ".ogg", ".m4a"}


def prettify_title(path: Path) -> str:
  """Turn 'my_cool-photo_01.png' into 'My cool photo 01'."""
  name = path.stem
  name = name.replace("_", " ").replace("-", " ")
  name = " ".join(part for part in name.split() if part)
  if not name:
    return path.name
  return name[0].upper() + name[1:]


def collect_from_folder(folder: Path, forced_type: str | None = None):
  items = []
  if not folder.exists():
    return items

  for root, _, files in os.walk(folder):
    for fname in files:
      p = Path(root) / fname
      ext = p.suffix.lower()

      if forced_type == "image" and ext not in IMAGE_EXTS:
        continue
      if forced_type == "video" and ext not in VIDEO_EXTS:
        continue
      if forced_type == "audio" and ext not in AUDIO_EXTS:
        continue

      # Determine type if not forced
      mtype = forced_type
      if mtype is None:
        if ext in IMAGE_EXTS:
          mtype = "image"
        elif ext in VIDEO_EXTS:
          mtype = "video"
        elif ext in AUDIO_EXTS:
          mtype = "audio"
        else:
          # Skip weird stuff
          continue

      # Path that the browser will use (relative to index.html)
      rel = p.relative_to(ROOT).as_posix()

      items.append({
        "src": rel,          # e.g. "media/images/photo.jpg"
        "title": prettify_title(p),
        "type": mtype
      })
  return items


def main():
  media_items = []

  media_items += collect_from_folder(IMAGES_DIR, "image")
  media_items += collect_from_folder(VIDEOS_DIR, "video")
  media_items += collect_from_folder(AUDIO_DIR,  "audio")

  media_items.sort(key=lambda i: i["src"])

  payload = {
    "items": media_items
  }

  MEDIA_DIR.mkdir(exist_ok=True)

  # write both names for maximum compatibility with your JS
  for out_path in (OUT_HYPHEN, OUT_UNDERSCORE):
    with out_path.open("w", encoding="utf-8") as f:
      json.dump(payload, f, indent=2, ensure_ascii=False)
    print(f"Wrote {out_path.relative_to(ROOT)} with {len(media_items)} items")


if __name__ == "__main__":
  main()
