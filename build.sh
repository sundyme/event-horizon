#!/bin/sh
# Wraps the page body (horizon.html, also published as a Claude artifact) into the standalone site page index.html.
cd "$(dirname "$0")"
SITE="https://sundyme.github.io/event-horizon/"
{
cat <<HEAD
<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="description" content="视界 EVENT HORIZON：72 秒实时光线追踪，从星空深处坠向黑洞。每一束光都沿史瓦西时空的测地线逐像素计算，声音与画面同步生成。">
<meta name="theme-color" content="#040407">
<meta property="og:type" content="website">
<meta property="og:title" content="视界 EVENT HORIZON">
<meta property="og:description" content="A real-time, physically ray-traced fall into a black hole. Runs in your browser.">
<meta property="og:image" content="${SITE}media/og.jpg">
<meta property="og:url" content="${SITE}">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="favicon.svg" type="image/svg+xml">
<script>window.HORIZON_SITE = true;</script>
</head><body>
HEAD
cat horizon.html
printf '\n</body></html>\n'
} > index.html
