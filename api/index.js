import express from 'express';
import cors from 'cors';
import dns from 'dns/promises';
import vm from 'vm';
import crypto from 'crypto';
import { Readable } from 'stream';
import { Ytdl } from '@distube/ytdl-core';

const app = express();

// Factory to create unpoisoned Ytdl instances across serverless executions
function getFreshYtdl(clients = ['tv', 'web_embedded', 'visionos']) {
  const opts = {
    clients,
    timeoutMs: 25000,
    getPoToken: async () => '', // Completely disables BotGuard worker thread minting on serverless
  };
  if (process.env.YOUTUBE_COOKIE) {
    opts.cookie = process.env.YOUTUBE_COOKIE;
  }
  return new Ytdl(opts);
}
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// 1. SPEEDTEST
app.get('/api/speedtest/ping', (req, res) => {
  res.set({
    'Cache-Control': 'no-store, no-cache, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
  });
  res.json({ timestamp: Date.now(), ip: req.ip });
});

app.get('/api/speedtest/download', (req, res) => {
  const requestedBytes = parseInt(req.query.bytes || req.query.size || '10485760', 10);
  const size = Math.min(Math.max(isNaN(requestedBytes) ? 10485760 : requestedBytes, 1024), 25165824);

  res.set({
    'Content-Type': 'application/octet-stream',
    'Content-Length': size,
    'Cache-Control': 'no-store, no-cache, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
    'Content-Disposition': 'attachment; filename="speedtest.bin"'
  });

  const chunkSize = 65536;
  const chunk = crypto.randomBytes(chunkSize);
  let sent = 0;

  function write() {
    let ok = true;
    while (sent < size && ok) {
      const remaining = size - sent;
      const toSend = Math.min(chunkSize, remaining);
      sent += toSend;
      ok = res.write(toSend === chunkSize ? chunk : chunk.slice(0, toSend));
    }
    if (sent >= size) {
      res.end();
    } else {
      res.once('drain', write);
    }
  }
  write();
});

app.post('/api/speedtest/upload', express.raw({ type: '*/*', limit: '50mb' }), (req, res) => {
  const bytes = req.body ? req.body.length : 0;
  res.json({ success: true, bytesReceived: bytes, timestamp: Date.now() });
});

// 2. URL CHECKER
app.post('/api/url-checker/analyze', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'URL is required' });

  try {
    let currentUrl = url.trim();
    if (!/^https?:\/\//i.test(currentUrl)) currentUrl = 'http://' + currentUrl;

    const hops = [];
    let redirectCount = 0;
    const maxRedirects = 10;
    let finalUrl = currentUrl;

    while (redirectCount < maxRedirects) {
      const parsed = new URL(finalUrl);
      const hopStartTime = Date.now();
      const response = await fetch(finalUrl, {
        method: 'GET',
        redirect: 'manual',
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) OmniDeck-SecurityBot/4.2' }
      });
      const hopLatency = Date.now() - hopStartTime;
      hops.push({
        url: finalUrl,
        status: response.status,
        statusText: response.statusText,
        latency: hopLatency,
        server: response.headers.get('server') || parsed.hostname,
        contentType: response.headers.get('content-type') || 'unknown'
      });

      if ([301, 302, 303, 307, 308].includes(response.status)) {
        const location = response.headers.get('location');
        if (!location) break;
        finalUrl = new URL(location, finalUrl).href;
        redirectCount++;
      } else {
        break;
      }
    }

    const parsedFinal = new URL(finalUrl);
    const trackingParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'fbclid', 'gclid', 'ref', 'source'];
    const removedParams = [];
    trackingParams.forEach(param => {
      if (parsedFinal.searchParams.has(param)) {
        removedParams.push(param);
        parsedFinal.searchParams.delete(param);
      }
    });

    let safetyScore = 100;
    const flags = [];
    if (!finalUrl.startsWith('https://')) {
      safetyScore -= 30;
      flags.push({ severity: 'HIGH', label: 'INSECURE HTTP', desc: 'Communication is unencrypted.' });
    }
    if (redirectCount >= 3) {
      safetyScore -= 20;
      flags.push({ severity: 'MEDIUM', label: 'SUSPICIOUS REDIRECT CHAIN', desc: `Chain traversed ${redirectCount} hops.` });
    }

    let dnsData = {};
    try {
      const cleanHost = parsedFinal.hostname;
      const [a, mx, txt] = await Promise.allSettled([
        dns.resolve4(cleanHost),
        dns.resolveMx(cleanHost),
        dns.resolveTxt(cleanHost)
      ]);
      dnsData = {
        ipv4: a.status === 'fulfilled' ? a.value : [],
        mx: mx.status === 'fulfilled' ? mx.value : [],
        txt: txt.status === 'fulfilled' ? txt.value.flat() : []
      };
    } catch (e) { }

    res.json({
      initialUrl: url,
      finalUrl,
      cleanedUrl: parsedFinal.href,
      isRedirected: redirectCount > 0,
      totalHops: hops.length,
      hops,
      safetyScore: Math.max(0, safetyScore),
      rating: safetyScore >= 80 ? 'SAFE' : safetyScore >= 50 ? 'CAUTION' : 'DANGEROUS',
      flags,
      trackingParamsRemoved: removedParams,
      dns: dnsData,
      isHttps: finalUrl.startsWith('https://')
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. JAVASCRIPT CODE RUNNER
app.post('/api/dev/run-code', (req, res) => {
  const { code } = req.body;
  if (!code) return res.status(400).json({ error: 'Code is required' });

  const logs = [];
  const sandbox = {
    console: {
      log: (...args) => logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' ')),
      error: (...args) => logs.push('[ERROR] ' + args.map(a => String(a)).join(' ')),
      warn: (...args) => logs.push('[WARN] ' + args.map(a => String(a)).join(' '))
    },
    Math,
    Date,
    JSON
  };

  try {
    const script = new vm.Script(code);
    const context = vm.createContext(sandbox);
    const startTime = Date.now();
    const result = script.runInContext(context, { timeout: 3000 });
    res.json({
      success: true,
      result: result !== undefined ? String(result) : undefined,
      logs,
      executionTime: Date.now() - startTime
    });
  } catch (err) {
    res.json({ success: false, error: err.message, logs });
  }
});

// 4. DNS LOOKUP
app.post('/api/net/dns', async (req, res) => {
  const { domain } = req.body;
  if (!domain) return res.status(400).json({ error: 'Domain required' });
  try {
    const cleanDomain = domain.replace(/^https?:\/\//, '').split('/')[0];
    const [a, aaaa, mx, txt] = await Promise.allSettled([
      dns.resolve4(cleanDomain),
      dns.resolve6(cleanDomain),
      dns.resolveMx(cleanDomain),
      dns.resolveTxt(cleanDomain)
    ]);
    res.json({
      domain: cleanDomain,
      A: a.status === 'fulfilled' ? a.value : [],
      AAAA: aaaa.status === 'fulfilled' ? aaaa.value : [],
      MX: mx.status === 'fulfilled' ? mx.value : [],
      TXT: txt.status === 'fulfilled' ? txt.value.flat() : []
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. UNIVERSAL DOWNLOADER & STREAM RESOLVER (Serverless Cloud Engine)
const cloudDownloadJobs = new Map();
const cloudDownloadHistory = [];

app.get('/api/downloader/status', (req, res) => {
  res.json({
    online: true,
    isCloud: true,
    hasYtDlp: false,
    mode: 'cloud',
    message: 'Omni-Deck Cloud Stream Resolver Active'
  });
});

app.post('/api/downloader/inspect', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'URL is required' });

  const cleanUrl = url.trim();

  try {
    // 1. YouTube inspection
    const ytMatch = cleanUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?.*v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/i);
    if (ytMatch) {
      const videoId = ytMatch[1];
      try {
        const oembedRes = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
        if (oembedRes.ok) {
          const oembed = await oembedRes.json();
          return res.json({
            id: videoId,
            title: oembed.title || 'YouTube Media Stream',
            thumbnail: oembed.thumbnail_url || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
            uploader: oembed.author_name || 'YouTube Creator',
            duration: null,
            is_playlist: false,
            playlist_count: 1,
            formats: [
              { format_id: '1080p', ext: 'mp4', resolution: '1080p FHD', note: 'Full HD MP4' },
              { format_id: '720p', ext: 'mp4', resolution: '720p HD', note: 'Standard MP4' },
              { format_id: '480p', ext: 'mp4', resolution: '480p SD', note: 'Mobile MP4' },
              { format_id: 'mp3', ext: 'mp3', resolution: 'audio only', note: '320kbps MP3 Audio' },
              { format_id: 'm4a', ext: 'm4a', resolution: 'audio only', note: 'High Quality M4A' }
            ]
          });
        }
      } catch (e) { }

      // Fallback if oembed times out
      return res.json({
        id: videoId,
        title: `YouTube Video (${videoId})`,
        thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
        uploader: 'YouTube Stream',
        duration: null,
        formats: [
          { format_id: '1080p', ext: 'mp4', resolution: '1080p FHD', note: 'Full HD MP4' },
          { format_id: '720p', ext: 'mp4', resolution: '720p HD', note: 'Standard MP4' },
          { format_id: 'mp3', ext: 'mp3', resolution: 'audio only', note: '320kbps MP3 Audio' }
        ]
      });
    }

    // 2. Twitter / X inspection
    if (cleanUrl.includes('twitter.com') || cleanUrl.includes('x.com')) {
      try {
        const oembedRes = await fetch(`https://publish.twitter.com/oembed?url=${encodeURIComponent(cleanUrl)}`);
        if (oembedRes.ok) {
          const oembed = await oembedRes.json();
          return res.json({
            id: 'x_' + Date.now(),
            title: oembed.author_name ? `Post by ${oembed.author_name}` : 'X / Twitter Media',
            thumbnail: 'https://abs.twimg.com/favicons/twitter.3.ico',
            uploader: oembed.author_name || 'X User',
            formats: [{ format_id: 'max', ext: 'mp4', resolution: 'Highest Available', note: 'Original MP4' }]
          });
        }
      } catch (e) { }
    }

    // 3. TikTok inspection
    if (cleanUrl.includes('tiktok.com')) {
      try {
        const oembedRes = await fetch(`https://www.tiktok.com/oembed?url=${encodeURIComponent(cleanUrl)}`);
        if (oembedRes.ok) {
          const oembed = await oembedRes.json();
          return res.json({
            id: 'tiktok_' + Date.now(),
            title: oembed.title || 'TikTok Video',
            thumbnail: oembed.thumbnail_url,
            uploader: oembed.author_name || 'TikTok Creator',
            formats: [{ format_id: 'max', ext: 'mp4', resolution: '1080p', note: 'TikTok HD Video' }]
          });
        }
      } catch (e) { }
    }

    // 4. Direct video / audio URLs
    const isDirect = /\.(mp4|webm|mp3|m4a|wav|flac|ogg)($|\?)/i.test(cleanUrl);
    if (isDirect) {
      const filename = cleanUrl.split('/').pop().split('?')[0] || 'media_stream';
      const ext = filename.split('.').pop() || 'mp4';
      return res.json({
        id: 'direct_' + Date.now(),
        title: filename,
        thumbnail: '',
        uploader: 'Direct Web Host',
        isDirect: true,
        formats: [{ format_id: 'direct', ext, resolution: 'Source Stream', note: 'Direct File' }]
      });
    }

    // 5. Generic Web Media Fallback
    res.json({
      id: 'media_' + Date.now(),
      title: 'Universal Media Link',
      thumbnail: '',
      uploader: new URL(cleanUrl).hostname || 'Web Source',
      formats: [
        { format_id: 'max', ext: 'mp4', resolution: 'Source Quality', note: 'Web Stream' },
        { format_id: 'mp3', ext: 'mp3', resolution: 'audio only', note: 'Audio Track' }
      ]
    });
  } catch (err) {
    res.status(500).json({ error: 'Inspection failed: ' + err.message });
  }
});

app.post('/api/downloader/download', (req, res) => {
  const { url, type = 'video', format = 'mp4', title = '' } = req.body;
  if (!url) return res.status(400).json({ error: 'URL is required' });

  const cleanUrl = url.trim();
  const isDirect = /\.(mp4|webm|mp3|m4a|wav|flac|ogg)($|\?)/i.test(cleanUrl);

  const cleanTitle = (title || (cleanUrl.includes('youtube.com') || cleanUrl.includes('youtu.be')
    ? 'YouTube_Media'
    : cleanUrl.split('/').pop().split('?')[0] || 'OmniDeck_Download')).replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 50);

  // Encode request details directly into stateless token so it survives across serverless instances
  const tokenPayload = {
    u: cleanUrl,
    t: type,
    f: format || (type === 'audio' ? 'mp3' : 'mp4'),
    n: `${cleanTitle}.${format || (type === 'audio' ? 'mp3' : 'mp4')}`
  };
  const token = Buffer.from(JSON.stringify(tokenPayload)).toString('base64url');
  const jobId = `job_token_${token}`;

  const job = {
    id: jobId,
    url: cleanUrl,
    type,
    format,
    progress: 100,
    speed: 'Instant Cloud Stream',
    eta: '00:00',
    status: 'completed',
    filename: tokenPayload.n,
    isCloud: true,
    isWebMode: true,
    token,
    streamUrl: `/api/downloader/stream/${jobId}?token=${token}&url=${encodeURIComponent(cleanUrl)}&type=${type}&format=${tokenPayload.f}&title=${encodeURIComponent(cleanTitle)}`,
    completedAt: new Date().toISOString()
  };

  cloudDownloadJobs.set(jobId, job);
  cloudDownloadHistory.unshift({
    id: job.id,
    url: job.url,
    filename: job.filename,
    type: job.type,
    format: job.format,
    completedAt: job.completedAt
  });
  if (cloudDownloadHistory.length > 30) cloudDownloadHistory.pop();

  res.json({
    jobId,
    status: 'completed',
    ...job
  });
});

app.get('/api/downloader/progress/:jobId', (req, res) => {
  const job = cloudDownloadJobs.get(req.params.jobId);
  if (!job) {
    return res.json({
      id: req.params.jobId,
      status: 'completed',
      progress: 100,
      speed: 'Complete',
      eta: '00:00',
      isCloud: true
    });
  }
  res.json(job);
});

// Stateless media streaming handler (works across all Vercel serverless lambdas)
async function handleStatelessStream(req, res) {
  // Parse raw URL query string directly in case Express req.query was lost during Vercel rewrites
  let parsedUrl = null;
  try {
    parsedUrl = new URL(req.url, 'http://localhost');
  } catch (e) {}

  let jobId = req.params?.jobId || '';
  if (!jobId && req.url) {
    const pathMatch = req.url.match(/\/stream\/([^?#]+)/);
    if (pathMatch) jobId = decodeURIComponent(pathMatch[1]);
  }

  let targetUrl = req.query?.url || req.body?.url || parsedUrl?.searchParams?.get('url') || '';
  let targetType = req.query?.type || req.body?.type || parsedUrl?.searchParams?.get('type') || 'video';
  let targetFormat = req.query?.format || req.body?.format || parsedUrl?.searchParams?.get('format') || (targetType === 'audio' ? 'mp3' : 'mp4');
  let cleanName = req.query?.title || req.body?.title || parsedUrl?.searchParams?.get('title') || 'downloaded_media';
  const token = req.query?.token || req.body?.token || parsedUrl?.searchParams?.get('token') || '';

  // 1. Check in-memory first if same instance
  if (jobId) {
    const job = cloudDownloadJobs.get(jobId);
    if (job) {
      targetUrl = job.url || targetUrl;
      targetType = job.type || targetType;
      targetFormat = job.format || targetFormat;
      cleanName = job.filename || cleanName;
    }
  }

  // 2. Decode from self-contained token (from query, body, or jobId)
  if (!targetUrl && (token || jobId.startsWith('job_token_') || jobId.startsWith('token_'))) {
    const rawToken = token || jobId.replace(/^job_token_/, '').replace(/^token_/, '');
    try {
      const decoded = JSON.parse(Buffer.from(rawToken, 'base64url').toString('utf8'));
      if (decoded.u) targetUrl = decoded.u;
      if (decoded.t) targetType = decoded.t;
      if (decoded.f) targetFormat = decoded.f;
      if (decoded.n) cleanName = decoded.n;
    } catch (e) {}
  }

  // 3. Check history lookup if jobId was a past download
  if (!targetUrl && jobId) {
    const hist = cloudDownloadHistory.find(h => h.id === jobId);
    if (hist && hist.url) {
      targetUrl = hist.url;
      targetType = hist.type || targetType;
      targetFormat = hist.format || targetFormat;
      cleanName = hist.filename || cleanName;
    }
  }

  if (!targetUrl) {
    return res.status(404).send('Download job or URL not specified.');
  }

  // Ensure cleanName has proper extension
  const ext = targetType === 'audio' ? (targetFormat === 'mp3' ? 'mp3' : 'm4a') : (targetFormat || 'mp4');
  if (!cleanName.endsWith(`.${ext}`)) {
    cleanName = cleanName.replace(/\.[^.]+$/, '') + `.${ext}`;
  }

  // Stream direct media file URL
  const isDirect = /\.(mp4|webm|mp3|m4a|wav|flac|ogg)($|\?)/i.test(targetUrl);
  if (isDirect) {
    try {
      const mediaRes = await fetch(targetUrl);
      if (mediaRes.ok && mediaRes.body) {
        res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(cleanName).replace(/%20/g, ' ')}"`);
        res.setHeader('Content-Type', mediaRes.headers.get('content-type') || 'application/octet-stream');
        return Readable.fromWeb(mediaRes.body).pipe(res);
      }
    } catch (e) {}
    return res.redirect(targetUrl);
  }

  // Stream YouTube media URL via ytdl
  if (targetUrl.includes('youtube.com') || targetUrl.includes('youtu.be')) {
    let info = null;
    let lastError = null;

    // Ordered strategies with zero PO token requirement (safe for cloud serverless)
    const strategies = [
      ['tv', 'web_embedded'],
      ['web_embedded', 'tv'],
      ['visionos']
    ];

    for (const clients of strategies) {
      try {
        const ytdlInstance = getFreshYtdl(clients);
        info = await ytdlInstance.getInfo(targetUrl);
        if (info && Array.isArray(info.formats) && info.formats.length > 0) {
          break;
        }
      } catch (err) {
        lastError = err;
        console.warn(`[YTDL Cloud] Strategy [${clients.join(',')}] error:`, err.message);
      }
    }

    if (!info || !info.formats || info.formats.length === 0) {
      const isBotCheck = lastError?.message?.includes('not a bot') || lastError?.message?.includes('BOT_CHECK') || lastError?.code === 'BOT_CHECK';
      return res.status(isBotCheck ? 403 : 500).json({
        error: isBotCheck ? 'YOUTUBE_BOT_CHECK' : 'STREAM_RESOLUTION_FAILED',
        message: lastError ? lastError.message : 'No stream formats resolved',
        hint: 'YouTube restricts cloud datacenter IPs. Connect with OmniDeck Desktop Companion (node server/index.js) running locally with yt-dlp to bypass bot challenges.'
      });
    }

    let targetStreamFormat = null;
    if (targetType === 'audio') {
      const audioFormats = info.formats.filter(f => f.hasAudio && !f.hasVideo && f.url);
      if (audioFormats.length > 0) {
        targetStreamFormat = audioFormats.sort((a,b) => (b.audioBitrate || 0) - (a.audioBitrate || 0))[0];
      } else {
        targetStreamFormat = info.formats.filter(f => f.hasAudio && f.url).sort((a,b) => (b.audioBitrate || 0) - (a.audioBitrate || 0))[0];
      }
    } else {
      const muxed = info.formats.filter(f => f.hasAudio && f.hasVideo && f.url);
      if (muxed.length > 0) {
        targetStreamFormat = muxed.sort((a,b) => (b.height || 0) - (a.height || 0))[0];
      } else {
        const videoFormats = info.formats.filter(f => f.hasVideo && f.url);
        targetStreamFormat = videoFormats[0] || info.formats.filter(f => f.url)[0];
      }
    }

    if (targetStreamFormat && targetStreamFormat.url) {
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(cleanName).replace(/%20/g, ' ')}"`);
      res.setHeader('Content-Type', targetStreamFormat.mimeType || (targetType === 'audio' ? 'audio/mpeg' : 'video/mp4'));
      if (targetStreamFormat.contentLength) {
        res.setHeader('Content-Length', targetStreamFormat.contentLength);
      }

      try {
        const fetchRes = await fetch(targetStreamFormat.url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
            'Accept': '*/*',
            'Accept-Encoding': 'identity;q=1, *;q=0',
            'Range': req.headers.range || 'bytes=0-'
          }
        });
        if (fetchRes.ok && fetchRes.body) {
          return Readable.fromWeb(fetchRes.body).pipe(res);
        }
      } catch (fetchErr) {
        console.warn('[YTDL] Direct streaming failed, fallback redirect:', fetchErr.message);
      }

      // Fallback direct URL redirect
      return res.redirect(targetStreamFormat.url);
    }
  }

  res.status(404).send('No downloadable stream available.');
}

app.get('/api/downloader/stream/:jobId', handleStatelessStream);
app.get('/api/downloader/stream', handleStatelessStream);

// Direct Download handler (single-request Media-Downloader architecture)
app.all(['/api/downloader/direct-download', '/download'], async (req, res) => {
  const url = (req.body?.url || req.query?.url || '').trim();
  const type = req.body?.type || req.query?.type || 'video';
  const format = req.body?.format || req.query?.format || (type === 'audio' ? 'mp3' : 'mp4');

  if (!url) return res.status(400).send('Error: Video URL is required.');

  req.query = req.query || {};
  req.query.url = url;
  req.query.type = type;
  req.query.format = format;
  return handleStatelessStream(req, res);
});

app.get('/api/downloader/history', (req, res) => {
  res.json(cloudDownloadHistory);
});

// Spotify & Music Resolver via iTunes search API
app.post('/api/downloader/spotify-search', async (req, res) => {
  const { query } = req.body;
  if (!query) return res.status(400).json({ error: 'Query is required' });

  try {
    let cleanQuery = query.trim();
    if (cleanQuery.includes('spotify.com/track/')) {
      try {
        const oembedRes = await fetch(`https://open.spotify.com/oembed?url=${encodeURIComponent(cleanQuery)}`);
        if (oembedRes.ok) {
          const oembed = await oembedRes.json();
          if (oembed.title) cleanQuery = oembed.title;
        }
      } catch (e) { }
    }

    const itunesUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(cleanQuery)}&media=music&limit=8`;
    const itunesRes = await fetch(itunesUrl);
    if (!itunesRes.ok) throw new Error('Search provider error');

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

    res.json({
      query: cleanQuery,
      results
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to search music: ' + err.message });
  }
});

export default app;

