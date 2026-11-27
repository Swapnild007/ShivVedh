"""Copy the public application into a fresh GitHub Pages artifact directory."""
import argparse
import re
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def package(output):
    output = output.resolve()
    if output.exists():
        raise ValueError(f"Artifact directory already exists: {output}")

    files = list(ROOT.glob("*.html"))
    files.extend(ROOT / path for path in (
        "manifest.webmanifest", "sw.js", "manuscript/chapter-map.json",
    ))
    for directory in ("app", "assets", "data"):
        files.extend(path for path in (ROOT / directory).rglob("*") if path.is_file())

    # Confirm that a fresh install can fetch every file the worker precaches.
    staged_paths = {path.relative_to(ROOT).as_posix() for path in files}
    worker = (ROOT / "sw.js").read_text(encoding="utf-8")
    paths = re.search(r"const PATHS = \[(.*?)\];", worker, re.S)
    if not paths:
        raise ValueError("Could not find the service-worker precache list")
    precached = set(re.findall(r"'([^']+)'", paths[1])) - {"./"}
    missing = precached - staged_paths
    if missing:
        raise ValueError("Cached paths missing from Pages artifact: " + ", ".join(sorted(missing)))

    for source in files:
        target = output / source.relative_to(ROOT)
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(source, target)

    print(f"Staged {len(files)} public files in {output}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("output", type=Path)
    package(parser.parse_args().output)
