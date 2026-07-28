#!/usr/bin/env node
/**
 * Extract optimized WebP frames from a source video for scroll-film scrubbing.
 * Videos are NEVER played on the site — only used as frame sources.
 *
 * Usage:
 *   node tools/extract-frames.mjs --input public/cinematic/source/hero-master.mp4
 *   node tools/extract-frames.mjs --input clip.mp4 --out public/cinematic/frames --fps 12 --quality 96 --start 0
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`);
  if (i === -1) return fallback;
  return process.argv[i + 1] ?? fallback;
}

const input = arg("input", "public/cinematic/source/hero-master.mp4");
const out = arg("out", "public/cinematic/frames");
const fps = arg("fps", "12");
const quality = arg("quality", "96");
const startNumber = arg("start", "0");
const width = arg("width", "1280");
const height = arg("height", "720");

if (!fs.existsSync(input)) {
  console.error(`Input not found: ${input}`);
  process.exit(1);
}

fs.mkdirSync(out, { recursive: true });

const pattern = path.join(out, "frame-%03d.webp");
const vf = `fps=${fps},scale=${width}:${height}:flags=lanczos,unsharp=3:3:0.45:3:3:0.0`;

console.log(`Extracting frames\n  in:  ${input}\n  out: ${pattern}\n  fps: ${fps} q=${quality}`);

const r = spawnSync(
  "ffmpeg",
  [
    "-y",
    "-hide_banner",
    "-loglevel",
    "error",
    "-i",
    input,
    "-vf",
    vf,
    "-start_number",
    String(startNumber),
    "-c:v",
    "libwebp",
    "-quality",
    String(quality),
    "-compression_level",
    "4",
    pattern,
  ],
  { stdio: "inherit" },
);

if (r.status !== 0) {
  console.error("ffmpeg failed");
  process.exit(r.status || 1);
}

const files = fs
  .readdirSync(out)
  .filter((f) => f.endsWith(".webp") && f.startsWith("frame-"));
const sizes = files.map((f) => fs.statSync(path.join(out, f)).size);
const avg = sizes.reduce((a, b) => a + b, 0) / Math.max(1, sizes.length);

console.log(
  `Done: ${files.length} frames · avg ${(avg / 1024).toFixed(1)} KB · update manifest.total / startFrame / beats`,
);
