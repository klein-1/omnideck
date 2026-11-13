import React, { useState, useEffect, useRef } from 'react';
import { 
  Clock, Watch, Calendar as CalendarIcon, Timer, 
  Hourglass, Play, Pause, RotateCcw, Plus, Trash2, Globe, Flag
} from 'lucide-react';
import { playClick, playBeep, playCoin } from '../../audio/soundEffects';

export default function DateTimeTools() {
  const [activeTab, setActiveTab] = useState('clocks'); 
  // 'clocks' | 'epoch' | 'stopwatch' | 'pomodoro' | 'tally' | 'zones' | 'datediff'

  // Live time for clocks
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 100);
    return () => clearInterval(timer);
  }, []);

  // 1. ANALOG CLOCK CANVAS
  const analogCanvasRef = useRef(null);
  useEffect(() => {
    if (activeTab !== 'clocks') return;
    const canvas = analogCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const radius = canvas.width / 2;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(radius, radius);

    // Clock Face Border
    ctx.beginPath();
    ctx.arc(0, 0, radius - 6, 0, 2 * Math.PI);
    ctx.fillStyle = '#0a0d12';
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#00ff88';
    ctx.stroke();

    // Hour Ticks
    for (let num = 1; num <= 12; num++) {
      const ang = (num * Math.PI) / 6;
      ctx.rotate(ang);
      ctx.translate(0, -radius + 18);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-1.5, 0, 3, 8);
      ctx.translate(0, radius - 18);
      ctx.rotate(-ang);
    }

    const now = currentTime;
    const hour = now.getHours() % 12;
    const minute = now.getMinutes();
    const second = now.getSeconds();

    // Hour Hand
    const hourAngle = (hour * Math.PI / 6) + (minute * Math.PI / (6 * 60));
    ctx.save();
    ctx.rotate(hourAngle);
    ctx.lineWidth = 5;
    ctx.strokeStyle = '#ffb703';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -radius * 0.5);
    ctx.stroke();
    ctx.restore();

    // Minute Hand
    const minuteAngle = (minute * Math.PI / 30) + (second * Math.PI / (30 * 60));
    ctx.save();
    ctx.rotate(minuteAngle);
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#00f0ff';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -radius * 0.7);
    ctx.stroke();
    ctx.restore();

    // Second Hand
    const secondAngle = second * Math.PI / 30;
    ctx.save();
    ctx.rotate(secondAngle);
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#ff4757';
    ctx.beginPath();
    ctx.moveTo(0, 10);
    ctx.lineTo(0, -radius * 0.82);
    ctx.stroke();
    ctx.restore();

    // Center Pin
    ctx.beginPath();
    ctx.arc(0, 0, 5, 0, 2 * Math.PI);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    ctx.restore();
  }, [currentTime, activeTab]);

  // 2. UNIX EPOCH CONVERTER
  const [epochInput, setEpochInput] = useState(String(Math.floor(Date.now() / 1000)));
  const [epochHumanResult, setEpochHumanResult] = useState(null);
  const [dateInputForEpoch, setDateInputForEpoch] = useState(new Date().toISOString().slice(0, 16));
  const [convertedEpochResult, setConvertedEpochResult] = useState(null);

  useEffect(() => {
    try {
      const num = Number(epochInput);
      if (!isNaN(num) && num > 0) {
        const ms = num < 10000000000 ? num * 1000 : num;
        const d = new Date(ms);
        const diff = Math.floor((d.getTime() - Date.now()) / 1000);
        const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
        let rel = '';
        if (Math.abs(diff) < 60) rel = rtf.format(diff, 'second');
        else if (Math.abs(diff) < 3600) rel = rtf.format(Math.floor(diff / 60), 'minute');
        else if (Math.abs(diff) < 86400) rel = rtf.format(Math.floor(diff / 3600), 'hour');
        else rel = rtf.format(Math.floor(diff / 86400), 'day');

        setEpochHumanResult({
          local: d.toLocaleString(),
          utc: d.toUTCString(),
          iso: d.toISOString(),
          relative: rel
        });
      }
    } catch (e) {}
  }, [epochInput]);

  useEffect(() => {
    try {
      const d = new Date(dateInputForEpoch);
      if (!isNaN(d.getTime())) {
        setConvertedEpochResult({
          seconds: Math.floor(d.getTime() / 1000),
          ms: d.getTime()
        });
      }
    } catch (e) {}
  }, [dateInputForEpoch]);

  // 3. STOPWATCH
  const [swTime, setSwTime] = useState(0);
  const [swRunning, setSwRunning] = useState(false);
  const [laps, setLaps] = useState([]);
  const swRef = useRef(null);

  useEffect(() => {
    if (swRunning) {
      swRef.current = setInterval(() => {
        setSwTime(prev => prev + 10);
      }, 10);
    } else {
      clearInterval(swRef.current);
    }
    return () => clearInterval(swRef.current);
  }, [swRunning]);

  const addLap = () => {
    setLaps(prev => [swTime, ...prev]);
    playCoin();
  };

  const resetSw = () => {
    setSwRunning(false);
    setSwTime(0);
    setLaps([]);
    playClick();
  };

  const formatStopwatch = (ms) => {
    const mins = Math.floor(ms / 60000);
    const secs = Math.floor((ms % 60000) / 1000);
    const millis = Math.floor((ms % 1000) / 10);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(millis).padStart(2, '0')}`;
  };

  // 4. POMODORO
  const [pomoMode, setPomoMode] = useState('work');
  const [pomoSeconds, setPomoSeconds] = useState(25 * 60);
  const [pomoRunning, setPomoRunning] = useState(false);
  const [pomoCycles, setPomoCycles] = useState(0);

  useEffect(() => {
    let timer = null;
    if (pomoRunning && pomoSeconds > 0) {
      timer = setInterval(() => setPomoSeconds(prev => prev - 1), 1000);
    } else if (pomoSeconds === 0 && pomoRunning) {
      playCoin();
      if (pomoMode === 'work') {
        setPomoCycles(c => c + 1);
        setPomoMode('short');
        setPomoSeconds(5 * 60);
      } else {
        setPomoMode('work');
        setPomoSeconds(25 * 60);
      }
    }
    return () => clearInterval(timer);
  }, [pomoRunning, pomoSeconds, pomoMode]);

  // 5. TALLY COUNTER
  const [tally, setTally] = useState(0);

  // 6. DATE DIFFERENCE
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]);
  const [dateDiff, setDateDiff] = useState(null);

  useEffect(() => {
    const d1 = new Date(startDate);
    const d2 = new Date(endDate);
    const diffTime = Math.abs(d2 - d1);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    setDateDiff({
      days: diffDays,
      weeks: (diffDays / 7).toFixed(1),
      hours: diffDays * 24,
      minutes: diffDays * 24 * 60
    });
  }, [startDate, endDate]);

  // 7. WORLD TIMEZONES (Comprehensive IANA database with live search)
  const [tzSearch, setTzSearch] = useState('');
  const [tzRegionFilter, setTzRegionFilter] = useState('ALL');
  const [tzLimit, setTzLimit] = useState(36);

  // Get all system/browser supported IANA timezones
  const ALL_TIMEZONES = React.useMemo(() => {
    let list = [];
    try {
      if (typeof Intl !== 'undefined' && typeof Intl.supportedValuesOf === 'function') {
        list = Intl.supportedValuesOf('timeZone');
      }
    } catch (e) {}

    if (!list || list.length === 0) {
      list = [
        'UTC', 'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
        'America/Anchorage', 'America/Honolulu', 'America/Toronto', 'America/Vancouver',
        'America/Mexico_City', 'America/Bogota', 'America/Lima', 'America/Santiago',
        'America/Sao_Paulo', 'America/Buenos_Aires', 'Europe/London', 'Europe/Dublin',
        'Europe/Paris', 'Europe/Berlin', 'Europe/Rome', 'Europe/Madrid', 'Europe/Amsterdam',
        'Europe/Brussels', 'Europe/Vienna', 'Europe/Stockholm', 'Europe/Oslo', 'Europe/Copenhagen',
        'Europe/Helsinki', 'Europe/Athens', 'Europe/Bucharest', 'Europe/Warsaw', 'Europe/Prague',
        'Europe/Budapest', 'Europe/Kiev', 'Europe/Moscow', 'Europe/Istanbul', 'Asia/Dubai',
        'Asia/Riyadh', 'Asia/Jerusalem', 'Asia/Tehran', 'Asia/Baku', 'Asia/Tbilisi', 'Asia/Yerevan',
        'Asia/Karachi', 'Asia/Kolkata', 'Asia/Dhaka', 'Asia/Kathmandu', 'Asia/Bangkok', 'Asia/Jakarta',
        'Asia/Singapore', 'Asia/Kuala_Lumpur', 'Asia/Manila', 'Asia/Hong_Kong', 'Asia/Shanghai',
        'Asia/Taipei', 'Asia/Seoul', 'Asia/Tokyo', 'Australia/Sydney', 'Australia/Melbourne',
        'Australia/Brisbane', 'Australia/Adelaide', 'Australia/Perth', 'Pacific/Auckland',
        'Pacific/Fiji', 'Pacific/Guam', 'Africa/Cairo', 'Africa/Johannesburg', 'Africa/Lagos',
        'Africa/Nairobi', 'Africa/Casablanca', 'Africa/Accra', 'Africa/Addis_Ababa'
      ];
    }
    return list;
  }, []);

  const filteredTimezones = React.useMemo(() => {
    const q = tzSearch.trim().toLowerCase();
    return ALL_TIMEZONES.filter(tz => {
      if (tzRegionFilter !== 'ALL') {
        if (!tz.toLowerCase().startsWith(tzRegionFilter.toLowerCase())) return false;
      }
      if (!q) return true;
      const cleanName = tz.replace(/_/g, ' ').toLowerCase();
      return cleanName.includes(q) || tz.toLowerCase().includes(q);
    });
  }, [ALL_TIMEZONES, tzSearch, tzRegionFilter]);

  return (
    <div className="space-y-6">
      {/* Subtool Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar border-b-2 border-deck-border pb-3">
        {[
          { id: 'clocks', label: 'ANALOG & DIGITAL CLOCK', icon: Clock, activeClass: 'btn-pixel-teal' },
          { id: 'epoch', label: 'UNIX TIMESTAMP', icon: Clock, activeClass: 'btn-pixel-amber' },
          { id: 'stopwatch', label: 'PRECISION STOPWATCH', icon: Watch, activeClass: 'btn-pixel-cyan' },
          { id: 'pomodoro', label: 'POMODORO FOCUS', icon: Hourglass, activeClass: 'btn-pixel-coral' },
          { id: 'tally', label: 'TALLY COUNTER', icon: Plus, activeClass: 'btn-pixel-lime' },
          { id: 'zones', label: 'WORLD TIMEZONES', icon: Globe, activeClass: 'btn-pixel-purple' },
          { id: 'datediff', label: 'DATE DURATION DIFF', icon: CalendarIcon, activeClass: 'btn-pixel-blue' },
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

      {/* 1. CLOCKS */}
      {activeTab === 'clocks' && (
        <div className="max-w-2xl mx-auto pixel-card bg-deck-dark p-6 space-y-6 border border-deck-border font-mono text-center">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 py-4">
            <canvas ref={analogCanvasRef} width={220} height={220} className="border-4 border-black shadow-pixel" />

            <div className="space-y-3 text-left">
              <span className="text-[10px] text-arcade-muted font-pixel">HIGH-PRECISION DIGITAL MATRIX</span>
              <div className="font-pixel text-4xl sm:text-5xl text-arcade-emerald tracking-wider py-2">
                {currentTime.toLocaleTimeString()}
              </div>
              <div className="font-pixel text-sm text-arcade-amber">
                {currentTime.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
              <p className="text-xs text-arcade-muted">
                System UTC Offset: {currentTime.getTimezoneOffset() / -60} Hours
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 2. UNIX TIMESTAMP */}
      {activeTab === 'epoch' && (
        <div className="max-w-xl mx-auto pixel-card bg-deck-dark p-6 space-y-6 font-mono text-xs">
          <div className="flex justify-between items-center border-b border-deck-border pb-2">
            <span className="font-pixel text-xs text-arcade-emerald">UNIX EPOCH TIMESTAMP CONVERTER</span>
            <span className="font-pixel text-[9px] text-arcade-amber">UTC SECONDS / MILLISECONDS</span>
          </div>

          <div className="p-4 bg-deck-bg border-2 border-black flex justify-between items-center shadow-pixel">
            <div>
              <span className="text-arcade-muted text-[10px] block">CURRENT UNIX TIMESTAMP</span>
              <strong className="font-pixel text-xl text-arcade-emerald">
                {Math.floor(currentTime.getTime() / 1000)}
              </strong>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(String(Math.floor(Date.now() / 1000)));
                playCoin();
              }}
              className="btn-pixel btn-pixel-amber px-3 py-1.5 font-pixel text-[9px]"
            >
              COPY SECONDS
            </button>
          </div>

          <div className="space-y-3 pt-2">
            <label className="text-arcade-muted block text-[10px] font-pixel">
              TIMESTAMP TO HUMAN-READABLE DATE:
            </label>
            <input
              type="text"
              value={epochInput}
              onChange={(e) => setEpochInput(e.target.value)}
              placeholder="e.g. 1773500000"
              className="w-full bg-deck-bg border border-deck-border p-2 font-mono"
            />
            {epochHumanResult && (
              <div className="p-3 bg-deck-bg border border-deck-border space-y-1.5 text-xs">
                <div>
                  <span className="text-arcade-muted text-[10px] block">LOCAL TIME:</span>
                  <strong className="text-arcade-emerald font-pixel text-xs">{epochHumanResult.local}</strong>
                </div>
                <div>
                  <span className="text-arcade-muted text-[10px] block">UTC (GMT):</span>
                  <strong className="text-arcade-amber">{epochHumanResult.utc}</strong>
                </div>
                <div>
                  <span className="text-arcade-muted text-[10px] block">ISO 8601:</span>
                  <code className="text-arcade-cyan text-[11px]">{epochHumanResult.iso}</code>
                </div>
                <div>
                  <span className="text-arcade-muted text-[10px] block">RELATIVE:</span>
                  <span className="text-arcade-paper">{epochHumanResult.relative}</span>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-3 pt-2 border-t border-deck-border">
            <label className="text-arcade-muted block text-[10px] font-pixel">
              HUMAN DATE/TIME TO TIMESTAMP:
            </label>
            <input
              type="datetime-local"
              value={dateInputForEpoch}
              onChange={(e) => setDateInputForEpoch(e.target.value)}
              className="w-full bg-deck-bg border border-deck-border p-2 font-mono"
            />
            {convertedEpochResult && (
              <div className="grid grid-cols-2 gap-2 text-center pt-1">
                <div className="p-2 bg-deck-bg border border-deck-border">
                  <span className="text-arcade-muted text-[9px] block">SECONDS</span>
                  <strong className="font-pixel text-sm text-arcade-emerald">{convertedEpochResult.seconds}</strong>
                </div>
                <div className="p-2 bg-deck-bg border border-deck-border">
                  <span className="text-arcade-muted text-[9px] block">MILLISECONDS</span>
                  <strong className="font-pixel text-sm text-arcade-cyan">{convertedEpochResult.ms}</strong>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. STOPWATCH */}
      {activeTab === 'stopwatch' && (
        <div className="max-w-md mx-auto pixel-card bg-deck-dark p-6 space-y-6 font-mono text-center">
          <div className="font-pixel text-4xl sm:text-5xl text-arcade-cyan py-6 bg-deck-bg border-2 border-black shadow-pixel">
            {formatStopwatch(swTime)}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => { setSwRunning(!swRunning); playClick(); }}
              className={`btn-pixel flex-1 py-3 font-pixel text-xs flex items-center justify-center gap-2 ${
                swRunning ? 'btn-pixel-coral' : 'btn-pixel-emerald'
              }`}
            >
              {swRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {swRunning ? 'PAUSE' : 'START'}
            </button>
            <button
              onClick={addLap}
              disabled={!swRunning}
              className="btn-pixel btn-pixel-amber px-4 py-3 font-pixel text-xs disabled:opacity-40"
            >
              LAP
            </button>
            <button
              onClick={resetSw}
              className="btn-pixel btn-pixel-surface px-4 py-3 font-pixel text-xs"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {laps.length > 0 && (
            <div className="space-y-1 max-h-48 overflow-y-auto no-scrollbar text-xs">
              {laps.map((lap, i) => (
                <div key={i} className="flex justify-between p-2 bg-deck-bg border border-deck-border">
                  <span className="text-arcade-muted">LAP #{laps.length - i}</span>
                  <span className="font-pixel text-arcade-emerald">{formatStopwatch(lap)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 4. POMODORO */}
      {activeTab === 'pomodoro' && (
        <div className="max-w-md mx-auto pixel-card bg-deck-dark p-6 space-y-6 font-mono text-center">
          <div className="flex gap-2">
            {[
              { id: 'work', label: 'WORK (25M)', secs: 25 * 60 },
              { id: 'short', label: 'SHORT (5M)', secs: 5 * 60 },
              { id: 'long', label: 'LONG (15M)', secs: 15 * 60 }
            ].map(m => (
              <button
                key={m.id}
                onClick={() => { setPomoMode(m.id); setPomoSeconds(m.secs); setPomoRunning(false); playClick(); }}
                className={`flex-1 py-1.5 font-pixel text-[8px] border ${
                  pomoMode === m.id ? 'bg-amber-400 text-black border-black font-bold' : 'bg-deck-bg border-deck-border text-arcade-muted'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          <div className="font-pixel text-5xl text-arcade-coral py-8 bg-deck-bg border-2 border-black shadow-pixel">
            {String(Math.floor(pomoSeconds / 60)).padStart(2, '0')}:{String(pomoSeconds % 60).padStart(2, '0')}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => { setPomoRunning(!pomoRunning); playClick(); }}
              className={`btn-pixel flex-1 py-3 font-pixel text-xs flex items-center justify-center gap-2 ${
                pomoRunning ? 'btn-pixel-coral' : 'btn-pixel-emerald'
              }`}
            >
              {pomoRunning ? 'PAUSE FOCUS' : 'START FOCUS'}
            </button>
            <button
              onClick={() => { setPomoRunning(false); setPomoSeconds(25 * 60); playClick(); }}
              className="btn-pixel btn-pixel-surface px-4 py-3"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
          <div className="text-[11px] text-arcade-muted">Focus Cycles Completed: {pomoCycles}</div>
        </div>
      )}

      {/* 5. TALLY COUNTER */}
      {activeTab === 'tally' && (
        <div className="max-w-xs mx-auto pixel-card bg-deck-dark p-6 space-y-6 font-mono text-center">
          <div className="font-pixel text-6xl text-arcade-amber py-8 bg-deck-bg border-2 border-black shadow-pixel">
            {tally}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => { setTally(t => Math.max(0, t - 1)); playClick(); }}
              className="btn-pixel btn-pixel-surface flex-1 py-4 font-pixel text-xl"
            >
              -
            </button>
            <button
              onClick={() => { setTally(t => t + 1); playCoin(); }}
              className="btn-pixel btn-pixel-amber flex-1 py-4 font-pixel text-xl"
            >
              +
            </button>
          </div>
          <button
            onClick={() => { setTally(0); playClick(); }}
            className="text-[10px] text-arcade-muted hover:underline"
          >
            RESET TO ZERO
          </button>
        </div>
      )}

      {/* 6. WORLD TIMEZONES */}
      {activeTab === 'zones' && (
        <div className="space-y-4 font-mono text-xs">
          {/* Search bar & Region Filters */}
          <div className="pixel-card bg-deck-dark p-4 space-y-3 border border-deck-border">
            <div className="flex flex-col sm:flex-row gap-2 justify-between items-start sm:items-center">
              <div className="flex-1 w-full relative">
                <input
                  type="text"
                  value={tzSearch}
                  onChange={(e) => { setTzSearch(e.target.value); setTzLimit(36); }}
                  placeholder="Search 400+ world timezones (e.g. Tokyo, London, Kolkata, New York, Cairo)..."
                  className="w-full bg-deck-bg border-2 border-deck-border focus:border-arcade-purple p-2.5 font-mono text-xs text-white placeholder:text-arcade-muted/50"
                />
                {tzSearch && (
                  <button
                    onClick={() => setTzSearch('')}
                    className="absolute right-2.5 top-2.5 text-arcade-coral font-bold text-xs"
                  >
                    CLEAR
                  </button>
                )}
              </div>
              <span className="text-[10px] text-arcade-muted font-pixel shrink-0">
                {filteredTimezones.length} ZONES FOUND
              </span>
            </div>

            {/* Region quick filter tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
              {['ALL', 'America', 'Europe', 'Asia', 'Africa', 'Australia', 'Pacific', 'Atlantic', 'Indian', 'UTC'].map(reg => (
                <button
                  key={reg}
                  type="button"
                  onClick={() => { setTzRegionFilter(reg); setTzLimit(36); playClick(); }}
                  className={`px-2.5 py-1 font-pixel text-[8px] uppercase shrink-0 border transition-colors ${
                    tzRegionFilter === reg
                      ? 'bg-purple-500 text-white border-black font-bold shadow-pixel-sm'
                      : 'bg-deck-bg border-deck-border text-arcade-muted hover:text-white'
                  }`}
                >
                  {reg}
                </button>
              ))}
            </div>
          </div>

          {/* Timezones Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredTimezones.slice(0, tzLimit).map(tz => {
              let timeStr = '--:--:--';
              let dateStr = '';
              let isDay = true;
              let offsetStr = '';

              try {
                timeStr = currentTime.toLocaleTimeString([], {
                  timeZone: tz,
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                  hour12: true
                });

                dateStr = currentTime.toLocaleDateString([], {
                  timeZone: tz,
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric'
                });

                // Detect day vs night based on hour in that timezone
                const hour24 = parseInt(currentTime.toLocaleTimeString('en-US', { timeZone: tz, hour: 'numeric', hour12: false }), 10);
                isDay = hour24 >= 6 && hour24 < 18;

                // Approximate offset string
                const tzDate = new Date(currentTime.toLocaleString('en-US', { timeZone: tz }));
                const utcDate = new Date(currentTime.toLocaleString('en-US', { timeZone: 'UTC' }));
                const diffMin = Math.round((tzDate - utcDate) / 60000);
                const diffH = Math.floor(Math.abs(diffMin) / 60);
                const diffM = Math.abs(diffMin) % 60;
                offsetStr = `UTC${diffMin >= 0 ? '+' : '-'}${diffH}${diffM > 0 ? `:${diffM}` : ''}`;
              } catch (e) {
                timeStr = 'Timezone error';
              }

              const parts = tz.split('/');
              const region = parts[0];
              const city = (parts[parts.length - 1] || tz).replace(/_/g, ' ');

              return (
                <div
                  key={tz}
                  className="pixel-card bg-deck-dark p-3.5 border border-deck-border hover:border-arcade-purple/70 transition-all space-y-2 group"
                >
                  <div className="flex items-center justify-between text-[10px] text-arcade-muted">
                    <span className="font-pixel text-[8px] text-arcade-purple font-bold truncate max-w-[150px]">
                      {region} // {city}
                    </span>
                    <span className="px-1.5 py-0.5 bg-deck-bg border border-deck-border text-[8px] font-mono">
                      {offsetStr} {isDay ? '☀️' : '🌙'}
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between pt-1">
                    <div className="font-pixel text-xl sm:text-2xl text-white tracking-wider group-hover:text-purple-300 transition-colors">
                      {timeStr}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-arcade-muted/70 pt-1 border-t border-deck-border/40">
                    <span>{dateStr}</span>
                    <span className="font-mono text-[9px] truncate max-w-[140px]">{tz}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Load More Button */}
          {filteredTimezones.length > tzLimit && (
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => { setTzLimit(prev => prev + 36); playClick(); }}
                className="btn-pixel btn-pixel-purple px-6 py-2.5 font-pixel text-[9px]"
              >
                LOAD MORE TIMEZONES ({filteredTimezones.length - tzLimit} REMAINING)
              </button>
            </div>
          )}
        </div>
      )}

      {/* 7. DATE DIFF */}
      {activeTab === 'datediff' && (
        <div className="max-w-lg mx-auto pixel-card bg-deck-dark p-6 space-y-6 border border-deck-border font-mono text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-arcade-muted block mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-deck-bg border border-deck-border p-2 text-white"
              />
            </div>
            <div>
              <label className="text-arcade-muted block mb-1">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-deck-bg border border-deck-border p-2 text-white"
              />
            </div>
          </div>

          {dateDiff && (
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-deck-border">
              <div className="p-3 bg-deck-bg border border-deck-border">
                <div className="text-arcade-muted text-[10px]">TOTAL DAYS</div>
                <div className="font-pixel text-lg text-arcade-emerald">{dateDiff.days} Days</div>
              </div>
              <div className="p-3 bg-deck-bg border border-deck-border">
                <div className="text-arcade-muted text-[10px]">WEEKS</div>
                <div className="font-pixel text-lg text-arcade-amber">{dateDiff.weeks} Weeks</div>
              </div>
              <div className="p-3 bg-deck-bg border border-deck-border">
                <div className="text-arcade-muted text-[10px]">TOTAL HOURS</div>
                <div className="font-pixel text-base text-arcade-cyan">{dateDiff.hours.toLocaleString()} Hours</div>
              </div>
              <div className="p-3 bg-deck-bg border border-deck-border">
                <div className="text-arcade-muted text-[10px]">TOTAL MINUTES</div>
                <div className="font-pixel text-base text-arcade-coral">{dateDiff.minutes.toLocaleString()} Min</div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
