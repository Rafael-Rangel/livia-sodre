#!/usr/bin/env node
/**
 * Continuity checklist helper — prints the next Sora prompt bridge
 * after extracting the last frame of a chapter.
 *
 * node tools/continuity-bridge.mjs --chapter 1 --lastFrame public/cinematic/chapters/cap1-last.png
 */
import fs from "node:fs";

const chapter = Number(
  process.argv[process.argv.indexOf("--chapter") + 1] || 1,
);

const bridges = {
  1: "Continue exactly from the reference still: arched clinic door ajar, warm spill light into nude foyer. Dolly/gimbal walk through the threshold. Same lens, height, 3200K, nude/cream palette. No text, logos, UI.",
  2: "Continue exactly from the reference still: foyer looking toward reception desk. Slow tracking into reception. Match camera height, FOV, lighting. Photoreal boutique spa. No text.",
  3: "Continue exactly from the reference still: client at reception desk 3/4. Soft orbit 15°. Same LUT and framing. Respectful, premium. No text.",
  4: "Continue exactly from the reference still: start of nude corridor, professional ahead. Gimbal walking forward. Continuous single take feel. No text.",
  5: "Continue exactly from the reference still: treatment room door ajar with warm interior light. Pan/dolly into room. Match exposure. No text.",
  6: "Continue exactly from the reference still: treatment chair/bed in frame, hands entering. Gentle push-in. No gore, no extreme needle CU. No text.",
  7: "Continue exactly from the reference still: care gesture mid-frame. Tracking + slight tilt. Same DOF. No text.",
  8: "Continue exactly from the reference still: mirror entering frame, soft smile. Slow dolly out. No text.",
  9: "Continue exactly from the reference still: space opening as camera retreats. Hold on serene clinic atmosphere. No text, logos, UI.",
};

const prompt = bridges[chapter];
if (!prompt) {
  console.error("Unknown chapter. Use 1–9.");
  process.exit(1);
}

console.log(`\n=== Bridge prompt for chapter ${chapter} → ${chapter + 1} ===\n`);
console.log(prompt);
console.log(
  `\nAttach --lastFrame as OpenAI input_reference. Extract frames with:\n  npm run frames:extract -- --input <chapter.mp4>\n`,
);

const last = process.argv.indexOf("--lastFrame");
if (last !== -1) {
  const p = process.argv[last + 1];
  console.log(fs.existsSync(p) ? `Last frame OK: ${p}` : `Missing: ${p}`);
}
