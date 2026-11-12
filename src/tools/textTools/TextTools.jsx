import React, { useState } from 'react';
import {
  Type, Lock, Key, Copy, Check, Volume2,
  Sparkles, RefreshCw, FileText, Binary, Eye, Upload
} from 'lucide-react';
import CryptoJS from 'crypto-js';
import * as diff from 'diff';
import { playClick, playBeep, playCoin } from '../../audio/soundEffects';

export default function TextTools() {
  const [activeTab, setActiveTab] = useState('crypto');
  // 'crypto' | 'markdown' | 'base64file' | 'counter' | 'morse' | 'binary' | 'tts' | 'diff'

  const [copied, setCopied] = useState(false);
  const copyText = (txt) => {
    navigator.clipboard.writeText(txt);
    setCopied(true);
    playClick();
    setTimeout(() => setCopied(false), 1500);
  };

  // 1. CRYPTO ENCRYPTION (AES-256)
  const [plainText, setPlainText] = useState('Confidential cryptographic payload - Omni-Deck Security Module');
  const [secretKey, setSecretKey] = useState('CYBER_SECRET_99');
  const [cipherText, setCipherText] = useState('');
  const [decryptedText, setDecryptedText] = useState('');

  const handleEncrypt = () => {
    playClick();
    const encrypted = CryptoJS.AES.encrypt(plainText, secretKey).toString();
    setCipherText(encrypted);
    playCoin();
  };

  const handleDecrypt = () => {
    playClick();
    try {
      const bytes = CryptoJS.AES.decrypt(cipherText, secretKey);
      const dec = bytes.toString(CryptoJS.enc.Utf8);
      setDecryptedText(dec || 'Decryption failed: Incorrect key');
      playCoin();
    } catch (e) {
      setDecryptedText('Decryption Error');
    }
  };

  // 2. MARKDOWN LIVE PREVIEWER
  const [mdInput, setMdInput] = useState(`# Omni-Deck Markdown Suite
## High-Density Documentation
This is a **bold** statement, and this is *italic*.

- [x] Universal Downloader
- [x] SHTTPS Server Host
- [x] Image Studio (T8RIN)
- [x] PaperKnife PDF Suite

\`\`\`javascript
const deck = "Tactile Pixel Interface";
console.log(deck);
\`\`\`
> "Simplicity is prerequisite for reliability."
`);

  // Basic client markdown parser for preview
  const renderMarkdown = (src) => {
    return src
      .replace(/^# (.*$)/gim, '<h1 class="font-pixel text-base text-arcade-emerald border-b border-deck-border pb-1 my-2">$1</h1>')
      .replace(/^## (.*$)/gim, '<h2 class="font-pixel text-sm text-arcade-cyan my-2">$1</h2>')
      .replace(/^### (.*$)/gim, '<h3 class="font-pixel text-xs text-arcade-amber my-1">$1</h3>')
      .replace(/\*\*(.*)\*\*/gim, '<strong class="text-arcade-amber font-bold">$1</strong>')
      .replace(/\*(.*)\*/gim, '<em class="text-arcade-cyan italic">$1</em>')
      .replace(/`([^`]+)`/gim, '<code class="bg-deck-bg px-1 py-0.5 border border-deck-border text-arcade-coral font-mono text-[11px]">$1</code>')
      .replace(/^\> (.*$)/gim, '<blockquote class="border-l-4 border-arcade-emerald pl-3 my-2 text-arcade-muted italic">$1</blockquote>')
      .replace(/^- \[x\] (.*$)/gim, '<div class="flex items-center gap-1.5 text-arcade-emerald my-1">☑ <span>$1</span></div>')
      .replace(/^- \[ \] (.*$)/gim, '<div class="flex items-center gap-1.5 text-arcade-muted my-1">☐ <span>$1</span></div>')
      .replace(/^- (.*$)/gim, '<li class="ml-4 list-disc text-xs my-0.5">$1</li>')
      .replace(/\n$/gim, '<br />');
  };

  // 3. BASE64 FILE & IMAGE ENCODER
  const [b64FileResult, setB64FileResult] = useState('');
  const [b64FileName, setB64FileName] = useState('');
  const [b64IsImage, setB64IsImage] = useState(false);

  const handleFileUploadB64 = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setB64FileName(file.name);
    setB64IsImage(file.type.startsWith('image/'));
    const reader = new FileReader();
    reader.onload = (event) => {
      setB64FileResult(event.target.result);
      playCoin();
    };
    reader.readAsDataURL(file);
  };

  // 4. TEXT COUNTER (Generic clean sample)
  const [countText, setCountText] = useState('Omni-Deck is a high-density, pixel-crafted cyber utility suite engineered for peak efficiency and offline resilience.');
  const charCount = countText.length;
  const wordCount = countText.trim() ? countText.trim().split(/\s+/).length : 0;
  const lineCount = countText ? countText.split('\n').length : 0;
  const readingTime = (wordCount / 200).toFixed(1);

  // 5. MORSE CODE
  const [morseInput, setMorseInput] = useState('SOS HELP');
  const MORSE_MAP = {
    'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.',
    'G': '--.', 'H': '....', 'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..',
    'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.',
    'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
    'Y': '-.--', 'Z': '--..', '1': '.----', '2': '..---', '3': '...--',
    '4': '....-', '5': '.....', '6': '-....', '7': '--...', '8': '---..',
    '9': '----.', '0': '-----', ' ': '/'
  };
  const morseCode = morseInput.toUpperCase().split('').map(c => MORSE_MAP[c] || c).join(' ');

  const playMorseAudio = () => {
    let delay = 0;
    morseCode.split('').forEach(char => {
      if (char === '.') {
        setTimeout(() => playBeep(700, 0.08), delay);
        delay += 140;
      } else if (char === '-') {
        setTimeout(() => playBeep(700, 0.22), delay);
        delay += 260;
      } else {
        delay += 100;
      }
    });
  };

  // 6. TEXT TO BINARY / HEX / BASE64
  const [codecInput, setCodecInput] = useState('Cyber Deck');
  const binaryOutput = codecInput.split('').map(c => c.charCodeAt(0).toString(2).padStart(8, '0')).join(' ');
  const hexOutput = codecInput.split('').map(c => c.charCodeAt(0).toString(16).padStart(2, '0')).join(' ');
  const base64Output = btoa(codecInput);

  // 7. TEXT TO SPEECH (Generic prompt)
  const [ttsText, setTtsText] = useState('System initialized. All 130+ cyber deck utility modules are online and verified.');
  const speakText = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(ttsText);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
      playClick();
    }
  };

  // 8. DIFF CHECKER (Generic clean code)
  const [diffOriginal, setDiffOriginal] = useState('const user = "Guest";\nconsole.log(user);');
  const [diffModified, setDiffModified] = useState('const user = "Admin";\nconsole.log("Welcome", user);');
  const diffResult = diff.diffLines(diffOriginal, diffModified);

  return (
    <div className="space-y-6">
      {/* Subtool Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar border-b-2 border-deck-border pb-3">
        {[
          { id: 'crypto', label: 'AES-256 CRYPTO', icon: Lock },
          { id: 'markdown', label: 'MARKDOWN EDITOR', icon: Eye },
          { id: 'base64file', label: 'FILE TO BASE64', icon: Binary },
          { id: 'counter', label: 'TEXT COUNTER', icon: Type },
          { id: 'morse', label: 'MORSE CODE', icon: Sparkles },
          { id: 'binary', label: 'BINARY & HEX', icon: Binary },
          { id: 'tts', label: 'TEXT TO SPEECH', icon: Volume2 },
          { id: 'diff', label: 'TEXT DIFF CHECKER', icon: FileText },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => { playClick(); setActiveTab(tab.id); }}
              className={`btn-pixel px-3 py-1.5 font-pixel text-[9px] flex items-center gap-2 shrink-0 ${isActive ? 'btn-pixel-violet' : 'btn-pixel-surface'
                }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* 1. CRYPTO */}
      {activeTab === 'crypto' && (
        <div className="max-w-2xl mx-auto pixel-card bg-deck-dark p-6 space-y-4 border border-deck-border font-mono text-xs">
          <span className="font-pixel text-[10px] text-arcade-violet uppercase">MILITARY-GRADE AES-256 CRYPTOGRAPHIC SHIELD</span>

          <div>
            <label className="text-arcade-muted block mb-1">Secret Passphrase / Key</label>
            <input
              type="text"
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
              className="w-full bg-deck-bg border border-deck-border p-2 text-arcade-amber font-bold"
            />
          </div>

          <div>
            <label className="text-arcade-muted block mb-1">Plaintext Message</label>
            <textarea
              value={plainText}
              onChange={(e) => setPlainText(e.target.value)}
              rows={3}
              className="w-full bg-deck-bg border border-deck-border p-2"
            />
          </div>

          <button
            onClick={handleEncrypt}
            className="btn-pixel btn-pixel-amber w-full py-2.5 font-pixel text-xs"
          >
            ENCRYPT TO CIPHERTEXT
          </button>

          {cipherText && (
            <div className="p-3 bg-deck-bg border border-arcade-violet space-y-2">
              <div className="flex justify-between items-center text-arcade-violet">
                <span className="font-pixel text-[9px]">ENCRYPTED CIPHER OUTPUT</span>
                <button onClick={() => copyText(cipherText)} className="hover:underline flex items-center gap-1 text-[10px]">
                  {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />} COPY
                </button>
              </div>
              <div className="break-all font-mono text-[11px] select-all bg-deck-dark p-2 border border-deck-border">
                {cipherText}
              </div>
            </div>
          )}

          <div className="pt-2">
            <button
              onClick={handleDecrypt}
              className="btn-pixel btn-pixel-surface w-full py-2.5 font-pixel text-xs text-arcade-emerald hover:border-arcade-emerald"
            >
              DECRYPT CIPHERTEXT
            </button>
          </div>

          {decryptedText && (
            <div className="p-3 bg-deck-bg border border-arcade-emerald text-arcade-emerald font-bold">
              DECRYPTED: {decryptedText}
            </div>
          )}
        </div>
      )}

      {/* 2. MARKDOWN LIVE PREVIEWER */}
      {activeTab === 'markdown' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
          <div className="pixel-card bg-deck-dark p-4 space-y-2 border border-deck-border">
            <div className="flex justify-between items-center border-b border-deck-border pb-2">
              <span className="font-pixel text-[10px] text-arcade-cyan">MARKDOWN EDITOR</span>
              <button onClick={() => copyText(mdInput)} className="text-[10px] text-arcade-emerald hover:underline flex items-center gap-1">
                <Copy className="w-3 h-3" /> COPY MD
              </button>
            </div>
            <textarea
              value={mdInput}
              onChange={(e) => setMdInput(e.target.value)}
              rows={14}
              className="w-full bg-deck-bg border border-deck-border p-3 font-mono text-xs focus:outline-none"
            />
          </div>

          <div className="pixel-card bg-deck-dark p-4 space-y-2 border border-deck-border">
            <div className="flex justify-between items-center border-b border-deck-border pb-2">
              <span className="font-pixel text-[10px] text-arcade-emerald">LIVE HTML RENDER</span>
              <span className="text-arcade-muted text-[10px]">GITHUB STYLED</span>
            </div>
            <div
              className="bg-deck-bg border border-deck-border p-4 h-[300px] overflow-y-auto text-xs leading-relaxed"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(mdInput) }}
            />
          </div>
        </div>
      )}

      {/* 3. FILE TO BASE64 */}
      {activeTab === 'base64file' && (
        <div className="max-w-xl mx-auto pixel-card bg-deck-dark p-6 space-y-4 border border-deck-border font-mono text-xs">
          <span className="font-pixel text-xs text-arcade-amber">BASE64 FILE & IMAGE ENCODER</span>

          <label className="p-8 border-2 border-dashed border-deck-border hover:border-arcade-amber bg-deck-bg text-center cursor-pointer block space-y-2">
            <Upload className="w-8 h-8 mx-auto text-arcade-amber" />
            <div className="font-pixel text-xs">DROP FILE OR CLICK TO ENCODE</div>
            <p className="text-[11px] text-arcade-muted">Generates instant Base64 Data URI</p>
            <input type="file" onChange={handleFileUploadB64} className="hidden" />
          </label>

          {b64FileResult && (
            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-center">
                <span className="font-bold">{b64FileName} ({(b64FileResult.length / 1024).toFixed(1)} KB)</span>
                <button
                  onClick={() => copyText(b64FileResult)}
                  className="btn-pixel btn-pixel-amber px-3 py-1 font-pixel text-[8px] flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" /> COPY DATA URI
                </button>
              </div>

              {b64IsImage && (
                <div className="p-2 bg-deck-bg border border-deck-border text-center">
                  <img src={b64FileResult} alt="Preview" className="max-h-40 mx-auto object-contain border border-black shadow-sm" />
                </div>
              )}

              <textarea
                value={b64FileResult}
                readOnly
                rows={4}
                className="w-full bg-deck-bg border border-deck-border p-2 text-[10px] break-all select-all"
              />
            </div>
          )}
        </div>
      )}

      {/* 4. TEXT COUNTER */}
      {activeTab === 'counter' && (
        <div className="max-w-2xl mx-auto pixel-card bg-deck-dark p-6 space-y-4 border border-deck-border font-mono text-xs">
          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="p-2.5 bg-deck-bg border border-deck-border">
              <div className="text-arcade-muted text-[10px]">CHARACTERS</div>
              <div className="font-pixel text-lg">{charCount}</div>
            </div>
            <div className="p-2.5 bg-deck-bg border border-deck-border">
              <div className="text-arcade-muted text-[10px]">WORDS</div>
              <div className="font-pixel text-lg text-arcade-emerald">{wordCount}</div>
            </div>
            <div className="p-2.5 bg-deck-bg border border-deck-border">
              <div className="text-arcade-muted text-[10px]">LINES</div>
              <div className="font-pixel text-lg text-arcade-cyan">{lineCount}</div>
            </div>
            <div className="p-2.5 bg-deck-bg border border-deck-border">
              <div className="text-arcade-muted text-[10px]">READ TIME</div>
              <div className="font-pixel text-lg text-arcade-amber">{readingTime}m</div>
            </div>
          </div>

          <textarea
            value={countText}
            onChange={(e) => setCountText(e.target.value)}
            rows={8}
            placeholder="Type or paste text..."
            className="w-full bg-deck-bg border border-deck-border p-3 focus:outline-none"
          />
        </div>
      )}

      {/* 5. MORSE CODE */}
      {activeTab === 'morse' && (
        <div className="max-w-xl mx-auto pixel-card bg-deck-dark p-6 space-y-4 border border-deck-border font-mono text-xs">
          <div>
            <label className="text-arcade-muted block mb-1">Enter Text to Encode</label>
            <input
              type="text"
              value={morseInput}
              onChange={(e) => setMorseInput(e.target.value)}
              className="w-full bg-deck-bg border border-deck-border p-2 uppercase"
            />
          </div>

          <div className="p-4 bg-deck-bg border border-deck-border space-y-2">
            <span className="font-pixel text-[9px] text-arcade-amber">MORSE CODE TRANSMISSION</span>
            <div className="font-pixel text-xl text-arcade-emerald tracking-widest break-all py-2 text-glow-emerald">
              {morseCode}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={playMorseAudio}
              className="btn-pixel btn-pixel-emerald flex-1 py-2.5 font-pixel text-xs flex items-center justify-center gap-2"
            >
              <Volume2 className="w-4 h-4" /> PLAY AUDIO CHIRPS
            </button>
            <button
              onClick={() => copyText(morseCode)}
              className="btn-pixel btn-pixel-surface px-4 py-2.5 font-pixel text-xs"
            >
              COPY
            </button>
          </div>
        </div>
      )}

      {/* 6. BINARY & HEX */}
      {activeTab === 'binary' && (
        <div className="max-w-2xl mx-auto pixel-card bg-deck-dark p-6 space-y-4 border border-deck-border font-mono text-xs">
          <div>
            <label className="text-arcade-muted block mb-1">Input Text</label>
            <input
              type="text"
              value={codecInput}
              onChange={(e) => setCodecInput(e.target.value)}
              className="w-full bg-deck-bg border border-deck-border p-2"
            />
          </div>

          <div className="space-y-3">
            <div className="p-3 bg-deck-bg border border-deck-border space-y-1">
              <span className="font-pixel text-[9px] text-arcade-cyan">8-BIT BINARY</span>
              <div className="break-all text-arcade-emerald">{binaryOutput}</div>
            </div>

            <div className="p-3 bg-deck-bg border border-deck-border space-y-1">
              <span className="font-pixel text-[9px] text-arcade-amber">HEXADECIMAL</span>
              <div className="break-all">{hexOutput}</div>
            </div>

            <div className="p-3 bg-deck-bg border border-deck-border space-y-1">
              <span className="font-pixel text-[9px] text-arcade-coral">BASE64</span>
              <div className="break-all text-arcade-cyan">{base64Output}</div>
            </div>
          </div>
        </div>
      )}

      {/* 7. TEXT TO SPEECH */}
      {activeTab === 'tts' && (
        <div className="max-w-xl mx-auto pixel-card bg-deck-dark p-6 space-y-4 border border-deck-border font-mono text-xs">
          <textarea
            value={ttsText}
            onChange={(e) => setTtsText(e.target.value)}
            rows={4}
            className="w-full bg-deck-bg border border-deck-border p-3"
          />
          <button
            onClick={speakText}
            className="btn-pixel btn-pixel-cyan w-full py-3 font-pixel text-xs flex items-center justify-center gap-2"
          >
            <Volume2 className="w-4 h-4" />
            SYNTHESIZE SPEECH AUDIO
          </button>
        </div>
      )}

      {/* 8. DIFF CHECKER */}
      {activeTab === 'diff' && (
        <div className="pixel-card bg-deck-dark p-6 space-y-4 border border-deck-border font-mono text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-arcade-muted block mb-1">Original Text</label>
              <textarea
                value={diffOriginal}
                onChange={(e) => setDiffOriginal(e.target.value)}
                rows={6}
                className="w-full bg-deck-bg border border-deck-border p-2"
              />
            </div>
            <div>
              <label className="text-arcade-muted block mb-1">Modified Text</label>
              <textarea
                value={diffModified}
                onChange={(e) => setDiffModified(e.target.value)}
                rows={6}
                className="w-full bg-deck-bg border border-deck-border p-2"
              />
            </div>
          </div>

          <div className="p-4 bg-deck-bg border border-deck-border space-y-1">
            <span className="font-pixel text-[9px] text-arcade-emerald uppercase">LINE DIFF COMPARISON</span>
            <div className="divide-y divide-deck-border/40 font-mono text-xs">
              {diffResult.map((part, index) => (
                <div
                  key={index}
                  className={`p-1 ${part.added ? 'bg-emerald-950/20 text-arcade-emerald font-bold' :
                      part.removed ? 'bg-red-950/20 text-arcade-coral line-through' :
                        ''
                    }`}
                >
                  {part.value}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
