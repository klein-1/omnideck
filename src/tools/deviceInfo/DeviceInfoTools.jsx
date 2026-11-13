import React, { useState, useEffect, useRef } from 'react';
import {
  Cpu, Battery, Wifi, Monitor, HardDrive,
  Activity, Volume2, ShieldCheck, Sparkles, AlertCircle,
  Keyboard, Gauge, RefreshCw, Trash2, Check, Radio
} from 'lucide-react';
import { playClick, playBeep, playCoin, playSuccess } from '../../audio/soundEffects';

export default function DeviceInfoTools() {
  const [activeTab, setActiveTab] = useState('specs');
  // 'specs' | 'fps' | 'audiochannel' | 'keyboard' | 'storage' | 'cleaner' | 'deadpixel'

  // 1. HARDWARE SPECS
  const [deviceData, setDeviceData] = useState({});
  const [batteryData, setBatteryData] = useState(null);

  useEffect(() => {
    const gl = document.createElement('canvas').getContext('webgl');
    let gpuRenderer = 'Standard WebGL Renderer';
    if (gl) {
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        gpuRenderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
      }
    }

    setDeviceData({
      os: navigator.platform || 'Desktop OS',
      browser: navigator.userAgent.split(' ')[0],
      cores: navigator.hardwareConcurrency || '4',
      ram: (navigator.deviceMemory ? `${navigator.deviceMemory} GB` : '8+ GB'),
      screen: `${window.screen.width} × ${window.screen.height} (${window.devicePixelRatio}x DPR)`,
      colorDepth: `${window.screen.colorDepth}-bit`,
      gpu: gpuRenderer,
      online: navigator.onLine ? 'Connected' : 'Offline',
      language: navigator.language || 'en-US'
    });

    if ('getBattery' in navigator) {
      navigator.getBattery().then(bat => {
        const updateBat = () => {
          setBatteryData({
            level: Math.round(bat.level * 100),
            charging: bat.charging
          });
        };
        updateBat();
        bat.addEventListener('levelchange', updateBat);
        bat.addEventListener('chargingchange', updateBat);
      }).catch(() => { });
    }
  }, []);

  // 2. REFRESH RATE (FPS) BENCHMARK
  const [fps, setFps] = useState(0);
  const [fpsAvg, setFpsAvg] = useState(0);
  const [frameHistory, setFrameHistory] = useState([]);
  const fpsFrameCountRef = useRef(0);
  const fpsLastTimeRef = useRef(performance.now());
  const fpsRunningRef = useRef(true);

  useEffect(() => {
    fpsRunningRef.current = true;
    let frames = 0;
    let lastTime = performance.now();
    let history = [];

    const loop = (now) => {
      if (!fpsRunningRef.current) return;
      frames++;
      const delta = now - lastTime;
      if (delta >= 1000) {
        const currentFps = Math.round((frames * 1000) / delta);
        setFps(currentFps);
        history.push(currentFps);
        if (history.length > 30) history.shift();
        setFrameHistory([...history]);
        const avg = Math.round(history.reduce((a, b) => a + b, 0) / history.length);
        setFpsAvg(avg);
        frames = 0;
        lastTime = now;
      }
      requestAnimationFrame(loop);
    };

    const animId = requestAnimationFrame(loop);
    return () => {
      fpsRunningRef.current = false;
      cancelAnimationFrame(animId);
    };
  }, [activeTab]);

  // 3. STEREO AUDIO CHANNEL TESTER
  const [audioTesting, setAudioTesting] = useState(null); // 'left' | 'right' | 'both' | 'tone'
  const audioTestCtxRef = useRef(null);

  const testAudioChannel = (mode) => {
    stopAudioTest();
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioCtx();
      audioTestCtxRef.current = ctx;

      const osc = ctx.createOscillator();
      const panner = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);

      if (panner) {
        if (mode === 'left') panner.pan.setValueAtTime(-1, ctx.currentTime);
        else if (mode === 'right') panner.pan.setValueAtTime(1, ctx.currentTime);
        else panner.pan.setValueAtTime(0, ctx.currentTime);

        osc.connect(panner);
        panner.connect(gain);
      } else {
        osc.connect(gain);
      }

      gain.connect(ctx.destination);
      osc.start();
      setAudioTesting(mode);
      playClick();

      setTimeout(() => {
        stopAudioTest();
      }, 3000);
    } catch (e) { }
  };

  const stopAudioTest = () => {
    if (audioTestCtxRef.current) {
      audioTestCtxRef.current.close().catch(() => { });
      audioTestCtxRef.current = null;
    }
    setAudioTesting(null);
  };

  // 4. KEYBOARD ROLLOVER & KEY CODE TESTER
  const [lastKeyEvent, setLastKeyEvent] = useState(null);
  const [pressedKeys, setPressedKeys] = useState(new Set());

  useEffect(() => {
    const handleDown = (e) => {
      if (activeTab !== 'keyboard') return;
      setPressedKeys(prev => new Set(prev).add(e.code));
      setLastKeyEvent({
        key: e.key === ' ' ? 'Space' : e.key,
        code: e.code,
        keyCode: e.keyCode,
        which: e.which,
        location: e.location,
        ctrl: e.ctrlKey,
        shift: e.shiftKey,
        alt: e.altKey,
        meta: e.metaKey
      });
    };

    const handleUp = (e) => {
      if (activeTab !== 'keyboard') return;
      setPressedKeys(prev => {
        const next = new Set(prev);
        next.delete(e.code);
        return next;
      });
    };

    window.addEventListener('keydown', handleDown);
    window.addEventListener('keyup', handleUp);
    return () => {
      window.removeEventListener('keydown', handleDown);
      window.removeEventListener('keyup', handleUp);
    };
  }, [activeTab]);

  // 5. STORAGE & DISK QUOTA ANALYZER
  const [storageData, setStorageData] = useState(null);
  const [storageLoading, setStorageLoading] = useState(false);

  const checkStorage = async () => {
    setStorageLoading(true);
    try {
      if (navigator.storage && navigator.storage.estimate) {
        const estimate = await navigator.storage.estimate();
        const usageMB = (estimate.usage / (1024 * 1024)).toFixed(2);
        const quotaMB = (estimate.quota / (1024 * 1024)).toFixed(2);
        const quotaGB = (estimate.quota / (1024 * 1024 * 1024)).toFixed(2);
        const percent = ((estimate.usage / estimate.quota) * 100).toFixed(2);
        setStorageData({
          usageMB,
          quotaMB,
          quotaGB,
          percent
        });
      } else {
        setStorageData({ error: 'Storage estimation API not supported in this browser environment.' });
      }
    } catch (e) {
      setStorageData({ error: e.message });
    } finally {
      setStorageLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'storage') checkStorage();
  }, [activeTab]);

  // 6. SPEAKER WATER / DUST CLEANER
  const [cleaning, setCleaning] = useState(false);
  const cleanOscRef = useRef(null);

  const startSpeakerClean = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(165, ctx.currentTime);

      let up = true;
      const sweep = setInterval(() => {
        if (!cleanOscRef.current) {
          clearInterval(sweep);
          return;
        }
        osc.frequency.setValueAtTime(up ? 165 : 440, ctx.currentTime);
        up = !up;
      }, 150);

      gain.gain.setValueAtTime(0.35, ctx.currentTime);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      cleanOscRef.current = { osc, ctx, sweep };
      setCleaning(true);
      playClick();
    } catch (e) { }
  };

  const stopSpeakerClean = () => {
    if (cleanOscRef.current) {
      clearInterval(cleanOscRef.current.sweep);
      cleanOscRef.current.osc.stop();
      cleanOscRef.current.ctx.close().catch(() => { });
      cleanOscRef.current = null;
    }
    setCleaning(false);
    playClick();
  };

  // 7. DEAD PIXEL TESTER
  const [pixelColorIdx, setPixelColorIdx] = useState(0);
  const PIXEL_COLORS = ['#ff0000', '#00ff00', '#0000ff', '#ffffff', '#000000', '#ffff00', '#00ffff', '#ff00ff'];
  const [isFullscreenPixel, setIsFullscreenPixel] = useState(false);

  return (
    <div className="space-y-6">
      {/* Subtool Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar border-b-2 border-deck-border pb-3">
        {[
          { id: 'specs', label: 'HARDWARE & SYSTEM', icon: Cpu, activeClass: 'btn-pixel-blue' },
          { id: 'fps', label: 'FPS & REFRESH RATE', icon: Activity, activeClass: 'btn-pixel-emerald' },
          { id: 'audiochannel', label: 'AUDIO CHANNELS', icon: Radio, activeClass: 'btn-pixel-purple' },
          { id: 'keyboard', label: 'KEYBOARD TESTER', icon: Keyboard, activeClass: 'btn-pixel-amber' },
          { id: 'storage', label: 'STORAGE QUOTA', icon: HardDrive, activeClass: 'btn-pixel-cyan' },
          { id: 'cleaner', label: 'SPEAKER CLEANER', icon: Volume2, activeClass: 'btn-pixel-teal' },
          { id: 'deadpixel', label: 'DEAD PIXEL TESTER', icon: Monitor, activeClass: 'btn-pixel-coral' },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => { playClick(); setActiveTab(tab.id); }}
              className={`btn-pixel px-3 py-1.5 font-pixel text-[9px] flex items-center gap-2 shrink-0 ${isActive ? tab.activeClass : 'btn-pixel-surface'
                }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* 1. HARDWARE SPECS */}
      {activeTab === 'specs' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 font-mono text-xs">
            <div className="pixel-card p-4 space-y-1">
              <span className="text-arcade-muted text-[10px] font-pixel">CPU ARCHITECTURE</span>
              <div className="font-pixel text-lg text-arcade-emerald">{deviceData.cores} LOGICAL CORES</div>
              <p className="text-[11px] text-slate-500">Concurrency Threads</p>
            </div>

            <div className="pixel-card p-4 space-y-1">
              <span className="text-arcade-muted text-[10px] font-pixel">DEVICE MEMORY (RAM)</span>
              <div className="font-pixel text-lg text-arcade-cyan">{deviceData.ram}</div>
              <p className="text-[11px] text-slate-500">Reported Hardware Quota</p>
            </div>

            <div className="pixel-card p-4 space-y-1">
              <span className="text-arcade-muted text-[10px] font-pixel">SCREEN RESOLUTION</span>
              <div className="font-pixel text-sm text-arcade-amber">{deviceData.screen}</div>
              <p className="text-[11px] text-slate-500">{deviceData.colorDepth} TrueColor</p>
            </div>

            <div className="pixel-card p-4 space-y-1 sm:col-span-2">
              <span className="text-arcade-muted text-[10px] font-pixel">GPU / WEBGL GRAPHICS RENDERER</span>
              <div className="font-mono text-xs text-arcade-emerald truncate font-bold">{deviceData.gpu}</div>
              <p className="text-[11px] text-slate-500">Direct Hardware Acceleration</p>
            </div>

            {batteryData && (
              <div className="pixel-card p-4 space-y-1">
                <span className="text-arcade-muted text-[10px] font-pixel">BATTERY STATUS</span>
                <div className="font-pixel text-lg text-arcade-emerald">
                  {batteryData.level}% {batteryData.charging ? '⚡' : ''}
                </div>
                <p className="text-[11px] text-slate-500">{batteryData.charging ? 'Charging via AC' : 'On Battery Discharge'}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. FPS & REFRESH RATE */}
      {activeTab === 'fps' && (
        <div className="max-w-xl mx-auto pixel-card p-6 space-y-6 font-mono text-xs text-center">
          <div className="flex justify-between items-center border-b border-deck-border pb-2">
            <span className="font-pixel text-xs text-arcade-cyan">DISPLAY REFRESH RATE (FPS) MONITOR</span>
            <span className="font-pixel text-[9px] text-arcade-emerald">RAF SYNCHRONIZED</span>
          </div>

          <div className="p-8 bg-deck-bg border-2 border-black shadow-pixel space-y-2">
            <div className="font-pixel text-5xl text-arcade-emerald tracking-wider animate-pulse">
              {fps || '--'} <span className="text-lg">HZ / FPS</span>
            </div>
            <p className="text-arcade-muted text-xs">
              Smoothed Average: <strong className="text-arcade-amber">{fpsAvg || '--'} Hz</strong> (Display V-Sync Locked)
            </p>
          </div>

          <div className="space-y-2 text-left">
            <span className="text-arcade-muted text-[10px] font-pixel">LIVE FRAME HISTORY (30 SECONDS)</span>
            <div className="flex items-end gap-1 h-20 bg-deck-bg border-2 border-black p-2">
              {frameHistory.map((val, idx) => {
                const heightPercent = Math.min(100, (val / 165) * 100);
                return (
                  <div
                    key={idx}
                    className="flex-1 bg-arcade-emerald border-t border-black transition-all"
                    style={{ height: `${heightPercent}%` }}
                    title={`${val} FPS`}
                  />
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 3. STEREO AUDIO CHANNELS */}
      {activeTab === 'audiochannel' && (
        <div className="max-w-lg mx-auto pixel-card p-6 space-y-6 font-mono text-xs text-center">
          <span className="font-pixel text-xs text-arcade-cyan">STEREO SPEAKER & PHASE DIAGNOSTICS</span>
          <p className="text-slate-500 text-xs">
            Isolate left and right speaker channels to verify stereo separation, balance, and driver phase clarity.
          </p>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => testAudioChannel('left')}
              className={`btn-pixel py-8 font-pixel text-sm flex flex-col items-center gap-2 ${audioTesting === 'left' ? 'btn-pixel-emerald animate-pulse' : 'btn-pixel-surface'
                }`}
            >
              <span>🔊 LEFT</span>
              <span className="text-[9px] font-mono">100% Left Pan</span>
            </button>

            <button
              onClick={() => testAudioChannel('right')}
              className={`btn-pixel py-8 font-pixel text-sm flex flex-col items-center gap-2 ${audioTesting === 'right' ? 'btn-pixel-cyan animate-pulse' : 'btn-pixel-surface'
                }`}
            >
              <span>🔊 RIGHT</span>
              <span className="text-[9px] font-mono">100% Right Pan</span>
            </button>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => testAudioChannel('both')}
              className="btn-pixel btn-pixel-amber flex-1 py-2 font-pixel text-[9px]"
            >
              CENTER STEREO (BOTH)
            </button>
            <button
              onClick={stopAudioTest}
              className="btn-pixel btn-pixel-coral px-4 py-2 font-pixel text-[9px]"
            >
              STOP
            </button>
          </div>
        </div>
      )}

      {/* 4. KEYBOARD ROLLOVER & KEY CODES */}
      {activeTab === 'keyboard' && (
        <div className="max-w-xl mx-auto pixel-card p-6 space-y-6 font-mono text-xs text-center">
          <div className="flex justify-between items-center border-b border-deck-border pb-2">
            <span className="font-pixel text-xs text-arcade-amber">KEYBOARD ROLLOVER & KEY CODE TESTER</span>
            <span className="font-pixel text-[9px] text-arcade-emerald">{pressedKeys.size} ACTIVE KEYS</span>
          </div>

          <p className="text-slate-500 text-xs">
            Press any keys on your keyboard to inspect JavaScript event codes and test anti-ghosting rollover.
          </p>

          <div className="p-6 bg-deck-bg border-2 border-black shadow-pixel min-h-[140px] flex flex-col justify-center items-center gap-3">
            {lastKeyEvent ? (
              <div className="space-y-2">
                <div className="font-pixel text-3xl text-arcade-emerald tracking-wide">
                  [{lastKeyEvent.key}]
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] text-left pt-2">
                  <div className="p-1 border border-deck-border bg-deck-surface">
                    <span className="text-arcade-muted block">CODE</span>
                    <strong className="text-arcade-amber">{lastKeyEvent.code}</strong>
                  </div>
                  <div className="p-1 border border-deck-border bg-deck-surface">
                    <span className="text-arcade-muted block">KEYCODE</span>
                    <strong className="text-arcade-cyan">{lastKeyEvent.keyCode}</strong>
                  </div>
                  <div className="p-1 border border-deck-border bg-deck-surface">
                    <span className="text-arcade-muted block">LOCATION</span>
                    <strong className="text-arcade-paper">{lastKeyEvent.location}</strong>
                  </div>
                  <div className="p-1 border border-deck-border bg-deck-surface">
                    <span className="text-arcade-muted block">MODIFIERS</span>
                    <strong className="text-arcade-coral">
                      {[lastKeyEvent.ctrl && 'Ctrl', lastKeyEvent.shift && 'Shift', lastKeyEvent.alt && 'Alt'].filter(Boolean).join('+') || 'None'}
                    </strong>
                  </div>
                </div>
              </div>
            ) : (
              <div className="font-pixel text-sm text-arcade-muted animate-pulse">
                PRESS ANY KEY TO TEST...
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. STORAGE & DISK QUOTA */}
      {activeTab === 'storage' && (
        <div className="max-w-md mx-auto pixel-card p-6 space-y-6 font-mono text-xs text-center">
          <span className="font-pixel text-xs text-arcade-emerald">BROWSER STORAGE & DISK QUOTA</span>

          {storageLoading ? (
            <div className="font-pixel text-xs text-arcade-amber animate-pulse py-8">
              ANALYZING DISK ESTIMATE...
            </div>
          ) : storageData && !storageData.error ? (
            <div className="space-y-4">
              <div className="p-6 bg-deck-bg border-2 border-black shadow-pixel space-y-2">
                <div className="font-pixel text-3xl text-arcade-emerald">
                  {storageData.usageMB} <span className="text-sm">MB USED</span>
                </div>
                <div className="text-arcade-muted text-xs">
                  OF {storageData.quotaGB} GB ALLOCATED DISK QUOTA ({storageData.percent}%)
                </div>
                <div className="w-full bg-slate-200 h-3 border border-black mt-3 overflow-hidden">
                  <div
                    className="bg-arcade-emerald h-full"
                    style={{ width: `${Math.max(1, storageData.percent)}%` }}
                  />
                </div>
              </div>

              <button
                onClick={checkStorage}
                className="btn-pixel btn-pixel-surface w-full py-2 font-pixel text-[9px] flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                REFRESH STORAGE QUOTA
              </button>
            </div>
          ) : (
            <div className="text-arcade-coral text-xs py-4">
              {storageData?.error || 'Storage estimate unavailable.'}
            </div>
          )}
        </div>
      )}

      {/* 6. SPEAKER CLEANER */}
      {activeTab === 'cleaner' && (
        <div className="max-w-md mx-auto pixel-card p-6 space-y-6 font-mono text-xs text-center">
          <span className="font-pixel text-xs text-arcade-cyan">HIGH-FREQUENCY SPEAKER EJECTOR</span>

          <p className="text-slate-500 text-xs">
            Plays specialized 165Hz acoustic wave pulses designed to dislodge trapped water droplets, moisture, and dust particles from your device speaker grills.
          </p>

          <div className="p-8 bg-deck-bg border-2 border-black shadow-pixel">
            <Volume2 className={`w-16 h-16 mx-auto ${cleaning ? 'text-arcade-cyan animate-bounce' : 'text-arcade-muted'}`} />
            <div className="font-pixel text-xs text-arcade-cyan mt-3">
              {cleaning ? 'ACOUSTIC WAVE ACTIVE' : 'SPEAKER CLEANER IDLE'}
            </div>
          </div>

          <button
            onClick={cleaning ? stopSpeakerClean : startSpeakerClean}
            className={`btn-pixel w-full py-3 font-pixel text-xs flex items-center justify-center gap-2 ${cleaning ? 'btn-pixel-coral' : 'btn-pixel-cyan'
              }`}
          >
            {cleaning ? 'HALT CLEANING TONE' : 'INITIATE SPEAKER CLEANSE'}
          </button>
        </div>
      )}

      {/* 7. DEAD PIXEL TESTER */}
      {activeTab === 'deadpixel' && (
        <div className="max-w-md mx-auto pixel-card p-6 space-y-4 font-mono text-xs text-center">
          <span className="font-pixel text-xs text-arcade-amber">FULL-SCREEN RGBW PIXEL TEST</span>
          <p className="text-slate-500 text-xs">
            Cycles through pure primary Red, Green, Blue, White, Black, Yellow, Cyan, and Magenta screens to reveal stuck, dead, or flickering pixels on your display.
          </p>

          <div
            className="w-full h-36 border-4 border-black cursor-pointer shadow-pixel transition-colors flex items-center justify-center"
            style={{ backgroundColor: PIXEL_COLORS[pixelColorIdx] }}
            onClick={() => setPixelColorIdx((pixelColorIdx + 1) % PIXEL_COLORS.length)}
          >
            <span className="font-pixel text-[9px] bg-black text-white px-2 py-1">
              CLICK TO CYCLE COLOR ({pixelColorIdx + 1}/{PIXEL_COLORS.length})
            </span>
          </div>

          <button
            onClick={() => setIsFullscreenPixel(true)}
            className="btn-pixel btn-pixel-amber w-full py-3 font-pixel text-xs"
          >
            LAUNCH FULLSCREEN TEST
          </button>

          {isFullscreenPixel && (
            <div
              className="fixed inset-0 z-[99999] cursor-pointer flex items-center justify-center"
              style={{ backgroundColor: PIXEL_COLORS[pixelColorIdx] }}
              onClick={() => {
                if (pixelColorIdx === PIXEL_COLORS.length - 1) {
                  setIsFullscreenPixel(false);
                } else {
                  setPixelColorIdx(pixelColorIdx + 1);
                }
              }}
            >
              <div className="font-pixel text-[10px] bg-black text-white px-3 py-1.5 opacity-60 hover:opacity-100">
                CLICK TO CYCLE COLOR // ESC TO EXIT
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
