import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix marker icons once at module level
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface Props {
  logs: any[];
}

export default function LeafletMap({ logs }: Props) {
  const validLogs = logs.filter(
    (log) => log?.latitude && log?.longitude && parseFloat(log.latitude) !== 0
  );

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
        {validLogs.map((log) => (
          <Marker
            key={log.id || Math.random()}
            position={[parseFloat(log.latitude), parseFloat(log.longitude)]}
          >
            <Popup>
              <div className="text-xs font-sans p-1">
                <h4 className="font-bold text-sm border-b pb-1 mb-1 text-emerald-800">
                  🌾 {log.agricultural_belt || 'Core Hunting Zone'}
                </h4>
                <p><strong>Status:</strong> {log.status || 'Processed'}</p>
                <p><strong>Confidence:</strong> {log.confidence_score ? `${Math.round(log.confidence_score * 100)}%` : 'N/A'}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}