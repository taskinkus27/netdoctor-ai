import React, { useState } from 'react';
import { Network, Server, ArrowDown, AlertOctagon, CheckCircle2, Shield, RefreshCw } from 'lucide-react';
import { TracerouteHop } from '../types/network';

interface HopTracerouteProps {
  hops: TracerouteHop[];
  onRefreshHops: (target: string) => void;
  isLoading: boolean;
}

export const HopTraceroute: React.FC<HopTracerouteProps> = ({
  hops,
  onRefreshHops,
  isLoading,
}) => {
  const [selectedTarget, setSelectedTarget] = useState('1.1.1.1');
  const [customTarget, setCustomTarget] = useState('');

  const handleTargetChange = (target: string) => {
    setSelectedTarget(target);
    onRefreshHops(target);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customTarget.trim()) {
      handleTargetChange(customTarget.trim());
    }
  };

  const bottleneck = hops.find(h => h.lossRate > 0 || h.latencyMs > 90);

  return (
    <div className="space-y-6">
      {/* Header and Target Selector */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-slate-800 bg-slate-900/60 p-5">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">
            Hop-by-Hop Traceroute & Düğüm Haritası
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Paketlerin modemden çıkıp ISP omurgası ve uluslararası internet değişim noktalarından geçerken uğradığı durakları test eder.
          </p>
        </div>

        {/* Target Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {['1.1.1.1', '8.8.8.8', '9.9.9.9'].map((ip) => (
            <button
              key={ip}
              onClick={() => handleTargetChange(ip)}
              className={`px-3 py-1.5 text-xs font-mono rounded-lg transition-colors ${
                selectedTarget === ip
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {ip}
            </button>
          ))}

          <form onSubmit={handleCustomSubmit} className="flex items-center gap-1.5">
            <input
              type="text"
              placeholder="Örn: 1.0.0.1"
              value={customTarget}
              onChange={(e) => setCustomTarget(e.target.value)}
              className="rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none w-28 font-mono"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="rounded-lg bg-slate-800 px-2.5 py-1 text-xs text-slate-200 hover:bg-slate-700 disabled:opacity-50"
            >
              {isLoading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : 'İzle'}
            </button>
          </form>
        </div>
      </div>

      {/* Visual Topology Diagram */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6">
        <div className="text-xs font-semibold text-slate-400 mb-6">
          AĞ YOLU VE GECİKME DERİNLİĞİ (TOPOLOJİ)
        </div>

        <div className="relative">
          <div className="flex flex-col gap-3">
            {hops.map((hop, index) => {
              const isBottleneck = hop.lossRate > 0 || hop.latencyMs > 90;
              const isFirst = index === 0;
              const isLast = index === hops.length - 1;

              return (
                <div key={hop.hop} className="flex flex-col">
                  <div
                    className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border p-4 transition-all ${
                      isBottleneck
                        ? 'border-rose-500/50 bg-rose-950/20 shadow-sm'
                        : 'border-slate-800/90 bg-slate-900/80 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-mono font-bold shrink-0 ${
                          isBottleneck
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : 'bg-slate-800 text-cyan-400 border border-slate-700'
                        }`}
                      >
                        H{hop.hop}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-white">
                            {hop.name}
                          </span>
                          <span className="text-xs font-mono text-slate-400">
                            {hop.ip}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {hop.detail}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 sm:justify-end shrink-0 text-xs">
                      <div className="flex flex-col sm:items-end">
                        <span className="text-slate-500">Gecikme</span>
                        <span className="font-mono text-sm font-bold text-white tabular-nums">
                          {hop.latencyMs} ms
                        </span>
                      </div>

                      <div className="flex flex-col sm:items-end">
                        <span className="text-slate-500">Paket Kaybı</span>
                        <span
                          className={`font-mono text-sm font-bold tabular-nums ${
                            hop.lossRate > 0 ? 'text-rose-400' : 'text-emerald-400'
                          }`}
                        >
                          %{hop.lossRate}
                        </span>
                      </div>

                      <div className="w-24 text-right">
                        {isBottleneck ? (
                          <span className="inline-flex items-center gap-1 text-rose-400 font-semibold">
                            <AlertOctagon className="h-3.5 w-3.5" />
                            Darboğaz
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Nominal
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {!isLast && (
                    <div className="my-1 flex items-center justify-center">
                      <div className="h-4 w-px bg-slate-800 flex items-center justify-center">
                        <ArrowDown className="h-3 w-3 text-slate-600" />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {bottleneck && (
          <div className="mt-6 rounded-lg border border-rose-500/30 bg-rose-950/30 p-4">
            <div className="flex items-start gap-3">
              <AlertOctagon className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-rose-300">
                  Darboğaz Hop {bottleneck.hop} Üzerinde Tespit Edildi
                </h4>
                <p className="mt-1 text-xs text-rose-200/90 leading-relaxed">
                  Sorun yerel modeminizde değil, {bottleneck.name} ({bottleneck.ip}) noktasında meydana geliyor. Bu düğüm doğrudan internet servis sağlayıcınızın kontrolündedir.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
