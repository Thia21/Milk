import { Resvg } from "@resvg/resvg-js";
import { readFileSync, writeFileSync } from "fs";

const svg = readFileSync("public/icon.svg");

for (const size of [192, 512]) {
  const resvg = new Resvg(svg, { fitTo: { mode: "width", value: size } });
  writeFileSync(`public/icon-${size}.png`, resvg.render().asPng());
  console.log(`✓ public/icon-${size}.png`);
}
console.log("Icons generated.");
