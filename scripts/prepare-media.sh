#!/usr/bin/env bash
# Готовит медиа для интро из исходных роликов Higgsfield/Kling.
# Использование: bash scripts/prepare-media.sh raw/t1.mp4 raw/t2.mp4 raw/t3.mp4
# Результат в public/media: t1..t3.mp4/.webm, развёрнутые t1-rev..t3-rev и кадры покоя scene-0..3.jpg
set -euo pipefail
OUT="$(dirname "$0")/../public/media"; mkdir -p "$OUT"
ENC=(-an -c:v libx264 -preset veryfast -crf 23 -pix_fmt yuv420p -g 12 -movflags +faststart -vf "scale='min(1920,iw)':-2")
i=1
for SRC in "$@"; do
  ffmpeg -v error -y -i "$SRC" "${ENC[@]}" "$OUT/t$i.mp4"
  # развёрнутая версия: назад играем нативно, а не перемоткой currentTime
  ffmpeg -v error -y -i "$OUT/t$i.mp4" -an -c:v libx264 -preset veryfast -crf 23 -pix_fmt yuv420p -g 12 -movflags +faststart -vf reverse "$OUT/t$i-rev.mp4"
  # WebM (VP9) — запасной формат для браузеров без H.264
  for f in "t$i" "t$i-rev"; do
    ffmpeg -v error -y -i "$OUT/$f.mp4" -an -c:v libvpx-vp9 -b:v 0 -crf 36 -deadline realtime -cpu-used 8 -row-mt 1 -g 12 "$OUT/$f.webm"
  done
  # кадр покоя = последний кадр перехода (для сцены 0 — первый кадр первого ролика)
  [ "$i" = 1 ] && ffmpeg -v error -y -i "$OUT/t1.mp4" -frames:v 1 -q:v 3 "$OUT/scene-0.jpg"
  ffmpeg -v error -y -sseof -0.1 -i "$OUT/t$i.mp4" -update 1 -q:v 3 "$OUT/scene-$i.jpg"
  i=$((i+1))
done
ls -la "$OUT"
