#!/usr/bin/env node
/**
 * Generate continuous Sora chapters with last-frame continuity,
 * then extract HQ WebP frames for scroll-film.
 *
 * Usage:
 *   node tools/generate-scroll-chapters.mjs
 *   node tools/generate-scroll-chapters.mjs --from 3   # resume from chapter 3
 *   node tools/generate-scroll-chapters.mjs --extract-only
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

function loadEnv() {
  const p = path.join(root, ".env.local");
  if (!fs.existsSync(p)) return;
  for (const line of fs.readFileSync(p, "utf8").split(/\r?\n/)) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m && !process.env[m[1].trim()]) process.env[m[1].trim()] = m[2].trim();
  }
}

loadEnv();
const KEY = process.env.OPENAI_API_KEY;
if (!KEY) {
  console.error("Missing OPENAI_API_KEY");
  process.exit(1);
}

const MODEL = process.env.SORA_MODEL || "sora-2"; // sora-2-pro for max quality
const SIZE = process.env.SORA_SIZE || "1280x720";
const SECONDS = process.env.SORA_SECONDS || "4";
const OUT = path.join(root, "tmp", "gen", "scroll-film");
const FRAMES = path.join(root, "public", "cinematic", "frames");
const SOURCE = path.join(root, "public", "cinematic", "source");

const GLOBAL =
  "Photoreal premium boutique aesthetic clinic in Rio de Janeiro (Guaratiba), nude cream chocolate gold palette, warm 3200K lighting, shallow DOF, continuous single-take cinematic feel, Apple/Rivian grade stillness. No on-screen text, logos, watermarks, UI, subtitles. No blood, no extreme needle close-ups, no gore. Respectful framing of women.";

const CHAPTERS = [
  {
    id: "01-fachada",
    prompt: `${GLOBAL} Shot 1: Slow dolly-in and slight low crane toward an elegant nude-plaster arched clinic facade at golden hour. Wooden door slightly ajar with warm light spilling inside. Quiet street, refined spa architecture, no signage text.`,
  },
  {
    id: "02-entrada",
    prompt: `${GLOBAL} Continue EXACTLY from the reference still. Push-in + gimbal walk through the ajar arched door into the warm nude foyer. Camera height, lens and lighting must match the reference. Seamless continuity, no cut.`,
  },
  {
    id: "03-recepcao",
    prompt: `${GLOBAL} Continue EXACTLY from the reference still. Slow tracking into a premium reception desk with wood, dried flowers, soft gold accents. Warm inviting atmosphere. Match reference camera and light. No text.`,
  },
  {
    id: "04-acolhimento",
    prompt: `${GLOBAL} Continue EXACTLY from the reference still. Soft 15-degree orbit: elegant Brazilian aesthetician in chocolate uniform warmly welcomes a female client in linen. Gentle smiles, caring presence. Match reference framing and 3200K light.`,
  },
  {
    id: "05-corredor",
    prompt: `${GLOBAL} Continue EXACTLY from the reference still. Gimbal walking down a luminous nude corridor with arched doorways and depth. Professional guiding ahead. Continuous motion, match reference.`,
  },
  {
    id: "06-ambientes",
    prompt: `${GLOBAL} Continue EXACTLY from the reference still. Pan and dolly into a serene treatment room: soft linens, discreet equipment, cream walls, arched niche. Premium spa calm. Match reference light and lens.`,
  },
  {
    id: "07-procedimentos",
    prompt: `${GLOBAL} Continue EXACTLY from the reference still. Gentle push-in on refined eyebrow design / soft facial aesthetic care — elegant hands, clean tools, no gore, no extreme clinical close-ups. Match reference continuity.`,
  },
  {
    id: "08-atendimento",
    prompt: `${GLOBAL} Continue EXACTLY from the reference still. Tracking shot with slight tilt-up on the professional performing careful beauty work. Calm focus, soft highlights on skin and fabric. Match reference.`,
  },
  {
    id: "09-resultado",
    prompt: `${GLOBAL} Continue EXACTLY from the reference still. Slow dolly-out as client looks in a mirror with a soft satisfied expression, warm enveloping light. Emotional lift without melodrama. Match reference.`,
  },
  {
    id: "10-encerramento",
    prompt: `${GLOBAL} Continue EXACTLY from the reference still. Gentle crane/hold as the camera settles on the serene clinic interior atmosphere — empty calm space, soft dust in light, premium stillness. No text, no logos.`,
  },
];

function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`);
  if (i === -1) return fallback;
  return process.argv[i + 1] ?? fallback;
}

const fromIdx = Math.max(0, Number(arg("from", "1")) - 1);
const extractOnly = process.argv.includes("--extract-only");

fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync(SOURCE, { recursive: true });

async function sleep(ms) {
  await new Promise((r) => setTimeout(r, ms));
}

async function createVideo(prompt, referencePng) {
  const form = new FormData();
  form.append("model", MODEL);
  form.append("prompt", prompt);
  form.append("seconds", SECONDS);
  form.append("size", SIZE);
  if (referencePng && fs.existsSync(referencePng)) {
    const buf = fs.readFileSync(referencePng);
    form.append("input_reference", new Blob([buf], { type: "image/png" }), "ref.png");
  }

  const res = await fetch("https://api.openai.com/v1/videos", {
    method: "POST",
    headers: { Authorization: `Bearer ${KEY}` },
    body: form,
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(`create failed: ${JSON.stringify(json)}`);
  }
  return json;
}

async function pollVideo(id) {
  for (let i = 0; i < 120; i++) {
    await sleep(10000);
    const res = await fetch(`https://api.openai.com/v1/videos/${id}`, {
      headers: { Authorization: `Bearer ${KEY}` },
    });
    const job = await res.json();
    process.stdout.write(`[${i}] ${job.status} ${job.progress ?? ""}\n`);
    if (job.status === "completed") return job;
    if (job.status === "failed") {
      throw new Error(`failed: ${JSON.stringify(job.error || job)}`);
    }
  }
  throw new Error("timeout");
}

async function downloadVideo(id, dest) {
  const res = await fetch(`https://api.openai.com/v1/videos/${id}/content`, {
    headers: { Authorization: `Bearer ${KEY}` },
    redirect: "follow",
  });
  if (!res.ok) throw new Error(`download ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(dest, buf);
  return dest;
}

function extractLastFrame(mp4, png) {
  const r = spawnSync(
    "ffmpeg",
    ["-y", "-sseof", "-0.04", "-i", mp4, "-frames:v", "1", png],
    { stdio: "inherit" },
  );
  if (r.status !== 0) throw new Error("last frame extract failed");
}

function concatChapters(files, dest) {
  const list = path.join(OUT, "concat.txt");
  fs.writeFileSync(
    list,
    files.map((f) => `file '${f.replace(/\\/g, "/")}'`).join("\n"),
  );
  const r = spawnSync(
    "ffmpeg",
    ["-y", "-f", "concat", "-safe", "0", "-i", list, "-c", "copy", dest],
    { stdio: "inherit" },
  );
  if (r.status !== 0) {
    // re-encode fallback
    const r2 = spawnSync(
      "ffmpeg",
      [
        "-y",
        "-f",
        "concat",
        "-safe",
        "0",
        "-i",
        list,
        "-c:v",
        "libx264",
        "-crf",
        "16",
        "-pix_fmt",
        "yuv420p",
        dest,
      ],
      { stdio: "inherit" },
    );
    if (r2.status !== 0) throw new Error("concat failed");
  }
}

function extractFrames(master) {
  fs.mkdirSync(FRAMES, { recursive: true });
  for (const f of fs.readdirSync(FRAMES)) {
    if (/^frame-\d+\.(webp|avif)$/.test(f)) {
      fs.unlinkSync(path.join(FRAMES, f));
    }
  }
  const pattern = path.join(FRAMES, "frame-%03d.webp");
  const r = spawnSync(
    "ffmpeg",
    [
      "-y",
      "-hide_banner",
      "-loglevel",
      "error",
      "-i",
      master,
      "-vf",
      "fps=12,scale=1280:720:flags=lanczos,unsharp=3:3:0.5:3:3:0.0",
      "-start_number",
      "0",
      "-c:v",
      "libwebp",
      "-quality",
      "96",
      "-compression_level",
      "4",
      pattern,
    ],
    { stdio: "inherit" },
  );
  if (r.status !== 0) throw new Error("frame extract failed");
  const count = fs
    .readdirSync(FRAMES)
    .filter((f) => /^frame-\d+\.webp$/.test(f)).length;
  return count;
}

function writeManifest(total) {
  const startFrame = Math.min(8, Math.max(0, total - 1));
  const manifest = {
    width: 1280,
    height: 720,
    total,
    startFrame,
    pad: 3,
    basePath: "/cinematic/frames",
    source: `scroll-film-${MODEL}-${CHAPTERS.length}ch`,
    quality: "high",
    scrollPinVh: Math.max(480, Math.round(total * 2.2)),
    formats: ["webp"],
    poster: `/cinematic/frames/frame-${String(Math.min(30, total - 1)).padStart(3, "0")}.webp`,
    mode: "scroll-film",
    playback: "none",
    chapters: CHAPTERS.map((c, i) => ({
      id: c.id,
      title: c.id,
      approxIndex: i,
    })),
    note: "Generated with Sora continuity; frames only — never play MP4 in UI",
  };
  fs.writeFileSync(
    path.join(root, "public", "cinematic", "manifest.json"),
    JSON.stringify(manifest, null, 2),
  );
}

async function main() {
  const mp4s = [];

  if (!extractOnly) {
    let reference = null;
    // If resuming, use previous chapter last frame
    if (fromIdx > 0) {
      const prevLast = path.join(OUT, `cap${String(fromIdx).padStart(2, "0")}-last.png`);
      if (fs.existsSync(prevLast)) reference = prevLast;
    }

    for (let i = fromIdx; i < CHAPTERS.length; i++) {
      const ch = CHAPTERS[i];
      const n = String(i + 1).padStart(2, "0");
      const mp4 = path.join(OUT, `cap${n}.mp4`);
      const last = path.join(OUT, `cap${n}-last.png`);
      const idFile = path.join(OUT, `cap${n}-id.txt`);

      console.log(`\n=== Chapter ${n} ${ch.id} (ref=${reference || "none"}) ===`);
      const job = await createVideo(ch.prompt, i === 0 ? null : reference);
      fs.writeFileSync(idFile, job.id);
      console.log("job", job.id);
      await pollVideo(job.id);
      await downloadVideo(job.id, mp4);
      console.log("saved", mp4, fs.statSync(mp4).size);
      extractLastFrame(mp4, last);
      reference = last;
      mp4s.push(mp4);

      // also copy into public chapters for archive
      const pub = path.join(root, "public", "cinematic", "chapters");
      fs.mkdirSync(pub, { recursive: true });
      fs.copyFileSync(mp4, path.join(pub, `cap${n}.mp4`));
    }
  }

  // Collect all chapter mp4s in order
  const all = [];
  for (let i = 0; i < CHAPTERS.length; i++) {
    const n = String(i + 1).padStart(2, "0");
    const mp4 = path.join(OUT, `cap${n}.mp4`);
    if (!fs.existsSync(mp4)) {
      console.error("Missing chapter", mp4);
      process.exit(1);
    }
    all.push(mp4);
  }

  const master = path.join(SOURCE, "scroll-film-master.mp4");
  console.log("\n=== Concat master ===");
  concatChapters(all, master);
  fs.copyFileSync(master, path.join(SOURCE, "hero-master.mp4"));

  console.log("\n=== Extract HQ frames ===");
  const total = extractFrames(master);
  writeManifest(total);
  console.log(`Done: ${total} frames @ WebP q96`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
