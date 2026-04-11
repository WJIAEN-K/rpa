#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
OUT_FILE="$ROOT_DIR/index.html"

parts=(
  "$ROOT_DIR/src/top.html"
  "$ROOT_DIR/src/sections/overlays.html"
  "$ROOT_DIR/src/sections/nav.html"
  "$ROOT_DIR/src/sections/hero.html"
  "$ROOT_DIR/src/sections/stats.html"
  "$ROOT_DIR/src/sections/scenarios.html"
  "$ROOT_DIR/src/sections/process.html"
  "$ROOT_DIR/src/sections/tools.html"
  "$ROOT_DIR/src/sections/cta.html"
  "$ROOT_DIR/src/sections/footer.html"
  "$ROOT_DIR/src/bottom.html"
)

for part in "${parts[@]}"; do
  if [[ ! -f "$part" ]]; then
    echo "missing part: $part" >&2
    exit 1
  fi
done

cat "${parts[@]}" > "$OUT_FILE"
echo "built $OUT_FILE"
