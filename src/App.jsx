import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Navigation from './components/Navigation';
import ToolWrapper from './components/ToolWrapper';
import ErrorBoundary from './components/ErrorBoundary';
import CreditsModal from './components/CreditsModal';
import QuickSearchModal from './components/QuickSearchModal';

// Tools
import ImageToolbox from './tools/imageToolbox/ImageToolbox';
import PdfSuite from './tools/pdfSuite/PdfSuite';
import DateTimeTools from './tools/dateTime/DateTimeTools';
import CalculatorTools from './tools/calculators/CalculatorTools';
import FinanceTools from './tools/finance/FinanceTools';
import EssentialTools from './tools/essentials/EssentialTools';
import MeasurementTools from './tools/measurement/MeasurementTools';
import TextTools from './tools/textTools/TextTools';
import MediaTools from './tools/mediaTools/MediaTools';
import DeviceInfoTools from './tools/deviceInfo/DeviceInfoTools';
import GameTools from './tools/games/GameTools';
import HealthTools from './tools/health/HealthTools';
import SocialTools from './tools/social/SocialTools';
import DeveloperTools from './tools/developer/DeveloperTools';
import HumanBenchmark from './tools/humanBenchmark/HumanBenchmark';

import { toggleAudio, playClick, playBeep } from './audio/soundEffects';
import { ALL_TOOLS } from './data/toolsCatalog';

export default function App() {
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeSubTab, setActiveSubTab] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [theme, setTheme] = useState(() => localStorage.getItem('omnideck_theme') || 'dark');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCreditsOpen, setIsCreditsOpen] = useState(false);
  const [isMatrixOpen, setIsMatrixOpen] = useState(true); // Opens Complete Category Matrix Hub by default on load

  // Sync theme with body element & localStorage
  useEffect(() => {
    localStorage.setItem('omnideck_theme', theme);
    if (theme === 'light') {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
  }, [theme]);

  // Sync audio toggle with soundEffects module
  useEffect(() => {
    toggleAudio(soundEnabled);
  }, [soundEnabled]);

  // Global keyboard shortcut: Ctrl+K or '/' opens quick search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey && e.key === 'k') || (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA')) {
        e.preventDefault();
        setIsSearchOpen(true);
        playClick();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSelectToolFromSearch = (tool) => {
    setActiveCategory(tool.categoryId);
    setActiveSubTab(tool.tabId || null);
    setIsMatrixOpen(false);
  };

  return (
    <div className="min-h-screen bg-deck-bg text-slate-100 flex flex-col relative selection:bg-arcade-emerald selection:text-black">
      {/* Main Global Header */}
      <Header
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        theme={theme}
        setTheme={setTheme}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenCredits={() => setIsCreditsOpen(true)}
        onOpenMatrix={() => setIsMatrixOpen(true)}
        activeCategory={activeCategory}
      />

      {/* Category Pills Navigation */}
      <Navigation
        activeCategory={activeCategory}
        onSelectCategory={(catId) => {
          setActiveCategory(catId);
          setActiveSubTab(null);
        }}
        isGridOpen={isMatrixOpen}
        setIsGridOpen={setIsMatrixOpen}
      />

      {/* Dynamic Content Viewport */}
      <main className="flex-1 w-full px-2 sm:px-3 md:px-4 space-y-3 sm:space-y-4">
        <ErrorBoundary onResetToHome={() => { setActiveCategory(null); setIsMatrixOpen(true); }}>
        {/* Fallback state when no category is selected yet and matrix is dismissed */}
        {!activeCategory && (
          <div className="flex flex-col items-center justify-center min-h-[55vh] text-center p-6 border-2 border-dashed border-deck-border bg-deck-surface/40 my-6 max-w-2xl mx-auto animate-fadeIn">
            <div className="w-14 h-14 bg-arcade-amber/10 border-2 border-arcade-amber/50 flex items-center justify-center mb-4 shadow-pixel-sm">
              <span className="font-pixel text-arcade-amber text-xl">⚡</span>
            </div>
            <h2 className="font-pixel text-base sm:text-lg text-white mb-2">
              OMNI//DECK READY // NO SUITE MOUNTED
            </h2>
            <p className="font-mono text-xs text-arcade-muted max-w-md mb-6 leading-relaxed">
              Choose a utility suite from the navigation ribbon above or launch the Complete Categories Matrix.
            </p>
            <button
              onClick={() => { playClick(); setIsMatrixOpen(true); }}
              className="btn-pixel btn-pixel-amber px-5 py-2.5 font-pixel text-xs flex items-center gap-2"
            >
              <span>LAUNCH CATEGORIES MATRIX</span>
            </button>
          </div>
        )}

        {/* 4. IMAGE STUDIO (T8RIN) */}
        {activeCategory === 'imageToolbox' && (
          <ToolWrapper
            categoryId="imageToolbox"
            category="GRAPHICS & MEDIA"
            title="IMAGE TOOLBOX STUDIO // T8RIN"
            description="Compress to WebP/AVIF, crop, grade colors, downsample to 8-bit pixel art, and extract vectorized signatures."
            badge="T8RIN SUITE"
          >
            <ImageToolbox activeSubTool={activeSubTab} />
          </ToolWrapper>
        )}

        {/* 5. PDF SUITE (PaperKnife) */}
        {activeCategory === 'pdfSuite' && (
          <ToolWrapper
            categoryId="pdfSuite"
            category="DOCUMENT MATRIX"
            title="PDF SUITE // PAPERKNIFE"
            description="Merge multiple PDFs, extract page slices, rotate orientations, stamp watermarks, and bundle images into PDF."
            badge="KNIFE SUITE"
          >
            <PdfSuite activeTab={activeSubTab} />
          </ToolWrapper>
        )}

        {/* 6. DATE & TIME */}
        {activeCategory === 'dateTime' && (
          <ToolWrapper
            categoryId="dateTime"
            category="CHRONOMETRY"
            title="DATE, TIME & INTERVAL CHRONO"
            description="Analog & digital matrix clocks, precision stopwatch with laps, Pomodoro focus intervals, and world timezones."
            badge="CHRONO"
          >
            <DateTimeTools activeTab={activeSubTab} />
          </ToolWrapper>
        )}

        {/* 7. CALCULATORS */}
        {activeCategory === 'calculators' && (
          <ToolWrapper
            categoryId="calculators"
            category="MATHEMATICS & GAUGES"
            title="CALCULATORS & STATISTICAL CHARTS"
            description="Scientific calculator, universal unit converter, live ticking age down to seconds, BMI, and pie/bar chart makers."
            badge="MATH DECK"
          >
            <CalculatorTools activeTab={activeSubTab} />
          </ToolWrapper>
        )}

        {/* 8. FINANCE */}
        {activeCategory === 'finance' && (
          <ToolWrapper
            categoryId="finance"
            category="FINANCIAL SUITE"
            title="INVOICE GENERATOR & FINANCIAL CALCULATORS"
            description="Generate client PDF invoices, convert currencies with live rates, compute SIP growth, and track expenses."
            badge="FINANCE"
          >
            <FinanceTools activeTab={activeSubTab} />
          </ToolWrapper>
        )}

        {/* 9. ESSENTIALS */}
        {activeCategory === 'essentials' && (
          <ToolWrapper
            categoryId="essentials"
            category="DAILY UTILITIES"
            title="ESSENTIALS & EMERGENCY TOOLKIT"
            description="Screen strobe torch, CSPRNG password generator, QR code generator, English dictionary, and to-do board."
            badge="ESSENTIALS"
          >
            <EssentialTools activeTab={activeSubTab} />
          </ToolWrapper>
        )}

        {/* 10. MEASUREMENT & SENSORS */}
        {activeCategory === 'measurement' && (
          <ToolWrapper
            categoryId="measurement"
            category="MEASURE & SENSORS"
            title="MEASUREMENT & INSTRUMENTATION"
            description="Calibrated screen ruler with touch calipers, 180° protractor, internet speed benchmark, frequency generator, and BPM tapper."
            badge="MEASURE"
          >
            <MeasurementTools activeTab={activeSubTab} />
          </ToolWrapper>
        )}

        {/* 11. TEXT & CRYPTO */}
        {activeCategory === 'textTools' && (
          <ToolWrapper
            categoryId="textTools"
            category="CRYPTOGRAPHY & STRINGS"
            title="TEXT MATRIX & CIPHER SUITE"
            description="AES-256 encryption, live Markdown previewer, Base64 file encoder, Morse code chirps, and line diff."
            badge="CRYPTO"
          >
            <TextTools activeTab={activeSubTab} />
          </ToolWrapper>
        )}

        {/* 12. MEDIA & AUDIO */}
        {activeCategory === 'media' && (
          <ToolWrapper
            categoryId="media"
            category="AUDIO & CANVAS"
            title="AUDIO SYNTH & CREATIVE STUDIO"
            description="8-bit chiptune synthesizer, pixel canvas drawing board, color palette generator, video frame grabber, and BPM metronome."
            badge="CREATIVE"
          >
            <MediaTools activeTab={activeSubTab} />
          </ToolWrapper>
        )}

        {/* 13. DEVICE INFO & SYS */}
        {activeCategory === 'deviceInfo' && (
          <ToolWrapper
            categoryId="deviceInfo"
            category="DIAGNOSTICS"
            title="HARDWARE SPECS & SPEAKER CLEANER"
            description="Direct GPU/CPU/RAM diagnostics, high-frequency water/dust speaker cleaner, and dead pixel screen tester."
            badge="SYSTEM"
          >
            <DeviceInfoTools activeTab={activeSubTab} />
          </ToolWrapper>
        )}

        {/* 14. ARCADE GAMES */}
        {activeCategory === 'games' && (
          <ToolWrapper
            categoryId="games"
            category="RECREATION"
            title="RETRO 8-BIT ARCADE SUITE"
            description="Play classic Snake with arrow keys, Minesweeper, Pixel Memory Match, Tic Tac Toe, and chance dice roller."
            badge="ARCADE"
          >
            <GameTools activeTab={activeSubTab} />
          </ToolWrapper>
        )}

        {/* 15. HEALTH & LIFE */}
        {activeCategory === 'health' && (
          <ToolWrapper
            categoryId="health"
            category="WELLNESS"
            title="HEALTH, BREATHING & SLEEP CYCLES"
            description="Guided 4-4-4-4 Box Breathing visualizer, daily hydration tracker, and 90-minute REM sleep cycle calculator."
            badge="WELLNESS"
          >
            <HealthTools activeTab={activeSubTab} />
          </ToolWrapper>
        )}

        {/* 16. SOCIAL & WEB */}
        {activeCategory === 'social' && (
          <ToolWrapper
            categoryId="social"
            category="CONNECTIVITY"
            title="SOCIAL & NETWORK UTILITIES"
            description="Direct WhatsApp messenger without saving contacts, Wi-Fi join QR code maker, and social caption generator."
            badge="SOCIAL"
          >
            <SocialTools activeTab={activeSubTab} />
          </ToolWrapper>
        )}

        {/* 17. DEV & NETWORK */}
        {activeCategory === 'developer' && (
          <ToolWrapper
            categoryId="developer"
            category="DEVELOPMENT"
            title="DEVELOPER SANDBOX & NETWORK DECK"
            description="In-browser JavaScript REPL runner, Regex visual tester, CSS shadow generator, JSON formatter, and DNS lookup."
            badge="DEV OPS"
          >
            <DeveloperTools activeTab={activeSubTab} />
          </ToolWrapper>
        )}

        {/* 18. HUMAN BENCHMARK */}
        {activeCategory === 'humanBenchmark' && (
          <ToolWrapper
            categoryId="humanBenchmark"
            category="COGNITIVE TESTING"
            title="HUMAN BENCHMARK COGNITIVE SUITE"
            description="Reaction time milliseconds benchmark, reflex aim trainer, Chimp working memory grid, and typing speed WPM test."
            badge="BENCHMARK"
          >
            <HumanBenchmark activeTab={activeSubTab} />
          </ToolWrapper>
        )}
        </ErrorBoundary>
      </main>

      {/* Modals */}
      <CreditsModal isOpen={isCreditsOpen} onClose={() => setIsCreditsOpen(false)} />
      <QuickSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        tools={ALL_TOOLS}
        onSelectTool={handleSelectToolFromSearch}
      />
    </div>
  );
}
