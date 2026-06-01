'use client';

import React, { useEffect, useState } from 'react';

interface LiveMapProps {
  logs: any[];
}

export default function LiveMap({ logs }: LiveMapProps) {
  const [MapWidget, setMapWidget] = useState<React.ComponentType<{ logs: any[] }> | null>(null);

  useEffect(() => {
    // Dynamically import the actual map implementation only in browser
    import('./LeafletMap').then((mod) => {
      setMapWidget(() => mod.default);
    });
  }, []);

  if (!MapWidget) {
    return (
      <div className="h-full w-full min-h-[400px] bg-[#151D1A] rounded-xl border border-[#2A3831] flex items-center justify-center text-sm font-mono text-gray-500 animate-pulse">
        🛰️ Loading Core Geographic Layer Space...
      </div>
    );
  }

  return <MapWidget logs={logs} />;
}