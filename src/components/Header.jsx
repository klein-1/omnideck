import React, { useState, useEffect } from 'react';
import { 
  Volume2, VolumeX, Monitor, Search, Sparkles, Terminal, 
  Sun, Moon, Radio, Award, Smartphone, Tablet, Laptop
} from 'lucide-react';
import { playClick, playBeep } from '../audio/soundEffects';
import { useScreenProfile } from '../hooks/useScreenProfile';

export default function Header({ 
  scanlines, 
  setScanlines, 
  soundEnabled, 
  setSoundEnabled, 
  theme, 
  setTheme,
  onOpenSearch, 
  onOpenCredits,
  activeCategory,
  viewportSimulation,
  setViewportSimulation
}) {
  const [time, setTime] = useState(new Date().toLocaleTimeString());
  const screen = useScreenProfile();

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="border-b-2 border-deck-border bg-deck-surface/90 backdrop-blur sticky top-0 z-40">
      {/* Top micro ticker */}
      <div className="bg-deck-dark border-b border-deck-border/60 px-3 sm:px-4 py-1 flex items-center justify-between text-[10px] sm:text-[11px] font-mono tracking-wider text-arcade-muted overflow-x-hidden">
        <div className="flex items-center gap-2 sm:gap-4 truncate">
          <div className="flex items-center gap-1.5 text-arcade-emerald shrink-0">
            <span className="w-1.5 h-1.5 rounded-none bg-arcade-emerald animate-pulse inline-block"></span>
            <span className="font-pixel text-[8px] sm:text-[9px] uppercase tracking-normal">SYS ONLINE</span>
          </div>
          <span className="text-deck-borderLight">|</span>
          <span className="font-pixel text-[8px] sm:text-[9px] text-arcade-cyan flex items-center gap-1">
            {screen.isMobile ? <Smartphone className="w-2.5 h-2.5" /> : screen.isTablet ? <Tablet className="w-2.5 h-2.5" /> : <Laptop className="w-2.5 h-2.5" />}
            <span>{screen.label}</span>
            <span className="text-[8px] opacity-70">({screen.width}px)</span>
          </span>
          <span className="hidden md:inline-block text-deck-borderLight">|</span>
          <span className="hidden md:inline-flex items-center gap-1 text-arcade-cyan">
            <Radio className="w-3 h-3 text-arcade-cyan animate-spin" />
            SECURE SANDBOX
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Responsive Viewport Simulator (Desktop only) */}
          {screen.isDesktop && setViewportSimulation && (
            <div className="hidden lg:flex items-center gap-1 bg-deck-bg px-1.5 py-0.5 border border-deck-border text-[9px]">
              <span className="text-[8px] text-arcade-muted mr-1">VIEW:</span>
              <button
                onClick={() => { playClick(); setViewportSimulation('mobile'); }}
                className={`px-1 py-0.5 font-pixel text-[7px] border ${viewportSimulation === 'mobile' ? 'bg-arcade-emerald text-black border-black' : 'text-arcade-muted hover:text-white border-transparent'}`}
                title="Simulate Mobile Viewport (390px)"
              >
                PHONE
              </button>
              <button
                onClick={() => { playClick(); setViewportSimulation('tablet'); }}
                className={`px-1 py-0.5 font-pixel text-[7px] border ${viewportSimulation === 'tablet' ? 'bg-arcade-cyan text-black border-black' : 'text-arcade-muted hover:text-white border-transparent'}`}
                title="Simulate Tablet Viewport (820px)"
              >
                TABLET
              </button>
              <button
                onClick={() => { playClick(); setViewportSimulation('full'); }}
                className={`px-1 py-0.5 font-pixel text-[7px] border ${viewportSimulation === 'full' ? 'bg-arcade-amber text-black border-black' : 'text-arcade-muted hover:text-white border-transparent'}`}
                title="Full Responsive Viewport"
              >
                AUTO
              </button>
            </div>
          )}

          <span className="font-pixel text-[8px] sm:text-[9px] text-arcade-amber">{time}</span>
          <span className="hidden xs:inline text-deck-borderLight">|</span>
          <button 
            onClick={() => { playClick(); onOpenCredits(); }}
            className="hidden xs:flex text-[9px] sm:text-[10px] text-arcade-emerald hover:underline font-mono items-center gap-1 transition-colors group cursor-pointer"
          >
            <Award className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-arcade-amber group-hover:rotate-12 transition-transform" />
            <span>CREDITS</span>
          </button>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand / Logo */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-amber-400 via-rose-500 to-cyan-400 flex items-center justify-center border-2 border-black shadow-pixel-sm cursor-pointer hover:scale-105 transition-transform shrink-0"
               onClick={() => { playClick(); onOpenCredits(); }}>
            <Terminal className="w-4 h-4 sm:w-6 sm:h-6 text-black" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="font-pixel text-sm sm:text-base md:text-lg tracking-tight text-white whitespace-nowrap">
                OMNI<span className="text-arcade-cyan">//</span><span className="text-arcade-amber">DECK</span>
              </span>
              <span className="hidden sm:inline-block font-mono text-[9px] uppercase px-1.5 py-0.5 bg-rose-500/10 text-rose-400 border border-rose-400/50 font-bold">
                PRO MATRIX
              </span>
            </div>
            <p className="hidden xs:block text-[9px] sm:text-[11px] text-arcade-muted font-mono leading-tight whitespace-nowrap">
              Vibrant Multi-Suite Cyber Deck
            </p>
          </div>
        </div>

        {/* Center Quick Search Trigger */}
        <button
          onClick={() => { playClick(); onOpenSearch(); }}
          className="hidden md:flex items-center gap-3 bg-deck-bg hover:bg-deck-surfaceHover border-2 border-deck-border hover:border-arcade-cyan px-4 py-1.5 transition-all shadow-pixel-sm text-left group max-w-sm w-full"
        >
          <Search className="w-4 h-4 text-arcade-muted group-hover:text-arcade-cyan transition-colors" />
          <span className="text-xs text-arcade-muted group-hover:text-white flex-1 font-mono truncate">
            Search 130+ tools...
          </span>
          <kbd className="font-pixel text-[8px] bg-deck-surface border border-arcade-amber/60 px-1.5 py-0.5 text-arcade-amber shrink-0">
            CTRL+K
          </kbd>
        </button>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            onClick={() => { playClick(); onOpenSearch(); }}
            className="md:hidden p-1.5 sm:p-2 bg-deck-surface border border-deck-border text-arcade-cyan hover:border-arcade-cyan flex items-center justify-center"
            title="Search Tools"
          >
            <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>

          {/* Theme Toggle (Light / Dark) */}
          <button
            onClick={() => {
              const next = theme === 'dark' ? 'light' : 'dark';
              setTheme(next);
              playClick();
            }}
            className={`p-1.5 sm:p-2 border transition-all flex items-center justify-center ${
              theme === 'light'
                ? 'bg-amber-100 border-amber-500 text-amber-700 shadow-pixel-sm'
                : 'bg-deck-bg border-deck-border text-arcade-amber'
            }`}
            title={theme === 'dark' ? "Switch to Light Theme" : "Switch to Dark Theme"}
          >
            {theme === 'dark' ? <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-arcade-amber" /> : <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-800" />}
          </button>

          {/* Sound Toggle */}
          <button
            onClick={() => {
              const next = !soundEnabled;
              setSoundEnabled(next);
              playBeep(next ? 880 : 220, 0.05);
            }}
            className={`p-1.5 sm:p-2 border transition-all flex items-center justify-center ${
              soundEnabled 
                ? 'bg-deck-surfaceHover border-arcade-emerald text-arcade-emerald shadow-pixel-sm' 
                : 'bg-deck-bg border-deck-border text-arcade-muted'
            }`}
            title={soundEnabled ? "Mute 8-bit Audio" : "Enable 8-bit Audio"}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
          </button>

          {/* Scanlines Toggle */}
          <button
            onClick={() => {
              playClick();
              setScanlines(!scanlines);
            }}
            className={`p-1.5 sm:p-2 border transition-all flex items-center justify-center ${
              scanlines 
                ? 'bg-deck-surfaceHover border-arcade-cyan text-arcade-cyan shadow-pixel-sm' 
                : 'bg-deck-bg border-deck-border text-arcade-muted'
            }`}
            title={scanlines ? "Turn Off CRT Scanlines" : "Turn On CRT Scanlines"}
          >
            <Monitor className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>

          {/* Credits / Manifesto Button */}
          <button
            onClick={() => { playClick(); onOpenCredits(); }}
            className="btn-pixel btn-pixel-amber px-2 sm:px-3 py-1.5 text-xs flex items-center gap-1 sm:gap-1.5 font-pixel text-[9px] sm:text-[10px]"
            title="System Architect & Manifesto"
          >
            <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-black shrink-0" />
            <span className="hidden sm:inline">MANIFESTO</span>
          </button>
        </div>
      </div>
    </header>
  );
}
