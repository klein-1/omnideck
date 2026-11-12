import React, { useRef, useEffect, useState } from 'react';
import { 
  Download, Shield, Server, Image, FileText, Clock, 
  Calculator, DollarSign, Wrench, Gauge, Type, Music, 
  Cpu, Gamepad2, Heart, Share2, Code, Zap, LayoutGrid, X,
  ChevronLeft, ChevronRight
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
      <nav className="border-b border-deck-border bg-deck-surface/60 relative">
        <div className="max-w-7xl mx-auto flex items-center">
          {/* Quick Mobile/Tablet Category Grid Opener */}
          <button
            onClick={() => { playClick(); setIsGridOpen(true); }}
            className="px-2.5 sm:px-3 py-2 bg-deck-surface border-r border-deck-border text-arcade-paper hover:text-arcade-emerald flex items-center gap-1.5 shrink-0 z-10 transition-colors"
            title="Open Complete Category Matrix Grid"
          >
            <LayoutGrid className="w-3.5 h-3.5 text-arcade-emerald" />
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
                  className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 border font-mono text-xs transition-all shrink-0 select-none ${
                    isActive
                      ? 'bg-deck-surfaceHover border-arcade-emerald text-white shadow-pixel-sm active-nav-pill font-bold'
                      : 'bg-deck-bg/70 border-deck-border/80 text-arcade-muted hover:text-white hover:border-deck-borderLight hover:bg-deck-surface'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? cat.color : 'text-arcade-muted'}`} />
                  <span className={`font-pixel text-[8px] sm:text-[9px] tracking-tight whitespace-nowrap ${isActive ? 'text-white' : ''}`}>
                    {cat.label}
                  </span>
                  <span className={`badge-pill text-[7px] sm:text-[8px] font-mono px-1 py-0.2 border ${
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="pixel-card w-full max-w-3xl bg-deck-surface border-2 border-arcade-emerald shadow-pixel-lg max-h-[90vh] flex flex-col">
            <div className="pixel-card-header bg-deck-dark border-b-2 border-arcade-emerald/60 flex items-center justify-between p-3 sm:p-4">
              <div className="flex items-center gap-2">
                <LayoutGrid className="w-5 h-5 text-arcade-emerald" />
                <span className="font-pixel text-xs sm:text-sm text-arcade-emerald uppercase">
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
                    className={`p-3 border text-left flex items-start gap-3 transition-all ${
                      isActive
                        ? 'bg-deck-dark border-arcade-emerald shadow-pixel-sm'
                        : 'bg-deck-bg border-deck-border hover:border-arcade-emerald/60 hover:bg-deck-surface'
                    }`}
                  >
                    <div className={`p-2 border border-deck-border bg-deck-surface shrink-0 ${isActive ? 'border-arcade-emerald' : ''}`}>
                      <Icon className={`w-5 h-5 ${cat.color}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className={`font-pixel text-[9px] sm:text-[10px] truncate ${isActive ? 'text-arcade-emerald' : 'text-white'}`}>
                          {cat.label}
                        </span>
                        <span className="font-mono text-[8px] px-1 py-0.5 bg-deck-dark text-arcade-amber border border-deck-border shrink-0">
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
