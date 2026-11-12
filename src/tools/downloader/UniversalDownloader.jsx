import React, { useState, useEffect } from 'react';
import { 
  Download, Music, Video, Youtube, Twitter, Instagram, 
  Settings2, Play, CheckCircle2, AlertTriangle, RefreshCw, 
  Sparkles, ExternalLink, Scissors, Shield, List, Clock, FileAudio
} from 'lucide-react';
import { playClick, playSuccess, playError } from '../../audio/soundEffects';

export default function UniversalDownloader() {
  const [activeTab, setActiveTab] = useState('video'); // 'video' | 'spotify' | 'history'
  const [url, setUrl] = useState('');
  const [inspecting, setInspecting] = useState(false);
  const [mediaInfo, setMediaInfo] = useState(null);
  const [error, setError] = useState(null);

  // Download options
  const [quality, setQuality] = useState('max'); // 'max' | '1080p' | '720p' | '480p'
  const [format, setFormat] = useState('mp4'); // 'mp4' | 'mp3' | 'm4a' | 'flac' | 'wav'
  const [type, setType] = useState('video'); // 'video' | 'audio'
  const [customArgs, setCustomArgs] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [embedThumbnail, setEmbedThumbnail] = useState(true);
  const [embedSubs, setEmbedSubs] = useState(false);
  const [sponsorBlock, setSponsorBlock] = useState(false);

  // Active Job State
  const [currentJob, setCurrentJob] = useState(null);
  const [history, setHistory] = useState([]);

  // Spotify Search state
  const [spotifyQuery, setSpotifyQuery] = useState('');
  const [spotifySearching, setSpotifySearching] = useState(false);
  const [spotifyResults, setSpotifyResults] = useState([]);

  // Load history on mount
  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/downloader/history');
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch (e) {}
  };

  // Inspect Media URL
  const handleInspect = async (e) => {
    if (e) e.preventDefault();
    if (!url.trim()) return;

    setInspecting(true);
    setError(null);
    setMediaInfo(null);
    playClick();

    try {
      const res = await fetch('/api/downloader/inspect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || data.details || 'Failed to inspect URL');
      }

      setMediaInfo(data);
      playSuccess();
    } catch (err) {
      setError(err.message);
      playError();
    } finally {
      setInspecting(false);
    }
  };

  // Start Download
  const handleStartDownload = async () => {
    if (!url.trim()) return;
    setError(null);
    playClick();

    try {
      const res = await fetch('/api/downloader/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: url.trim(),
          type,
          quality,
          format,
          customArgs,
          startTime,
          endTime,
          embedThumbnail,
          embedSubs,
          sponsorBlock
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to start download');

      setCurrentJob({
        id: data.jobId,
        status: 'starting',
        progress: 0,
        speed: '',
        eta: ''
      });

      // Poll progress
      pollJobProgress(data.jobId);
    } catch (err) {
      setError(err.message);
      playError();
    }
  };

  const pollJobProgress = (jobId) => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/downloader/progress/${jobId}`);
        if (!res.ok) {
          clearInterval(interval);
          return;
        }
        const job = await res.json();
        setCurrentJob(job);

        if (job.status === 'completed') {
          clearInterval(interval);
          playSuccess();
          fetchHistory();
        } else if (job.status === 'failed') {
          clearInterval(interval);
          setError(job.error || 'Download failed');
          playError();
        }
      } catch (err) {
        clearInterval(interval);
      }
    }, 1000);
  };

  // Spotify Search
  const handleSpotifySearch = async (e) => {
    if (e) e.preventDefault();
    if (!spotifyQuery.trim()) return;

    setSpotifySearching(true);
    setError(null);
    playClick();

    try {
      const res = await fetch('/api/downloader/spotify-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: spotifyQuery.trim() })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Search failed');

      setSpotifyResults(data.results || []);
      playSuccess();
    } catch (err) {
      setError(err.message);
      playError();
    } finally {
      setSpotifySearching(false);
    }
  };

  const downloadDirectAudio = (targetUrl, title) => {
    setUrl(targetUrl);
    setType('audio');
    setFormat('mp3');
    setActiveTab('video');
    setTimeout(() => {
      handleInspect();
    }, 100);
  };

  return (
    <div className="space-y-6">
      {/* Top Mode Selector */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-deck-border pb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => { playClick(); setActiveTab('video'); }}
            className={`btn-pixel px-4 py-2 font-pixel text-[10px] flex items-center gap-2 ${
              activeTab === 'video' ? 'btn-pixel-emerald' : 'btn-pixel-surface'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            UNIVERSAL DOWNLOADER
          </button>

          <button
            onClick={() => { playClick(); setActiveTab('spotify'); }}
            className={`btn-pixel px-4 py-2 font-pixel text-[10px] flex items-center gap-2 ${
              activeTab === 'spotify' ? 'btn-pixel-emerald' : 'btn-pixel-surface'
            }`}
          >
            <Music className="w-3.5 h-3.5" />
            SPOTIFY & MUSIC STREAM
          </button>

          <button
            onClick={() => { playClick(); setActiveTab('history'); }}
            className={`btn-pixel px-4 py-2 font-pixel text-[10px] flex items-center gap-2 ${
              activeTab === 'history' ? 'btn-pixel-amber' : 'btn-pixel-surface'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            ARCHIVE ({history.length})
          </button>
        </div>

        {/* Supported badges */}
        <div className="hidden sm:flex items-center gap-2 text-[10px] font-mono text-arcade-muted">
          <span>SUPPORTS:</span>
          <span className="text-arcade-coral">YouTube</span>
          <span>•</span>
          <span className="text-arcade-cyan">Twitter/X</span>
          <span>•</span>
          <span className="text-arcade-violet">Instagram</span>
          <span>•</span>
          <span className="text-arcade-emerald">Spotify</span>
          <span>•</span>
          <span className="text-arcade-amber">1000+ Sites</span>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-950/60 border-2 border-arcade-coral text-arcade-coral flex items-center gap-3 text-xs font-mono">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <div className="flex-1">{error}</div>
          <button onClick={() => setError(null)} className="text-xs font-bold px-2 py-0.5 border border-arcade-coral">
            DISMISS
          </button>
        </div>
      )}

      {/* TAB 1: UNIVERSAL DOWNLOADER (Seal Style) */}
      {activeTab === 'video' && (
        <div className="space-y-6">
          {/* URL Input Box & Presets */}
          <form onSubmit={handleInspect} className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="block text-xs font-pixel text-arcade-emerald">
                TARGET MEDIA URL // YOUTUBE, INSTAGRAM, X, REDDIT, TIKTOK
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      const text = await navigator.clipboard.readText();
                      if (text) {
                        setUrl(text);
                        playClick();
                      }
                    } catch (e) {}
                  }}
                  className="px-2 py-1 text-[9px] font-pixel border border-arcade-cyan text-arcade-cyan hover:bg-arcade-cyan hover:text-black transition-colors"
                >
                  PASTE CLIPBOARD
                </button>
                {url && (
                  <button
                    type="button"
                    onClick={() => { setUrl(''); setMediaInfo(null); playClick(); }}
                    className="px-2 py-1 text-[9px] font-pixel border border-arcade-coral text-arcade-coral hover:bg-arcade-coral hover:text-white transition-colors"
                  >
                    CLEAR
                  </button>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=... or https://x.com/... or https://instagram.com/reel/..."
                className="flex-1 bg-deck-bg border-2 border-deck-border focus:border-arcade-emerald p-3 font-mono text-xs text-white placeholder:text-arcade-muted/60 focus:outline-none"
              />
              <button
                type="submit"
                disabled={inspecting || !url}
                className="btn-pixel btn-pixel-emerald px-6 py-3 font-pixel text-[10px] flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {inspecting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    INSPECTING...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    INSPECT URL
                  </>
                )}
              </button>
            </div>

            {/* Quick Presets */}
            <div className="flex items-center gap-2 flex-wrap pt-1">
              <span className="text-[10px] font-mono text-arcade-muted">QUICK PRESETS:</span>
              <button
                type="button"
                onClick={() => { setType('video'); setFormat('mp4'); setQuality('max'); playClick(); }}
                className={`px-2 py-1 font-pixel text-[8px] border ${
                  type === 'video' && format === 'mp4' && quality === 'max'
                    ? 'bg-arcade-emerald text-black border-black font-bold'
                    : 'bg-deck-bg border-deck-border text-arcade-muted'
                }`}
              >
                4K MAX VIDEO (MP4)
              </button>
              <button
                type="button"
                onClick={() => { setType('video'); setFormat('mp4'); setQuality('1080p'); playClick(); }}
                className={`px-2 py-1 font-pixel text-[8px] border ${
                  type === 'video' && format === 'mp4' && quality === '1080p'
                    ? 'bg-arcade-emerald text-black border-black font-bold'
                    : 'bg-deck-bg border-deck-border text-arcade-muted'
                }`}
              >
                1080P HD (MP4)
              </button>
              <button
                type="button"
                onClick={() => { setType('audio'); setFormat('mp3'); playClick(); }}
                className={`px-2 py-1 font-pixel text-[8px] border ${
                  type === 'audio' && format === 'mp3'
                    ? 'bg-arcade-amber text-black border-black font-bold'
                    : 'bg-deck-bg border-deck-border text-arcade-muted'
                }`}
              >
                320KBPS AUDIO (MP3)
              </button>
              <button
                type="button"
                onClick={() => { setType('audio'); setFormat('wav'); playClick(); }}
                className={`px-2 py-1 font-pixel text-[8px] border ${
                  type === 'audio' && format === 'wav'
                    ? 'bg-arcade-cyan text-black border-black font-bold'
                    : 'bg-deck-bg border-deck-border text-arcade-muted'
                }`}
              >
                LOSSLESS AUDIO (WAV)
              </button>
            </div>
          </form>

          {/* Media Info Card (if inspected) */}
          {mediaInfo && (
            <div className="pixel-card bg-deck-dark border-2 border-arcade-emerald/60 p-4 space-y-4">
              <div className="flex flex-col md:flex-row gap-4 items-start">
                {mediaInfo.thumbnail && (
                  <img
                    src={mediaInfo.thumbnail}
                    alt={mediaInfo.title}
                    className="w-full md:w-56 aspect-video object-cover border-2 border-deck-border"
                  />
                )}
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-pixel text-[8px] bg-arcade-emerald text-black px-1.5 py-0.5 font-bold">
                      {mediaInfo.is_playlist ? `PLAYLIST (${mediaInfo.playlist_count} ITEMS)` : 'VIDEO DETECTED'}
                    </span>
                    <span className="text-[10px] text-arcade-muted font-mono">
                      BY: {mediaInfo.uploader}
                    </span>
                    {mediaInfo.duration && (
                      <span className="text-[10px] text-arcade-amber font-mono">
                        {Math.floor(mediaInfo.duration / 60)}m {mediaInfo.duration % 60}s
                      </span>
                    )}
                  </div>
                  <h3 className="font-pixel text-sm text-white leading-snug">
                    {mediaInfo.title}
                  </h3>
                  {mediaInfo.description && (
                    <p className="text-xs text-arcade-muted line-clamp-2 font-mono">
                      {mediaInfo.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Configuration Panel (Seal QoL Options) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Download Mode & Quality */}
            <div className="pixel-card bg-deck-dark p-4 space-y-4 border border-deck-border">
              <div className="font-pixel text-[10px] text-arcade-cyan flex items-center gap-2 border-b border-deck-border pb-2">
                <Settings2 className="w-4 h-4 text-arcade-cyan" />
                FORMAT & QUALITY PROFILES
              </div>

              {/* Mode Switch (Video vs Audio) */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => { setType('video'); setFormat('mp4'); }}
                  className={`flex-1 py-2 font-pixel text-[9px] border flex items-center justify-center gap-2 ${
                    type === 'video'
                      ? 'bg-arcade-emerald text-black border-black font-bold'
                      : 'bg-deck-bg text-arcade-muted border-deck-border hover:text-white'
                  }`}
                >
                  <Video className="w-3.5 h-3.5" />
                  VIDEO + AUDIO
                </button>
                <button
                  type="button"
                  onClick={() => { setType('audio'); setFormat('mp3'); }}
                  className={`flex-1 py-2 font-pixel text-[9px] border flex items-center justify-center gap-2 ${
                    type === 'audio'
                      ? 'bg-arcade-emerald text-black border-black font-bold'
                      : 'bg-deck-bg text-arcade-muted border-deck-border hover:text-white'
                  }`}
                >
                  <FileAudio className="w-3.5 h-3.5" />
                  AUDIO ONLY
                </button>
              </div>

              {/* Quality Picker */}
              {type === 'video' ? (
                <div className="space-y-1">
                  <label className="text-[11px] text-arcade-muted">Maximum Resolution</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { id: 'max', label: 'MAX (4K/8K)' },
                      { id: '1080p', label: '1080p FHD' },
                      { id: '720p', label: '720p HD' },
                      { id: '480p', label: '480p SD' }
                    ].map(q => (
                      <button
                        key={q.id}
                        type="button"
                        onClick={() => setQuality(q.id)}
                        className={`p-2 font-pixel text-[8px] text-center border ${
                          quality === q.id
                            ? 'bg-deck-surface border-arcade-cyan text-arcade-cyan'
                            : 'bg-deck-bg border-deck-border text-arcade-muted hover:text-white'
                        }`}
                      >
                        {q.label}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  <label className="text-[11px] text-arcade-muted">Audio Container / Codec</label>
                  <div className="grid grid-cols-5 gap-2">
                    {['mp3', 'm4a', 'flac', 'wav', 'opus'].map(fmt => (
                      <button
                        key={fmt}
                        type="button"
                        onClick={() => setFormat(fmt)}
                        className={`p-2 font-pixel text-[9px] uppercase text-center border ${
                          format === fmt
                            ? 'bg-deck-surface border-arcade-amber text-arcade-amber'
                            : 'bg-deck-bg border-deck-border text-arcade-muted hover:text-white'
                        }`}
                      >
                        {fmt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Clip Trimmer (Start & End Time) */}
              <div className="space-y-1 pt-2 border-t border-deck-border/60">
                <label className="text-[11px] text-arcade-muted flex items-center gap-1.5">
                  <Scissors className="w-3.5 h-3.5 text-arcade-amber" />
                  Clip Trimmer (Optional: mm:ss or hh:mm:ss)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    placeholder="Start (e.g. 00:30)"
                    className="bg-deck-bg border border-deck-border p-2 font-mono text-xs text-white placeholder:text-arcade-muted/40"
                  />
                  <input
                    type="text"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    placeholder="End (e.g. 02:45)"
                    className="bg-deck-bg border border-deck-border p-2 font-mono text-xs text-white placeholder:text-arcade-muted/40"
                  />
                </div>
              </div>
            </div>

            {/* Seal Advanced Features */}
            <div className="pixel-card bg-deck-dark p-4 space-y-4 border border-deck-border">
              <div className="font-pixel text-[10px] text-arcade-amber flex items-center gap-2 border-b border-deck-border pb-2">
                <Shield className="w-4 h-4 text-arcade-amber" />
                SEAL ADVANCED INJECTIONS
              </div>

              {/* Toggles */}
              <div className="space-y-2.5">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={embedThumbnail}
                    onChange={(e) => setEmbedThumbnail(e.target.checked)}
                    className="w-4 h-4 rounded-none accent-arcade-emerald bg-deck-bg border-deck-border"
                  />
                  <span className="text-xs text-slate-300 group-hover:text-white font-mono">
                    Embed Cover Art / Thumbnail into file tags
                  </span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={embedSubs}
                    onChange={(e) => setEmbedSubs(e.target.checked)}
                    className="w-4 h-4 rounded-none accent-arcade-emerald bg-deck-bg border-deck-border"
                  />
                  <span className="text-xs text-slate-300 group-hover:text-white font-mono">
                    Download and embed all subtitles (.srt / .vtt)
                  </span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={sponsorBlock}
                    onChange={(e) => setSponsorBlock(e.target.checked)}
                    className="w-4 h-4 rounded-none accent-arcade-emerald bg-deck-bg border-deck-border"
                  />
                  <span className="text-xs text-slate-300 group-hover:text-white font-mono">
                    SponsorBlock: Automatically remove sponsor segments
                  </span>
                </label>
              </div>

              {/* Custom yt-dlp arguments */}
              <div className="space-y-1 pt-2 border-t border-deck-border/60">
                <label className="text-[11px] text-arcade-muted flex items-center justify-between">
                  <span>Custom yt-dlp Flags</span>
                  <span className="text-[9px] text-arcade-cyan font-pixel">EXPERT</span>
                </label>
                <input
                  type="text"
                  value={customArgs}
                  onChange={(e) => setCustomArgs(e.target.value)}
                  placeholder="e.g. --no-playlist --geo-bypass --retries 5"
                  className="w-full bg-deck-bg border border-deck-border p-2 font-mono text-xs text-white placeholder:text-arcade-muted/40"
                />
              </div>

              {/* Download Action Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleStartDownload}
                  disabled={!url || (currentJob && currentJob.status === 'downloading')}
                  className="btn-pixel btn-pixel-emerald w-full py-3.5 font-pixel text-xs flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  INITIATE DOWNLOAD
                </button>
              </div>
            </div>
          </div>

          {/* Active Job Progress Deck */}
          {currentJob && (
            <div className="pixel-card bg-deck-dark border-2 border-arcade-cyan p-4 space-y-3">
              <div className="flex items-center justify-between text-xs font-pixel">
                <span className="text-arcade-cyan flex items-center gap-2">
                  <span className="w-2 h-2 bg-arcade-cyan animate-ping inline-block"></span>
                  DOWNLOAD STATUS: {currentJob.status.toUpperCase()}
                </span>
                <span className="text-white">{currentJob.progress}%</span>
              </div>

              {/* Retro Progress Bar */}
              <div className="w-full h-4 bg-deck-bg border border-deck-border p-0.5">
                <div
                  className="h-full bg-arcade-emerald transition-all duration-300"
                  style={{ width: `${currentJob.progress}%` }}
                ></div>
              </div>

              <div className="flex items-center justify-between text-xs font-mono text-arcade-muted">
                <div>SPEED: {currentJob.speed || 'Calculating...'}</div>
                <div>ETA: {currentJob.eta || '--:--'}</div>
              </div>

              {currentJob.status === 'completed' && (
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 bg-deck-bg p-3 border border-arcade-emerald">
                  <div className="flex items-center gap-2 text-arcade-emerald font-pixel text-[10px]">
                    <CheckCircle2 className="w-4 h-4" />
                    FILE READY: {currentJob.filename}
                  </div>
                  <a
                    href={`/api/downloader/stream/${currentJob.id}`}
                    download
                    className="btn-pixel btn-pixel-emerald px-4 py-2 font-pixel text-[9px] flex items-center gap-2"
                  >
                    <Download className="w-3.5 h-3.5" />
                    SAVE TO DISK
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: SPOTIFY & MUSIC STREAM RESOLVER */}
      {activeTab === 'spotify' && (
        <div className="space-y-6">
          <form onSubmit={handleSpotifySearch} className="space-y-3">
            <label className="block text-xs font-pixel text-arcade-emerald">
              SPOTIFY TRACK / PLAYLIST URL OR SEARCH QUERY
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={spotifyQuery}
                onChange={(e) => setSpotifyQuery(e.target.value)}
                placeholder="https://open.spotify.com/track/... or Artist - Song Title"
                className="flex-1 bg-deck-bg border-2 border-deck-border focus:border-arcade-emerald p-3 font-mono text-xs text-white placeholder:text-arcade-muted/60 focus:outline-none"
              />
              <button
                type="submit"
                disabled={spotifySearching || !spotifyQuery}
                className="btn-pixel btn-pixel-emerald px-6 py-3 font-pixel text-[10px] flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {spotifySearching ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    SEARCHING...
                  </>
                ) : (
                  <>
                    <Music className="w-4 h-4" />
                    SEARCH MUSIC
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Results List */}
          {spotifyResults.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-pixel text-xs text-arcade-amber">MATCHED HIGH-FIDELITY AUDIO STREAMS</h3>
              <div className="grid grid-cols-1 gap-2">
                {spotifyResults.map(item => (
                  <div
                    key={item.id}
                    className="p-3 bg-deck-dark border border-deck-border flex items-center justify-between gap-4 hover:border-arcade-emerald transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {item.thumbnail ? (
                        <img src={item.thumbnail} alt="" className="w-12 h-12 object-cover border border-deck-border shrink-0" />
                      ) : (
                        <div className="w-12 h-12 bg-deck-surface flex items-center justify-center border border-deck-border shrink-0">
                          <Music className="w-6 h-6 text-arcade-emerald" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="text-white text-xs font-bold truncate">{item.title}</div>
                        <div className="text-[11px] text-arcade-muted">{item.uploader} {item.duration ? `• ${Math.floor(item.duration / 60)}m ${item.duration % 60}s` : ''}</div>
                      </div>
                    </div>

                    <button
                      onClick={() => downloadDirectAudio(item.url, item.title)}
                      className="btn-pixel btn-pixel-emerald px-3 py-1.5 font-pixel text-[8px] flex items-center gap-1.5 shrink-0"
                    >
                      <Download className="w-3 h-3" />
                      DOWNLOAD MP3
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: HISTORY & ARCHIVE */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-deck-border pb-2">
            <h3 className="font-pixel text-xs text-arcade-amber">DOWNLOAD ARCHIVE // LOCAL CACHE</h3>
            <button
              onClick={fetchHistory}
              className="text-[10px] font-mono text-arcade-cyan hover:underline flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" /> REFRESH
            </button>
          </div>

          {history.length === 0 ? (
            <div className="p-8 text-center text-arcade-muted font-mono text-xs">
              No previous downloads recorded in this session.
            </div>
          ) : (
            <div className="space-y-2">
              {history.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-deck-dark border border-deck-border flex items-center justify-between gap-3 text-xs font-mono"
                >
                  <div className="min-w-0">
                    <div className="text-white font-bold truncate">{item.filename}</div>
                    <div className="text-[10px] text-arcade-muted">
                      {new Date(item.completedAt).toLocaleString()} • {item.type.toUpperCase()} ({item.format})
                    </div>
                  </div>

                  <a
                    href={`/api/downloader/stream/${item.id}`}
                    download
                    className="btn-pixel btn-pixel-surface px-3 py-1 font-pixel text-[8px] text-arcade-emerald hover:border-arcade-emerald shrink-0"
                  >
                    GET FILE
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

