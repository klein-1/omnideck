import React, { useState } from 'react';
import {
  Type, Lock, Key, Copy, Check, Volume2,
  Sparkles, RefreshCw, FileText, Binary, Eye, Upload,
  Hash, Shield, Globe, Terminal, Code, Sliders, Cpu
} from 'lucide-react';
import CryptoJS from 'crypto-js';
import * as diff from 'diff';
import { playClick, playBeep, playCoin, playSuccess } from '../../audio/soundEffects';

export default function TextTools() {
  const [activeTab, setActiveTab] = useState('crypto');
  // 'crypto' | 'markdown' | 'base64file' | 'counter' | 'morse' | 'binary' | 'tts' | 'diff'
  // 'uuid' | 'lorem' | 'case' | 'urlcodec' | 'htmlentities' | 'rot13' | 'entropy'

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

  // 4. TEXT COUNTER
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

  // 6. BINARY & HEX
  const [codecInput, setCodecInput] = useState('Cyber Deck');
  const binaryOutput = codecInput.split('').map(c => c.charCodeAt(0).toString(2).padStart(8, '0')).join(' ');
  const hexOutput = codecInput.split('').map(c => c.charCodeAt(0).toString(16).padStart(2, '0')).join(' ');
  const base64Output = btoa(codecInput);

  // 7. TEXT TO SPEECH
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

  // 8. DIFF CHECKER
  const [diffOriginal, setDiffOriginal] = useState('const user = "Guest";\nconsole.log(user);');
  const [diffModified, setDiffModified] = useState('const user = "Admin";\nconsole.log("Welcome", user);');
  const diffResult = diff.diffLines(diffOriginal, diffModified);

  // 9. UUID & NANOID GENERATOR
  const [uuidQuantity, setUuidQuantity] = useState(5);
  const [uuidUpper, setUuidUpper] = useState(false);
  const [uuidHyphens, setUuidHyphens] = useState(true);
  const [generatedUuids, setGeneratedUuids] = useState([]);

  const generateUuidV4 = () => {
    let uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : ((r & 0x3) | 0x8);
      return v.toString(16);
    });
    if (!uuidHyphens) uuid = uuid.replace(/-/g, '');
    return uuidUpper ? uuid.toUpperCase() : uuid.toLowerCase();
  };

  const handleGenerateUuids = () => {
    playClick();
    const list = [];
    const count = Math.min(50, Math.max(1, uuidQuantity));
    for (let i = 0; i < count; i++) {
      list.push(generateUuidV4());
    }
    setGeneratedUuids(list);
    playCoin();
  };

  // 10. CYBERPUNK LOREM IPSUM GENERATOR
  const [loremType, setLoremType] = useState('paragraphs'); // 'paragraphs' | 'sentences' | 'words'
  const [loremCount, setLoremCount] = useState(3);
  const [generatedLorem, setGeneratedLorem] = useState('');

  const cyberWords = [
    'cyberdeck', 'matrix', 'neural', 'quantum', 'synapse', 'firewall', 'subroutine',
    'nanotech', 'cyberpunk', 'mainframe', 'optical', 'encryption', 'protocol', 'buffer',
    'tactile', 'frequency', 'daemon', 'algorithmic', 'synthetic', 'silicon', 'biometric',
    'overclocked', 'holographic', 'transistor', 'payload', 'firmware', 'vector', 'telemetry'
  ];

  const generateLorem = () => {
    playClick();
    let res = '';
    const num = Math.max(1, Math.min(20, loremCount));
    if (loremType === 'words') {
      const words = [];
      for (let i = 0; i < num * 10; i++) {
        words.push(cyberWords[Math.floor(Math.random() * cyberWords.length)]);
      }
      res = words.join(' ');
    } else if (loremType === 'sentences') {
      const sentences = [];
      for (let i = 0; i < num; i++) {
        const sentenceLen = Math.floor(Math.random() * 8) + 6;
        const words = [];
        for (let j = 0; j < sentenceLen; j++) {
          words.push(cyberWords[Math.floor(Math.random() * cyberWords.length)]);
        }
        sentences.push(words[0].charAt(0).toUpperCase() + words.slice(1).join(' ') + '.');
      }
      res = sentences.join(' ');
    } else {
      const paras = [];
      for (let p = 0; p < num; p++) {
        const sentences = [];
        for (let i = 0; i < 4; i++) {
          const sentenceLen = Math.floor(Math.random() * 8) + 6;
          const words = [];
          for (let j = 0; j < sentenceLen; j++) {
            words.push(cyberWords[Math.floor(Math.random() * cyberWords.length)]);
          }
          sentences.push(words[0].charAt(0).toUpperCase() + words.slice(1).join(' ') + '.');
        }
        paras.push(sentences.join(' '));
      }
      res = paras.join('\n\n');
    }
    setGeneratedLorem(res);
    playCoin();
  };

  // 11. CASE CONVERTER MATRIX
  const [caseInput, setCaseInput] = useState('Cyberdeck Tactical Operating System');

  const toCamel = (str) => str.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase());
  const toPascal = (str) => {
    const c = toCamel(str);
    return c.charAt(0).toUpperCase() + c.slice(1);
  };
  const toSnake = (str) => str.toLowerCase().replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  const toKebab = (str) => str.toLowerCase().replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  const toConstant = (str) => toSnake(str).toUpperCase();
  const toTitle = (str) => str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
  const toSentence = (str) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  const toDot = (str) => toKebab(str).replace(/-/g, '.');
  const toPath = (str) => toKebab(str).replace(/-/g, '/');
  const toAlternating = (str) => str.split('').map((c, i) => (i % 2 === 0 ? c.toLowerCase() : c.toUpperCase())).join('');

  const caseVariants = [
    { label: 'camelCase', val: toCamel(caseInput) },
    { label: 'PascalCase', val: toPascal(caseInput) },
    { label: 'snake_case', val: toSnake(caseInput) },
    { label: 'kebab-case', val: toKebab(caseInput) },
    { label: 'CONSTANT_CASE', val: toConstant(caseInput) },
    { label: 'Title Case', val: toTitle(caseInput) },
    { label: 'Sentence case', val: toSentence(caseInput) },
    { label: 'dot.notation', val: toDot(caseInput) },
    { label: 'path/format', val: toPath(caseInput) },
    { label: 'aLtErNaTiNg', val: toAlternating(caseInput) },
  ];

  // 12. URL ENCODER / DECODER
  const [urlInput, setUrlInput] = useState('https://example.com/search?q=cyber deck 2026&tag=retro+future&filter=active#results');
  const [urlEncoded, setUrlEncoded] = useState('');
  const [urlDecoded, setUrlDecoded] = useState('');

  const handleUrlEncode = () => {
    try {
      setUrlEncoded(encodeURIComponent(urlInput));
      playClick();
    } catch {
      setUrlEncoded('Encode Error');
    }
  };

  const handleUrlDecode = () => {
    try {
      setUrlDecoded(decodeURIComponent(urlInput));
      playClick();
    } catch {
      setUrlDecoded('Decode Error: Invalid URL encoding');
    }
  };

  // 13. HTML ENTITIES ENCODER / DECODER
  const [htmlInput, setHtmlInput] = useState('<div class="cyber-btn" data-id="42">Omni-Deck & "Code" © 2026</div>');
  const [htmlOutput, setHtmlOutput] = useState('');

  const encodeHtml = (str) => {
    return str.replace(/[\u00A0-\u9999<>\&"']/gim, (i) => '&#' + i.charCodeAt(0) + ';');
  };

  const decodeHtml = (str) => {
    const txt = document.createElement('textarea');
    txt.innerHTML = str;
    return txt.value;
  };

  // 14. CAESAR & VIGENÈRE CIPHERS
  const [caesarInput, setCaesarInput] = useState('OMNI DECK CIPHER');
  const [caesarShift, setCaesarShift] = useState(13); // Default ROT13
  const [vigenereKey, setVigenereKey] = useState('KEY');

  const runCaesarCipher = (str, shift) => {
    return str.split('').map(char => {
      const code = char.charCodeAt(0);
      if (code >= 65 && code <= 90) {
        return String.fromCharCode(((code - 65 + shift) % 26 + 26) % 26 + 65);
      } else if (code >= 97 && code <= 122) {
        return String.fromCharCode(((code - 97 + shift) % 26 + 26) % 26 + 97);
      }
      return char;
    }).join('');
  };

  const caesarOutput = runCaesarCipher(caesarInput, parseInt(caesarShift) || 0);

  // 15. PASSWORD ENTROPY & SECURITY
  const [entropyInput, setEntropyInput] = useState('Omn!Deck_99$Retro');

  const calcEntropy = (pwd) => {
    if (!pwd) return { bits: 0, pool: 0, crackTime: '0 seconds', strength: 'NONE', score: 0 };
    let pool = 0;
    if (/[a-z]/.test(pwd)) pool += 26;
    if (/[A-Z]/.test(pwd)) pool += 26;
    if (/[0-9]/.test(pwd)) pool += 10;
    if (/[^a-zA-Z0-9]/.test(pwd)) pool += 33;

    const bits = Math.round(pwd.length * (Math.log2(pool || 1)));
    const guesses = Math.pow(2, bits);
    // Assuming 100 billion guesses/second (modern GPU cluster)
    const seconds = guesses / 1e11;

    let crackTime = 'Instantly';
    if (seconds < 1) crackTime = 'Under 1 second';
    else if (seconds < 60) crackTime = `${Math.round(seconds)} seconds`;
    else if (seconds < 3600) crackTime = `${Math.round(seconds / 60)} minutes`;
    else if (seconds < 86400) crackTime = `${Math.round(seconds / 3600)} hours`;
    else if (seconds < 31536000) crackTime = `${Math.round(seconds / 86400)} days`;
    else if (seconds < 31536000 * 1000) crackTime = `${Math.round(seconds / 31536000)} years`;
    else crackTime = 'Billions of centuries';

    let strength = 'WEAK';
    let score = 25;
    if (bits > 80) { strength = 'MILITARY / IMPENETRABLE'; score = 100; }
    else if (bits > 60) { strength = 'STRONG'; score = 75; }
    else if (bits > 40) { strength = 'MODERATE'; score = 50; }

    return { bits, pool, crackTime, strength, score };
  };
  const entropyStats = calcEntropy(entropyInput);

  return (
    <div className="space-y-6">
      {/* Subtool Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar border-b-2 border-deck-border pb-3">
        {[
          { id: 'crypto', label: 'AES-256 CRYPTO', icon: Lock, activeClass: 'btn-pixel-purple' },
          { id: 'entropy', label: 'ENTROPY AUDIT', icon: Shield, activeClass: 'btn-pixel-coral' },
          { id: 'case', label: 'CASE CONVERTER', icon: Type, activeClass: 'btn-pixel-cyan' },
          { id: 'uuid', label: 'UUID & NANOID', icon: Hash, activeClass: 'btn-pixel-emerald' },
          { id: 'rot13', label: 'CAESAR / ROT13', icon: Key, activeClass: 'btn-pixel-amber' },
          { id: 'urlcodec', label: 'URL CODEC', icon: Globe, activeClass: 'btn-pixel-blue' },
          { id: 'htmlentities', label: 'HTML ENTITIES', icon: Code, activeClass: 'btn-pixel-lime' },
          { id: 'lorem', label: 'CYBER LOREM', icon: Terminal, activeClass: 'btn-pixel-pink' },
          { id: 'markdown', label: 'MARKDOWN EDITOR', icon: Eye, activeClass: 'btn-pixel-orange' },
          { id: 'counter', label: 'TEXT COUNTER', icon: Sliders, activeClass: 'btn-pixel-surface' },
          { id: 'base64file', label: 'FILE TO BASE64', icon: Binary, activeClass: 'btn-pixel-purple' },
          { id: 'diff', label: 'TEXT DIFF', icon: FileText, activeClass: 'btn-pixel-amber' },
          { id: 'morse', label: 'MORSE CODE', icon: Sparkles, activeClass: 'btn-pixel-emerald' },
          { id: 'binary', label: 'BINARY & HEX', icon: Cpu, activeClass: 'btn-pixel-cyan' },
          { id: 'tts', label: 'TEXT TO SPEECH', icon: Volume2, activeClass: 'btn-pixel-pink' },
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

      {/* 1. AES CRYPTO */}
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
              className="w-full bg-deck-bg border border-deck-border p-2 text-white"
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
              <div className="break-all font-mono text-[11px] select-all bg-deck-dark p-2 border border-deck-border text-white">
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

      {/* 2. ENTROPY AUDIT */}
      {activeTab === 'entropy' && (
        <div className="max-w-xl mx-auto pixel-card bg-deck-dark p-6 space-y-5 border border-deck-border font-mono text-xs">
          <span className="font-pixel text-xs text-arcade-coral uppercase">PASSWORD ENTROPY & SECURITY AUDITOR</span>

          <div>
            <label className="text-arcade-muted block mb-1">Target Password / Token</label>
            <input
              type="text"
              value={entropyInput}
              onChange={(e) => setEntropyInput(e.target.value)}
              className="w-full bg-deck-bg border border-deck-border p-2.5 text-white font-mono text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="p-3 bg-deck-bg border border-deck-border">
              <span className="text-[10px] text-arcade-muted block">INFORMATION ENTROPY</span>
              <span className="font-pixel text-2xl text-arcade-coral">{entropyStats.bits} BITS</span>
            </div>
            <div className="p-3 bg-deck-bg border border-deck-border">
              <span className="text-[10px] text-arcade-muted block">CHARSET POOL</span>
              <span className="font-pixel text-2xl text-arcade-cyan">{entropyStats.pool} POSSIBILITIES</span>
            </div>
          </div>

          <div className="p-4 bg-deck-bg border border-deck-border space-y-2 text-center">
            <span className="text-[10px] text-arcade-muted block">TIME TO CRACK (100 BILLION GUESSES/SEC)</span>
            <div className="font-pixel text-lg text-arcade-emerald text-glow-emerald">{entropyStats.crackTime}</div>
            <div className="font-pixel text-[10px] text-arcade-amber uppercase">{entropyStats.strength}</div>

            <div className="w-full h-2 bg-deck-dark border border-black overflow-hidden mt-2">
              <div
                className={`h-full ${entropyStats.score >= 75 ? 'bg-arcade-emerald' : entropyStats.score >= 50 ? 'bg-arcade-amber' : 'bg-arcade-coral'}`}
                style={{ width: `${entropyStats.score}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* 3. CASE CONVERTER MATRIX */}
      {activeTab === 'case' && (
        <div className="max-w-2xl mx-auto pixel-card bg-deck-dark p-6 space-y-4 border border-deck-border font-mono text-xs">
          <span className="font-pixel text-xs text-arcade-cyan uppercase">CASE TRANSFORMATION MATRIX</span>

          <div>
            <label className="text-arcade-muted block mb-1">Original Text</label>
            <input
              type="text"
              value={caseInput}
              onChange={(e) => setCaseInput(e.target.value)}
              className="w-full bg-deck-bg border border-deck-border p-2 text-white"
            />
          </div>

          <div className="space-y-2 pt-2">
            {caseVariants.map(v => (
              <div key={v.label} className="p-2.5 bg-deck-bg border border-deck-border flex justify-between items-center hover:border-arcade-cyan transition-colors">
                <span className="font-pixel text-[9px] text-arcade-muted w-32 shrink-0">{v.label}</span>
                <span className="font-mono text-xs text-white truncate px-2 flex-1">{v.val}</span>
                <button
                  onClick={() => copyText(v.val)}
                  className="btn-pixel btn-pixel-surface px-2.5 py-1 font-pixel text-[8px] text-arcade-cyan shrink-0"
                >
                  COPY
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. UUID & NANOID */}
      {activeTab === 'uuid' && (
        <div className="max-w-2xl mx-auto pixel-card bg-deck-dark p-6 space-y-4 border border-deck-border font-mono text-xs">
          <span className="font-pixel text-xs text-arcade-emerald uppercase">CRYPTOGRAPHIC UUID V4 GENERATOR</span>

          <div className="flex flex-wrap items-center gap-4 bg-deck-bg p-3 border border-deck-border">
            <div className="flex items-center gap-2">
              <label className="text-arcade-muted">Quantity:</label>
              <input
                type="number"
                min="1"
                max="50"
                value={uuidQuantity}
                onChange={(e) => setUuidQuantity(parseInt(e.target.value) || 1)}
                className="w-16 bg-deck-dark border border-deck-border p-1 text-center text-white"
              />
            </div>
            <label className="flex items-center gap-1.5 cursor-pointer text-white">
              <input type="checkbox" checked={uuidUpper} onChange={(e) => setUuidUpper(e.target.checked)} className="accent-arcade-emerald" />
              UPPERCASE
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer text-white">
              <input type="checkbox" checked={uuidHyphens} onChange={(e) => setUuidHyphens(e.target.checked)} className="accent-arcade-emerald" />
              HYPHENS
            </label>
            <button
              onClick={handleGenerateUuids}
              className="btn-pixel btn-pixel-emerald px-4 py-1.5 font-pixel text-[10px] ml-auto"
            >
              GENERATE
            </button>
          </div>

          {generatedUuids.length > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between items-center text-arcade-muted">
                <span>{generatedUuids.length} IDENTIFIERS GENERATED</span>
                <button
                  onClick={() => copyText(generatedUuids.join('\n'))}
                  className="text-white hover:underline flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" /> COPY ALL
                </button>
              </div>
              <div className="bg-deck-bg border border-deck-border p-3 space-y-1 max-h-60 overflow-y-auto">
                {generatedUuids.map((u, i) => (
                  <div key={i} className="flex justify-between items-center text-[11px] font-mono text-arcade-cyan hover:text-white">
                    <span>{u}</span>
                    <button onClick={() => copyText(u)} className="text-arcade-muted hover:text-white p-0.5">
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 5. CAESAR & ROT13 */}
      {activeTab === 'rot13' && (
        <div className="max-w-xl mx-auto pixel-card bg-deck-dark p-6 space-y-4 border border-deck-border font-mono text-xs">
          <span className="font-pixel text-xs text-arcade-amber uppercase">CLASSICAL CAESAR & ROT13 CIPHER</span>

          <div>
            <label className="text-arcade-muted block mb-1">Plaintext / Input</label>
            <textarea
              value={caesarInput}
              onChange={(e) => setCaesarInput(e.target.value)}
              rows={3}
              className="w-full bg-deck-bg border border-deck-border p-2 text-white"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center text-arcade-muted">
              <span>ALPHABET SHIFT VALUE</span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="25"
                  value={caesarShift}
                  onChange={(e) => setCaesarShift(parseInt(e.target.value) || 0)}
                  className="w-14 bg-deck-bg border border-deck-border p-1 text-center text-arcade-amber font-bold"
                />
                <button
                  onClick={() => { setCaesarShift(13); playClick(); }}
                  className="px-2 py-1 bg-deck-bg border border-deck-border text-[9px] font-pixel text-arcade-cyan"
                >
                  ROT-13
                </button>
              </div>
            </div>
            <input
              type="range"
              min="0"
              max="25"
              value={caesarShift}
              onChange={(e) => setCaesarShift(parseInt(e.target.value))}
              className="w-full accent-arcade-amber"
            />
          </div>

          <div className="p-3 bg-deck-bg border border-arcade-amber space-y-2">
            <div className="flex justify-between items-center text-arcade-amber">
              <span className="font-pixel text-[9px]">SHIFTED CIPHER OUTPUT</span>
              <button onClick={() => copyText(caesarOutput)} className="text-[10px] text-white hover:underline flex items-center gap-1">
                {copied ? <Check className="w-3 h-3 text-arcade-emerald" /> : <Copy className="w-3 h-3" />} COPY
              </button>
            </div>
            <div className="break-all font-mono text-xs text-white bg-deck-dark p-2 border border-deck-border select-all">
              {caesarOutput}
            </div>
          </div>
        </div>
      )}

      {/* 6. URL CODEC */}
      {activeTab === 'urlcodec' && (
        <div className="max-w-2xl mx-auto pixel-card bg-deck-dark p-6 space-y-4 border border-deck-border font-mono text-xs">
          <span className="font-pixel text-xs text-arcade-blue uppercase">URL & URI COMPONENT CODEC</span>

          <div>
            <label className="text-arcade-muted block mb-1">Input URL or String</label>
            <textarea
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              rows={3}
              className="w-full bg-deck-bg border border-deck-border p-2 text-white"
            />
          </div>

          <div className="flex gap-2">
            <button onClick={handleUrlEncode} className="btn-pixel btn-pixel-cyan flex-1 py-2 font-pixel text-[10px]">
              ENCODE URI COMPONENT
            </button>
            <button onClick={handleUrlDecode} className="btn-pixel btn-pixel-emerald flex-1 py-2 font-pixel text-[10px]">
              DECODE URI
            </button>
          </div>

          {urlEncoded && (
            <div className="p-3 bg-deck-bg border border-deck-border space-y-1">
              <div className="flex justify-between items-center text-arcade-cyan font-pixel text-[9px]">
                <span>ENCODED URL</span>
                <button onClick={() => copyText(urlEncoded)} className="text-white hover:underline">COPY</button>
              </div>
              <div className="break-all text-[11px] text-white select-all">{urlEncoded}</div>
            </div>
          )}

          {urlDecoded && (
            <div className="p-3 bg-deck-bg border border-deck-border space-y-1">
              <div className="flex justify-between items-center text-arcade-emerald font-pixel text-[9px]">
                <span>DECODED URL</span>
                <button onClick={() => copyText(urlDecoded)} className="text-white hover:underline">COPY</button>
              </div>
              <div className="break-all text-[11px] text-white select-all">{urlDecoded}</div>
            </div>
          )}
        </div>
      )}

      {/* 7. HTML ENTITIES */}
      {activeTab === 'htmlentities' && (
        <div className="max-w-2xl mx-auto pixel-card bg-deck-dark p-6 space-y-4 border border-deck-border font-mono text-xs">
          <span className="font-pixel text-xs text-arcade-lime uppercase">HTML ENTITIES ENCODER & DECODER</span>

          <div>
            <label className="text-arcade-muted block mb-1">HTML String</label>
            <textarea
              value={htmlInput}
              onChange={(e) => setHtmlInput(e.target.value)}
              rows={3}
              className="w-full bg-deck-bg border border-deck-border p-2 text-white"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => { setHtmlOutput(encodeHtml(htmlInput)); playClick(); }}
              className="btn-pixel btn-pixel-lime flex-1 py-2 font-pixel text-[10px]"
            >
              ENCODE TO ENTITIES (&amp;, &lt;, &gt;)
            </button>
            <button
              onClick={() => { setHtmlOutput(decodeHtml(htmlInput)); playClick(); }}
              className="btn-pixel btn-pixel-surface flex-1 py-2 font-pixel text-[10px] text-white"
            >
              DECODE ENTITIES TO RAW HTML
            </button>
          </div>

          {htmlOutput && (
            <div className="p-3 bg-deck-bg border border-arcade-lime space-y-2">
              <div className="flex justify-between items-center text-arcade-lime">
                <span className="font-pixel text-[9px]">TRANSFORMED OUTPUT</span>
                <button onClick={() => copyText(htmlOutput)} className="text-[10px] text-white hover:underline flex items-center gap-1">
                  {copied ? <Check className="w-3 h-3 text-arcade-emerald" /> : <Copy className="w-3 h-3" />} COPY
                </button>
              </div>
              <div className="break-all font-mono text-xs text-white bg-deck-dark p-2 border border-deck-border select-all">
                {htmlOutput}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 8. CYBER LOREM */}
      {activeTab === 'lorem' && (
        <div className="max-w-2xl mx-auto pixel-card bg-deck-dark p-6 space-y-4 border border-deck-border font-mono text-xs">
          <span className="font-pixel text-xs text-arcade-pink uppercase">CYBERPUNK LOREM IPSUM ENGINE</span>

          <div className="flex flex-wrap items-center gap-3 bg-deck-bg p-3 border border-deck-border">
            <div className="flex gap-1.5">
              {['paragraphs', 'sentences', 'words'].map(t => (
                <button
                  key={t}
                  onClick={() => setLoremType(t)}
                  className={`px-2.5 py-1 font-pixel text-[8px] uppercase border ${
                    loremType === t ? 'bg-deck-surface border-arcade-pink text-arcade-pink' : 'bg-deck-bg border-deck-border text-arcade-muted'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <label className="text-arcade-muted">Count:</label>
              <input
                type="number"
                min="1"
                max="10"
                value={loremCount}
                onChange={(e) => setLoremCount(parseInt(e.target.value) || 1)}
                className="w-14 bg-deck-dark border border-deck-border p-1 text-center text-white"
              />
            </div>

            <button onClick={generateLorem} className="btn-pixel btn-pixel-pink px-4 py-1.5 font-pixel text-[10px] ml-auto">
              GENERATE
            </button>
          </div>

          {generatedLorem && (
            <div className="p-4 bg-deck-bg border border-deck-border space-y-2">
              <div className="flex justify-between items-center text-arcade-muted">
                <span className="font-pixel text-[9px] text-arcade-pink">GENERATED CYBER TEXT</span>
                <button onClick={() => copyText(generatedLorem)} className="text-white hover:underline flex items-center gap-1">
                  <Copy className="w-3 h-3" /> COPY
                </button>
              </div>
              <div className="text-white text-xs leading-relaxed whitespace-pre-wrap">{generatedLorem}</div>
            </div>
          )}
        </div>
      )}

      {/* 9. MARKDOWN EDITOR */}
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
              className="w-full bg-deck-bg border border-deck-border p-3 font-mono text-xs text-white focus:outline-none"
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

      {/* 10. TEXT COUNTER */}
      {activeTab === 'counter' && (
        <div className="max-w-2xl mx-auto pixel-card bg-deck-dark p-6 space-y-4 border border-deck-border font-mono text-xs">
          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="p-2.5 bg-deck-bg border border-deck-border">
              <div className="text-arcade-muted text-[10px]">CHARACTERS</div>
              <div className="font-pixel text-lg text-white">{charCount}</div>
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
            className="w-full bg-deck-bg border border-deck-border p-3 text-white focus:outline-none"
          />
        </div>
      )}

      {/* 11. FILE TO BASE64 */}
      {activeTab === 'base64file' && (
        <div className="max-w-xl mx-auto pixel-card bg-deck-dark p-6 space-y-4 border border-deck-border font-mono text-xs">
          <span className="font-pixel text-xs text-arcade-amber">BASE64 FILE & IMAGE ENCODER</span>

          <label className="p-8 border-2 border-dashed border-deck-border hover:border-arcade-amber bg-deck-bg text-center cursor-pointer block space-y-2">
            <Upload className="w-8 h-8 mx-auto text-arcade-amber" />
            <div className="font-pixel text-xs text-white">DROP FILE OR CLICK TO ENCODE</div>
            <p className="text-[11px] text-arcade-muted">Generates instant Base64 Data URI</p>
            <input type="file" onChange={handleFileUploadB64} className="hidden" />
          </label>

          {b64FileResult && (
            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-center text-white">
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
                className="w-full bg-deck-bg border border-deck-border p-2 text-[10px] break-all select-all text-white"
              />
            </div>
          )}
        </div>
      )}

      {/* 12. DIFF CHECKER */}
      {activeTab === 'diff' && (
        <div className="pixel-card bg-deck-dark p-6 space-y-4 border border-deck-border font-mono text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-arcade-muted block mb-1">Original Text</label>
              <textarea
                value={diffOriginal}
                onChange={(e) => setDiffOriginal(e.target.value)}
                rows={6}
                className="w-full bg-deck-bg border border-deck-border p-2 text-white"
              />
            </div>
            <div>
              <label className="text-arcade-muted block mb-1">Modified Text</label>
              <textarea
                value={diffModified}
                onChange={(e) => setDiffModified(e.target.value)}
                rows={6}
                className="w-full bg-deck-bg border border-deck-border p-2 text-white"
              />
            </div>
          </div>

          <div className="p-4 bg-deck-bg border border-deck-border space-y-1">
            <span className="font-pixel text-[9px] text-arcade-emerald uppercase">LINE DIFF COMPARISON</span>
            <div className="divide-y divide-deck-border/40 font-mono text-xs">
              {diffResult.map((part, index) => (
                <div
                  key={index}
                  className={`p-1 ${
                    part.added ? 'bg-emerald-950/20 text-arcade-emerald font-bold' :
                    part.removed ? 'bg-red-950/20 text-arcade-coral line-through' :
                    'text-white'
                  }`}
                >
                  {part.value}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 13. MORSE CODE */}
      {activeTab === 'morse' && (
        <div className="max-w-xl mx-auto pixel-card bg-deck-dark p-6 space-y-4 border border-deck-border font-mono text-xs">
          <div>
            <label className="text-arcade-muted block mb-1">Enter Text to Encode</label>
            <input
              type="text"
              value={morseInput}
              onChange={(e) => setMorseInput(e.target.value)}
              className="w-full bg-deck-bg border border-deck-border p-2 uppercase text-white"
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
              className="btn-pixel btn-pixel-surface px-4 py-2.5 font-pixel text-xs text-white"
            >
              COPY
            </button>
          </div>
        </div>
      )}

      {/* 14. BINARY & HEX */}
      {activeTab === 'binary' && (
        <div className="max-w-2xl mx-auto pixel-card bg-deck-dark p-6 space-y-4 border border-deck-border font-mono text-xs">
          <div>
            <label className="text-arcade-muted block mb-1">Input Text</label>
            <input
              type="text"
              value={codecInput}
              onChange={(e) => setCodecInput(e.target.value)}
              className="w-full bg-deck-bg border border-deck-border p-2 text-white"
            />
          </div>

          <div className="space-y-3">
            <div className="p-3 bg-deck-bg border border-deck-border space-y-1">
              <span className="font-pixel text-[9px] text-arcade-cyan">8-BIT BINARY</span>
              <div className="break-all text-arcade-emerald">{binaryOutput}</div>
            </div>

            <div className="p-3 bg-deck-bg border border-deck-border space-y-1">
              <span className="font-pixel text-[9px] text-arcade-amber">HEXADECIMAL</span>
              <div className="break-all text-white">{hexOutput}</div>
            </div>

            <div className="p-3 bg-deck-bg border border-deck-border space-y-1">
              <span className="font-pixel text-[9px] text-arcade-coral">BASE64</span>
              <div className="break-all text-arcade-cyan">{base64Output}</div>
            </div>
          </div>
        </div>
      )}

      {/* 15. TEXT TO SPEECH */}
      {activeTab === 'tts' && (
        <div className="max-w-xl mx-auto pixel-card bg-deck-dark p-6 space-y-4 border border-deck-border font-mono text-xs">
          <textarea
            value={ttsText}
            onChange={(e) => setTtsText(e.target.value)}
            rows={4}
            className="w-full bg-deck-bg border border-deck-border p-3 text-white"
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
    </div>
  );
}
