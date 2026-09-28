#!/usr/bin/env bash
# render.sh — render Þing's social card (Open Graph) from its source.
#
# The card's source is tools/og-card/thing-og.html — a 1200×630 page that loads
# the hall's own cloth fonts (Cormorant / Newsreader / IBM Plex Mono) and draws
# the mark of public/images/logo.svg. The rasters under public/images/ are BUILD
# ARTIFACTS: edit the HTML, run this, commit both.
#
# Why a renderer at all: an OG card is a picture of the page it links to, so it
# must be re-cut whenever the brand moves. A card nobody can regenerate is a card
# that quietly goes stale — and the card is the first thing a stranger sees.
#
# Usage:
#   tools/og-card/render.sh            # render PNG + JPG into public/images/
#   tools/og-card/render.sh --check    # render to a temp dir, compare, write nothing
#   tools/og-card/render.sh --version
#
# Env:
#   OG_CHROMIUM   the browser to render with (default: the first one found)
#   OG_SCALE      device scale factor (default 1 — the card is exactly 1200×630)
#
# Exit: 0 rendered, 1 a tool is missing or the render came out wrong, 2 usage.
set -u

VERSION="1.0.0"
case "${1-}" in
    -v|-V|--version) printf '%s\n' "$VERSION"; exit 0 ;;
    -h|--help) sed -n '2,21p' "$0" | sed 's/^# \{0,1\}//'; exit 0 ;;
esac

MODE="${1:-render}"
case "$MODE" in render|--check) ;; *) printf 'error: unknown flag %s\nhelp: tools/og-card/render.sh [--check]\n' "$MODE" >&2; exit 2 ;; esac

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO="$(cd "$HERE/../.." && pwd)"
SRC="$HERE/thing-og.html"
OUT_DIR="$REPO/public/images"
NAME="thing-og"
WIDTH=1200
HEIGHT=630
SCALE="${OG_SCALE:-1}"

say() { printf '%s\n' "$*"; }
die() { printf 'error: %s\n' "$*" >&2; exit 1; }

[ -f "$SRC" ] || die "the card source is missing: $SRC"

# --- the browser -----------------------------------------------------------
find_chromium() {
    local c
    if [ -n "${OG_CHROMIUM:-}" ]; then
        command -v "$OG_CHROMIUM" >/dev/null 2>&1 && { command -v "$OG_CHROMIUM"; return 0; }
        [ -x "$OG_CHROMIUM" ] && { printf '%s' "$OG_CHROMIUM"; return 0; }
        return 1
    fi
    for c in chromium chromium-browser google-chrome google-chrome-stable brave brave-browser microsoft-edge; do
        command -v "$c" >/dev/null 2>&1 && { command -v "$c"; return 0; }
    done
    return 1
}

# --- the raster tools ------------------------------------------------------
find_magick() {
    local c
    for c in magick convert; do
        command -v "$c" >/dev/null 2>&1 && { command -v "$c"; return 0; }
    done
    return 1
}

find_identify() {
    local c
    for c in identify magick; do
        command -v "$c" >/dev/null 2>&1 && { command -v "$c"; return 0; }
    done
    return 1
}

CHROME="$(find_chromium || true)"
[ -n "$CHROME" ] || die "no chromium-family browser found — set OG_CHROMIUM=<path>"

TMP="$(mktemp -d "${TMPDIR:-/tmp}/thing-og.XXXXXX")" || die "cannot make a temp dir"
trap 'rm -rf "$TMP"' EXIT

# --- render ----------------------------------------------------------------
# --virtual-time-budget lets the webfonts land before the shutter: a card
# rendered before its fonts is a card in the wrong typeface.
"$CHROME" \
    --headless=new \
    --disable-gpu \
    --no-sandbox \
    --hide-scrollbars \
    --force-device-scale-factor="$SCALE" \
    --window-size="$WIDTH,$HEIGHT" \
    --virtual-time-budget=10000 \
    --screenshot="$TMP/$NAME.png" \
    "file://$SRC" >/dev/null 2>&1 || die "the browser failed to render the card"

[ -s "$TMP/$NAME.png" ] || die "the browser wrote no image"

# --- the geometry is a contract -------------------------------------------
IDENTIFY="$(find_identify || true)"
if [ -n "$IDENTIFY" ]; then
    dims="$("$IDENTIFY" -format '%wx%h' "$TMP/$NAME.png" 2>/dev/null | head -1)"
    [ "$dims" = "${WIDTH}x${HEIGHT}" ] || die "the render came out ${dims:-unknown}, not ${WIDTH}x${HEIGHT}"
else
    say "note: no ImageMagick identify — the ${WIDTH}x${HEIGHT} check was skipped"
fi

# --- the JPEG twin ---------------------------------------------------------
# Crawlers take the JPEG happily and it is a tenth of the bytes, so both ship.
# The house does the same for Hlidskjalf's card (og.png + og.jpg).
MAGICK="$(find_magick || true)"
if [ -n "$MAGICK" ]; then
    "$MAGICK" "$TMP/$NAME.png" -strip -interlace Plane -quality 88 "$TMP/$NAME.jpg" 2>/dev/null \
        || say "note: the JPEG twin could not be made — the PNG is still usable"
fi

# --- write, or compare -----------------------------------------------------
if [ "$MODE" = "--check" ]; then
    rc=0
    for ext in png jpg; do
        [ -f "$TMP/$NAME.$ext" ] || continue
        if [ -f "$OUT_DIR/$NAME.$ext" ] && cmp -s "$TMP/$NAME.$ext" "$OUT_DIR/$NAME.$ext"; then
            say "  $NAME.$ext  unchanged"
        else
            say "  $NAME.$ext  DIFFERS from what is committed"
            rc=1
        fi
    done
    exit "$rc"
fi

mkdir -p "$OUT_DIR"
cp -f "$TMP/$NAME.png" "$OUT_DIR/$NAME.png"
say "rendered $OUT_DIR/$NAME.png ($(wc -c <"$OUT_DIR/$NAME.png") bytes)"
if [ -f "$TMP/$NAME.jpg" ]; then
    cp -f "$TMP/$NAME.jpg" "$OUT_DIR/$NAME.jpg"
    say "rendered $OUT_DIR/$NAME.jpg ($(wc -c <"$OUT_DIR/$NAME.jpg") bytes)"
fi
