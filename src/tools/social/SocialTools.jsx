import React, { useState, useEffect } from 'react';
import { 
  Share2, Wifi, Sparkles, ExternalLink, Copy, Check, 
  Link2, Eye, Hash, Image, Smartphone, Globe, Layers, AlertCircle, Plus, Trash2, Download
} from 'lucide-react';
import QRCode from 'qrcode';
import { playClick, playCoin, playSuccess } from '../../audio/soundEffects';

export default function SocialTools() {
  const [activeTab, setActiveTab] = useState('ogpreview'); 
  // 'ogpreview' | 'utm' | 'counter' | 'biolink' | 'hashtags' | 'sizes' | 'wifi' | 'captions'

  const [copied, setCopied] = useState(false);
  const copyText = (txt) => {
    navigator.clipboard.writeText(txt);
    setCopied(true);
    playClick();
    setTimeout(() => setCopied(false), 1500);
  };

  // 1. OPEN GRAPH META PREVIEWER
  const [ogTitle, setOgTitle] = useState('Omni-Deck // High-Density Cyber Utilities');
  const [ogDesc, setOgDesc] = useState('An offline-first, pixel-crafted cyber utility suite with 130+ tools for developers, creators, and engineers.');
  const [ogUrl, setOgUrl] = useState('https://omnideck.local');
  const [ogImage, setOgImage] = useState('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80');
  const [ogSiteName, setOgSiteName] = useState('Omni-Deck');
  const [ogPreviewMode, setOgPreviewMode] = useState('twitter'); // 'twitter' | 'facebook' | 'discord'

  // 2. UTM CAMPAIGN LINK BUILDER
  const [utmUrl, setUtmUrl] = useState('https://mysite.com/launch');
  const [utmSource, setUtmSource] = useState('twitter');
  const [utmMedium, setUtmMedium] = useState('social');
  const [utmCampaign, setUtmCampaign] = useState('cyber_launch_2026');
  const [utmTerm, setUtmTerm] = useState('');
  const [utmContent, setUtmContent] = useState('hero_button');

  const buildUtmUrl = () => {
    if (!utmUrl) return '';
    try {
      const url = new URL(utmUrl.startsWith('http') ? utmUrl : `https://${utmUrl}`);
      if (utmSource) url.searchParams.set('utm_source', utmSource);
      if (utmMedium) url.searchParams.set('utm_medium', utmMedium);
      if (utmCampaign) url.searchParams.set('utm_campaign', utmCampaign);
      if (utmTerm) url.searchParams.set('utm_term', utmTerm);
      if (utmContent) url.searchParams.set('utm_content', utmContent);
      return url.toString();
    } catch {
      return `${utmUrl}?utm_source=${utmSource}&utm_medium=${utmMedium}&utm_campaign=${utmCampaign}`;
    }
  };
  const generatedUtmUrl = buildUtmUrl();

  // 3. SOCIAL POST CHARACTER COUNTER
  const [postText, setPostText] = useState('Leveling up my digital workspace with Omni-Deck. 130+ retro cybernetic tools all running offline in the browser! #webdev #cyberpunk #productivity');
  const postChars = postText.length;
  const postWords = postText.trim() ? postText.trim().split(/\s+/).length : 0;
  const postLines = postText ? postText.split('\n').length : 0;
  const postEmojis = (postText.match(/[\uD800-\uDBFF][\uDC00-\uDFFF]|\p{Emoji_Presentation}/gu) || []).length;

  const socialLimits = [
    { name: 'X / Twitter', max: 280, color: 'arcade-cyan' },
    { name: 'Threads', max: 500, color: 'arcade-purple' },
    { name: 'Instagram Caption', max: 2200, color: 'arcade-pink' },
    { name: 'LinkedIn Post', max: 3000, color: 'arcade-blue' },
    { name: 'Facebook Post', max: 63206, color: 'arcade-emerald' },
  ];

  // 4. LINK BIO BUILDER
  const [bioHandle, setBioHandle] = useState('@cyber_architect');
  const [bioTagline, setBioTagline] = useState('Building cybernetic web tools & pixel interfaces.');
  const [bioAvatar, setBioAvatar] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80');
  const [bioLinks, setBioLinks] = useState([
    { id: 1, title: '👾 Omni-Deck Official Portal', url: 'https://github.com/klein-1/omnideck' },
    { id: 2, title: '⚡ YouTube Creator Channel', url: 'https://youtube.com' },
    { id: 3, title: '🚀 My Digital Portfolio', url: 'https://portfolio.dev' },
    { id: 4, title: '☕ Buy Me A Pixel Coffee', url: 'https://buymeacoffee.com' },
  ]);
  const [newLinkTitle, setNewLinkTitle] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');

  const addBioLink = () => {
    if (!newLinkTitle || !newLinkUrl) return;
    setBioLinks([...bioLinks, { id: Date.now(), title: newLinkTitle, url: newLinkUrl }]);
    setNewLinkTitle('');
    setNewLinkUrl('');
    playCoin();
  };

  const removeBioLink = (id) => {
    setBioLinks(bioLinks.filter(l => l.id !== id));
    playClick();
  };

  const exportBioHtml = () => {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${bioHandle} // Links</title>
  <style>
    body { background: #0a0d12; color: #fff; font-family: monospace; display: flex; flex-direction: column; align-items: center; padding: 40px 16px; margin: 0; }
    .avatar { width: 90px; height: 90px; border-radius: 50%; border: 3px solid #00f0ff; object-fit: cover; }
    h1 { margin: 16px 0 6px; font-size: 1.25rem; color: #00ff88; }
    p { color: #8892b0; margin-bottom: 24px; text-align: center; max-width: 320px; font-size: 0.85rem; }
    .links { width: 100%; max-width: 400px; display: flex; flex-direction: column; gap: 12px; }
    .link-btn { display: block; text-align: center; padding: 14px; background: #131a26; border: 2px solid #2d3b55; color: #fff; text-decoration: none; font-weight: bold; font-size: 0.9rem; transition: all 0.15s; }
    .link-btn:hover { background: #00ff88; color: #000; border-color: #000; transform: translate(-2px, -2px); box-shadow: 4px 4px 0 #000; }
  </style>
</head>
<body>
  <img src="${bioAvatar}" alt="${bioHandle}" class="avatar" />
  <h1>${bioHandle}</h1>
  <p>${bioTagline}</p>
  <div class="links">
    ${bioLinks.map(l => `<a href="${l.url}" target="_blank" class="link-btn">${l.title}</a>`).join('\n    ')}
  </div>
</body>
</html>`;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${bioHandle.replace('@', '')}_bio.html`;
    a.click();
    playSuccess();
  };

  // 5. HASHTAG GENERATOR & CLEANER
  const [tagTopic, setTagTopic] = useState('cyberpunk web development coding tech');
  const [generatedTags, setGeneratedTags] = useState([]);
  const [customTagInput, setCustomTagInput] = useState('#webdev, #coding, tech, reactjs!! #frontend');

  const generateTagsFromTopic = () => {
    playClick();
    const rawWords = tagTopic.toLowerCase().split(/\s+/).filter(w => w.length > 2);
    const tagBank = {
      cyber: ['cyberpunk', 'cyberdeck', 'matrix', 'retrotech', 'scifi', 'synthwave', 'techno'],
      code: ['coding', 'developer', 'programmer', 'webdev', '100daysofcode', 'softwareengineer'],
      web: ['webdesign', 'uiux', 'frontend', 'javascript', 'reactjs', 'fullstack', 'cssart'],
      tech: ['technology', 'futuretech', 'innovation', 'gadgets', 'ai', 'opensource', 'hardware'],
      design: ['minimalism', 'graphicdesign', 'pixelart', 'swissdesign', 'typography'],
      dev: ['devlife', 'learntocode', 'buildinpublic', 'indiehackers', 'cleancode'],
    };

    const result = new Set();
    rawWords.forEach(w => {
      result.add(w.replace(/[^a-z0-9]/g, ''));
      Object.keys(tagBank).forEach(category => {
        if (w.includes(category) || category.includes(w)) {
          tagBank[category].forEach(tag => result.add(tag));
        }
      });
    });

    if (result.size < 8) {
      ['cyberdeck', 'webdevelopment', 'software', 'techtrends', 'codinglife', 'pixeldesign'].forEach(t => result.add(t));
    }
    setGeneratedTags(Array.from(result).slice(0, 24));
    playCoin();
  };

  const cleanCustomTags = (format) => {
    playClick();
    const tags = customTagInput
      .split(/[\s,]+/)
      .map(t => t.replace(/[^a-zA-Z0-9_]/g, ''))
      .filter(Boolean);
    const unique = Array.from(new Set(tags));
    if (format === 'hash') {
      return unique.map(t => `#${t}`).join(' ');
    } else if (format === 'comma') {
      return unique.map(t => `#${t}`).join(', ');
    } else {
      return unique.join(' ');
    }
  };

  // 6. SOCIAL MEDIA IMAGE SIZES CHEAT SHEET
  const sizeCheatSheet = [
    { platform: 'YouTube', type: 'Banner (Channel Art)', dim: '2560 x 1440 px', aspect: '16:9', safe: '1546 x 423 px safe area' },
    { platform: 'YouTube', type: 'Video Thumbnail', dim: '1280 x 720 px', aspect: '16:9', safe: 'Min 640px width' },
    { platform: 'YouTube', type: 'Profile Icon', dim: '800 x 800 px', aspect: '1:1', safe: 'Renders circle' },
    { platform: 'X / Twitter', type: 'Header Banner', dim: '1500 x 500 px', aspect: '3:1', safe: 'Leave bottom-left for avatar' },
    { platform: 'X / Twitter', type: 'Feed Post Image', dim: '1600 x 900 px', aspect: '16:9', safe: 'Auto crops on mobile' },
    { platform: 'Instagram', type: 'Square Post', dim: '1080 x 1080 px', aspect: '1:1', safe: 'Universal standard' },
    { platform: 'Instagram', type: 'Portrait Post', dim: '1080 x 1350 px', aspect: '4:5', safe: 'Maximum feed screen estate' },
    { platform: 'Instagram', type: 'Story / Reel', dim: '1080 x 1920 px', aspect: '9:16', safe: 'Keep top/bottom 250px clear' },
    { platform: 'LinkedIn', type: 'Company Banner', dim: '1128 x 191 px', aspect: '5.9:1', safe: 'Desktop panoramic' },
    { platform: 'LinkedIn', type: 'Feed Post Image', dim: '1200 x 627 px', aspect: '1.91:1', safe: 'OpenGraph preview standard' },
    { platform: 'TikTok', type: 'Video Full Screen', dim: '1080 x 1920 px', aspect: '9:16', safe: 'Right edge for UI icons' },
    { platform: 'Twitch', type: 'Profile Banner', dim: '1200 x 480 px', aspect: '5:2', safe: 'Responsive scaling' },
  ];
  const [sizeFilter, setSizeFilter] = useState('All');

  // 7. QR WI-FI SHARE
  const [wifiSsid, setWifiSsid] = useState('CyberDeck_5G');
  const [wifiPass, setWifiPass] = useState('retro2026!');
  const [wifiAuth, setWifiAuth] = useState('WPA');
  const [wifiQrUrl, setWifiQrUrl] = useState('');

  useEffect(() => {
    const wifiString = `WIFI:S:${wifiSsid};T:${wifiAuth};P:${wifiPass};;`;
    QRCode.toDataURL(wifiString, {
      width: 260,
      margin: 2,
      color: { dark: '#000000', light: '#ffffff' }
    }).then(setWifiQrUrl);
  }, [wifiSsid, wifiPass, wifiAuth]);

  // 8. CAPTION GENERATOR
  const [captionTopic, setCaptionTopic] = useState('New high-density cyber deck launch');
  const [captionVibe, setCaptionVibe] = useState('hype');
  const [generatedCaption, setGeneratedCaption] = useState('');

  const generateCaption = () => {
    playClick();
    let text = '';
    if (captionVibe === 'hype') {
      text = `⚡ Massive upgrade unlocked! ${captionTopic}. Beyond excited to share what's coming next. #LevelUp #Innovation #TechVibes`;
    } else if (captionVibe === 'minimal') {
      text = `Simplicity meets craft. ${captionTopic}. // Omni-Deck`;
    } else {
      text = `Excited to announce our latest milestone: ${captionTopic}. Building the future step by step.`;
    }
    setGeneratedCaption(text);
    playCoin();
  };

  return (
    <div className="space-y-6">
      {/* Subtool Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar border-b-2 border-deck-border pb-3">
        {[
          { id: 'ogpreview', label: 'OPEN GRAPH PREVIEW', icon: Eye, activeClass: 'btn-pixel-cyan' },
          { id: 'utm', label: 'UTM LINK BUILDER', icon: Link2, activeClass: 'btn-pixel-emerald' },
          { id: 'counter', label: 'POST LIMIT AUDITOR', icon: Smartphone, activeClass: 'btn-pixel-amber' },
          { id: 'biolink', label: 'BIO-LINK BUILDER', icon: Globe, activeClass: 'btn-pixel-violet' },
          { id: 'hashtags', label: 'HASHTAG MATRIX', icon: Hash, activeClass: 'btn-pixel-pink' },
          { id: 'sizes', label: 'IMAGE SIZES GUIDE', icon: Image, activeClass: 'btn-pixel-orange' },
          { id: 'wifi', label: 'WI-FI QR PASS', icon: Wifi, activeClass: 'btn-pixel-lime' },
          { id: 'captions', label: 'CAPTION CRAFTER', icon: Sparkles, activeClass: 'btn-pixel-purple' },
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

      {/* 1. OPEN GRAPH META PREVIEWER */}
      {activeTab === 'ogpreview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 font-mono text-xs">
          {/* Inputs */}
          <div className="pixel-card bg-deck-dark p-6 space-y-4 border border-deck-border">
            <span className="font-pixel text-[10px] text-arcade-cyan uppercase">METADATA PARAMETERS</span>
            <div>
              <label className="text-arcade-muted block mb-1">Page Title</label>
              <input
                type="text"
                value={ogTitle}
                onChange={(e) => setOgTitle(e.target.value)}
                className="w-full bg-deck-bg border border-deck-border p-2 text-white"
              />
            </div>
            <div>
              <label className="text-arcade-muted block mb-1">Description</label>
              <textarea
                value={ogDesc}
                onChange={(e) => setOgDesc(e.target.value)}
                rows={3}
                className="w-full bg-deck-bg border border-deck-border p-2 text-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-arcade-muted block mb-1">Canonical URL</label>
                <input
                  type="text"
                  value={ogUrl}
                  onChange={(e) => setOgUrl(e.target.value)}
                  className="w-full bg-deck-bg border border-deck-border p-2 text-white"
                />
              </div>
              <div>
                <label className="text-arcade-muted block mb-1">Site Name</label>
                <input
                  type="text"
                  value={ogSiteName}
                  onChange={(e) => setOgSiteName(e.target.value)}
                  className="w-full bg-deck-bg border border-deck-border p-2 text-white"
                />
              </div>
            </div>
            <div>
              <label className="text-arcade-muted block mb-1">OG Image URL</label>
              <input
                type="text"
                value={ogImage}
                onChange={(e) => setOgImage(e.target.value)}
                className="w-full bg-deck-bg border border-deck-border p-2 text-white"
              />
            </div>
            {/* HTML Meta Code Copy */}
            <div className="pt-2">
              <button
                onClick={() => copyText(`<meta property="og:title" content="${ogTitle}" />\n<meta property="og:description" content="${ogDesc}" />\n<meta property="og:url" content="${ogUrl}" />\n<meta property="og:image" content="${ogImage}" />\n<meta property="og:site_name" content="${ogSiteName}" />\n<meta name="twitter:card" content="summary_large_image" />`)}
                className="btn-pixel btn-pixel-cyan w-full py-2.5 font-pixel text-[10px] flex items-center justify-center gap-2"
              >
                {copied ? <Check className="w-4 h-4 text-black" /> : <Copy className="w-4 h-4" />}
                COPY HTML META TAGS
              </button>
            </div>
          </div>

          {/* Live Preview Card */}
          <div className="pixel-card bg-deck-dark p-6 space-y-4 border border-deck-border">
            <div className="flex justify-between items-center border-b border-deck-border pb-2">
              <span className="font-pixel text-[10px] text-arcade-emerald uppercase">LIVE SOCIAL RENDER</span>
              <div className="flex gap-1.5">
                {['twitter', 'facebook', 'discord'].map(p => (
                  <button
                    key={p}
                    onClick={() => setOgPreviewMode(p)}
                    className={`px-2 py-1 font-pixel text-[8px] uppercase border ${
                      ogPreviewMode === p ? 'bg-deck-surface border-arcade-cyan text-arcade-cyan' : 'bg-deck-bg border-deck-border text-arcade-muted'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Twitter Large Card */}
            {ogPreviewMode === 'twitter' && (
              <div className="border border-slate-700 rounded-2xl overflow-hidden bg-black max-w-sm mx-auto shadow-xl">
                <div className="h-44 bg-slate-800 overflow-hidden relative">
                  <img src={ogImage} alt="OG" className="w-full h-full object-cover" onError={(e) => e.target.style.display='none'} />
                </div>
                <div className="p-3 space-y-1">
                  <div className="text-[11px] text-slate-400 truncate">{ogUrl.replace(/^https?:\/\//, '')}</div>
                  <div className="text-sm font-bold text-white line-clamp-1">{ogTitle}</div>
                  <div className="text-xs text-slate-400 line-clamp-2 leading-snug">{ogDesc}</div>
                </div>
              </div>
            )}

            {/* Facebook Card */}
            {ogPreviewMode === 'facebook' && (
              <div className="border border-slate-700 bg-[#242526] max-w-sm mx-auto shadow-xl">
                <div className="h-44 bg-slate-800 overflow-hidden">
                  <img src={ogImage} alt="OG" className="w-full h-full object-cover" onError={(e) => e.target.style.display='none'} />
                </div>
                <div className="p-3 space-y-1 border-t border-slate-700">
                  <div className="text-[10px] text-slate-400 uppercase font-sans tracking-wide">{ogUrl.replace(/^https?:\/\//, '').toUpperCase()}</div>
                  <div className="text-sm font-bold text-white line-clamp-1 font-sans">{ogTitle}</div>
                  <div className="text-xs text-slate-400 line-clamp-2 leading-snug font-sans">{ogDesc}</div>
                </div>
              </div>
            )}

            {/* Discord Embed */}
            {ogPreviewMode === 'discord' && (
              <div className="border-l-4 border-arcade-cyan bg-[#2f3136] p-3 rounded max-w-sm mx-auto space-y-2 shadow-xl">
                <div className="text-[11px] text-slate-400 font-sans">{ogSiteName}</div>
                <a href={ogUrl} target="_blank" rel="noreferrer" className="text-sm font-bold text-cyan-400 hover:underline block font-sans">
                  {ogTitle}
                </a>
                <div className="text-xs text-slate-300 font-sans leading-snug">{ogDesc}</div>
                <div className="h-40 rounded overflow-hidden mt-2">
                  <img src={ogImage} alt="OG" className="w-full h-full object-cover" onError={(e) => e.target.style.display='none'} />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. UTM CAMPAIGN LINK BUILDER */}
      {activeTab === 'utm' && (
        <div className="max-w-2xl mx-auto pixel-card bg-deck-dark p-6 space-y-4 border border-deck-border font-mono text-xs">
          <span className="font-pixel text-[10px] text-arcade-emerald uppercase">MARKETING UTM CAMPAIGN GENERATOR</span>
          <p className="text-arcade-muted text-xs">Generate trackable, analytics-ready URLs for Google Analytics 4, Mixpanel, and PostHog.</p>

          <div className="space-y-3">
            <div>
              <label className="text-arcade-muted block mb-1">Target Website URL *</label>
              <input
                type="text"
                value={utmUrl}
                onChange={(e) => setUtmUrl(e.target.value)}
                placeholder="https://example.com/landing"
                className="w-full bg-deck-bg border border-deck-border p-2 text-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-arcade-muted block mb-1">Campaign Source (utm_source) *</label>
                <input
                  type="text"
                  value={utmSource}
                  onChange={(e) => setUtmSource(e.target.value)}
                  placeholder="e.g. twitter, google, newsletter"
                  className="w-full bg-deck-bg border border-deck-border p-2 text-arcade-cyan"
                />
              </div>
              <div>
                <label className="text-arcade-muted block mb-1">Campaign Medium (utm_medium) *</label>
                <input
                  type="text"
                  value={utmMedium}
                  onChange={(e) => setUtmMedium(e.target.value)}
                  placeholder="e.g. social, cpc, email"
                  className="w-full bg-deck-bg border border-deck-border p-2 text-arcade-cyan"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-arcade-muted block mb-1">Campaign Name (utm_campaign)</label>
                <input
                  type="text"
                  value={utmCampaign}
                  onChange={(e) => setUtmCampaign(e.target.value)}
                  placeholder="e.g. cyber_launch"
                  className="w-full bg-deck-bg border border-deck-border p-2 text-white"
                />
              </div>
              <div>
                <label className="text-arcade-muted block mb-1">Campaign Term (utm_term)</label>
                <input
                  type="text"
                  value={utmTerm}
                  onChange={(e) => setUtmTerm(e.target.value)}
                  placeholder="e.g. keywords"
                  className="w-full bg-deck-bg border border-deck-border p-2 text-white"
                />
              </div>
              <div>
                <label className="text-arcade-muted block mb-1">Campaign Content (utm_content)</label>
                <input
                  type="text"
                  value={utmContent}
                  onChange={(e) => setUtmContent(e.target.value)}
                  placeholder="e.g. banner_a"
                  className="w-full bg-deck-bg border border-deck-border p-2 text-white"
                />
              </div>
            </div>

            {/* Quick Presets */}
            <div className="flex flex-wrap gap-2 pt-1 items-center">
              <span className="text-[10px] text-arcade-muted uppercase">PRESETS:</span>
              {[
                { s: 'twitter', m: 'social' },
                { s: 'linkedin', m: 'post' },
                { s: 'google', m: 'cpc' },
                { s: 'newsletter', m: 'email' },
                { s: 'youtube', m: 'video_desc' },
              ].map(p => (
                <button
                  key={p.s}
                  onClick={() => { setUtmSource(p.s); setUtmMedium(p.m); playClick(); }}
                  className="px-2 py-1 bg-deck-bg border border-deck-border text-arcade-muted hover:text-white text-[10px]"
                >
                  {p.s} / {p.m}
                </button>
              ))}
            </div>

            {/* Result Box */}
            <div className="p-3 bg-deck-bg border border-arcade-emerald space-y-2 mt-4">
              <div className="flex justify-between items-center text-arcade-emerald">
                <span className="font-pixel text-[9px]">COMPILED TRACKING URL</span>
                <button onClick={() => copyText(generatedUtmUrl)} className="text-[10px] text-white hover:underline flex items-center gap-1">
                  {copied ? <Check className="w-3.5 h-3.5 text-arcade-emerald" /> : <Copy className="w-3.5 h-3.5" />} COPY URL
                </button>
              </div>
              <div className="p-2 bg-deck-dark border border-deck-border break-all select-all font-mono text-[11px] text-white">
                {generatedUtmUrl}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. POST LIMIT AUDITOR */}
      {activeTab === 'counter' && (
        <div className="max-w-2xl mx-auto pixel-card bg-deck-dark p-6 space-y-5 border border-deck-border font-mono text-xs">
          <div className="flex justify-between items-center border-b border-deck-border pb-3">
            <span className="font-pixel text-[10px] text-arcade-amber uppercase">CROSS-PLATFORM POST AUDITOR</span>
            <div className="flex gap-3 text-[11px]">
              <span>Chars: <strong className="text-arcade-amber font-pixel">{postChars}</strong></span>
              <span>Words: <strong className="text-arcade-cyan font-pixel">{postWords}</strong></span>
              <span>Emojis: <strong className="text-arcade-pink font-pixel">{postEmojis}</strong></span>
            </div>
          </div>

          <textarea
            value={postText}
            onChange={(e) => setPostText(e.target.value)}
            rows={5}
            placeholder="Draft your post or tweet here..."
            className="w-full bg-deck-bg border border-deck-border p-3 text-white focus:outline-none"
          />

          <div className="space-y-3">
            {socialLimits.map(item => {
              const remaining = item.max - postChars;
              const percent = Math.min(100, Math.round((postChars / item.max) * 100));
              const isOver = remaining < 0;

              return (
                <div key={item.name} className="p-2.5 bg-deck-bg border border-deck-border space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-white">{item.name}</span>
                    <span className={`font-pixel text-[10px] ${isOver ? 'text-arcade-coral font-bold animate-pulse' : 'text-arcade-muted'}`}>
                      {isOver ? `OVER BY ${Math.abs(remaining)}` : `${remaining} LEFT`} ({postChars}/{item.max})
                    </span>
                  </div>
                  <div className="w-full h-2 bg-deck-dark border border-black overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        isOver ? 'bg-arcade-coral' : percent > 85 ? 'bg-arcade-amber' : 'bg-arcade-emerald'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. BIO-LINK BUILDER */}
      {activeTab === 'biolink' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 font-mono text-xs">
          {/* Builder controls */}
          <div className="pixel-card bg-deck-dark p-6 space-y-4 border border-deck-border">
            <span className="font-pixel text-[10px] text-arcade-violet uppercase">BIO PROFILE CONFIG</span>

            <div className="space-y-3">
              <div>
                <label className="text-arcade-muted block mb-1">Handle / Name</label>
                <input
                  type="text"
                  value={bioHandle}
                  onChange={(e) => setBioHandle(e.target.value)}
                  className="w-full bg-deck-bg border border-deck-border p-2 text-white"
                />
              </div>
              <div>
                <label className="text-arcade-muted block mb-1">Bio Tagline</label>
                <input
                  type="text"
                  value={bioTagline}
                  onChange={(e) => setBioTagline(e.target.value)}
                  className="w-full bg-deck-bg border border-deck-border p-2 text-white"
                />
              </div>
              <div>
                <label className="text-arcade-muted block mb-1">Avatar Image URL</label>
                <input
                  type="text"
                  value={bioAvatar}
                  onChange={(e) => setBioAvatar(e.target.value)}
                  className="w-full bg-deck-bg border border-deck-border p-2 text-white"
                />
              </div>
            </div>

            <div className="border-t border-deck-border pt-3 space-y-2">
              <span className="font-pixel text-[9px] text-arcade-cyan uppercase">ADD BUTTON LINK</span>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Button Label"
                  value={newLinkTitle}
                  onChange={(e) => setNewLinkTitle(e.target.value)}
                  className="bg-deck-bg border border-deck-border p-2 text-white"
                />
                <input
                  type="text"
                  placeholder="https://..."
                  value={newLinkUrl}
                  onChange={(e) => setNewLinkUrl(e.target.value)}
                  className="bg-deck-bg border border-deck-border p-2 text-white"
                />
              </div>
              <button
                onClick={addBioLink}
                className="btn-pixel btn-pixel-surface w-full py-2 font-pixel text-[10px] flex items-center justify-center gap-1.5 text-arcade-emerald hover:border-arcade-emerald"
              >
                <Plus className="w-3.5 h-3.5" /> ADD LINK TO BIO
              </button>
            </div>

            {/* List of links */}
            <div className="space-y-1.5 pt-1">
              {bioLinks.map(link => (
                <div key={link.id} className="p-2 bg-deck-bg border border-deck-border flex justify-between items-center">
                  <div className="truncate pr-2">
                    <span className="font-bold text-white">{link.title}</span>
                    <span className="text-[10px] text-arcade-muted block truncate">{link.url}</span>
                  </div>
                  <button onClick={() => removeBioLink(link.id)} className="text-arcade-coral hover:text-red-400 p-1">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={exportBioHtml}
              className="btn-pixel btn-pixel-violet w-full py-2.5 font-pixel text-[10px] flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" /> EXPORT STANDALONE HTML FILE
            </button>
          </div>

          {/* Live Mobile Mockup */}
          <div className="pixel-card bg-deck-dark p-6 flex flex-col items-center justify-center border border-deck-border">
            <span className="font-pixel text-[10px] text-arcade-muted mb-4 uppercase">MOBILE DEVICE PREVIEW</span>
            <div className="w-[280px] h-[520px] bg-[#0c1017] border-4 border-black rounded-3xl p-5 shadow-pixel-lg flex flex-col items-center overflow-y-auto no-scrollbar relative">
              <div className="w-20 h-4 bg-black rounded-full mb-3 shrink-0"></div>
              <img src={bioAvatar} alt="avatar" className="w-16 h-16 rounded-full border-2 border-arcade-cyan object-cover shrink-0 shadow-md" onError={(e) => e.target.style.display='none'} />
              <div className="font-pixel text-[11px] text-white mt-2 text-center">{bioHandle}</div>
              <div className="text-[10px] text-arcade-muted text-center mt-1 mb-4 leading-tight">{bioTagline}</div>

              <div className="w-full space-y-2 flex-1">
                {bioLinks.map(l => (
                  <a
                    key={l.id}
                    href={l.url}
                    target="_blank"
                    rel="noreferrer"
                    className="block w-full py-2.5 px-3 bg-[#161f2e] hover:bg-arcade-cyan hover:text-black border border-slate-700 font-mono text-[10px] font-bold text-center text-white transition-all shadow-sm truncate"
                  >
                    {l.title}
                  </a>
                ))}
              </div>
              <div className="text-[8px] text-arcade-muted font-pixel pt-3">POWERED BY OMNI-DECK</div>
            </div>
          </div>
        </div>
      )}

      {/* 5. HASHTAG MATRIX */}
      {activeTab === 'hashtags' && (
        <div className="max-w-2xl mx-auto pixel-card bg-deck-dark p-6 space-y-5 border border-deck-border font-mono text-xs">
          <span className="font-pixel text-[10px] text-arcade-pink uppercase">INTELLIGENT HASHTAG MATRIX & CLEANER</span>

          <div className="space-y-3">
            <div>
              <label className="text-arcade-muted block mb-1">Keywords / Topic</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tagTopic}
                  onChange={(e) => setTagTopic(e.target.value)}
                  placeholder="e.g. coding cyberpunk webdev AI"
                  className="flex-1 bg-deck-bg border border-deck-border p-2 text-white"
                />
                <button
                  onClick={generateTagsFromTopic}
                  className="btn-pixel btn-pixel-pink px-4 py-2 font-pixel text-[10px]"
                >
                  GENERATE
                </button>
              </div>
            </div>

            {generatedTags.length > 0 && (
              <div className="p-4 bg-deck-bg border border-deck-border space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-pixel text-[9px] text-arcade-pink">{generatedTags.length} HASHTAGS GENERATED</span>
                  <button
                    onClick={() => copyText(generatedTags.map(t => `#${t}`).join(' '))}
                    className="btn-pixel btn-pixel-surface px-3 py-1 font-pixel text-[8px] flex items-center gap-1 text-white"
                  >
                    <Copy className="w-3 h-3" /> COPY ALL
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {generatedTags.map(t => (
                    <span
                      key={t}
                      onClick={() => copyText(`#${t}`)}
                      className="cursor-pointer px-2 py-1 bg-deck-dark border border-deck-border hover:border-arcade-pink text-arcade-cyan hover:text-white text-[11px]"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="border-t border-deck-border pt-4 space-y-2">
              <label className="text-arcade-muted block mb-1">Hashtag Stripper & Cleaner</label>
              <textarea
                value={customTagInput}
                onChange={(e) => setCustomTagInput(e.target.value)}
                rows={3}
                placeholder="Paste dirty comma/space separated text with symbols..."
                className="w-full bg-deck-bg border border-deck-border p-2 text-white"
              />
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => copyText(cleanCustomTags('hash'))}
                  className="btn-pixel btn-pixel-cyan px-3 py-1.5 font-pixel text-[9px] flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" /> COPY CLEAN (#tag1 #tag2)
                </button>
                <button
                  onClick={() => copyText(cleanCustomTags('comma'))}
                  className="btn-pixel btn-pixel-surface px-3 py-1.5 font-pixel text-[9px] flex items-center gap-1 text-white"
                >
                  <Copy className="w-3 h-3" /> COPY COMMA (#tag1, #tag2)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. IMAGE SIZES GUIDE */}
      {activeTab === 'sizes' && (
        <div className="max-w-4xl mx-auto pixel-card bg-deck-dark p-6 space-y-4 border border-deck-border font-mono text-xs">
          <div className="flex flex-wrap justify-between items-center gap-2 border-b border-deck-border pb-3">
            <span className="font-pixel text-[10px] text-arcade-orange uppercase">2026 SOCIAL MEDIA DIMENSION CHEAT SHEET</span>
            <div className="flex flex-wrap gap-1.5">
              {['All', 'YouTube', 'X / Twitter', 'Instagram', 'LinkedIn', 'TikTok'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setSizeFilter(cat)}
                  className={`px-2 py-1 font-pixel text-[8px] uppercase border ${
                    sizeFilter === cat ? 'bg-deck-surface border-arcade-orange text-arcade-orange' : 'bg-deck-bg border-deck-border text-arcade-muted'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {sizeCheatSheet
              .filter(item => sizeFilter === 'All' || item.platform === sizeFilter)
              .map((item, idx) => (
                <div key={idx} className="p-3 bg-deck-bg border border-deck-border space-y-1 hover:border-arcade-orange transition-colors">
                  <div className="flex justify-between items-center text-[10px] text-arcade-muted">
                    <span className="text-arcade-orange font-bold uppercase">{item.platform}</span>
                    <span className="bg-deck-dark px-1.5 py-0.5 border border-deck-border">{item.aspect}</span>
                  </div>
                  <div className="font-bold text-white text-xs">{item.type}</div>
                  <div className="font-pixel text-sm text-arcade-emerald pt-1">{item.dim}</div>
                  <div className="text-[10px] text-slate-400 pt-0.5">{item.safe}</div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* 7. QR WI-FI SHARE */}
      {activeTab === 'wifi' && (
        <div className="max-w-md mx-auto pixel-card bg-deck-dark p-6 space-y-4 border border-deck-border font-mono text-xs text-center">
          <span className="font-pixel text-[10px] text-arcade-cyan uppercase">INSTANT WI-FI ACCESS QR</span>

          <div className="space-y-3 text-left">
            <div>
              <label className="text-arcade-muted block mb-1">Network Name (SSID)</label>
              <input
                type="text"
                value={wifiSsid}
                onChange={(e) => setWifiSsid(e.target.value)}
                className="w-full bg-deck-bg border border-deck-border p-2 text-white"
              />
            </div>
            <div>
              <label className="text-arcade-muted block mb-1">Password</label>
              <input
                type="text"
                value={wifiPass}
                onChange={(e) => setWifiPass(e.target.value)}
                className="w-full bg-deck-bg border border-deck-border p-2 text-white"
              />
            </div>
          </div>

          {wifiQrUrl && (
            <div className="p-3 bg-white border-4 border-black inline-block mx-auto shadow-pixel">
              <img src={wifiQrUrl} alt="WiFi QR" className="w-48 h-48 mx-auto" />
            </div>
          )}

          <p className="text-arcade-muted text-[11px]">
            Guests scan this QR code with iOS/Android camera to join Wi-Fi instantly without typing password.
          </p>
        </div>
      )}

      {/* 8. CAPTION GENERATOR */}
      {activeTab === 'captions' && (
        <div className="max-w-xl mx-auto pixel-card bg-deck-dark p-6 space-y-4 border border-deck-border font-mono text-xs">
          <div>
            <label className="text-arcade-muted block mb-1">Post Theme / Topic</label>
            <input
              type="text"
              value={captionTopic}
              onChange={(e) => setCaptionTopic(e.target.value)}
              className="w-full bg-deck-bg border border-deck-border p-2 text-white"
            />
          </div>

          <div className="flex gap-2">
            {['hype', 'minimal', 'professional'].map(v => (
              <button
                key={v}
                onClick={() => setCaptionVibe(v)}
                className={`flex-1 py-1.5 font-pixel text-[8px] uppercase border ${
                  captionVibe === v ? 'bg-deck-surface border-arcade-violet text-arcade-violet' : 'bg-deck-bg border-deck-border text-arcade-muted'
                }`}
              >
                {v}
              </button>
            ))}
          </div>

          <button
            onClick={generateCaption}
            className="btn-pixel btn-pixel-violet w-full py-2.5 font-pixel text-xs flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" /> GENERATE CAPTION
          </button>

          {generatedCaption && (
            <div className="p-4 bg-deck-bg border border-deck-border space-y-2">
              <div className="flex justify-between items-center text-arcade-muted">
                <span>GENERATED CAPTION:</span>
                <button onClick={() => copyText(generatedCaption)} className="text-white hover:underline flex items-center gap-1">
                  {copied ? <Check className="w-3 h-3 text-arcade-emerald" /> : <Copy className="w-3 h-3" />} COPY
                </button>
              </div>
              <p className="text-white text-xs leading-relaxed">{generatedCaption}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
