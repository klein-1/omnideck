import React from 'react';
import { 
  Download, Shield, Server, Image, FileText, Clock, 
  Calculator, DollarSign, Wrench, Gauge, Type, Music, 
  Cpu, Gamepad2, Heart, Share2, Code, Zap
} from 'lucide-react';
import { playClick } from '../audio/soundEffects';

export const CATEGORIES = [
  { id: 'downloader', label: 'DOWNLOADER', icon: Download, color: 'text-arcade-emerald', badge: 'SEAL/SPOTDL' },
  { id: 'urlChecker', label: 'URL CHECKER', icon: Shield, color: 'text-arcade-cyan', badge: 'SAFETY' },
  { id: 'shttps', label: 'LOCAL SHTTPS', icon: Server, color: 'text-arcade-amber', badge: 'SERVER' },
  { id: 'imageToolbox', label: 'IMAGE STUDIO', icon: Image, color: 'text-arcade-coral', badge: 'T8RIN' },
  { id: 'pdfSuite', label: 'PDF SUITE', icon: FileText, color: 'text-arcade-violet', badge: 'KNIFE' },
  { id: 'dateTime', label: 'DATE & TIME', icon: Clock, color: 'text-arcade-emerald', badge: '9 TOOLS' },
  { id: 'calculators', label: 'CALCULATORS', icon: Calculator, color: 'text-arcade-amber', badge: '12 TOOLS' },
  { id: 'finance', label: 'FINANCE', icon: DollarSign, color: 'text-arcade-cyan', badge: '7 TOOLS' },
  { id: 'essentials', label: 'ESSENTIALS', icon: Wrench, color: 'text-arcade-paper', badge: '8 TOOLS' },
  { id: 'measurement', label: 'MEASURE & SENSORS', icon: Gauge, color: 'text-arcade-coral', badge: '16 TOOLS' },
  { id: 'textTools', label: 'TEXT & CRYPTO', icon: Type, color: 'text-arcade-violet', badge: '15 TOOLS' },
  { id: 'media', label: 'MEDIA & AUDIO', icon: Music, color: 'text-arcade-emerald', badge: '8 TOOLS' },
  { id: 'deviceInfo', label: 'DEVICE & SYS', icon: Cpu, color: 'text-arcade-cyan', badge: '14 TOOLS' },
  { id: 'games', label: 'ARCADE GAMES', icon: Gamepad2, color: 'text-arcade-amber', badge: '18 GAMES' },
  { id: 'health', label: 'HEALTH & LIFE', icon: Heart, color: 'text-arcade-coral', badge: '8 TOOLS' },
  { id: 'social', label: 'SOCIAL & WEB', icon: Share2, color: 'text-arcade-violet', badge: '8 TOOLS' },
  { id: 'developer', label: 'DEV & NETWORK', icon: Code, color: 'text-arcade-emerald', badge: '9 TOOLS' },
  { id: 'humanBenchmark', label: 'BENCHMARK', icon: Zap, color: 'text-arcade-amber', badge: '7 TESTS' },
];

export default function Navigation({ activeCategory, onSelectCategory }) {
  return (
    <nav className="border-b border-deck-border bg-deck-surface/60 overflow-x-auto no-scrollbar">
      <div className="max-w-7xl mx-auto px-4 flex items-center gap-1.5 py-2 min-w-max">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => {
                playClick();
                onSelectCategory(cat.id);
              }}
              className={`flex items-center gap-2 px-3 py-1.5 border font-mono text-xs transition-all ${
                isActive
                  ? 'bg-deck-surfaceHover border-arcade-emerald text-white shadow-pixel-sm active-nav-pill'
                  : 'bg-deck-bg/70 border-deck-border/80 text-arcade-muted hover:text-white hover:border-deck-borderLight hover:bg-deck-surface'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? cat.color : 'text-arcade-muted'}`} />
              <span className={`font-pixel text-[9px] tracking-tight ${isActive ? 'text-white' : ''}`}>
                {cat.label}
              </span>
              <span className={`badge-pill text-[8px] font-mono px-1 py-0.2 border ${
                isActive 
                  ? 'bg-deck-dark border-arcade-emerald/50 text-arcade-emerald' 
                  : 'bg-deck-dark/40 border-deck-border/50 text-deck-borderLight'
              }`}>
                {cat.badge}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

