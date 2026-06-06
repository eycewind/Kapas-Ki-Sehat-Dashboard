// Risk colors for the dashboard — Leaflet markers, chart accents, KPI chips.
//
// These hexes are a CROSS-SYSTEM CONTRACT: they must equal the Android app's
// RiskColors *Marker values (see app Color.kt). Keep them in lockstep — a HIGH
// pin must be the same color in the farmer's app and on this map.
//
// Prefer reading the CSS var (--risk-*-marker) so colors follow the theme
// automatically. Use the literal map only where you can't reach CSS (e.g.
// generating a marker color string in pure JS before mount).

export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export const RISK_MARKERS: Record<"light" | "dark", Record<RiskLevel, string>> = {
  light: { LOW: "#2E7D32", MEDIUM: "#E89200", HIGH: "#EF6C00", CRITICAL: "#C62828" },
  dark:  { LOW: "#6BE675", MEDIUM: "#FFCC66", HIGH: "#FF9E4D", CRITICAL: "#EF5350" },
};

/** Read the live theme's marker color from CSS — follows light/dark automatically. */
export function riskMarkerVar(level: RiskLevel): string {
  if (typeof window === "undefined") return RISK_MARKERS.dark[level]; // SSR fallback
  const v = getComputedStyle(document.documentElement)
    .getPropertyValue(`--risk-${level.toLowerCase()}-marker`)
    .trim();
  return v || RISK_MARKERS.dark[level];
}

/** Static lookup when you already know the theme. */
export function riskMarker(level: RiskLevel, theme: "light" | "dark"): string {
  return RISK_MARKERS[theme][level];
}

/**
 * Build a Leaflet divIcon for a risk pin. `level` drives the color via CSS var,
 * so it re-themes on toggle. `count` is optional (cluster size / scan count).
 *
 *   import L from "leaflet";
 *   L.marker([lat, lng], { icon: riskDivIcon("HIGH", 9) }).addTo(map);
 */
export function riskDivIcon(level: RiskLevel, count?: number): L.DivIcon {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const L = require("leaflet");
  const color = riskMarkerVar(level);
  const label = count != null ? String(count) : "";
  return L.divIcon({
    className: "risk-pin",
    html: `<div style="
        background:${color};
        width:28px;height:28px;border-radius:50%;
        display:flex;align-items:center;justify-content:center;
        color:#0B1110;font-weight:700;font-size:13px;
        box-shadow:0 0 0 2px var(--surface), 0 1px 4px rgba(0,0,0,.4);
      ">${label}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

/**
 * For a CLUSTER of mixed risks, color by the highest severity present rather
 * than a flat green — so a cluster hiding a CRITICAL doesn't look benign.
 */
export function highestRisk(levels: RiskLevel[]): RiskLevel {
  const order: RiskLevel[] = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
  return levels.reduce(
    (worst, l) => (order.indexOf(l) > order.indexOf(worst) ? l : worst),
    "LOW" as RiskLevel,
  );
}