import React from 'react';
import { X, Award, Terminal, Heart, Cpu, ShieldCheck, Sparkles, Code2, Globe } from 'lucide-react';
import { playClick, playCoin } from '../audio/soundEffects';

export default function CreditsModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="pixel-card w-full max-w-xl bg-deck-surface border-2 border-arcade-amber shadow-pixel-lg">
        {/* Modal Header */}
        <div className="pixel-card-header bg-deck-dark border-b-2 border-arcade-amber/60">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-arcade-amber" />
            <span className="font-pixel text-xs text-arcade-amber uppercase tracking-wider">
              SYSTEM ARCHITECT // MANIFESTO
            </span>
          </div>
          <button
            onClick={() => { playClick(); onClose(); }}
            className="p-1 hover:bg-deck-surfaceHover text-arcade-muted hover:text-white border border-transparent hover:border-arcade-coral"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 font-mono text-sm">
          {/* Hero Profile Badge */}
          <div className="flex flex-col sm:flex-row items-center gap-5 p-4 bg-deck-bg border-2 border-deck-border">
            <div className="relative">
              {/* Pixel Avatar Frame */}
              <div className="w-20 h-20 bg-deck-surface border-2 border-arcade-emerald flex items-center justify-center shadow-pixel-emerald">
                <Terminal className="w-10 h-10 text-arcade-emerald animate-pulse" />
              </div>
              <div className="absolute -bottom-2 -right-2 bg-arcade-amber text-black font-pixel text-[8px] px-1.5 py-0.5 border border-black">
                DEV
              </div>
            </div>

            <div className="text-center sm:text-left space-y-1">
              <span className="font-pixel text-[9px] text-arcade-cyan tracking-widest uppercase">
                CREATED & CRAFTED BY
              </span>
              <h2 className="font-pixel text-xl sm:text-2xl text-white tracking-tight text-glow-amber">
                HATIM MUSHTAQ
              </h2>
              <p className="text-xs text-arcade-muted">
                Visionary Developer & Digital Typographic Architect
              </p>
            </div>
          </div>

          {/* Description & Manifesto */}
          <div className="space-y-3 text-xs leading-relaxed text-slate-300 bg-deck-dark/60 p-4 border border-deck-border">
            <p className="flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-arcade-amber shrink-0 mt-0.5" />
              <span>
                <strong className="text-arcade-amber">OMNI-DECK</strong> is an unapologetic, high-density cybernetic utility suite engineered without shortcuts. Designed from the ground up to synthesize media downloading, cryptographic auditing, local web servers, visual graphics processing, and 100+ native utilities under one tactile, pixel-crafted aesthetic.
              </span>
            </p>
            <p className="flex items-start gap-2">
              <Code2 className="w-4 h-4 text-arcade-emerald shrink-0 mt-0.5" />
              <span>
                Pure craft, zero sterile generic AI-templates. Built with respect for Swiss typography, retro arcade responsiveness, and modern web engineering.
              </span>
            </p>
          </div>

          {/* Specs Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
            <div className="p-2.5 bg-deck-bg border border-deck-border">
              <div className="text-arcade-muted text-[10px]">CORE ARCHITECTURE</div>
              <div className="text-arcade-emerald font-bold">Node.js 24 + React 18</div>
            </div>
            <div className="p-2.5 bg-deck-bg border border-deck-border">
              <div className="text-arcade-muted text-[10px]">DOWNLOAD ENGINE</div>
              <div className="text-arcade-cyan font-bold">yt-dlp + Stream Sync</div>
            </div>
            <div className="p-2.5 bg-deck-bg border border-deck-border">
              <div className="text-arcade-muted text-[10px]">LOCAL SERVER</div>
              <div className="text-arcade-amber font-bold">SHTTPS + SSL Forge</div>
            </div>
            <div className="p-2.5 bg-deck-bg border border-deck-border">
              <div className="text-arcade-muted text-[10px]">TOTAL UTILITIES</div>
              <div className="text-arcade-coral font-bold">120+ Modules</div>
            </div>
            <div className="p-2.5 bg-deck-bg border border-deck-border">
              <div className="text-arcade-muted text-[10px]">DESIGN MOTIF</div>
              <div className="text-arcade-paper font-bold">Pixel Modernist</div>
            </div>
            <div className="p-2.5 bg-deck-bg border border-deck-border">
              <div className="text-arcade-muted text-[10px]">AUTHENTICITY</div>
              <div className="text-arcade-emerald font-bold">100% Hand-Crafted</div>
            </div>
          </div>

          {/* Interactive Button */}
          <div className="pt-2 flex justify-between items-center">
            <button
              onClick={() => { playCoin(); }}
              className="btn-pixel btn-pixel-amber px-4 py-2 text-xs font-pixel flex items-center gap-2"
            >
              <Heart className="w-3.5 h-3.5 fill-black" />
              TOSS A COIN
            </button>

            <button
              onClick={() => { playClick(); onClose(); }}
              className="btn-pixel btn-pixel-surface px-5 py-2 text-xs font-pixel"
            >
              CLOSE [ESC]
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

