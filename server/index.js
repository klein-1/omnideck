import express from 'express';
import cors from 'cors';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import os from 'os';
import https from 'https';
import http from 'http';
import dns from 'dns/promises';
import tls from 'tls';
import { URL } from 'url';
import selfsigned from 'selfsigned';
import multer from 'multer';
import archiver from 'archiver';
import vm from 'vm';
import crypto from 'crypto';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Directories
const rootDir = process.cwd();
const binDir = path.join(rootDir, 'bin');
const ytdlpPath = path.join(binDir, 'yt-dlp.exe');
const downloadsDir = path.join(rootDir, 'downloads');
const uploadsDir = path.join(rootDir, 'uploads');
const hostedPublicDir = path.join(rootDir, 'hosted_files');

[downloadsDir, uploadsDir, hostedPublicDir].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Create sample file in hostedPublicDir so shttps has files immediately
const sampleFilePath = path.join(hostedPublicDir, 'welcome.txt');
if (!fs.existsSync(sampleFilePath)) {
  fs.writeFileSync(sampleFilePath, 'Welcome to SHTTPS Local Server hosted via Omni-Deck!\n');
}

// -------------------------------------------------------------
// 1. UNIVERSAL DOWNLOADER (Seal / SpotDL inspired)
// -------------------------------------------------------------
const downloadJobs = new Map();
const downloadHistory = [];

app.post('/api/downloader/inspect', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'URL is required' });

  try {
    const isYtDlp = fs.existsSync(ytdlpPath);
    const cmd = isYtDlp ? ytdlpPath : 'yt-dlp';
    const proc = spawn(cmd, ['--dump-single-json', '--no-warnings', '--skip-download', url]);

    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', (d) => { stdout += d.toString(); });
    proc.stderr.on('data', (d) => { stderr += d.toString(); });

    proc.on('close', (code) => {
      if (code !== 0) {
        return res.status(500).json({
          error: 'Failed to inspect media. Make sure the URL is public and valid.',
          details: stderr || 'yt-dlp returned code ' + code
        });
      }

      try {
        const info = JSON.parse(stdout);
        // Process format options
        const formats = (info.formats || []).map(f => ({
          format_id: f.format_id,
          ext: f.ext,
          resolution: f.resolution || (f.height ? `${f.height}p` : 'audio only'),
          filesize: f.filesize || f.filesize_approx || null,
          tbr: f.tbr || null,
          vcodec: f.vcodec || 'none',
          acodec: f.acodec || 'none',
          note: f.format_note || ''
        }));

        res.json({
          id: info.id,
          title: info.title,
          thumbnail: info.thumbnail,
          uploader: info.uploader || info.channel || 'Unknown',
          duration: info.duration,
          view_count: info.view_count,
          description: info.description ? info.description.slice(0, 300) : '',
          is_playlist: Array.isArray(info.entries),
          playlist_count: Array.isArray(info.entries) ? info.entries.length : 1,
          formats: formats.reverse()
        });
      } catch (parseErr) {
        res.status(500).json({ error: 'Failed to parse metadata', details: parseErr.message });
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/downloader/download', (req, res) => {
  const {
    url,
    type = 'video', // 'video' | 'audio'
    quality = 'max',
    format = 'mp4', // 'mp4' | 'mp3' | 'm4a' | 'flac' | 'wav'
    customArgs = '',
    startTime = '',
    endTime = '',
    embedThumbnail = true,
    embedSubs = false,
    sponsorBlock = false
  } = req.body;

  if (!url) return res.status(400).json({ error: 'URL is required' });

  const jobId = 'job_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  const outputFileTemplate = path.join(downloadsDir, `${jobId}_%(title)s.%(ext)s`);

  const args = [
    '--newline',
    '--no-warnings',
    '-o', outputFileTemplate,
    url
  ];

  if (type === 'audio') {
    args.push('-x');
    args.push('--audio-format', format || 'mp3');
    args.push('--audio-quality', '0');
  } else {
    if (quality === 'max') {
      args.push('-f', 'bestvideo+bestaudio/best');
    } else if (quality === '1080p') {
      args.push('-f', 'bestvideo[height<=1080]+bestaudio/best[height<=1080]/best');
    } else if (quality === '720p') {
      args.push('-f', 'bestvideo[height<=720]+bestaudio/best[height<=720]/best');
    } else if (quality === '480p') {
      args.push('-f', 'bestvideo[height<=480]+bestaudio/best[height<=480]/best');
    }
    if (format === 'mp4') {
      args.push('--merge-output-format', 'mp4');
    }
  }

  if (embedThumbnail) args.push('--embed-thumbnail');
  if (embedSubs) args.push('--write-subs', '--embed-subs');
  if (sponsorBlock) args.push('--sponsorblock-remove', 'all');

  if (startTime || endTime) {
    let section = '*';
    if (startTime && endTime) section = `*${startTime}-${endTime}`;
    else if (startTime) section = `*${startTime}-inf`;
    else if (endTime) section = `*0-${endTime}`;
    args.push('--download-sections', section);
  }

  if (customArgs && customArgs.trim()) {
    const extras = customArgs.trim().split(/\s+/);
    args.push(...extras);
  }

  const isYtDlp = fs.existsSync(ytdlpPath);
  const cmd = isYtDlp ? ytdlpPath : 'yt-dlp';

  const job = {
    id: jobId,
    url,
    type,
    format,
    progress: 0,
    speed: '',
    eta: '',
    status: 'starting',
    filename: null,
    filePath: null,
    error: null,
    startTime: Date.now()
  };

  downloadJobs.set(jobId, job);

  const proc = spawn(cmd, args);

  proc.stdout.on('data', (data) => {
    const text = data.toString();
    // parse percentage e.g. [download]  45.2% of 25.10MiB at 3.25MiB/s ETA 00:04
    const match = text.match(/\[download\]\s+([\d\.]+)%\s+of\s+([^\s]+)\s+at\s+([^\s]+)\s+ETA\s+([^\s]+)/i);
    if (match) {
      job.progress = parseFloat(match[1]);
      job.speed = match[3];
      job.eta = match[4];
      job.status = 'downloading';
    } else if (text.includes('[ExtractAudio]') || text.includes('[Merger]')) {
      job.status = 'processing';
      job.progress = 98;
    }

    // Capture file destination
    const destMatch = text.match(/\[(?:download|Merger|ExtractAudio)\] Destination:\s*(.+)/i) ||
      text.match(/\[download\]\s+(.+)\s+has already been downloaded/i);
    if (destMatch && destMatch[1]) {
      const full = destMatch[1].trim();
      job.filePath = full;
      job.filename = path.basename(full);
    }
  });

  proc.stderr.on('data', (data) => {
    const text = data.toString();
    if (!job.error && text.toLowerCase().includes('error:')) {
      job.error = text.trim();
    }
  });

  proc.on('close', (code) => {
    if (code === 0) {
      job.status = 'completed';
      job.progress = 100;

      // If filename wasn't caught directly, scan downloadsDir for this jobId
      if (!job.filePath || !fs.existsSync(job.filePath)) {
        const found = fs.readdirSync(downloadsDir).find(f => f.startsWith(jobId));
        if (found) {
          job.filePath = path.join(downloadsDir, found);
          job.filename = found;
        }
      }

      downloadHistory.unshift({
        id: job.id,
        url: job.url,
        filename: job.filename,
        type: job.type,
        format: job.format,
        completedAt: new Date().toISOString()
      });
      if (downloadHistory.length > 50) downloadHistory.pop();
    } else {
      job.status = 'failed';
      job.error = job.error || `Process exited with code ${code}`;
    }
  });

  res.json({ jobId, status: 'started' });
});

app.get('/api/downloader/progress/:jobId', (req, res) => {
  const job = downloadJobs.get(req.params.jobId);
  if (!job) return res.status(404).json({ error: 'Job not found' });
  res.json(job);
});

app.get('/api/downloader/stream/:jobId', (req, res) => {
  const job = downloadJobs.get(req.params.jobId);
  if (!job || !job.filePath || !fs.existsSync(job.filePath)) {
    return res.status(404).send('File not found or still processing.');
  }

  res.download(job.filePath, job.filename);
});

app.get('/api/downloader/history', (req, res) => {
  res.json(downloadHistory);
});

// Spotify Search & Stream Resolver
app.post('/api/downloader/spotify-search', async (req, res) => {
  const { query, isUrl } = req.body;
  if (!query) return res.status(400).json({ error: 'Query or URL is required' });

  try {
    // If user provided a Spotify URL, resolve title/artist via oEmbed or metadata
    let searchQuery = query;
    let trackDetails = { title: query, artist: 'Unknown' };

    if (query.includes('spotify.com/track/')) {
      try {
        const oembedUrl = `https://open.spotify.com/oembed?url=${encodeURIComponent(query)}`;
        const oembedRes = await fetch(oembedUrl);
        if (oembedRes.ok) {
          const oembedData = await oembedRes.json();
          trackDetails = {
            title: oembedData.title || query,
            artist: oembedData.author_name || 'Spotify Artist',
            thumbnail: oembedData.thumbnail_url
          };
          searchQuery = `${trackDetails.title} ${trackDetails.artist} audio`;
        }
      } catch (e) {
        // Fallback to query
      }
    }

    // Inspect search result with yt-dlp
    const isYtDlp = fs.existsSync(ytdlpPath);
    const cmd = isYtDlp ? ytdlpPath : 'yt-dlp';
    const proc = spawn(cmd, ['--dump-single-json', '--default-search', 'ytsearch5', '--no-warnings', searchQuery]);

    let stdout = '';
    proc.stdout.on('data', d => { stdout += d.toString(); });
    proc.on('close', (code) => {
      try {
        const data = JSON.parse(stdout);
        const entries = (data.entries || [data]).map(item => ({
          id: item.id,
          title: item.title,
          uploader: item.uploader || item.channel,
          duration: item.duration,
          thumbnail: item.thumbnail,
          url: item.webpage_url || `https://www.youtube.com/watch?v=${item.id}`
        }));

        res.json({
          query: searchQuery,
          trackDetails,
          results: entries
        });
      } catch (err) {
        res.status(500).json({ error: 'Failed to search audio stream', details: err.message });
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// 2. SAFE URL CHECKER & UNSHORTENER
// -------------------------------------------------------------
app.post('/api/url-checker/analyze', async (req, res) => {
  let { url: inputUrl } = req.body;
  if (!inputUrl) return res.status(400).json({ error: 'URL is required' });

  if (!inputUrl.startsWith('http://') && !inputUrl.startsWith('https://')) {
    inputUrl = 'https://' + inputUrl;
  }

  const hops = [];
  let currentUrl = inputUrl;
  let safetyScore = 100;
  const flags = [];
  const trackingParamsRemoved = [];

  try {
    // Trace up to 15 redirects
    for (let i = 0; i < 15; i++) {
      let parsed;
      try {
        parsed = new URL(currentUrl);
      } catch (e) {
        flags.push({ severity: 'high', message: 'Malformed URL: ' + currentUrl });
        break;
      }

      // Check tracking params
      const searchParams = new URLSearchParams(parsed.search);
      const trackers = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'fbclid', 'gclid', 'mc_cid', 'yclid', '_hsenc'];
      trackers.forEach(t => {
        if (searchParams.has(t)) {
          trackingParamsRemoved.push(`${t}=${searchParams.get(t)}`);
        }
      });

      // Fetch head or GET with redirect manual
      const startTime = Date.now();
      let response;
      try {
        response = await fetch(currentUrl, {
          method: 'GET',
          redirect: 'manual',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 OmniDeck-SafeCheck/1.0'
          }
        });
      } catch (fetchErr) {
        hops.push({
          url: currentUrl,
          status: 0,
          statusText: fetchErr.message,
          latency: Date.now() - startTime
        });
        flags.push({ severity: 'high', message: `Host unreachable or network connection failed: ${fetchErr.message}` });
        safetyScore -= 30;
        break;
      }

      const latency = Date.now() - startTime;
      const status = response.status;
      const location = response.headers.get('location');

      hops.push({
        url: currentUrl,
        status,
        statusText: response.statusText,
        latency,
        server: response.headers.get('server') || 'Unknown',
        contentType: response.headers.get('content-type') || 'Unknown'
      });

      if ([301, 302, 303, 307, 308].includes(status) && location) {
        // Resolve relative redirects
        const nextUrl = new URL(location, currentUrl).href;
        currentUrl = nextUrl;
      } else {
        // Final destination reached
        break;
      }
    }

    const finalUrl = hops[hops.length - 1].url;
    const finalParsed = new URL(finalUrl);

    // Heuristics Check
    const hostname = finalParsed.hostname;

    // Check IP address in hostname
    if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname)) {
      flags.push({ severity: 'high', message: 'Direct IP address hostname detected (frequently used in phishing/botnets)' });
      safetyScore -= 35;
    }

    // Check Punycode / Homograph
    if (hostname.startsWith('xn--') || hostname.includes('.xn--')) {
      flags.push({ severity: 'medium', message: 'Internationalized Domain Name (Punycode) detected — possible homograph spoofing' });
      safetyScore -= 20;
    }

    // Check excessive subdomains
    const subdomainParts = hostname.split('.');
    if (subdomainParts.length > 4) {
      flags.push({ severity: 'medium', message: 'Excessive subdomains detected (' + subdomainParts.length + ' levels)' });
      safetyScore -= 15;
    }

    // Check suspicious keywords in path
    const suspiciousWords = ['login', 'verify', 'update', 'banking', 'secure', 'free-gift', 'crypto-bonus', 'wallet-connect', 'paypal-security'];
    const matchedWords = suspiciousWords.filter(w => finalUrl.toLowerCase().includes(w));
    if (matchedWords.length > 0 && !['google.com', 'microsoft.com', 'apple.com', 'paypal.com'].some(d => hostname.endsWith(d))) {
      flags.push({ severity: 'low', message: `Keywords detected in URL that may mimic auth portals: ${matchedWords.join(', ')}` });
      safetyScore -= 10;
    }

    // DNS Lookup
    let dnsRecords = {};
    try {
      const [aRecords, mxRecords, txtRecords] = await Promise.allSettled([
        dns.resolve4(hostname),
        dns.resolveMx(hostname),
        dns.resolveTxt(hostname)
      ]);
      dnsRecords = {
        ipv4: aRecords.status === 'fulfilled' ? aRecords.value : [],
        mx: mxRecords.status === 'fulfilled' ? mxRecords.value : [],
        txt: txtRecords.status === 'fulfilled' ? txtRecords.value.flat() : []
      };
    } catch (dnsErr) {
      dnsRecords.error = dnsErr.message;
    }

    // Cleaned URL without trackers
    const cleanedUrl = new URL(finalUrl);
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'fbclid', 'gclid', 'mc_cid', 'yclid', '_hsenc'].forEach(p => {
      cleanedUrl.searchParams.delete(p);
    });

    if (hops.length > 1) {
      flags.push({ severity: 'info', message: `Shortened / redirected through ${hops.length - 1} hops to final destination` });
    }

    safetyScore = Math.max(5, Math.min(100, safetyScore));

    res.json({
      initialUrl: inputUrl,
      finalUrl,
      cleanedUrl: cleanedUrl.href,
      isRedirected: hops.length > 1,
      totalHops: hops.length,
      hops,
      safetyScore,
      rating: safetyScore >= 80 ? 'SAFE' : safetyScore >= 50 ? 'CAUTION' : 'DANGEROUS',
      flags,
      trackingParamsRemoved,
      dns: dnsRecords,
      isHttps: finalUrl.startsWith('https://')
    });

  } catch (err) {
    res.status(500).json({ error: 'Analysis failed: ' + err.message });
  }
});

// -------------------------------------------------------------
// 3. SHTTPS LOCAL SERVER HOST (Enhanced shttps)
// -------------------------------------------------------------
const runningServers = new Map();

// Helper to get local network IP
function getLocalNetworkIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return '127.0.0.1';
}

const localIP = getLocalNetworkIP();

// Multer upload destination for shttps servers
const uploadStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const port = req.headers['x-server-port'];
    const srv = runningServers.get(Number(port));
    const targetDir = (srv && srv.rootDir) ? srv.rootDir : hostedPublicDir;
    cb(null, targetDir);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});
const uploadHandler = multer({ storage: uploadStorage });

app.get('/api/shttps/info', (req, res) => {
  res.json({
    localIP,
    defaultDir: hostedPublicDir,
    activeServers: Array.from(runningServers.values()).map(s => ({
      port: s.port,
      protocol: s.protocol,
      rootDir: s.rootDir,
      startedAt: s.startedAt,
      requestsCount: s.requestsCount,
      bytesTransferred: s.bytesTransferred,
      enableUploads: s.enableUploads,
      enableCORS: s.enableCORS,
      authEnabled: Boolean(s.username),
      localUrl: `${s.protocol}://localhost:${s.port}`,
      lanUrl: `${s.protocol}://${localIP}:${s.port}`
    }))
  });
});

app.post('/api/shttps/start', async (req, res) => {
  const {
    port = 8443,
    protocol = 'https', // 'https' | 'http'
    rootDir = hostedPublicDir,
    username = '',
    password = '',
    enableUploads = true,
    enableCORS = true
  } = req.body;

  const targetPort = Number(port);
  if (runningServers.has(targetPort)) {
    return res.status(400).json({ error: `Port ${targetPort} is already in use by another instance.` });
  }

  // Ensure root directory exists
  if (!fs.existsSync(rootDir)) {
    fs.mkdirSync(rootDir, { recursive: true });
  }

  const logs = [];
  const logRequest = (entry) => {
    logs.unshift({ ...entry, timestamp: new Date().toLocaleTimeString() });
    if (logs.length > 100) logs.pop();
  };

  const requestListener = (req, res) => {
    const startTime = Date.now();
    const serverInstance = runningServers.get(targetPort);
    if (serverInstance) serverInstance.requestsCount++;

    if (enableCORS) {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', '*');
      if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
      }
    }

    // Basic Auth
    if (username && password) {
      const authHeader = req.headers['authorization'];
      if (!authHeader) {
        res.writeHead(401, { 'WWW-Authenticate': 'Basic realm="OmniDeck-SHTTPS"' });
        res.end('Authentication required');
        return;
      }
      const credentials = Buffer.from(authHeader.split(' ')[1] || '', 'base64').toString('ascii');
      const [u, p] = credentials.split(':');
      if (u !== username || p !== password) {
        res.writeHead(401, { 'WWW-Authenticate': 'Basic realm="OmniDeck-SHTTPS"' });
        res.end('Invalid credentials');
        return;
      }
    }

    // File Upload via POST to /_upload
    if (enableUploads && req.method === 'POST' && req.url === '/_upload') {
      req.headers['x-server-port'] = String(targetPort);
      uploadHandler.any()(req, res, (err) => {
        if (err) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ error: err.message }));
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, files: req.files ? req.files.map(f => f.originalname) : [] }));
      });
      return;
    }

    const safeUrlPath = decodeURIComponent(req.url.split('?')[0]);
    const filePath = path.join(rootDir, safeUrlPath);

    // Security path traversal check
    if (!filePath.startsWith(rootDir)) {
      res.writeHead(403);
      return res.end('Access Denied');
    }

    fs.stat(filePath, (err, stats) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end(`<h2 style="font-family: monospace; color: #ff4757;">[404] File Not Found: ${safeUrlPath}</h2>`);
        logRequest({ method: req.method, url: req.url, status: 404, latency: Date.now() - startTime });
        return;
      }

      if (stats.isDirectory()) {
        // Serve retro directory listing
        fs.readdir(filePath, (readErr, files) => {
          if (readErr) {
            res.writeHead(500);
            return res.end('Directory listing error');
          }

          let html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>SHTTPS // Directory: ${safeUrlPath}</title>
  <style>
    body { background: #0a0d12; color: #f8fafc; font-family: monospace; padding: 24px; }
    h1 { color: #00ff88; font-size: 20px; border-bottom: 2px solid #2b3544; padding-bottom: 12px; }
    a { color: #00f0ff; text-decoration: none; display: block; padding: 6px 10px; margin: 4px 0; border: 1px solid #2b3544; background: #12171f; }
    a:hover { background: #18202b; border-color: #00ff88; }
    .badge { color: #ffb703; float: right; font-size: 12px; }
    .upload-zone { margin-top: 24px; padding: 18px; border: 2px dashed #00ff88; background: #12171f; text-align: center; }
  </style>
</head>
<body>
  <h1>[SHTTPS NODE] ${protocol.toUpperCase()}://${req.headers.host}${safeUrlPath}</h1>
  ${safeUrlPath !== '/' ? `<a href="../">📁 ../ [Up One Level]</a>` : ''}
  <div>
    ${files.map(f => {
            const isSubDir = fs.statSync(path.join(filePath, f)).isDirectory();
            return `<a href="${encodeURIComponent(f)}">${isSubDir ? '📁' : '📄'} ${f} <span class="badge">${isSubDir ? 'DIR' : 'FILE'}</span></a>`;
          }).join('')}
  </div>
  ${enableUploads ? `
    <div class="upload-zone">
      <h3>🚀 Quick File Upload</h3>
      <form action="/_upload" method="POST" enctype="multipart/form-data">
        <input type="file" name="files" multiple style="margin-bottom: 10px;" />
        <button type="submit" style="background: #00ff88; color: #000; border: none; padding: 8px 16px; font-weight: bold; cursor: pointer;">Upload File(s)</button>
      </form>
    </div>
  ` : ''}
</body>
</html>`;

          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(html);
          logRequest({ method: req.method, url: req.url, status: 200, latency: Date.now() - startTime });
        });
      } else {
        // Stream file
        const stream = fs.createReadStream(filePath);
        stream.on('open', () => {
          res.writeHead(200);
          stream.pipe(res);
        });
        stream.on('error', () => {
          res.writeHead(500);
          res.end('Read stream error');
        });
        stream.on('data', chunk => {
          if (serverInstance) serverInstance.bytesTransferred += chunk.length;
        });
        res.on('finish', () => {
          logRequest({ method: req.method, url: req.url, status: 200, latency: Date.now() - startTime });
        });
      }
    });
  };

  try {
    let server;
    if (protocol === 'https') {
      // Generate SSL certificate
      const attrs = [{ name: 'commonName', value: 'localhost' }];
      const pems = selfsigned.generate(attrs, {
        days: 365,
        keySize: 2048,
        algorithm: 'sha256',
        extensions: [
          { name: 'basicConstraints', cA: true },
          {
            name: 'subjectAltName',
            altNames: [
              { type: 2, value: 'localhost' },
              { type: 7, ip: '127.0.0.1' },
              { type: 7, ip: localIP }
            ]
          }
        ]
      });

      server = https.createServer({ key: pems.private, cert: pems.cert }, requestListener);
    } else {
      server = http.createServer(requestListener);
    }

    server.listen(targetPort, () => {
      runningServers.set(targetPort, {
        server,
        port: targetPort,
        protocol,
        rootDir,
        username,
        password,
        enableUploads,
        enableCORS,
        startedAt: new Date().toISOString(),
        requestsCount: 0,
        bytesTransferred: 0,
        logs
      });

      res.json({
        success: true,
        port: targetPort,
        protocol,
        localUrl: `${protocol}://localhost:${targetPort}`,
        lanUrl: `${protocol}://${localIP}:${targetPort}`,
        rootDir
      });
    });

    server.on('error', (err) => {
      res.status(500).json({ error: `Server failed on port ${targetPort}: ${err.message}` });
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/shttps/stop', (req, res) => {
  const { port } = req.body;
  const srv = runningServers.get(Number(port));
  if (!srv) return res.status(404).json({ error: `No active server found on port ${port}` });

  srv.server.close(() => {
    runningServers.delete(Number(port));
    res.json({ success: true, message: `Server on port ${port} stopped.` });
  });
});

app.get('/api/shttps/logs/:port', (req, res) => {
  const srv = runningServers.get(Number(req.params.port));
  if (!srv) return res.status(404).json({ error: 'Server not found' });
  res.json(srv.logs || []);
});

// -------------------------------------------------------------
// 4. NETWORK & DEV SANDBOX TOOLS
// -------------------------------------------------------------
app.post('/api/net/dns', async (req, res) => {
  const { domain } = req.body;
  if (!domain) return res.status(400).json({ error: 'Domain required' });

  try {
    const cleanDomain = domain.replace(/^https?:\/\//, '').split('/')[0];
    const [a, aaaa, mx, txt, ns, cname] = await Promise.allSettled([
      dns.resolve4(cleanDomain),
      dns.resolve6(cleanDomain),
      dns.resolveMx(cleanDomain),
      dns.resolveTxt(cleanDomain),
      dns.resolveNs(cleanDomain),
      dns.resolveCname(cleanDomain)
    ]);

    res.json({
      domain: cleanDomain,
      A: a.status === 'fulfilled' ? a.value : [],
      AAAA: aaaa.status === 'fulfilled' ? aaaa.value : [],
      MX: mx.status === 'fulfilled' ? mx.value : [],
      TXT: txt.status === 'fulfilled' ? txt.value.flat() : [],
      NS: ns.status === 'fulfilled' ? ns.value : [],
      CNAME: cname.status === 'fulfilled' ? cname.value : []
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

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
    JSON,
    setTimeout: null,
    process: null,
    require: null
  };

  try {
    const script = new vm.Script(code);
    const context = vm.createContext(sandbox);
    const startTime = Date.now();
    const result = script.runInContext(context, { timeout: 3000 });
    const executionTime = Date.now() - startTime;

    res.json({
      success: true,
      result: result !== undefined ? String(result) : undefined,
      logs,
      executionTime
    });
  } catch (err) {
    res.json({
      success: false,
      error: err.message,
      logs
    });
  }
});

// -------------------------------------------------------------
// 5. GENUINE NETWORK SPEED TEST ENDPOINTS (Ping, Download, Upload)
// -------------------------------------------------------------
app.get('/api/speedtest/ping', (req, res) => {
  res.set({
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
  });
  res.json({ timestamp: Date.now(), ip: req.ip });
});

app.get('/api/speedtest/download', (req, res) => {
  const requestedBytes = parseInt(req.query.bytes || req.query.size || '15728640', 10);
  const size = Math.min(Math.max(isNaN(requestedBytes) ? 15728640 : requestedBytes, 1024), 52428800);

  res.set({
    'Content-Type': 'application/octet-stream',
    'Content-Length': size,
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
    'Content-Disposition': 'attachment; filename="speedtest.bin"'
  });

  const chunkSize = 65536; // 64KB random buffer
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

app.post('/api/speedtest/upload', express.raw({ type: '*/*', limit: '100mb' }), (req, res) => {
  const bytes = req.body ? req.body.length : 0;
  res.set({
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
  });
  res.json({
    success: true,
    bytesReceived: bytes,
    timestamp: Date.now()
  });
});

// Serve static frontend build if available
const distPath = path.join(rootDir, 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`[OMNI-DECK SERVER] Online at http://localhost:${PORT}`);
  console.log(`[SYSTEM] Cyber-Suite Initialized`);
});

