import path from "node:path";
import { runFullSync } from "../lib/sync.js";
import { writePages } from "../lib/render-pages.js";

const data = await runFullSync();
writePages(data, path.join(process.cwd(), "public"));
console.log(`Generated ${Object.keys(data).length * 2} static screen pages.`);
