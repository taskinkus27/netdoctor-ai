import React, { useState } from 'react';
import { Globe2, Zap, Shield, Check, Copy, ArrowUpRight, CheckCircle2, XCircle } from 'lucide-react';
import { DnsBenchmarkData } from '../types/network';

interface DnsBenchmarkProps {
  data: DnsBenchmarkData;
  onBenchmarkDomain: (domain: string) => void;
  isLoading: boolean;
}

export const DnsBenchmark: React.FC<DnsBenchmarkProps> = ({
  data,
  onBenchmarkDomain,
  isLoading,
}) => {
  const [testDomain, setTestDomain] = useState('google.com');
  const [activeOsTab, setActiveOsTab] = useState<'win' | 'mac' | 'linux'>('win');
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const popularDomains = ['google.com', 'cloudflare.com', 'github.com', 'turkiye.gov.tr', 'netflix.com'];

  const handleTest = (domain: string) => {
    setTestDomain(domain);
    onBenchmarkDomain(domain);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const sortedResults = [...data.results].sort((a, b) => {
    if (a.status !== 'SUCCESS') return 1;
    if (b.status !== 'SUCCESS') return -1;
    return a.durationMs - b.durationMs;
  });

  const fastest = sortedResults.find(r => r.status === 'SUCCESS');

  return (
    <div className="space-y-6">
      {/* Header and Domain Selector */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-slate-800 bg-slate-900/60 p-5">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">
            DNS Çözümleme Hızı & Güvenilirlik Testi
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Farklı genel DNS sunucularının yanıt sürelerini (ms) ve güvenliğini ölçer, en hızlı sağlayıcıyı belirler.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {popularDomains.map((d) => (
            <button
              key={d}
              onClick={() => handleTest(d)}
              className={`px-2.5 py-1 text-xs rounded-md font-mono transition-colors ${
                testDomain === d
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Fastest Winner Box */}
      {fastest && (
        <div className="rounded-xl border border-cyan-500/30 bg-cyan-950/20 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                <Zap className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs font-semibold text-cyan-400">
                  ÖNERİLEN EN HIZLI DNS SUNUCUSU
                </div>
                <div className="text-base font-bold text-white">
                  {fastest.name} ({fastest.ip})
                </div>
                <div className="text-xs text-slate-300 mt-0.5">
                  <span className="font-mono text-cyan-300 font-bold tabular-nums">{fastest.durationMs} ms</span> çözümleme süresi ile en düşük gecikmeyi sağladı.
                </div>
              </div>
            </div>

            <button
              onClick={() => handleCopy(fastest.ip === 'Yerel' ? '1.1.1.1' : fastest.ip)}
              className="flex items-center gap-1.5 rounded-lg bg-cyan-500 px-3.5 py-2 text-xs font-semibold text-slate-950 hover:bg-cyan-400 transition-colors shrink-0"
            >
              {copiedText ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              <span>DNS IP Kopyala</span>
            </button>
          </div>
        </div>
      )}

      {/* Comparison Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden">
        <div className="p-4 border-b border-slate-800">
          <h3 className="text-sm font-semibold text-white">
            {testDomain} İçin Çözümleme Karşılaştırması
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/70 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4 font-semibold">DNS Sağlayıcı</th>
                <th className="py-3 px-4 font-semibold">Sunucu IP</th>
                <th className="py-3 px-4 font-semibold">Çözümlenen IP</th>
                <th className="py-3 px-4 font-semibold text-right">Yanıt Süresi</th>
                <th className="py-3 px-4 font-semibold text-center">Durum</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {sortedResults.map((r) => {
                const isFastest = r.id === fastest?.id;
                return (
                  <tr
                    key={r.id}
                    className={`hover:bg-slate-800/40 transition-colors ${
                      isFastest ? 'bg-cyan-500/5' : ''
                    }`}
                  >
                    <td className="py-3 px-4 font-medium text-white flex items-center gap-2">
                      {r.name}
                      {isFastest && (
                        <span className="text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-1.5 py-0.5 rounded font-semibold">
                          En Hızlı
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-300">{r.ip}</td>
                    <td className="py-3 px-4 font-mono text-slate-400 truncate max-w-[150px]">
                      {r.resolvedIp || 'Yok'}
                    </td>
                    <td className="py-3 px-4 font-mono text-right tabular-nums text-white font-semibold">
                      {r.durationMs > 0 ? `${r.durationMs} ms` : '-'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {r.status === 'SUCCESS' ? (
                        <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Başarılı
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-rose-400 font-medium">
                          <XCircle className="h-3.5 w-3.5" />
                          Hata
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Guide: How to switch DNS */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <h3 className="text-sm font-semibold text-white">
            DNS Nasıl Değiştirilir? (İşletim Sistemi Rehberi)
          </h3>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveOsTab('win')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                activeOsTab === 'win' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Windows
            </button>
            <button
              onClick={() => setActiveOsTab('mac')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                activeOsTab === 'mac' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              macOS
            </button>
            <button
              onClick={() => setActiveOsTab('linux')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                activeOsTab === 'linux' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Linux
            </button>
          </div>
        </div>

        <div className="text-xs text-slate-300 leading-relaxed space-y-2">
          {activeOsTab === 'win' && (
            <ol className="list-decimal list-inside space-y-1.5">
              <li><strong>Ayarlar</strong> &gt; <strong>Ağ ve İnternet</strong> &gt; <strong>Gelişmiş ağ ayarları</strong>'na gidin.</li>
              <li>Aktif Wi-Fi veya Ethernet bağdaştırıcınızın yanındaki <strong>Düzenle</strong> butonuna tıklayın.</li>
              <li><strong>IPv4 Ayarları</strong> bölümünde DNS atamasını <em>El ile</em> olarak seçin.</li>
              <li>Tercih edilen DNS: <code className="bg-slate-800 px-1.5 py-0.5 rounded text-cyan-400 font-mono">1.1.1.1</code>, Diğer DNS: <code className="bg-slate-800 px-1.5 py-0.5 rounded text-cyan-400 font-mono">1.0.0.1</code> girip kaydedin.</li>
              <li>Terminal açıp <code className="bg-slate-800 px-1.5 py-0.5 rounded text-amber-300 font-mono">ipconfig /flushdns</code> çalıştırın.</li>
            </ol>
          )}

          {activeOsTab === 'mac' && (
            <ol className="list-decimal list-inside space-y-1.5">
              <li><strong>Sistem Ayarları</strong> &gt; <strong>Ağ</strong> &gt; <strong>Wi-Fi</strong> sekmesine gidin.</li>
              <li>Bağlı olduğunuz ağın yanındaki <strong>Ayrıntılar...</strong> butonuna basın.</li>
              <li>Sol menüden <strong>DNS</strong> sekmesini seçin.</li>
              <li><strong>+</strong> butonuna tıklayarak <code className="bg-slate-800 px-1.5 py-0.5 rounded text-cyan-400 font-mono">1.1.1.1</code> ve <code className="bg-slate-800 px-1.5 py-0.5 rounded text-cyan-400 font-mono">8.8.8.8</code> ekleyin.</li>
              <li><strong>Tamam</strong> ve <strong>Uygula</strong> butonuna tıklayarak işlemi tamamlayın.</li>
            </ol>
          )}

          {activeOsTab === 'linux' && (
            <div className="space-y-2">
              <p>Systemd tabanlı dağıtımlarda (Ubuntu, Debian, Fedora) <code className="bg-slate-800 px-1.5 py-0.5 rounded text-cyan-400 font-mono">/etc/systemd/resolved.conf</code> dosyasını açın:</p>
              <pre className="bg-slate-950 p-2.5 rounded font-mono text-cyan-300 text-[11px] overflow-x-auto">
[Resolve]
DNS=1.1.1.1 8.8.8.8 1.0.0.1
FallbackDNS=9.9.9.9
              </pre>
              <p>Ardından servisi yeniden başlatın: <code className="bg-slate-800 px-1.5 py-0.5 rounded text-amber-300 font-mono">sudo systemctl restart systemd-resolved</code></p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
