#!/usr/bin/env python3
import json
import os
from datetime import datetime
from pathlib import Path
import requests

GITHUB_USER = "ferrannl"
API_URL = f"https://api.github.com/users/{GITHUB_USER}/repos?per_page=100&sort=updated"

ROOT = Path(__file__).resolve().parent.parent
OUTPUT_FILE = ROOT / "projects" / "projects.json"


def get_session():
  s = requests.Session()
  token = os.getenv("GITHUB_TOKEN") or os.getenv("GH_TOKEN")
  if token:
    s.headers["Authorization"] = f"Bearer {token}"
  s.headers["Accept"] = "application/vnd.github+json"
  return s


def normalize_language_name(name: str) -> str:
  """
  Make language labels look nice/consistent for the UI.
  (JS will just display these strings as-is.)
  """
  n = (name or "").strip()
  lower = n.lower()

  if lower == "html":
    return "HTML"
  if lower == "css":
    return "CSS"
  if lower == "javascript":
    return "JS"          # You show "JS" in the UI instead of "JavaScript"
  if lower == "typescript":
    return "TypeScript"
  if lower == "c#":
    return "C#"
  if lower == "c++":
    return "C++"
  if lower == "php":
    return "PHP"

  # Default: keep GitHub's label
  return n or ""


def fetch_repos_with_langs():
  """
  Fetch repos AND, for each repo, fetch the /languages breakdown.
  The per-repo languages are stored under repo["_languages"] as a list of
  language names ordered by bytes of code (largest first).
  """
  session = get_session()
  resp = session.get(API_URL, timeout=30)
  resp.raise_for_status()
  repos = resp.json()

  for repo in repos:
    repo_name = repo.get("name") or ""
    if not repo_name:
      repo["_languages"] = []
      continue

    languages_url = repo.get("languages_url") or (
      f"https://api.github.com/repos/{GITHUB_USER}/{repo_name}/languages"
    )

    try:
      lang_resp = session.get(languages_url, timeout=30)
      if not lang_resp.ok:
        repo["_languages"] = []
        continue

      lang_data = lang_resp.json()
      if not isinstance(lang_data, dict) or not lang_data:
        repo["_languages"] = []
        continue

      # Sort by bytes of code, descending (like GitHub does)
      sorted_langs = sorted(
        lang_data.items(),
        key=lambda kv: kv[1],
        reverse=True,
      )

      # Normalize labels & de-duplicate while keeping order
      ordered = []
      seen = set()
      for lang_name, _bytes in sorted_langs:
        label = normalize_language_name(lang_name)
        if label and label not in seen:
          seen.add(label)
          ordered.append(label)

      repo["_languages"] = ordered

    except Exception:
      # If anything fails, just fall back to primary language later
      repo["_languages"] = []

  return repos


def map_repo(repo: dict) -> dict | None:
  name = repo.get("name", "") or ""
  description = repo.get("description") or ""
  primary_language = repo.get("language") or ""

  # Hide the Projects repo itself
  if name.lower() == "projects":
    return None

  # Languages from /languages API (most reliable), fallback to the primary language
  langs = repo.get("_languages") or []
  if not langs and primary_language:
    langs = [normalize_language_name(primary_language)]

  has_pages = bool(repo.get("has_pages"))
  pages_url = f"https://{GITHUB_USER}.github.io/{name}/" if has_pages else ""

  return {
    "name": name,
    "description": description,
    # Keep the old single language field for compatibility
    "language": primary_language,
    # New: full languages list from GitHub's breakdown
    "languages": langs,
    "hasPages": has_pages,
    "pagesUrl": pages_url,
    "tags": [],
    "thumbnailUrl": "",
  }


def main():
  repos = fetch_repos_with_langs()

  projects = [
    mapped
    for repo in repos
    if not repo.get("private") and (mapped := map_repo(repo))
  ]

  # Sort alphabetically by repo name
  projects.sort(key=lambda p: p["name"].lower())

  OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
  OUTPUT_FILE.write_text(
    json.dumps(projects, indent=2, ensure_ascii=False),
    encoding="utf-8",
  )

  print(
    f"Wrote {len(projects)} projects to {OUTPUT_FILE} at "
    f"{datetime.utcnow().isoformat()}Z"
  )


if __name__ == "__main__":
  main()
