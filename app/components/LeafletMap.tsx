'use client';

import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { useTheme } from 'next-themes';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { DiagnosticLog } from '../../utils/types';
import { riskDivIcon, highestRisk, riskMarkerVar, RiskLevel } from '../../utils/risk-colors';

// Cluster badge colored by the WORST risk it contains (not a flat green), so a
// cluster hiding a CRITICAL scan never looks benign. Each child marker carries
// its risk level on `options.risk` (attached via the Marker `add` handler below).
function makeClusterIcon(cluster: any): L.DivIcon {
  const levels: RiskLevel[] = cluster
    .getAllChildMarkers()
    .map((m: any) => m.options?.risk)
    .filter(Boolean);
  const worst = levels.length ? highestRisk(levels) : ('LOW' as RiskLevel);
  const color = riskMarkerVar(worst);
  const count = cluster.getChildCount();
  return L.divIcon({
    className: 'cottonace-cluster',
    html: `<div style="display:flex;align-items:center;justify-content:center;width:36px;height:36px;border-radius:9999px;background:${color};color:#0B1110;font-weight:700;font-size:13px;border:2px solid var(--surface);box-shadow:0 0 10px ${color}99;">${count}</div>`,
    iconSize: [36, 36],
  });
}

interface Props {
  logs: DiagnosticLog[];
}

export default function LeafletMap({ logs }: Props) {
  // resolvedTheme drives a full remount of the cluster layer (via key) on toggle
  // so pins + cluster badges re-read the theme's --risk-* CSS vars, and swaps
  // the CARTO basemap between dark/light so the map matches the surrounding UI.
  const { resolvedTheme } = useTheme();
  // LIGHT: CARTO Voyager — visible roads + labels (Positron/light_all was too
  // washed out). DARK: Dark Matter. TileLayer is keyed on theme below so it
  // swaps cleanly on toggle instead of leaving a dark map under a light UI.
  const tileUrl =
    resolvedTheme === 'light'
      ? 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';

  // GPS is null (not 0.0) when unavailable per MASTER-CONTRACTS.md §1.1.
  // Require both coords present, finite, and not the exact (0,0) legacy sentinel.
  const validLogs = logs.filter((log) => {
    const lat = Number(log?.latitude);
    const lon = Number(log?.longitude);
    return (
      log?.latitude != null &&
      log?.longitude != null &&
      Number.isFinite(lat) &&
      Number.isFinite(lon) &&
      !(lat === 0 && lon === 0)
    );
  });

  return (
    <div className="w-full rounded-xl overflow-hidden border border-map-border shadow-card h-[400px] lg:h-[560px]">
      <MapContainer
        center={[30.1575, 71.5249]} // Multan — open on the southern Punjab cotton belt
        zoom={8}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          key={resolvedTheme}
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url={tileUrl}
        />
        {/* TODO(boundaries): overlay Pakistan province/district GeoJSON as an
            L.geoJSON layer styled from CSS — stroke var(--map-boundary) weight 1.5,
            fill transparent; cotton-belt districts (Multan/Bahawalpur/…) use
            var(--map-boundary-active), slightly heavier. No boundaries file exists
            in the repo yet — awaiting one from product (do not fabricate). */}
        <MarkerClusterGroup
          key={resolvedTheme}
          iconCreateFunction={makeClusterIcon}
          showCoverageOnHover={false}
          spiderfyOnMaxZoom
          maxClusterRadius={45}
        >
          {validLogs.map((log) => {
            const level = log.risk_level as RiskLevel;
            return (
              <Marker
                key={log.id}
                position={[Number(log.latitude), Number(log.longitude)]}
                icon={riskDivIcon(level)}
                // Expose the risk level to the cluster's iconCreateFunction.
                eventHandlers={{
                  add: (e) => {
                    (e.target as any).options.risk = level;
                  },
                }}
              >
                <Popup>
                  <div className="text-xs font-sans p-1">
                    <h4 className="font-bold text-sm border-b pb-1 mb-1 text-emerald-800">
                      🌾 {log.district || log.agricultural_belt || 'Unknown District'}
                    </h4>
                    <p>
                      <strong>Risk:</strong>{' '}
                      <span style={{ color: riskMarkerVar(level) }}>
                        {log.risk_level || 'N/A'}
                      </span>
                    </p>
                    <p><strong>Whitefly count:</strong> {log.whitefly_count ?? 'N/A'}</p>
                    <p>
                      <strong>Confidence:</strong>{' '}
                      {log.confidence_score != null
                        ? `${Math.round(log.confidence_score * 100)}%`
                        : 'N/A'}
                    </p>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MarkerClusterGroup>
      </MapContainer>
    </div>
  );
}
