import React, { useState, useEffect } from 'react';
import { 
  Heart, Droplet, Moon, Eye, Flame, Plus, Check, RotateCcw
} from 'lucide-react';
import { playClick, playBeep, playCoin } from '../../audio/soundEffects';

export default function HealthTools() {
  const [activeTab, setActiveTab] = useState('breathe'); 
  // 'breathe' | 'water' | 'sleep' | 'eye' | 'calorie'

  // 1. BREATHE CONTROL (Box breathing 4-4-4-4)
  const [breathePhase, setBreathePhase] = useState('INHALE');
  const [breatheSeconds, setBreatheSeconds] = useState(4);
  const [breatheActive, setBreatheActive] = useState(false);

  useEffect(() => {
    let timer = null;
    if (breatheActive) {
      timer = setInterval(() => {
        setBreatheSeconds(s => {
          if (s <= 1) {
            setBreathePhase(p => {
              if (p === 'INHALE') return 'HOLD';
              if (p === 'HOLD') return 'EXHALE';
              if (p === 'EXHALE') return 'REST';
              return 'INHALE';
            });
            playBeep(440, 0.05);
            return 4;
          }
          return s - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [breatheActive]);

  // 2. WATER TRACKER
  const [waterGlasses, setWaterGlasses] = useState(3);
  const targetGlasses = 8;

  // 3. SLEEP CYCLE CALCULATOR (90-min cycles)
  const [wakeTimes, setWakeTimes] = useState([]);
  const calculateSleepCycles = () => {
    const now = new Date();
    const times = [];
    // Calculate 3, 4, 5, 6 cycles of 90 minutes (+15 min to fall asleep)
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

  return (
    <div className="space-y-6">
      {/* Subtool Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar border-b-2 border-deck-border pb-3">
        {[
          { id: 'breathe', label: 'BREATHE CONTROL', icon: Heart },
          { id: 'water', label: 'WATER TRACKER', icon: Droplet },
          { id: 'sleep', label: 'SLEEP CYCLES', icon: Moon },
          { id: 'eye', label: '20-20-20 EYE REST', icon: Eye },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => { playClick(); setActiveTab(tab.id); }}
              className={`btn-pixel px-3 py-1.5 font-pixel text-[9px] flex items-center gap-2 shrink-0 ${
                isActive ? 'btn-pixel-coral' : 'btn-pixel-surface'
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
          <span className="font-pixel text-xs text-arcade-cyan">BOX BREATHING (4-4-4-4)</span>

          {/* Animated Circle */}
          <div className="relative w-56 h-56 mx-auto flex items-center justify-center">
            <div
              className={`w-48 h-48 rounded-full border-4 border-arcade-cyan flex flex-col items-center justify-center shadow-pixel transition-all duration-1000 ${
                breathePhase === 'INHALE' ? 'scale-110 bg-cyan-950/60' :
                breathePhase === 'EXHALE' ? 'scale-75 bg-deck-bg' :
                'scale-100 bg-deck-dark'
              }`}
            >
              <span className="font-pixel text-base text-white">{breathePhase}</span>
              <span className="font-pixel text-3xl text-arcade-cyan mt-1">{breatheSeconds}</span>
            </div>
          </div>

          <button
            onClick={() => { setBreatheActive(!breatheActive); playClick(); }}
            className={`btn-pixel w-full py-3 font-pixel text-xs ${
              breatheActive ? 'btn-pixel-coral' : 'btn-pixel-cyan'
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
              +1 GLASS (250ML)
            </button>
          </div>
        </div>
      )}

      {/* 3. SLEEP CYCLES */}
      {activeTab === 'sleep' && (
        <div className="max-w-xl mx-auto pixel-card bg-deck-dark p-6 space-y-4 border border-deck-border font-mono text-xs">
          <span className="font-pixel text-xs text-arcade-violet">OPTIMAL 90-MINUTE SLEEP CYCLES</span>
          <p className="text-arcade-muted text-xs">
            If you go to sleep right now, wake up at one of the following times to rise at the end of a natural REM cycle and feel energized:
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            {wakeTimes.map((item, idx) => (
              <div key={idx} className="p-3 bg-deck-bg border border-deck-border text-center space-y-1">
                <div className="font-pixel text-lg text-arcade-emerald">{item.time}</div>
                <div className="text-arcade-muted text-[10px]">{item.cycles} Cycles ({item.hours}h)</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. 20-20-20 EYE REST */}
      {activeTab === 'eye' && (
        <div className="max-w-md mx-auto pixel-card bg-deck-dark p-6 space-y-4 border border-deck-border font-mono text-xs text-center">
          <span className="font-pixel text-xs text-arcade-amber">20-20-20 OPHTHALMIC REST RULE</span>
          <div className="p-4 bg-deck-bg border border-deck-border text-slate-300 text-xs leading-relaxed space-y-2">
            <p>Every <strong className="text-arcade-amber font-pixel text-[10px]">20 MINUTES</strong></p>
            <p>Look at an object <strong className="text-arcade-cyan font-pixel text-[10px]">20 FEET AWAY</strong></p>
            <p>For at least <strong className="text-arcade-emerald font-pixel text-[10px]">20 SECONDS</strong></p>
          </div>
        </div>
      )}
    </div>
  );
}

