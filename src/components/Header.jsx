import React, { useState, useEffect } from 'react';
import { 
  Volume2, VolumeX, Monitor, Search, Sparkles, Terminal, 
  Sun, Moon, Radio, Award
} from 'lucide-react';
import { playClick, playBeep } from '../audio/soundEffects';

export default function Header({ 
  scanlines, 
  setScanlines, 
  soundEnabled, 
  setSoundEnabled, 
  theme,
  setTheme,
  onOpenSearch, 
  onOpenCredits,
  activeCategory
}) {
  const [time, setTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="border-b-2 border-deck-border bg-deck-surface/90 backdrop-blur sticky top-0 z-40">
      {/* Top micro ticker */}
      <div className="bg-deck-dark border-b border-deck-border/60 px-4 py-1 flex items-center justify-between text-[11px] font-mono tracking-wider text-arcade-muted">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-arcade-emerald">
            <span className="w-2 h-2 rounded-none bg-arcade-emerald animate-pulse inline-block"></span>
            <span className="font-pixel text-[9px] uppercase tracking-normal">SYSTEM ONLINE // NODE-24.19</span>
          </div>
          <span className="hidden sm:inline-block text-deck-borderLight">|</span>
          <span className="hidden sm:inline-block text-arcade-muted">OMNI-DECK OS v4.2.0</span>
          <span className="hidden md:inline-block text-deck-borderLight">|</span>
          <span className="hidden md:inline-flex items-center gap-1 text-arcade-cyan">
            <Radio className="w-3 h-3 text-arcade-cyan animate-spin" />
            SECURE SANDBOX
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="font-pixel text-[9px] text-arcade-amber">{time}</span>
          <span className="text-deck-borderLight">|</span>
          <button 
            onClick={() => { playClick(); onOpenCredits(); }}
            className="text-[10px] text-arcade-emerald hover:underline font-mono flex items-center gap-1 transition-colors group cursor-pointer"
          >
            <Award className="w-3 h-3 text-arcade-amber group-hover:rotate-12 transition-transform" />
            <span>SYSTEM CREDITS</span>
          </button>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-arcade-emerald flex items-center justify-center border-2 border-black shadow-pixel-sm cursor-pointer hover:bg-emerald-400 transition-colors"
               onClick={() => { playClick(); onOpenCredits(); }}>
            <Terminal className="w-6 h-6 text-deck-dark" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-pixel text-base sm:text-lg tracking-tight text-white">
                OMNI<span className="text-arcade-emerald">//</span>DECK
              </span>
              <span className="hidden sm:inline-block font-mono text-[9px] uppercase px-1.5 py-0.5 bg-deck-surfaceHover text-arcade-amber border border-arcade-amber/40">
                PRO SUITE
              </span>
            </div>
            <p className="text-[11px] text-arcade-muted font-mono leading-tight">
              Modular Cyber Deck & Utilities Matrix
            </p>
          </div>
        </div>

        {/* Center Quick Search Trigger */}
        <button
          onClick={() => { playClick(); onOpenSearch(); }}
          className="hidden md:flex items-center gap-3 bg-deck-bg hover:bg-deck-surfaceHover border-2 border-deck-border hover:border-arcade-emerald px-4 py-1.5 transition-all shadow-pixel-sm text-left group max-w-sm w-full"
        >
          <Search className="w-4 h-4 text-arcade-muted group-hover:text-arcade-emerald transition-colors" />
          <span className="text-xs text-arcade-muted group-hover:text-white flex-1 font-mono">
            Search 130+ tools...
          </span>
          <kbd className="font-pixel text-[8px] bg-deck-surface border border-deck-border px-1.5 py-0.5 text-arcade-amber">
            CTRL+K
          </kbd>
        </button>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => { playClick(); onOpenSearch(); }}
            className="md:hidden p-2 bg-deck-surface border border-deck-border text-arcade-paper hover:border-arcade-emerald"
            title="Search Tools"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Theme Toggle (Light / Dark) */}
          <button
            onClick={() => {
              const next = theme === 'dark' ? 'light' : 'dark';
              setTheme(next);
              playClick();
            }}
            className={`p-2 border transition-all ${
              theme === 'light'
                ? 'bg-amber-100 border-amber-500 text-amber-700 shadow-pixel-sm'
                : 'bg-deck-bg border-deck-border text-arcade-amber'
            }`}
            title={theme === 'dark' ? "Switch to Light Theme" : "Switch to Dark Theme"}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-arcade-amber" /> : <Moon className="w-4 h-4 text-slate-800" />}
          </button>

          {/* Sound Toggle */}
          <button
            onClick={() => {
              const next = !soundEnabled;
              setSoundEnabled(next);
              playBeep(next ? 880 : 220, 0.05);
            }}
            className={`p-2 border transition-all ${
              soundEnabled 
                ? 'bg-deck-surfaceHover border-arcade-emerald text-arcade-emerald shadow-pixel-sm' 
                : 'bg-deck-bg border-deck-border text-arcade-muted'
            }`}
            title={soundEnabled ? "Mute 8-bit Audio" : "Enable 8-bit Audio"}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Scanlines Toggle */}
          <button
            onClick={() => {
              playClick();
              setScanlines(!scanlines);
            }}
            className={`p-2 border transition-all ${
              scanlines 
                ? 'bg-deck-surfaceHover border-arcade-cyan text-arcade-cyan shadow-pixel-sm' 
                : 'bg-deck-bg border-deck-border text-arcade-muted'
            }`}
            title={scanlines ? "Turn Off CRT Scanlines" : "Turn On CRT Scanlines"}
          >
            <Monitor className="w-4 h-4" />
          </button>

          {/* Credits / Manifesto Button */}
          <button
            onClick={() => { playClick(); onOpenCredits(); }}
            className="btn-pixel btn-pixel-amber px-3 py-1.5 text-xs flex items-center gap-1.5 font-pixel text-[10px]"
            title="System Architect & Manifesto"
          >
            <Sparkles className="w-3.5 h-3.5 fill-black" />
            <span>MANIFESTO</span>
          </button>
        </div>
      </div>
    </header>
  );
}
