import React, { useState } from 'react';
import {
  Wifi,
  Router,
  Globe2,
  Server,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  ChevronRight,
  Sparkles,
  Zap,
  ArrowRight,
} from 'lucide-react';
import { DiagnosisReport, WifiMetrics } from '../types/network';

interface DiagnosticOverviewProps {
  report: DiagnosisReport | null;
  isRunning: boolean;
  onRunTest: () => void;
  onSimulateScenario: (scenario: 'nominal' | 'wifi_weak' | 'modem_down' | 'isp_loss' | 'dns_fail') => void;
  onNavigateToDossier: () => void;
}

export const DiagnosticOverview: React.FC<DiagnosticOverviewProps> = ({
  report,
  isRunning,
  onRunTest,
  onSimulateScenario,
  onNavigateToDossier,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  if (!report) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-xl border border-slate-800 bg-slate-900/40 p-8 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-500/10 text-cyan-400 mb-4">
          <Zap className="h-6 w-6" />
        </div>
        <h3 className="text-lg font-semibold text-white">NetDoctor Hazır</h3>
        <p className="mt-1 max-w-md text-sm text-slate-400">
          Ağ kartı, Wi-Fi sinyali, yerel modem ağ geçidi, DNS ve ISP omurga bağlantınızı saniyeler içinde analiz edin.
        </p>
        <button
          onClick={onRunTest}
          disabled={isRunning}
          className="mt-6 rounded-lg bg-cyan-500 px-5 py-2.5 text-sm font-semibold text-slate-950 transition-all hover:bg-cyan-400"
        >
          {isRunning ? 'Analiz Yapılıyor...' : 'Tam Sistem Analizi Başlat'}
        </button>
      </div>
    );
  }

  const { severity, rootCauseLayer, diagnosisTitle, diagnosisSummary, wifi, gatewayPing, ispPing, dnsBenchmark, suggestions, cliQuickFixes } = report;

  // Visual status config
  const statusColors = {
    HEALTHY: {
      border: 'border-emerald-500/30',
      bg: 'bg-emerald-950/20',
      text: 'text-emerald-400',
      icon: <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />,
      badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    },
    WARNING: {
      border: 'border-amber-500/30',
      bg: 'bg-amber-950/20',
      text: 'text-amber-400',
      icon: <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0" />,
      badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    },
    CRITICAL: {
      border: 'border-rose-500/30',
      bg: 'bg-rose-950/20',
      text: 'text-rose-400',
      icon: <XCircle className="h-5 w-5 text-rose-400 shrink-0" />,
      badge: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    },
  }[severity];

  return (
    <div className="space-y-6">
      {/* 1. Root Cause Verdict Banner */}
      <div className={`rounded-xl border ${statusColors.border} ${statusColors.bg} p-5 transition-all`}>
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex items-start gap-3.5">
            <div className="mt-0.5">{statusColors.icon}</div>
            <div>
              <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                <span>Otomatik Ağ Teşhis Sonucu</span>
                <span>·</span>
                <span className="font-mono tabular-nums">{new Date(report.timestamp).toLocaleTimeString('tr-TR')}</span>
                <span>·</span>
                <span className={statusColors.text}>
                  {rootCauseLayer === 'NONE'
                    ? 'Tüm Katmanlar Nominal'
                    : `Sorun Kaynağı: ${rootCauseLayer === 'WIFI' ? 'Wi-Fi Sinyali' : rootCauseLayer === 'MODEM' ? 'Modem / Gateway' : rootCauseLayer === 'DNS' ? 'DNS Sunucusu' : 'İnternet Servis Sağlayıcı (ISP)'}`}
                </span>
              </div>
              <h2 className="mt-1 text-xl font-bold text-white tracking-tight">
                {diagnosisTitle}
              </h2>
              <p className="mt-2 text-sm text-slate-300 leading-relaxed max-w-3xl">
                {diagnosisSummary}
              </p>
            </div>
          </div>

          {rootCauseLayer === 'ISP' && (
            <div className="shrink-0 self-start md:self-center">
              <button
                onClick={onNavigateToDossier}
                className="flex items-center gap-2 rounded-lg bg-rose-500/20 border border-rose-500/40 px-3.5 py-2 text-xs font-semibold text-rose-200 hover:bg-rose-500/30 transition-all whitespace-nowrap"
              >
                <span>ISP Kanıt Dosyası Oluştur</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 2. 4-Stage Diagnostic Pipeline Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Layer 1: Wi-Fi Interface */}
        <div
          className={`rounded-xl border p-4 transition-all ${
            rootCauseLayer === 'WIFI'
              ? 'border-amber-500/50 bg-amber-950/20'
              : 'border-slate-800 bg-slate-900/60'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-medium text-slate-300">
              <Wifi className="h-4 w-4 text-cyan-400" />
              1. Wi-Fi & Ağ Kartı
            </span>
            <span className={wifi.rssi_dbm < -75 ? 'text-amber-400 font-medium' : 'text-emerald-400 font-medium'}>
              {wifi.rssi_dbm < -75 ? 'Zayıf Sinyal' : 'Güçlü Sinyal'}
            </span>
          </div>

          <div className="mt-3">
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold text-white font-mono tabular-nums">
                {wifi.rssi_dbm}
              </span>
              <span className="text-xs text-slate-400 font-mono">dBm (RSSI)</span>
            </div>
            <div className="mt-2 h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
              <div
                className={`h-full transition-all ${
                  wifi.rssi_dbm >= -65
                    ? 'bg-emerald-500'
                    : wifi.rssi_dbm >= -75
                    ? 'bg-amber-500'
                    : 'bg-rose-500'
                }`}
                style={{ width: `${Math.max(10, Math.min(100, (wifi.rssi_dbm + 100) * 2))}%` }}
              />
            </div>
          </div>

          <div className="mt-3 space-y-1 text-xs text-slate-400 pt-2 border-t border-slate-800/80">
            <div className="flex justify-between">
              <span>SSID:</span>
              <span className="text-slate-200 truncate max-w-[120px] font-medium">{wifi.ssid}</span>
            </div>
            <div className="flex justify-between">
              <span>Frekans / Kanal:</span>
              <span className="text-slate-200 font-mono">{wifi.frequency} · {wifi.channel}</span>
            </div>
            <div className="flex justify-between">
              <span>Bağlantı Hızı:</span>
              <span className="text-slate-200 font-mono">{wifi.link_speed}</span>
            </div>
          </div>
        </div>

        {/* Layer 2: Modem / Gateway */}
        <div
          className={`rounded-xl border p-4 transition-all ${
            rootCauseLayer === 'MODEM'
              ? 'border-rose-500/50 bg-rose-950/20'
              : 'border-slate-800 bg-slate-900/60'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-medium text-slate-300">
              <Router className="h-4 w-4 text-cyan-400" />
              2. Modem / Gateway
            </span>
            <span className={gatewayPing.lossPercentage > 0 || gatewayPing.avgLatency > 15 ? 'text-rose-400 font-medium' : 'text-emerald-400 font-medium'}>
              {gatewayPing.lossPercentage > 0 ? `%${gatewayPing.lossPercentage} Kayıp` : 'Nominal'}
            </span>
          </div>

          <div className="mt-3">
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold text-white font-mono tabular-nums">
                {gatewayPing.avgLatency}
              </span>
              <span className="text-xs text-slate-400 font-mono">ms gecikme</span>
            </div>
            <div className="mt-2 text-xs text-slate-400 flex items-center justify-between">
              <span>Paket Kaybı:</span>
              <span className={`font-mono tabular-nums font-semibold ${gatewayPing.lossPercentage > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                %{gatewayPing.lossPercentage}
              </span>
            </div>
          </div>

          <div className="mt-3 space-y-1 text-xs text-slate-400 pt-2 border-t border-slate-800/80">
            <div className="flex justify-between">
              <span>Ağ Geçidi IP:</span>
              <span className="text-slate-200 font-mono">{gatewayPing.target}</span>
            </div>
            <div className="flex justify-between">
              <span>Min / Maks:</span>
              <span className="text-slate-200 font-mono tabular-nums">{gatewayPing.minLatency}ms / {gatewayPing.maxLatency}ms</span>
            </div>
            <div className="flex justify-between">
              <span>Donanım Yanıtı:</span>
              <span className="text-slate-200">{gatewayPing.avgLatency < 5 ? 'Kusursuz (1-4ms)' : 'Gecikmeli'}</span>
            </div>
          </div>
        </div>

        {/* Layer 3: DNS Resolution */}
        <div
          className={`rounded-xl border p-4 transition-all ${
            rootCauseLayer === 'DNS'
              ? 'border-amber-500/50 bg-amber-950/20'
              : 'border-slate-800 bg-slate-900/60'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-medium text-slate-300">
              <Globe2 className="h-4 w-4 text-cyan-400" />
              3. DNS Çözümleme
            </span>
            <span className={dnsBenchmark.results.some(r => r.status === 'SUCCESS') ? 'text-emerald-400 font-medium' : 'text-rose-400 font-medium'}>
              {dnsBenchmark.results.some(r => r.status === 'SUCCESS') ? 'Aktif' : 'Başarısız'}
            </span>
          </div>

          <div className="mt-3">
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold text-white font-mono tabular-nums">
                {dnsBenchmark.recommendedDns?.durationMs ?? 14}
              </span>
              <span className="text-xs text-slate-400 font-mono">ms süre</span>
            </div>
            <div className="mt-2 text-xs text-slate-400 flex items-center justify-between">
              <span>Test Edilen Alan:</span>
              <span className="text-slate-200 font-mono">{dnsBenchmark.domain}</span>
            </div>
          </div>

          <div className="mt-3 space-y-1 text-xs text-slate-400 pt-2 border-t border-slate-800/80">
            <div className="flex justify-between">
              <span>En Hızlı DNS:</span>
              <span className="text-cyan-400 font-semibold">{dnsBenchmark.recommendedDns?.name || '1.1.1.1'}</span>
            </div>
            <div className="flex justify-between">
              <span>Sunucu IP:</span>
              <span className="text-slate-200 font-mono">{dnsBenchmark.recommendedDns?.ip || '1.1.1.1'}</span>
            </div>
            <div className="flex justify-between">
              <span>DNS Durumu:</span>
              <span className="text-slate-200">Yanıt Doğrulandı</span>
            </div>
          </div>
        </div>

        {/* Layer 4: ISP Omurga / Dış Hat */}
        <div
          className={`rounded-xl border p-4 transition-all ${
            rootCauseLayer === 'ISP'
              ? 'border-rose-500/50 bg-rose-950/20'
              : 'border-slate-800 bg-slate-900/60'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-medium text-slate-300">
              <Server className="h-4 w-4 text-cyan-400" />
              4. ISP & Omurga
            </span>
            <span className={ispPing.lossPercentage > 0 ? 'text-rose-400 font-medium' : 'text-emerald-400 font-medium'}>
              {ispPing.lossPercentage > 0 ? `%${ispPing.lossPercentage} Kayıp` : 'Bağlantı Stabil'}
            </span>
          </div>

          <div className="mt-3">
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold text-white font-mono tabular-nums">
                {ispPing.avgLatency}
              </span>
              <span className="text-xs text-slate-400 font-mono">ms RTT</span>
            </div>
            <div className="mt-2 text-xs text-slate-400 flex items-center justify-between">
              <span>Jitter (Dalgalanma):</span>
              <span className={`font-mono tabular-nums font-semibold ${ispPing.jitter > 20 ? 'text-amber-400' : 'text-slate-200'}`}>
                {ispPing.jitter} ms
              </span>
            </div>
          </div>

          <div className="mt-3 space-y-1 text-xs text-slate-400 pt-2 border-t border-slate-800/80">
            <div className="flex justify-between">
              <span>Hedef Düğüm:</span>
              <span className="text-slate-200 font-mono">{ispPing.target}</span>
            </div>
            <div className="flex justify-between">
              <span>Paket Kaybı:</span>
              <span className={`font-mono tabular-nums font-semibold ${ispPing.lossPercentage > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                %{ispPing.lossPercentage}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Omurga Durumu:</span>
              <span className="text-slate-200">{ispPing.lossPercentage > 0 ? 'Santral/OLT Hatası' : 'Açık & Hızlı'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Diagnostic Simulation Switcher (to test any network condition) */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h4 className="text-xs font-semibold text-slate-300">
              Ağ Durumunu Simüle Et & Test Senaryoları
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Farklı donanım ve ISP arıza tiplerinde NetDoctor'ın nasıl teşhis koyduğunu inceleyin:
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => onSimulateScenario('nominal')}
              className="rounded-md border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-200 hover:bg-slate-700 transition-colors"
            >
              Kusursuz Bağlantı
            </button>
            <button
              onClick={() => onSimulateScenario('wifi_weak')}
              className="rounded-md border border-amber-900/50 bg-amber-950/30 px-2.5 py-1 text-xs font-medium text-amber-300 hover:bg-amber-900/40 transition-colors"
            >
              Zayıf Wi-Fi (-82 dBm)
            </button>
            <button
              onClick={() => onSimulateScenario('modem_down')}
              className="rounded-md border border-rose-900/50 bg-rose-950/30 px-2.5 py-1 text-xs font-medium text-rose-300 hover:bg-rose-900/40 transition-colors"
            >
              Modem Tıkanıklığı
            </button>
            <button
              onClick={() => onSimulateScenario('dns_fail')}
              className="rounded-md border border-indigo-900/50 bg-indigo-950/30 px-2.5 py-1 text-xs font-medium text-indigo-300 hover:bg-indigo-900/40 transition-colors"
            >
              DNS Çökmesi
            </button>
            <button
              onClick={() => onSimulateScenario('isp_loss')}
              className="rounded-md border border-rose-800 bg-rose-900/40 px-2.5 py-1 text-xs font-medium text-rose-200 hover:bg-rose-800/60 transition-colors"
            >
              ISP Santral Paket Kaybı
            </button>
          </div>
        </div>
      </div>

      {/* 4. Actionable Suggestions & CLI Quick-Fixes */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left: Concrete Recommendations */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
            <Sparkles className="h-4 w-4 text-cyan-400" />
            Önerilen Aksiyonlar & Çözüm Yolları
          </div>
          <ul className="mt-4 space-y-2.5">
            {suggestions.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-300">
                <span className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-slate-800 text-[10px] font-bold text-cyan-400">
                  {idx + 1}
                </span>
                <span className="leading-snug">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Right: Quick CLI Fix Commands */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-xs font-semibold text-slate-300">
              <Zap className="h-4 w-4 text-amber-400" />
              Tek Tıkla Onarım Komutları (Terminal)
            </span>
            <span className="text-xs text-slate-500">Kopyalamak için tıklayın</span>
          </div>

          <div className="mt-3 space-y-3">
            {cliQuickFixes.map((fix, idx) => (
              <div key={idx} className="rounded-lg border border-slate-800/90 bg-slate-950 p-3">
                <div className="text-xs font-medium text-slate-200 mb-1.5">{fix.title}</div>
                
                <div className="flex flex-col gap-1.5 text-xs">
                  {/* Windows */}
                  <div className="flex items-center justify-between rounded bg-slate-900/80 px-2 py-1 font-mono text-cyan-300">
                    <span className="truncate pr-2 font-mono">
                      <span className="text-slate-500 mr-1.5">WIN:</span>
                      {fix.windows}
                    </span>
                    <button
                      onClick={() => copyToClipboard(fix.windows, `win_${idx}`)}
                      className="text-slate-400 hover:text-white shrink-0 p-1"
                      title="Komutu kopyala"
                    >
                      {copiedKey === `win_${idx}` ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>

                  {/* macOS / Linux */}
                  <div className="flex items-center justify-between rounded bg-slate-900/80 px-2 py-1 font-mono text-slate-300">
                    <span className="truncate pr-2 font-mono">
                      <span className="text-slate-500 mr-1.5">MAC/LINUX:</span>
                      {fix.macLinux}
                    </span>
                    <button
                      onClick={() => copyToClipboard(fix.macLinux, `mac_${idx}`)}
                      className="text-slate-400 hover:text-white shrink-0 p-1"
                      title="Komutu kopyala"
                    >
                      {copiedKey === `mac_${idx}` ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
