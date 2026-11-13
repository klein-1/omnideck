import React, { useState, useEffect } from 'react';
import { 
  Share2, MessageSquare, Wifi, Youtube, Hash, 
  Sparkles, ExternalLink, Copy, Check
} from 'lucide-react';
import QRCode from 'qrcode';
import { playClick, playCoin } from '../../audio/soundEffects';

export default function SocialTools() {
  const [activeTab, setActiveTab] = useState('whatsapp'); 
  // 'whatsapp' | 'wifi' | 'captions' | 'bio'

  const [copied, setCopied] = useState(false);
  const copyText = (txt) => {
    navigator.clipboard.writeText(txt);
    setCopied(true);
    playClick();
    setTimeout(() => setCopied(false), 1500);
  };

  // 1. WHATSAPP DIRECT
  const [phoneCode, setPhoneCode] = useState('+1');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [waMessage, setWaMessage] = useState('Hello!');

  const waLink = `https://wa.me/${phoneCode.replace('+', '')}${phoneNumber.replace(/\D/g, '')}?text=${encodeURIComponent(waMessage)}`;

  // 2. QR WIFI SHARE
  const [wifiSsid, setWifiSsid] = useState('CyberDeck_5G');
  const [wifiPass, setWifiPass] = useState('retro2026!');
  const [wifiAuth, setWifiAuth] = useState('WPA');
  const [wifiQrUrl, setWifiQrUrl] = useState('');

  useEffect(() => {
    // Standard Wi-Fi QR string format: WIFI:S:<SSID>;T:<WPA|WEP|nopass>;P:<password>;;
    const wifiString = `WIFI:S:${wifiSsid};T:${wifiAuth};P:${wifiPass};;`;
    QRCode.toDataURL(wifiString, {
      width: 260,
      margin: 2,
      color: { dark: '#000000', light: '#ffffff' }
    }).then(setWifiQrUrl);
  }, [wifiSsid, wifiPass, wifiAuth]);

  // 3. CAPTION GENERATOR
  const [captionTopic, setCaptionTopic] = useState('New setup and tools launched');
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
          { id: 'whatsapp', label: 'WHATSAPP DIRECT', icon: MessageSquare, activeClass: 'btn-pixel-emerald' },
          { id: 'wifi', label: 'QR WI-FI SHARING', icon: Wifi, activeClass: 'btn-pixel-cyan' },
          { id: 'captions', label: 'CAPTION GENERATOR', icon: Sparkles, activeClass: 'btn-pixel-purple' },
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

      {/* 1. WHATSAPP DIRECT */}
      {activeTab === 'whatsapp' && (
        <div className="max-w-md mx-auto pixel-card bg-deck-dark p-6 space-y-4 border border-deck-border font-mono text-xs">
          <span className="font-pixel text-[10px] text-arcade-emerald uppercase">DIRECT WHATSAPP MESSENGER</span>
          <p className="text-arcade-muted text-xs">Message any phone number without saving it to your contact book.</p>

          <div className="flex gap-2">
            <input
              type="text"
              value={phoneCode}
              onChange={(e) => setPhoneCode(e.target.value)}
              placeholder="+1"
              className="w-20 bg-deck-bg border border-deck-border p-2 text-white"
            />
            <input
              type="text"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Phone number"
              className="flex-1 bg-deck-bg border border-deck-border p-2 text-white"
            />
          </div>

          <div>
            <label className="text-arcade-muted block mb-1">Pre-filled Message</label>
            <textarea
              value={waMessage}
              onChange={(e) => setWaMessage(e.target.value)}
              rows={3}
              className="w-full bg-deck-bg border border-deck-border p-2 text-white"
            />
          </div>

          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-pixel btn-pixel-emerald w-full py-3 font-pixel text-xs flex items-center justify-center gap-2 text-center"
          >
            <ExternalLink className="w-4 h-4" />
            OPEN CHAT IN WHATSAPP
          </a>
        </div>
      )}

      {/* 2. QR WI-FI SHARE */}
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

      {/* 3. CAPTION GENERATOR */}
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

