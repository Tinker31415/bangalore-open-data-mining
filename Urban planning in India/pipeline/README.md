# Data pipeline — how new data threads through every dashboard

This project's three interactive dashboards all read their numbers from **one place**:
`data/metrics.json`. Change the data once, run one command, and every artifact updates —
the structure and presentation never change.

```
data/
  metrics.json     ← single source of truth (all numbers, generated)
  sources.json     ← registry: where you ADD new data sources (CSV / API / manual)
  incoming/        ← drop CSV files here
pipeline/
  extract.js       ← seed metrics.json FROM the dashboards (round-trip safety)
  build.js         ← inject metrics.json INTO the dashboards (the threading step)
  refresh.js       ← fetch sources → merge → recompute → build  (the one command)
  adapters.js      ← code that turns a source into data updates
  lib.js, targets.json
```

The dashboards are:
| Artifact | Variable(s) fed |
|---|---|
| Bengaluru Livability Dashboard – Traffic & Water | `DATA` |
| Bengaluru Mobility Dashboard – Metro & Bus | `DATA`, `ROADMAP` |
| Bengaluru Zone Traffic Drilldown | `ZONES` |

Each data block in the HTML is wrapped in `/* @data:VAR */ … /* @end:VAR */` markers.
`build.js` only ever rewrites what's between those markers.

---

## The three ways to add data

Edit **`data/sources.json`** and set `"enabled": true`. There are three source types:

### 1. `manual` — type a number you read from a report
```json
{ "id": "metro_ridership_jul26", "type": "manual", "enabled": true,
  "updates": { "mobility_data.metroRide.values": [70, 11, 9, 5, 3.3] } }
```
Keys are dotted paths into `metrics.json → datasets`. (Open `metrics.json` to see every path.)

### 2. `csv` — drop a file in `data/incoming/`
```json
{ "id": "zone_congestion_csv", "type": "csv", "enabled": true,
  "path": "data/incoming/zone_congestion.csv", "adapter": "zoneCongestionCsv" }
```
Example file (`id` = zone id, `congestion` = 0–100):
```
id,congestion
mahadevapura,97
bommanahalli,92
```
The zone composite **score and rank recompute automatically** — so a single new input
threads through the whole zone analysis and map colours.

### 3. `api` — pull a live endpoint
Either map fields with **no code** using the `jsonApi` adapter:
```json
{ "id": "transit_api", "type": "api", "enabled": true,
  "url": "https://example.org/api/transit", "adapter": "jsonApi",
  "map": { "mobility_data.busNorm.values": "data.busesPerLakh" } }
```
…or write a small adapter in `pipeline/adapters.js` (see the `openaqAir` air-quality
template) for anything that needs reshaping.

---

## Run it

```bash
# from the project root:
node pipeline/refresh.js        # fetch enabled sources → merge → recompute → rebuild all dashboards
```
Other commands:
```bash
node pipeline/extract.js        # pull current dashboard data back into metrics.json
node pipeline/build.js          # re-inject metrics.json into dashboards (no fetching)
node pipeline/refresh.js --no-build   # update metrics.json only
```
Requires Node 18+ (uses built-in `fetch`). No packages to install.

---

## Then re-publish the live artifacts

`build.js` updates the **HTML files** on disk. To refresh the **live artifacts** in the
sidebar, just ask Claude: **"refresh the dashboards from metrics.json"** — Claude runs the
build and re-publishes all three. You can also have Claude set up a **scheduled task** to
do this automatically (e.g. every morning, or weekly).

---

## Adding a brand-new metric or chart
1. Add the data under the right dataset in `metrics.json` (or via a source).
2. If it needs a new chart/tab, ask Claude to add it once — it will read from `DATA`
   like the others, so future refreshes flow through automatically.

## Future: fully live artifacts
If you connect a data **MCP connector** later, an artifact can call it directly at open
time (via `window.cowork.callMcpTool`) and self-refresh with the Reload button — no build
step. The `metrics.json` schema here is designed to map cleanly onto that path when you're
ready.
