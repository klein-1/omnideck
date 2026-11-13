import React, { useState } from 'react';
import {
  Code, Terminal, FileCode, Hash, Globe,
  Play, Copy, Check, AlertCircle, RefreshCw, Key, Layers, Search
} from 'lucide-react';
import CryptoJS from 'crypto-js';
import { playClick, playSuccess, playError, playCoin } from '../../audio/soundEffects';

export default function DeveloperTools() {
  const [activeTab, setActiveTab] = useState('code');
  // 'code' | 'regex' | 'cssgen' | 'color' | 'curl' | 'json' | 'hash' | 'jwt' | 'dns'

  const [copied, setCopied] = useState(false);
  const copyText = (txt) => {
    navigator.clipboard.writeText(txt);
    setCopied(true);
    playClick();
    setTimeout(() => setCopied(false), 1500);
  };

  // COLOR & WCAG CONTRAST CHECKER
  const [colorHex, setColorHex] = useState('#00ff88');
  const [colorBg, setColorBg] = useState('#000000');

  const getLuminance = (hex) => {
    const rgb = parseInt(hex.replace('#', ''), 16);
    const r = ((rgb >> 16) & 0xff) / 255;
    const g = ((rgb >> 8) & 0xff) / 255;
    const b = (rgb & 0xff) / 255;
    const a = [r, g, b].map(v => v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
    return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
  };

  const getContrastRatio = (c1, c2) => {
    try {
      const l1 = getLuminance(c1);
      const l2 = getLuminance(c2);
      const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
      return parseFloat(ratio.toFixed(2));
    } catch (e) {
      return 1;
    }
  };

  const contrastWithWhite = getContrastRatio(colorHex, '#ffffff');
  const contrastWithBlack = getContrastRatio(colorHex, '#000000');

  // CURL & HTTP REQUEST BUILDER
  const [httpMethod, setHttpMethod] = useState('POST');
  const [httpUrl, setHttpUrl] = useState('https://api.example.com/v1/resource');
  const [httpAuth, setHttpAuth] = useState('Bearer eyJhbGciOi...');
  const [httpBody, setHttpBody] = useState('{\n  "name": "Omni-Deck",\n  "status": "Active"\n}');

  const generatedCurl = `curl -X ${httpMethod} "${httpUrl}" \\
  -H "Content-Type: application/json" \\
  ${httpAuth ? `-H "Authorization: ${httpAuth}" \\\n  ` : ''}-d '${httpBody.replace(/\n/g, '')}'`;

  const generatedFetch = `fetch("${httpUrl}", {
  method: "${httpMethod}",
  headers: {
    "Content-Type": "application/json"${httpAuth ? `,\n    "Authorization": "${httpAuth}"` : ''}
  },
  body: JSON.stringify(${httpBody})
});`;

  // 1. IN-BROWSER CODE RUNNER
  const [jsCode, setJsCode] = useState(`// Omni-Deck In-Browser JavaScript Sandbox
const suites = ['Universal Downloader', 'SHTTPS Host', 'Image Studio', 'PDF Knife'];
const active = suites.map((s, i) => \`[\${i + 1}] \${s}\`);
console.log("Core Modules Active:", active);
return "Sandbox execution complete.";`);

  const [codeOutput, setCodeOutput] = useState('');
  const [codeRunning, setCodeRunning] = useState(false);

  const runCode = async () => {
    setCodeRunning(true);
    setCodeOutput('Executing sandbox...');
    playClick();

    try {
      const res = await fetch('/api/dev/run-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: jsCode })
      });
      const data = await res.json();
      if (data.success) {
        setCodeOutput((data.logs || []).join('\n') + (data.result ? `\n\n[RETURN VALUE]: ${data.result}` : ''));
        playSuccess();
      } else {
        setCodeOutput(`[ERROR]: ${data.error}\n` + (data.logs || []).join('\n'));
        playError();
      }
    } catch (e) {
      setCodeOutput('Execution Error: ' + e.message);
      playError();
    } finally {
      setCodeRunning(false);
    }
  };

  // 2. REGEX VISUAL TESTER
  const [regexPattern, setRegexPattern] = useState('[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}');
  const [regexFlags, setRegexFlags] = useState('g');
  const [regexTestStr, setRegexTestStr] = useState('Contact support@example.com or security-team@cyberdeck.org for inquiries.');
  const [regexMatches, setRegexMatches] = useState([]);
  const [regexError, setRegexError] = useState(null);

  const testRegex = () => {
    try {
      const re = new RegExp(regexPattern, regexFlags);
      const matches = [...regexTestStr.matchAll(re)].map(m => m[0]);
      setRegexMatches(matches);
      setRegexError(null);
    } catch (e) {
      setRegexError(e.message);
      setRegexMatches([]);
    }
  };

  useEffect(() => {
    testRegex();
  }, [regexPattern, regexFlags, regexTestStr]);

  const loadRegexPreset = (pat, flags = 'g') => {
    setRegexPattern(pat);
    setRegexFlags(flags);
    playClick();
  };

  // 3. CSS BOX SHADOW GENERATOR
  const [shadowX, setShadowX] = useState(4);
  const [shadowY, setShadowY] = useState(4);
  const [shadowBlur, setShadowBlur] = useState(0);
  const [shadowSpread, setShadowSpread] = useState(0);
  const [shadowColor, setShadowColor] = useState('#000000');
  const [isInset, setIsInset] = useState(false);

  const generatedCss = `box-shadow: ${isInset ? 'inset ' : ''}${shadowX}px ${shadowY}px ${shadowBlur}px ${shadowSpread}px ${shadowColor};`;

  // 4. JSON FORMATTER
  const [rawJson, setRawJson] = useState('{"platform":"Omni-Deck","status":"Online","toolsCount":130,"offlineFirst":true}');
  const [formattedJson, setFormattedJson] = useState('');
  const [jsonError, setJsonError] = useState(null);

  const formatJson = () => {
    playClick();
    try {
      const parsed = JSON.parse(rawJson);
      setFormattedJson(JSON.stringify(parsed, null, 2));
      setJsonError(null);
      playSuccess();
    } catch (e) {
      setJsonError(e.message);
      playError();
    }
  };

  // 5. HASH GENERATOR
  const [hashInput, setHashInput] = useState('Omni-Deck Cybernetic Payload');
  const md5Hash = CryptoJS.MD5(hashInput).toString();
  const sha1Hash = CryptoJS.SHA1(hashInput).toString();
  const sha256Hash = CryptoJS.SHA256(hashInput).toString();
  const sha512Hash = CryptoJS.SHA512(hashInput).toString();

  // 6. JWT DECODER
  const [jwtToken, setJwtToken] = useState('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwicm9sZSI6IkFkbWluIiwiYXVkIjoib21uaWRlY2siLCJpYXQiOjE1MTYyMzkwMjJ9.4zC59gqF4_4oQGq5Q-4Xv6');
  const [jwtHeader, setJwtHeader] = useState(null);
  const [jwtPayload, setJwtPayload] = useState(null);

  const decodeJwt = () => {
    playClick();
    try {
      const parts = jwtToken.split('.');
      if (parts.length >= 2) {
        setJwtHeader(JSON.parse(atob(parts[0])));
        setJwtPayload(JSON.parse(atob(parts[1])));
        playSuccess();
      }
    } catch (e) {
      alert('Invalid JWT Token structure');
      playError();
    }
  };

  // 7. DNS LOOKUP
  const [dnsDomain, setDnsDomain] = useState('github.com');
  const [dnsResult, setDnsResult] = useState(null);
  const [dnsLoading, setDnsLoading] = useState(false);

  const lookupDns = async (e) => {
    if (e) e.preventDefault();
    if (!dnsDomain.trim()) return;

    setDnsLoading(true);
    setDnsResult(null);
    playClick();

    try {
      const res = await fetch('/api/net/dns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: dnsDomain.trim() })
      });
      const data = await res.json();
      setDnsResult(data);
      playSuccess();
    } catch (e) {
      alert('DNS lookup failed');
      playError();
    } finally {
      setDnsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Subtool Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar border-b-2 border-deck-border pb-3">
        {[
          { id: 'code', label: 'CODE SANDBOX', icon: Terminal, color: 'btn-pixel-lime' },
          { id: 'regex', label: 'REGEX TESTER', icon: Search, color: 'btn-pixel-cyan' },
          { id: 'cssgen', label: 'CSS SHADOW & STYLE', icon: Layers, color: 'btn-pixel-orange' },
          { id: 'color', label: 'COLOR & CONTRAST', icon: Layers, color: 'btn-pixel-pink' },
          { id: 'curl', label: 'CURL & API BUILDER', icon: Globe, color: 'btn-pixel-blue' },
          { id: 'json', label: 'JSON FORMATTER', icon: FileCode, color: 'btn-pixel-amber' },
          { id: 'hash', label: 'HASH GENERATOR', icon: Hash, color: 'btn-pixel-purple' },
          { id: 'jwt', label: 'JWT DECODER', icon: Key, color: 'btn-pixel-teal' },
          { id: 'dns', label: 'DNS LOOKUP', icon: Globe, color: 'btn-pixel-emerald' },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => { playClick(); setActiveTab(tab.id); }}
              className={`btn-pixel px-3 py-1.5 font-pixel text-[9px] flex items-center gap-2 shrink-0 ${isActive ? tab.color : 'btn-pixel-surface'
                }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* 1. CODE PLAYGROUND */}
      {activeTab === 'code' && (
        <div className="space-y-4 font-mono text-xs">
          <div className="flex justify-between items-center">
            <span className="font-pixel text-[10px] text-arcade-emerald uppercase">NODE.JS JAVASCRIPT REPL VM</span>
            <button
              onClick={runCode}
              disabled={codeRunning}
              className="btn-pixel btn-pixel-emerald px-4 py-2 font-pixel text-[10px] flex items-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5 fill-black" />
              RUN CODE
            </button>
          </div>

          <textarea
            value={jsCode}
            onChange={(e) => setJsCode(e.target.value)}
            rows={8}
            className="w-full bg-deck-dark border-2 border-deck-border p-3 font-mono text-xs focus:outline-none focus:border-arcade-emerald"
          />

          {codeOutput && (
            <div className="p-4 bg-deck-bg border border-arcade-emerald space-y-1">
              <span className="font-pixel text-[8px] text-arcade-emerald">SANDBOX STDOUT OUTPUT</span>
              <pre className="text-xs font-mono whitespace-pre-wrap">{codeOutput}</pre>
            </div>
          )}
        </div>
      )}

      {/* 2. REGEX VISUAL TESTER */}
      {activeTab === 'regex' && (
        <div className="max-w-2xl mx-auto pixel-card bg-deck-dark p-6 space-y-4 border border-deck-border font-mono text-xs">
          <div className="flex justify-between items-center border-b border-deck-border pb-2">
            <span className="font-pixel text-xs text-arcade-cyan">REGEX VISUAL TESTER</span>
            <span className="text-arcade-emerald font-pixel text-[9px]">{regexMatches.length} MATCHES</span>
          </div>

          <div className="grid grid-cols-4 gap-2">
            <div className="col-span-3">
              <label className="text-arcade-muted block mb-1">Regex Pattern</label>
              <input
                type="text"
                value={regexPattern}
                onChange={(e) => setRegexPattern(e.target.value)}
                className="w-full bg-deck-bg border border-deck-border p-2 font-mono"
              />
            </div>
            <div>
              <label className="text-arcade-muted block mb-1">Flags</label>
              <input
                type="text"
                value={regexFlags}
                onChange={(e) => setRegexFlags(e.target.value)}
                className="w-full bg-deck-bg border border-deck-border p-2 font-mono"
              />
            </div>
          </div>

          {/* Preset Buttons */}
          <div className="flex flex-wrap gap-1.5">
            <span className="text-arcade-muted text-[10px] mr-1 self-center">PRESETS:</span>
            <button onClick={() => loadRegexPreset('[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}')} className="px-2 py-0.5 border border-deck-border text-[9px] bg-deck-bg hover:border-arcade-emerald">Email</button>
            <button onClick={() => loadRegexPreset('https?:\\/\\/[^\\s/$.?#].[^\\s]*')} className="px-2 py-0.5 border border-deck-border text-[9px] bg-deck-bg hover:border-arcade-emerald">URL</button>
            <button onClick={() => loadRegexPreset('\\b\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\b')} className="px-2 py-0.5 border border-deck-border text-[9px] bg-deck-bg hover:border-arcade-emerald">IPv4</button>
            <button onClick={() => loadRegexPreset('#?([a-fA-F0-9]{6}|[a-fA-F0-9]{3})')} className="px-2 py-0.5 border border-deck-border text-[9px] bg-deck-bg hover:border-arcade-emerald">Hex Color</button>
          </div>

          <div>
            <label className="text-arcade-muted block mb-1">Test String</label>
            <textarea
              value={regexTestStr}
              onChange={(e) => setRegexTestStr(e.target.value)}
              rows={4}
              className="w-full bg-deck-bg border border-deck-border p-2.5 font-mono"
            />
          </div>

          <div className="p-3 bg-deck-bg border border-deck-border space-y-2">
            <span className="font-pixel text-[9px] text-arcade-amber">MATCHES FOUND ({regexMatches.length})</span>
            {regexError ? (
              <div className="text-arcade-coral">{regexError}</div>
            ) : regexMatches.length === 0 ? (
              <div className="text-arcade-muted">No matches found.</div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {regexMatches.map((m, idx) => (
                  <span key={idx} className="px-2 py-1 bg-emerald-950/20 border border-arcade-emerald text-arcade-emerald font-bold">
                    {m}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. CSS BOX SHADOW GENERATOR */}
      {activeTab === 'cssgen' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center font-mono text-xs">
          <div className="pixel-card bg-deck-dark p-6 space-y-4 border border-deck-border">
            <span className="font-pixel text-xs text-arcade-coral">CSS BOX SHADOW ARCHITECT</span>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-arcade-muted mb-1">
                  <span>Offset X ({shadowX}px)</span>
                  <span>{shadowX}px</span>
                </div>
                <input type="range" min="-50" max="50" value={shadowX} onChange={(e) => setShadowX(Number(e.target.value))} className="w-full accent-arcade-coral" />
              </div>

              <div>
                <div className="flex justify-between text-arcade-muted mb-1">
                  <span>Offset Y ({shadowY}px)</span>
                  <span>{shadowY}px</span>
                </div>
                <input type="range" min="-50" max="50" value={shadowY} onChange={(e) => setShadowY(Number(e.target.value))} className="w-full accent-arcade-coral" />
              </div>

              <div>
                <div className="flex justify-between text-arcade-muted mb-1">
                  <span>Blur Radius ({shadowBlur}px)</span>
                  <span>{shadowBlur}px</span>
                </div>
                <input type="range" min="0" max="60" value={shadowBlur} onChange={(e) => setShadowBlur(Number(e.target.value))} className="w-full accent-arcade-coral" />
              </div>

              <div>
                <div className="flex justify-between text-arcade-muted mb-1">
                  <span>Spread ({shadowSpread}px)</span>
                  <span>{shadowSpread}px</span>
                </div>
                <input type="range" min="-20" max="40" value={shadowSpread} onChange={(e) => setShadowSpread(Number(e.target.value))} className="w-full accent-arcade-coral" />
              </div>

              <div className="flex justify-between items-center pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={isInset} onChange={(e) => setIsInset(e.target.checked)} className="rounded-none accent-arcade-coral" />
                  <span>Inset Shadow</span>
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-arcade-muted">Color:</span>
                  <input type="color" value={shadowColor} onChange={(e) => setShadowColor(e.target.value)} className="w-8 h-8 border border-black cursor-pointer" />
                </div>
              </div>
            </div>

            <div className="p-3 bg-deck-bg border border-deck-border flex items-center justify-between gap-2">
              <code className="text-arcade-emerald text-[11px] break-all">{generatedCss}</code>
              <button onClick={() => copyText(generatedCss)} className="btn-pixel btn-pixel-coral px-3 py-1 font-pixel text-[8px] shrink-0">
                COPY
              </button>
            </div>
          </div>

          <div className="pixel-card bg-deck-dark p-12 flex items-center justify-center border border-deck-border min-h-[300px]">
            <div
              className="w-48 h-36 bg-deck-surface border-2 border-black flex items-center justify-center font-pixel text-xs text-center transition-all"
              style={{
                boxShadow: `${isInset ? 'inset ' : ''}${shadowX}px ${shadowY}px ${shadowBlur}px ${shadowSpread}px ${shadowColor}`
              }}
            >
              PREVIEW BOX
            </div>
          </div>
        </div>
      )}

      {/* 4. JSON FORMATTER */}
      {activeTab === 'json' && (
        <div className="space-y-4 font-mono text-xs">
          <div className="flex justify-between items-center">
            <span className="font-pixel text-[10px] text-arcade-cyan uppercase">JSON SYNTAX VALIDATOR & BEAUTIFIER</span>
            <button
              onClick={formatJson}
              className="btn-pixel btn-pixel-cyan px-4 py-1.5 font-pixel text-[9px]"
            >
              FORMAT JSON
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <textarea
              value={rawJson}
              onChange={(e) => setRawJson(e.target.value)}
              rows={10}
              placeholder="Paste raw unformatted JSON..."
              className="w-full bg-deck-dark border border-deck-border p-3 focus:outline-none"
            />
            <div className="bg-deck-bg border border-deck-border p-3 overflow-auto max-h-72">
              {jsonError ? (
                <div className="text-arcade-coral">{jsonError}</div>
              ) : (
                <pre className="text-arcade-emerald text-xs">{formattedJson || '// Formatted output will appear here'}</pre>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 5. HASH GENERATOR */}
      {activeTab === 'hash' && (
        <div className="max-w-2xl mx-auto pixel-card bg-deck-dark p-6 space-y-4 border border-deck-border font-mono text-xs">
          <div>
            <label className="text-arcade-muted block mb-1">Input Text / Secret</label>
            <input
              type="text"
              value={hashInput}
              onChange={(e) => setHashInput(e.target.value)}
              className="w-full bg-deck-bg border border-deck-border p-2"
            />
          </div>

          <div className="space-y-3 pt-2">
            {[
              { label: 'MD5 (128-bit)', val: md5Hash, color: 'text-arcade-amber' },
              { label: 'SHA-1 (160-bit)', val: sha1Hash, color: 'text-arcade-cyan' },
              { label: 'SHA-256 (256-bit)', val: sha256Hash, color: 'text-arcade-emerald' },
              { label: 'SHA-512 (512-bit)', val: sha512Hash, color: 'text-arcade-coral' }
            ].map(h => (
              <div key={h.label} className="p-3 bg-deck-bg border border-deck-border space-y-1">
                <div className="flex justify-between items-center text-arcade-muted">
                  <span className="font-pixel text-[9px]">{h.label}</span>
                  <button onClick={() => copyText(h.val)} className="hover:underline flex items-center gap-1 text-[10px]">
                    COPY
                  </button>
                </div>
                <div className={`break-all ${h.color} font-bold text-[11px]`}>{h.val}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. JWT DECODER */}
      {activeTab === 'jwt' && (
        <div className="max-w-2xl mx-auto pixel-card bg-deck-dark p-6 space-y-4 border border-deck-border font-mono text-xs">
          <div>
            <label className="text-arcade-muted block mb-1">Encoded JWT Token</label>
            <textarea
              value={jwtToken}
              onChange={(e) => setJwtToken(e.target.value)}
              rows={3}
              className="w-full bg-deck-bg border border-deck-border p-2 break-all"
            />
          </div>

          <button
            onClick={decodeJwt}
            className="btn-pixel btn-pixel-cyan w-full py-2.5 font-pixel text-xs"
          >
            DECODE JWT CLAIMS
          </button>

          {jwtHeader && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              <div className="p-3 bg-deck-bg border border-arcade-coral space-y-1">
                <span className="font-pixel text-[9px] text-arcade-coral">HEADER (ALGORITHM & TOKEN TYPE)</span>
                <pre className="text-xs">{JSON.stringify(jwtHeader, null, 2)}</pre>
              </div>

              <div className="p-3 bg-deck-bg border border-arcade-emerald space-y-1">
                <span className="font-pixel text-[9px] text-arcade-emerald">PAYLOAD (DATA CLAIMS)</span>
                <pre className="text-xs">{JSON.stringify(jwtPayload, null, 2)}</pre>
              </div>
            </div>
          )}
        </div>
      )}

      {/* COLOR & WCAG CONTRAST CHECKER */}
      {activeTab === 'color' && (
        <div className="max-w-xl mx-auto pixel-card bg-deck-dark p-6 space-y-6 font-mono text-xs">
          <div className="flex justify-between items-center border-b border-deck-border pb-2">
            <span className="font-pixel text-xs text-arcade-cyan">COLOR & WCAG 2.1 CONTRAST CHECKER</span>
            <span className="font-pixel text-[9px] text-arcade-emerald">ACCESSIBILITY AUDIT</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <input
              type="color"
              value={colorHex}
              onChange={(e) => setColorHex(e.target.value)}
              className="w-24 h-24 border-4 border-black cursor-pointer bg-transparent"
            />
            <div className="space-y-2 flex-1 w-full">
              <label className="text-arcade-muted block text-[10px] font-pixel">HEX COLOR CODE</label>
              <input
                type="text"
                value={colorHex}
                onChange={(e) => setColorHex(e.target.value)}
                className="w-full bg-deck-bg border border-deck-border p-2 font-pixel text-sm uppercase"
              />
            </div>
          </div>

          {/* Live Contrast Card Comparison */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* White Background Contrast */}
            <div className="p-4 border-2 border-black bg-white text-black space-y-2">
              <span className="font-pixel text-[9px] block text-slate-500">ON WHITE BACKGROUND</span>
              <div
                className="font-pixel text-xl font-bold py-2 px-3 border border-black/20"
                style={{ color: colorHex }}
              >
                SAMPLE TEXT
              </div>
              <div className="flex justify-between items-center text-xs">
                <span>Contrast Ratio:</span>
                <strong className="font-pixel text-sm">{contrastWithWhite} : 1</strong>
              </div>
              <div className="flex gap-2 pt-1">
                <span className={`px-2 py-0.5 text-[8px] font-pixel ${contrastWithWhite >= 4.5 ? 'bg-emerald-600 text-white' : 'bg-red-500 text-white'}`}>
                  AA {contrastWithWhite >= 4.5 ? 'PASS' : 'FAIL'}
                </span>
                <span className={`px-2 py-0.5 text-[8px] font-pixel ${contrastWithWhite >= 7.0 ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-black'}`}>
                  AAA {contrastWithWhite >= 7.0 ? 'PASS' : 'FAIL'}
                </span>
              </div>
            </div>

            {/* Black Background Contrast */}
            <div className="p-4 border-2 border-black bg-black text-white space-y-2">
              <span className="font-pixel text-[9px] block text-slate-400">ON BLACK BACKGROUND</span>
              <div
                className="font-pixel text-xl font-bold py-2 px-3 border border-white/20"
                style={{ color: colorHex }}
              >
                SAMPLE TEXT
              </div>
              <div className="flex justify-between items-center text-xs">
                <span>Contrast Ratio:</span>
                <strong className="font-pixel text-sm text-arcade-amber">{contrastWithBlack} : 1</strong>
              </div>
              <div className="flex gap-2 pt-1">
                <span className={`px-2 py-0.5 text-[8px] font-pixel ${contrastWithBlack >= 4.5 ? 'bg-emerald-600 text-white' : 'bg-red-500 text-white'}`}>
                  AA {contrastWithBlack >= 4.5 ? 'PASS' : 'FAIL'}
                </span>
                <span className={`px-2 py-0.5 text-[8px] font-pixel ${contrastWithBlack >= 7.0 ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-white'}`}>
                  AAA {contrastWithBlack >= 7.0 ? 'PASS' : 'FAIL'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CURL & HTTP REQUEST BUILDER */}
      {activeTab === 'curl' && (
        <div className="max-w-2xl mx-auto pixel-card bg-deck-dark p-6 space-y-4 font-mono text-xs">
          <div className="flex justify-between items-center border-b border-deck-border pb-2">
            <span className="font-pixel text-xs text-arcade-emerald">CURL & API SNIPPET GENERATOR</span>
            <span className="font-pixel text-[9px] text-arcade-amber">MULTI-LANGUAGE</span>
          </div>

          <div className="grid grid-cols-4 gap-2">
            <div>
              <label className="text-arcade-muted block mb-1">Method</label>
              <select
                value={httpMethod}
                onChange={(e) => setHttpMethod(e.target.value)}
                className="w-full bg-deck-bg border border-deck-border p-2"
              >
                {['GET', 'POST', 'PUT', 'DELETE', 'PATCH'].map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            <div className="col-span-3">
              <label className="text-arcade-muted block mb-1">Target URL</label>
              <input
                type="text"
                value={httpUrl}
                onChange={(e) => setHttpUrl(e.target.value)}
                className="w-full bg-deck-bg border border-deck-border p-2"
              />
            </div>
          </div>

          <div>
            <label className="text-arcade-muted block mb-1">Authorization Header</label>
            <input
              type="text"
              value={httpAuth}
              onChange={(e) => setHttpAuth(e.target.value)}
              placeholder="Bearer <token> or Basic <creds>"
              className="w-full bg-deck-bg border border-deck-border p-2"
            />
          </div>

          {['POST', 'PUT', 'PATCH'].includes(httpMethod) && (
            <div>
              <label className="text-arcade-muted block mb-1">JSON Payload Body</label>
              <textarea
                value={httpBody}
                onChange={(e) => setHttpBody(e.target.value)}
                rows={3}
                className="w-full bg-deck-bg border border-deck-border p-2 font-mono"
              />
            </div>
          )}

          <div className="space-y-3 pt-2">
            <div className="flex justify-between items-center">
              <span className="font-pixel text-[9px] text-arcade-amber">GENERATED CURL COMMAND</span>
              <button
                onClick={() => copyText(generatedCurl)}
                className="btn-pixel btn-pixel-amber px-2 py-1 font-pixel text-[8px]"
              >
                COPY CURL
              </button>
            </div>
            <pre className="p-3 bg-black text-arcade-emerald border border-black overflow-x-auto text-[11px]">
              {generatedCurl}
            </pre>
          </div>
        </div>
      )}

      {/* 7. DNS LOOKUP */}
      {activeTab === 'dns' && (
        <div className="max-w-2xl mx-auto pixel-card bg-deck-dark p-6 space-y-4 border border-deck-border font-mono text-xs">
          <form onSubmit={lookupDns} className="flex gap-2">
            <input
              type="text"
              value={dnsDomain}
              onChange={(e) => setDnsDomain(e.target.value)}
              placeholder="e.g. github.com or google.com"
              className="flex-1 bg-deck-bg border border-deck-border p-2"
            />
            <button
              type="submit"
              disabled={dnsLoading}
              className="btn-pixel btn-pixel-emerald px-4 font-pixel text-[9px]"
            >
              QUERY DNS
            </button>
          </form>

          {dnsResult && (
            <div className="p-4 bg-deck-bg border border-deck-border space-y-3">
              <div className="font-pixel text-xs text-arcade-cyan">RECORDS FOR: {dnsResult.domain}</div>
              <div className="space-y-2 text-xs">
                <div>
                  <strong className="text-arcade-emerald">A Records (IPv4): </strong>
                  {dnsResult.A?.join(', ') || 'None'}
                </div>
                <div>
                  <strong className="text-arcade-amber">MX Mail Exchangers: </strong>
                  {dnsResult.MX?.map(m => m.exchange).join(', ') || 'None'}
                </div>
                <div>
                  <strong className="text-arcade-coral">TXT Records: </strong>
                  {dnsResult.TXT?.slice(0, 3).join(' | ') || 'None'}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
