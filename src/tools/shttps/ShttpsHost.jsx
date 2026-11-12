import React, { useState, useEffect } from 'react';
import { 
  Server, Play, Square, RefreshCw, QrCode, Lock, 
  UploadCloud, Activity, ExternalLink, Globe, Wifi, Check, AlertTriangle
} from 'lucide-react';
import QRCode from 'qrcode';
import { playClick, playSuccess, playError } from '../../audio/soundEffects';

export default function ShttpsHost() {
  const [port, setPort] = useState(8443);
  const [protocol, setProtocol] = useState('https');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [enableUploads, setEnableUploads] = useState(true);
  const [enableCORS, setEnableCORS] = useState(true);

  const [activeServers, setActiveServers] = useState([]);
  const [localIP, setLocalIP] = useState('127.0.0.1');
  const [logs, setLogs] = useState({});
  const [qrModal, setQrModal] = useState(null); // url string
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 3000);
    return () => clearInterval(interval);
  }, []);

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/shttps/info');
      if (res.ok) {
        const data = await res.json();
        setActiveServers(data.activeServers || []);
        if (data.localIP) setLocalIP(data.localIP);

        // Fetch logs for active servers
        (data.activeServers || []).forEach(srv => {
          fetchServerLogs(srv.port);
        });
      }
    } catch (e) {}
  };

  const fetchServerLogs = async (srvPort) => {
    try {
      const res = await fetch(`/api/shttps/logs/${srvPort}`);
      if (res.ok) {
        const serverLogs = await res.json();
        setLogs(prev => ({ ...prev, [srvPort]: serverLogs }));
      }
    } catch (e) {}
  };

  const handleStart = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);
    playClick();

    try {
      const res = await fetch('/api/shttps/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          port: Number(port),
          protocol,
          username,
          password,
          enableUploads,
          enableCORS
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to start server');

      playSuccess();
      fetchStatus();
    } catch (err) {
      setError(err.message);
      playError();
    } finally {
      setLoading(false);
    }
  };

  const handleStop = async (targetPort) => {
    playClick();
    try {
      const res = await fetch('/api/shttps/stop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ port: targetPort })
      });
      if (res.ok) {
        fetchStatus();
      }
    } catch (e) {}
  };

  const showQRCode = async (url) => {
    setQrModal(url);
    try {
      const qr = await QRCode.toDataURL(url, {
        width: 300,
        margin: 2,
        color: { dark: '#000000', light: '#ffffff' }
      });
      setQrDataUrl(qr);
    } catch (e) {}
  };

  return (
    <div className="space-y-6">
      {/* Configuration & Launch Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Server Launcher Form */}
        <div className="lg:col-span-1 pixel-card bg-deck-dark p-4 space-y-4 border border-deck-border">
          <div className="font-pixel text-[10px] text-arcade-amber flex items-center gap-2 border-b border-deck-border pb-2">
            <Server className="w-4 h-4 text-arcade-amber" />
            DEPLOY NEW LOCAL SERVER
          </div>

          <form onSubmit={handleStart} className="space-y-3 font-mono text-xs">
            {/* Protocol */}
            <div className="space-y-1">
              <label className="text-arcade-muted">Protocol Security</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setProtocol('https')}
                  className={`p-2 font-pixel text-[8px] border flex items-center justify-center gap-1.5 ${
                    protocol === 'https' 
                      ? 'bg-deck-surface border-arcade-emerald text-arcade-emerald font-bold' 
                      : 'bg-deck-bg border-deck-border text-arcade-muted'
                  }`}
                >
                  <Lock className="w-3 h-3" />
                  HTTPS (SSL)
                </button>
                <button
                  type="button"
                  onClick={() => setProtocol('http')}
                  className={`p-2 font-pixel text-[8px] border flex items-center justify-center gap-1.5 ${
                    protocol === 'http' 
                      ? 'bg-deck-surface border-arcade-amber text-arcade-amber font-bold' 
                      : 'bg-deck-bg border-deck-border text-arcade-muted'
                  }`}
                >
                  <Globe className="w-3 h-3" />
                  HTTP (PLAIN)
                </button>
              </div>
            </div>

            {/* Port */}
            <div className="space-y-1">
              <label className="text-arcade-muted">Listen Port</label>
              <input
                type="number"
                value={port}
                onChange={(e) => setPort(e.target.value)}
                className="w-full bg-deck-bg border border-deck-border p-2 text-white font-mono"
              />
            </div>

            {/* Basic Auth */}
            <div className="space-y-1 pt-1 border-t border-deck-border/40">
              <label className="text-arcade-muted text-[11px]">Optional Basic Auth (User & Pass)</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Username"
                  className="bg-deck-bg border border-deck-border p-2 text-white placeholder:text-arcade-muted/40"
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="bg-deck-bg border border-deck-border p-2 text-white placeholder:text-arcade-muted/40"
                />
              </div>
            </div>

            {/* Toggles */}
            <div className="space-y-2 pt-2 border-t border-deck-border/40">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableUploads}
                  onChange={(e) => setEnableUploads(e.target.checked)}
                  className="rounded-none accent-arcade-emerald"
                />
                <span className="text-slate-300">Enable Mobile Drag & Drop File Uploads</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableCORS}
                  onChange={(e) => setEnableCORS(e.target.checked)}
                  className="rounded-none accent-arcade-emerald"
                />
                <span className="text-slate-300">Enable CORS (Cross-Origin Resource Sharing)</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-pixel btn-pixel-amber w-full py-3 font-pixel text-[10px] flex items-center justify-center gap-2 mt-4"
            >
              <Play className="w-3.5 h-3.5 fill-black" />
              SPAWN {protocol.toUpperCase()} SERVER
            </button>
          </form>
        </div>

        {/* Right: Active Server Nodes */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-deck-border pb-2">
            <h3 className="font-pixel text-xs text-arcade-emerald flex items-center gap-2">
              <Activity className="w-4 h-4 text-arcade-emerald" />
              ACTIVE SHTTPS SERVERS ({activeServers.length})
            </h3>
            <span className="text-[10px] font-mono text-arcade-muted">
              LAN IP: <strong className="text-arcade-cyan">{localIP}</strong>
            </span>
          </div>

          {error && (
            <div className="p-3 bg-red-950/60 border border-arcade-coral text-arcade-coral text-xs font-mono flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          {activeServers.length === 0 ? (
            <div className="pixel-card bg-deck-dark p-8 text-center text-arcade-muted font-mono text-xs border border-deck-border space-y-2">
              <Server className="w-8 h-8 mx-auto text-arcade-muted/50" />
              <p className="font-pixel text-[10px] text-slate-400">NO LOCAL SERVERS RUNNING</p>
              <p className="text-[11px]">Spawn an HTTPS or HTTP instance on any port to browse local files or host endpoints.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeServers.map((srv) => (
                <div
                  key={srv.port}
                  className="pixel-card bg-deck-dark border-2 border-arcade-emerald/60 p-4 space-y-4"
                >
                  {/* Server Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-deck-border pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-arcade-emerald rounded-none animate-pulse"></div>
                      <div>
                        <div className="font-pixel text-xs text-white">
                          PORT :{srv.port} // {srv.protocol.toUpperCase()}
                        </div>
                        <div className="text-[10px] text-arcade-muted font-mono mt-0.5">
                          Serving: <span className="text-arcade-paper">{srv.rootDir}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => showQRCode(srv.lanUrl)}
                        className="btn-pixel btn-pixel-surface px-2.5 py-1 text-[10px] font-mono flex items-center gap-1.5 text-arcade-cyan hover:border-arcade-cyan"
                        title="Show Mobile QR Code"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        MOBILE QR
                      </button>

                      <a
                        href={srv.localUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-pixel btn-pixel-emerald px-2.5 py-1 text-[10px] font-mono flex items-center gap-1.5"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        OPEN LOCAL
                      </a>

                      <button
                        onClick={() => handleStop(srv.port)}
                        className="btn-pixel btn-pixel-coral px-2.5 py-1 text-[10px] font-pixel flex items-center gap-1"
                      >
                        <Square className="w-3 h-3 fill-white" />
                        STOP
                      </button>
                    </div>
                  </div>

                  {/* Network Addresses */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                    <div className="p-2 bg-deck-bg border border-deck-border flex items-center justify-between">
                      <span className="text-arcade-muted">Local Address:</span>
                      <a href={srv.localUrl} target="_blank" rel="noopener noreferrer" className="text-arcade-emerald font-bold hover:underline">
                        {srv.localUrl}
                      </a>
                    </div>
                    <div className="p-2 bg-deck-bg border border-deck-border flex items-center justify-between">
                      <span className="text-arcade-muted">Mobile LAN Address:</span>
                      <a href={srv.lanUrl} target="_blank" rel="noopener noreferrer" className="text-arcade-cyan font-bold hover:underline">
                        {srv.lanUrl}
                      </a>
                    </div>
                  </div>

                  {/* Stats Counter */}
                  <div className="grid grid-cols-3 gap-2 text-[11px] font-mono">
                    <div className="p-2 bg-deck-bg border border-deck-border">
                      <div className="text-arcade-muted text-[10px]">TOTAL REQUESTS</div>
                      <div className="text-white font-bold">{srv.requestsCount}</div>
                    </div>
                    <div className="p-2 bg-deck-bg border border-deck-border">
                      <div className="text-arcade-muted text-[10px]">DATA TRANSFERRED</div>
                      <div className="text-arcade-amber font-bold">
                        {(srv.bytesTransferred / 1024).toFixed(1)} KB
                      </div>
                    </div>
                    <div className="p-2 bg-deck-bg border border-deck-border">
                      <div className="text-arcade-muted text-[10px]">UPLOADS & CORS</div>
                      <div className="text-arcade-emerald font-bold">
                        {srv.enableUploads ? 'UPLOAD ON' : 'READONLY'} | {srv.enableCORS ? 'CORS' : 'NO-CORS'}
                      </div>
                    </div>
                  </div>

                  {/* Live Request Logs */}
                  <div className="space-y-1.5">
                    <div className="text-[10px] font-pixel text-arcade-muted flex items-center justify-between">
                      <span>LIVE REQUEST INSPECTOR STREAM</span>
                      <span>{logs[srv.port]?.length || 0} LOGGED</span>
                    </div>
                    <div className="p-2 bg-deck-bg border border-deck-border h-24 overflow-y-auto font-mono text-[11px] space-y-1">
                      {logs[srv.port]?.length ? (
                        logs[srv.port].map((l, idx) => (
                          <div key={idx} className="flex items-center justify-between text-slate-300">
                            <span className="text-arcade-muted">[{l.timestamp}]</span>
                            <span className="text-arcade-emerald font-bold">{l.method}</span>
                            <span className="truncate max-w-xs">{l.url}</span>
                            <span className={l.status === 200 ? 'text-arcade-emerald' : 'text-arcade-coral'}>
                              {l.status}
                            </span>
                            <span className="text-arcade-muted">{l.latency}ms</span>
                          </div>
                        ))
                      ) : (
                        <div className="text-arcade-muted text-center pt-6">
                          Waiting for incoming HTTP/HTTPS requests...
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* QR Code Modal for Phone LAN Access */}
      {qrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="pixel-card bg-deck-surface border-2 border-arcade-cyan p-6 max-w-sm w-full space-y-4 text-center">
            <h4 className="font-pixel text-xs text-arcade-cyan uppercase">
              SCAN WITH PHONE CAMERA
            </h4>
            <p className="text-xs font-mono text-arcade-muted">
              Connect to your local Wi-Fi to browse or upload files instantly.
            </p>

            {qrDataUrl && (
              <div className="p-3 bg-white border-2 border-black inline-block mx-auto">
                <img src={qrDataUrl} alt="QR Code" className="w-52 h-52 mx-auto" />
              </div>
            )}

            <div className="p-2 bg-deck-dark border border-deck-border text-xs font-mono break-all text-white">
              {qrModal}
            </div>

            <button
              onClick={() => setQrModal(null)}
              className="btn-pixel btn-pixel-surface w-full py-2 font-pixel text-[10px]"
            >
              CLOSE
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

