'use client';

import React, { useEffect, useState } from 'react';
import { DiagnosticLog } from '../../utils/types';

interface LiveMapProps {
  logs: DiagnosticLog[];
}

export default function LiveMap({ logs }: LiveMapProps) {
  const [MapWidget, setMapWidget] = useState<React.ComponentType<{ logs: DiagnosticLog[] }> | null>(null);

  useEffect(() => {
    // Dynamically import the actual map implementation only in browser
    import('./LeafletMap').then((mod) => {
      setMapWidget(() => mod.default);
    });
  }, []);

  if (!MapWidget) {
    return (
      <div className="h-full w-full min-h-[400px] lg:min-h-[560px] bg-surface rounded-xl border border-map-border shadow-card flex items-center justify-center text-sm font-mono text-fg-faint animate-pulse">
        🛰️ Loading Core Geographic Layer Space...
      </div>
    );
  }

  return <MapWidget logs={logs} />;
}