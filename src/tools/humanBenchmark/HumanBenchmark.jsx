import React, { useState, useEffect, useRef } from 'react';
import { 
  Zap, Target, Brain, Hash, Type, RotateCcw, Play, CheckCircle
} from 'lucide-react';
import { playClick, playBeep, playCoin, playError, playSuccess } from '../../audio/soundEffects';

export default function HumanBenchmark() {
  const [activeTab, setActiveTab] = useState('reaction'); 
  // 'reaction' | 'aim' | 'chimp' | 'number' | 'typing'

  // 1. REACTION TIME TEST
  const [reactionState, setReactionState] = useState('idle'); // 'idle' | 'waiting' | 'ready' | 'result'
  const [reactionTime, setReactionTime] = useState(0);
  const [reactionHistory, setReactionHistory] = useState([]);
  const reactionTimerRef = useRef(null);
  const reactionStartRef = useRef(null);

  const startReactionTest = () => {
    setReactionState('waiting');
    playClick();
    const delay = Math.floor(Math.random() * 2500) + 1500; // 1.5s to 4s
    reactionTimerRef.current = setTimeout(() => {
      setReactionState('ready');
      reactionStartRef.current = performance.now();
      playBeep(880, 0.05);
    }, delay);
  };

  const handleReactionClick = () => {
    if (reactionState === 'waiting') {
      clearTimeout(reactionTimerRef.current);
      setReactionState('idle');
      alert('Too soon! Wait for the screen to turn GREEN.');
      playError();
    } else if (reactionState === 'ready') {
      const elapsed = Math.round(performance.now() - reactionStartRef.current);
      setReactionTime(elapsed);
      setReactionHistory([elapsed, ...reactionHistory]);
      setReactionState('result');
      playCoin();
    }
  };

  // 2. AIM TRAINER
  const [aimTargetsLeft, setAimTargetsLeft] = useState(30);
  const [aimRunning, setAimRunning] = useState(false);
  const [targetPos, setTargetPos] = useState({ x: 50, y: 50 });
  const [aimStartTime, setAimStartTime] = useState(0);
  const [aimFinalTime, setAimFinalTime] = useState(null);

  const startAimTrainer = () => {
    setAimTargetsLeft(30);
    setAimRunning(true);
    setAimFinalTime(null);
    setAimStartTime(Date.now());
    spawnNewTarget();
    playClick();
  };

  const spawnNewTarget = () => {
    setTargetPos({
      x: Math.floor(Math.random() * 80) + 10,
      y: Math.floor(Math.random() * 70) + 15
    });
  };

  const handleTargetClick = () => {
    if (!aimRunning) return;
    playCoin();
    if (aimTargetsLeft <= 1) {
      setAimRunning(false);
      setAimFinalTime(((Date.now() - aimStartTime) / 30).toFixed(0));
      playSuccess();
    } else {
      setAimTargetsLeft(prev => prev - 1);
      spawnNewTarget();
    }
  };

  // 3. CHIMP TEST (Working memory 1 to 9)
  const [chimpTiles, setChimpTiles] = useState([]);
  const [chimpNextNum, setChimpNextNum] = useState(1);
  const [chimpHidden, setChimpHidden] = useState(false);
  const [chimpGameOver, setChimpGameOver] = useState(false);
  const [chimpScore, setChimpScore] = useState(4); // Start with 4 numbers

  const startChimpRound = (numCount = chimpScore) => {
    const tiles = [];
    while (tiles.length < numCount) {
      const pos = Math.floor(Math.random() * 25);
      if (!tiles.some(t => t.pos === pos)) {
        tiles.push({ pos, num: tiles.length + 1 });
      }
    }
    setChimpTiles(tiles);
    setChimpNextNum(1);
    setChimpHidden(false);
    setChimpGameOver(false);
  };

  const handleChimpClick = (tile) => {
    if (tile.num === chimpNextNum) {
      playClick();
      if (chimpNextNum === 1) setChimpHidden(true);
      if (chimpNextNum === chimpTiles.length) {
        // Round won!
        playCoin();
        setChimpScore(s => s + 1);
        setTimeout(() => startChimpRound(chimpScore + 1), 500);
      } else {
        setChimpNextNum(n => n + 1);
      }
    } else {
      setChimpGameOver(true);
      playError();
    }
  };

  // 4. TYPING SPEED TEST
  const sampleTypingText = "The quick brown fox jumps over the lazy dog while engineering pixel perfect cybernetic systems.";
  const [typingInput, setTypingInput] = useState('');
  const [typingStartTime, setTypingStartTime] = useState(null);
  const [typingWpm, setTypingWpm] = useState(0);

  const handleTypingChange = (e) => {
    const val = e.target.value;
    if (!typingStartTime) setTypingStartTime(Date.now());
    setTypingInput(val);

    const elapsedMin = (Date.now() - (typingStartTime || Date.now())) / 60000;
    const words = val.trim().split(/\s+/).length;
    if (elapsedMin > 0) {
      setTypingWpm(Math.round(words / elapsedMin));
    }
  };

  return (
    <div className="space-y-6">
      {/* Subtool Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar border-b-2 border-deck-border pb-3">
        {[
          { id: 'reaction', label: 'REACTION TIME', icon: Zap, color: 'btn-pixel-coral' },
          { id: 'aim', label: 'AIM TRAINER', icon: Target, color: 'btn-pixel-cyan' },
          { id: 'chimp', label: 'CHIMP TEST', icon: Brain, color: 'btn-pixel-amber' },
          { id: 'typing', label: 'TYPING TEST', icon: Type, color: 'btn-pixel-purple' },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => { playClick(); setActiveTab(tab.id); }}
              className={`btn-pixel px-3 py-1.5 font-pixel text-[9px] flex items-center gap-2 shrink-0 ${
                isActive ? tab.color : 'btn-pixel-surface'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* 1. REACTION TIME */}
      {activeTab === 'reaction' && (
        <div className="max-w-xl mx-auto pixel-card bg-deck-dark p-6 space-y-4 border border-deck-border font-mono text-xs text-center">
          <span className="font-pixel text-xs text-arcade-emerald uppercase">HUMAN REACTION SPEED BENCHMARK</span>

          <div
            onClick={reactionState === 'idle' || reactionState === 'result' ? startReactionTest : handleReactionClick}
            className={`w-full h-64 border-4 border-black cursor-pointer shadow-pixel flex flex-col items-center justify-center p-4 transition-colors select-none ${
              reactionState === 'idle' ? 'bg-deck-bg text-slate-300' :
              reactionState === 'waiting' ? 'bg-red-900 text-white' :
              reactionState === 'ready' ? 'bg-arcade-emerald text-black font-bold' :
              'bg-deck-bg text-arcade-cyan'
            }`}
          >
            {reactionState === 'idle' && (
              <>
                <Zap className="w-12 h-12 mb-3 text-arcade-amber" />
                <span className="font-pixel text-sm">CLICK ANYWHERE TO START</span>
                <p className="text-xs text-arcade-muted mt-2">When red turns GREEN, click as fast as you can.</p>
              </>
            )}

            {reactionState === 'waiting' && (
              <span className="font-pixel text-base">WAIT FOR GREEN...</span>
            )}

            {reactionState === 'ready' && (
              <span className="font-pixel text-3xl">CLICK NOW!</span>
            )}

            {reactionState === 'result' && (
              <>
                <span className="font-pixel text-4xl text-arcade-emerald py-2 text-glow-emerald">{reactionTime} MS</span>
                <span className="text-xs text-arcade-muted mt-2">Click to try again</span>
              </>
            )}
          </div>

          {reactionHistory.length > 0 && (
            <div className="flex justify-between items-center text-xs text-arcade-muted pt-2 border-t border-deck-border">
              <span>Attempts: {reactionHistory.length}</span>
              <span>Fastest: <strong className="text-arcade-emerald font-pixel">{Math.min(...reactionHistory)} ms</strong></span>
              <span>Avg: <strong className="text-arcade-amber font-pixel">
                {Math.round(reactionHistory.reduce((a, b) => a + b, 0) / reactionHistory.length)} ms
              </strong></span>
            </div>
          )}
        </div>
      )}

      {/* 2. AIM TRAINER */}
      {activeTab === 'aim' && (
        <div className="max-w-2xl mx-auto pixel-card bg-deck-dark p-6 space-y-4 border border-deck-border font-mono text-xs text-center">
          <div className="flex justify-between items-center border-b border-deck-border pb-2">
            <span className="font-pixel text-xs text-arcade-cyan">AIM & REFLEX TARGET TRAINER</span>
            <span className="font-pixel text-xs text-arcade-amber">TARGETS LEFT: {aimTargetsLeft}</span>
          </div>

          <div className="relative w-full h-80 bg-deck-bg border-4 border-black overflow-hidden cursor-crosshair">
            {!aimRunning && !aimFinalTime && (
              <div className="absolute inset-0 flex flex-col items-center justify-center space-y-3">
                <Target className="w-12 h-12 text-arcade-cyan" />
                <span className="font-pixel text-xs text-white">HIT 30 TARGETS AS FAST AS POSSIBLE</span>
                <button
                  onClick={startAimTrainer}
                  className="btn-pixel btn-pixel-cyan px-6 py-2.5 font-pixel text-xs"
                >
                  START TEST
                </button>
              </div>
            )}

            {aimRunning && (
              <div
                onClick={handleTargetClick}
                className="absolute w-10 h-10 rounded-full bg-arcade-coral border-2 border-white shadow-pixel-sm cursor-pointer -translate-x-1/2 -translate-y-1/2"
                style={{ top: `${targetPos.y}%`, left: `${targetPos.x}%` }}
              >
                <div className="w-3 h-3 rounded-full bg-white mx-auto mt-3"></div>
              </div>
            )}

            {aimFinalTime && (
              <div className="absolute inset-0 flex flex-col items-center justify-center space-y-3">
                <span className="font-pixel text-sm text-arcade-muted">AVERAGE TIME PER TARGET</span>
                <span className="font-pixel text-4xl text-arcade-emerald">{aimFinalTime} MS</span>
                <button
                  onClick={startAimTrainer}
                  className="btn-pixel btn-pixel-cyan px-6 py-2.5 font-pixel text-xs"
                >
                  RETRY
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. CHIMP TEST */}
      {activeTab === 'chimp' && (
        <div className="max-w-md mx-auto pixel-card bg-deck-dark p-6 space-y-4 border border-deck-border font-mono text-xs text-center">
          <div className="flex justify-between items-center border-b border-deck-border pb-2">
            <span className="font-pixel text-xs text-arcade-amber">CHIMP WORKING MEMORY</span>
            <span className="font-pixel text-xs text-arcade-emerald">NUMBERS: {chimpScore}</span>
          </div>

          {chimpTiles.length === 0 ? (
            <button
              onClick={() => startChimpRound(chimpScore)}
              className="btn-pixel btn-pixel-amber px-6 py-3 font-pixel text-xs my-8"
            >
              START ROUND ({chimpScore} NUMBERS)
            </button>
          ) : (
            <div className="grid grid-cols-5 gap-2 w-72 h-72 mx-auto my-4">
              {Array.from({ length: 25 }).map((_, pos) => {
                const tile = chimpTiles.find(t => t.pos === pos);
                const isCleared = tile && tile.num < chimpNextNum;

                if (!tile || isCleared) {
                  return <div key={pos} className="w-full h-full bg-transparent"></div>;
                }

                return (
                  <button
                    key={pos}
                    onClick={() => handleChimpClick(tile)}
                    className="w-full h-full bg-deck-surface border-2 border-arcade-amber font-pixel text-base text-white hover:border-arcade-emerald flex items-center justify-center"
                  >
                    {!chimpHidden ? tile.num : ''}
                  </button>
                );
              })}
            </div>
          )}

          {chimpGameOver && (
            <div className="text-arcade-coral font-pixel text-xs space-y-2">
              <div>ROUND FAILED!</div>
              <button
                onClick={() => { setChimpScore(4); startChimpRound(4); }}
                className="btn-pixel btn-pixel-surface px-4 py-1.5 font-pixel text-[9px] text-white"
              >
                TRY AGAIN
              </button>
            </div>
          )}
        </div>
      )}

      {/* 4. TYPING TEST */}
      {activeTab === 'typing' && (
        <div className="max-w-2xl mx-auto pixel-card bg-deck-dark p-6 space-y-4 border border-deck-border font-mono text-xs">
          <div className="flex justify-between items-center border-b border-deck-border pb-2">
            <span className="font-pixel text-xs text-arcade-cyan">60-SECOND WPM TYPING TEST</span>
            <span className="font-pixel text-base text-arcade-emerald">{typingWpm} WPM</span>
          </div>

          <div className="p-4 bg-deck-bg border border-deck-border text-white text-sm leading-relaxed select-none">
            {sampleTypingText}
          </div>

          <textarea
            value={typingInput}
            onChange={handleTypingChange}
            rows={4}
            placeholder="Start typing the text above to test speed..."
            className="w-full bg-deck-dark border-2 border-deck-border focus:border-arcade-emerald p-3 text-white font-mono text-xs focus:outline-none"
          />
        </div>
      )}
    </div>
  );
}

