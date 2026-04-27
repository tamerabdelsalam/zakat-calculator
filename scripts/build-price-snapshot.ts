import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { buildPriceSnapshotFile } from "../src/lib/prices/build-snapshot";
import { getSnapshotFilePath } from "../src/lib/prices/snapshot";

async function main(): Promise<void> {
  const gold = process.env.GOLD_API_KEY;
  const ex = process.env.EXCHANGE_RATE_API_KEY;
  if (!gold || !ex) {
    console.error("Set GOLD_API_KEY and EXCHANGE_RATE_API_KEY.");
    process.exit(1);
  }

  const file = await buildPriceSnapshotFile({ goldApiKey: gold, exchangeApiKey: ex });
  const out = getSnapshotFilePath();
  await mkdir(path.dirname(out), { recursive: true });
  await writeFile(out, JSON.stringify(file, null, 2) + "\n", "utf-8");
  console.log("Wrote", out);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
