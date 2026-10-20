import React from 'react';
import { Activity, ShieldCheck, RefreshCw } from 'lucide-react';

export type NavTab = 'overview' | 'traceroute' | 'dns' | 'dossier' | 'python' | 'monitor';

interface NavbarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onRunTest: () => void;
  isRunning: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  onRunTest,
  isRunning,
}) => {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-8 px-4 py-3 sm:px-6">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onTabChange('overview')}
            className="flex items-center gap-2.5 text-left group"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Activity className="h-4 w-4" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white whitespace-nowrap">
              NetDoctor
            </span>
          </button>
        </div>

        {/* Zone 2: 4-5 concise single-line nav links */}
        <nav className="hidden md:flex items-center gap-1 text-sm font-medium text-slate-400">
          <button
            onClick={() => onTabChange('overview')}
            className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'overview'
                ? 'bg-slate-800 text-cyan-400 font-semibold'
                : 'hover:text-slate-200'
            }`}
          >
            Canlı Teşhis
          </button>
          <button
            onClick={() => onTabChange('traceroute')}
            className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'traceroute'
                ? 'bg-slate-800 text-cyan-400 font-semibold'
                : 'hover:text-slate-200'
            }`}
          >
            Hop & Traceroute
          </button>
          <button
            onClick={() => onTabChange('dns')}
            className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'dns'
                ? 'bg-slate-800 text-cyan-400 font-semibold'
                : 'hover:text-slate-200'
            }`}
          >
            DNS Kıyaslama
          </button>
          <button
            onClick={() => onTabChange('dossier')}
            className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'dossier'
                ? 'bg-slate-800 text-cyan-400 font-semibold'
                : 'hover:text-slate-200'
            }`}
          >
            ISP Kanıt Raporu
          </button>
          <button
            onClick={() => onTabChange('monitor')}
            className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'monitor'
                ? 'bg-slate-800 text-cyan-400 font-semibold'
                : 'hover:text-slate-200'
            }`}
          >
            Sürekli İzleme
          </button>
          <button
            onClick={() => onTabChange('python')}
            className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'python'
                ? 'bg-slate-800 text-cyan-400 font-semibold'
                : 'hover:text-slate-200'
            }`}
          >
            Python CLI / GUI
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onRunTest}
            disabled={isRunning}
            className="flex items-center gap-2 rounded-lg bg-cyan-500 px-3.5 py-1.5 text-xs font-semibold text-slate-950 transition-all hover:bg-cyan-400 active:scale-95 disabled:opacity-50 whitespace-nowrap shrink-0 shadow-sm"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRunning ? 'animate-spin' : ''}`} />
            <span>{isRunning ? 'Test Ediliyor...' : 'Hızlı Teşhis Başlat'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
