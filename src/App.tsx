import React, { useState, useEffect } from 'react';
import { Navbar, NavTab } from './components/Navbar';
import { DiagnosticOverview } from './components/DiagnosticOverview';
import { HopTraceroute } from './components/HopTraceroute';
import { DnsBenchmark } from './components/DnsBenchmark';
import { IspEvidenceDossier } from './components/IspEvidenceDossier';
import { PythonCompanion } from './components/PythonCompanion';
import { ContinuousMonitor } from './components/ContinuousMonitor';
import {
  runFullDiagnosis,
  fetchTraceroute,
  fetchDnsBenchmark,
  getSavedOutageLogs,
  recordOutageLog,
  clearOutageLogs,
} from './services/networkService';
import { DiagnosisReport, OutageIncident, TracerouteHop, DnsBenchmarkData } from './types/network';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('overview');
  const [report, setReport] = useState<DiagnosisReport | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [outageLogs, setOutageLogs] = useState<OutageIncident[]>([]);

  // Load initial diagnosis and logs on mount
  useEffect(() => {
    const saved = getSavedOutageLogs();
    setOutageLogs(saved);
    handleRunDiagnosis();
  }, []);

  const handleRunDiagnosis = async () => {
    setIsRunning(true);
    try {
      const result = await runFullDiagnosis();
      setReport(result);
      setOutageLogs(getSavedOutageLogs());
    } catch (err) {
      console.error('Diagnosis error:', err);
    } finally {
      setIsRunning(false);
    }
  };

  const handleSimulateScenario = (scenario: 'nominal' | 'wifi_weak' | 'modem_down' | 'isp_loss' | 'dns_fail') => {
    if (!report) return;

    if (scenario === 'nominal') {
      setReport({
        ...report,
        diagnosisCode: 'NOMINAL',
        diagnosisTitle: 'Bağlantı Nominal ve Kusursuz',
        diagnosisSummary: 'Wi-Fi sinyali, yerel modem ağ geçidi (192.168.1.1), DNS ve servis sağlayıcı omurgası standart toleranslar içinde çalışıyor.',
        severity: 'HEALTHY',
        rootCauseLayer: 'NONE',
        wifi: {
          ...report.wifi,
          rssi_dbm: -52,
          quality: 92,
        },
        gatewayPing: {
          ...report.gatewayPing,
          avgLatency: 2,
          lossPercentage: 0,
        },
        ispPing: {
          ...report.ispPing,
          avgLatency: 18,
          lossPercentage: 0,
          jitter: 2,
        },
        suggestions: [
          'Ağ bağlantınız ideal performans standartlarında çalışıyor.',
          'Herhangi bir donanım veya hat müdahalesine gerek bulunmuyor.',
        ],
      });
    } else if (scenario === 'wifi_weak') {
      setReport({
        ...report,
        diagnosisCode: 'WIFI_SIGNAL_POOR',
        diagnosisTitle: 'Zayıf Wi-Fi Sinyali & Parazit Darboğazı',
        diagnosisSummary: 'Wi-Fi sinyal seviyeniz -83 dBm seviyesine düştü. Duvar kalınlığı veya mesafe sebebiyle yerel havada paket düşmesi yaşanıyor.',
        severity: 'WARNING',
        rootCauseLayer: 'WIFI',
        wifi: {
          ...report.wifi,
          rssi_dbm: -83,
          quality: 34,
        },
        suggestions: [
          'Modeme yaklaşın veya aradaki kalın duvar ve metal objeleri azaltın.',
          'Menzili kısa fakat parazitsiz 5 GHz bandına geçiş yapın.',
          'Komşu modemlerle çakışmayı önlemek için modem arayüzünden Wi-Fi kanalını 36 veya 44 olarak sabitleyin.',
        ],
      });
    } else if (scenario === 'modem_down') {
      setReport({
        ...report,
        diagnosisCode: 'MODEM_GATEWAY_ISSUE',
        diagnosisTitle: 'Modem / Yerel Ağ Geçidi Kilitlenmesi',
        diagnosisSummary: 'Bilgisayarınız ile modem (192.168.1.1) arasındaki iletişimde %40 paket kaybı ve 45ms gecikme var. Sorun internet sağlayıcınızda değil, doğrudan yerel modeminizdedir.',
        severity: 'CRITICAL',
        rootCauseLayer: 'MODEM',
        gatewayPing: {
          ...report.gatewayPing,
          avgLatency: 45,
          lossPercentage: 40,
        },
        suggestions: [
          'Modemin fişini çekin, 30 saniye bekledikten sonra tekrar takarak güç döngüsü yapın.',
          'Ethernet kablosunu kontrol edin veya Wi-Fi bağdaştırıcısını kapatıp açın.',
          'Aşağıdaki "DHCP Renew" komutunu çalıştırarak modemden yeni IP talep edin.',
        ],
      });
    } else if (scenario === 'isp_loss') {
      const incident: OutageIncident = {
        id: `sim_isp_${Date.now()}`,
        timestamp: new Date().toISOString(),
        durationSeconds: 150,
        affectedLayer: 'ISP',
        ispLossPct: 50,
        gatewayLossPct: 0,
        jitterMs: 82,
        primaryTarget: '1.1.1.1 (Cloudflare)',
        notes: 'Simüle edilen santral arızası: Yerel modem açık ancak ISP OLT düğümünde %50 paket kaybı.',
      };
      recordOutageLog(incident);
      setOutageLogs(getSavedOutageLogs());

      setReport({
        ...report,
        diagnosisCode: 'ISP_OUTAGE_OR_PACKETLOSS',
        diagnosisTitle: 'İnternet Servis Sağlayıcı (ISP) Omurga Paket Kaybı',
        diagnosisSummary: 'Modeminiz (192.168.1.1) 2ms ve %0 kayıpla kusursuz çalışırken, ISP santral düğümünden sonra %50 paket kaybı saptandı. Bu doğrudan servis sağlayıcınızın altyapı arızasıdır.',
        severity: 'CRITICAL',
        rootCauseLayer: 'ISP',
        gatewayPing: {
          ...report.gatewayPing,
          avgLatency: 2,
          lossPercentage: 0,
        },
        ispPing: {
          ...report.ispPing,
          avgLatency: 95,
          lossPercentage: 50,
          jitter: 82,
        },
        suggestions: [
          'Hemen "ISP Kanıt Raporu" sekmesinden zaman damgalı resmi tutanağı PDF olarak indirin.',
          'Müşteri hizmetlerine veya BTK Tüketici Şikayet sistemine bu teknik kanıtları sunun.',
          'Santraldeki DSLAM/OLT portunuzun resetlenmesini veya saha reglet bağlantılarının kontrol edilmesini talep edin.',
        ],
      });
    } else if (scenario === 'dns_fail') {
      setReport({
        ...report,
        diagnosisCode: 'DNS_FAILURE',
        diagnosisTitle: 'DNS Çözümleme Hatası (SERVFAIL)',
        diagnosisSummary: 'Mevcut DNS sunucunuz internet alan adlarını çözümleyemiyor. Web sitelerine erişilemezken IP tabanlı pingler çalışmaya devam ediyor.',
        severity: 'WARNING',
        rootCauseLayer: 'DNS',
        dnsBenchmark: {
          ...report.dnsBenchmark,
          results: report.dnsBenchmark.results.map(r => (r.id === 'system' ? { ...r, status: 'FAILED' as const, durationMs: 0 } : r)),
        },
        suggestions: [
          'Ağ ayarlarınızdan DNS sunucunuzu 1.1.1.1 ve 8.8.8.8 olarak manuel değiştirin.',
          'DNS önbelleğinizi temizlemek için "ipconfig /flushdns" komutunu çalıştırın.',
        ],
      });
    }
  };

  const handleRefreshHops = async (target: string) => {
    setIsRunning(true);
    try {
      const hops = await fetchTraceroute(target);
      if (report) {
        setReport({ ...report, hops });
      }
    } finally {
      setIsRunning(false);
    }
  };

  const handleBenchmarkDomain = async (domain: string) => {
    setIsRunning(true);
    try {
      const dnsBenchmark = await fetchDnsBenchmark(domain);
      if (report) {
        setReport({ ...report, dnsBenchmark });
      }
    } finally {
      setIsRunning(false);
    }
  };

  const handleClearLogs = () => {
    if (confirm('Tüm geçmiş kesinti ve analiz kayıtları silinsin mi?')) {
      clearOutageLogs();
      setOutageLogs([]);
    }
  };

  const handleImportLogs = (imported: OutageIncident[]) => {
    imported.forEach(i => recordOutageLog(i));
    setOutageLogs(getSavedOutageLogs());
    setActiveTab('dossier');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* 1. Header (Navbar) */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onRunTest={handleRunDiagnosis}
        isRunning={isRunning}
      />

      {/* 2. Main Content Container */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-6 sm:px-6">
        {activeTab === 'overview' && (
          <DiagnosticOverview
            report={report}
            isRunning={isRunning}
            onRunTest={handleRunDiagnosis}
            onSimulateScenario={handleSimulateScenario}
            onNavigateToDossier={() => setActiveTab('dossier')}
          />
        )}

        {activeTab === 'traceroute' && (
          <HopTraceroute
            hops={report?.hops || []}
            onRefreshHops={handleRefreshHops}
            isLoading={isRunning}
          />
        )}

        {activeTab === 'dns' && report && (
          <DnsBenchmark
            data={report.dnsBenchmark}
            onBenchmarkDomain={handleBenchmarkDomain}
            isLoading={isRunning}
          />
        )}

        {activeTab === 'dossier' && (
          <IspEvidenceDossier
            logs={outageLogs}
            onAddManualLog={(inc) => {
              recordOutageLog(inc);
              setOutageLogs(getSavedOutageLogs());
            }}
            onClearLogs={handleClearLogs}
            onImportLogs={handleImportLogs}
          />
        )}

        {activeTab === 'monitor' && (
          <ContinuousMonitor />
        )}

        {activeTab === 'python' && (
          <PythonCompanion onGoToDossier={() => setActiveTab('dossier')} />
        )}
      </main>

      {/* 3. Quiet, Clean Editorial Footer */}
      <footer className="no-print mt-auto border-t border-slate-900 bg-slate-950 py-4 text-xs text-slate-500">
        <div className="mx-auto flex max-w-7xl flex-col sm:flex-row items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">NetDoctor</span>
            <span>·</span>
            <span>Akıllı Ağ Bağlantısı Teşhis Aracı & ISP Kanıt Üretici</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>RFC 2544 / RFC 6814 Standardı</span>
            <span>·</span>
            <button
              onClick={() => setActiveTab('python')}
              className="hover:text-cyan-400 transition-colors"
            >
              Python CLI / GUI Companion
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
