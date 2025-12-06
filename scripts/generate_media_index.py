#!/usr/bin/env python3
import json
import os
from pathlib import Path

# Root of the repo (this script lives in `scripts/`)
REPO_ROOT = Path(__file__).resolve().parent.parent
MEDIA_ROOT = REPO_ROOT / "media"
OUTPUT_FILE = MEDIA_ROOT / "media-index.json"

# File type mapping
IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp"}
VIDEO_EXTS = {".mp4", ".webm", ".mov", ".m4v"}
AUDIO_EXTS = {".mp3", ".wav", ".ogg", ".flac", ".m4a"}

def detect_type(path: Path) -> str | None:
  ext = path.suffix.lower()
  if ext in IMAGE_EXTS:
    return "image"
  if ext in VIDEO_EXTS:
    return "video"
  if ext in AUDIO_EXTS:
    return "audio"
  return None

def build_title(path: Path) -> str:
  """Use file name (without extension) as title."""
  name = path.stem
  # Replace separators with spaces, basic prettify
  name = name.replace("_", " ").replace("-", " ")
  return name.strip() or path.name

def main() -> None:
  if not MEDIA_ROOT.exists():
    print(f"[generate_media_index] No 'media' folder found at {MEDIA_ROOT}")
    return

  items = []

  for root, dirs, files in os.walk(MEDIA_ROOT):
    root_path = Path(root)
    for filename in files:
      file_path = root_path / filename

      # Skip the index file itself
      if file_path.name == "media-index.json":
        continue

      file_type = detect_type(file_path)
      if file_type is None:
        # Skip unsupported types
        continue

      # Path relative to media/ (so subfolders work too)
      rel_path = file_path.relative_to(MEDIA_ROOT)
      # src is "media/..." relative to index.html
      src = f"media/{rel_path.as_posix()}"

      item = {
        "src": src,
        "type": file_type,
        "title": build_title(file_path)
      }
      items.append(item)

  # Sort by src for stable output
  items.sort(key=lambda x: x["src"])

  data = {"items": items}

  OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
  with OUTPUT_FILE.open("w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

  print(f"[generate_media_index] Wrote {len(items)} items to {OUTPUT_FILE}")

if __name__ == "__main__":
  main()
