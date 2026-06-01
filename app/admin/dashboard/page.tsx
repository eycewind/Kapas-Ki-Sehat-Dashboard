'use client'; // Shift this component into client-side runtime execution

import React, { useEffect, useState } from 'react';
import { Users, Activity, AlertTriangle, Crosshair, Server, Database, Play, Terminal } from 'lucide-react';
import { supabase } from '../../../utils/supabase';
import dynamic from 'next/dynamic';

// Clean standard lazy-loading syntax targeting default export
const LiveMap = dynamic(
  () => import('../../components/LiveMap'),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-[400px] text-sm text-gray-500 font-mono animate-pulse bg-[#151D1A] rounded-xl border border-[#2A3831]">
        🛰️ Synchronizing Geographic Mesh Array...
      </div>
    )
  }
);

const telemetryStream = [
  '[SYS] 10:45:01 - Edge node cf5387a9 connected (Latency: 42ms)',
  '[ML] 10:45:03 - Inference batch #89201 processed successfully',
  '[SYS] 10:45:10 - Syncing regional weather parameters for Multan...',
  '[WARN] 10:45:14 - High GPU memory utilization detected on Node 3',
  '[SYS] 10:45:18 - Storage bucket replication complete (2.4GB)',
];

export default function AdminDashboard() {
  // 1. Establish State Hooks for Reactive Dashboard Parameters
  const [farmersCount, setFarmersCount] = useState(0);
  const [syncsCount, setSyncsCount] = useState(0);
  const [criticalCount, setCriticalCount] = useState(0);
  const [deployment, setDeployment] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mapLogs, setMapLogs] = useState<any[]>([]);

  // 2. Central Sync Function to Load Active Telemetry
  const synchronizeDashboardData = async () => {
    try {
      // Fetch total count of registered field profiles
      const { count: dbActiveFarmers } = await supabase
        .from('farmers_profiles')
        .select('*', { count: 'exact', head: true });

      // Fetch overall count of incoming inference sync logs
      const { count: dbSyncsToday } = await supabase
        .from('diagnostic_logs')
        .select('*', { count: 'exact', head: true });

      // Fetch count of districts actively flag-marked with critical risk levels
      const { count: dbCriticalOutbreaks } = await supabase
        .from('diagnostic_logs')
        .select('*', { count: 'exact', head: true })
        .eq('risk_level', 'CRITICAL');

      // Fetch active fleet model version details
      const { data: activeDeployment } = await supabase
        .from('model_deployments')
        .select('*')
        .eq('is_active_fleet_model', true)
        .single();

      // Fetch overall list of incoming inference sync logs from the tracking table
      const { data: dbMapRecords } = await supabase
        .from('diagnostic_logs') 
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      // Map the data objects cleanly to state wrappers
      setMapLogs(dbMapRecords || []);
      setFarmersCount(dbActiveFarmers || 0);
      setSyncsCount(dbSyncsToday || 0);
      setCriticalCount(dbCriticalOutbreaks || 0);
      setDeployment(activeDeployment);
    } catch (err) {
      console.error("[CRITICAL FRONTEND ERR] Synchronizer failure:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Initialize Subscription Channel Listeners
  useEffect(() => {
    synchronizeDashboardData();

    console.log("Base dashboard synchronization metrics loaded.");

    const realtimeChannel = supabase
      .channel('cottonace-mops-stream')
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'diagnostic_logs' 
        },
        (payload) => {
          console.log('🔄 Realtime system sync ping captured:', payload);
          synchronizeDashboardData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(realtimeChannel);
    };
  }, []);

  // Map Macro Metrics Arrays for UI Iteration
  const macroMetrics = [
    { label: 'Active Farmers', value: farmersCount.toLocaleString(), icon: Users, color: 'text-blue-400' },
    { label: 'Real-time Inference Sync', value: syncsCount.toLocaleString(), icon: Activity, color: 'text-[#6BE675]' },
    { label: 'Critical Outbreak Warnings', value: criticalCount, icon: AlertTriangle, color: 'text-red-400' },
    { label: 'Mean Engine Confidence', value: '89.4%', icon: Crosshair, color: 'text-[#F4B740]' },
  ];

  // Map Model Metrics
  const modelVersion = deployment?.version || 'Flee-v1.0.4-stb';
  const f1Score = deployment?.scores?.f1 || deployment?.f1_score || "0.88";
  const precisionScore = deployment?.scores?.precision || deployment?.precision || "0.89";
  const recallScore = deployment?.scores?.recall || deployment?.recall || "0.87";

  return (
    <div className="min-h-screen bg-[#0B1110] text-gray-300 p-6 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <header className="flex justify-between items-end border-b border-[#2A3831] pb-4">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">CottonAce Command Center</h1>
            <p className="text-sm text-gray-400 mt-1">Admin & MLOps Dashboard Workspace</p>
          </div>
          <div className="flex items-center space-x-2 text-sm bg-[#151D1A] px-4 py-2 rounded-md border border-[#2A3831]">
            <span className={`w-2 h-2 rounded-full ${isLoading ? 'bg-yellow-400 animate-bounce' : 'bg-[#6BE675] animate-pulse'}`}></span>
            <span className={`${isLoading ? 'text-yellow-400' : 'text-[#6BE675]'} font-medium`}>
              {isLoading ? 'Syncing...' : 'System Live (Realtime Mode)'}
            </span>
          </div>
        </header>

        {/* Top Row Metrics */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {macroMetrics.map((metric, idx) => {
            const Icon = metric.icon;
            return (
              <div key={idx} className="bg-[#151D1A] border border-[#2A3831] rounded-xl p-5 hover:border-gray-500 transition-colors duration-200">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{metric.label}</p>
                    <h3 className={`text-2xl font-bold mt-2 ${idx === 3 ? 'text-[#F4B740]' : 'text-white'}`}>{metric.value}</h3>
                  </div>
                  <div className={`p-2 bg-[#0B1110] rounded-lg border border-[#2A3831]`}>
                    <Icon className={`w-5 h-5 ${metric.color}`} />
                  </div>
                </div>
              </div>
            );
          })}
        </section>

        {/* Main Workspace Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Left Double-Column Panel */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Live Interactive Map Wrapper */}
            <LiveMap logs={mapLogs} />

            {/* Telemetry Streams Console */}
            <div className="bg-[#0B1110] border border-[#2A3831] rounded-xl p-4 shadow-inner relative overflow-hidden">
              <div className="flex items-center space-x-2 mb-3 border-b border-[#2A3831] pb-2">
                <Terminal className="w-4 h-4 text-gray-500" />
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">System Stability Telemetry Streams</span>
              </div>
              <div className="font-mono text-sm space-y-1.5 text-[#6BE675]">
                {telemetryStream.map((log, i) => (
                  <div key={i} className="opacity-90 hover:opacity-100 transition-opacity">
                    <span className="text-gray-500 mr-2">{'>'}</span>{log}
                  </div>
                ))}
                <div className="animate-pulse flex">
                  <span className="text-gray-500 mr-2">{'>'}</span>
                  <span className="w-2 h-4 bg-[#6BE675] inline-block mt-0.5"></span>
                </div>
              </div>
            </div>
            
          </div>

          {/* Right Column Panel: MLOps Active Pipeline */}
          <div className="space-y-6">
            <div className="bg-[#151D1A] border border-[#2A3831] rounded-xl p-6 h-full flex flex-col">
              <div className="flex items-center space-x-2 mb-6">
                <Server className="w-5 h-5 text-[#F4B740]" />
                <h2 className="text-lg font-semibold text-[#F4B740]">MLOps Active Pipeline Control</h2>
              </div>
              
              <div className="space-y-6 flex-1">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Deployed Architecture</p>
                  <div className="bg-[#0B1110] border border-[#2A3831] p-3 rounded-lg font-mono text-sm text-[#6BE675] flex items-center justify-between">
                    <span>{modelVersion}</span>
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-[#6BE675] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#6BE675]"></span>
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Baseline Evaluation Scores</p>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-[#0B1110] border border-[#2A3831] p-3 rounded-lg text-center">
                      <div className="text-xl font-bold text-white">{f1Score}</div>
                      <div className="text-[10px] text-gray-500 mt-1 uppercase">F1 Score</div>
                    </div>
                    <div className="bg-[#0B1110] border border-[#2A3831] p-3 rounded-lg text-center">
                      <div className="text-xl font-bold text-white">{precisionScore}</div>
                      <div className="text-[10px] text-gray-500 mt-1 uppercase">Precision</div>
                    </div>
                    <div className="bg-[#0B1110] border border-[#2A3831] p-3 rounded-lg text-center">
                      <div className="text-xl font-bold text-white">{recallScore}</div>
                      <div className="text-[10px] text-gray-500 mt-1 uppercase">Recall</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <button className="w-full relative group overflow-hidden rounded-lg bg-[#F4B740] text-[#0B1110] font-bold text-sm py-4 px-4 transition-all hover:bg-yellow-500 shadow-[0_0_15px_rgba(244,183,64,0.3)] hover:shadow-[0_0_25px_rgba(244,183,64,0.5)]">
                  <span className="relative z-10 flex items-center justify-center space-x-2">
                    <Play className="w-4 h-4" />
                    <span>Trigger Continuous Training Cycle</span>
                  </span>
                  <span className="block mt-1 text-[10px] opacity-80 font-medium relative z-10">
                    (Local Compute Workstation Host)
                  </span>
                  <div className="absolute inset-0 h-full w-full bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300 ease-out"></div>
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}