import React, { useState, useEffect, useRef } from 'react';
import { 
  Gamepad2, Trophy, RotateCcw, Play, Sparkles, 
  HelpCircle, CircleDot, Dices, Flag, Bomb, Smile, Frown, Layers, 
  Grid3X3, Scissors, Award, Type, Check, RefreshCw
} from 'lucide-react';
import { playClick, playBeep, playCoin, playError, playSuccess } from '../../audio/soundEffects';

export default function GameTools() {
  const [activeTab, setActiveTab] = useState('snake'); 
  // 'snake' | 'minesweeper' | 'memory' | 'quiz' | 'tictactoe' | 'cointoss' | 'dice'

  // 1. RETRO SNAKE ARCADE
  const snakeCanvasRef = useRef(null);
  const [snakeScore, setSnakeScore] = useState(0);
  const [snakeGameOver, setSnakeGameOver] = useState(false);
  const snakeRef = useRef([[10, 10]]);
  const foodRef = useRef([15, 15]);
  const dirRef = useRef([0, -1]);
  const gameLoopRef = useRef(null);

  const startSnake = () => {
    snakeRef.current = [[10, 10], [10, 11], [10, 12]];
    foodRef.current = [Math.floor(Math.random() * 20), Math.floor(Math.random() * 20)];
    dirRef.current = [0, -1];
    setSnakeScore(0);
    setSnakeGameOver(false);
    playClick();

    if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    gameLoopRef.current = setInterval(updateSnake, 120);
  };

  const updateSnake = () => {
    const head = [snakeRef.current[0][0] + dirRef.current[0], snakeRef.current[0][1] + dirRef.current[1]];

    if (head[0] < 0 || head[0] >= 20 || head[1] < 0 || head[1] >= 20) {
      clearInterval(gameLoopRef.current);
      setSnakeGameOver(true);
      playError();
      return;
    }

    if (snakeRef.current.some(segment => segment[0] === head[0] && segment[1] === head[1])) {
      clearInterval(gameLoopRef.current);
      setSnakeGameOver(true);
      playError();
      return;
    }

    const newSnake = [head, ...snakeRef.current];

    if (head[0] === foodRef.current[0] && head[1] === foodRef.current[1]) {
      setSnakeScore(s => s + 10);
      foodRef.current = [Math.floor(Math.random() * 20), Math.floor(Math.random() * 20)];
      playCoin();
    } else {
      newSnake.pop();
    }

    snakeRef.current = newSnake;

    const canvas = snakeCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const scale = canvas.width / 20;

    ctx.fillStyle = '#0a0d12';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#ff4757';
    ctx.fillRect(foodRef.current[0] * scale, foodRef.current[1] * scale, scale - 1, scale - 1);

    newSnake.forEach((seg, i) => {
      ctx.fillStyle = i === 0 ? '#00ff88' : '#10b981';
      ctx.fillRect(seg[0] * scale, seg[1] * scale, scale - 1, scale - 1);
    });
  };

  useEffect(() => {
    const handleKey = (e) => {
      if (activeTab !== 'snake') return;
      if (e.key === 'ArrowUp' && dirRef.current[1] === 0) dirRef.current = [0, -1];
      if (e.key === 'ArrowDown' && dirRef.current[1] === 0) dirRef.current = [0, 1];
      if (e.key === 'ArrowLeft' && dirRef.current[0] === 0) dirRef.current = [-1, 0];
      if (e.key === 'ArrowRight' && dirRef.current[0] === 0) dirRef.current = [1, 0];
    };
    window.addEventListener('keydown', handleKey);
    return () => {
      window.removeEventListener('keydown', handleKey);
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, [activeTab]);

  // 2. MINESWEEPER
  const [mineGrid, setMineGrid] = useState([]);
  const [mineStatus, setMineStatus] = useState('playing'); // 'playing' | 'won' | 'lost'
  const [flagMode, setFlagMode] = useState(false);
  const GRID_SIZE = 9;
  const TOTAL_MINES = 10;

  const initMinesweeper = () => {
    const grid = Array(GRID_SIZE).fill(null).map(() => 
      Array(GRID_SIZE).fill(null).map(() => ({
        isMine: false,
        revealed: false,
        flagged: false,
        count: 0
      }))
    );

    // Place 10 mines
    let placed = 0;
    while (placed < TOTAL_MINES) {
      const r = Math.floor(Math.random() * GRID_SIZE);
      const c = Math.floor(Math.random() * GRID_SIZE);
      if (!grid[r][c].isMine) {
        grid[r][c].isMine = true;
        placed++;
      }
    }

    // Compute neighbor counts
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (!grid[r][c].isMine) {
          let count = 0;
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              const nr = r + dr, nc = c + dc;
              if (nr >= 0 && nr < GRID_SIZE && nc >= 0 && nc < GRID_SIZE && grid[nr][nc].isMine) {
                count++;
              }
            }
          }
          grid[r][c].count = count;
        }
      }
    }

    setMineGrid(grid);
    setMineStatus('playing');
    playClick();
  };

  useEffect(() => {
    initMinesweeper();
  }, []);

  const revealCell = (r, c) => {
    if (mineStatus !== 'playing' || mineGrid[r][c].revealed || mineGrid[r][c].flagged) return;

    const newGrid = mineGrid.map(row => row.map(cell => ({ ...cell })));

    if (flagMode) {
      newGrid[r][c].flagged = !newGrid[r][c].flagged;
      setMineGrid(newGrid);
      playClick();
      return;
    }

    if (newGrid[r][c].isMine) {
      // Game Over
      newGrid.forEach(row => row.forEach(cell => { if (cell.isMine) cell.revealed = true; }));
      setMineGrid(newGrid);
      setMineStatus('lost');
      playError();
      return;
    }

    // Flood fill
    const flood = (row, col) => {
      if (row < 0 || row >= GRID_SIZE || col < 0 || col >= GRID_SIZE) return;
      if (newGrid[row][col].revealed || newGrid[row][col].isMine || newGrid[row][col].flagged) return;
      newGrid[row][col].revealed = true;
      if (newGrid[row][col].count === 0) {
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            flood(row + dr, col + dc);
          }
        }
      }
    };
    flood(r, c);

    // Check win condition
    let unrevealedSafe = 0;
    newGrid.forEach(row => row.forEach(cell => {
      if (!cell.isMine && !cell.revealed) unrevealedSafe++;
    }));

    setMineGrid(newGrid);
    playClick();

    if (unrevealedSafe === 0) {
      setMineStatus('won');
      playSuccess();
    }
  };

  // 3. MEMORY CARD MATCH
  const ICONS = ['💎', '🎮', '👻', '⭐', '❤️', '💀', '⚡', '🔥'];
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);

  const initMemoryGame = () => {
    const deck = [...ICONS, ...ICONS]
      .sort(() => Math.random() - 0.5)
      .map((icon, idx) => ({ id: idx, icon }));
    setCards(deck);
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    playClick();
  };

  useEffect(() => {
    initMemoryGame();
  }, []);

  const handleCardClick = (idx) => {
    if (flipped.length === 2 || flipped.includes(idx) || matched.includes(idx)) return;

    const nextFlipped = [...flipped, idx];
    setFlipped(nextFlipped);
    playClick();

    if (nextFlipped.length === 2) {
      setMoves(m => m + 1);
      const [first, second] = nextFlipped;
      if (cards[first].icon === cards[second].icon) {
        setMatched(m => [...m, first, second]);
        setFlipped([]);
        playCoin();
      } else {
        setTimeout(() => setFlipped([]), 800);
      }
    }
  };

  // 4. TIC TAC TOE
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);

  const calculateWinner = (squares) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ];
    for (const [a, b, c] of lines) {
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    return squares.every(Boolean) ? 'Tie' : null;
  };

  const handleSquareClick = (idx) => {
    if (board[idx] || calculateWinner(board)) return;
    const nextBoard = [...board];
    nextBoard[idx] = isXNext ? 'X' : 'O';
    setBoard(nextBoard);
    setIsXNext(!isXNext);
    playClick();

    const winner = calculateWinner(nextBoard);
    if (winner && winner !== 'Tie') playSuccess();
  };

  const resetTtt = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    playClick();
  };

  // 5. COIN TOSS (True CSPRNG & 3D Flip & Streak Tracking)
  const [coinResult, setCoinResult] = useState('HEADS');
  const [tossing, setTossing] = useState(false);
  const [coinRotation, setCoinRotation] = useState(0);
  const [coinStats, setCoinStats] = useState({ heads: 0, tails: 0, total: 0, streak: 0, bestStreak: 0 });
  const [coinHistory, setCoinHistory] = useState([]);

  const flipCoin = () => {
    if (tossing) return;
    setTossing(true);
    playClick();

    // Use Web Crypto CSPRNG
    const randArr = new Uint8Array(1);
    window.crypto.getRandomValues(randArr);
    const isHeads = randArr[0] % 2 === 0;
    const result = isHeads ? 'HEADS' : 'TAILS';

    // Flip degrees: at least 4 full spins (1440 deg) plus extra half spin if tails
    const extra = isHeads ? 1440 : 1620;
    setCoinRotation(prev => prev + extra);

    setTimeout(() => {
      setCoinResult(result);
      setTossing(false);
      setCoinStats(prev => {
        const isCurrentSame = (prev.streak > 0 && isHeads) || (prev.streak < 0 && !isHeads);
        const newStreak = isHeads ? (prev.streak > 0 ? prev.streak + 1 : 1) : (prev.streak < 0 ? prev.streak - 1 : -1);
        const bestStreak = Math.max(prev.bestStreak, Math.abs(newStreak));
        return {
          heads: prev.heads + (isHeads ? 1 : 0),
          tails: prev.tails + (isHeads ? 0 : 1),
          total: prev.total + 1,
          streak: newStreak,
          bestStreak
        };
      });
      setCoinHistory(prev => [isHeads ? 'H' : 'T', ...prev.slice(0, 11)]);
      playCoin();
    }, 700);
  };

  const resetCoinStats = () => {
    setCoinStats({ heads: 0, tails: 0, total: 0, streak: 0, bestStreak: 0 });
    setCoinHistory([]);
    playClick();
  };

  // 6. 2048 RETRO PUZZLE
  const init2048Grid = () => {
    const grid = Array(4).fill(null).map(() => Array(4).fill(0));
    addRandom2048Tile(grid);
    addRandom2048Tile(grid);
    return grid;
  };

  const addRandom2048Tile = (grid) => {
    const empty = [];
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (grid[r][c] === 0) empty.push([r, c]);
      }
    }
    if (empty.length > 0) {
      const [r, c] = empty[Math.floor(Math.random() * empty.length)];
      grid[r][c] = Math.random() < 0.9 ? 2 : 4;
    }
  };

  const [grid2048, setGrid2048] = useState(init2048Grid);
  const [score2048, setScore2048] = useState(0);
  const [bestScore2048, setBestScore2048] = useState(() => {
    return Number(localStorage.getItem('omnideck_2048_best') || 0);
  });
  const [over2048, setOver2048] = useState(false);

  const move2048 = (direction) => {
    if (over2048) return;
    let current = grid2048.map(row => [...row]);
    let moved = false;
    let gainedScore = 0;

    const slideRow = (row) => {
      let filtered = row.filter(val => val !== 0);
      for (let i = 0; i < filtered.length - 1; i++) {
        if (filtered[i] === filtered[i + 1]) {
          filtered[i] *= 2;
          gainedScore += filtered[i];
          filtered[i + 1] = 0;
        }
      }
      filtered = filtered.filter(val => val !== 0);
      while (filtered.length < 4) filtered.push(0);
      return filtered;
    };

    if (direction === 'LEFT') {
      for (let r = 0; r < 4; r++) {
        const newRow = slideRow(current[r]);
        if (newRow.some((val, c) => val !== current[r][c])) moved = true;
        current[r] = newRow;
      }
    } else if (direction === 'RIGHT') {
      for (let r = 0; r < 4; r++) {
        const reversed = [...current[r]].reverse();
        const newRow = slideRow(reversed).reverse();
        if (newRow.some((val, c) => val !== current[r][c])) moved = true;
        current[r] = newRow;
      }
    } else if (direction === 'UP') {
      for (let c = 0; c < 4; c++) {
        const col = [current[0][c], current[1][c], current[2][c], current[3][c]];
        const newCol = slideRow(col);
        for (let r = 0; r < 4; r++) {
          if (newCol[r] !== current[r][c]) moved = true;
          current[r][c] = newCol[r];
        }
      }
    } else if (direction === 'DOWN') {
      for (let c = 0; c < 4; c++) {
        const col = [current[3][c], current[2][c], current[1][c], current[0][c]];
        const newCol = slideRow(col);
        for (let r = 0; r < 4; r++) {
          if (newCol[3 - r] !== current[r][c]) moved = true;
          current[r][c] = newCol[3 - r];
        }
      }
    }

    if (moved) {
      addRandom2048Tile(current);
      setGrid2048(current);
      const newScore = score2048 + gainedScore;
      setScore2048(newScore);
      if (newScore > bestScore2048) {
        setBestScore2048(newScore);
        localStorage.setItem('omnideck_2048_best', String(newScore));
      }
      playClick();

      // Check game over
      let canMove = false;
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
          if (current[r][c] === 0) canMove = true;
          if (r < 3 && current[r][c] === current[r + 1][c]) canMove = true;
          if (c < 3 && current[r][c] === current[r][c + 1]) canMove = true;
        }
      }
      if (!canMove) {
        setOver2048(true);
        playError();
      }
    }
  };

  const reset2048 = () => {
    setGrid2048(init2048Grid());
    setScore2048(0);
    setOver2048(false);
    playClick();
  };

  // Keyboard controls for 2048
  useEffect(() => {
    const handleKey = (e) => {
      if (activeTab !== 'g2048') return;
      if (['ArrowUp', 'KeyW'].includes(e.code)) { e.preventDefault(); move2048('UP'); }
      if (['ArrowDown', 'KeyS'].includes(e.code)) { e.preventDefault(); move2048('DOWN'); }
      if (['ArrowLeft', 'KeyA'].includes(e.code)) { e.preventDefault(); move2048('LEFT'); }
      if (['ArrowRight', 'KeyD'].includes(e.code)) { e.preventDefault(); move2048('RIGHT'); }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [activeTab, grid2048, over2048]);

  // 7. WORDLE 5-LETTER CYBER WORD GUESS
  const WORDLE_TARGETS = ['CYBER', 'PIXEL', 'RADAR', 'RETRO', 'LOGIC', 'PULSE', 'SHIELD', 'SPARK', 'ROBOT', 'POWER', 'LASER', 'CHIPS', 'ALPHA', 'CLOUD', 'GAMES'];
  const [wordleTarget, setWordleTarget] = useState(() => WORDLE_TARGETS[Math.floor(Math.random() * WORDLE_TARGETS.length)]);
  const [wordleGuesses, setWordleGuesses] = useState([]);
  const [wordleCurrent, setWordleCurrent] = useState('');
  const [wordleStatus, setWordleStatus] = useState('PLAYING'); // 'PLAYING' | 'WON' | 'LOST'

  const submitWordleGuess = (e) => {
    if (e) e.preventDefault();
    if (wordleStatus !== 'PLAYING') return;
    const guess = wordleCurrent.trim().toUpperCase();
    if (guess.length !== 5) {
      playError();
      return;
    }

    const nextGuesses = [...wordleGuesses, guess];
    setWordleGuesses(nextGuesses);
    setWordleCurrent('');

    if (guess === wordleTarget) {
      setWordleStatus('WON');
      playSuccess();
    } else if (nextGuesses.length >= 6) {
      setWordleStatus('LOST');
      playError();
    } else {
      playClick();
    }
  };

  const resetWordle = () => {
    setWordleTarget(WORDLE_TARGETS[Math.floor(Math.random() * WORDLE_TARGETS.length)]);
    setWordleGuesses([]);
    setWordleCurrent('');
    setWordleStatus('PLAYING');
    playClick();
  };

  // 8. ROCK PAPER SCISSORS
  const [rpsPlayerScore, setRpsPlayerScore] = useState(0);
  const [rpsCpuScore, setRpsCpuScore] = useState(0);
  const [rpsTies, setRpsTies] = useState(0);
  const [rpsPlayerChoice, setRpsPlayerChoice] = useState(null);
  const [rpsCpuChoice, setRpsCpuChoice] = useState(null);
  const [rpsResultMsg, setRpsResultMsg] = useState('CHOOSE YOUR WEAPON');

  const playRps = (playerPick) => {
    const choices = ['ROCK', 'PAPER', 'SCISSORS'];
    const cpuPick = choices[Math.floor(Math.random() * 3)];
    setRpsPlayerChoice(playerPick);
    setRpsCpuChoice(cpuPick);

    if (playerPick === cpuPick) {
      setRpsTies(t => t + 1);
      setRpsResultMsg('DRAW! PERFECT BALANCE');
      playClick();
    } else if (
      (playerPick === 'ROCK' && cpuPick === 'SCISSORS') ||
      (playerPick === 'PAPER' && cpuPick === 'ROCK') ||
      (playerPick === 'SCISSORS' && cpuPick === 'PAPER')
    ) {
      setRpsPlayerScore(s => s + 1);
      setRpsResultMsg('PLAYER VICTORY! +1 POINT');
      playSuccess();
    } else {
      setRpsCpuScore(s => s + 1);
      setRpsResultMsg('CPU WINS THIS ROUND');
      playError();
    }
  };

  // 9. DICE ROLLER
  const [diceVals, setDiceVals] = useState([6, 6]);
  const rollDice = () => {
    playClick();
    setDiceVals([
      Math.floor(Math.random() * 6) + 1,
      Math.floor(Math.random() * 6) + 1
    ]);
    playCoin();
  };

  return (
    <div className="space-y-6">
      {/* Subtool Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar border-b-2 border-deck-border pb-3">
        {[
          { id: 'snake', label: 'RETRO SNAKE', icon: Gamepad2, activeClass: 'btn-pixel-emerald' },
          { id: 'minesweeper', label: 'MINESWEEPER', icon: Bomb, activeClass: 'btn-pixel-coral' },
          { id: 'g2048', label: '2048 PUZZLE', icon: Grid3X3, activeClass: 'btn-pixel-amber' },
          { id: 'wordle', label: 'WORD GUESS', icon: Type, activeClass: 'btn-pixel-lime' },
          { id: 'rps', label: 'ROCK PAPER SCISSORS', icon: Scissors, activeClass: 'btn-pixel-teal' },
          { id: 'memory', label: 'MEMORY MATCH', icon: Layers, activeClass: 'btn-pixel-purple' },
          { id: 'tictactoe', label: 'TIC TAC TOE', icon: Trophy, activeClass: 'btn-pixel-cyan' },
          { id: 'cointoss', label: '3D COIN TOSS', icon: CircleDot, activeClass: 'btn-pixel-orange' },
          { id: 'dice', label: 'DICE ROLLER', icon: Dices, activeClass: 'btn-pixel-pink' },
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

      {/* 1. RETRO SNAKE */}
      {activeTab === 'snake' && (
        <div className="max-w-md mx-auto pixel-card bg-deck-dark p-3 sm:p-6 space-y-3 sm:space-y-4 border border-deck-border font-mono text-xs text-center w-full">
          <div className="flex items-center justify-between border-b border-deck-border pb-2">
            <span className="font-pixel text-[10px] sm:text-xs text-arcade-emerald">RETRO 8-BIT SNAKE</span>
            <span className="font-pixel text-xs sm:text-sm text-arcade-amber">SCORE: {snakeScore}</span>
          </div>

          <div 
            className="relative deck-viewport inline-block mx-auto max-w-full overflow-hidden touch-none"
            onTouchStart={(e) => {
              const touch = e.touches[0];
              snakeRef.touchStartX = touch.clientX;
              snakeRef.touchStartY = touch.clientY;
            }}
            onTouchEnd={(e) => {
              if (!snakeRef.touchStartX || !snakeRef.touchStartY) return;
              const dx = e.changedTouches[0].clientX - snakeRef.touchStartX;
              const dy = e.changedTouches[0].clientY - snakeRef.touchStartY;
              if (Math.abs(dx) > Math.abs(dy)) {
                if (dx > 25 && dirRef.current[0] === 0) dirRef.current = [1, 0];
                else if (dx < -25 && dirRef.current[0] === 0) dirRef.current = [-1, 0];
              } else {
                if (dy > 25 && dirRef.current[1] === 0) dirRef.current = [0, 1];
                else if (dy < -25 && dirRef.current[1] === 0) dirRef.current = [0, -1];
              }
            }}
          >
            <canvas ref={snakeCanvasRef} width={300} height={300} className="block w-[280px] xs:w-[300px] h-[280px] xs:h-[300px] max-w-full aspect-square" />
            {snakeGameOver && (
              <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center space-y-3 p-4">
                <span className="font-pixel text-sm sm:text-base text-arcade-coral">GAME OVER</span>
                <button
                  onClick={startSnake}
                  className="btn-pixel btn-pixel-emerald px-4 py-2 font-pixel text-xs"
                >
                  PLAY AGAIN
                </button>
              </div>
            )}
          </div>

          {!snakeGameOver && (
            <button
              onClick={startSnake}
              className="btn-pixel btn-pixel-emerald w-full py-2.5 font-pixel text-xs"
            >
              START GAME
            </button>
          )}

          {/* Touch Arcade D-Pad Controller (Ideal for phones & tablets) */}
          <div className="pt-2 max-w-[200px] mx-auto select-none">
            <div className="text-[9px] text-arcade-muted font-pixel mb-1.5 uppercase">TOUCH ARROW D-PAD</div>
            <div className="grid grid-cols-3 gap-1.5">
              <div></div>
              <button
                type="button"
                onClick={() => { if (dirRef.current[1] === 0) dirRef.current = [0, -1]; playClick(); }}
                className="btn-pixel btn-pixel-surface py-2 text-arcade-emerald font-pixel text-sm flex items-center justify-center"
                aria-label="Up"
              >
                ▲
              </button>
              <div></div>
              <button
                type="button"
                onClick={() => { if (dirRef.current[0] === 0) dirRef.current = [-1, 0]; playClick(); }}
                className="btn-pixel btn-pixel-surface py-2 text-arcade-emerald font-pixel text-sm flex items-center justify-center"
                aria-label="Left"
              >
                ◀
              </button>
              <button
                type="button"
                onClick={() => { if (dirRef.current[1] === 0) dirRef.current = [0, 1]; playClick(); }}
                className="btn-pixel btn-pixel-surface py-2 text-arcade-emerald font-pixel text-sm flex items-center justify-center"
                aria-label="Down"
              >
                ▼
              </button>
              <button
                type="button"
                onClick={() => { if (dirRef.current[0] === 0) dirRef.current = [1, 0]; playClick(); }}
                className="btn-pixel btn-pixel-surface py-2 text-arcade-emerald font-pixel text-sm flex items-center justify-center"
                aria-label="Right"
              >
                ▶
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. MINESWEEPER */}
      {activeTab === 'minesweeper' && (
        <div className="max-w-xs mx-auto pixel-card bg-deck-dark p-4 space-y-4 border border-deck-border font-mono text-xs text-center">
          <div className="flex items-center justify-between border-b border-deck-border pb-2">
            <span className="font-pixel text-[10px] text-arcade-coral flex items-center gap-1">
              <Bomb className="w-3 h-3" /> 10 MINES
            </span>
            <button
              onClick={initMinesweeper}
              className="btn-pixel btn-pixel-surface p-1 text-arcade-amber"
              title="Reset Grid"
            >
              {mineStatus === 'lost' ? <Frown className="w-4 h-4 text-arcade-coral" /> : <Smile className="w-4 h-4 text-arcade-emerald" />}
            </button>
            <button
              onClick={() => { setFlagMode(!flagMode); playClick(); }}
              className={`btn-pixel px-2 py-1 font-pixel text-[8px] flex items-center gap-1 ${
                flagMode ? 'btn-pixel-coral' : 'btn-pixel-surface'
              }`}
            >
              <Flag className="w-3 h-3" /> FLAG
            </button>
          </div>

          {/* Minesweeper Grid */}
          <div className="grid grid-cols-9 gap-1 bg-deck-bg p-2 border-2 border-black inline-block mx-auto">
            {mineGrid.map((row, r) => 
              row.map((cell, c) => (
                <button
                  key={`${r}-${c}`}
                  onClick={() => revealCell(r, c)}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    const newGrid = mineGrid.map(rw => rw.map(cl => ({ ...cl })));
                    newGrid[r][c].flagged = !newGrid[r][c].flagged;
                    setMineGrid(newGrid);
                    playClick();
                  }}
                  className={`w-7 h-7 font-pixel text-[10px] flex items-center justify-center select-none border ${
                    cell.revealed
                      ? cell.isMine 
                        ? 'bg-red-600 text-white border-black' 
                        : 'bg-deck-dark border-deck-border text-arcade-cyan'
                      : 'bg-deck-surface hover:bg-deck-surfaceHover border-black shadow-pixel-sm'
                  }`}
                >
                  {cell.revealed ? (
                    cell.isMine ? '💣' : (cell.count > 0 ? cell.count : '')
                  ) : (
                    cell.flagged ? '🚩' : ''
                  )}
                </button>
              ))
            )}
          </div>

          {mineStatus === 'lost' && (
            <div className="text-arcade-coral font-pixel text-xs animate-bounce">
              BOOM! YOU HIT A MINE.
            </div>
          )}
          {mineStatus === 'won' && (
            <div className="text-arcade-emerald font-pixel text-xs animate-bounce">
              VICTORY! ALL MINES DEFUSED.
            </div>
          )}
        </div>
      )}

      {/* 3. MEMORY MATCH */}
      {activeTab === 'memory' && (
        <div className="max-w-md mx-auto pixel-card bg-deck-dark p-6 space-y-4 border border-deck-border font-mono text-xs text-center">
          <div className="flex items-center justify-between border-b border-deck-border pb-2">
            <span className="font-pixel text-xs text-arcade-violet">PIXEL MEMORY MATCH</span>
            <span className="font-pixel text-xs text-arcade-amber">MOVES: {moves}</span>
          </div>

          <div className="grid grid-cols-4 gap-2 w-64 h-64 mx-auto my-4">
            {cards.map((card, idx) => {
              const isOpen = flipped.includes(idx) || matched.includes(idx);
              return (
                <button
                  key={idx}
                  onClick={() => handleCardClick(idx)}
                  className={`w-full h-full font-pixel text-2xl border-2 flex items-center justify-center transition-all ${
                    isOpen 
                      ? 'bg-deck-surface border-arcade-emerald text-white' 
                      : 'bg-deck-bg border-black shadow-pixel-sm hover:border-arcade-violet text-transparent'
                  }`}
                >
                  {isOpen ? card.icon : '❓'}
                </button>
              );
            })}
          </div>

          {matched.length === cards.length && cards.length > 0 && (
            <div className="text-arcade-emerald font-pixel text-xs space-y-2">
              <div>PERFECT MEMORY! COMPLETED IN {moves} MOVES.</div>
              <button
                onClick={initMemoryGame}
                className="btn-pixel btn-pixel-emerald px-4 py-2 font-pixel text-xs"
              >
                PLAY AGAIN
              </button>
            </div>
          )}
        </div>
      )}

      {/* 4. TIC TAC TOE */}
      {activeTab === 'tictactoe' && (
        <div className="max-w-xs mx-auto pixel-card bg-deck-dark p-6 space-y-4 border border-deck-border font-mono text-xs text-center">
          <div className="font-pixel text-xs text-arcade-cyan">
            {calculateWinner(board)
              ? (calculateWinner(board) === 'Tie' ? 'MATCH TIED' : `WINNER: ${calculateWinner(board)}`)
              : `TURN: PLAYER ${isXNext ? 'X' : 'O'}`}
          </div>

          <div className="grid grid-cols-3 gap-2 w-60 h-60 mx-auto">
            {board.map((sq, idx) => (
              <button
                key={idx}
                onClick={() => handleSquareClick(idx)}
                className="w-full h-full bg-deck-bg border-2 border-deck-border hover:border-arcade-emerald font-pixel text-2xl flex items-center justify-center"
              >
                <span className={sq === 'X' ? 'text-arcade-coral' : 'text-arcade-emerald'}>
                  {sq}
                </span>
              </button>
            ))}
          </div>

          <button
            onClick={resetTtt}
            className="btn-pixel btn-pixel-surface w-full py-2 font-pixel text-xs"
          >
            RESET BOARD
          </button>
        </div>
      )}

      {/* 5. 2048 ARCADE PUZZLE */}
      {activeTab === 'g2048' && (
        <div className="max-w-sm mx-auto pixel-card bg-deck-dark p-4 sm:p-6 space-y-4 border border-deck-border font-mono text-xs text-center">
          <div className="flex items-center justify-between border-b border-deck-border pb-2">
            <span className="font-pixel text-xs text-arcade-amber">2048 RETRO PUZZLE</span>
            <div className="flex items-center gap-2">
              <div className="px-2 py-0.5 bg-deck-bg border border-deck-border text-[9px] font-pixel">
                SCORE: <span className="text-arcade-emerald">{score2048}</span>
              </div>
              <div className="px-2 py-0.5 bg-deck-bg border border-deck-border text-[9px] font-pixel">
                BEST: <span className="text-arcade-cyan">{bestScore2048}</span>
              </div>
            </div>
          </div>

          {/* 4x4 Grid */}
          <div className="bg-deck-bg p-2.5 border-4 border-black grid grid-cols-4 gap-2 shadow-pixel aspect-square">
            {grid2048.map((row, r) =>
              row.map((val, c) => {
                const getTileColor = (v) => {
                  if (v === 0) return 'bg-deck-dark/60 text-transparent border-deck-border/40';
                  if (v === 2) return 'bg-zinc-800 text-slate-100 border-zinc-600';
                  if (v === 4) return 'bg-amber-950 text-amber-200 border-amber-600';
                  if (v === 8) return 'bg-orange-600 text-white border-black font-bold';
                  if (v === 16) return 'bg-rose-600 text-white border-black font-bold';
                  if (v === 32) return 'bg-purple-600 text-white border-black font-bold';
                  if (v === 64) return 'bg-cyan-600 text-white border-black font-bold';
                  if (v === 128) return 'bg-emerald-500 text-black border-black font-bold';
                  if (v === 256) return 'bg-yellow-400 text-black border-black font-bold';
                  if (v === 512) return 'bg-pink-500 text-white border-black font-bold';
                  return 'bg-gradient-to-r from-amber-400 to-rose-500 text-black border-black font-bold shadow-pixel-sm';
                };

                return (
                  <div
                    key={`${r}-${c}`}
                    className={`border-2 flex items-center justify-center font-pixel text-xs sm:text-sm transition-all duration-100 ${getTileColor(val)}`}
                  >
                    {val > 0 ? val : ''}
                  </div>
                );
              })
            )}
          </div>

          {over2048 && (
            <div className="p-2.5 bg-red-950/80 border-2 border-arcade-coral text-arcade-coral font-pixel text-[10px] animate-pulse">
              GAME OVER! NO MORE MOVES
            </div>
          )}

          {/* Mobile / Touch Arrow Pad */}
          <div className="grid grid-cols-3 gap-2 max-w-[180px] mx-auto pt-1">
            <div />
            <button
              onClick={() => move2048('UP')}
              className="btn-pixel btn-pixel-surface py-2 font-pixel text-xs text-center"
            >
              ▲
            </button>
            <div />
            <button
              onClick={() => move2048('LEFT')}
              className="btn-pixel btn-pixel-surface py-2 font-pixel text-xs text-center"
            >
              ◀
            </button>
            <button
              onClick={() => move2048('DOWN')}
              className="btn-pixel btn-pixel-surface py-2 font-pixel text-xs text-center"
            >
              ▼
            </button>
            <button
              onClick={() => move2048('RIGHT')}
              className="btn-pixel btn-pixel-surface py-2 font-pixel text-xs text-center"
            >
              ▶
            </button>
          </div>

          <button
            onClick={reset2048}
            className="btn-pixel btn-pixel-amber w-full py-2.5 font-pixel text-[9px] flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            NEW 2048 GAME
          </button>
        </div>
      )}

      {/* 6. WORDLE 5-LETTER WORD GUESS */}
      {activeTab === 'wordle' && (
        <div className="max-w-sm mx-auto pixel-card bg-deck-dark p-4 sm:p-6 space-y-4 border border-deck-border font-mono text-xs text-center">
          <div className="flex items-center justify-between border-b border-deck-border pb-2">
            <span className="font-pixel text-xs text-arcade-lime">WORDLE CYBER-GUESS</span>
            <span className="text-[9px] font-pixel text-arcade-muted">
              {wordleGuesses.length} / 6 TRIES
            </span>
          </div>

          {/* 6 Rows of 5 Letters */}
          <div className="space-y-1.5 max-w-[240px] mx-auto">
            {Array(6).fill(null).map((_, rowIdx) => {
              const guess = wordleGuesses[rowIdx];
              const isCurrent = rowIdx === wordleGuesses.length;
              const letters = guess ? guess.split('') : isCurrent ? wordleCurrent.padEnd(5, ' ').split('') : Array(5).fill(' ');

              return (
                <div key={rowIdx} className="grid grid-cols-5 gap-1.5">
                  {letters.map((char, colIdx) => {
                    let tileColor = 'bg-deck-bg border-deck-border text-white';
                    if (guess) {
                      if (guess[colIdx] === wordleTarget[colIdx]) {
                        tileColor = 'bg-emerald-600 text-white border-black font-bold';
                      } else if (wordleTarget.includes(guess[colIdx])) {
                        tileColor = 'bg-amber-500 text-black border-black font-bold';
                      } else {
                        tileColor = 'bg-zinc-800 text-slate-400 border-black';
                      }
                    }

                    return (
                      <div
                        key={colIdx}
                        className={`w-10 h-10 border-2 flex items-center justify-center font-pixel text-sm uppercase ${tileColor}`}
                      >
                        {char.trim()}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>

          {wordleStatus === 'WON' && (
            <div className="p-3 bg-emerald-950/80 border-2 border-arcade-emerald text-arcade-emerald font-pixel text-[10px]">
              🎉 MISSION ACCOMPLISHED! WORD: {wordleTarget}
            </div>
          )}

          {wordleStatus === 'LOST' && (
            <div className="p-3 bg-red-950/80 border-2 border-arcade-coral text-arcade-coral font-pixel text-[10px]">
              DECRYPT FAILED! WORD WAS: {wordleTarget}
            </div>
          )}

          {wordleStatus === 'PLAYING' && (
            <form onSubmit={submitWordleGuess} className="flex gap-2">
              <input
                type="text"
                maxLength={5}
                value={wordleCurrent}
                onChange={(e) => setWordleCurrent(e.target.value.toUpperCase())}
                placeholder="5-LETTERS"
                className="flex-1 bg-deck-bg border-2 border-deck-border focus:border-arcade-lime p-2 font-pixel text-center text-sm uppercase"
              />
              <button
                type="submit"
                disabled={wordleCurrent.trim().length !== 5}
                className="btn-pixel btn-pixel-lime px-4 py-2 font-pixel text-[9px] disabled:opacity-40"
              >
                SUBMIT
              </button>
            </form>
          )}

          <button
            onClick={resetWordle}
            className="btn-pixel btn-pixel-surface w-full py-2 font-pixel text-[9px] text-white"
          >
            RESET WORDLE
          </button>
        </div>
      )}

      {/* 7. ROCK PAPER SCISSORS */}
      {activeTab === 'rps' && (
        <div className="max-w-md mx-auto pixel-card bg-deck-dark p-6 space-y-6 border border-deck-border font-mono text-xs text-center">
          <div className="flex items-center justify-between border-b border-deck-border pb-2">
            <span className="font-pixel text-xs text-arcade-teal">ROCK • PAPER • SCISSORS</span>
            <div className="flex items-center gap-2 font-pixel text-[9px]">
              <span className="text-arcade-emerald">YOU: {rpsPlayerScore}</span>
              <span className="text-arcade-muted">|</span>
              <span className="text-arcade-coral">CPU: {rpsCpuScore}</span>
              <span className="text-arcade-muted">|</span>
              <span className="text-arcade-cyan">TIE: {rpsTies}</span>
            </div>
          </div>

          <div className="p-4 bg-deck-bg border-2 border-black shadow-pixel space-y-2">
            <div className="font-pixel text-xs text-arcade-amber">{rpsResultMsg}</div>
            <div className="flex items-center justify-around py-3">
              <div className="space-y-1">
                <span className="text-[10px] text-arcade-muted font-pixel block">PLAYER</span>
                <div className="text-4xl">
                  {rpsPlayerChoice === 'ROCK' ? '🪨' : rpsPlayerChoice === 'PAPER' ? '📄' : rpsPlayerChoice === 'SCISSORS' ? '✂️' : '❓'}
                </div>
              </div>
              <span className="font-pixel text-sm text-arcade-muted">VS</span>
              <div className="space-y-1">
                <span className="text-[10px] text-arcade-muted font-pixel block">CPU</span>
                <div className="text-4xl">
                  {rpsCpuChoice === 'ROCK' ? '🪨' : rpsCpuChoice === 'PAPER' ? '📄' : rpsCpuChoice === 'SCISSORS' ? '✂️' : '🤖'}
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'ROCK', emoji: '🪨', label: 'ROCK' },
              { id: 'PAPER', emoji: '📄', label: 'PAPER' },
              { id: 'SCISSORS', emoji: '✂️', label: 'SCISSORS' },
            ].map(w => (
              <button
                key={w.id}
                onClick={() => playRps(w.id)}
                className="btn-pixel btn-pixel-teal py-3 flex flex-col items-center gap-1 font-pixel text-[9px]"
              >
                <span className="text-2xl">{w.emoji}</span>
                {w.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 8. 3D COIN TOSS (Real CSPRNG & Streak Statistics) */}
      {activeTab === 'cointoss' && (
        <div className="max-w-md mx-auto pixel-card bg-deck-dark p-6 space-y-6 border border-deck-border font-mono text-xs text-center">
          <div className="flex items-center justify-between border-b border-deck-border pb-2">
            <span className="font-pixel text-xs text-arcade-amber">3D CSPRNG COIN TOSS</span>
            <button
              onClick={resetCoinStats}
              className="text-[9px] text-arcade-coral font-pixel hover:underline"
            >
              RESET STATS
            </button>
          </div>

          {/* 3D Coin Model */}
          <div className="py-4 perspective-1000 flex justify-center items-center">
            <div
              style={{
                transform: `rotateY(${coinRotation}deg)`,
                transition: tossing ? 'transform 0.7s cubic-bezier(0.2, 0.8, 0.3, 1)' : 'none'
              }}
              className="w-32 h-32 rounded-full border-4 border-black bg-gradient-to-tr from-amber-500 via-yellow-300 to-amber-600 flex flex-col items-center justify-center font-pixel text-lg text-black shadow-pixel cursor-pointer select-none"
              onClick={flipCoin}
            >
              <span className="text-2xl mb-1">{coinResult === 'HEADS' ? '👑' : '🦅'}</span>
              <span>{coinResult}</span>
            </div>
          </div>

          {/* Statistical Breakdown */}
          <div className="grid grid-cols-4 gap-2 text-center text-xs">
            <div className="p-2 bg-deck-bg border border-deck-border">
              <span className="text-arcade-muted text-[8px] font-pixel block">HEADS</span>
              <strong className="text-arcade-emerald font-pixel text-sm">{coinStats.heads}</strong>
            </div>
            <div className="p-2 bg-deck-bg border border-deck-border">
              <span className="text-arcade-muted text-[8px] font-pixel block">TAILS</span>
              <strong className="text-arcade-cyan font-pixel text-sm">{coinStats.tails}</strong>
            </div>
            <div className="p-2 bg-deck-bg border border-deck-border">
              <span className="text-arcade-muted text-[8px] font-pixel block">STREAK</span>
              <strong className="text-arcade-amber font-pixel text-sm">
                {Math.abs(coinStats.streak)} {coinStats.streak > 0 ? 'H' : coinStats.streak < 0 ? 'T' : '-'}
              </strong>
            </div>
            <div className="p-2 bg-deck-bg border border-deck-border">
              <span className="text-arcade-muted text-[8px] font-pixel block">BEST</span>
              <strong className="text-arcade-coral font-pixel text-sm">{coinStats.bestStreak}</strong>
            </div>
          </div>

          {/* History Pill Badges */}
          {coinHistory.length > 0 && (
            <div className="space-y-1">
              <span className="text-[9px] text-arcade-muted font-pixel">RECENT FLIPS:</span>
              <div className="flex items-center justify-center gap-1.5 flex-wrap">
                {coinHistory.map((h, i) => (
                  <span
                    key={i}
                    className={`w-6 h-6 border font-pixel text-[9px] flex items-center justify-center ${
                      h === 'H' ? 'bg-amber-400 text-black border-black font-bold' : 'bg-cyan-400 text-black border-black font-bold'
                    }`}
                  >
                    {h}
                  </span>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={flipCoin}
            disabled={tossing}
            className="btn-pixel btn-pixel-amber w-full py-3 font-pixel text-xs disabled:opacity-50"
          >
            {tossing ? 'FLIPPING COIN...' : 'FLIP COIN'}
          </button>
        </div>
      )}

      {/* 9. DICE ROLLER */}
      {activeTab === 'dice' && (
        <div className="max-w-xs mx-auto pixel-card bg-deck-dark p-6 space-y-6 border border-deck-border font-mono text-xs text-center">
          <span className="font-pixel text-xs text-arcade-emerald">DUAL DICE ROLLER</span>

          <div className="flex justify-center gap-4">
            {diceVals.map((val, idx) => (
              <div
                key={idx}
                className="w-20 h-20 bg-white border-4 border-black shadow-pixel flex items-center justify-center font-pixel text-3xl text-black"
              >
                {val}
              </div>
            ))}
          </div>

          <div className="font-pixel text-arcade-cyan text-sm">
            SUM: {diceVals[0] + diceVals[1]}
          </div>

          <button
            onClick={rollDice}
            className="btn-pixel btn-pixel-emerald w-full py-3 font-pixel text-xs"
          >
            ROLL DICE
          </button>
        </div>
      )}
    </div>
  );
}
