import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Navigation from './components/Navigation';
import ToolWrapper from './components/ToolWrapper';
import CreditsModal from './components/CreditsModal';
import QuickSearchModal from './components/QuickSearchModal';

// Tools
import UniversalDownloader from './tools/downloader/UniversalDownloader';
import SafeUrlChecker from './tools/urlChecker/SafeUrlChecker';
import ShttpsHost from './tools/shttps/ShttpsHost';
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

// Catalog of searchable tools
const ALL_TOOLS = [
  { id: 'downloader_main', categoryId: 'downloader', category: 'DOWNLOADER', name: 'Universal Downloader (Seal Style)', description: 'Download 4K video/audio from YouTube, X, Instagram, TikTok with custom flags' },
  { id: 'downloader_spotify', categoryId: 'downloader', category: 'DOWNLOADER', name: 'Spotify Music Stream Downloader', description: 'Search & download high-bitrate music tracks and playlists with cover art' },
  { id: 'url_checker', categoryId: 'urlChecker', category: 'URL CHECKER', name: 'Safe URL Checker & Unshortener', description: 'Trace redirect hops, inspect SSL certs, evaluate phishing threats & clean tracking' },
  { id: 'shttps_server', categoryId: 'shttps', category: 'LOCAL SHTTPS', name: 'Local HTTPS/HTTP Server Host', description: 'Spawn local SSL/TLS servers, browse folders, upload files, LAN mobile QR code' },
  { id: 'image_compress', categoryId: 'imageToolbox', category: 'IMAGE STUDIO', name: 'Image Compressor & Converter', description: 'WebP, AVIF, JPEG, PNG optimizer with side-by-side comparison' },
  { id: 'image_pixel', categoryId: 'imageToolbox', category: 'IMAGE STUDIO', name: '8-Bit Pixel Art Generator', description: 'Convert images to authentic retro NES, GameBoy, and Cyberpunk pixel palettes' },
  { id: 'image_bg', categoryId: 'imageToolbox', category: 'IMAGE STUDIO', name: 'Background Remover & Alpha Eraser', description: 'Remove backgrounds and isolate silhouettes locally in browser' },
  { id: 'image_sig', categoryId: 'imageToolbox', category: 'IMAGE STUDIO', name: 'Vector Signature Maker', description: 'Draw transparent ink signature and export high-res PNG' },
  { id: 'pdf_merge', categoryId: 'pdfSuite', category: 'PDF SUITE', name: 'PDF Merge & Combine', description: 'Drag, drop, and bind multiple PDF files into one document' },
  { id: 'pdf_split', categoryId: 'pdfSuite', category: 'PDF SUITE', name: 'PDF Split & Page Extractor', description: 'Extract specific page ranges from any PDF document' },
  { id: 'pdf_watermark', categoryId: 'pdfSuite', category: 'PDF SUITE', name: 'PDF Watermark Stamp', description: 'Stamp custom diagonal security watermarks on all pages' },
  { id: 'pdf_img', categoryId: 'pdfSuite', category: 'PDF SUITE', name: 'Images to PDF Converter', description: 'Combine PNG and JPG pictures into formatted PDF' },
  { id: 'dt_clocks', categoryId: 'dateTime', category: 'DATE & TIME', name: 'Analog & Digital CRT Clocks', description: 'Real-time 7-segment digital display and smooth SVG analog chronometer' },
  { id: 'dt_epoch', categoryId: 'dateTime', category: 'DATE & TIME', name: 'Unix Epoch Timestamp Converter', description: 'Convert Unix seconds/milliseconds to human date & relative time' },
  { id: 'dt_stopwatch', categoryId: 'dateTime', category: 'DATE & TIME', name: 'Precision Stopwatch & Laps', description: 'Millisecond timer with lap recorder and split intervals' },
  { id: 'dt_pomodoro', categoryId: 'dateTime', category: 'DATE & TIME', name: 'Pomodoro Focus Intervals', description: '25m focus and 5m break work timer with 8-bit bell notifications' },
  { id: 'dt_tally', categoryId: 'dateTime', category: 'DATE & TIME', name: 'Tactile Tally Counter', description: 'Digital step counter with tap sounds and variable step sizes' },
  { id: 'calc_sci', categoryId: 'calculators', category: 'CALCULATORS', name: 'Full Scientific Calculator', description: 'Advanced trigonometry, logarithmic, radicals, and constant symbols' },
  { id: 'calc_units', categoryId: 'calculators', category: 'CALCULATORS', name: 'Universal Unit Converter', description: 'Convert length, weight, speed, temperature, and digital storage data' },
  { id: 'calc_tip', categoryId: 'calculators', category: 'CALCULATORS', name: 'Tip & Bill Split Calculator', description: 'Calculate tip percentage, per-person total, and bill rounding' },
  { id: 'calc_loan', categoryId: 'calculators', category: 'CALCULATORS', name: 'Loan & Mortgage Amortization', description: 'Estimate monthly payments, compound interest, and loan cost' },
  { id: 'calc_age', categoryId: 'calculators', category: 'CALCULATORS', name: 'Exact Live Age Calculator', description: 'Ticking age calculation down to the exact second lived' },
  { id: 'calc_bmi', categoryId: 'calculators', category: 'CALCULATORS', name: 'BMI Health Calculator', description: 'Body Mass Index gauge with metric and imperial units' },
  { id: 'calc_charts', categoryId: 'calculators', category: 'CALCULATORS', name: 'Pie & Bar Chart Maker', description: 'Enter labels and data values to generate downloadable visual charts' },
  { id: 'fin_invoice', categoryId: 'finance', category: 'FINANCE', name: 'Professional Invoice Generator', description: 'Create itemized client invoices and export printable PDFs' },
  { id: 'fin_currency', categoryId: 'finance', category: 'FINANCE', name: 'Live Currency Converter', description: 'Instant exchange rate calculator for USD, EUR, GBP, JPY, INR, CAD, etc.' },
  { id: 'fin_sip', categoryId: 'finance', category: 'FINANCE', name: 'Mutual Funds & SIP Calculator', description: 'Compound wealth growth forecaster for monthly investments' },
  { id: 'fin_emi', categoryId: 'finance', category: 'FINANCE', name: 'Loan & EMI Amortization Calc', description: 'Calculate monthly loan installments, total interest, and tenure' },
  { id: 'ess_flashlight', categoryId: 'essentials', category: 'ESSENTIALS', name: 'Screen Flashlight & Strobe Beacon', description: 'Ultra-bright display torch with solid, strobe, and SOS Morse modes' },
  { id: 'ess_passgen', categoryId: 'essentials', category: 'ESSENTIALS', name: 'CSPRNG & Diceware Password Generator', description: 'Cryptographically secure password & memorable passphrase generator with entropy score' },
  { id: 'ess_qr', categoryId: 'essentials', category: 'ESSENTIALS', name: 'QR Code Generator', description: 'Generate high-contrast scannable QR codes for links and text' },
  { id: 'ess_notes', categoryId: 'essentials', category: 'ESSENTIALS', name: 'Autosave Quick Notes', description: 'Markdown scratchpad with word counter and local storage memory' },
  { id: 'meas_ruler', categoryId: 'measurement', category: 'MEASURE & SENSORS', name: 'Calibrated Screen Ruler', description: 'On-screen caliper measurement in centimeters and inches' },
  { id: 'meas_level', categoryId: 'measurement', category: 'MEASURE & SENSORS', name: '2-Axis Spirit Level', description: 'Gyroscope and orientation bubble level indicator' },
  { id: 'meas_speed', categoryId: 'measurement', category: 'MEASURE & SENSORS', name: 'Authentic Internet Bandwidth Benchmark', description: 'Real packet ping/jitter, live chunk download Mbps and binary upload speed test' },
  { id: 'meas_decibel', categoryId: 'measurement', category: 'MEASURE & SENSORS', name: 'Acoustic Decibel Sound Meter', description: 'Real microphone sound pressure and dB noise level monitor' },
  { id: 'txt_crypto', categoryId: 'textTools', category: 'TEXT & CRYPTO', name: 'AES-256 Text Encryption', description: 'Cryptographic encryption and decryption with custom secret key' },
  { id: 'txt_markdown', categoryId: 'textTools', category: 'TEXT & CRYPTO', name: 'Markdown Live Previewer', description: 'Split-screen live Markdown editor with instant HTML formatting' },
  { id: 'txt_base64', categoryId: 'textTools', category: 'TEXT & CRYPTO', name: 'File & Image to Base64', description: 'Encode any file or image into clean Base64 data URI string' },
  { id: 'txt_morse', categoryId: 'textTools', category: 'TEXT & CRYPTO', name: 'Morse Code & Audio Chirps', description: 'Translate text to Morse code with playable synthesized beeps' },
  { id: 'txt_diff', categoryId: 'textTools', category: 'TEXT & CRYPTO', name: 'Text Diff Comparator', description: 'Compare two text snippets side-by-side with color-coded diff' },
  { id: 'dev_fps', categoryId: 'deviceInfo', category: 'DEVICE & SYS', name: 'Screen Refresh Rate (FPS) Monitor', description: 'Real-time display refresh rate benchmark and frame jitter' },
  { id: 'dev_audio', categoryId: 'deviceInfo', category: 'DEVICE & SYS', name: 'Stereo Audio Channel Diagnostics', description: 'Left/Right speaker isolation, balance, and phase tests' },
  { id: 'dev_kb', categoryId: 'deviceInfo', category: 'DEVICE & SYS', name: 'Keyboard Rollover & Key Code Matrix', description: 'Interactive virtual key codes, modifiers, and anti-ghosting test' },
  { id: 'dev_storage', categoryId: 'deviceInfo', category: 'DEVICE & SYS', name: 'Storage & Disk Quota Analyzer', description: 'Inspect browser disk quota, cache, and indexedDB space' },
  { id: 'dev_cleaner', categoryId: 'deviceInfo', category: 'DEVICE & SYS', name: 'Speaker Water & Dust Cleaner', description: 'Plays 165Hz acoustic wave pulses to dislodge trapped water droplets' },
  { id: 'dev_pixel', categoryId: 'deviceInfo', category: 'DEVICE & SYS', name: 'Dead Pixel Screen Tester', description: 'Fullscreen RGBW color cycler to identify stuck monitor pixels' },
  { id: 'game_snake', categoryId: 'games', category: 'ARCADE GAMES', name: 'Retro 8-Bit Snake Game', description: 'Classic arcade snake game on canvas with score tally' },
  { id: 'game_minesweeper', categoryId: 'games', category: 'ARCADE GAMES', name: 'Classic Minesweeper', description: 'Defuse 10 mines on a 9x9 grid with flags and flood-fill reveals' },
  { id: 'game_memory', categoryId: 'games', category: 'ARCADE GAMES', name: 'Pixel Memory Card Match', description: '16-card flip and match game with moves counter and sound effects' },
  { id: 'game_ttt', categoryId: 'games', category: 'ARCADE GAMES', name: 'Tic Tac Toe Game', description: 'Tactile grid board with win detection and score tracking' },
  { id: 'health_breathe', categoryId: 'health', category: 'HEALTH & LIFE', name: 'Box Breathing Relaxer (4-4-4-4)', description: 'Guided expanding visual breath pacer to reduce stress' },
  { id: 'health_water', categoryId: 'health', category: 'HEALTH & LIFE', name: 'Daily Hydration Tracker', description: 'Log daily glasses of water toward 2.5L goal' },
  { id: 'soc_whatsapp', categoryId: 'social', category: 'SOCIAL & WEB', name: 'WhatsApp Direct Chat', description: 'Initiate WhatsApp messages without saving phone numbers to contacts' },
  { id: 'soc_wifi', categoryId: 'social', category: 'SOCIAL & WEB', name: 'Instant Wi-Fi Access QR Code', description: 'Generate scannable QR codes for seamless guest Wi-Fi join' },
  { id: 'dev_sandbox', categoryId: 'developer', category: 'DEV & NETWORK', name: 'In-Browser JavaScript Sandbox', description: 'Node.js VM code runner with console output capture' },
  { id: 'dev_regex', categoryId: 'developer', category: 'DEV & NETWORK', name: 'Regex Visual Tester', description: 'Test regular expressions with flags, match lists, and presets' },
  { id: 'dev_css', categoryId: 'developer', category: 'DEV & NETWORK', name: 'CSS Box Shadow Generator', description: 'Visual box-shadow generator with live preview and code export' },
  { id: 'dev_color', categoryId: 'developer', category: 'DEV & NETWORK', name: 'Color & WCAG Contrast Checker', description: 'HEX, RGB, HSL converter with WCAG 2.1 AA/AAA contrast ratios' },
  { id: 'dev_curl', categoryId: 'developer', category: 'DEV & NETWORK', name: 'Curl & HTTP Request Builder', description: 'Generate Curl, Fetch, and Python requests snippets' },
  { id: 'dev_dns', categoryId: 'developer', category: 'DEV & NETWORK', name: 'Live DNS Lookup', description: 'Query A, MX, and TXT DNS records for any domain' },
  { id: 'bench_reaction', categoryId: 'humanBenchmark', category: 'BENCHMARK', name: 'Reaction Time Test', description: 'Millisecond reaction speed test with average score tracking' },
  { id: 'bench_aim', categoryId: 'humanBenchmark', category: 'BENCHMARK', name: 'Aim & Reflex Target Trainer', description: 'Click 30 targets rapidly to measure hand-eye coordination' },
  { id: 'bench_typing', categoryId: 'humanBenchmark', category: 'BENCHMARK', name: '60-Second Typing Speed Test', description: 'Calculate live words per minute (WPM) with accuracy tracking' },
];

export default function App() {
  const [activeCategory, setActiveCategory] = useState('downloader');
  const [scanlines, setScanlines] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [theme, setTheme] = useState(() => localStorage.getItem('omnideck_theme') || 'dark');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCreditsOpen, setIsCreditsOpen] = useState(false);
  const [viewportSimulation, setViewportSimulation] = useState('full'); // 'full' | 'mobile' | 'tablet'

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
  };

  return (
    <div className="min-h-screen bg-deck-bg text-slate-100 flex flex-col relative selection:bg-arcade-emerald selection:text-black">
      {/* Optional CRT Scanlines Layer */}
      {scanlines && <div className="scanlines-overlay" />}

      {/* Main Global Header */}
      <Header
        scanlines={scanlines}
        setScanlines={setScanlines}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        theme={theme}
        setTheme={setTheme}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenCredits={() => setIsCreditsOpen(true)}
        activeCategory={activeCategory}
        viewportSimulation={viewportSimulation}
        setViewportSimulation={setViewportSimulation}
      />

      {/* Category Pills Navigation */}
      <Navigation
        activeCategory={activeCategory}
        onSelectCategory={(catId) => setActiveCategory(catId)}
      />

      {/* Dynamic Content Viewport */}
      <main className={`flex-1 max-w-7xl w-full mx-auto p-2.5 sm:p-4 md:p-6 space-y-4 sm:space-y-6 transition-all duration-300 ${
        viewportSimulation === 'mobile' ? 'viewport-simulate-mobile' : viewportSimulation === 'tablet' ? 'viewport-simulate-tablet' : ''
      }`}>
        {/* 1. UNIVERSAL DOWNLOADER */}
        {activeCategory === 'downloader' && (
          <ToolWrapper
            category="UNIVERSAL DOWNLOADER"
            title="SEAL & SPOTIFY STREAM ARCHIVER"
            description="Download pristine 4K video, audio extractions, and Spotify playlists with SponsorBlock & ID3 metadata embedding."
            badge="SEAL // SPOTDL"
          >
            <UniversalDownloader />
          </ToolWrapper>
        )}

        {/* 2. SAFE URL CHECKER */}
        {activeCategory === 'urlChecker' && (
          <ToolWrapper
            category="CYBER SECURITY"
            title="SAFE URL AUDIT & UNSHORTENER"
            description="Trace redirect hops, analyze SSL certificates, verify DNS records, and strip surveillance trackers."
            badge="THREAT AUDITOR"
          >
            <SafeUrlChecker />
          </ToolWrapper>
        )}

        {/* 3. SHTTPS LOCAL SERVER */}
        {activeCategory === 'shttps' && (
          <ToolWrapper
            category="LOCAL INFRASTRUCTURE"
            title="SHTTPS // LOCAL SSL/TLS SERVER DECK"
            description="Spawn secure HTTPS or HTTP servers on any local port with auto-generated certificates and mobile LAN QR access."
            badge="SHTTPS CORE"
          >
            <ShttpsHost />
          </ToolWrapper>
        )}

        {/* 4. IMAGE STUDIO (T8RIN) */}
        {activeCategory === 'imageToolbox' && (
          <ToolWrapper
            category="GRAPHICS & MEDIA"
            title="IMAGE TOOLBOX STUDIO // T8RIN"
            description="Compress to WebP/AVIF, crop, grade colors, downsample to 8-bit pixel art, and extract vectorized signatures."
            badge="T8RIN SUITE"
          >
            <ImageToolbox />
          </ToolWrapper>
        )}

        {/* 5. PDF SUITE (PaperKnife) */}
        {activeCategory === 'pdfSuite' && (
          <ToolWrapper
            category="DOCUMENT MATRIX"
            title="PDF SUITE // PAPERKNIFE"
            description="Merge multiple PDFs, extract page slices, rotate orientations, stamp watermarks, and bundle images into PDF."
            badge="KNIFE SUITE"
          >
            <PdfSuite />
          </ToolWrapper>
        )}

        {/* 6. DATE & TIME */}
        {activeCategory === 'dateTime' && (
          <ToolWrapper
            category="CHRONOMETRY"
            title="DATE, TIME & INTERVAL CHRONO"
            description="Analog & digital matrix clocks, precision stopwatch with laps, Pomodoro focus intervals, and world timezones."
            badge="CHRONO"
          >
            <DateTimeTools />
          </ToolWrapper>
        )}

        {/* 7. CALCULATORS */}
        {activeCategory === 'calculators' && (
          <ToolWrapper
            category="MATHEMATICS & GAUGES"
            title="CALCULATORS & STATISTICAL CHARTS"
            description="Scientific calculator, universal unit converter, live ticking age down to seconds, BMI, and pie/bar chart makers."
            badge="MATH DECK"
          >
            <CalculatorTools />
          </ToolWrapper>
        )}

        {/* 8. FINANCE */}
        {activeCategory === 'finance' && (
          <ToolWrapper
            category="FINANCIAL SUITE"
            title="INVOICE GENERATOR & FINANCIAL CALCULATORS"
            description="Generate client PDF invoices, convert currencies with live rates, compute SIP growth, and track expenses."
            badge="FINANCE"
          >
            <FinanceTools />
          </ToolWrapper>
        )}

        {/* 9. ESSENTIALS */}
        {activeCategory === 'essentials' && (
          <ToolWrapper
            category="DAILY UTILITIES"
            title="ESSENTIALS & EMERGENCY TOOLKIT"
            description="Screen strobe torch, CSPRNG password generator, QR code generator, English dictionary, and to-do board."
            badge="ESSENTIALS"
          >
            <EssentialTools />
          </ToolWrapper>
        )}

        {/* 10. MEASUREMENT & SENSORS */}
        {activeCategory === 'measurement' && (
          <ToolWrapper
            category="HARDWARE SENSORS"
            title="MEASUREMENT & INSTRUMENTATION"
            description="Calibrated screen ruler, 180° protractor, spirit bubble level, internet speedometer, decibel meter, and audio oscillator."
            badge="SENSORS"
          >
            <MeasurementTools />
          </ToolWrapper>
        )}

        {/* 11. TEXT & CRYPTO */}
        {activeCategory === 'textTools' && (
          <ToolWrapper
            category="CRYPTOGRAPHY & STRINGS"
            title="TEXT MATRIX & CIPHER SUITE"
            description="AES-256 encryption, live Markdown previewer, Base64 file encoder, Morse code chirps, and line diff."
            badge="CRYPTO"
          >
            <TextTools />
          </ToolWrapper>
        )}

        {/* 12. MEDIA & AUDIO */}
        {activeCategory === 'media' && (
          <ToolWrapper
            category="AUDIO & CANVAS"
            title="MEDIA CREATION & RECORDING STUDIO"
            description="Direct microphone WAV audio recorder and cyber pixel drawing board with palette controls."
            badge="MEDIA"
          >
            <MediaTools />
          </ToolWrapper>
        )}

        {/* 13. DEVICE INFO & SYS */}
        {activeCategory === 'deviceInfo' && (
          <ToolWrapper
            category="DIAGNOSTICS"
            title="HARDWARE SPECS & SPEAKER CLEANER"
            description="Direct GPU/CPU/RAM diagnostics, high-frequency water/dust speaker cleaner, and dead pixel screen tester."
            badge="SYSTEM"
          >
            <DeviceInfoTools />
          </ToolWrapper>
        )}

        {/* 14. ARCADE GAMES */}
        {activeCategory === 'games' && (
          <ToolWrapper
            category="RECREATION"
            title="RETRO 8-BIT ARCADE SUITE"
            description="Play classic Snake with arrow keys, Minesweeper, Pixel Memory Match, Tic Tac Toe, and chance dice roller."
            badge="ARCADE"
          >
            <GameTools />
          </ToolWrapper>
        )}

        {/* 15. HEALTH & LIFE */}
        {activeCategory === 'health' && (
          <ToolWrapper
            category="WELLNESS"
            title="HEALTH, BREATHING & SLEEP CYCLES"
            description="Guided 4-4-4-4 Box Breathing visualizer, daily hydration tracker, and 90-minute REM sleep cycle calculator."
            badge="WELLNESS"
          >
            <HealthTools />
          </ToolWrapper>
        )}

        {/* 16. SOCIAL & WEB */}
        {activeCategory === 'social' && (
          <ToolWrapper
            category="CONNECTIVITY"
            title="SOCIAL & NETWORK UTILITIES"
            description="Direct WhatsApp messenger without saving contacts, Wi-Fi join QR code maker, and social caption generator."
            badge="SOCIAL"
          >
            <SocialTools />
          </ToolWrapper>
        )}

        {/* 17. DEV & NETWORK */}
        {activeCategory === 'developer' && (
          <ToolWrapper
            category="DEVELOPMENT"
            title="DEVELOPER SANDBOX & NETWORK DECK"
            description="In-browser JavaScript REPL runner, Regex visual tester, CSS shadow generator, JSON formatter, and DNS lookup."
            badge="DEV OPS"
          >
            <DeveloperTools />
          </ToolWrapper>
        )}

        {/* 18. HUMAN BENCHMARK */}
        {activeCategory === 'humanBenchmark' && (
          <ToolWrapper
            category="COGNITIVE TESTING"
            title="HUMAN BENCHMARK COGNITIVE SUITE"
            description="Reaction time milliseconds benchmark, reflex aim trainer, Chimp working memory grid, and typing speed WPM test."
            badge="BENCHMARK"
          >
            <HumanBenchmark />
          </ToolWrapper>
        )}
      </main>

      {/* Prominent Typographic Footer */}
      <footer className="border-t-2 border-deck-border bg-deck-surface py-6 px-4 mt-12 font-mono text-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-arcade-emerald border border-black flex items-center justify-center font-pixel text-[10px] text-black font-bold">
              OD
            </div>
            <div>
              <span className="font-pixel text-[10px]">
                OMNI<span className="text-arcade-emerald">//</span>DECK CYBER-SUITE
              </span>
              <p className="text-[10px] text-arcade-muted">
                130+ Integrated Offline-First Utilities & Tools Matrix
              </p>
            </div>
          </div>

          {/* Credits & Manifesto Trigger */}
          <button
            onClick={() => { playClick(); setIsCreditsOpen(true); }}
            className="btn-pixel btn-pixel-amber px-4 py-2 font-pixel text-[10px] flex items-center gap-2 group cursor-pointer"
          >
            <span>SYSTEM CREDITS & MANIFESTO</span>
          </button>

          <div className="text-[10px] text-arcade-muted text-center md:text-right">
            <span>PIXEL-MODERN TYPOGRAPHIC ARCHITECTURE</span>
            <div className="text-arcade-emerald font-pixel text-[8px] mt-0.5">
              ZERO PURPLE GRADIENTS // PURE FUNCTION
            </div>
          </div>
        </div>
      </footer>

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
