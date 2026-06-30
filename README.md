# Bangalore Open Data Mining

> **Source of truth: this GitHub repo** (https://github.com/Tinker31415/bangalore-open-data-mining). Make changes here via clone/commit/push; the local Claude Workspace copy is a snapshot.

An umbrella for civic open-data projects on Bengaluru (and comparison cities), turning public datasets into interactive dashboards that drive awareness and action on urban quality of life.

## Subprojects

### `Urban planning in India/`
Traffic, mobility, water, air and sanitation dashboards for **Bengaluru** (primary focus) and **Hyderabad**, built from public, attributable sources, plus a small **data pipeline** so new data threads through every dashboard from one place.

Deliverables (interactive, self-contained HTML):
- **Bengaluru Livability Dashboard — Traffic & Water** (traffic, road safety, air quality, water, sanitation)
- **Bengaluru Mobility Dashboard — Metro & Bus** (consulting-style deep-dive: scorecard, metro, bus, global benchmark, capex & affordability, roadmap)
- **Bengaluru Zone Traffic Drilldown** (interactive map of 8 BBMP zones by a congestion-weighted mobility-stress index)
- **Hyderabad Livability & Mobility Dashboard** (combined, companion to Bengaluru)

Data layer:
- `Urban planning in India/data/metrics.json` — single source of truth for every figure
- `Urban planning in India/data/sources.json` — registry of data sources (manual / CSV / API)
- `Urban planning in India/pipeline/` — Node scripts (`extract.js`, `build.js`, `refresh.js`) that thread data into the dashboards

See `Urban planning in India/PROJECT_CONTEXT.md` for full context, findings, sources, current state and how to resume.

## Quick start (data pipeline)
```bash
cd "Urban planning in India"
node pipeline/refresh.js     # fetch enabled sources -> merge -> recompute -> rebuild dashboards
```
Requires Node 18+. No packages to install. See `Urban planning in India/pipeline/README.md`.

## Data &amp; licensing
All figures are from public, attributable sources (OpenCity/Citizen Matters, CPCB, MoRTH, Bengaluru Traffic Police, CGWB, HMRL, TGSRTC, HMWSSB, TomTom, IQAir/Statista, etc.). Verify against the cited source before formal advocacy use. Editorial assessments (e.g., zone stress scores, report-card grades) are clearly labelled as such.
