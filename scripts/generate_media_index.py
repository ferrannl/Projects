#!/usr/bin/env python3
import json
from pathlib import Path
from datetime import datetime

# Root van je media-map (relatief t.o.v. repo-root)
MEDIA_ROOT = Path("media")

# Output-bestand (met streepje, matched jouw workflow: media/media-index.json)
OUTPUT_FILE = MEDIA_ROOT / "media-index.json"

# Extensies om type te bepalen
IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".gif", ".webp", ".avif", ".bmp"}
VIDEO_EXTS = {".mp4", ".webm", ".mkv", ".mov", ".avi"}
AUDIO_EXTS = {".mp3", ".wav", ".flac", ".ogg", ".m4a"}


def infer_type(path: Path) -> str:
  """Bepaal of iets image / video / audio / other is."""
  p_str = path.as_posix().lower()
  ext = path.suffix.lower()

  # Mappen als hint gebruiken
  if "/images/" in p_str:
    return "image"
  if "/videos/" in p_str:
    return "video"
  if "/audio/" in p_str:
    return "audio"

  # Anders: extensie
  if ext in IMAGE_EXTS:
    return "image"
  if ext in VIDEO_EXTS:
    return "video"
  if ext in AUDIO_EXTS:
    return "audio"
  return "other"


def build_index():
  if not MEDIA_ROOT.exists():
    print(f"[WARN] Media folder '{MEDIA_ROOT}' bestaat niet. Schrijf lege index.")
    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_FILE.write_text(json.dumps({"items": []}, indent=2), encoding="utf-8")
    return

  items = []

  for path in MEDIA_ROOT.rglob("*"):
    if not path.is_file():
      continue

    file_type = infer_type(path)
    stat = path.stat()

    rel_path = path.as_posix()          # bv. "media/images/foo.png"
    title = path.stem                   # "foo"
    ext = path.suffix.lstrip(".").lower()

    items.append(
      {
        # Dit veld gebruikt je JS: item.src
        "src": rel_path,
        # Nice-to-have extra's
        "title": title,
        "type": file_type,
        "ext": ext,
        "size": stat.st_size,
        "modified": datetime.fromtimestamp(stat.st_mtime).isoformat(),
      }
    )

  OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
  payload = {"items": items}

  OUTPUT_FILE.write_text(
    json.dumps(payload, indent=2, ensure_ascii=False),
    encoding="utf-8",
  )

  print(f"[OK] Wrote {len(items)} items to {OUTPUT_FILE}")


if __name__ == "__main__":
  build_index()
