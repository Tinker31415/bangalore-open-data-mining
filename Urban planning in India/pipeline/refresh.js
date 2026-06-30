#!/usr/bin/env node
// refresh.js — the one command that threads new data through everything.
//
//   node pipeline/refresh.js            # fetch enabled sources -> merge -> recompute -> build
//   node pipeline/refresh.js --no-build # stop after updating metrics.json
//
// Flow:
//   1. read data/sources.json
//   2. for each ENABLED source, apply its updates (manual) or run its adapter (csv/api)
//   3. merge updates into data/metrics.json (by dotted path)
//   4. recompute derived metrics (e.g. zone composite scores + ranks)
//   5. run build.js so every artifact reflects the new data
//
const { execFileSync } = require("child_process");
const path = require("path");
const L = require("./lib");
const adapters = require("./adapters");

async function fetchJSON(url, headers) {
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json();
}

// ---- Derived metrics: keep the analysis consistent after raw inputs change ----
// Zone mobility-stress = (congestion*2 + density + transitGap) / 4, ranked 1..N.
function recompute(metrics) {
  const zones = metrics.datasets.zones;
  if (Array.isArray(zones)) {
    zones.forEach((z) => { z.score = Math.round((z.c * 2 + z.d + z.t) / 4); });
    const ranked = [...zones].sort((a, b) => b.score - a.score);
    ranked.forEach((z, i) => { z.rank = i + 1; });
  }
  // Add other derived recomputations here as the analysis grows.
}

(async () => {
  const metrics = L.readJSON(L.METRICS);
  const reg = L.readJSON(L.SOURCES);
  const ctx = { metrics, parseCSV: L.parseCSV, fetchJSON, ROOT: L.ROOT };
  metrics._sources = metrics._sources || {};

  let applied = 0;
  for (const s of reg.sources) {
    if (!s.enabled) continue;
    try {
      let updates = {};
      if (s.type === "manual") updates = s.updates || {};
      else {
        const fn = adapters[s.adapter];
        if (!fn) throw new Error(`no adapter '${s.adapter}'`);
        updates = (await fn(s, ctx)) || {};
      }
      for (const [p, v] of Object.entries(updates)) L.setPath(metrics.datasets, p, v);
      metrics._sources[s.id] = { name: s.name, type: s.type, lastUpdated: new Date().toISOString(), fields: Object.keys(updates) };
      applied++;
      console.log(`  applied ${s.id} (${Object.keys(updates).length} field(s))`);
    } catch (e) {
      console.error(`  ! ${s.id} failed: ${e.message}`);
    }
  }

  recompute(metrics);
  metrics._meta.generated = new Date().toISOString();
  L.writeJSON(L.METRICS, metrics);
  console.log(`Merged ${applied} source(s) into metrics.json and recomputed derived metrics.`);

  if (process.argv.includes("--no-build")) return;
  execFileSync("node", [path.join(__dirname, "build.js")], { stdio: "inherit" });
})();
