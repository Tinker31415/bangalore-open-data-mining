#!/usr/bin/env node
// extract.js — seed/refresh data/metrics.json FROM the current artifacts.
// Run this once to create the single source of truth, or any time you've hand-edited
// an artifact's data block and want metrics.json to catch up.
//
//   node pipeline/extract.js
//
const fs = require("fs");
const path = require("path");
const L = require("./lib");

const targets = L.loadTargets();
const datasets = {};
for (const t of targets) {
  const html = fs.readFileSync(path.join(L.ROOT, t.file), "utf8");
  datasets[t.id] = L.extractFromHtml(html, t.var);
  console.log("  extracted", t.id, "from", t.file);
}

// Preserve existing _meta / _sources provenance if metrics.json already exists.
let prev = {};
if (fs.existsSync(L.METRICS)) { try { prev = L.readJSON(L.METRICS); } catch (_) {} }

const out = {
  _meta: {
    description:
      "Single source of truth for the Urban Planning in India artifacts. " +
      "Edit values in 'datasets' (or via pipeline/refresh.js from registered sources), " +
      "then run 'node pipeline/build.js' to thread the changes into every dashboard.",
    generated: new Date().toISOString(),
    datasets: targets.map((t) => t.id),
  },
  _sources: prev._sources || {},
  datasets,
};
L.writeJSON(L.METRICS, out);
console.log("Wrote", L.METRICS);
