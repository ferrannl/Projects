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


def fetch_repos():
    session = get_session()
    resp = session.get(API_URL, timeout=30)
    resp.raise_for_status()
    return resp.json()


def map_repo(repo: dict) -> dict | None:
    name = repo.get("name", "")
    description = repo.get("description") or ""
    language = repo.get("language") or ""
    if name.lower() == "projects":
        return None
    has_pages = bool(repo.get("has_pages"))
    pages_url = f"https://{GITHUB_USER}.github.io/{name}/" if has_pages else ""
    return {
        "name": name,
        "description": description,
        "language": language,
        "hasPages": has_pages,
        "pagesUrl": pages_url,
        "tags": [],
        "thumbnailUrl": "",
    }


def main():
    repos = fetch_repos()
    projects = [
        mapped for repo in repos if not repo.get("private") and (mapped := map_repo(repo))
    ]
    projects.sort(key=lambda p: p["name"].lower())
    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_FILE.write_text(
        json.dumps(projects, indent=2, ensure_ascii=False), encoding="utf-8"
    )
    print(f"Wrote {len(projects)} projects to {OUTPUT_FILE} at {datetime.utcnow().isoformat()}Z")


if __name__ == "__main__":
    main()
