# Ambient music

The audio button plays **`ambient.m4a`** on loop (wired up in `../site.js`,
and preloaded via a `<link rel="preload">` in `../index.html`).

## Files here

| File | Size | What it is |
|------|------|------------|
| `ambient.m4a`   | ~2.1 MB | **In use.** 64 kbps AAC — re-encoded for fast first-load. |
| `ambient-48.m4a`| ~1.5 MB | Smaller 48 kbps alternative, if you want even faster loading. |
| `ambient.mp3`   | ~4.3 MB | Original 128 kbps upload, kept as a backup. |

The smaller files were made from the original with macOS's built-in tool:

```
afconvert -f m4af -d aac -b 64000 ambient.mp3 ambient.m4a     # 64 kbps
afconvert -f m4af -d aac -b 48000 ambient.mp3 ambient-48.m4a  # 48 kbps
```

## Swapping the track

To use a different file, update the name in `../site.js`
(`new Audio('music/ambient.m4a')`) and the preload line in `../index.html`.
Keep the file small (a couple of MB or less) so first-time visitors don't
wait for a large download before the music starts. Repeat visits are always
instant because the browser caches it.
