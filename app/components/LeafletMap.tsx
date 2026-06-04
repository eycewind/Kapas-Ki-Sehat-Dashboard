import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { DiagnosticLog, riskColor } from '../../utils/types';

// Build a colored circular marker keyed by canonical risk level (§4).
// Using divIcon avoids the external unpkg PNG dependency entirely.
const iconCache = new Map<string, L.DivIcon>();
function riskMarker(risk: unknown): L.DivIcon {
  const color = riskColor(risk);
  const cached = iconCache.get(color);
  if (cached) return cached;
  const icon = L.divIcon({
    className: 'cottonace-risk-marker',
    html: `<span style="display:block;width:18px;height:18px;border-radius:9999px;background:${color};border:2px solid #0B1110;box-shadow:0 0 6px ${color};"></span>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
    popupAnchor: [0, -9],
  });
  iconCache.set(color, icon);
  return icon;
}

// CottonAce-themed cluster badge showing the number of co-located scans.
// Without this, scans from one device/location stack on the same pixel and
// look like a single marker. Clicking a cluster zooms / spiderfies so each
// individual scan becomes selectable.
function clusterIcon(cluster: { getChildCount: () => number }): L.DivIcon {
  const count = cluster.getChildCount();
  return L.divIcon({
    className: 'cottonace-cluster',
    html: `<div style="display:flex;align-items:center;justify-content:center;width:36px;height:36px;border-radius:9999px;background:rgba(107,230,117,0.85);color:#0B1110;font-weight:700;font-size:13px;border:2px solid #0B1110;box-shadow:0 0 10px rgba(107,230,117,0.55);">${count}</div>`,
    iconSize: [36, 36],
  });
}

interface Props {
  logs: DiagnosticLog[];
}

export default function LeafletMap({ logs }: Props) {
  // GPS is null (not 0.0) when unavailable per MASTER-CONTRACTS.md §1.1.
  // Require both coordinates to be present and finite.
  const validLogs = logs.filter((log) => {
    const lat = Number(log?.latitude);
    const lon = Number(log?.longitude);
    return (
      log?.latitude != null &&
      log?.longitude != null &&
      Number.isFinite(lat) &&
      Number.isFinite(lon) &&
      // Reject exact (0, 0) — app legacy bug sends 0.0/0.0 when GPS is
      // unavailable instead of null (MASTER §9, app-side fix pending).
      // Only exact double-zero is blocked; real coordinates where one axis
      // happens to be 0 (e.g. lat=0, lon=71.5) still pass.
      !(lat === 0 && lon === 0)
    );
  });

  return (
    <div className="w-full rounded-xl overflow-hidden border border-[#2A3831]" style={{ height: '400px' }}>
      <MapContainer
        center={[30.1575, 71.5249]}
        zoom={7}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        <MarkerClusterGroup
          iconCreateFunction={clusterIcon}
          showCoverageOnHover={false}
          spiderfyOnMaxZoom
          maxClusterRadius={45}
        >
          {validLogs.map((log) => (
            <Marker
              key={log.id}
              position={[Number(log.latitude), Number(log.longitude)]}
              icon={riskMarker(log.risk_level)}
            >
              <Popup>
                <div className="text-xs font-sans p-1">
                  <h4 className="font-bold text-sm border-b pb-1 mb-1 text-emerald-800">
                    🌾 {log.district || log.agricultural_belt || 'Unknown District'}
                  </h4>
                  <p>
                    <strong>Risk:</strong>{' '}
                    <span style={{ color: riskColor(log.risk_level) }}>
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
          ))}
        </MarkerClusterGroup>
      </MapContainer>
    </div>
  );
}
