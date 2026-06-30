# Urban Planning in India — Project Context

**Role:** Dashboard developer focused on urban development and quality of life in India, using open public datasets. **Primary focus: Bengaluru.** Goal: build interactive dashboards that drive public awareness and a credible case for action, helping civil society engage the government.

_Last updated: June 2026. Subproject of **Bangalore Open Data Mining**._

---

## ⚙ Working model — GitHub is the source of truth

**As of June 2026, all new changes live on GitHub:**
https://github.com/Tinker31415/bangalore-open-data-mining

- The **canonical copy is the GitHub repo**. Make changes by cloning, editing, committing and pushing — **not** by editing the local *Claude Workspace* copy (now treated as a possibly-stale snapshot).
- Typical flow:
  ```bash
  git clone https://github.com/Tinker31415/bangalore-open-data-mining.git
  cd "bangalore-open-data-mining/Urban planning in India"
  # edit files, then if data changed:
  node pipeline/refresh.js
  git add -A && git commit -m "describe change" && git push
  ```
- Live Cowork artifacts are published snapshots; re-publish them from the repo's HTML when their data changes.
- Do not resume by editing files under `Downloads/Claude Workspace` — pull from GitHub first.

---

## ▶ Resume here (current state)

**Artifacts (all live + on disk, self-contained HTML):**
1. `Bengaluru Livability Dashboard - Traffic & Water.html` — Traffic (TomTom, BTP road-deaths 2022–24, air quality, congestion cost ₹20,000 cr/yr), Water (sewage, LPCD, groundwater), Action. *Rebuilt clean June 2026.*
2. `Bengaluru Mobility Dashboard - Metro & Bus.html` — consulting-style: Scorecard, Metro, Bus (incl. BMTC ridership trend), Global benchmark, Capex & Affordability, Roadmap.
3. `Bengaluru Zone Traffic Drilldown.html` — interactive map of 8 BBMP zones, congestion-weighted stress score; click-through actions. *Rebuilt clean June 2026.*
4. `Hyderabad Livability & Mobility Dashboard.html` — combined companion city.

**Data pipeline:** `data/metrics.json` (single source of truth) ← `data/sources.json` (registry) via `pipeline/` (extract.js / build.js / refresh.js). Sources wired: air quality (Statista/IQAir + OpenAQ live template), BMTC ridership (OpenCity/CAG), groundwater (CGWB 2023), Bengaluru Traffic Police road deaths, congestion cost, Hyderabad metro/bus/water/air. Run `node pipeline/refresh.js` to thread updates through all dashboards.

**Known environment quirk:** during the build sessions the Cowork file-mount lagged on heavily-edited files, so some metrics.json updates were applied directly and verified rather than via `refresh.js`. On a normal local checkout this does not occur — `node pipeline/extract.js` / `build.js` / `refresh.js` all work cleanly.

**Open / next steps:** Hyderabad zone drilldown + deeper financing; Bengaluru vs Hyderabad cross-city view; live connectors (OpenAQ key, OpenCity CKAN, Namma Yatri open data, current peak-speed); scheduled auto-refresh.

---

## Deliverables in this folder

| File | Covers | Status |
|---|---|---|
| `Bengaluru Livability Dashboard - Traffic & Water.html` | Traffic & mobility + water & sanitation; Bengaluru vs Indian peers; "Case for Action" tab | Final |
| `Bengaluru Mobility Dashboard - Metro & Bus.html` | Deep-dive on Namma Metro + BMTC; Indian + global benchmarks; capex/affordability; phased roadmap. **Consulting-grade (McKinsey/BCG-style) visual design.** | Final (latest) |

Both are self-contained interactive HTML (Chart.js + Grid.js, inline). The Mobility Dashboard is also live as a Cowork artifact (id: `bengaluru-transit-deepdive`).

---

## Decisions made so far

- **Indicators prioritised:** traffic & mobility, water & sanitation (air quality deferred — strong CPCB/OpenAQ data available if revisited).
- **Geographic scope:** Bengaluru deep-dive + benchmarking against Indian peers and comparable global megacities.
- **Delivery format:** live interactive artifacts (vs static report).
- **Mobility deep-dive emphasis:** metro + bus performance, then capex/financing and the free-bus (Shakti) affordability politics.
- **Visual standard:** consulting-grade — serif headlines, restrained navy/cyan palette, "Exhibit" framing, single-accent charts.

---

## Headline findings (conclusions)

### Traffic & mobility
- Central Bengaluru: **34m 10s to travel 10 km** (~17.6 km/h) — India's 2nd-slowest (TomTom 2024).
- **772 road deaths (2022)**, incl. **247 pedestrians** (+50% YoY) — 2nd-highest among million-plus cities (MoRTH).
- **1.23 crore vehicles**, +7.22 lakh added in 2024–25.

### Water & sanitation
- Bengaluru supplies **100–125 LPCD** (below the 150 metro benchmark); Cauvery pumped ~90 km uphill.
- India treats only **~28%** of sewage; Bengaluru's ~1,348 MLD STP capacity is among the best big-city coverage.

### Public transport (the core deep-dive)
- **Bus = India's best system:** 7,000+ buses, ~44 lakh riders/day, ~50 buses/lakh (only major city meeting the 40–60 norm), 91% utilisation, lowest losses.
- **Metro:** 96 km, ~10 lakh riders/day (record 10.48 lakh, Aug 2025), efficient per-km but small for the city → **reach, not demand, is the limit.**
- **The biggest gap: 0 km of dedicated BRT.** Jakarta has 251 km (~1M riders/day); Bogotá 114 km (~2.3M/day). BRT is the highest-impact, lowest-cost, fastest-to-build move.
- **Capex:** Metro ~₹541 cr/km vs Suburban rail ~₹106 cr/km vs BRT ~₹13.5 cr/km. **1 km of metro = ~40 km of BRT.**
- **Free-bus politics (Shakti scheme):** free travel did **not** sink BMTC finances (net losses lowest since COVID; govt reimbursement share fell 40%→14%). The real issues are (a) a Jan 2025 fare hike on others and (b) chronic under-investment. The honest debate is **"who funds the subsidy, and is service investment protected?"** Recommended design: fund concessions from the state budget as a transparent line item, ring-fence a dedicated transport fund, and grow non-fare revenue (land value capture/TOD).

### Action roadmap (phased)
- **1 year:** more feeder buses, bus-priority lanes on 10 worst corridors, one-card 