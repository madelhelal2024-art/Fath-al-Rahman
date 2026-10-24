// Build downloadable one-item AAC clips from the timestamp manifest.
// Run: node scripts/split-audio.mjs
// These are machine-generated cuts and need educator listening review.
import { readFileSync, mkdirSync, mkdtempSync, copyFileSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import vm from "node:vm";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const context = { window: {} };
vm.runInNewContext(readFileSync(join(projectRoot, "audio-segments.js"), "utf8"), context);
const segments = context.window.PAGE_SEGMENTS;
const sourceByLesson = {
  letters: "01-letters.m4a",
  fatha: "02-fatha.m4a",
  words1: "03-words-1.m4a",
  words2: "04-words-2.m4a"
};

const work = mkdtempSync(join(tmpdir(), "fath-audio-clips-"));
const rows = ["lesson,item_number,start_seconds,end_seconds,clip_path"];
let generated = 0;

for (const [lesson, clips] of Object.entries(segments)) {
  const input = join(projectRoot, "assets", "audio", sourceByLesson[lesson]);
  for (const [index, [start, end]] of clips.entries()) {
    const filename = `${String(index + 1).padStart(2, "0")}.m4a`;
    const folder = join(work, lesson);
    const output = join(folder, filename);
    mkdirSync(folder, { recursive: true });
    const ffmpeg = spawnSync("ffmpeg", [
      "-hide_banner", "-loglevel", "error", "-y", "-ss", String(start),
      "-i", input, "-t", String((end - start).toFixed(2)), "-vn", "-ac", "1",
      "-c:a", "aac", "-b:a", "96k", output
    ], { stdio: "pipe", encoding: "utf8" });
    if (ffmpeg.status !== 0 || statSync(output).size < 1000) {
      throw new Error(`Failed to cut ${lesson}/${filename}: ${ffmpeg.stderr}`);
    }
    rows.push(`${lesson},${index + 1},${start},${end},${lesson}/${filename}`);
    generated++;
  }
}

// Write the manifest into the archive using standard shell-free Node output.
import { writeFileSync } from "node:fs";
writeFileSync(join(work, "manifest.csv"), rows.join("\n") + "\n", "utf8");
const temporaryZip = join(work, "..", `fath-split-clips-${Date.now()}.zip`);
const zip = spawnSync("zip", ["-q", "-r", temporaryZip, ...Object.keys(segments), "manifest.csv"], { cwd: work, encoding: "utf8" });
if (zip.status !== 0) throw new Error(`Archive failed: ${zip.stderr}`);
const destination = join(projectRoot, "assets", "audio", "individual-clips.zip");
copyFileSync(temporaryZip, destination);
console.log(`Generated ${generated} clips in ${destination}`);
