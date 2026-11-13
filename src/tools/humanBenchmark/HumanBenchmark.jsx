import React, { useState, useEffect, useRef } from 'react';
import { 
  Zap, Target, Brain, Hash, Type, RotateCcw, Play, CheckCircle,
  Grid, Eye, Sparkles, Award, Palette, Check, X
} from 'lucide-react';
import { playClick, playBeep, playCoin, playError, playSuccess } from '../../audio/soundEffects';

export default function HumanBenchmark() {
  const [activeTab, setActiveTab] = useState('reaction'); 
  // 'reaction' | 'aim' | 'chimp' | 'typing' | 'visual' | 'number' | 'verbal' | 'stroop'

  // 1. REACTION TIME TEST
  const [reactionState, setReactionState] = useState('idle'); // 'idle' | 'waiting' | 'ready' | 'result'
  const [reactionTime, setReactionTime] = useState(0);
  const [reactionHistory, setReactionHistory] = useState([]);
  const reactionTimerRef = useRef(null);
  const reactionStartRef = useRef(null);

  const startReactionTest = () => {
    setReactionState('waiting');
    playClick();
    const delay = Math.floor(Math.random() * 2500) + 1500;
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

  // 3. CHIMP TEST (Working memory 1 to N)
  const [chimpTiles, setChimpTiles] = useState([]);
  const [chimpNextNum, setChimpNextNum] = useState(1);
  const [chimpHidden, setChimpHidden] = useState(false);
  const [chimpGameOver, setChimpGameOver] = useState(false);
  const [chimpScore, setChimpScore] = useState(4);

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

  // 5. VISUAL MEMORY MATRIX
  const [visLevel, setVisLevel] = useState(1);
  const [visLives, setVisLives] = useState(3);
  const [visGridSize, setVisGridSize] = useState(3); // 3x3, 4x4, etc.
  const [visActiveTiles, setVisActiveTiles] = useState([]);
  const [visSelectedTiles, setVisSelectedTiles] = useState([]);
  const [visShowing, setVisShowing] = useState(false);
  const [visGameOver, setVisGameOver] = useState(false);

  const startVisRound = (lvl = 1) => {
    const size = lvl <= 2 ? 3 : lvl <= 5 ? 4 : 5;
    const count = lvl + 2;
    setVisGridSize(size);

    const total = size * size;
    const active = [];
    while (active.length < count) {
      const idx = Math.floor(Math.random() * total);
      if (!active.includes(idx)) active.push(idx);
    }
    setVisActiveTiles(active);
    setVisSelectedTiles([]);
    setVisShowing(true);
    setVisGameOver(false);

    setTimeout(() => {
      setVisShowing(false);
    }, 1200);
  };

  const handleVisTileClick = (idx) => {
    if (visShowing || visGameOver || visSelectedTiles.includes(idx)) return;
    const newSelected = [...visSelectedTiles, idx];
    setVisSelectedTiles(newSelected);

    if (visActiveTiles.includes(idx)) {
      playClick();
      // Check if all correct tiles selected
      const correctSelected = newSelected.filter(i => visActiveTiles.includes(i));
      if (correctSelected.length === visActiveTiles.length) {
        playCoin();
        setVisLevel(l => l + 1);
        setTimeout(() => startVisRound(visLevel + 1), 600);
      }
    } else {
      playError();
      if (visLives <= 1) {
        setVisGameOver(true);
      } else {
        setVisLives(l => l - 1);
      }
    }
  };

  // 6. NUMBER MEMORY TEST
  const [numLevel, setNumLevel] = useState(1);
  const [numCurrent, setNumCurrent] = useState('');
  const [numInput, setNumInput] = useState('');
  const [numPhase, setNumPhase] = useState('idle'); // 'idle' | 'memorize' | 'input' | 'gameover'

  const startNumRound = (lvl = 1) => {
    playClick();
    const length = lvl + 2; // Level 1 = 3 digits, Level 2 = 4 digits, etc.
    let digits = '';
    for (let i = 0; i < length; i++) {
      digits += Math.floor(Math.random() * 10).toString();
    }
    setNumCurrent(digits);
    setNumInput('');
    setNumPhase('memorize');

    // Time to memorize scales with length
    const timeMs = 1800 + (length * 400);
    setTimeout(() => {
      setNumPhase('input');
    }, timeMs);
  };

  const checkNumAnswer = () => {
    playClick();
    if (numInput === numCurrent) {
      playSuccess();
      setNumLevel(l => l + 1);
      setTimeout(() => startNumRound(numLevel + 1), 500);
    } else {
      playError();
      setNumPhase('gameover');
    }
  };

  // 7. VERBAL MEMORY TEST
  const [verbalScore, setVerbalScore] = useState(0);
  const [verbalLives, setVerbalLives] = useState(3);
  const [verbalSeenList, setVerbalSeenList] = useState([]);
  const [verbalCurrentWord, setVerbalCurrentWord] = useState('');
  const [verbalGameOver, setVerbalGameOver] = useState(false);

  const VERBAL_DICTIONARY = [
    'circuit', 'plasma', 'binary', 'matrix', 'terminal', 'cipher', 'vector',
    'quantum', 'subroutine', 'daemon', 'packet', 'fiber', 'latency', 'bandwidth',
    'memory', 'silicon', 'transistor', 'algorithm', 'syntax', 'socket', 'thread',
    'kernel', 'buffer', 'gateway', 'telemetry', 'payload', 'firewall', 'crypto'
  ];

  const pickVerbalWord = () => {
    // 50% chance of seen word if seenList has words
    const shouldPickSeen = verbalSeenList.length > 2 && Math.random() < 0.5;
    if (shouldPickSeen) {
      const w = verbalSeenList[Math.floor(Math.random() * verbalSeenList.length)];
      setVerbalCurrentWord(w);
    } else {
      const unused = VERBAL_DICTIONARY.filter(w => !verbalSeenList.includes(w));
      const pool = unused.length > 0 ? unused : VERBAL_DICTIONARY;
      const w = pool[Math.floor(Math.random() * pool.length)];
      setVerbalCurrentWord(w);
    }
  };

  const startVerbalGame = () => {
    playClick();
    setVerbalScore(0);
    setVerbalLives(3);
    setVerbalSeenList([]);
    setVerbalGameOver(false);
    const initialWord = VERBAL_DICTIONARY[Math.floor(Math.random() * VERBAL_DICTIONARY.length)];
    setVerbalCurrentWord(initialWord);
  };

  const handleVerbalChoice = (choice) => {
    // choice is 'SEEN' or 'NEW'
    const isSeen = verbalSeenList.includes(verbalCurrentWord);
    const isCorrect = (choice === 'SEEN' && isSeen) || (choice === 'NEW' && !isSeen);

    if (isCorrect) {
      playCoin();
      setVerbalScore(s => s + 1);
      if (!isSeen) {
        setVerbalSeenList([...verbalSeenList, verbalCurrentWord]);
      }
      pickVerbalWord();
    } else {
      playError();
      if (verbalLives <= 1) {
        setVerbalGameOver(true);
      } else {
        setVerbalLives(l => l - 1);
        if (!isSeen) {
          setVerbalSeenList([...verbalSeenList, verbalCurrentWord]);
        }
        pickVerbalWord();
      }
    }
  };

  // 8. STROOP COLOR-WORD TEST
  const [stroopRound, setStroopRound] = useState(0);
  const [stroopScore, setStroopScore] = useState(0);
  const [stroopCurrentWord, setStroopCurrentWord] = useState('RED');
  const [stroopCurrentColor, setStroopCurrentColor] = useState('text-blue-500');
  const [stroopCorrectColorName, setStroopCorrectColorName] = useState('BLUE');
  const [stroopActive, setStroopActive] = useState(false);
  const [stroopFinished, setStroopFinished] = useState(false);

  const STROOP_COLORS = [
    { name: 'RED', class: 'text-red-500' },
    { name: 'BLUE', class: 'text-cyan-400' },
    { name: 'GREEN', class: 'text-emerald-400' },
    { name: 'YELLOW', class: 'text-amber-400' },
  ];

  const nextStroop = () => {
    const wordItem = STROOP_COLORS[Math.floor(Math.random() * STROOP_COLORS.length)];
    let colorItem = STROOP_COLORS[Math.floor(Math.random() * STROOP_COLORS.length)];
    // Make it incongruent most of the time
    if (colorItem.name === wordItem.name && Math.random() < 0.7) {
      colorItem = STROOP_COLORS.find(c => c.name !== wordItem.name);
    }
    setStroopCurrentWord(wordItem.name);
    setStroopCurrentColor(colorItem.class);
    setStroopCorrectColorName(colorItem.name);
  };

  const startStroopGame = () => {
    playClick();
    setStroopScore(0);
    setStroopRound(1);
    setStroopActive(true);
    setStroopFinished(false);
    nextStroop();
  };

  const handleStroopAnswer = (selectedColorName) => {
    if (selectedColorName === stroopCorrectColorName) {
      playCoin();
      setStroopScore(s => s + 1);
    } else {
      playError();
    }

    if (stroopRound >= 15) {
      setStroopActive(false);
      setStroopFinished(true);
      playSuccess();
    } else {
      setStroopRound(r => r + 1);
      nextStroop();
    }
  };

  return (
    <div className="space-y-6">
      {/* Subtool Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar border-b-2 border-deck-border pb-3">
        {[
          { id: 'reaction', label: 'REACTION SPEED', icon: Zap, color: 'btn-pixel-coral' },
          { id: 'aim', label: 'AIM TRAINER', icon: Target, color: 'btn-pixel-cyan' },
          { id: 'visual', label: 'VISUAL MEMORY', icon: Grid, color: 'btn-pixel-emerald' },
          { id: 'number', label: 'NUMBER MEMORY', icon: Hash, color: 'btn-pixel-amber' },
          { id: 'verbal', label: 'VERBAL MEMORY', icon: Type, color: 'btn-pixel-violet' },
          { id: 'stroop', label: 'STROOP COLOR', icon: Palette, color: 'btn-pixel-pink' },
          { id: 'chimp', label: 'CHIMP TEST', icon: Brain, color: 'btn-pixel-lime' },
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

      {/* 3. VISUAL MEMORY */}
      {activeTab === 'visual' && (
        <div className="max-w-md mx-auto pixel-card bg-deck-dark p-6 space-y-4 border border-deck-border font-mono text-xs text-center">
          <div className="flex justify-between items-center border-b border-deck-border pb-2">
            <span className="font-pixel text-xs text-arcade-emerald">VISUAL MATRIX MEMORY</span>
            <div className="flex gap-3 text-xs">
              <span>Level: <strong className="text-arcade-cyan font-pixel">{visLevel}</strong></span>
              <span>Strikes: <strong className="text-arcade-coral font-pixel">{'★'.repeat(visLives)}</strong></span>
            </div>
          </div>

          {visActiveTiles.length === 0 ? (
            <div className="py-12 space-y-3">
              <Grid className="w-12 h-12 mx-auto text-arcade-emerald" />
              <p className="text-arcade-muted text-xs">Memorize the flashed squares and tap them correctly.</p>
              <button
                onClick={() => { setVisLevel(1); setVisLives(3); startVisRound(1); }}
                className="btn-pixel btn-pixel-emerald px-6 py-2.5 font-pixel text-xs"
              >
                START VISUAL BENCHMARK
              </button>
            </div>
          ) : (
            <div
              className="grid gap-2 mx-auto my-4 justify-center"
              style={{
                gridTemplateColumns: `repeat(${visGridSize}, minmax(0, 1fr))`,
                width: `${visGridSize * 64}px`,
                height: `${visGridSize * 64}px`
              }}
            >
              {Array.from({ length: visGridSize * visGridSize }).map((_, idx) => {
                const isActive = visActiveTiles.includes(idx);
                const isSelected = visSelectedTiles.includes(idx);
                const isCorrect = isSelected && isActive;
                const isWrong = isSelected && !isActive;

                return (
                  <button
                    key={idx}
                    onClick={() => handleVisTileClick(idx)}
                    className={`border-2 border-black transition-all ${
                      visShowing && isActive ? 'bg-white scale-95 shadow-pixel-emerald' :
                      isCorrect ? 'bg-arcade-emerald' :
                      isWrong ? 'bg-arcade-coral' :
                      'bg-deck-bg hover:bg-slate-700'
                    }`}
                  />
                );
              })}
            </div>
          )}

          {visGameOver && (
            <div className="p-4 bg-deck-bg border border-arcade-coral space-y-2">
              <span className="font-pixel text-xs text-arcade-coral">GAME OVER! LEVEL {visLevel} REACHED</span>
              <div>
                <button
                  onClick={() => { setVisLevel(1); setVisLives(3); startVisRound(1); }}
                  className="btn-pixel btn-pixel-emerald px-4 py-2 font-pixel text-[9px]"
                >
                  TRY AGAIN
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. NUMBER MEMORY */}
      {activeTab === 'number' && (
        <div className="max-w-md mx-auto pixel-card bg-deck-dark p-6 space-y-5 border border-deck-border font-mono text-xs text-center">
          <div className="flex justify-between items-center border-b border-deck-border pb-2">
            <span className="font-pixel text-xs text-arcade-amber">WORKING NUMBER MEMORY</span>
            <span className="font-pixel text-xs text-arcade-cyan">LEVEL: {numLevel}</span>
          </div>

          {numPhase === 'idle' && (
            <div className="py-10 space-y-3">
              <Hash className="w-12 h-12 mx-auto text-arcade-amber" />
              <p className="text-arcade-muted text-xs">The average human can remember 7 digits. How far can you go?</p>
              <button
                onClick={() => { setNumLevel(1); startNumRound(1); }}
                className="btn-pixel btn-pixel-amber px-6 py-2.5 font-pixel text-xs"
              >
                START TEST (LEVEL 1)
              </button>
            </div>
          )}

          {numPhase === 'memorize' && (
            <div className="py-12 space-y-3">
              <span className="text-[10px] text-arcade-muted font-pixel">MEMORIZE THIS NUMBER:</span>
              <div className="font-pixel text-4xl text-arcade-amber tracking-widest text-glow-amber animate-pulse">
                {numCurrent}
              </div>
            </div>
          )}

          {numPhase === 'input' && (
            <div className="py-6 space-y-3">
              <span className="text-arcade-muted block">What was the number?</span>
              <input
                type="text"
                autoFocus
                value={numInput}
                onChange={(e) => setNumInput(e.target.value.replace(/\D/g, ''))}
                onKeyDown={(e) => { if (e.key === 'Enter') checkNumAnswer(); }}
                className="w-full bg-deck-bg border border-deck-border p-3 text-center font-pixel text-2xl text-white tracking-widest"
              />
              <button
                onClick={checkNumAnswer}
                className="btn-pixel btn-pixel-amber w-full py-2.5 font-pixel text-xs"
              >
                SUBMIT ANSWER
              </button>
            </div>
          )}

          {numPhase === 'gameover' && (
            <div className="p-4 bg-deck-bg border border-arcade-coral space-y-3">
              <div className="font-pixel text-xs text-arcade-coral">INCORRECT!</div>
              <div className="text-xs text-arcade-muted">Correct Number: <strong className="text-white font-mono">{numCurrent}</strong></div>
              <div className="text-xs text-arcade-muted">Your Answer: <strong className="text-arcade-coral font-mono">{numInput}</strong></div>
              <div className="font-pixel text-base text-arcade-emerald pt-2">FINAL SCORE: LEVEL {numLevel}</div>
              <button
                onClick={() => { setNumLevel(1); startNumRound(1); }}
                className="btn-pixel btn-pixel-amber px-5 py-2 font-pixel text-[9px]"
              >
                PLAY AGAIN
              </button>
            </div>
          )}
        </div>
      )}

      {/* 5. VERBAL MEMORY */}
      {activeTab === 'verbal' && (
        <div className="max-w-md mx-auto pixel-card bg-deck-dark p-6 space-y-5 border border-deck-border font-mono text-xs text-center">
          <div className="flex justify-between items-center border-b border-deck-border pb-2">
            <span className="font-pixel text-xs text-arcade-violet">VERBAL MEMORY BENCHMARK</span>
            <div className="flex gap-3 text-xs">
              <span>Score: <strong className="text-arcade-emerald font-pixel">{verbalScore}</strong></span>
              <span>Lives: <strong className="text-arcade-coral font-pixel">{'♥'.repeat(verbalLives)}</strong></span>
            </div>
          </div>

          {!verbalCurrentWord ? (
            <div className="py-10 space-y-3">
              <Type className="w-12 h-12 mx-auto text-arcade-violet" />
              <p className="text-arcade-muted text-xs">You will be shown words one by one. Choose if you have SEEN the word or if it is NEW.</p>
              <button onClick={startVerbalGame} className="btn-pixel btn-pixel-violet px-6 py-2.5 font-pixel text-xs">
                START VERBAL TEST
              </button>
            </div>
          ) : !verbalGameOver ? (
            <div className="py-8 space-y-6">
              <div className="font-pixel text-3xl text-white tracking-wider py-4 bg-deck-bg border border-deck-border">
                {verbalCurrentWord.toUpperCase()}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => handleVerbalChoice('SEEN')}
                  className="btn-pixel btn-pixel-cyan flex-1 py-3 font-pixel text-xs"
                >
                  SEEN BEFORE
                </button>
                <button
                  onClick={() => handleVerbalChoice('NEW')}
                  className="btn-pixel btn-pixel-emerald flex-1 py-3 font-pixel text-xs"
                >
                  NEW WORD
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-deck-bg border border-arcade-coral space-y-3">
              <div className="font-pixel text-xs text-arcade-coral">OUT OF LIVES!</div>
              <div className="font-pixel text-2xl text-arcade-emerald text-glow-emerald">{verbalScore} WORDS</div>
              <button onClick={startVerbalGame} className="btn-pixel btn-pixel-violet px-5 py-2 font-pixel text-[9px]">
                TRY AGAIN
              </button>
            </div>
          )}
        </div>
      )}

      {/* 6. STROOP COLOR-WORD TEST */}
      {activeTab === 'stroop' && (
        <div className="max-w-md mx-auto pixel-card bg-deck-dark p-6 space-y-5 border border-deck-border font-mono text-xs text-center">
          <div className="flex justify-between items-center border-b border-deck-border pb-2">
            <span className="font-pixel text-xs text-arcade-pink">STROOP COGNITIVE TEST</span>
            <span className="font-pixel text-xs text-arcade-amber">ROUND {stroopRound} / 15</span>
          </div>

          {!stroopActive && !stroopFinished && (
            <div className="py-10 space-y-3">
              <Palette className="w-12 h-12 mx-auto text-arcade-pink" />
              <p className="text-arcade-muted text-xs leading-relaxed">
                Click the button matching the <strong className="text-white">FONT COLOR</strong> of the text, NOT the word itself. Tests cognitive response inhibition.
              </p>
              <button onClick={startStroopGame} className="btn-pixel btn-pixel-pink px-6 py-2.5 font-pixel text-xs">
                START STROOP CHALLENGE
              </button>
            </div>
          )}

          {stroopActive && (
            <div className="py-6 space-y-6">
              <div className="py-6 bg-deck-bg border-2 border-black shadow-pixel">
                <span className={`font-pixel text-4xl font-bold tracking-wider ${stroopCurrentColor}`}>
                  {stroopCurrentWord}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {STROOP_COLORS.map(c => (
                  <button
                    key={c.name}
                    onClick={() => handleStroopAnswer(c.name)}
                    className="btn-pixel btn-pixel-surface py-3 font-pixel text-xs text-white hover:border-arcade-pink"
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {stroopFinished && (
            <div className="p-4 bg-deck-bg border border-arcade-emerald space-y-3">
              <span className="font-pixel text-xs text-arcade-emerald">TEST COMPLETE!</span>
              <div className="font-pixel text-3xl text-arcade-emerald text-glow-emerald">{stroopScore} / 15 ACCURACY</div>
              <p className="text-[11px] text-arcade-muted">
                {stroopScore >= 13 ? 'Exceptional cognitive control and low Stroop interference!' : 'Good effort! Practice helps brain processing speed.'}
              </p>
              <button onClick={startStroopGame} className="btn-pixel btn-pixel-pink px-5 py-2 font-pixel text-[9px]">
                RETRY TEST
              </button>
            </div>
          )}
        </div>
      )}

      {/* 7. CHIMP TEST */}
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

      {/* 8. TYPING TEST */}
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
