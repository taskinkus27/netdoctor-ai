import React, { useState } from 'react';
import { Terminal, Download, Copy, Check, Play, Monitor, Shield, ExternalLink, Code2 } from 'lucide-react';

interface PythonCompanionProps {
  onGoToDossier: () => void;
}

export const PythonCompanion: React.FC<PythonCompanionProps> = ({ onGoToDossier }) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'code' | 'commands'>('overview');

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const curlCommand = `curl -sSL /api/download/netdoctor.py -o netdoctor.py && python3 netdoctor.py`;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-slate-800 bg-slate-900/60 p-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400">
            <Terminal className="h-4 w-4" />
            STANDALONE PYTHON COMPANION
          </div>
          <h2 className="text-lg font-bold text-white tracking-tight mt-1">
            NetDoctor Python CLI & GUI Yerel Aracı
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Harici hiçbir kütüphane (pip) gerektirmeyen, doğrudan bilgisayarınızın ağ kartı ve Wi-Fi bağdaştırıcısını arka planda test eden Python scripti.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/api/download/netdoctor.py"
            download="netdoctor.py"
            className="flex items-center gap-1.5 rounded-lg bg-cyan-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-cyan-400 transition-colors shrink-0 shadow-sm"
          >
            <Download className="h-4 w-4" />
            <span>netdoctor.py İndir</span>
          </a>
        </div>
      </div>

      {/* Quick Run Terminal Strip */}
      <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
        <div className="text-xs font-medium text-slate-400 mb-2 flex items-center justify-between">
          <span>Hemen Terminalden İndir ve Çalıştır (Linux / macOS / Windows PowerShell):</span>
          <span className="text-[11px] text-slate-500">Python 3.7+ uyumlu</span>
        </div>
        <div className="flex items-center justify-between rounded-lg bg-slate-900 px-3 py-2 font-mono text-xs text-cyan-300 border border-slate-800">
          <span className="truncate pr-3 font-mono">{curlCommand}</span>
          <button
            onClick={() => copyToClipboard(curlCommand, 'curl')}
            className="flex items-center gap-1 text-slate-400 hover:text-white shrink-0 pl-2 border-l border-slate-800"
          >
            {copiedKey === 'curl' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            <span className="text-[11px]">Kopyala</span>
          </button>
        </div>
      </div>

      {/* 3 Modes Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Mode 1: CLI */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-semibold text-white flex items-center gap-1.5">
                <Terminal className="h-4 w-4 text-cyan-400" />
                1. İnteraktif CLI Menüsü
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Terminalde hızlıca menüden seçim yaparak anlık teşhis koyar, gateway/DNS pinglerini listeler ve flushdns yapar.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800">
            <div className="flex items-center justify-between font-mono text-xs text-slate-300 bg-slate-950 p-2 rounded">
              <code>python netdoctor.py</code>
              <button
                onClick={() => copyToClipboard('python netdoctor.py', 'cli')}
                className="text-slate-400 hover:text-white"
              >
                {copiedKey === 'cli' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mode 2: GUI */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-semibold text-white flex items-center gap-1.5">
                <Monitor className="h-4 w-4 text-cyan-400" />
                2. Hafif Grafik Arayüz (GUI)
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Dahili Tkinter motoru ile pencere açar. Tek tıkla ağ testlerini çalıştırır ve ekranda renkli teşhis koyar.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800">
            <div className="flex items-center justify-between font-mono text-xs text-slate-300 bg-slate-950 p-2 rounded">
              <code>python netdoctor.py --gui</code>
              <button
                onClick={() => copyToClipboard('python netdoctor.py --gui', 'gui')}
                className="text-slate-400 hover:text-white"
              >
                {copiedKey === 'gui' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mode 3: Daemon / Logger */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-semibold text-white flex items-center gap-1.5">
                <Shield className="h-4 w-4 text-rose-400" />
                3. Arka Plan İzleyici (Daemon)
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Arka planda sessizce çalışır, her 30 saniyede bir hattı test eder ve kopmaları <code className="text-cyan-300">netdoctor_evidence.json</code> dosyasına kaydeder.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800">
            <div className="flex items-center justify-between font-mono text-xs text-slate-300 bg-slate-950 p-2 rounded">
              <code>python netdoctor.py --daemon</code>
              <button
                onClick={() => copyToClipboard('python netdoctor.py --daemon', 'daemon')}
                className="text-slate-400 hover:text-white"
              >
                {copiedKey === 'daemon' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Integration Workflow: From Python script to Official Web Dossier */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
        <h3 className="text-sm font-semibold text-white mb-3">
          Sürekli İzleme & ISP Şikayet İş Akışı
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="rounded-lg border border-slate-800/90 bg-slate-950 p-3">
            <span className="font-bold text-cyan-400 block mb-1">ADIM 1</span>
            <p className="text-slate-300">
              <code className="text-cyan-300 font-mono">netdoctor.py --daemon</code> komutunu bilgisayarınızda başlatın. İnternetiniz açıkken arkada sessizce log toplasın.
            </p>
          </div>
          <div className="rounded-lg border border-slate-800/90 bg-slate-950 p-3">
            <span className="font-bold text-cyan-400 block mb-1">ADIM 2</span>
            <p className="text-slate-300">
              Kopma veya yavaşlama yaşandığında oluşan <code className="text-cyan-300 font-mono">netdoctor_evidence.json</code> dosyasını bu arayüzdeki "Log Yükle" butonuyla yükleyin.
            </p>
          </div>
          <div className="rounded-lg border border-slate-800/90 bg-slate-950 p-3">
            <span className="font-bold text-cyan-400 block mb-1">ADIM 3</span>
            <p className="text-slate-300">
              "ISP Kanıt Raporu" sekmesinden zaman damgalı resmi teknik tutanağı PDF olarak indirin ve servis sağlayıcınıza / BTK'ya iletin.
            </p>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={onGoToDossier}
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            ISP Kanıt Raporu ve Yükleme Ekranına Git &rarr;
          </button>
        </div>
      </div>
    </div>
  );
};
