import React, { useState, useEffect, useRef } from 'react';
import { 
  Heart, Droplet, Moon, Eye, Flame, Plus, Check, RotateCcw, 
  Activity, Play, Pause, Volume2, Scale, Dumbbell, ShieldCheck, Compass
} from 'lucide-react';
import { playClick, playBeep, playCoin, playSuccess } from '../../audio/soundEffects';

export default function HealthTools() {
  const [activeTab, setActiveTab] = useState('breathe'); 
  // 'breathe' | 'water' | 'sleep' | 'eye' | 'bmi' | 'macros' | 'soundscape' | 'heartrate'

  // Helper for numeric inputs to eliminate "0653" bug
  const handleCleanNum = (val, setter, allowDecimal = false) => {
    let cleaned = val.replace(/[^0-9.]/g, '');
    if (!allowDecimal) cleaned = cleaned.replace(/\./g, '');
    if (cleaned.length > 1 && cleaned.startsWith('0') && !cleaned.startsWith('0.')) {
      cleaned = cleaned.replace(/^0+/, '');
    }
    setter(cleaned === '' ? '0' : cleaned);
  };

  // 1. BREATHE CONTROL
  const [breathePattern, setBreathePattern] = useState('box'); // 'box' (4-4-4-4) | 'relax' (4-7-8) | 'deep' (5-0-5-0)
  const [breathePhase, setBreathePhase] = useState('INHALE');
  const [breatheSeconds, setBreatheSeconds] = useState(4);
  const [breatheActive, setBreatheActive] = useState(false);

  useEffect(() => {
    let timer = null;
    if (breatheActive) {
      timer = setInterval(() => {
        setBreatheSeconds(s => {
          if (s <= 1) {
            if (breathePattern === 'box') {
              setBreathePhase(p => {
                if (p === 'INHALE') { playBeep(520, 0.06); return 'HOLD'; }
                if (p === 'HOLD') { playBeep(440, 0.06); return 'EXHALE'; }
                if (p === 'EXHALE') { playBeep(380, 0.06); return 'REST'; }
                playBeep(600, 0.06);
                return 'INHALE';
              });
              return 4;
            } else if (breathePattern === 'relax') {
              // 4-7-8
              if (breathePhase === 'INHALE') {
                setBreathePhase('HOLD');
                playBeep(520, 0.06);
                return 7;
              } else if (breathePhase === 'HOLD') {
                setBreathePhase('EXHALE');
                playBeep(440, 0.06);
                return 8;
              } else {
                setBreathePhase('INHALE');
                playBeep(600, 0.06);
                return 4;
              }
            } else {
              // 5-5
              setBreathePhase(p => (p === 'INHALE' ? 'EXHALE' : 'INHALE'));
              playBeep(480, 0.06);
              return 5;
            }
          }
          return s - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [breatheActive, breathePattern, breathePhase]);

  // 2. WATER TRACKER (Default starts at 0 per user requirement)
  const [waterGlasses, setWaterGlasses] = useState(0);
  const [glassSizeMl, setGlassSizeMl] = useState('250');
  const targetGlasses = 8;
  const totalWaterMl = waterGlasses * (parseInt(glassSizeMl) || 250);

  // 3. SLEEP CYCLES
  const [wakeTimes, setWakeTimes] = useState([]);
  const calculateSleepCycles = () => {
    const now = new Date();
    const times = [];
    [3, 4, 5, 6].forEach(cycles => {
      const target = new Date(now.getTime() + (cycles * 90 + 15) * 60000);
      times.push({
        cycles,
        hours: (cycles * 1.5).toFixed(1),
        time: target.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
    });
    setWakeTimes(times);
    playCoin();
  };

  useEffect(() => {
    calculateSleepCycles();
  }, []);

  // 4. 20-20-20 EYE REST TIMER
  const [eyeSeconds, setEyeSeconds] = useState(1200); // 20 min = 1200s
  const [eyeActive, setEyeActive] = useState(false);
  const [eyeStage, setEyeStage] = useState('work'); // 'work' | 'rest'

  useEffect(() => {
    let interval = null;
    if (eyeActive) {
      interval = setInterval(() => {
        setEyeSeconds(s => {
          if (s <= 1) {
            playBeep(880, 0.2);
            if (eyeStage === 'work') {
              setEyeStage('rest');
              return 20; // 20s rest
            } else {
              setEyeStage('work');
              return 1200; // 20m work
            }
          }
          return s - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [eyeActive, eyeStage]);

  // 5. BMI & BODY COMPOSITION
  const [bmiUnit, setBmiUnit] = useState('metric'); // 'metric' (kg, cm) | 'imperial' (lbs, in)
  const [bmiWeight, setBmiWeight] = useState('0');
  const [bmiHeight, setBmiHeight] = useState('0');

  const calcBmi = () => {
    const w = parseFloat(bmiWeight) || 0;
    const h = parseFloat(bmiHeight) || 0;
    if (w <= 0 || h <= 0) return 0;
    if (bmiUnit === 'metric') {
      const hM = h / 100;
      return (w / (hM * hM)).toFixed(1);
    } else {
      return ((w / (h * h)) * 703).toFixed(1);
    }
  };
  const bmiValue = parseFloat(calcBmi());

  const getBmiCategory = (bmi) => {
    if (bmi <= 0) return { label: 'ENTER STATS', color: 'text-arcade-muted' };
    if (bmi < 18.5) return { label: 'UNDERWEIGHT', color: 'text-arcade-cyan' };
    if (bmi < 24.9) return { label: 'NORMAL WEIGHT', color: 'text-arcade-emerald' };
    if (bmi < 29.9) return { label: 'OVERWEIGHT', color: 'text-arcade-amber' };
    return { label: 'OBESE', color: 'text-arcade-coral' };
  };

  // 6. DAILY CALORIE & MACRO CALCULATOR
  const [macroAge, setMacroAge] = useState('0');
  const [macroGender, setMacroGender] = useState('male');
  const [macroWeightKg, setMacroWeightKg] = useState('0');
  const [macroHeightCm, setMacroHeightCm] = useState('0');
  const [macroActivity, setMacroActivity] = useState(1.375); // Light activity
  const [macroGoal, setMacroGoal] = useState('maintain'); // 'cut' | 'maintain' | 'bulk'

  // Mifflin-St Jeor Formula
  const calcBmr = () => {
    const w = parseFloat(macroWeightKg) || 0;
    const h = parseFloat(macroHeightCm) || 0;
    const a = parseFloat(macroAge) || 0;
    if (w <= 0 || h <= 0 || a <= 0) return 0;
    const base = (10 * w) + (6.25 * h) - (5 * a);
    return Math.round(macroGender === 'male' ? base + 5 : base - 161);
  };

  const bmr = calcBmr();
  const tdee = Math.round(bmr * macroActivity);
  const targetCalories = macroGoal === 'cut' ? Math.round(tdee * 0.8) : macroGoal === 'bulk' ? Math.round(tdee * 1.15) : tdee;

  // 30% Protein, 40% Carbs, 30% Fat
  const proteinGrams = targetCalories > 0 ? Math.round((targetCalories * 0.3) / 4) : 0;
  const carbsGrams = targetCalories > 0 ? Math.round((targetCalories * 0.4) / 4) : 0;
  const fatGrams = targetCalories > 0 ? Math.round((targetCalories * 0.3) / 9) : 0;

  // 7. MINDFUL MEDITATION & SOUNDSCAPE (Web Audio)
  const [soundPlaying, setSoundPlaying] = useState(false);
  const [soundType, setSoundType] = useState('calm432'); // 'calm432' | 'healing528' | 'pink' | 'white'
  const [soundVolume, setSoundVolume] = useState(0.2);
  const audioCtxRef = useRef(null);
  const soundNodeRef = useRef(null);
  const gainNodeRef = useRef(null);

  const stopSound = () => {
    if (soundNodeRef.current) {
      try { soundNodeRef.current.stop(); } catch {}
      soundNodeRef.current = null;
    }
    if (audioCtxRef.current) {
      try { audioCtxRef.current.close(); } catch {}
      audioCtxRef.current = null;
    }
    setSoundPlaying(false);
  };

  const startSound = () => {
    stopSound();
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    audioCtxRef.current = ctx;

    const gain = ctx.createGain();
    gain.gain.value = soundVolume;
    gain.connect(ctx.destination);
    gainNodeRef.current = gain;

    if (soundType === 'calm432' || soundType === 'healing528') {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(soundType === 'calm432' ? 432 : 528, ctx.currentTime);
      osc.connect(gain);
      osc.start();
      soundNodeRef.current = osc;
    } else {
      // Noise buffer (White or Pink)
      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        if (soundType === 'pink') {
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          data[i] = (b0 + b1 + b2 + white * 0.5362) * 0.11;
        } else {
          data[i] = white * 0.1;
        }
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;
      noise.connect(gain);
      noise.start();
      soundNodeRef.current = noise;
    }

    setSoundPlaying(true);
    playClick();
  };

  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = soundVolume;
    }
  }, [soundVolume]);

  useEffect(() => {
    return () => stopSound();
  }, []);

  // 8. TARGET HEART RATE ZONES (Karvonen)
  const [hrAge, setHrAge] = useState('0');
  const [hrResting, setHrResting] = useState('0');

  const calcMaxHr = () => {
    const age = parseFloat(hrAge) || 0;
    return age > 0 ? Math.round(208 - (0.7 * age)) : 0; // Tanaka formula
  };
  const maxHr = calcMaxHr();
  const restHr = parseFloat(hrResting) || 0;
  const hrReserve = Math.max(0, maxHr - restHr);

  const getZone = (minPct, maxPct) => {
    if (maxHr <= 0) return { min: 0, max: 0 };
    if (restHr > 0) {
      return {
        min: Math.round(restHr + (hrReserve * minPct)),
        max: Math.round(restHr + (hrReserve * maxPct))
      };
    } else {
      return {
        min: Math.round(maxHr * minPct),
        max: Math.round(maxHr * maxPct)
      };
    }
  };

  return (
    <div className="space-y-6">
      {/* Subtool Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar border-b-2 border-deck-border pb-3">
        {[
          { id: 'breathe', label: 'BREATHE CONTROL', icon: Heart, activeClass: 'btn-pixel-pink' },
          { id: 'water', label: 'WATER TRACKER', icon: Droplet, activeClass: 'btn-pixel-blue' },
          { id: 'sleep', label: 'SLEEP CYCLES', icon: Moon, activeClass: 'btn-pixel-purple' },
          { id: 'eye', label: '20-20-20 EYE REST', icon: Eye, activeClass: 'btn-pixel-amber' },
          { id: 'bmi', label: 'BMI COMPOSITION', icon: Scale, activeClass: 'btn-pixel-emerald' },
          { id: 'macros', label: 'CALORIE & MACROS', icon: Flame, activeClass: 'btn-pixel-orange' },
          { id: 'soundscape', label: 'MEDITATION AUDIO', icon: Volume2, activeClass: 'btn-pixel-cyan' },
          { id: 'heartrate', label: 'HEART RATE ZONES', icon: Activity, activeClass: 'btn-pixel-coral' },
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

      {/* 1. BREATHE CONTROL */}
      {activeTab === 'breathe' && (
        <div className="max-w-md mx-auto pixel-card bg-deck-dark p-6 space-y-6 border border-deck-border font-mono text-xs text-center">
          <div className="flex justify-between items-center border-b border-deck-border pb-3">
            <span className="font-pixel text-xs text-arcade-pink">PULMONARY PACING</span>
            <div className="flex gap-1.5">
              {[
                { id: 'box', label: 'BOX 4-4' },
                { id: 'relax', label: 'RELAX 4-7-8' },
                { id: 'deep', label: 'DEEP 5-5' },
              ].map(p => (
                <button
                  key={p.id}
                  onClick={() => { setBreathePattern(p.id); setBreathePhase('INHALE'); setBreatheSeconds(4); playClick(); }}
                  className={`px-2 py-1 font-pixel text-[8px] uppercase border ${
                    breathePattern === p.id ? 'bg-deck-surface border-arcade-pink text-arcade-pink' : 'bg-deck-bg border-deck-border text-arcade-muted'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Animated Circle */}
          <div className="relative w-56 h-56 mx-auto flex items-center justify-center">
            <div
              className={`w-48 h-48 rounded-full border-4 border-arcade-pink flex flex-col items-center justify-center shadow-pixel transition-all duration-1000 ${
                breathePhase === 'INHALE' ? 'scale-110 bg-pink-950/60' :
                breathePhase === 'EXHALE' ? 'scale-75 bg-deck-bg' :
                'scale-100 bg-deck-dark'
              }`}
            >
              <span className="font-pixel text-base text-white">{breathePhase}</span>
              <span className="font-pixel text-4xl text-arcade-pink mt-1">{breatheSeconds}</span>
            </div>
          </div>

          <button
            onClick={() => { setBreatheActive(!breatheActive); playClick(); }}
            className={`btn-pixel w-full py-3 font-pixel text-xs ${
              breatheActive ? 'btn-pixel-coral' : 'btn-pixel-pink'
            }`}
          >
            {breatheActive ? 'PAUSE CYCLE' : 'START BREATHING'}
          </button>
        </div>
      )}

      {/* 2. WATER TRACKER */}
      {activeTab === 'water' && (
        <div className="max-w-md mx-auto pixel-card bg-deck-dark p-6 space-y-6 border border-deck-border font-mono text-xs text-center">
          <span className="font-pixel text-xs text-arcade-cyan">DAILY HYDRATION LOG</span>

          <div className="font-pixel text-5xl text-arcade-cyan py-4 bg-deck-bg border border-black text-glow-cyan">
            {waterGlasses} / {targetGlasses} <span className="text-sm">GLASSES</span>
          </div>

          <div className="text-xs text-arcade-muted">
            Total Intake: <strong className="text-white font-pixel">{totalWaterMl} ML</strong> ({ (totalWaterMl / 1000).toFixed(2) } L)
          </div>

          <div className="flex justify-center gap-2">
            {Array.from({ length: targetGlasses }).map((_, i) => (
              <div
                key={i}
                className={`w-7 h-10 border-2 border-black ${
                  i < waterGlasses ? 'bg-arcade-cyan shadow-pixel-sm' : 'bg-deck-bg'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center justify-center gap-2">
            <label className="text-arcade-muted text-[11px]">Glass size:</label>
            <input
              type="text"
              value={glassSizeMl}
              onFocus={(e) => e.target.select()}
              onChange={(e) => handleCleanNum(e.target.value, setGlassSizeMl)}
              className="w-16 bg-deck-bg border border-deck-border p-1 text-center text-white font-bold"
            />
            <span className="text-arcade-muted text-[11px]">ml</span>
          </div>

          <div className="flex justify-center gap-3">
            <button
              onClick={() => { setWaterGlasses(Math.max(0, waterGlasses - 1)); playClick(); }}
              className="btn-pixel btn-pixel-surface px-4 py-2 font-pixel text-xs"
            >
              -1
            </button>
            <button
              onClick={() => { setWaterGlasses(waterGlasses + 1); playCoin(); }}
              className="btn-pixel btn-pixel-cyan px-6 py-2 font-pixel text-xs"
            >
              +1 GLASS ({glassSizeMl}ML)
            </button>
            <button
              onClick={() => { setWaterGlasses(0); playClick(); }}
              className="btn-pixel btn-pixel-surface px-3 py-2 font-pixel text-xs text-arcade-coral"
              title="Reset"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* 3. SLEEP CYCLES */}
      {activeTab === 'sleep' && (
        <div className="max-w-xl mx-auto pixel-card bg-deck-dark p-6 space-y-4 border border-deck-border font-mono text-xs">
          <div className="flex justify-between items-center border-b border-deck-border pb-2">
            <span className="font-pixel text-xs text-arcade-violet">OPTIMAL 90-MINUTE SLEEP CYCLES</span>
            <button onClick={calculateSleepCycles} className="btn-pixel btn-pixel-surface px-2.5 py-1 font-pixel text-[8px] flex items-center gap-1 text-white">
              <RotateCcw className="w-3 h-3" /> REFRESH
            </button>
          </div>
          <p className="text-arcade-muted text-xs leading-relaxed">
            Waking up in the middle of a sleep cycle leaves you feeling groggy. If you go to bed right now, wake up at one of these times to wake up feeling refreshed:
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            {wakeTimes.map((item, idx) => (
              <div key={idx} className="p-3 bg-deck-bg border border-deck-border text-center space-y-1 hover:border-arcade-emerald transition-colors">
                <div className="font-pixel text-lg text-arcade-emerald">{item.time}</div>
                <div className="text-arcade-muted text-[10px]">{item.cycles} Cycles ({item.hours}h)</div>
                {item.cycles === 5 && (
                  <span className="font-pixel text-[7px] text-arcade-amber block">★ RECOMMENDED</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. 20-20-20 EYE REST */}
      {activeTab === 'eye' && (
        <div className="max-w-md mx-auto pixel-card bg-deck-dark p-6 space-y-5 border border-deck-border font-mono text-xs text-center">
          <span className="font-pixel text-xs text-arcade-amber">20-20-20 OPHTHALMIC REST RULE</span>

          <div className={`py-6 bg-deck-bg border-2 border-black shadow-pixel ${eyeStage === 'rest' ? 'border-arcade-emerald' : ''}`}>
            <span className="font-pixel text-[9px] uppercase tracking-wider block mb-1 text-arcade-muted">
              {eyeStage === 'work' ? 'WORK SESSION COUNTDOWN' : '👀 REST YOUR EYES! LOOK 20 FT AWAY'}
            </span>
            <div className={`font-pixel text-4xl ${eyeStage === 'rest' ? 'text-arcade-emerald animate-pulse' : 'text-white'}`}>
              {Math.floor(eyeSeconds / 60).toString().padStart(2, '0')}:
              {(eyeSeconds % 60).toString().padStart(2, '0')}
            </div>
          </div>

          <div className="flex justify-center gap-2">
            <button
              onClick={() => { setEyeActive(!eyeActive); playClick(); }}
              className={`btn-pixel px-6 py-2.5 font-pixel text-xs ${eyeActive ? 'btn-pixel-coral' : 'btn-pixel-amber'}`}
            >
              {eyeActive ? 'PAUSE TIMER' : 'START 20-MIN TIMER'}
            </button>
            <button
              onClick={() => { setEyeActive(false); setEyeSeconds(1200); setEyeStage('work'); playClick(); }}
              className="btn-pixel btn-pixel-surface px-4 py-2.5 font-pixel text-xs text-arcade-muted"
            >
              RESET
            </button>
          </div>

          <div className="p-3 bg-deck-bg border border-deck-border text-slate-300 text-[11px] leading-relaxed text-left space-y-1">
            <p>Every <strong className="text-arcade-amber">20 MINUTES</strong> of screen time,</p>
            <p>Look at an object <strong className="text-arcade-cyan">20 FEET AWAY</strong>,</p>
            <p>For at least <strong className="text-arcade-emerald">20 SECONDS</strong> to relax ciliary muscles.</p>
          </div>
        </div>
      )}

      {/* 5. BMI COMPOSITION */}
      {activeTab === 'bmi' && (
        <div className="max-w-xl mx-auto pixel-card bg-deck-dark p-6 space-y-5 border border-deck-border font-mono text-xs">
          <div className="flex justify-between items-center border-b border-deck-border pb-3">
            <span className="font-pixel text-xs text-arcade-emerald uppercase">BMI & COMPOSITION GAUGE</span>
            <div className="flex gap-1.5">
              {['metric', 'imperial'].map(u => (
                <button
                  key={u}
                  onClick={() => { setBmiUnit(u); playClick(); }}
                  className={`px-2.5 py-1 font-pixel text-[8px] uppercase border ${
                    bmiUnit === u ? 'bg-deck-surface border-arcade-emerald text-arcade-emerald' : 'bg-deck-bg border-deck-border text-arcade-muted'
                  }`}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-arcade-muted block mb-1">
                Weight ({bmiUnit === 'metric' ? 'kg' : 'lbs'})
              </label>
              <input
                type="text"
                value={bmiWeight}
                onFocus={(e) => e.target.select()}
                onChange={(e) => handleCleanNum(e.target.value, setBmiWeight, true)}
                className="w-full bg-deck-bg border border-deck-border p-2.5 text-white font-bold text-center"
              />
            </div>
            <div>
              <label className="text-arcade-muted block mb-1">
                Height ({bmiUnit === 'metric' ? 'cm' : 'inches'})
              </label>
              <input
                type="text"
                value={bmiHeight}
                onFocus={(e) => e.target.select()}
                onChange={(e) => handleCleanNum(e.target.value, setBmiHeight, true)}
                className="w-full bg-deck-bg border border-deck-border p-2.5 text-white font-bold text-center"
              />
            </div>
          </div>

          {/* Results Display */}
          <div className="p-4 bg-deck-bg border border-deck-border text-center space-y-2">
            <span className="text-[10px] text-arcade-muted uppercase">BODY MASS INDEX (BMI)</span>
            <div className="font-pixel text-4xl text-arcade-emerald text-glow-emerald">
              {bmiValue > 0 ? bmiValue : '0.0'}
            </div>
            <div className={`font-pixel text-xs ${getBmiCategory(bmiValue).color}`}>
              {getBmiCategory(bmiValue).label}
            </div>

            {/* Gauge bar */}
            <div className="w-full h-3 bg-deck-dark border border-black flex overflow-hidden mt-2">
              <div className="h-full bg-arcade-cyan" style={{ width: '25%' }} title="Underweight (<18.5)"></div>
              <div className="h-full bg-arcade-emerald" style={{ width: '25%' }} title="Normal (18.5-24.9)"></div>
              <div className="h-full bg-arcade-amber" style={{ width: '25%' }} title="Overweight (25-29.9)"></div>
              <div className="h-full bg-arcade-coral" style={{ width: '25%' }} title="Obese (30+)"></div>
            </div>
            <div className="flex justify-between text-[8px] text-arcade-muted px-1 font-pixel">
              <span>UNDER</span>
              <span>NORMAL</span>
              <span>OVER</span>
              <span>OBESE</span>
            </div>
          </div>
        </div>
      )}

      {/* 6. CALORIE & MACROS */}
      {activeTab === 'macros' && (
        <div className="max-w-2xl mx-auto pixel-card bg-deck-dark p-6 space-y-5 border border-deck-border font-mono text-xs">
          <span className="font-pixel text-xs text-arcade-orange uppercase">DAILY CALORIE & MACRONUTRIENT ARCHITECT</span>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-arcade-muted block mb-1">Age</label>
              <input
                type="text"
                value={macroAge}
                onFocus={(e) => e.target.select()}
                onChange={(e) => handleCleanNum(e.target.value, setMacroAge)}
                className="w-full bg-deck-bg border border-deck-border p-2 text-white font-bold text-center"
              />
            </div>
            <div>
              <label className="text-arcade-muted block mb-1">Gender</label>
              <select
                value={macroGender}
                onChange={(e) => setMacroGender(e.target.value)}
                className="w-full bg-deck-bg border border-deck-border p-2 text-white"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            <div>
              <label className="text-arcade-muted block mb-1">Weight (kg)</label>
              <input
                type="text"
                value={macroWeightKg}
                onFocus={(e) => e.target.select()}
                onChange={(e) => handleCleanNum(e.target.value, setMacroWeightKg, true)}
                className="w-full bg-deck-bg border border-deck-border p-2 text-white font-bold text-center"
              />
            </div>
            <div>
              <label className="text-arcade-muted block mb-1">Height (cm)</label>
              <input
                type="text"
                value={macroHeightCm}
                onFocus={(e) => e.target.select()}
                onChange={(e) => handleCleanNum(e.target.value, setMacroHeightCm, true)}
                className="w-full bg-deck-bg border border-deck-border p-2 text-white font-bold text-center"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-arcade-muted block mb-1">Activity Level</label>
              <select
                value={macroActivity}
                onChange={(e) => setMacroActivity(parseFloat(e.target.value))}
                className="w-full bg-deck-bg border border-deck-border p-2 text-white"
              >
                <option value={1.2}>Sedentary (Office desk work)</option>
                <option value={1.375}>Light Exercise (1-3 days/week)</option>
                <option value={1.55}>Moderate Exercise (3-5 days/week)</option>
                <option value={1.725}>Heavy Training (6-7 days/week)</option>
                <option value={1.9}>Athlete / Physical Job</option>
              </select>
            </div>
            <div>
              <label className="text-arcade-muted block mb-1">Fitness Target</label>
              <div className="flex gap-2">
                {[
                  { id: 'cut', label: 'FAT LOSS' },
                  { id: 'maintain', label: 'MAINTAIN' },
                  { id: 'bulk', label: 'BULK' },
                ].map(g => (
                  <button
                    key={g.id}
                    onClick={() => setMacroGoal(g.id)}
                    className={`flex-1 py-2 font-pixel text-[8px] border ${
                      macroGoal === g.id ? 'bg-deck-surface border-arcade-orange text-arcade-orange' : 'bg-deck-bg border-deck-border text-arcade-muted'
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Results Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-3 bg-deck-bg border border-deck-border text-center">
              <span className="text-[10px] text-arcade-muted block">TARGET ENERGY</span>
              <span className="font-pixel text-xl text-arcade-orange">{targetCalories}</span>
              <span className="text-[9px] text-slate-400 block">KCAL / DAY</span>
            </div>
            <div className="p-3 bg-deck-bg border border-deck-border text-center">
              <span className="text-[10px] text-arcade-muted block">PROTEIN (30%)</span>
              <span className="font-pixel text-xl text-arcade-coral">{proteinGrams}g</span>
              <span className="text-[9px] text-slate-400 block">{proteinGrams * 4} kcal</span>
            </div>
            <div className="p-3 bg-deck-bg border border-deck-border text-center">
              <span className="text-[10px] text-arcade-muted block">CARBS (40%)</span>
              <span className="font-pixel text-xl text-arcade-cyan">{carbsGrams}g</span>
              <span className="text-[9px] text-slate-400 block">{carbsGrams * 4} kcal</span>
            </div>
            <div className="p-3 bg-deck-bg border border-deck-border text-center">
              <span className="text-[10px] text-arcade-muted block">FATS (30%)</span>
              <span className="font-pixel text-xl text-arcade-amber">{fatGrams}g</span>
              <span className="text-[9px] text-slate-400 block">{fatGrams * 9} kcal</span>
            </div>
          </div>
        </div>
      )}

      {/* 7. MINDFUL MEDITATION & SOUNDSCAPE */}
      {activeTab === 'soundscape' && (
        <div className="max-w-md mx-auto pixel-card bg-deck-dark p-6 space-y-6 border border-deck-border font-mono text-xs text-center">
          <span className="font-pixel text-xs text-arcade-cyan">AMBIENT NEURO-ACOUSTIC SOUNDSCAPE</span>

          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'calm432', label: '432 Hz Pure Resonance' },
              { id: 'healing528', label: '528 Hz Solfeggio' },
              { id: 'pink', label: 'Pink Noise' },
              { id: 'white', label: 'White Noise' },
            ].map(s => (
              <button
                key={s.id}
                onClick={() => { setSoundType(s.id); if (soundPlaying) startSound(); }}
                className={`p-3 font-pixel text-[9px] border ${
                  soundType === s.id ? 'bg-deck-surface border-arcade-cyan text-arcade-cyan' : 'bg-deck-bg border-deck-border text-arcade-muted'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center text-arcade-muted">
              <span>VOLUME METER</span>
              <span className="font-pixel text-white">{Math.round(soundVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={soundVolume}
              onChange={(e) => setSoundVolume(parseFloat(e.target.value))}
              className="w-full accent-arcade-cyan"
            />
          </div>

          <button
            onClick={soundPlaying ? stopSound : startSound}
            className={`btn-pixel w-full py-3 font-pixel text-xs flex items-center justify-center gap-2 ${
              soundPlaying ? 'btn-pixel-coral' : 'btn-pixel-cyan'
            }`}
          >
            {soundPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-black" />}
            {soundPlaying ? 'STOP SOUNDSCAPE' : 'PLAY MEDITATION AUDIO'}
          </button>
        </div>
      )}

      {/* 8. HEART RATE ZONES */}
      {activeTab === 'heartrate' && (
        <div className="max-w-2xl mx-auto pixel-card bg-deck-dark p-6 space-y-5 border border-deck-border font-mono text-xs">
          <span className="font-pixel text-xs text-arcade-coral uppercase">CARDIOVASCULAR TRAINING INTENSITY ZONES</span>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-arcade-muted block mb-1">Age (Years)</label>
              <input
                type="text"
                value={hrAge}
                onFocus={(e) => e.target.select()}
                onChange={(e) => handleCleanNum(e.target.value, setHrAge)}
                className="w-full bg-deck-bg border border-deck-border p-2.5 text-white font-bold text-center"
              />
            </div>
            <div>
              <label className="text-arcade-muted block mb-1">Resting Heart Rate (BPM, optional)</label>
              <input
                type="text"
                value={hrResting}
                onFocus={(e) => e.target.select()}
                onChange={(e) => handleCleanNum(e.target.value, setHrResting)}
                className="w-full bg-deck-bg border border-deck-border p-2.5 text-white font-bold text-center"
              />
            </div>
          </div>

          <div className="space-y-2 pt-2">
            {[
              { name: 'ZONE 1: ACTIVE RECOVERY', range: getZone(0.5, 0.6), pct: '50-60%', color: 'border-arcade-cyan text-arcade-cyan', desc: 'Warmup, cool-down, active recovery' },
              { name: 'ZONE 2: FAT BURN & ENDURANCE', range: getZone(0.6, 0.7), pct: '60-70%', color: 'border-arcade-emerald text-arcade-emerald', desc: 'Base cardiovascular fitness, fat oxidation' },
              { name: 'ZONE 3: AEROBIC EFFICIENCY', range: getZone(0.7, 0.8), pct: '70-80%', color: 'border-arcade-amber text-arcade-amber', desc: 'Tempo runs, stamina improvement' },
              { name: 'ZONE 4: ANAEROBIC THRESHOLD', range: getZone(0.8, 0.9), pct: '80-90%', color: 'border-arcade-orange text-arcade-orange', desc: 'Lactate threshold, sprint performance' },
              { name: 'ZONE 5: MAXIMUM VO2 EFFORT', range: getZone(0.9, 1.0), pct: '90-100%', color: 'border-arcade-coral text-arcade-coral', desc: 'Peak neuromuscular power' },
            ].map((z, idx) => (
              <div key={idx} className={`p-3 bg-deck-bg border ${z.color} flex justify-between items-center`}>
                <div>
                  <div className="font-bold text-xs">{z.name}</div>
                  <div className="text-[10px] text-arcade-muted">{z.desc}</div>
                </div>
                <div className="text-right">
                  <span className="font-pixel text-base">{z.range.min} - {z.range.max} <span className="text-[10px]">BPM</span></span>
                  <span className="text-[10px] text-arcade-muted block font-pixel">{z.pct}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
