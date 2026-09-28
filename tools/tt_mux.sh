#!/bin/sh
# tools/tt_mux.sh zh|en → out/HORIZON_TikTok_<LANG>.mp4  (clean picture + text layer + limited soundtrack)
cd "$(dirname "$0")/.." || exit 1
L=$1; U=$(echo "$L" | tr a-z A-Z)
printf "file 'ttA.mp4'\nfile 'ttB.mp4'\n" > out/tt_parts.txt
ffmpeg -y -loglevel error -f concat -safe 0 -i out/tt_parts.txt -framerate 30 -i "out/ttx_$L/%05d.png" -i out/tt.wav \
  -filter_complex "[0:v][1:v]overlay=0:0:format=auto,format=yuv420p[v];[2:a]alimiter=limit=0.84:attack=2:release=60:level=false[a]" \
  -map "[v]" -map "[a]" -c:v libx264 -preset slow -crf 17 -profile:v high -level 4.2 -maxrate 18M -bufsize 36M -g 60 -r 30 \
  -color_primaries bt709 -color_trc bt709 -colorspace bt709 -c:a aac -b:a 256k -ar 48000 -shortest -movflags +faststart \
  "out/HORIZON_TikTok_$U.mp4"
