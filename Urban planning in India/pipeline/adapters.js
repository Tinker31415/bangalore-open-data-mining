// adapters.js — turn an external data source into updates for metrics.json.
//
// Each adapter is an async function (source, ctx) => updates
//   - `source`  is the entry from data/sources.json
//   - `ctx`     gives you { metrics, parseCSV, fetchJSON, ROOT }
//   - return an object of { "<dataset>.<dotted.path>": newValue, ... }
//     e.g. { "mobility_data.metroRide.values": [70, 11, 9, 5, 3.3] }
//
// Add a new source by (1) adding an entry to data/sources.json and
// (2) writing an adapter here whose name matches the entry's "adapter" field.
// Then run:  node pipeline/refresh.js
//
const fs = require("fs");
const path = require("path");

module.exports = {
  // ---- CSV example -------------------------------------------------------
  // Expects data/incoming/zone_congestion.csv with columns: id,congestion
  // Updates each zone's congestion sub-score; refresh.js then recomputes the
  // composite score + ranks automatically, so the whole zone analysis updates.
  async zoneCongestionCsv(source, ctx) {
    const file = path.join(ctx.ROOT, source.path);
    const rows = ctx.parseCSV(fs.readFileSync(file, "utf8"));
    const zones = ctx.metrics.datasets.zones;
    const updates = {};
    for (const r of rows) {
      const idx = zones.findIndex((z) => z.id === r.id);
      if (idx >= 0 && r.congestion !== undefined && r.congestion !== "") {
        updates[`zones.${idx}.c`] = Number(r.congestion);
      }
    }
    return updates;
  },

  // ---- API example (OpenAQ air quality) ----------------------------------
  // Template for pulling a live API. Returns a NEW dataset you could chart in
  // a future "Air Quality" tab. Disabled by default in sources.json.
  // Docs: https://docs.openaq.org
  async openaqAir(source, ctx) {
    const data = await ctx.fetchJSON(source.url, source.headers || {});
    // Shape the API response into a simple {cities, pm25} dataset.
    // (Adjust the mapping to the live response — verify the shape first.)
    const results = (data && data.results) || [];
    const cities = results.map((r) => r.city || r.location);
    const pm25 = results.map((r) => {
      const m = (r.measurements || []).find((x) => x.parameter === "pm25");
      return m ? m.value : null;
    });
    return { "livability_data.airQuality": { cities, pm25, unit: "µg/m³", source: source.name } };
  },

  // ---- Generic JSON-path API --------------------------------------------
  // Map arbitrary API fields to dataset paths using source.map:
  //   "map": { "mobility_data.metroRide.values": "data.dailyRidershipLakh" }
  async jsonApi(source, ctx) {
    const data = await ctx.fetchJSON(source.url, source.headers || {});
    const dig = (o, p) => p.split(".").reduce((c, k) => (c == null ? c : c[k]), o);
    const updates = {};
    for (const [target, srcPath] of Object.entries(source.map || {})) {
      const v = dig(data, srcPath);
      if (v !== undefined) updates[target] = v;
    }
    return updates;
  },
};
