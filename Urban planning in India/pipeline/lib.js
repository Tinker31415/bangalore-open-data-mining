// Shared helpers for the data pipeline.
// Pure Node (>=18). No external dependencies.
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const DATA_DIR = path.join(ROOT, "data");
const METRICS = path.join(DATA_DIR, "metrics.json");
const SOURCES = path.join(DATA_DIR, "sources.json");
const TARGETS = path.join(__dirname, "targets.json");

function readJSON(p) { return JSON.parse(fs.readFileSync(p, "utf8")); }
function writeJSON(p, obj) { fs.writeFileSync(p, JSON.stringify(obj, null, 2) + "\n", "utf8"); }
function loadTargets() { return readJSON(TARGETS).targets; }

// Extract the JS literal assigned between markers:  /* @data:VAR ... */ const VAR = <literal>; /* @end:VAR */
function blockRegex(varName) {
  return new RegExp(
    "(/\\* @data:" + varName + "[\\s\\S]*?\\*/\\n)([\\s\\S]*?)(\\n/\\* @end:" + varName + " \\*/)"
  );
}

// Read one dataset's value out of an artifact file (evaluates the literal safely — data only, no functions).
function extractFromHtml(html, varName) {
  const m = html.match(blockRegex(varName));
  if (!m) throw new Error("Markers for " + varName + " not found");
  let body = m[2].trim();                       // e.g.  const DATA = { ... };
  body = body.replace(/^const\s+\w+\s*=\s*/, "") // -> { ... };
             .replace(/;\s*$/, "");              // -> { ... }
  // eslint-disable-next-line no-new-func
  return Function('"use strict"; return (' + body + ");")();
}

// Write one dataset's value back into an artifact file, preserving the marker lines.
function injectIntoHtml(html, varName, value) {
  const literal = "const " + varName + " = " + JSON.stringify(value, null, 2) + ";";
  return html.replace(blockRegex(varName), (_all, open, _old, close) => open + literal + close);
}

// Set a value at a dotted path inside an object, e.g. setPath(ds, "mobility_data.metroRide.values", [..]).
// Supports numeric array indices: "zones.0.c".
function setPath(obj, dotted, value) {
  const keys = dotted.split(".");
  let cur = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    const k = keys[i];
    if (cur[k] === undefined) cur[k] = /^\d+$/.test(keys[i + 1]) ? [] : {};
    cur = cur[k];
  }
  cur[keys[keys.length - 1]] = value;
}
function getPath(obj, dotted) {
  return dotted.split(".").reduce((c, k) => (c == null ? c : c[k]), obj);
}

// Minimal CSV parser -> array of row objects keyed by header. Handles quoted fields and commas.
function parseCSV(text) {
  const rows = [];
  const lines = text.replace(/\r\n/g, "\n").trim().split("\n");
  const split = (line) => {
    const out = []; let cur = ""; let q = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (q) { if (ch === '"' && line[i + 1] === '"') { cur += '"'; i++; } else if (ch === '"') { q = false; } else cur += ch; }
      else { if (ch === '"') q = true; else if (ch === ",") { out.push(cur); cur = ""; } else cur += ch; }
    }
    out.push(cur); return out.map((s) => s.trim());
  };
  const headers = split(lines[0]);
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const cells = split(lines[i]);
    const row = {}; headers.forEach((h, j) => (row[h] = cells[j]));
    rows.push(row);
  }
  return rows;
}

module.exports = {
  ROOT, DATA_DIR, METRICS, SOURCES, TARGETS,
  readJSON, writeJSON, loadTargets,
  extractFromHtml, injectIntoHtml, setPath, getPath, parseCSV,
};
