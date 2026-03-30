import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const progressPath = path.join(root, "docs", "IMPLEMENTATION_PROGRESS.md");

const text = fs.readFileSync(progressPath, "utf8");
const lines = text.split(/\r?\n/);

const checkboxRe = /^\s*-\s+\[([ xX])\]/;
const phaseRe = /^### Phase \d+/;

let globalDone = 0;
let globalOpen = 0;
/** @type {{ title: string; done: number; open: number } | null} */
let currentPhase = null;
/** @type {{ title: string; done: number; open: number }[]} */
const phases = [];

for (const line of lines) {
  if (phaseRe.test(line)) {
    if (currentPhase) {
      phases.push(currentPhase);
    }
    currentPhase = {
      title: line.replace(/^###\s+/, "").trim(),
      done: 0,
      open: 0,
    };
    continue;
  }

  const m = line.match(checkboxRe);
  if (!m) {
    continue;
  }

  const done = m[1].toLowerCase() === "x";
  if (done) {
    globalDone += 1;
    if (currentPhase) {
      currentPhase.done += 1;
    }
  } else {
    globalOpen += 1;
    if (currentPhase) {
      currentPhase.open += 1;
    }
  }
}

if (currentPhase) {
  phases.push(currentPhase);
}

const total = globalDone + globalOpen;

console.log("Implementation progress (docs/IMPLEMENTATION_PROGRESS.md)\n");
console.log(`Overall: ${globalDone} done, ${globalOpen} open, ${total} total\n`);

for (const p of phases) {
  const t = p.done + p.open;
  if (t === 0) {
    continue;
  }
  console.log(`${p.title}: ${p.done} done, ${p.open} open, ${t} total`);
}
