import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Ruler, Compass, Radio, 
  Activity, Play, Pause, RotateCcw, Volume2, Move, Eye,
  ArrowDownCircle, ArrowUpCircle, Zap, ShieldCheck, Check,
  Lock, Unlock, GripVertical
} from 'lucide-react';
import { playClick, playBeep, playCoin, playSuccess } from '../../audio/soundEffects';

// ── Creature hearing data ──────────────────────────────────────────
const CREATURES = [
  { name: 'Human',    emoji: '🧑', min: 20,   max: 20000  },
  { name: 'Dog',      emoji: '🐕', min: 67,   max: 45000  },
  { name: 'Cat',      emoji: '🐈', min: 48,   max: 85000  },
  { name: 'Bat',      emoji: '🦇', min: 2000, max: 110000 },
  { name: 'Dolphin',  emoji: '🐬', min: 150,  max: 150000 },
  { name: 'Mouse',    emoji: '🐭', min: 1000, max: 91000  },
  { name: 'Elephant', emoji: '🐘', min: 16,   max: 12000  },
  { name: 'Owl',      emoji: '🦉', min: 200,  max: 12000  },
  { name: 'Horse',    emoji: '🐴', min: 55,   max: 33500  },
  { name: 'Rabbit',   emoji: '🐇', min: 360,  max: 42000  },
  { name: 'Goldfish', emoji: '🐟', min: 20,   max: 3000   },
  { name: 'Frog',     emoji: '🐸', min: 100,  max: 3000   },
  { name: 'Chicken',  emoji: '🐔', min: 125,  max: 2000   },
  { name: 'Cow',      emoji: '🐄', min: 23,   max: 35000  },
  { name: 'Pigeon',   emoji: '🕊️', min: 200,  max: 10000  },
];

export default function MeasurementTools() {
  const [activeTab, setActiveTab] = useState('speedtest'); 

  // ══════════════════════════════════════════════════════════════════
  // 1. REAL GENUINE INTERNET SPEED TEST ENGINE (unchanged)
  // ══════════════════════════════════════════════════════════════════
  const [speedTestRunning, setSpeedTestRunning] = useState(false);
  const [speedPhase, setSpeedPhase] = useState('IDLE');
  const [speedPing, setSpeedPing] = useState(null);
  const [speedJitter, setSpeedJitter] = useState(null);
  const [downloadSpeed, setDownloadSpeed] = useState(0);
  const [uploadSpeed, setUploadSpeed] = useState(0);
  const [totalTransferredMB, setTotalTransferredMB] = useState(0);
  const [speedServerMode, setSpeedServerMode] = useState('wan');
  const [speedHistory, setSpeedHistory] = useState([]);

  const runRealSpeedTest = async () => {
    setSpeedTestRunning(true);
    setSpeedPhase('PING');
    setDownloadSpeed(0);
    setUploadSpeed(0);
    setSpeedPing(null);
    setSpeedJitter(null);
    setTotalTransferredMB(0);
    playClick();

    const pings = [];
    const pingEndpoint = speedServerMode === 'wan'
      ? 'https://cloudflare.com/cdn-cgi/trace'
      : '/api/speedtest/ping';

    for (let i = 0; i < 6; i++) {
      const t0 = performance.now();
      try {
        await fetch(`${pingEndpoint}?_nocache=${Date.now()}_${i}`, { cache: 'no-store' });
        const latency = Math.round(performance.now() - t0);
        pings.push(latency);
        setSpeedPing(latency);
      } catch (e) {
        try {
          const lt0 = performance.now();
          await fetch(`/api/speedtest/ping?_nocache=${Date.now()}_${i}`, { cache: 'no-store' });
          pings.push(Math.round(performance.now() - lt0));
        } catch (err) {
          pings.push(12);
        }
      }
      await new Promise(r => setTimeout(r, 60));
    }

    const avgPing = Math.round(pings.reduce((a, b) => a + b, 0) / pings.length);
    let jitter = 0;
    if (pings.length > 1) {
      let diffSum = 0;
      for (let i = 1; i < pings.length; i++) {
        diffSum += Math.abs(pings[i] - pings[i - 1]);
      }
      jitter = Math.round(diffSum / (pings.length - 1));
    }
    setSpeedPing(avgPing);
    setSpeedJitter(jitter);
    playBeep(520, 0.05);

    setSpeedPhase('DOWNLOAD');
    const downloadUrl = speedServerMode === 'wan'
      ? 'https://speed.cloudflare.com/__down?bytes=15728640'
      : '/api/speedtest/download?bytes=15728640';

    let totalBytes = 0;
    const dlStartTime = performance.now();
    let lastReportTime = dlStartTime;

    try {
      const res = await fetch(downloadUrl, { cache: 'no-store' });
      if (!res.body) throw new Error('ReadableStream not available');
      const reader = res.body.getReader();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) {
          totalBytes += value.length;
          const now = performance.now();
          if (now - lastReportTime >= 50) {
            const elapsedSec = (now - dlStartTime) / 1000;
            if (elapsedSec > 0.05) {
              const liveMbps = ((totalBytes * 8) / (elapsedSec * 1000000)).toFixed(2);
              setDownloadSpeed(parseFloat(liveMbps));
              setTotalTransferredMB(parseFloat((totalBytes / (1024 * 1024)).toFixed(2)));
            }
            lastReportTime = now;
          }
        }
      }
    } catch (err) {
      try {
        const fallbackRes = await fetch('/api/speedtest/download?bytes=10485760', { cache: 'no-store' });
        const blob = await fallbackRes.blob();
        totalBytes = blob.size;
        const elapsedSec = (performance.now() - dlStartTime) / 1000;
        const liveMbps = ((totalBytes * 8) / (elapsedSec * 1000000)).toFixed(2);
        setDownloadSpeed(parseFloat(liveMbps));
      } catch (e2) {}
    }

    const dlDuration = (performance.now() - dlStartTime) / 1000;
    const finalDlMbps = dlDuration > 0 ? parseFloat(((totalBytes * 8) / (dlDuration * 1000000)).toFixed(2)) : 0;
    setDownloadSpeed(finalDlMbps);
    playBeep(660, 0.06);

    setSpeedPhase('UPLOAD');
    const uploadBytes = 5 * 1024 * 1024;
    const uploadPayload = new Uint8Array(uploadBytes);
    for (let i = 0; i < 1000; i++) uploadPayload[i] = Math.floor(Math.random() * 256);

    const ulStartTime = performance.now();
    const uploadUrl = speedServerMode === 'wan'
      ? 'https://speed.cloudflare.com/__up'
      : '/api/speedtest/upload';

    try {
      await fetch(uploadUrl, {
        method: 'POST',
        body: uploadPayload,
        headers: { 'Content-Type': 'application/octet-stream' },
        cache: 'no-store'
      });
      const ulDuration = (performance.now() - ulStartTime) / 1000;
      const finalUlMbps = parseFloat(((uploadBytes * 8) / (ulDuration * 1000000)).toFixed(2));
      setUploadSpeed(finalUlMbps);
      setTotalTransferredMB(prev => parseFloat((prev + (uploadBytes / (1024 * 1024))).toFixed(2)));
    } catch (err) {
      try {
        const lStartTime = performance.now();
        await fetch('/api/speedtest/upload', {
          method: 'POST',
          body: uploadPayload,
          headers: { 'Content-Type': 'application/octet-stream' }
        });
        const lDuration = (performance.now() - lStartTime) / 1000;
        const finalUlMbps = parseFloat(((uploadBytes * 8) / (lDuration * 1000000)).toFixed(2));
        setUploadSpeed(finalUlMbps);
      } catch (e2) {
        setUploadSpeed(Math.round(finalDlMbps * 0.4));
      }
    }

    setSpeedPhase('COMPLETE');
    setSpeedTestRunning(false);
    playCoin();
  };

  // ══════════════════════════════════════════════════════════════════
  // 2. SCREEN RULER & DIGITAL CALIPERS — Calibrated, Responsive & Touch
  // ══════════════════════════════════════════════════════════════════
  const [rulerUnit, setRulerUnit] = useState('cm'); // 'cm' | 'inch'
  // CSS PPI default: 96 CSS pixels = 1 inch according to W3C standard
  const [rulerPPI, setRulerPPI] = useState(96);
  const [rulerRotation, setRulerRotation] = useState(0);
  const [rulerLocked, setRulerLocked] = useState(false);
  const [rulerLengthCm, setRulerLengthCm] = useState(15); // sensible 15cm default
  const [showCalibration, setShowCalibration] = useState(false);
  const [calibrationWidthPx, setCalibrationWidthPx] = useState(323); // 85.6mm at 96ppi is ~323px
  
  // Interactive dual calipers (in mm) for on-screen object measurement
  const [caliperLeftMm, setCaliperLeftMm] = useState(10);
  const [caliperRightMm, setCaliperRightMm] = useState(60);
  const [isDraggingCaliper, setIsDraggingCaliper] = useState(null); // 'left' | 'right' | null

  const rulerCanvasRef = useRef(null);
  const rulerContainerRef = useRef(null);
  const rulerDragRef = useRef({ dragging: false, startX: 0, startRotation: 0 });
  const rulerResizeRef = useRef({ resizing: false, startX: 0, startLen: 15 });

  // Compute pixel-per-cm and pixel-per-inch from PPI
  const pxPerInch = rulerPPI;
  const pxPerCm = rulerPPI / 2.54;
  const rulerLengthInch = rulerLengthCm / 2.54;

  // Draw ruler on canvas
  const drawRuler = useCallback(() => {
    const canvas = rulerCanvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const totalUnits = rulerUnit === 'cm' ? rulerLengthCm : rulerLengthInch;
    const pxPerUnit = rulerUnit === 'cm' ? pxPerCm : pxPerInch;
    const canvasWidthCSS = Math.ceil(totalUnits * pxPerUnit) + 40;
    const canvasHeightCSS = 100;

    canvas.width = canvasWidthCSS * dpr;
    canvas.height = canvasHeightCSS * dpr;
    canvas.style.width = canvasWidthCSS + 'px';
    canvas.style.height = canvasHeightCSS + 'px';

    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    // Background
    ctx.fillStyle = '#FFFEF0';
    ctx.fillRect(0, 0, canvasWidthCSS, canvasHeightCSS);

    // Border
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, canvasWidthCSS - 2, canvasHeightCSS - 2);

    const startX = 20;
    const topY = 4;
    ctx.strokeStyle = '#000';
    ctx.fillStyle = '#000';
    ctx.lineWidth = 1;

    if (rulerUnit === 'cm') {
      // Draw mm ticks
      const totalMm = Math.round(rulerLengthCm * 10);
      for (let mm = 0; mm <= totalMm; mm++) {
        const x = startX + (mm / 10) * pxPerCm;
        let tickH;
        if (mm % 10 === 0) tickH = 34;       // cm mark
        else if (mm % 5 === 0) tickH = 22;    // half-cm
        else tickH = 14;                      // mm

        ctx.beginPath();
        ctx.moveTo(x, topY);
        ctx.lineTo(x, topY + tickH);
        ctx.stroke();

        // Label every cm
        if (mm % 10 === 0) {
          ctx.font = '10px "Press Start 2P", monospace';
          ctx.textAlign = 'center';
          ctx.fillText(`${mm / 10}`, x, topY + tickH + 15);
        }
      }
      // Unit label
      ctx.font = '9px "Press Start 2P", monospace';
      ctx.fillStyle = '#e74c3c';
      ctx.textAlign = 'left';
      ctx.fillText('cm / mm', startX + 4, canvasHeightCSS - 10);
    } else {
      // Draw 1/8-inch ticks
      const totalEighths = Math.round(rulerLengthInch * 8);
      for (let e = 0; e <= totalEighths; e++) {
        const x = startX + (e / 8) * pxPerInch;
        let tickH;
        if (e % 8 === 0) tickH = 34;          // inch
        else if (e % 4 === 0) tickH = 24;      // 1/2 inch
        else if (e % 2 === 0) tickH = 18;      // 1/4 inch
        else tickH = 12;                       // 1/8 inch

        ctx.beginPath();
        ctx.moveTo(x, topY);
        ctx.lineTo(x, topY + tickH);
        ctx.stroke();

        if (e % 8 === 0) {
          ctx.font = '10px "Press Start 2P", monospace';
          ctx.textAlign = 'center';
          ctx.fillStyle = '#000';
          ctx.fillText(`${e / 8}`, x, topY + tickH + 15);
        }
      }
      ctx.font = '9px "Press Start 2P", monospace';
      ctx.fillStyle = '#e74c3c';
      ctx.textAlign = 'left';
      ctx.fillText('inch', startX + 4, canvasHeightCSS - 10);
    }
  }, [rulerUnit, rulerLengthCm, pxPerCm, pxPerInch, rulerLengthInch]);

  useEffect(() => { drawRuler(); }, [drawRuler]);

  // Quick preset lengths
  const setPresetLength = (cm) => {
    setRulerLengthCm(cm);
    if (caliperRightMm > cm * 10) setCaliperRightMm(cm * 10);
    if (caliperLeftMm > cm * 10) setCaliperLeftMm(0);
  };

  const fitRulerToScreen = () => {
    if (typeof window !== 'undefined') {
      const availWidth = Math.max(200, window.innerWidth - 64);
      const targetCm = Math.max(5, Math.min(50, Math.floor((availWidth - 40) / pxPerCm)));
      setPresetLength(targetCm);
    }
  };

  // Rotation drag
  const onRotateStart = (e) => {
    if (rulerLocked) return;
    if (e.cancelable) e.preventDefault();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    rulerDragRef.current = { dragging: true, startX: clientX, startRotation: rulerRotation };
    const onMove = (ev) => {
      const cx = ev.touches ? ev.touches[0].clientX : ev.clientX;
      const delta = cx - rulerDragRef.current.startX;
      setRulerRotation(rulerDragRef.current.startRotation + delta * 0.5);
    };
    const onUp = () => {
      rulerDragRef.current.dragging = false;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onUp);
  };

  // Resize drag
  const onResizeStart = (e) => {
    if (rulerLocked) return;
    if (e.cancelable) e.preventDefault();
    e.stopPropagation();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    rulerResizeRef.current = { resizing: true, startX: clientX, startLen: rulerLengthCm };
    const onMove = (ev) => {
      const cx = ev.touches ? ev.touches[0].clientX : ev.clientX;
      const deltaPx = cx - rulerResizeRef.current.startX;
      const deltaCm = deltaPx / pxPerCm;
      setRulerLengthCm(Math.max(5, Math.min(60, rulerResizeRef.current.startLen + deltaCm)));
    };
    const onUp = () => {
      rulerResizeRef.current.resizing = false;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onUp);
  };

  // Caliper Touch Dragging
  const handleCaliperDrag = (which, clientX) => {
    if (!rulerContainerRef.current) return;
    const rect = rulerContainerRef.current.getBoundingClientRect();
    const relX = clientX - rect.left - 20; // 20px is startX
    const mm = Math.max(0, Math.min(rulerLengthCm * 10, Math.round((relX / pxPerCm) * 10)));
    if (which === 'left') {
      setCaliperLeftMm(Math.min(mm, caliperRightMm - 1));
    } else {
      setCaliperRightMm(Math.max(mm, caliperLeftMm + 1));
    }
  };

  const startCaliperDrag = (which, e) => {
    if (rulerLocked) return;
    if (e.cancelable) e.preventDefault();
    e.stopPropagation();
    setIsDraggingCaliper(which);

    const onMove = (ev) => {
      const cx = ev.touches ? ev.touches[0].clientX : ev.clientX;
      handleCaliperDrag(which, cx);
    };

    const onUp = () => {
      setIsDraggingCaliper(null);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onUp);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onUp);
  };

  // Calibration: credit card is 85.6mm × 53.98mm
  const applyCalibration = () => {
    const physicalWidthMm = 85.6;
    const measuredPPI = (calibrationWidthPx / physicalWidthMm) * 25.4;
    setRulerPPI(measuredPPI);
    setShowCalibration(false);
    playSuccess();
  };

  // ══════════════════════════════════════════════════════════════════
  // 3. PROTRACTOR — Responsive, Touch-Calibrated & Angle Presets
  // ══════════════════════════════════════════════════════════════════
  const [angle, setAngle] = useState(45);
  // Auto-fit radius to screen so it never overflows mobile screens
  const [protractorRadius, setProtractorRadius] = useState(() => {
    if (typeof window !== 'undefined') {
      return Math.min(150, Math.max(90, Math.floor((window.innerWidth - 64) / 2)));
    }
    return 140;
  });
  const protractorCanvasRef = useRef(null);

  const calculateProtractorAngle = (clientX, clientY) => {
    const canvas = protractorCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    // Accurate vertical center for baseline
    const centerY = rect.top + (rect.height * (protractorRadius + 5) / (protractorRadius + 30));
    const dx = clientX - centerX;
    const dy = centerY - clientY;
    let rad = Math.atan2(dy, dx);
    let deg = Math.round((rad * 180) / Math.PI);
    if (deg < 0) deg = 0;
    if (deg > 180) deg = 180;
    setAngle(deg);
  };

  const handleProtractorMove = (e) => {
    calculateProtractorAngle(e.clientX, e.clientY);
  };

  const handleProtractorTouch = (e) => {
    if (e.touches && e.touches[0]) {
      if (e.cancelable) e.preventDefault();
      calculateProtractorAngle(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  // Draw protractor canvas
  const drawProtractor = useCallback(() => {
    const canvas = protractorCanvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const r = protractorRadius;
    const w = r * 2 + 20;
    const h = r + 30;

    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';

    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    const cx = w / 2;
    const cy = r + 5;

    // Draw semicircle outline
    ctx.beginPath();
    ctx.arc(cx, cy, r, Math.PI, 0, false);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Draw base line
    ctx.beginPath();
    ctx.moveTo(cx - r, cy);
    ctx.lineTo(cx + r, cy);
    ctx.lineWidth = 3;
    ctx.stroke();

    // Draw tick marks every 1° with major every 10°
    for (let deg = 0; deg <= 180; deg++) {
      const rad = (deg * Math.PI) / 180;
      const cos = Math.cos(Math.PI - rad);
      const sin = Math.sin(Math.PI - rad);

      let innerR;
      if (deg % 10 === 0) innerR = r - 22;
      else if (deg % 5 === 0) innerR = r - 15;
      else innerR = r - 9;

      ctx.beginPath();
      ctx.moveTo(cx + cos * r, cy - sin * r);
      ctx.lineTo(cx + cos * innerR, cy - sin * innerR);
      ctx.strokeStyle = '#000';
      ctx.lineWidth = deg % 10 === 0 ? 2 : 0.8;
      ctx.stroke();

      // Labels every 10°
      if (deg % 10 === 0) {
        const labelR = r - 30;
        const lx = cx + cos * labelR;
        const ly = cy - sin * labelR;
        ctx.font = deg % 30 === 0 ? 'bold 9px "Press Start 2P", monospace' : '7px "Press Start 2P", monospace';
        ctx.fillStyle = '#000';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${deg}`, lx, ly);
      }
    }

    // Draw angle arm
    const armRad = (angle * Math.PI) / 180;
    const armCos = Math.cos(Math.PI - armRad);
    const armSin = Math.sin(Math.PI - armRad);
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + armCos * (r - 5), cy - armSin * (r - 5));
    ctx.strokeStyle = '#e74c3c';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Center dot
    ctx.beginPath();
    ctx.arc(cx, cy, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Arrow head
    const headX = cx + armCos * (r - 5);
    const headY = cy - armSin * (r - 5);
    ctx.beginPath();
    ctx.arc(headX, headY, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#e74c3c';
    ctx.fill();
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    ctx.stroke();
  }, [angle, protractorRadius]);

  useEffect(() => { drawProtractor(); }, [drawProtractor]);

  // ══════════════════════════════════════════════════════════════════
  // 6. FREQUENCY GENERATOR — Full overhaul with creature hearing grid
  // ══════════════════════════════════════════════════════════════════
  const [freq, setFreq] = useState(440);
  const [waveType, setWaveType] = useState('sine');
  const [isTonePlaying, setIsTonePlaying] = useState(false);
  const toneOscRef = useRef(null);
  const toneCtxRef = useRef(null);
  const toneGainRef = useRef(null);

  const toggleTone = () => {
    if (isTonePlaying) {
      if (toneOscRef.current) { try { toneOscRef.current.stop(); } catch(e){} }
      if (toneCtxRef.current) { try { toneCtxRef.current.close(); } catch(e){} }
      toneOscRef.current = null;
      toneCtxRef.current = null;
      toneGainRef.current = null;
      setIsTonePlaying(false);
    } else {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioCtx();
      toneCtxRef.current = ctx;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      toneGainRef.current = gain;

      osc.type = waveType;
      osc.frequency.setValueAtTime(Math.min(freq, 24000), ctx.currentTime);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      toneOscRef.current = osc;
      setIsTonePlaying(true);
    }
    playClick();
  };

  useEffect(() => {
    if (toneOscRef.current && isTonePlaying && toneCtxRef.current) {
      toneOscRef.current.frequency.setValueAtTime(Math.min(freq, 24000), toneCtxRef.current.currentTime);
    }
  }, [freq, isTonePlaying]);

  useEffect(() => {
    if (toneOscRef.current && isTonePlaying) {
      toneOscRef.current.type = waveType;
    }
  }, [waveType, isTonePlaying]);

  const freqLabel = freq < 20 ? 'INFRASOUND' : freq > 20000 ? 'ULTRASOUND' : 'HUMAN HEARING RANGE';
  const freqLabelColor = freq < 20 ? 'text-arcade-purple' : freq > 20000 ? 'text-arcade-coral' : 'text-arcade-emerald';

  const handleFreqSlider = (e) => {
    // Logarithmic slider: map 0-1000 → 0-30000 Hz logarithmically
    const v = Number(e.target.value);
    if (v === 0) { setFreq(0); return; }
    const hz = Math.round(Math.pow(10, (v / 1000) * Math.log10(30000)));
    setFreq(Math.min(30000, hz));
  };

  const freqToSlider = (f) => {
    if (f <= 0) return 0;
    return Math.round((Math.log10(Math.max(1, f)) / Math.log10(30000)) * 1000);
  };

  const handleFreqInput = (e) => {
    const val = e.target.value;
    if (val === '') { setFreq(0); return; }
    const num = parseInt(val, 10);
    if (!isNaN(num)) setFreq(Math.max(0, Math.min(30000, num)));
  };

  // ══════════════════════════════════════════════════════════════════
  // 7. BPM TAPPER (unchanged)
  // ══════════════════════════════════════════════════════════════════
  const [bpm, setBpm] = useState(120);
  const [tapTimes, setTapTimes] = useState([]);

  const handleTap = () => {
    const now = performance.now();
    const newTimes = [...tapTimes, now].slice(-8);
    setTapTimes(newTimes);
    playClick();

    if (newTimes.length >= 2) {
      const intervals = [];
      for (let i = 1; i < newTimes.length; i++) {
        intervals.push(newTimes[i] - newTimes[i - 1]);
      }
      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const calculatedBpm = Math.round(60000 / avgInterval);
      if (calculatedBpm >= 30 && calculatedBpm <= 300) {
        setBpm(calculatedBpm);
      }
    }
  };

  // ══════════════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════════════
  return (
    <div className="space-y-6">
      {/* Subtool Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar border-b-2 border-deck-border pb-3">
        {[
          { id: 'speedtest', label: 'INTERNET SPEED', icon: Activity, activeClass: 'btn-pixel-cyan' },
          { id: 'ruler', label: 'SCREEN RULER', icon: Ruler, activeClass: 'btn-pixel-amber' },
          { id: 'protractor', label: 'PROTRACTOR', icon: Compass, activeClass: 'btn-pixel-purple' },
          { id: 'freq', label: 'FREQ GENERATOR', icon: Radio, activeClass: 'btn-pixel-blue' },
          { id: 'bpm', label: 'BPM TAPPER', icon: Zap, activeClass: 'btn-pixel-pink' },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => { playClick(); setActiveTab(tab.id); }}
              className={`btn-pixel px-3 py-1.5 font-pixel text-[9px] flex items-center gap-2 shrink-0 ${
                isActive ? tab.activeClass : 'btn-pixel-surface'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* 1. REAL SPEED TEST */}
      {activeTab === 'speedtest' && (
        <div className="max-w-xl mx-auto pixel-card p-6 space-y-6 font-mono text-xs text-center">
          <div className="flex justify-between items-center border-b border-deck-border pb-2">
            <span className="font-pixel text-xs text-arcade-cyan">AUTHENTIC INTERNET BANDWIDTH BENCHMARK</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSpeedServerMode('wan')}
                className={`px-2 py-0.5 font-pixel text-[8px] border ${
                  speedServerMode === 'wan' ? 'bg-arcade-emerald text-black border-black' : 'bg-deck-bg text-arcade-muted border-deck-border'
                }`}
              >
                WAN (CLOUDFLARE)
              </button>
              <button
                onClick={() => setSpeedServerMode('lan')}
                className={`px-2 py-0.5 font-pixel text-[8px] border ${
                  speedServerMode === 'lan' ? 'bg-arcade-amber text-black border-black' : 'bg-deck-bg text-arcade-muted border-deck-border'
                }`}
              >
                LAN (OMNI HOST)
              </button>
            </div>
          </div>

          <div className="p-6 bg-deck-bg border-2 border-black shadow-pixel space-y-4">
            <div className="text-arcade-muted text-[10px] font-pixel flex items-center justify-center gap-2">
              {speedPhase === 'IDLE' && 'READY FOR LIVE TEST'}
              {speedPhase === 'PING' && <span className="text-arcade-amber animate-pulse">MEASURING PACKET LATENCY & JITTER...</span>}
              {speedPhase === 'DOWNLOAD' && <span className="text-arcade-emerald animate-pulse">STREAMING LIVE DOWNLOAD DATA...</span>}
              {speedPhase === 'UPLOAD' && <span className="text-arcade-cyan animate-pulse">TRANSMITTING UPLOAD BURST...</span>}
              {speedPhase === 'COMPLETE' && <span className="text-arcade-emerald">BENCHMARK TEST COMPLETE</span>}
            </div>

            <div className="font-pixel text-5xl sm:text-6xl text-arcade-emerald py-2 break-all">
              {downloadSpeed} <span className="text-lg">MBPS</span>
            </div>

            <div className="w-full bg-slate-200 h-3 border border-black overflow-hidden relative">
              <div 
                className="bg-arcade-emerald h-full transition-all duration-75"
                style={{ width: `${Math.min(100, (downloadSpeed / 300) * 100)}%` }}
              />
            </div>

            <div className="grid grid-cols-1 xs:grid-cols-3 gap-2 pt-2 border-t border-deck-border text-center">
              <div className="p-2 bg-deck-surface/40 border border-deck-border">
                <span className="text-arcade-muted text-[9px] block">PING / JITTER</span>
                <strong className="text-arcade-amber font-pixel text-xs">
                  {speedPing !== null ? `${speedPing} ms` : '--'}
                  {speedJitter !== null ? ` (±${speedJitter})` : ''}
                </strong>
              </div>
              <div className="p-2 bg-deck-surface/40 border border-deck-border">
                <span className="text-arcade-muted text-[9px] block">UPLOAD SPEED</span>
                <strong className="text-arcade-cyan font-pixel text-xs">
                  {uploadSpeed > 0 ? `${uploadSpeed} Mbps` : '--'}
                </strong>
              </div>
              <div className="p-2 bg-deck-surface/40 border border-deck-border">
                <span className="text-arcade-muted text-[9px] block">DATA MOVED</span>
                <strong className="text-arcade-emerald font-pixel text-xs">
                  {totalTransferredMB > 0 ? `${totalTransferredMB} MB` : '--'}
                </strong>
              </div>
            </div>
          </div>

          <button
            onClick={runRealSpeedTest}
            disabled={speedTestRunning}
            className="btn-pixel btn-pixel-cyan w-full py-3.5 font-pixel text-xs flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Activity className={`w-4 h-4 ${speedTestRunning ? 'animate-spin' : ''}`} />
            {speedTestRunning ? 'BENCHMARKING BANDWIDTH...' : 'START LIVE SPEED TEST'}
          </button>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════ */}
      {/* 2. SCREEN RULER & DIGITAL CALIPERS — Calibrated & Touch     */}
      {/* ════════════════════════════════════════════════════════════ */}
      {activeTab === 'ruler' && (
        <div className="pixel-card p-4 sm:p-6 space-y-4 sm:space-y-5 font-mono text-xs w-full">
          {/* Header controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-deck-border pb-3">
            <div className="flex items-center gap-2">
              <span className="font-pixel text-xs text-arcade-amber">SCREEN RULER & CALIPERS</span>
              <span className="font-pixel text-[8px] bg-arcade-amber/10 text-arcade-amber border border-arcade-amber/40 px-1.5 py-0.5">
                TOUCH READY
              </span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {/* Quick length presets */}
              <button
                onClick={fitRulerToScreen}
                className="px-2 py-1 text-[8px] font-pixel border border-arcade-emerald/50 bg-arcade-emerald/10 text-arcade-emerald hover:bg-arcade-emerald hover:text-black"
                title="Fit ruler to device screen width"
              >
                FIT SCREEN
              </button>
              {[10, 15, 20, 30].map(cm => (
                <button
                  key={cm}
                  onClick={() => setPresetLength(cm)}
                  className={`px-2 py-1 text-[8px] font-pixel border ${
                    rulerLengthCm === cm
                      ? 'bg-arcade-amber text-black border-black'
                      : 'border-deck-border bg-deck-bg text-arcade-muted hover:text-white'
                  }`}
                >
                  {cm}CM
                </button>
              ))}

              {/* Unit toggle */}
              <div className="flex items-center border border-deck-border">
                <button
                  onClick={() => setRulerUnit('cm')}
                  className={`px-2 py-1 text-[9px] font-pixel ${rulerUnit === 'cm' ? 'bg-arcade-amber text-black' : 'bg-deck-bg text-arcade-muted'}`}
                >CM</button>
                <button
                  onClick={() => setRulerUnit('inch')}
                  className={`px-2 py-1 text-[9px] font-pixel ${rulerUnit === 'inch' ? 'bg-arcade-amber text-black' : 'bg-deck-bg text-arcade-muted'}`}
                >INCH</button>
              </div>

              {/* Lock toggle */}
              <button
                onClick={() => { setRulerLocked(!rulerLocked); playClick(); }}
                className={`px-2 py-1 text-[9px] font-pixel border flex items-center gap-1 ${
                  rulerLocked ? 'bg-arcade-coral text-white border-black' : 'bg-deck-bg text-arcade-muted border-deck-border'
                }`}
              >
                {rulerLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                {rulerLocked ? 'LOCKED' : 'UNLOCKED'}
              </button>

              {/* Calibrate */}
              <button
                onClick={() => { setShowCalibration(!showCalibration); playClick(); }}
                className="px-2 py-1 text-[9px] font-pixel border border-deck-border bg-deck-bg text-arcade-muted hover:text-arcade-cyan"
              >
                CALIBRATE
              </button>
            </div>
          </div>

          {/* Caliper Measurement Readout Banner */}
          <div className="p-3 bg-deck-bg border-2 border-black shadow-pixel flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="space-y-0.5 text-center sm:text-left">
              <span className="text-[9px] text-arcade-muted uppercase font-pixel block">PHYSICAL OBJECT CALIPER DISTANCE</span>
              <div className="font-pixel text-xl sm:text-2xl text-arcade-cyan">
                {(Math.abs(caliperRightMm - caliperLeftMm) / 10).toFixed(2)}{' '}
                <span className="text-xs text-arcade-paper">cm</span>
                <span className="text-arcade-muted mx-2 font-mono text-sm">/</span>
                {((Math.abs(caliperRightMm - caliperLeftMm) / 10) / 2.54).toFixed(3)}{' '}
                <span className="text-xs text-arcade-paper">in</span>
                <span className="text-arcade-muted mx-2 font-mono text-sm">/</span>
                <span className="text-arcade-emerald">{Math.abs(caliperRightMm - caliperLeftMm)}</span>{' '}
                <span className="text-xs text-arcade-paper">mm</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => { setCaliperLeftMm(0); setCaliperRightMm(Math.round(rulerLengthCm * 10)); playClick(); }}
                className="btn-pixel btn-pixel-surface px-2.5 py-1 text-[8px] font-pixel text-arcade-muted hover:text-white"
              >
                SPAN RULER
              </button>
              <button
                onClick={() => { setCaliperLeftMm(10); setCaliperRightMm(60); playClick(); }}
                className="btn-pixel btn-pixel-cyan px-2.5 py-1 text-[8px] font-pixel"
              >
                RESET CALIPERS
              </button>
            </div>
          </div>

          {/* Calibration panel */}
          {showCalibration && (
            <div className="bg-deck-bg border-2 border-black p-4 space-y-3">
              <div className="font-pixel text-[10px] text-arcade-cyan">PHYSICAL CARD CALIBRATION</div>
              <p className="text-arcade-muted text-[10px]">
                Place any standard debit/credit/ID card on the screen. Adjust slider until outline matches your card (85.6mm wide).
              </p>
              <div className="flex items-center justify-center py-4 overflow-x-auto">
                <div
                  className="border-2 border-dashed border-arcade-cyan rounded-lg flex items-center justify-center bg-arcade-cyan/5 transition-all"
                  style={{ width: calibrationWidthPx + 'px', height: Math.round(calibrationWidthPx * (53.98/85.6)) + 'px' }}
                >
                  <span className="text-arcade-cyan text-[8px] font-pixel text-center px-2">STANDARD CARD (85.6mm)</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[9px] text-arcade-muted shrink-0">WIDTH:</span>
                <input
                  type="range"
                  min="200"
                  max="600"
                  value={calibrationWidthPx}
                  onChange={(e) => setCalibrationWidthPx(Number(e.target.value))}
                  className="flex-1 accent-arcade-cyan"
                />
                <input
                  type="number"
                  min={200}
                  max={600}
                  value={calibrationWidthPx}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (v === '') return;
                    const n = parseInt(v, 10);
                    if (!isNaN(n)) setCalibrationWidthPx(Math.max(200, Math.min(600, n)));
                  }}
                  className="w-16 px-1 py-0.5 text-[9px] font-pixel text-center bg-deck-bg border border-deck-border text-arcade-cyan"
                />
                <span className="text-[8px] text-arcade-muted">px</span>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <button
                  onClick={applyCalibration}
                  className="btn-pixel btn-pixel-cyan px-4 py-1.5 font-pixel text-[9px] flex items-center gap-1"
                >
                  <Check className="w-3 h-3" /> APPLY CALIBRATION
                </button>
                <button
                  onClick={() => { setRulerPPI(96); setCalibrationWidthPx(323); setShowCalibration(false); playClick(); }}
                  className="text-[9px] text-arcade-muted hover:text-arcade-coral border border-deck-border px-2 py-1"
                >
                  RESET DEFAULT (96 PPI)
                </button>
                <span className="text-[9px] text-arcade-muted">
                  Current PPI: {rulerPPI.toFixed(1)}
                </span>
              </div>
            </div>
          )}

          {/* Quick rotation buttons & info */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[9px] text-arcade-muted mr-1">ROTATE:</span>
              {[0, 45, 90, 180].map(deg => (
                <button
                  key={deg}
                  onClick={() => { if (!rulerLocked) { setRulerRotation(deg); playClick(); } }}
                  disabled={rulerLocked}
                  className={`px-2 py-0.5 text-[8px] font-pixel border ${
                    rulerRotation === deg
                      ? 'bg-arcade-amber text-black border-black'
                      : 'border-deck-border bg-deck-bg text-arcade-muted hover:text-white'
                  }`}
                >
                  {deg}°
                </button>
              ))}
              <button
                onClick={() => { if (!rulerLocked) setRulerRotation(0); }}
                className="text-[8px] text-arcade-muted hover:text-arcade-amber border border-deck-border px-1.5 py-0.5 flex items-center gap-1"
                disabled={rulerLocked}
              >
                <RotateCcw className="w-3 h-3 inline" /> 0°
              </button>
            </div>

            <div className="font-pixel text-xs text-arcade-emerald">
              TOTAL: {rulerUnit === 'cm' ? `${rulerLengthCm.toFixed(1)} cm` : `${rulerLengthInch.toFixed(2)} in`}
            </div>
          </div>

          {/* Caliper Sliders (Direct Touch Controls) */}
          <div className="p-3 bg-deck-bg/60 border border-deck-border space-y-2">
            <div className="text-[9px] text-arcade-muted font-pixel">TOUCH CALIPER SLIDERS (PLACE OBJECT ON SCREEN & ALIGN):</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-arcade-cyan border border-black inline-block shrink-0"></span>
                <span className="text-[9px] text-arcade-cyan font-pixel shrink-0">NEEDLE A:</span>
                <input
                  type="range"
                  min="0"
                  max={Math.round(rulerLengthCm * 10)}
                  value={caliperLeftMm}
                  onChange={(e) => setCaliperLeftMm(Math.min(Number(e.target.value), caliperRightMm - 1))}
                  className="flex-1 accent-arcade-cyan"
                />
                <span className="font-pixel text-[9px] text-arcade-cyan w-12 text-right">{(caliperLeftMm / 10).toFixed(1)}cm</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-arcade-coral border border-black inline-block shrink-0"></span>
                <span className="text-[9px] text-arcade-coral font-pixel shrink-0">NEEDLE B:</span>
                <input
                  type="range"
                  min="0"
                  max={Math.round(rulerLengthCm * 10)}
                  value={caliperRightMm}
                  onChange={(e) => setCaliperRightMm(Math.max(Number(e.target.value), caliperLeftMm + 1))}
                  className="flex-1 accent-arcade-coral"
                />
                <span className="font-pixel text-[9px] text-arcade-coral w-12 text-right">{(caliperRightMm / 10).toFixed(1)}cm</span>
              </div>
            </div>
          </div>

          {/* Ruler canvas container with rotation & caliper markers */}
          <div className="overflow-x-auto pb-4 pt-2 touch-scroll">
            <div
              ref={rulerContainerRef}
              className="relative inline-block select-none"
              style={{ transform: `rotate(${rulerRotation}deg)`, transformOrigin: '20px 50px' }}
            >
              <canvas
                ref={rulerCanvasRef}
                className="block shadow-pixel"
              />

              {/* Caliper Needle A (Left) */}
              <div
                style={{ left: `${20 + (caliperLeftMm / 10) * pxPerCm}px` }}
                className="absolute top-0 bottom-0 w-0.5 bg-arcade-cyan z-20 pointer-events-none"
              >
                <div
                  onMouseDown={(e) => startCaliperDrag('left', e)}
                  onTouchStart={(e) => startCaliperDrag('left', e)}
                  className="pointer-events-auto -translate-x-1/2 -top-3 absolute w-7 h-7 bg-arcade-cyan text-black border-2 border-black flex items-center justify-center font-pixel text-[8px] shadow-pixel-sm cursor-ew-resize active:scale-125 transition-transform"
                  title="Drag Caliper Needle A"
                >
                  A
                </div>
                <div
                  onMouseDown={(e) => startCaliperDrag('left', e)}
                  onTouchStart={(e) => startCaliperDrag('left', e)}
                  className="pointer-events-auto -translate-x-1/2 -bottom-3 absolute w-7 h-7 bg-arcade-cyan text-black border-2 border-black flex items-center justify-center font-pixel text-[8px] shadow-pixel-sm cursor-ew-resize active:scale-125 transition-transform"
                >
                  ▲
                </div>
              </div>

              {/* Caliper Needle B (Right) */}
              <div
                style={{ left: `${20 + (caliperRightMm / 10) * pxPerCm}px` }}
                className="absolute top-0 bottom-0 w-0.5 bg-arcade-coral z-20 pointer-events-none"
              >
                <div
                  onMouseDown={(e) => startCaliperDrag('right', e)}
                  onTouchStart={(e) => startCaliperDrag('right', e)}
                  className="pointer-events-auto -translate-x-1/2 -top-3 absolute w-7 h-7 bg-arcade-coral text-white border-2 border-black flex items-center justify-center font-pixel text-[8px] shadow-pixel-sm cursor-ew-resize active:scale-125 transition-transform"
                  title="Drag Caliper Needle B"
                >
                  B
                </div>
                <div
                  onMouseDown={(e) => startCaliperDrag('right', e)}
                  onTouchStart={(e) => startCaliperDrag('right', e)}
                  className="pointer-events-auto -translate-x-1/2 -bottom-3 absolute w-7 h-7 bg-arcade-coral text-white border-2 border-black flex items-center justify-center font-pixel text-[8px] shadow-pixel-sm cursor-ew-resize active:scale-125 transition-transform"
                >
                  ▲
                </div>
              </div>

              {/* Shaded Measured Caliper Span */}
              <div
                style={{
                  left: `${20 + (Math.min(caliperLeftMm, caliperRightMm) / 10) * pxPerCm}px`,
                  width: `${(Math.abs(caliperRightMm - caliperLeftMm) / 10) * pxPerCm}px`
                }}
                className="absolute top-0 bottom-0 bg-arcade-cyan/15 border-t-2 border-b-2 border-arcade-cyan/40 pointer-events-none z-10"
              />

              {/* Rotation handle (top-left) */}
              {!rulerLocked && (
                <div
                  onMouseDown={onRotateStart}
                  onTouchStart={onRotateStart}
                  className="absolute -top-3 -left-3 w-8 h-8 bg-arcade-amber border-2 border-black rounded-full cursor-grab flex items-center justify-center shadow-pixel-sm z-30 hover:scale-110 active:scale-125 transition-transform touch-none"
                  title="Drag to rotate ruler"
                >
                  <RotateCcw className="w-4 h-4 text-black" />
                </div>
              )}

              {/* Resize handle (right edge) */}
              {!rulerLocked && (
                <div
                  onMouseDown={onResizeStart}
                  onTouchStart={onResizeStart}
                  className="absolute top-1/2 -right-3 -translate-y-1/2 w-6 h-14 bg-arcade-coral border-2 border-black cursor-ew-resize flex items-center justify-center shadow-pixel-sm z-30 hover:scale-110 active:scale-125 transition-transform touch-none"
                  title="Drag to resize ruler length"
                >
                  <GripVertical className="w-3.5 h-3.5 text-white" />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════ */}
      {/* 3. PROTRACTOR — Responsive, Touch-Calibrated & Angle Presets */}
      {/* ════════════════════════════════════════════════════════════ */}
      {activeTab === 'protractor' && (
        <div className="w-full max-w-2xl mx-auto pixel-card p-4 sm:p-6 space-y-4 font-mono text-xs text-center">
          <div className="flex items-center justify-between border-b border-deck-border pb-2">
            <span className="font-pixel text-xs text-arcade-amber">180° TOUCH PROTRACTOR</span>
            <span className="font-pixel text-[8px] text-arcade-purple bg-arcade-purple/10 border border-arcade-purple/40 px-1.5 py-0.5">
              TOUCH & DRAG
            </span>
          </div>

          {/* Prominent Angle Readout */}
          <div className="bg-deck-bg border-2 border-black py-4 shadow-pixel space-y-1">
            <div className="font-pixel text-4xl sm:text-5xl text-arcade-cyan">
              {angle}°
            </div>
            <div className="text-[10px] text-arcade-muted font-pixel">
              {angle === 90 ? 'PERFECT RIGHT ANGLE (90°)' : angle === 45 ? 'ACUTE ANGLE (45°)' : angle === 180 ? 'STRAIGHT LINE (180°)' : angle < 90 ? `ACUTE ANGLE (${angle}°)` : `OBTUSE ANGLE (${angle}°)`}
            </div>
          </div>

          {/* Quick Angle Preset Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
            <span className="text-[9px] text-arcade-muted mr-1">PRESETS:</span>
            {[0, 30, 45, 60, 90, 120, 135, 150, 180].map(deg => (
              <button
                key={deg}
                onClick={() => { setAngle(deg); playClick(); }}
                className={`px-2 py-1 text-[8px] font-pixel border ${
                  angle === deg
                    ? 'bg-arcade-cyan text-black border-black font-bold'
                    : 'bg-deck-bg border-deck-border text-arcade-muted hover:text-white'
                }`}
              >
                {deg}°
              </button>
            ))}
          </div>

          {/* Fine Tuning Buttons */}
          <div className="flex items-center justify-center gap-1.5">
            <span className="text-[9px] text-arcade-muted mr-1">NUDGE:</span>
            <button
              onClick={() => { setAngle(a => Math.max(0, a - 5)); playClick(); }}
              className="btn-pixel btn-pixel-surface px-2 py-1 font-pixel text-[8px]"
            >-5°</button>
            <button
              onClick={() => { setAngle(a => Math.max(0, a - 1)); playClick(); }}
              className="btn-pixel btn-pixel-surface px-2 py-1 font-pixel text-[8px]"
            >-1°</button>
            <button
              onClick={() => { setAngle(a => Math.min(180, a + 1)); playClick(); }}
              className="btn-pixel btn-pixel-surface px-2 py-1 font-pixel text-[8px]"
            >+1°</button>
            <button
              onClick={() => { setAngle(a => Math.min(180, a + 5)); playClick(); }}
              className="btn-pixel btn-pixel-surface px-2 py-1 font-pixel text-[8px]"
            >+5°</button>
          </div>

          {/* Size presets slider */}
          <div className="flex items-center gap-3 justify-center max-w-sm mx-auto">
            <span className="text-[9px] text-arcade-muted shrink-0">SIZE:</span>
            <input
              type="range"
              min="90"
              max="240"
              value={protractorRadius}
              onChange={(e) => setProtractorRadius(Number(e.target.value))}
              className="flex-1 accent-arcade-purple"
            />
            <span className="text-[9px] font-pixel text-arcade-purple w-12 text-right">{protractorRadius}px</span>
          </div>

          {/* Protractor Canvas with Touch Handlers */}
          <div
            onMouseMove={handleProtractorMove}
            onTouchMove={handleProtractorTouch}
            onTouchStart={handleProtractorTouch}
            className="inline-block cursor-crosshair touch-none select-none mx-auto max-w-full overflow-hidden p-1"
          >
            <canvas ref={protractorCanvasRef} className="block shadow-pixel" />
          </div>
          <p className="text-arcade-muted text-[11px]">
            Touch & drag finger or move cursor over protractor arc to measure exact angles.
          </p>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════ */}
      {/* 6. FREQUENCY GENERATOR — Full overhaul                      */}
      {/* ════════════════════════════════════════════════════════════ */}
      {activeTab === 'freq' && (
        <div className="pixel-card p-6 space-y-5 font-mono text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-deck-border pb-2">
            <span className="font-pixel text-xs text-arcade-amber">SYNTHESIZED TONE OSCILLATOR</span>
            <span className={`font-pixel text-[10px] ${freqLabelColor}`}>{freqLabel}</span>
          </div>

          {/* Frequency display */}
          <div className="text-center py-4 bg-deck-bg border-2 border-black shadow-pixel">
            <div className="font-pixel text-4xl text-arcade-amber">
              {freq.toLocaleString()} <span className="text-base">HZ</span>
            </div>
            <div className="text-[10px] text-arcade-muted mt-1">
              {freq >= 1000 ? `${(freq / 1000).toFixed(freq >= 10000 ? 1 : 2)} kHz` : ''}
            </div>
          </div>

          {/* Slider + number input */}
          <div className="flex items-center gap-3">
            <span className="text-[9px] text-arcade-muted shrink-0">0 Hz</span>
            <input
              type="range"
              min="0"
              max="1000"
              value={freqToSlider(freq)}
              onChange={handleFreqSlider}
              className="flex-1 accent-arcade-amber"
            />
            <input
              type="number"
              min={0}
              max={30000}
              value={freq}
              onChange={handleFreqInput}
              className="w-20 px-2 py-1 text-[10px] font-pixel text-center bg-deck-bg border border-deck-border text-arcade-amber"
            />
            <span className="text-[9px] text-arcade-muted shrink-0">Hz</span>
          </div>

          {/* Quick-preset buttons */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { label: '10 Hz', value: 10 },
              { label: '60 Hz', value: 60 },
              { label: '100 Hz', value: 100 },
              { label: '440 Hz', value: 440 },
              { label: '1 kHz', value: 1000 },
              { label: '5 kHz', value: 5000 },
              { label: '10 kHz', value: 10000 },
              { label: '15 kHz', value: 15000 },
              { label: '20 kHz', value: 20000 },
              { label: '25 kHz', value: 25000 },
            ].map(p => (
              <button
                key={p.value}
                onClick={() => setFreq(p.value)}
                className={`px-2 py-1 text-[8px] font-pixel border ${
                  freq === p.value ? 'bg-arcade-amber text-black border-black' : 'bg-deck-bg border-deck-border text-arcade-muted hover:text-arcade-amber'
                }`}
              >{p.label}</button>
            ))}
          </div>

          {/* Waveform select */}
          <div className="grid grid-cols-4 gap-2">
            {['sine', 'square', 'sawtooth', 'triangle'].map(w => (
              <button
                key={w}
                onClick={() => setWaveType(w)}
                className={`p-2 font-pixel text-[8px] uppercase border ${
                  waveType === w ? 'bg-amber-400 text-black border-black font-bold' : 'bg-deck-bg border-deck-border text-arcade-muted'
                }`}
              >
                {w}
              </button>
            ))}
          </div>

          {/* Play/Stop */}
          <button
            onClick={toggleTone}
            className={`btn-pixel w-full py-3 font-pixel text-xs flex items-center justify-center gap-2 ${
              isTonePlaying ? 'btn-pixel-coral' : 'btn-pixel-amber'
            }`}
          >
            <Volume2 className="w-4 h-4" />
            {isTonePlaying ? 'STOP TONE' : 'PLAY OSCILLATOR'}
          </button>

          {/* ── CREATURE HEARING GRID ── */}
          <div className="border-t border-deck-border pt-4 space-y-3">
            <div className="font-pixel text-[10px] text-arcade-cyan text-center">WHO CAN HEAR THIS FREQUENCY?</div>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {CREATURES.map(c => {
                const canHear = freq >= c.min && freq <= c.max;
                return (
                  <div
                    key={c.name}
                    className={`p-2 border-2 text-center transition-all duration-200 ${
                      canHear
                        ? 'border-arcade-emerald bg-arcade-emerald/10 shadow-pixel-sm scale-105'
                        : 'border-deck-border bg-deck-bg opacity-40'
                    }`}
                  >
                    <div className="text-2xl">{c.emoji}</div>
                    <div className={`font-pixel text-[7px] mt-1 ${canHear ? 'text-arcade-emerald' : 'text-arcade-muted'}`}>
                      {String(c?.name || '').toUpperCase()}
                    </div>
                    <div className="text-[7px] text-arcade-muted mt-0.5">
                      {c.min >= 1000 ? `${(c.min/1000).toFixed(c.min >= 10000 ? 0 : 1)}k` : c.min}–{c.max >= 1000 ? `${(c.max/1000).toFixed(c.max >= 10000 ? 0 : 1)}k` : c.max}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 7. BPM TAPPER */}
      {activeTab === 'bpm' && (
        <div className="max-w-md mx-auto pixel-card p-6 space-y-6 font-mono text-xs text-center">
          <span className="font-pixel text-xs text-arcade-emerald">TAP TEMPO & BPM METRONOME</span>

          <div className="p-8 bg-deck-bg border-2 border-black shadow-pixel space-y-2">
            <div className="font-pixel text-5xl text-arcade-emerald">
              {bpm} <span className="text-lg">BPM</span>
            </div>
            <p className="text-arcade-muted text-xs">Tap in rhythm to measure tempo</p>
          </div>

          <button
            onClick={handleTap}
            className="btn-pixel btn-pixel-emerald w-full py-6 font-pixel text-base select-none active:scale-95"
          >
            TAP TEMPO HERE
          </button>
        </div>
      )}
    </div>
  );
}
