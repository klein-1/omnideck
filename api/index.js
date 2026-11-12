import express from 'express';
import cors from 'cors';
import dns from 'dns/promises';
import vm from 'vm';
import crypto from 'crypto';

const app = express();
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
    } catch (e) {}

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

// 5. DOWNLOADER FALLBACK FOR SERVERLESS
app.all('/api/downloader/*', (req, res) => {
  res.json({
    isCloudHost: true,
    message: "Universal 4K stream extraction requires local desktop companion binary (yt-dlp). Run 'node server/index.js' locally on your PC for unthrottled downloads."
  });
});

export default app;

