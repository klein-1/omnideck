import React, { useState, useEffect } from 'react';
import { 
  Download, Music, Video, Youtube, Twitter, Instagram, 
  Settings2, Play, CheckCircle2, AlertTriangle, RefreshCw, 
  Sparkles, ExternalLink, Scissors, Shield, List, Clock, FileAudio,
  Cpu, Cloud, Check, Copy
} from 'lucide-react';
import { playClick, playSuccess, playError, playCoin } from '../../audio/soundEffects';

export default function UniversalDownloader() {
  const [activeTab, setActiveTab] = useState('video'); // 'video' | 'spotify' | 'history'
  const [url, setUrl] = useState('');
  const [inspecting, setInspecting] = useState(false);
  const [mediaInfo, setMediaInfo] = useState(null);
  const [error, setError] = useState(null);

  // Engine status
  const [engineStatus, setEngineStatus] = useState({ online: true, isCloud: false, hasYtDlp: false });

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
  const [copiedLink, setCopiedLink] = useState(false);
  const [downloadingFile, setDownloadingFile] = useState(false);

  // Spotify Search state
  const [spotifyQuery, setSpotifyQuery] = useState('');
  const [spotifySearching, setSpotifySearching] = useState(false);
  const [spotifyResults, setSpotifyResults] = useState([]);

  // Check engine & load history on mount
  useEffect(() => {
    checkEngineStatus();
    fetchHistory();
  }, []);

  const checkEngineStatus = async () => {
    try {
      const res = await fetch('/api/downloader/status');
      if (res.ok) {
        const data = await res.json();
        setEngineStatus(data);
      } else {
        setEngineStatus({ online: true, isCloud: true, hasYtDlp: false });
      }
    } catch {
      setEngineStatus({ online: true, isCloud: true, hasYtDlp: false });
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/downloader/history');
      if (res.ok) {
        const data = await res.json();
        const serverHist = Array.isArray(data) ? data : [];
        const localHist = JSON.parse(localStorage.getItem('omnideck_dl_history') || '[]');
        const merged = [...serverHist, ...localHist].filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);
        setHistory(merged);
      } else {
        const localHist = JSON.parse(localStorage.getItem('omnideck_dl_history') || '[]');
        setHistory(localHist);
      }
    } catch {
      const localHist = JSON.parse(localStorage.getItem('omnideck_dl_history') || '[]');
      setHistory(localHist);
    }
  };

  const saveToLocalHistory = (item) => {
    try {
      const localHist = JSON.parse(localStorage.getItem('omnideck_dl_history') || '[]');
      const updated = [item, ...localHist.filter(h => h.id !== item.id)].slice(0, 30);
      localStorage.setItem('omnideck_dl_history', JSON.stringify(updated));
      setHistory(updated);
    } catch {}
  };

  // Inspect Media URL
  const handleInspect = async (e) => {
    if (e) e.preventDefault();
    if (!url.trim()) return;

    setInspecting(true);
    setError(null);
    setMediaInfo(null);
    playClick();

    const cleanUrl = url.trim();

    try {
      // 1. Try server endpoint
      const res = await fetch('/api/downloader/inspect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: cleanUrl })
      });

      if (res.ok) {
        const data = await res.json();
        if (data && data.title) {
          setMediaInfo(data);
          playSuccess();
          setInspecting(false);
          return;
        }
      }

      // 2. Client-side fallback for YouTube if backend inspection failed or is in cloud mode
      const ytMatch = cleanUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?.*v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/i);
      if (ytMatch) {
        const videoId = ytMatch[1];
        try {
          const oembedRes = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
          if (oembedRes.ok) {
            const oembed = await oembedRes.json();
            setMediaInfo({
              id: videoId,
              title: oembed.title || 'YouTube Video',
              thumbnail: oembed.thumbnail_url || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
              uploader: oembed.author_name || 'YouTube Creator',
              duration: null,
              formats: [
                { format_id: 'max', ext: 'mp4', resolution: '1080p FHD', note: 'Standard Video' },
                { format_id: '720p', ext: 'mp4', resolution: '720p HD', note: 'HD Video' },
                { format_id: 'mp3', ext: 'mp3', resolution: 'audio only', note: '320kbps MP3 Audio' }
              ],
              isClientFallback: true
            });
            playSuccess();
            setInspecting(false);
            return;
          }
        } catch {}

        // Immediate offline YouTube stub
        setMediaInfo({
          id: videoId,
          title: `YouTube Video (${videoId})`,
          thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
          uploader: 'YouTube Stream',
          duration: null,
          formats: [
            { format_id: 'max', ext: 'mp4', resolution: '1080p FHD', note: 'Standard Video' },
            { format_id: 'mp3', ext: 'mp3', resolution: 'audio only', note: 'MP3 Audio' }
          ]
        });
        playSuccess();
        setInspecting(false);
        return;
      }

      // Generic URL fallback
      setMediaInfo({
        id: 'media_' + Date.now(),
        title: cleanUrl.split('/').pop().split('?')[0] || 'Media Stream',
        thumbnail: '',
        uploader: 'Web Host',
        formats: [{ format_id: 'max', ext: 'mp4', resolution: 'Direct Stream', note: 'Source' }]
      });
      playSuccess();
    } catch (err) {
      setError(err.message || 'Inspection failed');
      playError();
    } finally {
      setInspecting(false);
    }
  };

  // Start Download directly via backend engine
  const handleStartDownload = async (overrideUrl = null, overrideType = null, overrideFormat = null, overrideQuality = null) => {
    const targetUrl = (overrideUrl || url || '').trim();
    if (!targetUrl) return;
    setError(null);
    playClick();

    const targetType = overrideType || type;
    const targetFormat = overrideFormat || format;
    const targetQuality = overrideQuality || quality;

    if (overrideUrl) setUrl(targetUrl);
    if (overrideType) setType(targetType);
    if (overrideFormat) setFormat(targetFormat);
    if (overrideQuality) setQuality(targetQuality);

    const cleanTitle = (mediaInfo?.title || 'download').replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 50);

    try {
      const res = await fetch('/api/downloader/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: targetUrl,
          type: targetType,
          quality: targetQuality,
          format: targetFormat,
          title: cleanTitle,
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

      // If serverless cloud instant stream
      if (data.status === 'completed' || data.isCloud) {
        const completedJob = {
          id: data.jobId,
          status: 'completed',
          progress: 100,
          speed: 'Direct Cloud Stream',
          eta: '00:00',
          filename: data.filename || `${cleanTitle}.${targetFormat || 'mp4'}`,
          streamUrl: data.streamUrl || `/api/downloader/stream/${data.jobId}`
        };
        setCurrentJob(completedJob);
        saveToLocalHistory({
          id: completedJob.id,
          filename: completedJob.filename,
          type: targetType,
          format: targetFormat,
          completedAt: new Date().toISOString()
        });
        playSuccess();
        triggerFileDownload(data.jobId, completedJob.filename, completedJob.streamUrl);
        return;
      }

      // Local background worker running
      setCurrentJob({
        id: data.jobId,
        status: data.status || 'starting',
        progress: 0,
        speed: 'Connecting...',
        eta: '--:--',
        filename: data.filename || `${cleanTitle}.${targetFormat || 'mp4'}`,
        streamUrl: data.streamUrl || `/api/downloader/stream/${data.jobId}`
      });

      // Poll progress safely
      pollJobProgress(data.jobId);
    } catch (err) {
      setError(err.message || 'Download process encountered an error. Ensure local server is online.');
      playError();
    }
  };

  const triggerFileDownload = async (jobId, targetFilename, explicitStreamUrl = null) => {
    if (!jobId && !explicitStreamUrl) return;
    setDownloadingFile(true);
    playClick();

    const cleanFilename = (targetFilename || 'downloaded_media').replace(new RegExp(`^${jobId}_`), '');
    const streamEndpoint = explicitStreamUrl || `/api/downloader/stream/${jobId}`;

    try {
      // 1. Fetch blob with direct browser progress
      const streamRes = await fetch(streamEndpoint);
      if (!streamRes.ok) throw new Error(`Stream HTTP ${streamRes.status}`);

      const blob = await streamRes.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = cleanFilename;
      document.body.appendChild(link);
      link.click();

      setTimeout(() => {
        window.URL.revokeObjectURL(blobUrl);
        link.remove();
        setDownloadingFile(false);
      }, 2500);
      playSuccess();
    } catch (err) {
      console.warn('Direct blob save fallback to direct navigation:', err);
      setDownloadingFile(false);
      // 2. Direct browser navigation fallback
      window.location.href = streamEndpoint;
    }
  };

  const pollJobProgress = (jobId) => {
    if (!jobId) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/downloader/progress/${jobId}`);
        if (!res.ok) {
          clearInterval(interval);
          return;
        }
        const job = await res.json();
        if (job && typeof job === 'object') {
          setCurrentJob(prev => ({
            ...prev,
            ...job,
            status: job.status || prev?.status || 'starting',
            progress: job.progress ?? prev?.progress ?? 0
          }));

          if (job.status === 'completed') {
            clearInterval(interval);
            playSuccess();
            fetchHistory();
            // Automatically trigger native file save
            triggerFileDownload(job.id, job.filename, job.streamUrl);
          } else if (job.status === 'failed') {
            clearInterval(interval);
            setError(job.error || 'Download process encountered an error');
            playError();
          }
        }
      } catch {
        clearInterval(interval);
      }
    }, 800);
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
    } catch {
      // Client-side fallback via iTunes search API
      try {
        const itunesUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(spotifyQuery.trim())}&media=music&limit=8`;
        const itunesRes = await fetch(itunesUrl);
        if (itunesRes.ok) {
          const data = await itunesRes.json();
          const results = (data.results || []).map(r => ({
            id: String(r.trackId),
            title: r.trackName,
            uploader: r.artistName,
            duration: Math.round(r.trackTimeMillis / 1000) || null,
            thumbnail: r.artworkUrl100 ? r.artworkUrl100.replace('100x100bb', '600x600bb') : '',
            url: `https://www.youtube.com/results?search_query=${encodeURIComponent(r.artistName + ' ' + r.trackName)}`,
            previewUrl: r.previewUrl
          }));
          setSpotifyResults(results);
          playSuccess();
          return;
        }
      } catch (clientErr) {
        setError(clientErr.message || 'Search failed');
        playError();
      }
    } finally {
      setSpotifySearching(false);
    }
  };

  const downloadDirectAudio = (targetUrl, title) => {
    if (!targetUrl) return;
    setUrl(targetUrl);
    setType('audio');
    setFormat('mp3');
    setActiveTab('video');
    // Start direct MP3 download job immediately
    handleStartDownload(targetUrl, 'audio', 'mp3', 'max');
  };

  const copyToClipboard = (txt) => {
    navigator.clipboard.writeText(txt);
    setCopiedLink(true);
    playClick();
    setTimeout(() => setCopiedLink(false), 1500);
  };

  return (
    <div className="space-y-6">
      {/* Top Mode Selector - Scrollable with visible scrollbar on phone */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-deck-border pb-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1.5 max-w-full touch-scroll scrollbar-thin">
          <button
            onClick={() => { playClick(); setActiveTab('video'); }}
            className={`btn-pixel px-3 sm:px-4 py-2 font-pixel text-[9px] sm:text-[10px] flex items-center gap-2 shrink-0 ${
              activeTab === 'video' ? 'btn-pixel-coral' : 'btn-pixel-surface'
            }`}
          >
            <Video className="w-3.5 h-3.5 shrink-0" />
            UNIVERSAL DOWNLOADER
          </button>

          <button
            onClick={() => { playClick(); setActiveTab('spotify'); }}
            className={`btn-pixel px-3 sm:px-4 py-2 font-pixel text-[9px] sm:text-[10px] flex items-center gap-2 shrink-0 ${
              activeTab === 'spotify' ? 'btn-pixel-emerald' : 'btn-pixel-surface'
            }`}
          >
            <Music className="w-3.5 h-3.5 shrink-0" />
            SPOTIFY & MUSIC STREAM
          </button>

          <button
            onClick={() => { playClick(); setActiveTab('history'); }}
            className={`btn-pixel px-3 sm:px-4 py-2 font-pixel text-[9px] sm:text-[10px] flex items-center gap-2 shrink-0 ${
              activeTab === 'history' ? 'btn-pixel-amber' : 'btn-pixel-surface'
            }`}
          >
            <Clock className="w-3.5 h-3.5 shrink-0" />
            ARCHIVE ({Array.isArray(history) ? history.length : 0})
          </button>
        </div>

        {/* Engine Status Badge */}
        <div className="flex items-center gap-2 text-[10px] font-mono">
          {engineStatus.hasYtDlp ? (
            <span className="flex items-center gap-1.5 text-arcade-emerald border border-arcade-emerald/40 px-2 py-0.5 bg-emerald-950/20">
              <span className="w-2 h-2 rounded-full bg-arcade-emerald animate-pulse"></span>
              DESKTOP 4K ENGINE: YT-DLP ONLINE
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-arcade-cyan border border-arcade-cyan/40 px-2 py-0.5 bg-cyan-950/20">
              <Cloud className="w-3 h-3 text-arcade-cyan" />
              DIRECT WEB STREAM RESOLVER
            </span>
          )}
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

      {/* TAB 1: UNIVERSAL DOWNLOADER */}
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
                    } catch {}
                  }}
                  className="px-2 py-1 text-[9px] font-pixel border border-arcade-cyan text-arcade-cyan hover:bg-arcade-cyan hover:text-black transition-colors"
                >
                  PASTE CLIPBOARD
                </button>
                {url && (
                  <button
                    type="button"
                    onClick={() => { setUrl(''); setMediaInfo(null); setCurrentJob(null); playClick(); }}
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
                disabled={inspecting || !url.trim()}
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
                className={`px-2.5 py-1 font-pixel text-[8px] border transition-all ${
                  type === 'video' && format === 'mp4' && quality === 'max'
                    ? 'bg-purple-500 text-white border-black font-bold shadow-pixel-sm'
                    : 'bg-deck-bg border-deck-border text-purple-400 hover:border-purple-400'
                }`}
              >
                4K MAX VIDEO (MP4)
              </button>
              <button
                type="button"
                onClick={() => { setType('video'); setFormat('mp4'); setQuality('1080p'); playClick(); }}
                className={`px-2.5 py-1 font-pixel text-[8px] border transition-all ${
                  type === 'video' && format === 'mp4' && quality === '1080p'
                    ? 'bg-cyan-400 text-black border-black font-bold shadow-pixel-sm'
                    : 'bg-deck-bg border-deck-border text-cyan-400 hover:border-cyan-400'
                }`}
              >
                1080P HD (MP4)
              </button>
              <button
                type="button"
                onClick={() => { setType('audio'); setFormat('mp3'); playClick(); }}
                className={`px-2.5 py-1 font-pixel text-[8px] border transition-all ${
                  type === 'audio' && format === 'mp3'
                    ? 'bg-amber-400 text-black border-black font-bold shadow-pixel-sm'
                    : 'bg-deck-bg border-deck-border text-amber-400 hover:border-amber-400'
                }`}
              >
                320KBPS AUDIO (MP3)
              </button>
              <button
                type="button"
                onClick={() => { setType('audio'); setFormat('wav'); playClick(); }}
                className={`px-2.5 py-1 font-pixel text-[8px] border transition-all ${
                  type === 'audio' && format === 'wav'
                    ? 'bg-emerald-400 text-black border-black font-bold shadow-pixel-sm'
                    : 'bg-deck-bg border-deck-border text-emerald-400 hover:border-emerald-400'
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
                      {mediaInfo.is_playlist ? `PLAYLIST (${mediaInfo.playlist_count} ITEMS)` : 'MEDIA IDENTIFIED'}
                    </span>
                    <span className="text-[10px] text-arcade-muted font-mono">
                      BY: {mediaInfo.uploader || 'Creator'}
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

                  {/* Direct One-Click Actions */}
                  <div className="pt-2 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleStartDownload(url, 'video', 'mp4', 'max')}
                      className="btn-pixel btn-pixel-cyan px-3 py-1.5 font-pixel text-[9px] flex items-center gap-1.5"
                    >
                      <Video className="w-3.5 h-3.5" />
                      DIRECT 1080P/4K MP4
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStartDownload(url, 'audio', 'mp3', 'max')}
                      className="btn-pixel btn-pixel-amber px-3 py-1.5 font-pixel text-[9px] flex items-center gap-1.5"
                    >
                      <Music className="w-3.5 h-3.5" />
                      EXTRACT 320KBPS MP3
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Configuration Panel */}
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
                            ? 'bg-deck-surface border-arcade-cyan text-arcade-cyan font-bold'
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
                            ? 'bg-deck-surface border-arcade-amber text-arcade-amber font-bold'
                            : 'bg-deck-bg border-deck-border text-arcade-muted hover:text-white'
                        }`}
                      >
                        {fmt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Clip Trimmer */}
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
                  disabled={!url.trim() || (currentJob && (currentJob.status === 'downloading' || currentJob.status === 'starting'))}
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
                  DOWNLOAD STATUS: {(currentJob?.status || 'STARTING').toUpperCase()}
                </span>
                <span className="text-white">{currentJob?.progress ?? 100}%</span>
              </div>

              {/* Retro Progress Bar */}
              <div className="w-full h-4 bg-deck-bg border border-deck-border p-0.5">
                <div
                  className="h-full bg-arcade-emerald transition-all duration-300"
                  style={{ width: `${currentJob?.progress ?? 100}%` }}
                ></div>
              </div>

              <div className="flex items-center justify-between text-xs font-mono text-arcade-muted">
                <div>SPEED: {currentJob?.speed || 'High-Speed Stream'}</div>
                <div>ETA: {currentJob?.eta || '00:00'}</div>
              </div>

              {currentJob?.status === 'completed' && (
                <div className="pt-3 border-t border-deck-border space-y-3">
                  <div className="flex items-center gap-2 text-arcade-emerald font-pixel text-xs">
                    <CheckCircle2 className="w-4 h-4" />
                    MEDIA READY: {(currentJob?.filename || 'downloaded_media').replace(new RegExp(`^${currentJob?.id}_`), '')}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {/* Direct file download button */}
                    {currentJob.id && (
                      <button
                        type="button"
                        onClick={() => triggerFileDownload(currentJob.id, currentJob.filename, currentJob.streamUrl)}
                        disabled={downloadingFile}
                        className="btn-pixel btn-pixel-emerald px-5 py-2.5 font-pixel text-[10px] flex items-center gap-2 shadow-lg"
                      >
                        <Download className="w-4 h-4" />
                        {downloadingFile ? 'PREPARING & SAVING TO DISK...' : 'SAVE FILE TO DISK NOW'}
                      </button>
                    )}

                    {currentJob.id && (
                      <a
                        href={currentJob.streamUrl || `/api/downloader/stream/${currentJob.id}`}
                        download={(currentJob?.filename || 'download').replace(new RegExp(`^${currentJob?.id}_`), '')}
                        className="btn-pixel btn-pixel-cyan px-3 py-2 font-pixel text-[9px] flex items-center gap-1.5"
                      >
                        DIRECT LINK
                      </a>
                    )}

                    <button
                      type="button"
                      onClick={() => copyToClipboard(url)}
                      className="btn-pixel btn-pixel-surface px-3 py-2 font-pixel text-[9px] flex items-center gap-1.5 text-white"
                    >
                      {copiedLink ? <Check className="w-3.5 h-3.5 text-arcade-emerald" /> : <Copy className="w-3.5 h-3.5" />}
                      COPY SOURCE URL
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setCurrentJob(null);
                        setUrl('');
                      }}
                      className="btn-pixel btn-pixel-surface px-3 py-2 font-pixel text-[9px] text-arcade-muted hover:text-white"
                    >
                      NEW DOWNLOAD
                    </button>
                  </div>
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
                disabled={spotifySearching || !spotifyQuery.trim()}
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
                    className="p-3 bg-deck-dark border border-deck-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-arcade-emerald transition-colors"
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
                        <div className="text-[11px] text-arcade-muted">
                          {item.uploader} {item.duration ? `• ${Math.floor(item.duration / 60)}m ${item.duration % 60}s` : ''}
                        </div>
                        {item.previewUrl && (
                          <audio controls src={item.previewUrl} className="h-6 mt-1.5 w-48 max-w-full" />
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => downloadDirectAudio(item.url, item.title)}
                        className="btn-pixel btn-pixel-emerald px-3 py-1.5 font-pixel text-[8px] flex items-center gap-1.5"
                      >
                        <Download className="w-3 h-3" />
                        DOWNLOAD MP3
                      </button>
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-pixel btn-pixel-surface px-2.5 py-1.5 font-pixel text-[8px] text-arcade-cyan flex items-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        YOUTUBE
                      </a>
                    </div>
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

          {!Array.isArray(history) || history.length === 0 ? (
            <div className="p-8 text-center text-arcade-muted font-mono text-xs">
              No previous downloads recorded in this session.
            </div>
          ) : (
            <div className="space-y-2">
              {(Array.isArray(history) ? history : []).map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-deck-dark border border-deck-border flex items-center justify-between gap-3 text-xs font-mono"
                >
                  <div className="min-w-0">
                    <div className="text-white font-bold truncate">{item?.filename || 'Untitled Media'}</div>
                    <div className="text-[10px] text-arcade-muted">
                      {item?.completedAt ? new Date(item.completedAt).toLocaleString() : 'Recent'} • {(item?.type || 'media').toUpperCase()} ({item?.format || 'mp4'})
                    </div>
                  </div>

                  {item?.id && (
                    <button
                      type="button"
                      onClick={() => triggerFileDownload(item.id, item.filename, item.streamUrl)}
                      className="btn-pixel btn-pixel-surface px-3 py-1 font-pixel text-[8px] text-arcade-emerald hover:border-arcade-emerald shrink-0"
                    >
                      GET FILE
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
