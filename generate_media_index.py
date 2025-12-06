#!/usr/bin/env python3
"""
generate_media_index.py

Scans the ./media/images, ./media/audio and ./media/videos folders
and generates ./media/media-index.json with metadata for all files.

Intended to be run by GitHub Actions (see generate-media_index.yml),
but you can also run it locally:

    python generate_media_index.py
"""

import json
import os
from pathlib import Path
from datetime import datetime

# --- Config -----------------------------------------------------------------

REPO_ROOT = Path(__file__).parent.resolve()
MEDIA_ROOT = REPO_ROOT / "media"

IMAGE_DIR = MEDIA_ROOT / "images"
AUDIO_DIR = MEDIA_ROOT / "audio"
VIDEO_DIR = MEDIA_ROOT / "videos"

IMAGE_EXTS = {".png", ".jpg", ".jpeg", ".gif", ".bmp", ".svg", ".webp", ".tif", ".tiff"}
AUDIO_EXTS = {".mp3", ".wav", ".flac", ".ogg", ".m4a", ".aac"}
VIDEO_EXTS = {".mp4", ".mov", ".avi", ".mkv", ".webm", ".mpeg", ".mpg", ".m4v"}

OUTPUT_FILE = MEDIA_ROOT / "media-index.json"


# --- Helpers ----------------------------------------------------------------

def human_size(num_bytes: int) -> str:
  """Rough human readable size, e.g. 1.2 MB."""
  step = 1024.0
  units = ["B", "KB", "MB", "GB", "TB"]
  size = float(num_bytes)
  for unit in units:
    if size < step:
      return f"{size:.1f} {unit}"
    size /= step
  return f"{size:.1f} PB"


def scan_folder(folder: Path, category: str, allowed_exts: set[str]) -> list[dict]:
  """
  Recursively scan a folder and return a list of file metadata dictionaries.
  category = "image" | "audio" | "video"
  """
  items: list[dict] = []
  if not folder.exists():
    return items

  for path in folder.rglob("*"):
    if not path.is_file():
      continue

    ext = path.suffix.lower()
    if ext not in allowed_exts:
      continue

    stat = path.stat()

    # relative path from repo root (so the front-end can request it directly)
    rel_path = path.relative_to(REPO_ROOT).as_posix()

    item = {
      "category": category,                # "image" / "audio" / "video"
      "filename": path.name,              # e.g. "photo01.png"
      "relativePath": rel_path,           # e.g. "media/images/photo01.png"
      "ext": ext.lstrip("."),
      "sizeBytes": stat.st_size,
      "sizeHuman": human_size(stat.st_size),
      "modified": datetime.utcfromtimestamp(stat.st_mtime).isoformat() + "Z",
    }
    items.append(item)

  return items


# --- Main -------------------------------------------------------------------

def main() -> None:
  MEDIA_ROOT.mkdir(exist_ok=True)

  images = scan_folder(IMAGE_DIR, "image", IMAGE_EXTS)
  audio = scan_folder(AUDIO_DIR, "audio", AUDIO_EXTS)
  videos = scan_folder(VIDEO_DIR, "video", VIDEO_EXTS)

  all_items = images + audio + videos

  index = {
    "generatedAt": datetime.utcnow().isoformat() + "Z",
    "counts": {
      "total": len(all_items),
      "images": len(images),
      "audio": len(audio),
      "videos": len(videos),
    },
    "items": all_items,
  }

  OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
  with OUTPUT_FILE.open("w", encoding="utf-8") as f:
    json.dump(index, f, indent=2, ensure_ascii=False)

  print(f"Media index written to {OUTPUT_FILE}")
  print(f"Found {len(images)} images, {len(audio)} audio files, {len(videos)} videos.")


if __name__ == "__main__":
  main()
