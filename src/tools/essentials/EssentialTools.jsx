import React, { useState, useEffect } from 'react';
import { 
  Flashlight, QrCode, BookOpen, Languages, CheckSquare, 
  FileEdit, ShoppingCart, Key, Shield, Copy, Check, RefreshCw
} from 'lucide-react';
import QRCode from 'qrcode';
import { playClick, playCoin } from '../../audio/soundEffects';

export default function EssentialTools() {
  const [activeTab, setActiveTab] = useState('flashlight'); 
  // 'flashlight' | 'passgen' | 'qr' | 'dictionary' | 'notes' | 'todo' | 'shopping'

  // 1. FLASHLIGHT STATE
  const [flashColor, setFlashColor] = useState('#ffffff');
  const [flashMode, setFlashMode] = useState('solid'); // 'solid' | 'strobe' | 'sos'
  const [isFlashActive, setIsFlashActive] = useState(false);
  const [strobeState, setStrobeState] = useState(true);

  useEffect(() => {
    let interval = null;
    if (isFlashActive && flashMode === 'strobe') {
      interval = setInterval(() => setStrobeState(prev => !prev), 100);
    } else if (isFlashActive && flashMode === 'sos') {
      interval = setInterval(() => setStrobeState(prev => !prev), 250);
    } else {
      setStrobeState(true);
    }
    return () => clearInterval(interval);
  }, [isFlashActive, flashMode]);

  // 2. SECURE PASSWORD & PASSPHRASE GENERATOR
  const [passMode, setPassMode] = useState('csprng'); // 'csprng' | 'passphrase'
  const [passLength, setPassLength] = useState(16);
  const [wordCount, setWordCount] = useState(4);
  const [useUpper, setUseUpper] = useState(true);
  const [useLower, setUseLower] = useState(true);
  const [useNumbers, setUseNumbers] = useState(true);
  const [useSymbols, setUseSymbols] = useState(true);
  const [generatedPass, setGeneratedPass] = useState('');
  const [passCopied, setPassCopied] = useState(false);
  const [entropyBits, setEntropyBits] = useState(90);

  const DICTIONARY_WORDS = [
    'quantum', 'matrix', 'signal', 'cipher', 'beacon', 'orbit', 'neon', 'vector',
    'flux', 'pulse', 'core', 'hyper', 'relay', 'spark', 'glitch', 'pixel',
    'grid', 'delta', 'sonic', 'turbo', 'plasma', 'laser', 'prism', 'vortex',
    'alpha', 'omega', 'nexus', 'shield', 'shadow', 'falcon', 'comet', 'radar'
  ];

  const generatePassword = () => {
    if (passMode === 'passphrase') {
      const array = new Uint32Array(wordCount);
      window.crypto.getRandomValues(array);
      const chosen = [];
      for (let i = 0; i < wordCount; i++) {
        chosen.push(DICTIONARY_WORDS[array[i] % DICTIONARY_WORDS.length]);
      }
      const numArr = new Uint32Array(1);
      window.crypto.getRandomValues(numArr);
      const randNum = (numArr[0] % 90) + 10;
      const pass = chosen.join('-') + '-' + randNum;
      setGeneratedPass(pass);
      setEntropyBits(Math.round(wordCount * Math.log2(DICTIONARY_WORDS.length) + Math.log2(90)));
    } else {
      let chars = '';
      if (useUpper) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      if (useLower) chars += 'abcdefghijklmnopqrstuvwxyz';
      if (useNumbers) chars += '0123456789';
      if (useSymbols) chars += '!@#$%^&*()-_=+[]{}<>?~';
      if (!chars) chars = 'abcdefghijklmnopqrstuvwxyz';

      const array = new Uint32Array(passLength);
      window.crypto.getRandomValues(array);
      let out = '';
      for (let i = 0; i < passLength; i++) {
        out += chars[array[i] % chars.length];
      }
      setGeneratedPass(out);
      setEntropyBits(Math.round(passLength * Math.log2(chars.length)));
    }
    playCoin();
  };

  useEffect(() => {
    generatePassword();
  }, [passMode, passLength, wordCount, useUpper, useLower, useNumbers, useSymbols]);

  const copyPassword = () => {
    navigator.clipboard.writeText(generatedPass);
    setPassCopied(true);
    playClick();
    setTimeout(() => setPassCopied(false), 1500);
  };

  // 3. QR CODE GENERATOR & SCANNER
  const [qrText, setQrText] = useState('https://github.com/junkfood02/Seal');
  const [qrDataUrl, setQrDataUrl] = useState('');

  useEffect(() => {
    if (qrText) {
      QRCode.toDataURL(qrText, {
        width: 250,
        margin: 2,
        color: { dark: '#000000', light: '#ffffff' }
      }).then(setQrDataUrl);
    }
  }, [qrText]);

  // 4. DICTIONARY
  const [dictQuery, setDictQuery] = useState('cybernetics');
  const [dictResult, setDictResult] = useState(null);
  const [dictLoading, setDictLoading] = useState(false);

  const lookupWord = async (e) => {
    if (e) e.preventDefault();
    if (!dictQuery.trim()) return;
    setDictLoading(true);
    playClick();

    try {
      const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(dictQuery.trim())}`);
      if (res.ok) {
        const data = await res.json();
        setDictResult(data[0]);
      } else {
        setDictResult({ error: 'Word not found.' });
      }
    } catch (err) {
      setDictResult({ error: 'Lookup failed.' });
    } finally {
      setDictLoading(false);
    }
  };

  // 5. QUICK NOTES (Autosave markdown scratchpad without personal name)
  const [notes, setNotes] = useState(() => localStorage.getItem('omnideck_notes') || '# Omni-Deck Quick Scratchpad\n- Modular offline-first workstation\n- 130+ tools matrix');

  useEffect(() => {
    localStorage.setItem('omnideck_notes', notes);
  }, [notes]);

  // 6. TO-DO MANAGER
  const [todos, setTodos] = useState([
    { id: 1, text: 'Audit SSL certificate for local domain', done: true },
    { id: 2, text: 'Download 4K playlist via Universal Downloader', done: false },
    { id: 3, text: 'Extract palette from game UI screenshot', done: false }
  ]);
  const [newTodo, setNewTodo] = useState('');

  const addTodo = (e) => {
    e.preventDefault();
    if (!newTodo.trim()) return;
    setTodos([...todos, { id: Date.now(), text: newTodo.trim(), done: false }]);
    setNewTodo('');
    playCoin();
  };

  // 7. SHOPPING LIST
  const [shoppingItems, setShoppingItems] = useState([
    { id: 1, item: 'Mechanical Keyboard Switches', price: 35, bought: false },
    { id: 2, item: 'MicroSD Card 128GB', price: 18, bought: true }
  ]);
  const [newShopItem, setNewShopItem] = useState('');
  const [newShopPrice, setNewShopPrice] = useState('');

  const addShopItem = (e) => {
    e.preventDefault();
    if (!newShopItem) return;
    setShoppingItems([...shoppingItems, { id: Date.now(), item: newShopItem, price: Number(newShopPrice) || 0, bought: false }]);
    setNewShopItem('');
    setNewShopPrice('');
    playCoin();
  };

  const shopTotal = shoppingItems.reduce((s, i) => s + i.price, 0);

  return (
    <div className="space-y-6">
      {/* Subtool Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar border-b-2 border-deck-border pb-3">
        {[
          { id: 'flashlight', label: 'FLASHLIGHT MODES', icon: Flashlight, activeClass: 'btn-pixel-yellow' },
          { id: 'passgen', label: 'PASSWORD GENERATOR', icon: Key, activeClass: 'btn-pixel-emerald' },
          { id: 'qr', label: 'QR GENERATOR', icon: QrCode, activeClass: 'btn-pixel-cyan' },
          { id: 'dictionary', label: 'DICTIONARY', icon: BookOpen, activeClass: 'btn-pixel-blue' },
          { id: 'notes', label: 'QUICK NOTES', icon: FileEdit, activeClass: 'btn-pixel-orange' },
          { id: 'todo', label: 'TO-DO BOARD', icon: CheckSquare, activeClass: 'btn-pixel-lime' },
          { id: 'shopping', label: 'SHOPPING LIST', icon: ShoppingCart, activeClass: 'btn-pixel-pink' },
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

      {/* 1. FLASHLIGHT */}
      {activeTab === 'flashlight' && (
        <div className="max-w-lg mx-auto pixel-card bg-deck-dark p-6 space-y-6 border border-deck-border font-mono text-xs text-center">
          <div className="space-y-3">
            <span className="font-pixel text-[10px] text-arcade-muted uppercase">SCREEN TORCH & STROBE</span>

            <div
              className="w-full h-48 border-4 border-black transition-colors flex items-center justify-center cursor-pointer shadow-pixel"
              style={{
                backgroundColor: isFlashActive && strobeState ? flashColor : '#0a0d12'
              }}
              onClick={() => setIsFlashActive(!isFlashActive)}
            >
              <span className={`font-pixel text-xs px-3 py-1 border border-black ${
                isFlashActive ? 'bg-black text-white' : 'bg-deck-surface text-arcade-muted'
              }`}>
                {isFlashActive ? 'TOUCH TO DEACTIVATE' : 'TOUCH TO ACTIVATE'}
              </span>
            </div>

            <div className="flex justify-center gap-2 pt-2">
              <button
                onClick={() => setFlashMode('solid')}
                className={`btn-pixel px-3 py-1.5 font-pixel text-[8px] ${
                  flashMode === 'solid' ? 'btn-pixel-emerald' : 'btn-pixel-surface'
                }`}
              >
                SOLID TORCH
              </button>
              <button
                onClick={() => setFlashMode('strobe')}
                className={`btn-pixel px-3 py-1.5 font-pixel text-[8px] ${
                  flashMode === 'strobe' ? 'btn-pixel-amber' : 'btn-pixel-surface'
                }`}
              >
                STROBE BEACON
              </button>
              <button
                onClick={() => setFlashMode('sos')}
                className={`btn-pixel px-3 py-1.5 font-pixel text-[8px] ${
                  flashMode === 'sos' ? 'btn-pixel-coral' : 'btn-pixel-surface'
                }`}
              >
                SOS MORSE
              </button>
            </div>

            <div className="flex justify-center gap-3 pt-2">
              {['#ffffff', '#ff4757', '#ffb703', '#00ff88', '#00f0ff'].map(col => (
                <button
                  key={col}
                  onClick={() => setFlashColor(col)}
                  className={`w-7 h-7 border-2 ${flashColor === col ? 'border-white scale-110' : 'border-black'}`}
                  style={{ backgroundColor: col }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. PASSWORD GENERATOR */}
      {activeTab === 'passgen' && (
        <div className="max-w-xl mx-auto pixel-card bg-deck-dark p-6 space-y-4 border border-deck-border font-mono text-xs">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-deck-border pb-2">
            <span className="font-pixel text-xs text-arcade-amber">CRYPTOGRAPHIC ENTROPY GENERATOR</span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setPassMode('csprng')}
                className={`px-2 py-0.5 font-pixel text-[8px] border ${
                  passMode === 'csprng' ? 'bg-arcade-emerald text-black border-black font-bold' : 'bg-deck-bg text-arcade-muted border-deck-border'
                }`}
              >
                CSPRNG RANDOM
              </button>
              <button
                type="button"
                onClick={() => setPassMode('passphrase')}
                className={`px-2 py-0.5 font-pixel text-[8px] border ${
                  passMode === 'passphrase' ? 'bg-arcade-amber text-black border-black font-bold' : 'bg-deck-bg text-arcade-muted border-deck-border'
                }`}
              >
                PASSPHRASE
              </button>
            </div>
          </div>

          <div className="p-4 bg-deck-bg border-2 border-black flex items-center justify-between gap-3 shadow-pixel">
            <div className="font-pixel text-base sm:text-lg text-arcade-emerald break-all tracking-wider font-bold">
              {generatedPass}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={generatePassword}
                className="btn-pixel btn-pixel-surface p-2 text-arcade-amber"
                title="Regenerate Password"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                onClick={copyPassword}
                className="btn-pixel btn-pixel-amber px-3 py-2 font-pixel text-[9px] flex items-center gap-1.5"
              >
                {passCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {passCopied ? 'COPIED' : 'COPY'}
              </button>
            </div>
          </div>

          {/* Entropy & Strength Indicator */}
          <div className="flex items-center justify-between text-[11px] p-2 bg-deck-bg border border-deck-border">
            <span className="text-arcade-muted">ESTIMATED ENTROPY:</span>
            <div className="flex items-center gap-2">
              <span className="font-pixel text-[10px] text-arcade-amber">{entropyBits} BITS</span>
              <span className={`font-pixel text-[8px] px-1.5 py-0.5 ${
                entropyBits >= 100 ? 'bg-emerald-600 text-white' : entropyBits >= 60 ? 'bg-amber-500 text-black' : 'bg-red-500 text-white'
              }`}>
                {entropyBits >= 100 ? 'MILITARY GRADE (100+ BITS)' : entropyBits >= 60 ? 'VERY STRONG' : 'MODERATE'}
              </span>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            {passMode === 'csprng' ? (
              <>
                <div>
                  <div className="flex justify-between text-arcade-muted mb-1">
                    <span>Password Length ({passLength} Characters)</span>
                    <span className="font-bold">{passLength}</span>
                  </div>
                  <input
                    type="range"
                    min="8"
                    max="64"
                    value={passLength}
                    onChange={(e) => setPassLength(Number(e.target.value))}
                    className="w-full accent-arcade-amber"
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer p-2 bg-deck-bg border border-deck-border">
                    <input
                      type="checkbox"
                      checked={useUpper}
                      onChange={(e) => setUseUpper(e.target.checked)}
                      className="rounded-none accent-arcade-emerald"
                    />
                    <span className="text-xs">A-Z (Upper)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer p-2 bg-deck-bg border border-deck-border">
                    <input
                      type="checkbox"
                      checked={useLower}
                      onChange={(e) => setUseLower(e.target.checked)}
                      className="rounded-none accent-arcade-emerald"
                    />
                    <span className="text-xs">a-z (Lower)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer p-2 bg-deck-bg border border-deck-border">
                    <input
                      type="checkbox"
                      checked={useNumbers}
                      onChange={(e) => setUseNumbers(e.target.checked)}
                      className="rounded-none accent-arcade-emerald"
                    />
                    <span className="text-xs">0-9 (Digits)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer p-2 bg-deck-bg border border-deck-border">
                    <input
                      type="checkbox"
                      checked={useSymbols}
                      onChange={(e) => setUseSymbols(e.target.checked)}
                      className="rounded-none accent-arcade-emerald"
                    />
                    <span className="text-xs">!@#$ (Symbols)</span>
                  </label>
                </div>
              </>
            ) : (
              <div>
                <div className="flex justify-between text-arcade-muted mb-1">
                  <span>Passphrase Words ({wordCount} Words)</span>
                  <span className="font-bold">{wordCount}</span>
                </div>
                <input
                  type="range"
                  min="3"
                  max="8"
                  value={wordCount}
                  onChange={(e) => setWordCount(Number(e.target.value))}
                  className="w-full accent-arcade-amber"
                />
                <p className="text-[11px] text-arcade-muted mt-2">
                  Memorable Diceware-style passphrase composed of random words separated by hyphens. Ideal for master passwords and disk encryption keys.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. QR CODE */}
      {activeTab === 'qr' && (
        <div className="max-w-md mx-auto pixel-card bg-deck-dark p-6 space-y-4 border border-deck-border font-mono text-xs text-center">
          <div>
            <label className="text-arcade-muted block mb-1">Enter URL or Message</label>
            <input
              type="text"
              value={qrText}
              onChange={(e) => setQrText(e.target.value)}
              className="w-full bg-deck-bg border border-deck-border p-2"
            />
          </div>

          {qrDataUrl && (
            <div className="p-3 bg-white border-4 border-black inline-block mx-auto shadow-pixel">
              <img src={qrDataUrl} alt="QR Code" className="w-48 h-48 mx-auto" />
            </div>
          )}

          <a
            href={qrDataUrl}
            download="omnideck_qr.png"
            className="btn-pixel btn-pixel-emerald px-4 py-2 font-pixel text-[9px] inline-flex items-center gap-2"
          >
            SAVE QR IMAGE
          </a>
        </div>
      )}

      {/* 4. DICTIONARY */}
      {activeTab === 'dictionary' && (
        <div className="max-w-xl mx-auto pixel-card bg-deck-dark p-6 space-y-4 border border-deck-border font-mono text-xs">
          <form onSubmit={lookupWord} className="flex gap-2">
            <input
              type="text"
              value={dictQuery}
              onChange={(e) => setDictQuery(e.target.value)}
              placeholder="Search English word definition..."
              className="flex-1 bg-deck-bg border border-deck-border p-2"
            />
            <button
              type="submit"
              disabled={dictLoading}
              className="btn-pixel btn-pixel-emerald px-4 font-pixel text-[9px]"
            >
              LOOKUP
            </button>
          </form>

          {dictResult && (
            <div className="p-4 bg-deck-bg border border-deck-border space-y-3">
              {dictResult.error ? (
                <div className="text-arcade-coral">{dictResult.error}</div>
              ) : (
                <>
                  <div className="flex items-center justify-between border-b border-deck-border pb-2">
                    <div>
                      <h3 className="font-pixel text-base text-arcade-cyan">{dictResult.word}</h3>
                      <span className="text-arcade-muted">{dictResult.phonetic}</span>
                    </div>
                  </div>

                  {dictResult.meanings?.slice(0, 2).map((meaning, i) => (
                    <div key={i} className="space-y-1">
                      <span className="font-pixel text-[8px] bg-deck-surface border border-deck-border px-1.5 py-0.5 text-arcade-amber">
                        {meaning.partOfSpeech.toUpperCase()}
                      </span>
                      <p className="text-xs mt-1">
                        {meaning.definitions?.[0]?.definition}
                      </p>
                      {meaning.definitions?.[0]?.example && (
                        <p className="text-arcade-muted italic text-[11px]">
                          "{meaning.definitions[0].example}"
                        </p>
                      )}
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* 5. QUICK NOTES */}
      {activeTab === 'notes' && (
        <div className="pixel-card bg-deck-dark p-4 space-y-3 border border-deck-border font-mono text-xs">
          <div className="flex items-center justify-between border-b border-deck-border pb-2">
            <span className="font-pixel text-[10px] text-arcade-emerald uppercase">
              LOCAL AUTOSAVE SCRATCHPAD
            </span>
            <span className="text-arcade-muted text-[10px]">
              {notes.split(/\s+/).filter(Boolean).length} Words • {notes.length} Chars
            </span>
          </div>

          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={12}
            className="w-full bg-deck-bg border border-deck-border p-3 font-mono text-xs focus:outline-none focus:border-arcade-emerald"
          />
        </div>
      )}

      {/* 6. TO-DO BOARD */}
      {activeTab === 'todo' && (
        <div className="max-w-xl mx-auto pixel-card bg-deck-dark p-6 space-y-4 border border-deck-border font-mono text-xs">
          <form onSubmit={addTodo} className="flex gap-2">
            <input
              type="text"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              placeholder="Add actionable mission..."
              className="flex-1 bg-deck-bg border border-deck-border p-2"
            />
            <button
              type="submit"
              className="btn-pixel btn-pixel-emerald px-4 font-pixel text-[9px]"
            >
              ADD
            </button>
          </form>

          <div className="space-y-2">
            {todos.map(t => (
              <div
                key={t.id}
                onClick={() => {
                  setTodos(todos.map(td => td.id === t.id ? { ...td, done: !td.done } : td));
                  playClick();
                }}
                className={`p-2.5 bg-deck-bg border border-deck-border flex items-center justify-between cursor-pointer ${
                  t.done ? 'opacity-60 line-through text-arcade-muted' : ''
                }`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={t.done}
                    onChange={() => {}}
                    className="rounded-none accent-arcade-emerald"
                  />
                  <span>{t.text}</span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setTodos(todos.filter(td => td.id !== t.id));
                    playClick();
                  }}
                  className="text-arcade-coral hover:text-red-400 p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. SHOPPING LIST */}
      {activeTab === 'shopping' && (
        <div className="max-w-xl mx-auto pixel-card bg-deck-dark p-6 space-y-4 border border-deck-border font-mono text-xs">
          <form onSubmit={addShopItem} className="flex gap-2">
            <input
              type="text"
              value={newShopItem}
              onChange={(e) => setNewShopItem(e.target.value)}
              placeholder="Item name"
              className="flex-1 bg-deck-bg border border-deck-border p-2"
            />
            <input
              type="number"
              value={newShopPrice}
              onChange={(e) => setNewShopPrice(e.target.value)}
              placeholder="Price ($)"
              className="w-24 bg-deck-bg border border-deck-border p-2"
            />
            <button
              type="submit"
              className="btn-pixel btn-pixel-amber px-4 font-pixel text-[9px]"
            >
              ADD
            </button>
          </form>

          <div className="space-y-2">
            {shoppingItems.map(item => (
              <div
                key={item.id}
                onClick={() => {
                  setShoppingItems(shoppingItems.map(i => i.id === item.id ? { ...i, bought: !i.bought } : i));
                  playClick();
                }}
                className={`p-2.5 bg-deck-bg border border-deck-border flex items-center justify-between cursor-pointer ${
                  item.bought ? 'opacity-50 line-through text-arcade-muted' : ''
                }`}
              >
                <span>{item.item}</span>
                <span className="font-pixel text-arcade-emerald">${item.price.toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-deck-border pt-3 flex justify-between font-bold">
            <span>TOTAL ESTIMATE:</span>
            <span className="text-arcade-amber font-pixel text-sm">${shopTotal.toFixed(2)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
