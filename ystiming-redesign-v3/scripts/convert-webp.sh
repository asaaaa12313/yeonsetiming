#!/usr/bin/env bash
# cwebp 일괄 변환: img/**/*.{jpg,png} → 옆에 *.webp 생성
# - 멱등: .webp 이미 있으면 스킵
# - 1920px 초과 시 다운스케일, 이하는 원본 크기 유지
# - mtime 보존
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
IMG_DIR="$ROOT/img"
Q=82
MAX_W=1920

[ -d "$IMG_DIR" ] || { echo "no img dir: $IMG_DIR"; exit 1; }
command -v cwebp >/dev/null || { echo "cwebp not installed"; exit 1; }

total=0
converted=0
skipped=0
failed=0
saved_kb=0

while IFS= read -r -d '' f; do
  total=$((total+1))
  webp="${f%.*}.webp"
  if [ -f "$webp" ]; then
    skipped=$((skipped+1))
    continue
  fi

  orig_kb=$(du -k "$f" | awk '{print $1}')
  w=$(sips -g pixelWidth "$f" 2>/dev/null | awk 'NR==2 {print $2}')

  if [ -n "$w" ] && [ "$w" -gt "$MAX_W" ] 2>/dev/null; then
    if ! cwebp -q "$Q" -resize "$MAX_W" 0 -mt -quiet "$f" -o "$webp" 2>/dev/null; then
      failed=$((failed+1))
      echo "FAIL: $f"
      continue
    fi
  else
    if ! cwebp -q "$Q" -mt -quiet "$f" -o "$webp" 2>/dev/null; then
      failed=$((failed+1))
      echo "FAIL: $f"
      continue
    fi
  fi

  touch -r "$f" "$webp"
  new_kb=$(du -k "$webp" | awk '{print $1}')
  saved_kb=$((saved_kb + orig_kb - new_kb))
  converted=$((converted+1))

  if [ $((converted % 20)) -eq 0 ]; then
    echo "  ...$converted/$total converted, saved ${saved_kb} KB so far"
  fi
done < <(find "$IMG_DIR" -type f \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" \) -print0)

echo ""
echo "=== Summary ==="
echo "Total found:  $total"
echo "Converted:    $converted"
echo "Skipped:      $skipped (already .webp)"
echo "Failed:       $failed"
echo "Saved:        $((saved_kb / 1024)) MB"
