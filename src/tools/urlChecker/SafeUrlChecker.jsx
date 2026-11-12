import React, { useState } from 'react';
import { 
  ShieldCheck, ShieldAlert, ArrowRight, ExternalLink, 
  Lock, AlertTriangle, CheckCircle, Info, RefreshCw, Copy, Check
} from 'lucide-react';
import { playClick, playSuccess, playError } from '../../audio/soundEffects';

export default function SafeUrlChecker() {
  const [url, setUrl] = useState('');
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleScan = async (e) => {
    if (e) e.preventDefault();
    if (!url.trim()) return;

    setScanning(true);
    setError(null);
    setResult(null);
    playClick();

    try {
      const res = await fetch('/api/url-checker/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to analyze URL');

      setResult(data);
      if (data.rating === 'SAFE') playSuccess();
      else playError();
    } catch (err) {
      setError(err.message);
      playError();
    } finally {
      setScanning(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    playClick();
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <form onSubmit={handleScan} className="space-y-3">
        <label className="block text-xs font-pixel text-arcade-cyan">
          ENTER SUSPICIOUS OR SHORTENED URL FOR THREAT AUDIT & EXPANSION
        </label>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="e.g. bit.ly/3xyz or http://paypal-secure-check.net..."
            className="flex-1 bg-deck-bg border-2 border-deck-border focus:border-arcade-cyan p-3 font-mono text-xs text-white placeholder:text-arcade-muted/60 focus:outline-none"
          />
          <button
            type="submit"
            disabled={scanning || !url}
            className="btn-pixel btn-pixel-cyan px-6 py-3 font-pixel text-[10px] flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {scanning ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                AUDITING URL...
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                AUDIT THREATS
              </>
            )}
          </button>
        </div>
      </form>

      {error && (
        <div className="p-3 bg-red-950/60 border-2 border-arcade-coral text-arcade-coral flex items-center gap-3 text-xs font-mono">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Result Card */}
      {result && (
        <div className="space-y-6 animate-fadeIn">
          {/* Top Threat Summary Banner */}
          <div className={`p-4 border-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
            result.rating === 'SAFE' 
              ? 'bg-emerald-950/40 border-arcade-emerald text-arcade-emerald'
              : result.rating === 'CAUTION'
              ? 'bg-amber-950/40 border-arcade-amber text-arcade-amber'
              : 'bg-red-950/50 border-arcade-coral text-arcade-coral'
          }`}>
            <div className="flex items-center gap-3">
              {result.rating === 'SAFE' ? (
                <ShieldCheck className="w-8 h-8 shrink-0" />
              ) : (
                <ShieldAlert className="w-8 h-8 shrink-0 animate-pulse" />
              )}
              <div>
                <div className="font-pixel text-xs tracking-wider uppercase">
                  SAFETY VERDICT: {result.rating}
                </div>
                <div className="text-xs font-mono text-slate-300 mt-0.5">
                  Trust Score: <strong className="font-bold text-white">{result.safetyScore} / 100</strong>
                  {result.isRedirected && ` • Traced across ${result.totalHops} redirect hops`}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className={`px-2 py-1 font-pixel text-[9px] border ${
                result.isHttps 
                  ? 'border-arcade-emerald bg-deck-dark text-arcade-emerald' 
                  : 'border-arcade-coral bg-deck-dark text-arcade-coral'
              }`}>
                {result.isHttps ? 'HTTPS ENCRYPTED' : 'INSECURE HTTP'}
              </span>
            </div>
          </div>

          {/* Redirect Chain Trace */}
          <div className="pixel-card bg-deck-dark p-4 space-y-3 border border-deck-border">
            <h4 className="font-pixel text-[10px] text-arcade-amber uppercase">
              REDIRECT HOPS TRACE // UNSHORTENED DESTINATION
            </h4>

            <div className="space-y-2">
              {result.hops.map((hop, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-deck-bg border border-deck-border flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-pixel text-[9px] text-arcade-cyan shrink-0">
                      HOP #{idx + 1}
                    </span>
                    <span className="text-white truncate font-bold">{hop.url}</span>
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-arcade-muted shrink-0">
                    <span className={`px-1.5 py-0.5 text-[9px] border font-bold ${
                      hop.status >= 200 && hop.status < 300 
                        ? 'border-arcade-emerald text-arcade-emerald' 
                        : hop.status >= 300 && hop.status < 400
                        ? 'border-arcade-amber text-arcade-amber'
                        : 'border-arcade-coral text-arcade-coral'
                    }`}>
                      STATUS {hop.status}
                    </span>
                    <span>{hop.latency}ms</span>
                    <span>{hop.server}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Final Clean Destination */}
          <div className="p-4 bg-deck-surface border-2 border-deck-border space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-pixel text-[10px] text-arcade-cyan">
                FINAL RESOLVED & SANITIZED DESTINATION
              </span>
              <button
                onClick={() => copyToClipboard(result.cleanedUrl)}
                className="text-[10px] font-mono text-arcade-emerald hover:underline flex items-center gap-1"
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copied ? 'COPIED!' : 'COPY CLEAN URL'}
              </button>
            </div>
            <div className="p-3 bg-deck-dark border border-deck-border text-white text-xs font-mono break-all flex items-center justify-between gap-3">
              <span>{result.cleanedUrl}</span>
              <a
                href={result.cleanedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-pixel btn-pixel-surface p-1 text-arcade-muted hover:text-white"
                title="Open safely in new tab"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Security Flags & Tracking Stripper */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Flags */}
            <div className="pixel-card bg-deck-dark p-4 space-y-3 border border-deck-border">
              <h4 className="font-pixel text-[10px] text-arcade-coral uppercase">
                SECURITY HEURISTIC AUDIT ({result.flags.length})
              </h4>
              <div className="space-y-2">
                {result.flags.length === 0 ? (
                  <div className="text-xs text-arcade-emerald flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    No known suspicious patterns or homograph anomalies detected.
                  </div>
                ) : (
                  result.flags.map((flag, idx) => (
                    <div
                      key={idx}
                      className={`p-2.5 border text-xs font-mono flex items-start gap-2 ${
                        flag.severity === 'high' 
                          ? 'border-arcade-coral/60 bg-red-950/30 text-arcade-coral' 
                          : flag.severity === 'medium'
                          ? 'border-arcade-amber/60 bg-amber-950/30 text-arcade-amber'
                          : 'border-deck-border bg-deck-bg text-slate-300'
                      }`}
                    >
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span>{flag.message}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Tracking Removed */}
            <div className="pixel-card bg-deck-dark p-4 space-y-3 border border-deck-border">
              <h4 className="font-pixel text-[10px] text-arcade-emerald uppercase">
                STRIPPED TRACKERS ({result.trackingParamsRemoved.length})
              </h4>
              <div className="space-y-2 text-xs font-mono">
                {result.trackingParamsRemoved.length === 0 ? (
                  <div className="text-arcade-muted">
                    Clean URL! No surveillance parameters (UTM, Facebook fbclid, Google gclid) detected.
                  </div>
                ) : (
                  result.trackingParamsRemoved.map((param, idx) => (
                    <div key={idx} className="p-2 bg-deck-bg border border-deck-border text-arcade-coral line-through">
                      {param}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* DNS Lookup */}
          {result.dns && (
            <div className="pixel-card bg-deck-dark p-4 space-y-2 border border-deck-border text-xs font-mono">
              <h4 className="font-pixel text-[10px] text-arcade-cyan uppercase">
                DNS RESOLUTION RECORD
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300">
                <div>
                  <strong className="text-arcade-emerald">IPv4 (A): </strong>
                  {result.dns.ipv4 ? result.dns.ipv4.join(', ') : 'None'}
                </div>
                <div>
                  <strong className="text-arcade-amber">Mail (MX): </strong>
                  {result.dns.mx ? result.dns.mx.map(m => m.exchange).join(', ') : 'None'}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

