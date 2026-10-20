import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX, AlertTriangle, ShieldCheck, Activity, RefreshCw } from 'lucide-react';
import { fetchServerPing, recordOutageLog } from '../services/networkService';

interface PingDataPoint {
  time: string;
  latency: number;
  loss: number;
  target: string;
}

export const ContinuousMonitor: React.FC = () => {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [target, setTarget] = useState('1.1.1.1');
  const [intervalSec, setIntervalSec] = useState(3);
  const [dataPoints, setDataPoints] = useState<PingDataPoint[]>([]);
  const [currentLossRate, setCurrentLossRate] = useState(0);
  const [consecutiveFailures, setConsecutiveFailures] = useState(0);

  const audioCtxRef = useRef<AudioContext | null>(null);

  // Play synthetic alert sound using Web Audio API on outage/packet loss
  const playAlertBeep = () => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch {
      // AudioContext policy
    }
  };

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;

    if (isMonitoring) {
      const probe = async () => {
        try {
          const res = await fetchServerPing(target, 2);
          const nowStr = new Date().toLocaleTimeString('tr-TR');
          const isFailed = res.lossPercentage > 0;

          if (isFailed) {
            setConsecutiveFailures(prev => {
              const updated = prev + 1;
              if (updated >= 2) {
                playAlertBeep();
                recordOutageLog({
                  id: `monitor_${Date.now()}`,
                  timestamp: new Date().toISOString(),
                  durationSeconds: 15,
                  affectedLayer: 'ISP',
                  ispLossPct: res.lossPercentage,
                  gatewayLossPct: 0,
                  jitterMs: res.jitter,
                  primaryTarget: target,
                  notes: `Sürekli İzleyici: ${target} üzerinde %${res.lossPercentage} paket kaybı kaydedildi.`,
                });
              }
              return updated;
            });
          } else {
            setConsecutiveFailures(0);
          }

          setCurrentLossRate(res.lossPercentage);
          setDataPoints(prev => {
            const next = [...prev, { time: nowStr, latency: res.avgLatency, loss: res.lossPercentage, target }];
            return next.slice(-25); // keep last 25 readings
          });
        } catch {
          // ignore
        }
      };

      probe();
      timer = setInterval(probe, intervalSec * 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isMonitoring, target, intervalSec, soundEnabled]);

  const maxLatency = Math.max(80, ...dataPoints.map(d => d.latency));

  return (
    <div className="space-y-6">
      {/* Control Strip */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-slate-800 bg-slate-900/60 p-5">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <Activity className="h-5 w-5 text-cyan-400" />
            Sürekli Canlı Ağ & Hat Monitörü
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Bağlantınızı arka planda her {intervalSec} saniyede bir test eder, paket kayıplarını gerçek zamanlı tespit edip sesli uyarır.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Target selector */}
          <select
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-white focus:border-cyan-500 focus:outline-none font-mono"
          >
            <option value="1.1.1.1">Cloudflare (1.1.1.1)</option>
            <option value="8.8.8.8">Google (8.8.8.8)</option>
            <option value="192.168.1.1">Yerel Modem (192.168.1.1)</option>
          </select>

          {/* Sound Alert Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
              soundEnabled
                ? 'border-cyan-500/50 bg-cyan-950/30 text-cyan-300'
                : 'border-slate-700 bg-slate-800 text-slate-400'
            }`}
            title="Kopma anında sesli sinyal çal"
          >
            {soundEnabled ? <Volume2 className="h-3.5 w-3.5 text-cyan-400" /> : <VolumeX className="h-3.5 w-3.5" />}
            <span>Sesli Alarm: {soundEnabled ? 'Açık' : 'Kapalı'}</span>
          </button>

          {/* Start / Pause */}
          <button
            onClick={() => setIsMonitoring(!isMonitoring)}
            className={`flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-xs font-semibold transition-all shadow-sm ${
              isMonitoring
                ? 'bg-rose-500 text-white hover:bg-rose-400'
                : 'bg-cyan-500 text-slate-950 hover:bg-cyan-400'
            }`}
          >
            {isMonitoring ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            <span>{isMonitoring ? 'İzlemeyi Duraklat' : 'Canlı İzlemeyi Başlat'}</span>
          </button>
        </div>
      </div>

      {/* Real-time Status Card */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <span className="text-xs text-slate-400 font-medium">İzleme Durumu</span>
          <div className="mt-2 flex items-center gap-2">
            <span className={`h-2.5 w-2.5 rounded-full ${isMonitoring ? 'bg-emerald-400' : 'bg-slate-600'}`} />
            <span className="text-lg font-bold text-white">
              {isMonitoring ? 'Canlı Akış Aktif' : 'Durduruldu'}
            </span>
          </div>
          <div className="mt-1 text-xs text-slate-500 font-mono">
            Hedef: {target}
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <span className="text-xs text-slate-400 font-medium">Son Ölçülen Gecikme</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-white font-mono tabular-nums">
              {dataPoints.length > 0 ? dataPoints[dataPoints.length - 1].latency : 0}
            </span>
            <span className="text-xs text-slate-400 font-mono">ms (RTT)</span>
          </div>
          <div className="mt-1 text-xs text-slate-500 font-mono tabular-nums">
            Örnekleme: Son {dataPoints.length} test
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <span className="text-xs text-slate-400 font-medium">Anlık Paket Kaybı</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className={`text-2xl font-bold font-mono tabular-nums ${currentLossRate > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
              %{currentLossRate}
            </span>
            <span className="text-xs text-slate-400 font-mono">kayıp</span>
          </div>
          <div className="mt-1 text-xs text-slate-500">
            {consecutiveFailures > 0 ? `${consecutiveFailures} ardışık paket kaybı!` : 'Hatta kopma yok'}
          </div>
        </div>
      </div>

      {/* SVG Latency Sparkline Chart */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-4">
          <span className="font-semibold text-slate-300">GERÇEK ZAMANLI GECİKME GRAFİĞİ (MS)</span>
          <span className="font-mono tabular-nums text-cyan-400">Tepe Değer: {maxLatency} ms</span>
        </div>

        {dataPoints.length === 0 ? (
          <div className="flex h-44 items-center justify-center text-xs text-slate-500">
            İzleme başlatıldığında canlı gecikme dalgalanması burada çizilecektir.
          </div>
        ) : (
          <div className="relative h-44 w-full">
            <svg className="h-full w-full overflow-visible" viewBox="0 0 500 120" preserveAspectRatio="none">
              {/* Grid lines */}
              <line x1="0" y1="20" x2="500" y2="20" stroke="#1e293b" strokeDasharray="3 3" />
              <line x1="0" y1="60" x2="500" y2="60" stroke="#1e293b" strokeDasharray="3 3" />
              <line x1="0" y1="100" x2="500" y2="100" stroke="#1e293b" strokeDasharray="3 3" />

              {/* Area path */}
              <path
                d={dataPoints.reduce((acc, point, idx) => {
                  const x = (idx / Math.max(1, dataPoints.length - 1)) * 500;
                  const y = 110 - (point.latency / maxLatency) * 90;
                  return `${acc} ${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
                }, '') + ` L 500 120 L 0 120 Z`}
                fill="url(#latencyGrad)"
                opacity="0.25"
              />

              {/* Line path */}
              <path
                d={dataPoints.reduce((acc, point, idx) => {
                  const x = (idx / Math.max(1, dataPoints.length - 1)) * 500;
                  const y = 110 - (point.latency / maxLatency) * 90;
                  return `${acc} ${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
                }, '')}
                fill="none"
                stroke="#06b6d4"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Data points */}
              {dataPoints.map((point, idx) => {
                const x = (idx / Math.max(1, dataPoints.length - 1)) * 500;
                const y = 110 - (point.latency / maxLatency) * 90;
                const isLoss = point.loss > 0;
                return (
                  <circle
                    key={idx}
                    cx={x}
                    cy={y}
                    r={isLoss ? '4.5' : '2.5'}
                    fill={isLoss ? '#f43f5e' : '#22d3ee'}
                  />
                );
              })}

              <defs>
                <linearGradient id="latencyGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        )}

        <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 font-mono">
          <span>İlk Okuma: {dataPoints[0]?.time || '--:--:--'}</span>
          <span>Son Okuma: {dataPoints[dataPoints.length - 1]?.time || '--:--:--'}</span>
        </div>
      </div>
    </div>
  );
};
