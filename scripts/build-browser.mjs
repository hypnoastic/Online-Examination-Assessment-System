import { mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";

import { build } from "esbuild";

const browserEntries = [
  {
    entry: resolve("src/browser/question-bank/index.ts"),
    outfile: resolve("dist/browser-bundles/question-bank/index.js"),
  },
  {
    entry: resolve("src/browser/question-bank/create.ts"),
    outfile: resolve("dist/browser-bundles/question-bank/create.js"),
  },
];

await Promise.all(
  browserEntries.map(async ({ entry, outfile }) => {
    await mkdir(dirname(outfile), { recursive: true });

    await build({
      entryPoints: [entry],
      outfile,
      bundle: true,
      format: "esm",
      platform: "browser",
      target: "es2022",
      sourcemap: false,
      legalComments: "none",
    });
  }),
);
