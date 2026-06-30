#!/usr/bin/env node
// build.js — thread data/metrics.json INTO every artifact.
// This is the step that makes new data flow through all dashboards at once.
//
//   node pipeline/build.js
//
// After this runs, ask Claude to re-publish the artifacts (or open the updated
// HTML files directly). Presentation/structure are untouched — only the data
// between the /* @data:VAR */ ... /* @end:VAR */ markers is replaced.
//
const fs = require("fs");
const path = require("path");
const L = require("./lib");

const metrics = L.readJSON(L.METRICS);
const targets = L.loadTargets();

let changed = 0;
for (const t of targets) {
  const file = path.join(L.ROOT, t.file);
  const before = fs.readFileSync(file, "utf8");
  const value = metrics.datasets[t.id];
  if (value === undefined) { console.warn("  ! no dataset for", t.id, "- skipped"); continue; }
  const after = L.injectIntoHtml(before, t.var, value);
  if (after !== before) { fs.writeFileSync(file, after, "utf8"); changed++; console.log("  updated", t.var, "in", t.file); }
  else console.log("  unchanged", t.var, "in", t.file);
}
console.log(changed ? `Build complete — ${changed} block(s) updated.` : "Build complete — nothing to change.");
console.log("Next: re-publish the artifacts (ask Claude: \"refresh the dashboards\").");
