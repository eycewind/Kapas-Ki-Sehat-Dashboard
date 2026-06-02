# CONTRACTS.md — CottonAce Command Center (Dashboard)

Dashboard-only data contracts for the **Kapas-Ki-Sehat** Next.js admin
dashboard. This file is the dashboard team's working source of truth and is kept
**aligned to `MASTER-CONTRACTS.md`** (the cross-repo authority). Where the two
ever disagree, MASTER-CONTRACTS.md wins and this file gets corrected.

- **Last reconciled with MASTER-CONTRACTS.md:** 2026-06-02 (v2)
- **Scope:** the `KapasKiSehat_Dashboard` repo only. The dashboard is read-only
  against Supabase and (currently) calls no backend HTTP endpoints.

> Typed contracts live in [`utils/types.ts`](utils/types.ts) — import from there
> rather than re-typing row shapes inline.

---

## 1. System data flow (dashboard's slice)

```
Supabase (Postgres) ──direct reads + Realtime──> THIS dashboard
```

The dashboard performs counts + a recent-rows list, subscribes to realtime
changes on four tables (`diagnostic_logs`, `farmers_profiles`,
`model_deployments`, `system_health_telemetry`), and renders a map, telemetry
console, and MLOps panel. No write path.

---

## 2. API endpoints

### 2a. Endpoints the dashboard calls
**None via HTTP.** All access goes through `@supabase/supabase-js` (PostgREST +
Realtime). See §3.

- The MLOps **"Trigger Continuous Training Cycle"** button
  ([`page.tsx`](app/admin/dashboard/page.tsx)) has no handler — visual stub.
- **Gap (not yet built):** MASTER §3.3 lists `GET /api/v1/risk-metrics` as a
  dashboard→backend call. The dashboard does not yet call it.

### 2b. FastAPI webhook (in repo, NOT called by dashboard)
`POST /api/v1/supabase-webhook` ([`main.py`](main.py)) — receives Supabase
webhooks. Documented fully in MASTER §3.2. See §7 F-1 for the `schema` field bug.

---

## 3. Supabase tables & columns read by the dashboard

All queries: `synchronizeDashboardData()` in
[`page.tsx`](app/admin/dashboard/page.tsx). Column definitions are owned by
MASTER §1; this lists only what the dashboard touches.

### `farmers_profiles` (MASTER §1.2)
| Usage | Columns |
|---|---|
| `count exact, head` → **Active Farmers** | none (count only) |

### `diagnostic_logs` (MASTER §1.1)
| Query | Purpose |
|---|---|
| `count exact, head`, `.gte('created_at', now-24h)` | **Inference Scans** (rolling 24-hour window) |
| `count exact, head`, `.eq('risk_level','CRITICAL')` | **Critical Outbreak Warnings** |
| `select('*').order('created_at', desc).limit(50)` | rows → map + mean confidence |
| Realtime `postgres_changes` `*` | re-runs full sync on any change |

**Columns referenced** (typed as `DiagnosticLog` in `utils/types.ts`):

| Column | Read at | Type | Notes |
|---|---|---|---|
| `id` | LeafletMap | uuid | React key |
| `created_at` | page | timestamptz | sort key (desc) |
| `risk_level` | page + LeafletMap | `RiskLevel` | KPI filter + marker color + popup |
| `latitude` | LeafletMap | number\|null | null when GPS unavailable |
| `longitude` | LeafletMap | number\|null | null when GPS unavailable |
| `district` | LeafletMap | string | popup title (primary) |
| `agricultural_belt` | LeafletMap | string\|null | popup title fallback |
| `whitefly_count` | LeafletMap | number | popup |
| `confidence_score` | LeafletMap | number 0–1 | popup, rendered `×100%` |

> ❌ **No `status` column** (removed 2026-06-01 — it never existed; MASTER §1.1).
> ❌ No `image_url`; the image path column is `image_storage_path`.

### `system_health_telemetry` (MASTER §1.5)
`select('*').order('created_at', desc).limit(10)` → telemetry console.
Typed as `SystemHealthLog`. Realtime subscription triggers a telemetry-only
re-fetch (does not re-run the full dashboard sync).

| Column | Used at | Notes |
|---|---|---|
| `id` | telemetry console | bigint, React key |
| `log_level` | telemetry console | `INFO\|WARN\|ERROR`; drives color via `logLevelColor()` |
| `component` | telemetry console | subsystem name |
| `message` | telemetry console | log body |
| `created_at` | telemetry console | formatted HH:MM:SS via `formatLogTime()` |

### `model_deployments` (MASTER §1.3)
`select('*').eq('is_active_fleet_model', true).maybeSingle()` → MLOps card.
Typed as `ModelDeployment`.

| Column | Display | Fallback |
|---|---|---|
| `model_version` | Deployed Architecture | `'Flee-v1.0.4-stb'` |
| `f1_score` | F1 Score | `'0.88'` |
| `precision_score` | Precision | `'0.89'` |
| `recall_score` | Recall | `'0.87'` |
| `is_active_fleet_model` | filter predicate | — |

> ✅ **Flat columns only.** The previously-assumed nested `scores.{f1,precision,
> recall}` shape does not exist and was removed 2026-06-01 (MASTER Known Issue #9).

---

## 4. Risk level enum (canonical — MASTER §4)

Defined for the dashboard in `utils/types.ts` as `RiskLevel` + `RISK_COLORS`.

| Value | Whitefly band | Marker color |
|---|---|---|
| `LOW` | 0–4 | green `#6BE675` |
| `MEDIUM` | 5–8 | amber `#F4B740` |
| `HIGH` | 9–15 | orange `#F58B40` |
| `CRITICAL` | 16+ | red `#F45B5B` |

- Exact, uppercase, case-sensitive strings.
- Map markers are **color-coded by `risk_level`** via `riskColor()`; unknown /
  non-canonical values fall back to gray `#9CA3AF`.
- The "Critical Outbreak Warnings" KPI still filters `=== 'CRITICAL'` (correct
  for that single metric). All four values are otherwise handled.

---

## 5. Types, interfaces & data structures

| Definition | Location | Shape |
|---|---|---|
| `RiskLevel`, `RISK_LEVELS`, `RISK_COLORS`, `riskColor()`, `isRiskLevel()` | `utils/types.ts` | risk enum + helpers (MASTER §4) |
| `DiagnosticLog` | `utils/types.ts` | full `diagnostic_logs` row (MASTER §1.1) |
| `ModelDeployment` | `utils/types.ts` | full `model_deployments` row (MASTER §1.3) |
| `SystemHealthLog`, `LogLevel`, `LOG_LEVEL_COLORS`, `logLevelColor()`, `formatLogTime()` | `utils/types.ts` | telemetry types + helpers (MASTER §1.5) |
| `LiveMapProps` / `Props` | LiveMap / LeafletMap | `{ logs: DiagnosticLog[] }` |
| Dashboard state | `page.tsx` | counts: `number`, `deployment: ModelDeployment\|null`, `mapLogs: DiagnosticLog[]`, `telemetryLogs: SystemHealthLog[]`, `isLoading`, `errorMsg` |

> Supabase responses are cast to these types at the query boundary in `page.tsx`.
> The cast is unchecked (PostgREST returns `any`-ish) — see F-2.

---

## 6. Hardcoded values, env vars, external URLs

### Env vars (required; app throws at startup if missing) — `utils/supabase.ts`
| Var | Used for |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL (must match backend, MASTER §8) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key (browser-exposed → relies on RLS) |

### Hardcoded constants
| Value | Location | Concern |
|---|---|---|
| model fallbacks `Flee-v1.0.4-stb / 0.88 / 0.89 / 0.87` | page | shown when `model_deployments` query fails or returns no row |
| map center `[30.1575, 71.5249]` (Multan), zoom `7` | LeafletMap | fixed viewport |
| realtime channel name `'cottonace-mops-stream'` | page | — |
| `.limit(50)` diagnostic_logs | page | map + mean confidence uses 50 most recent rows |
| `.limit(10)` system_health_telemetry | page | telemetry console shows 10 most recent entries |

### External CDN
| URL | Location | Purpose |
|---|---|---|
| `https://{s}.basemaps.cartocdn.com/dark_all/...` | LeafletMap | CARTO dark tiles |

> ✅ The previous unpkg Leaflet marker-icon PNG dependency was removed — markers
> are now self-contained `divIcon`s.

---

## 7. ⚠ Flags: shapes assumed but not validated

- **F-1 — Webhook field mismatch — ✅ resolved in backend (MASTER v2 §9).**
  `main.py` previously declared `schema_name`; Supabase sends `schema`. Backend
  has since added a pydantic alias. No dashboard action needed.
- **F-2 — Supabase casts are unchecked.** Rows are cast to `DiagnosticLog` /
  `ModelDeployment` at the query boundary without runtime validation; a
  renamed/missing column surfaces as `undefined`/`N/A`, not an error. A schema
  validator (e.g. zod) would close this.
- **F-3 — `risk_level` not constrained at the DB.** MASTER §4 recommends a CHECK
  constraint; until then non-canonical values render as gray markers.

---

## 8. ⚠ Inconsistencies & missing error handling (dashboard-owned)

### Open
- **F-2 — Zod runtime validation.** Supabase rows are cast at the query boundary
  without runtime validation; a renamed column silently surfaces as `undefined`.
  Zod `safeParse` would catch contract regressions early. Deferred — needs a
  decision on strictness given MASTER §10 known app data issues (#2–#4: the app
  currently hardcodes `confidence_score`, `whitefly_count`, `inference_time_ms`).
  Strict schemas would warn on every row until the app ships real values.

### Fixed since first audit (2026-06-01)
**Contract alignment (round 1):**
- ✅ `model_deployments` now reads flat `model_version/f1_score/precision_score/
  recall_score` (was nested `scores.*` + `version`).
- ✅ Removed reads of the non-existent `status` column.
- ✅ Coordinates are null-safe and validate **both** lat & lng (was `latitude !== 0`
  only); aligns with "null, not 0.0" rule.
- ✅ Map markers color-coded across all four risk levels; popup shows
  `district / risk_level / whitefly_count / confidence`.
- ✅ Removed Math.random() React keys (now `log.id`).
- ✅ Dropped external unpkg marker-icon dependency.

**Metric accuracy + telemetry + realtime (round 3):**
- ✅ **E-3a** — "Mean Engine Confidence" computed from real `confidence_score`
  values across the most-recent fetched rows. Was static `89.4%`.
- ✅ **E-3b** — Telemetry console reads live from `system_health_telemetry`
  (last 10 rows, oldest→newest, color-coded by `log_level`). Was hardcoded fake
  strings. Table confirmed in MASTER v2 §1.5.
- ✅ **E-3c** — "Inference Scans" count uses a rolling 24-hour window (`.gte
  created_at, now-24h`). Label updated from "Real-time Inference Sync". Rolling
  window chosen over midnight-UTC cutoff to avoid a 5am PKT reset boundary.
- ✅ **E-4** — Realtime channel now subscribes to all four tables:
  `diagnostic_logs`, `farmers_profiles`, `model_deployments` → re-run full sync;
  `system_health_telemetry` → re-run telemetry-only query (lightweight).

**Error handling / robustness (round 2):**
- ✅ **E-1** — every Supabase query's `error` field is now inspected; the first
  error is logged and surfaced (was silently treated as empty/zero).
- ✅ **E-2** — `model_deployments` query uses `.maybeSingle()` (was `.single()`,
  which threw on 0 or >1 active rows and aborted the whole sync).
- ✅ **E-5** — header status indicator is now 3-state (error/syncing/live) and a
  red error banner shows the failure message instead of silently displaying zeros.
- ✅ Reads now run in parallel via `Promise.all` (was sequential `await`s).

---

## 9. Must stay in sync with MASTER-CONTRACTS.md

1. Tables: `farmers_profiles`, `diagnostic_logs`, `model_deployments`, `system_health_telemetry` (§1).
2. `diagnostic_logs` columns per MASTER §1.1 — **no `status`, no `image_url`**.
3. `risk_level` ∈ `LOW|MEDIUM|HIGH|CRITICAL` (§4); colors in `utils/types.ts`.
4. `model_deployments` flat score columns: `f1_score`, `precision_score`, `recall_score` (§1.3).
5. `confidence_score` on 0.0–1.0 scale (§6); rendered `×100%`.
6. Missing GPS is `null`, never `0.0` (§1.1).
7. `system_health_telemetry` `log_level` ∈ `INFO|WARN|ERROR` (§1.5).
8. `image_storage_path` is always optional — older rows have `null`; never assert non-null (MASTER §11 guardrail).
