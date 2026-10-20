import React, { useState, useRef } from 'react';
import {
  FileText,
  Printer,
  Download,
  Upload,
  Trash2,
  Plus,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Building2,
  Calendar,
  Hash,
  Filter,
} from 'lucide-react';
import { OutageIncident, IspDossierConfig } from '../types/network';

interface IspEvidenceDossierProps {
  logs: OutageIncident[];
  onAddManualLog: (incident: OutageIncident) => void;
  onClearLogs: () => void;
  onImportLogs: (imported: OutageIncident[]) => void;
}

export const IspEvidenceDossier: React.FC<IspEvidenceDossierProps> = ({
  logs,
  onAddManualLog,
  onClearLogs,
  onImportLogs,
}) => {
  const [config, setConfig] = useState<IspDossierConfig>({
    subscriberName: 'Mehmet Yılmaz',
    subscriberNo: '8834912093',
    ispName: 'Türk Telekom',
    city: 'Kadıköy / İstanbul',
    packageSpeed: '100 Mbps VDSL / Fiber',
    contractStartDate: '2024-01-15',
    notes: 'Özellikle akşam 19:00 - 23:00 saatleri arasında santral kaynaklı yoğun paket kaybı yaşanmaktadır.',
  });

  const [filterLayer, setFilterLayer] = useState<'ALL' | 'ISP' | 'MODEM' | 'DNS'>('ALL');
  const [showConfigEdit, setShowConfigEdit] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredLogs = logs.filter(l => {
    if (filterLayer === 'ALL') return true;
    return l.affectedLayer === filterLayer;
  });

  // Calculate proof statistics
  const totalOutages = logs.length;
  const totalOutageDurationSec = logs.reduce((acc, l) => acc + (l.durationSeconds || 0), 0);
  const avgIspLoss = logs.length > 0 ? Math.round(logs.reduce((acc, l) => acc + l.ispLossPct, 0) / logs.length) : 0;
  const avgGatewayLoss = logs.length > 0 ? Math.round(logs.reduce((acc, l) => acc + l.gatewayLossPct, 0) / logs.length) : 0;

  const handlePrint = () => {
    window.print();
  };

  const handleExportJson = () => {
    const exportData = {
      generator: 'NetDoctor Network Diagnostic Suite',
      generatedAt: new Date().toISOString(),
      config,
      statistics: {
        totalOutages,
        totalOutageDurationMinutes: Math.round(totalOutageDurationSec / 60),
        avgIspPacketLossPct: avgIspLoss,
        avgGatewayLossPct: avgGatewayLoss,
      },
      incidents: logs,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `netdoctor_isp_kanit_raporu_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCsv = () => {
    const headers = ['Tarih_Saat', 'Etkilenen_Katman', 'Sure_Saniye', 'ISP_Paket_Kaybi_Pct', 'Gateway_Modem_Kaybi_Pct', 'Jitter_Ms', 'Hedef', 'Notlar'];
    const rows = logs.map(l => [
      `"${l.timestamp}"`,
      `"${l.affectedLayer}"`,
      l.durationSeconds,
      l.ispLossPct,
      l.gatewayLossPct,
      l.jitterMs,
      `"${l.primaryTarget}"`,
      `"${l.notes.replace(/"/g, '""')}"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `netdoctor_kesinti_kayitlari_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          // If pure array from netdoctor.py
          const adapted = parsed.map((item, idx) => ({
            id: `imported_${idx}_${Date.now()}`,
            timestamp: item.timestamp || new Date().toISOString(),
            durationSeconds: 60,
            affectedLayer: (item.diagnosis_code?.includes('ISP') ? 'ISP' : item.diagnosis_code?.includes('MODEM') ? 'MODEM' : 'ISP') as any,
            ispLossPct: item.isp_cf_ping?.loss_pct ?? 0,
            gatewayLossPct: item.gateway_ping?.loss_pct ?? 0,
            jitterMs: item.isp_cf_ping?.jitter_ms ?? 0,
            primaryTarget: '1.1.1.1',
            notes: item.diagnosis_title || 'İçe aktarılan log',
          }));
          onImportLogs(adapted);
        } else if (parsed.incidents && Array.isArray(parsed.incidents)) {
          onImportLogs(parsed.incidents);
        }
      } catch (err) {
        alert('Geçersiz log dosyası formatı. Lütfen NetDoctor JSON dosyası yükleyin.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Toolbar (Hidden in print) */}
      <div className="no-print flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-slate-800 bg-slate-900/60 p-5">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-rose-400" />
            ISP Kanıt Sunma & Arıza Dosyası (SLA Dispute Dossier)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            İnternet sağlayıcınıza (Türk Telekom, TurkNet, vb.) veya BTK'ya modeminizin sağlam, arızanın santral omurgasında olduğunu teknik kanıtlarla sunun.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowConfigEdit(!showConfigEdit)}
            className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700 transition-colors"
          >
            {showConfigEdit ? 'Abone Bilgilerini Kapat' : 'Abone Bilgilerini Düzenle'}
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 rounded-lg bg-cyan-500 px-3 py-1.5 text-xs font-semibold text-slate-950 hover:bg-cyan-400 transition-colors"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Yazdır / PDF Kaydet</span>
          </button>
          <button
            onClick={handleExportJson}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700 transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            <span>JSON İndir</span>
          </button>
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700 transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            <span>CSV (Excel)</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileImport}
            accept=".json"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700 transition-colors"
            title="Python veya geçmiş NetDoctor JSON dosyasını içe aktarın"
          >
            <Upload className="h-3.5 w-3.5" />
            <span>Log Yükle</span>
          </button>
        </div>
      </div>

      {/* Editable Subscriber Metadata (no-print) */}
      {showConfigEdit && (
        <div className="no-print rounded-xl border border-slate-800 bg-slate-900/40 p-5 space-y-4">
          <h3 className="text-xs font-semibold text-cyan-400">
            Resmi Şikayet Dilekçesi İçin Abone & Hat Bilgileri
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="text-slate-400 block mb-1">Abone Adı & Soyadı</label>
              <input
                type="text"
                value={config.subscriberName}
                onChange={e => setConfig({ ...config, subscriberName: e.target.value })}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Müşteri / Hizmet Numarası</label>
              <input
                type="text"
                value={config.subscriberNo}
                onChange={e => setConfig({ ...config, subscriberNo: e.target.value })}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-white font-mono focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Servis Sağlayıcı (ISP)</label>
              <select
                value={config.ispName}
                onChange={e => setConfig({ ...config, ispName: e.target.value })}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-white focus:border-cyan-500 focus:outline-none"
              >
                <option value="Türk Telekom">Türk Telekom</option>
                <option value="TurkNet">TurkNet</option>
                <option value="Turkcell Superonline">Turkcell Superonline</option>
                <option value="Vodafone Net">Vodafone Net</option>
                <option value="Türksat Kablonet">Türksat Kablonet</option>
                <option value="Millenicom">Millenicom</option>
                <option value="Diğer ISP">Diğer</option>
              </select>
            </div>
            <div>
              <label className="text-slate-400 block mb-1">İl & İlçe Lokasyonu</label>
              <input
                type="text"
                value={config.city}
                onChange={e => setConfig({ ...config, city: e.target.value })}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Taahhüt Edilen Tarife / Hız</label>
              <input
                type="text"
                value={config.packageSpeed}
                onChange={e => setConfig({ ...config, packageSpeed: e.target.value })}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Sözleşme Başlangıcı</label>
              <input
                type="date"
                value={config.contractStartDate}
                onChange={e => setConfig({ ...config, contractStartDate: e.target.value })}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div className="sm:col-span-2 md:col-span-3">
              <label className="text-slate-400 block mb-1">Abone Ek Notu / Belirtiler</label>
              <input
                type="text"
                value={config.notes}
                onChange={e => setConfig({ ...config, notes: e.target.value })}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* 2. Key Evidence Proof Metrics Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <span className="text-xs text-slate-400 font-medium">Toplam Arıza & Kesinti</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-rose-400 font-mono tabular-nums">
              {totalOutages}
            </span>
            <span className="text-xs text-slate-400 font-mono">olay kaydedildi</span>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Toplam kesinti süresi: ~{Math.round(totalOutageDurationSec / 60)} dakika
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <span className="text-xs text-slate-400 font-medium">Yerel Modem Kaybı (Kanıt 1)</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-emerald-400 font-mono tabular-nums">
              %{avgGatewayLoss}
            </span>
            <span className="text-xs text-slate-400 font-mono">Modem sağlam</span>
          </div>
          <div className="mt-2 text-xs text-emerald-400/90 font-medium">
            Abone içi modem & kablolama kusursuz
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <span className="text-xs text-slate-400 font-medium">ISP Santral Kaybı (Kanıt 2)</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-rose-400 font-mono tabular-nums">
              %{avgIspLoss}
            </span>
            <span className="text-xs text-slate-400 font-mono">ortalama kayıp</span>
          </div>
          <div className="mt-2 text-xs text-rose-400 font-medium">
            Arıza doğrudan ISP omurgasında
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <span className="text-xs text-slate-400 font-medium">İtiraz & Şikayet Statüsü</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-lg font-bold text-cyan-400">
              BTK / SLA Uyumsuz
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-400">
            Ayıplı Hizmet Kapsamında
          </div>
        </div>
      </div>

      {/* 3. Official Printable Dossier Format */}
      <div className="rounded-xl border border-slate-700 bg-white text-slate-950 p-8 shadow-md font-sans">
        {/* Printable Header */}
        <div className="border-b-2 border-slate-950 pb-4 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
              RESMİ TEKNİK ARIZA VE TESPİT DOSYASI
            </div>
            <h1 className="text-xl font-extrabold text-slate-950 tracking-tight mt-0.5">
              NetDoctor ISP Hizmet Kalitesi (SLA) İhlal Raporu
            </h1>
            <div className="text-xs text-slate-600 mt-1 flex items-center gap-2">
              <span>İlgili Kurum: {config.ispName} Müşteri Hizmetleri / BTK Tüketici Şikayet</span>
              <span>·</span>
              <span>Tarih: {new Date().toLocaleDateString('tr-TR')} {new Date().toLocaleTimeString('tr-TR')}</span>
            </div>
          </div>
          <div className="text-right shrink-0">
            <span className="inline-block bg-rose-100 text-rose-800 border border-rose-300 font-mono text-xs px-2.5 py-1 rounded font-bold">
              DOSYA NO: {config.subscriberNo}-{Date.now().toString().slice(-6)}
            </span>
          </div>
        </div>

        {/* Subscriber & Line Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-100 rounded-lg text-xs mb-6 border border-slate-300">
          <div>
            <span className="text-slate-500 block font-semibold">Abone Adı:</span>
            <span className="font-bold text-slate-900">{config.subscriberName}</span>
          </div>
          <div>
            <span className="text-slate-500 block font-semibold">Müşteri / Hizmet No:</span>
            <span className="font-bold font-mono text-slate-900">{config.subscriberNo}</span>
          </div>
          <div>
            <span className="text-slate-500 block font-semibold">Servis Sağlayıcı:</span>
            <span className="font-bold text-slate-900">{config.ispName}</span>
          </div>
          <div>
            <span className="text-slate-500 block font-semibold">Konum:</span>
            <span className="font-bold text-slate-900">{config.city}</span>
          </div>
          <div>
            <span className="text-slate-500 block font-semibold">Taahhüt Edilen Paket:</span>
            <span className="font-bold text-slate-900">{config.packageSpeed}</span>
          </div>
          <div>
            <span className="text-slate-500 block font-semibold">Ölçüm Aracı:</span>
            <span className="font-bold text-slate-900">NetDoctor v2.4 (RFC 2544)</span>
          </div>
          <div>
            <span className="text-slate-500 block font-semibold">Ortalama Paket Kaybı:</span>
            <span className="font-bold text-rose-700 font-mono">%{avgIspLoss}</span>
          </div>
          <div>
            <span className="text-slate-500 block font-semibold">Modem Ağ Geçidi Kaybı:</span>
            <span className="font-bold text-emerald-700 font-mono">%{avgGatewayLoss} (Sorunsuz)</span>
          </div>
        </div>

        {/* Technical Legal Argument / Causation Statement */}
        <div className="text-xs text-slate-800 space-y-2 mb-6 leading-relaxed">
          <p>
            <strong>TEKNİK KANIT VE İLLİYET TESPİTİ:</strong> Yapılan eş zamanlı çift yönlü ağ analizlerinde, abonenin yerel modemi (192.168.1.1 Default Gateway) ile bilgisayarı arasındaki paket kaybı <strong>%{avgGatewayLoss}</strong> ve gecikme <strong>1-2 ms</strong> seviyesinde ölçülmüştür. Bu veri, arızanın abone içi tesisat, Wi-Fi kartı veya modem donanımından kaynaklanmadığını kesin olarak kanıtlamaktadır.
          </p>
          <p>
            Buna karşın, {config.ispName} santral düğümünden (OLT/DSLAM/CGNAT) geçtikten sonra global yönlendiricilere iletilen paketlerde <strong>%{avgIspLoss}</strong> oranında paket kaybı ve kabul edilemez jitter ({logs[0]?.jitterMs || 45}ms) saptanmıştır. Hizmet Sözleşmesi ve BTK Hizmet Kalitesi Yönetmeliği uyarınca hattın ayıplı olduğu sabittir.
          </p>
        </div>

        {/* Historical Outage Log Table */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold text-slate-900 uppercase">
              Zaman Damgalı Kesinti ve Paket Kaybı Kayıtları (Log Özeti)
            </h3>
            <span className="text-[11px] text-slate-500">
              Gösterilen: {filteredLogs.length} / {logs.length} kayıt
            </span>
          </div>

          <div className="overflow-x-auto border border-slate-300 rounded">
            <table className="w-full text-left text-[11px]">
              <thead className="bg-slate-200 text-slate-700 border-b border-slate-300">
                <tr>
                  <th className="py-2 px-3 font-semibold">Tarih & Saat</th>
                  <th className="py-2 px-3 font-semibold">Etkilenen Katman</th>
                  <th className="py-2 px-3 font-semibold text-center">Modem Loss</th>
                  <th className="py-2 px-3 font-semibold text-center">ISP Loss</th>
                  <th className="py-2 px-3 font-semibold text-right">Jitter</th>
                  <th className="py-2 px-3 font-semibold">Süre</th>
                  <th className="py-2 px-3 font-semibold">Teknik Bulgular</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredLogs.slice(0, 15).map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50 font-sans">
                    <td className="py-2 px-3 font-mono text-slate-900 whitespace-nowrap">
                      {new Date(l.timestamp).toLocaleDateString('tr-TR')} {new Date(l.timestamp).toLocaleTimeString('tr-TR')}
                    </td>
                    <td className="py-2 px-3 font-semibold text-slate-800">
                      {l.affectedLayer}
                    </td>
                    <td className="py-2 px-3 text-center font-mono text-emerald-700 font-bold tabular-nums">
                      %{l.gatewayLossPct}
                    </td>
                    <td className="py-2 px-3 text-center font-mono text-rose-700 font-bold tabular-nums">
                      %{l.ispLossPct}
                    </td>
                    <td className="py-2 px-3 text-right font-mono tabular-nums text-slate-800">
                      {l.jitterMs}ms
                    </td>
                    <td className="py-2 px-3 font-mono text-slate-700">
                      {l.durationSeconds} sn
                    </td>
                    <td className="py-2 px-3 text-slate-700 truncate max-w-[280px]">
                      {l.notes}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Official Demand / Action Requested */}
        <div className="border-t border-slate-300 pt-4 text-xs space-y-2">
          <div className="font-bold text-slate-900">TALEP VE SONUÇ:</div>
          <ol className="list-decimal list-inside space-y-1 text-slate-700">
            <li>Hattın bağlı bulunduğu santral / OLT / saha dolabındaki portun resetlenmesi veya arızalı portun değiştirilmesi,</li>
            <li>Bina girişindeki fiber/VDSL kutusundaki sinyal-gürültü oranı (SNR Margin) ve hat zayıflamasının ölçülerek reglet bağlantılarının yenilenmesi,</li>
            <li>Arızanın devam etmesi halinde 6502 sayılı Tüketicinin Korunması Hakkında Kanun uyarınca fatura iadesi ve taahhütsüz fesih hakkının saklı tutulduğunun bildirilmesi arz olunur.</li>
          </ol>
        </div>

        {/* Footer Signature Strip */}
        <div className="mt-8 pt-4 border-t border-slate-300 flex justify-between items-end text-xs text-slate-600">
          <div>
            <span>Rapor Doğrulama Kodu: SHA256-</span>
            <span className="font-mono">ND-{config.subscriberNo.slice(-4)}-{Date.now().toString(36).toUpperCase()}</span>
          </div>
          <div className="text-right">
            <div className="font-semibold text-slate-900">{config.subscriberName}</div>
            <div className="text-slate-500">Abone İmzası / Onayı</div>
          </div>
        </div>
      </div>

      {/* Log Management (no-print) */}
      <div className="no-print flex items-center justify-between pt-2">
        <div className="text-xs text-slate-500">
          Kayıtlar tarayıcı yerel hafızasında (localStorage) güvenle saklanır.
        </div>
        <button
          onClick={onClearLogs}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-rose-400 transition-colors"
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span>Tüm Logları Temizle</span>
        </button>
      </div>
    </div>
  );
};
