import React, { useRef, useEffect, useState } from 'react';
import { 
  Download, Shield, Server, Image, FileText, Clock, 
  Calculator, DollarSign, Wrench, Gauge, Type, Music, 
  Cpu, Gamepad2, Heart, Share2, Code, Zap, LayoutGrid, X,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import { playClick } from '../audio/soundEffects';

export const CATEGORIES = [
  { 
    id: 'downloader', 
    label: 'DOWNLOADER', 
    icon: Download, 
    color: 'text-red-400', 
    activeBorder: 'border-red-400', 
    activeBg: 'bg-red-500/15',
    activeText: 'text-red-300',
    badgeText: 'text-red-400',
    badgeBorder: 'border-red-400/50',
    badge: 'SEAL/SPOTDL', 
    hex: '#ff4757',
    glow: 'rgba(255, 71, 87, 0.4)'
  },
  { 
    id: 'urlChecker', 
    label: 'URL CHECKER', 
    icon: Shield, 
    color: 'text-cyan-400', 
    activeBorder: 'border-cyan-400', 
    activeBg: 'bg-cyan-500/15',
    activeText: 'text-cyan-300',
    badgeText: 'text-cyan-400',
    badgeBorder: 'border-cyan-400/50',
    badge: 'SAFETY', 
    hex: '#00f0ff',
    glow: 'rgba(0, 240, 255, 0.4)'
  },
  { 
    id: 'shttps', 
    label: 'LOCAL SHTTPS', 
    icon: Server, 
    color: 'text-amber-400', 
    activeBorder: 'border-amber-400', 
    activeBg: 'bg-amber-500/15',
    activeText: 'text-amber-300',
    badgeText: 'text-amber-400',
    badgeBorder: 'border-amber-400/50',
    badge: 'SERVER', 
    hex: '#ffb703',
    glow: 'rgba(255, 183, 3, 0.4)'
  },
  { 
    id: 'imageToolbox', 
    label: 'IMAGE STUDIO', 
    icon: Image, 
    color: 'text-pink-400', 
    activeBorder: 'border-pink-400', 
    activeBg: 'bg-pink-500/15',
    activeText: 'text-pink-300',
    badgeText: 'text-pink-400',
    badgeBorder: 'border-pink-400/50',
    badge: 'T8RIN', 
    hex: '#ec4899',
    glow: 'rgba(236, 72, 153, 0.4)'
  },
  { 
    id: 'pdfSuite', 
    label: 'PDF SUITE', 
    icon: FileText, 
    color: 'text-purple-400', 
    activeBorder: 'border-purple-400', 
    activeBg: 'bg-purple-500/15',
    activeText: 'text-purple-300',
    badgeText: 'text-purple-400',
    badgeBorder: 'border-purple-400/50',
    badge: 'KNIFE', 
    hex: '#a855f7',
    glow: 'rgba(168, 85, 247, 0.4)'
  },
  { 
    id: 'dateTime', 
    label: 'DATE & TIME', 
    icon: Clock, 
    color: 'text-teal-400', 
    activeBorder: 'border-teal-400', 
    activeBg: 'bg-teal-500/15',
    activeText: 'text-teal-300',
    badgeText: 'text-teal-400',
    badgeBorder: 'border-teal-400/50',
    badge: '9 TOOLS', 
    hex: '#14b8a6',
    glow: 'rgba(20, 184, 166, 0.4)'
  },
  { 
    id: 'calculators', 
    label: 'CALCULATORS', 
    icon: Calculator, 
    color: 'text-yellow-400', 
    activeBorder: 'border-yellow-400', 
    activeBg: 'bg-yellow-500/15',
    activeText: 'text-yellow-300',
    badgeText: 'text-yellow-400',
    badgeBorder: 'border-yellow-400/50',
    badge: '12 TOOLS', 
    hex: '#eab308',
    glow: 'rgba(234, 179, 8, 0.4)'
  },
  { 
    id: 'finance', 
    label: 'FINANCE', 
    icon: DollarSign, 
    color: 'text-emerald-400', 
    activeBorder: 'border-emerald-400', 
    activeBg: 'bg-emerald-500/15',
    activeText: 'text-emerald-300',
    badgeText: 'text-emerald-400',
    badgeBorder: 'border-emerald-400/50',
    badge: '7 TOOLS', 
    hex: '#10b981',
    glow: 'rgba(16, 185, 129, 0.4)'
  },
  { 
    id: 'essentials', 
    label: 'ESSENTIALS', 
    icon: Wrench, 
    color: 'text-orange-400', 
    activeBorder: 'border-orange-400', 
    activeBg: 'bg-orange-500/15',
    activeText: 'text-orange-300',
    badgeText: 'text-orange-400',
    badgeBorder: 'border-orange-400/50',
    badge: '8 TOOLS', 
    hex: '#ff781f',
    glow: 'rgba(255, 120, 31, 0.4)'
  },
  { 
    id: 'measurement', 
    label: 'MEASURE & SENSORS', 
    icon: Gauge, 
    color: 'text-rose-400', 
    activeBorder: 'border-rose-400', 
    activeBg: 'bg-rose-500/15',
    activeText: 'text-rose-300',
    badgeText: 'text-rose-400',
    badgeBorder: 'border-rose-400/50',
    badge: '16 TOOLS', 
    hex: '#f43f5e',
    glow: 'rgba(244, 63, 94, 0.4)'
  },
  { 
    id: 'textTools', 
    label: 'TEXT & CRYPTO', 
    icon: Type, 
    color: 'text-violet-400', 
    activeBorder: 'border-violet-400', 
    activeBg: 'bg-violet-500/15',
    activeText: 'text-violet-300',
    badgeText: 'text-violet-400',
    badgeBorder: 'border-violet-400/50',
    badge: '15 TOOLS', 
    hex: '#8b5cf6',
    glow: 'rgba(139, 92, 246, 0.4)'
  },
  { 
    id: 'media', 
    label: 'MEDIA & AUDIO', 
    icon: Music, 
    color: 'text-fuchsia-400', 
    activeBorder: 'border-fuchsia-400', 
    activeBg: 'bg-fuchsia-500/15',
    activeText: 'text-fuchsia-300',
    badgeText: 'text-fuchsia-400',
    badgeBorder: 'border-fuchsia-400/50',
    badge: '8 TOOLS', 
    hex: '#d946ef',
    glow: 'rgba(217, 70, 239, 0.4)'
  },
  { 
    id: 'deviceInfo', 
    label: 'DEVICE & SYS', 
    icon: Cpu, 
    color: 'text-sky-400', 
    activeBorder: 'border-sky-400', 
    activeBg: 'bg-sky-500/15',
    activeText: 'text-sky-300',
    badgeText: 'text-sky-400',
    badgeBorder: 'border-sky-400/50',
    badge: '14 TOOLS', 
    hex: '#38bdf8',
    glow: 'rgba(56, 189, 248, 0.4)'
  },
  { 
    id: 'games', 
    label: 'ARCADE GAMES', 
    icon: Gamepad2, 
    color: 'text-amber-300', 
    activeBorder: 'border-amber-300', 
    activeBg: 'bg-amber-500/15',
    activeText: 'text-amber-200',
    badgeText: 'text-amber-300',
    badgeBorder: 'border-amber-300/50',
    badge: '18 GAMES', 
    hex: '#fcd34d',
    glow: 'rgba(252, 211, 77, 0.4)'
  },
  { 
    id: 'health', 
    label: 'HEALTH & LIFE', 
    icon: Heart, 
    color: 'text-rose-400', 
    activeBorder: 'border-rose-400', 
    activeBg: 'bg-rose-500/15',
    activeText: 'text-rose-300',
    badgeText: 'text-rose-400',
    badgeBorder: 'border-rose-400/50',
    badge: '8 TOOLS', 
    hex: '#fb7185',
    glow: 'rgba(251, 113, 133, 0.4)'
  },
  { 
    id: 'social', 
    label: 'SOCIAL & WEB', 
    icon: Share2, 
    color: 'text-indigo-400', 
    activeBorder: 'border-indigo-400', 
    activeBg: 'bg-indigo-500/15',
    activeText: 'text-indigo-300',
    badgeText: 'text-indigo-400',
    badgeBorder: 'border-indigo-400/50',
    badge: '8 TOOLS', 
    hex: '#6366f1',
    glow: 'rgba(99, 102, 241, 0.4)'
  },
  { 
    id: 'developer', 
    label: 'DEV & NETWORK', 
    icon: Code, 
    color: 'text-lime-400', 
    activeBorder: 'border-lime-400', 
    activeBg: 'bg-lime-500/15',
    activeText: 'text-lime-300',
    badgeText: 'text-lime-400',
    badgeBorder: 'border-lime-400/50',
    badge: '9 TOOLS', 
    hex: '#84cc16',
    glow: 'rgba(132, 204, 22, 0.4)'
  },
  { 
    id: 'humanBenchmark', 
    label: 'BENCHMARK', 
    icon: Zap, 
    color: 'text-orange-400', 
    activeBorder: 'border-orange-400', 
    activeBg: 'bg-orange-500/15',
    activeText: 'text-orange-300',
    badgeText: 'text-orange-400',
    badgeBorder: 'border-orange-400/50',
    badge: '7 TESTS', 
    hex: '#fb923c',
    glow: 'rgba(251, 146, 60, 0.4)'
  },
];

export default function Navigation({ activeCategory, onSelectCategory }) {
  const scrollContainerRef = useRef(null);
  const activeTabRef = useRef(null);
  const [isGridOpen, setIsGridOpen] = useState(false);

  // Auto-scroll active category pill into center on selection
  useEffect(() => {
    if (activeTabRef.current) {
      activeTabRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      });
    }
  }, [activeCategory]);

  const scrollNav = (direction) => {
    if (!scrollContainerRef.current) return;
    const offset = direction === 'left' ? -240 : 240;
    scrollContainerRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    playClick();
  };

  return (
    <>
      <nav className="border-b border-deck-border bg-deck-surface/70 backdrop-blur-md relative">
        <div className="max-w-7xl mx-auto flex items-center">
          {/* Quick Mobile/Tablet Category Grid Opener */}
          <button
            onClick={() => { playClick(); setIsGridOpen(true); }}
            className="px-2.5 sm:px-3 py-2 bg-deck-surface border-r border-deck-border text-arcade-paper hover:text-arcade-amber flex items-center gap-1.5 shrink-0 z-10 transition-colors"
            title="Open Complete Category Matrix Grid"
          >
            <LayoutGrid className="w-3.5 h-3.5 text-arcade-amber" />
            <span className="font-pixel text-[8px] sm:text-[9px] hidden xs:inline">MATRIX</span>
          </button>

          {/* Left Arrow (Desktop / Tablet) */}
          <button
            onClick={() => scrollNav('left')}
            className="hidden sm:flex px-1.5 py-2 text-arcade-muted hover:text-white shrink-0 items-center justify-center border-r border-deck-border/40"
            title="Scroll Navigation Left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Scrollable Horizontal Pill Track */}
          <div 
            ref={scrollContainerRef}
            className="flex-1 flex items-center gap-1.5 py-2 px-2 overflow-x-auto no-scrollbar touch-scroll"
          >
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;

              return (
                <button
                  key={cat.id}
                  ref={isActive ? activeTabRef : null}
                  onClick={() => {
                    playClick();
                    onSelectCategory(cat.id);
                  }}
                  style={isActive ? { borderColor: cat.hex, boxShadow: `2px 2px 0px ${cat.hex}` } : {}}
                  className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 border font-mono text-xs transition-all shrink-0 select-none ${
                    isActive
                      ? `${cat.activeBg} ${cat.activeText} shadow-pixel-sm active-nav-pill font-bold`
                      : 'bg-deck-bg/70 border-deck-border/80 text-arcade-muted hover:text-white hover:border-deck-borderLight hover:bg-deck-surface'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? cat.color : 'text-arcade-muted'}`} />
                  <span className={`font-pixel text-[8px] sm:text-[9px] tracking-tight whitespace-nowrap ${isActive ? cat.activeText : ''}`}>
                    {cat.label}
                  </span>
                  <span 
                    style={isActive ? { borderColor: cat.hex, color: cat.hex } : {}}
                    className={`badge-pill text-[7px] sm:text-[8px] font-mono px-1 py-0.2 border ${
                      isActive 
                        ? 'bg-deck-dark font-bold' 
                        : 'bg-deck-dark/40 border-deck-border/50 text-deck-borderLight'
                    }`}
                  >
                    {cat.badge}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Right Arrow (Desktop / Tablet) */}
          <button
            onClick={() => scrollNav('right')}
            className="hidden sm:flex px-1.5 py-2 text-arcade-muted hover:text-white shrink-0 items-center justify-center border-l border-deck-border/40"
            title="Scroll Navigation Right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </nav>

      {/* Complete Category Grid Modal Drawer (Perfect for mobile & tablets) */}
      {isGridOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="pixel-card w-full max-w-3xl bg-deck-surface border-2 border-arcade-amber shadow-pixel-lg max-h-[90vh] flex flex-col">
            <div className="pixel-card-header bg-deck-dark border-b-2 border-arcade-amber/60 flex items-center justify-between p-3 sm:p-4">
              <div className="flex items-center gap-2">
                <LayoutGrid className="w-5 h-5 text-arcade-amber" />
                <span className="font-pixel text-xs sm:text-sm text-arcade-amber uppercase">
                  COMPLETE CATEGORIES MATRIX (18 SUITES)
                </span>
              </div>
              <button
                onClick={() => { playClick(); setIsGridOpen(false); }}
                className="p-1 hover:bg-deck-surfaceHover text-arcade-muted hover:text-white border border-transparent hover:border-arcade-coral"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 sm:p-6 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isActive = activeCategory === cat.id;

                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      playClick();
                      onSelectCategory(cat.id);
                      setIsGridOpen(false);
                    }}
                    style={isActive ? { borderColor: cat.hex } : {}}
                    className={`p-3 border text-left flex items-start gap-3 transition-all ${
                      isActive
                        ? `${cat.activeBg} shadow-pixel-sm`
                        : 'bg-deck-bg border-deck-border hover:border-arcade-emerald/60 hover:bg-deck-surface'
                    }`}
                  >
                    <div 
                      style={isActive ? { borderColor: cat.hex, backgroundColor: `${cat.hex}15` } : {}}
                      className="p-2 border border-deck-border bg-deck-surface shrink-0"
                    >
                      <Icon className={`w-5 h-5 ${cat.color}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className={`font-pixel text-[9px] sm:text-[10px] truncate ${isActive ? cat.activeText : 'text-white'}`}>
                          {cat.label}
                        </span>
                        <span 
                          style={isActive ? { borderColor: cat.hex, color: cat.hex } : {}}
                          className="font-mono text-[8px] px-1 py-0.5 bg-deck-dark border border-deck-border shrink-0"
                        >
                          {cat.badge}
                        </span>
                      </div>
                      <p className="text-[10px] text-arcade-muted font-mono mt-0.5 line-clamp-1">
                        Tap to activate suite
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
