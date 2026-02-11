import { build } from "esbuild";

(async () => {
  const zipName = process.env.ZIP_NAME || "authoriser";

  await build({
    entryPoints: ["src/handler.ts"],
    outfile: `${zipName}/handler.js`,
    bundle: true,
    minify: true,
    sourcemap: process.argv.includes("--source-map"),
    logLevel: "info",
    platform: "node",
  });
})();
