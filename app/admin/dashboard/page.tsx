import React from 'react';
import { Users, Activity, AlertTriangle, Crosshair, Server, Database, Play, CheckCircle, Terminal } from 'lucide-react';

// --- Mock Data Framework ---
const macroMetrics = [
  { label: 'Active Farmers', value: '1,240', icon: Users, color: 'text-blue-400' },
  { label: 'Real-time Inference Sync', value: '42,890', icon: Activity, color: 'text-[#6BE675]' },
  { label: 'Critical Outbreak Warnings', value: '3', icon: AlertTriangle, color: 'text-red-400' },
  { label: 'Mean Engine Confidence', value: '89.4%', icon: Crosshair, color: 'text-[#F4B740]' },
];

const recentDriftLogs = [
  { id: '1', deviceId: 'cf5387a9', region: 'Multan Belt', confidence: '64%', status: 'Harvested to Storage Bucket', time: '10:42 AM' },
  { id: '2', deviceId: 'b82190f1', region: 'Rahim Yar Khan', confidence: '58%', status: 'Harvested to Storage Bucket', time: '10:39 AM' },
  { id: '3', deviceId: 'a19984c2', region: 'Bahawalpur', confidence: '61%', status: 'Harvested to Storage Bucket', time: '10:25 AM' },
  { id: '4', deviceId: 'e77215b4', region: 'Sukkur', confidence: '67%', status: 'Harvested to Storage Bucket', time: '09:58 AM' },
];

const modelRegistry = {
  version: 'CottonModel_v2.4_quantized',
  status: 'Active Deployment',
  scores: {
    f1: '0.912',
    precision: '0.895',
    recall: '0.924'
  }
};

const telemetryStream = [
  '[SYS] 10:45:01 - Edge node cf5387a9 connected (Latency: 42ms)',
  '[ML] 10:45:03 - Inference batch #89201 processed successfully',
  '[SYS] 10:45:10 - Syncing regional weather parameters for Multan...',
  '[WARN] 10:45:14 - High GPU memory utilization detected on Node 3',
  '[SYS] 10:45:18 - Storage bucket replication complete (2.4GB)',
];

export default function AdminDashboard() {
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
            <span className="w-2 h-2 rounded-full bg-[#6BE675] animate-pulse"></span>
            <span className="text-[#6BE675] font-medium">System Live</span>
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
            
            {/* AI Accuracy Drift & Data Harvesting */}
            <div className="bg-[#151D1A] border border-[#2A3831] rounded-xl overflow-hidden flex flex-col h-[400px]">
              <div className="p-5 border-b border-[#2A3831] flex justify-between items-center bg-[#0d1413]">
                <div className="flex items-center space-x-2">
                  <Database className="w-5 h-5 text-[#F4B740]" />
                  <h2 className="text-lg font-semibold text-[#F4B740]">AI Accuracy Drift & Data Harvesting</h2>
                </div>
              </div>
              <div className="overflow-auto flex-1 p-0">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-[#0B1110] sticky top-0 border-b border-[#2A3831] text-xs uppercase text-gray-500">
                    <tr>
                      <th className="px-5 py-3 font-medium">Device Signature</th>
                      <th className="px-5 py-3 font-medium">Region</th>
                      <th className="px-5 py-3 font-medium">Confidence</th>
                      <th className="px-5 py-3 font-medium">Status Pipeline</th>
                      <th className="px-5 py-3 font-medium text-right">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2A3831]">
                    {recentDriftLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-[#1a2320] transition-colors">
                        <td className="px-5 py-4 font-mono text-xs text-gray-400">{log.deviceId}</td>
                        <td className="px-5 py-4 text-gray-300">{log.region}</td>
                        <td className="px-5 py-4">
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-900/30 text-red-400 border border-red-800/50">
                            {log.confidence}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center text-xs space-x-1.5 text-gray-400">
                            <CheckCircle className="w-3.5 h-3.5 text-[#6BE675]" />
                            <span>{log.status}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-right text-gray-500 text-xs">{log.time}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

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
                    <span>{modelRegistry.version}</span>
                    <span className="flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-[#6BE675] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#6BE675]"></span>
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Baseline Evaluation Scores</p>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-[#0B1110] border border-[#2A3831] p-3 rounded-lg text-center">
                      <div className="text-xl font-bold text-white">{modelRegistry.scores.f1}</div>
                      <div className="text-[10px] text-gray-500 mt-1 uppercase">F1 Score</div>
                    </div>
                    <div className="bg-[#0B1110] border border-[#2A3831] p-3 rounded-lg text-center">
                      <div className="text-xl font-bold text-white">{modelRegistry.scores.precision}</div>
                      <div className="text-[10px] text-gray-500 mt-1 uppercase">Precision</div>
                    </div>
                    <div className="bg-[#0B1110] border border-[#2A3831] p-3 rounded-lg text-center">
                      <div className="text-xl font-bold text-white">{modelRegistry.scores.recall}</div>
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
                  {/* Hover effect background */}
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
