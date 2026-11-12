import React, { useState, useEffect, useRef } from 'react';
import { 
  Gamepad2, Trophy, RotateCcw, Play, Sparkles, 
  HelpCircle, CircleDot, Dices, Flag, Bomb, Smile, Frown, Layers, HelpCircle as QuizIcon
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

  // 5. COIN TOSS
  const [coinResult, setCoinResult] = useState('HEADS');
  const [tossing, setTossing] = useState(false);

  const flipCoin = () => {
    setTossing(true);
    playClick();
    setTimeout(() => {
      const res = Math.random() > 0.5 ? 'HEADS' : 'TAILS';
      setCoinResult(res);
      setTossing(false);
      playCoin();
    }, 600);
  };

  // 6. DICE ROLLER
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
          { id: 'snake', label: 'RETRO SNAKE', icon: Gamepad2 },
          { id: 'minesweeper', label: 'MINESWEEPER', icon: Bomb },
          { id: 'memory', label: 'MEMORY MATCH', icon: Layers },
          { id: 'tictactoe', label: 'TIC TAC TOE', icon: Trophy },
          { id: 'cointoss', label: 'COIN TOSS', icon: CircleDot },
          { id: 'dice', label: 'DICE ROLLER', icon: Dices },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => { playClick(); setActiveTab(tab.id); }}
              className={`btn-pixel px-3 py-1.5 font-pixel text-[9px] flex items-center gap-2 shrink-0 ${
                isActive ? 'btn-pixel-amber' : 'btn-pixel-surface'
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
        <div className="max-w-md mx-auto pixel-card bg-deck-dark p-6 space-y-4 border border-deck-border font-mono text-xs text-center">
          <div className="flex items-center justify-between border-b border-deck-border pb-2">
            <span className="font-pixel text-xs text-arcade-emerald">RETRO 8-BIT SNAKE</span>
            <span className="font-pixel text-sm text-arcade-amber">SCORE: {snakeScore}</span>
          </div>

          <div className="relative deck-viewport inline-block mx-auto">
            <canvas ref={snakeCanvasRef} width={320} height={320} className="block" />
            {snakeGameOver && (
              <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center space-y-3">
                <span className="font-pixel text-base text-arcade-coral">GAME OVER</span>
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
              START GAME (ARROW KEYS)
            </button>
          )}
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

      {/* 5. COIN TOSS */}
      {activeTab === 'cointoss' && (
        <div className="max-w-xs mx-auto pixel-card bg-deck-dark p-6 space-y-6 border border-deck-border font-mono text-xs text-center">
          <span className="font-pixel text-xs text-arcade-amber">CHANCE COIN TOSS</span>

          <div className={`w-32 h-32 rounded-full border-4 border-black bg-arcade-amber mx-auto flex items-center justify-center font-pixel text-xl text-black shadow-pixel ${
            tossing ? 'animate-spin' : ''
          }`}>
            {coinResult}
          </div>

          <button
            onClick={flipCoin}
            disabled={tossing}
            className="btn-pixel btn-pixel-amber w-full py-3 font-pixel text-xs disabled:opacity-50"
          >
            FLIP COIN
          </button>
        </div>
      )}

      {/* 6. DICE ROLLER */}
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
