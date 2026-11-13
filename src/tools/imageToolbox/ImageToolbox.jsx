import React, { useState, useRef, useEffect } from 'react';
import { 
  Image as ImageIcon, Sliders, Crop, Maximize2, Sparkles, 
  Trash2, Download, RefreshCw, Eye, EyeOff, Layers, Type, 
  Palette, FileImage, ShieldCheck, Scissors, PenTool, Check, Copy
} from 'lucide-react';
import { playClick, playSuccess, playError } from '../../audio/soundEffects';

const PALETTES = {
  gameboy: ['#0f380f', '#306230', '#8bac0f', '#9bbc0f'],
  nes: ['#000000', '#fcfcfc', '#f83800', '#0058f8', '#00a800', '#f8b800', '#e40058'],
  c64: ['#000000', '#ffffff', '#880000', '#aaffee', '#cc44cc', '#00cc55', '#0000aa', '#eeee77'],
  cyberpunk: ['#080a0f', '#00ff88', '#00f0ff', '#ff0055', '#ffe600', '#a78bfa']
};

export default function ImageToolbox() {
  const [activeSubTool, setActiveSubTool] = useState('compress'); 
  // 'compress' | 'resize' | 'crop' | 'filter' | 'pixelate' | 'bgRemove' | 'exif' | 'watermark' | 'palette' | 'signature' | 'draw'
  
  const [sourceImage, setSourceImage] = useState(null);
  const [sourceName, setSourceName] = useState('');
  const [sourceSize, setSourceSize] = useState(0);
  const [sourceDims, setSourceDims] = useState({ w: 0, h: 0 });

  // Compressor & Format
  const [quality, setQuality] = useState(80);
  const [outputFormat, setOutputFormat] = useState('image/webp');
  const [compressedDataUrl, setCompressedDataUrl] = useState(null);
  const [compressedSize, setCompressedSize] = useState(0);

  // Resize
  const [resizeWidth, setResizeWidth] = useState(0);
  const [resizeHeight, setResizeHeight] = useState(0);
  const [maintainAspect, setMaintainAspect] = useState(true);
  const [scaleAlgorithm, setScaleAlgorithm] = useState('smooth'); // 'smooth' | 'pixelated'

  // Filters
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [grayscale, setGrayscale] = useState(0);
  const [sepia, setSepia] = useState(0);
  const [invert, setInvert] = useState(0);
  const [blur, setBlur] = useState(0);

  // Pixel Art Generator
  const [pixelSize, setPixelSize] = useState(8);
  const [selectedPalette, setSelectedPalette] = useState('gameboy');

  // Watermark
  const [watermarkText, setWatermarkText] = useState('CONFIDENTIAL // OMNI-DECK');
  const [watermarkOpacity, setWatermarkOpacity] = useState(50);
  const [watermarkPosition, setWatermarkPosition] = useState('center');

  // Extracted Palette
  const [extractedColors, setExtractedColors] = useState([]);
  const [copiedColor, setCopiedColor] = useState(null);

  // Signature
  const sigCanvasRef = useRef(null);
  const [isDrawingSig, setIsDrawingSig] = useState(false);
  const [sigColor, setSigColor] = useState('#00ff88');
  const [sigWidth, setSigWidth] = useState(3);

  // Canvas refs
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSourceName(file.name);
    setSourceSize(file.size);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        setSourceImage(img);
        setSourceDims({ w: img.width, h: img.height });
        setResizeWidth(img.width);
        setResizeHeight(img.height);
        playSuccess();
        extractDominantColors(img);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  // Extract Colors
  const extractDominantColors = (img) => {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = 50;
    tempCanvas.height = 50;
    const ctx = tempCanvas.getContext('2d');
    ctx.drawImage(img, 0, 0, 50, 50);
    const data = ctx.getImageData(0, 0, 50, 50).data;

    const colors = [];
    for (let i = 0; i < data.length; i += 4 * 30) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
      if (!colors.includes(hex)) colors.push(hex);
      if (colors.length >= 8) break;
    }
    setExtractedColors(colors);
  };

  // Process / Render to Canvas
  useEffect(() => {
    if (!sourceImage || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const targetW = activeSubTool === 'resize' ? resizeWidth : sourceDims.w;
    const targetH = activeSubTool === 'resize' ? resizeHeight : sourceDims.h;

    canvas.width = targetW;
    canvas.height = targetH;

    ctx.imageSmoothingEnabled = scaleAlgorithm === 'smooth';

    // Apply filters
    if (activeSubTool === 'filter') {
      ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) grayscale(${grayscale}%) sepia(${sepia}%) invert(${invert}%) blur(${blur}px)`;
    } else {
      ctx.filter = 'none';
    }

    ctx.drawImage(sourceImage, 0, 0, targetW, targetH);
    ctx.filter = 'none';

    // Pixelate tool
    if (activeSubTool === 'pixelate') {
      const pSize = Math.max(2, pixelSize);
      const scaledW = Math.ceil(targetW / pSize);
      const scaledH = Math.ceil(targetH / pSize);

      const offCanvas = document.createElement('canvas');
      offCanvas.width = scaledW;
      offCanvas.height = scaledH;
      const offCtx = offCanvas.getContext('2d');
      offCtx.drawImage(sourceImage, 0, 0, scaledW, scaledH);

      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(offCanvas, 0, 0, scaledW, scaledH, 0, 0, targetW, targetH);
    }

    // Watermark tool
    if (activeSubTool === 'watermark' && watermarkText) {
      ctx.save();
      ctx.font = `bold ${Math.max(16, Math.floor(targetW / 25))}px monospace`;
      ctx.fillStyle = `rgba(255, 255, 255, ${watermarkOpacity / 100})`;
      ctx.strokeStyle = `rgba(0, 0, 0, ${watermarkOpacity / 100})`;
      ctx.lineWidth = 2;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      let posX = targetW / 2;
      let posY = targetH / 2;
      if (watermarkPosition === 'top-left') { posX = targetW * 0.2; posY = targetH * 0.1; }
      else if (watermarkPosition === 'bottom-right') { posX = targetW * 0.8; posY = targetH * 0.9; }

      ctx.strokeText(watermarkText, posX, posY);
      ctx.fillText(watermarkText, posX, posY);
      ctx.restore();
    }

    // Background Remover (Luminance / Key color threshold)
    if (activeSubTool === 'bgRemove') {
      const imgData = ctx.getImageData(0, 0, targetW, targetH);
      const d = imgData.data;
      for (let i = 0; i < d.length; i += 4) {
        const r = d[i], g = d[i + 1], b = d[i + 2];
        // If near white or very light background
        if (r > 230 && g > 230 && b > 230) {
          d[i + 3] = 0; // Transparent
        }
      }
      ctx.putImageData(imgData, 0, 0);
    }

    // Generate compressed output
    const dataUrl = canvas.toDataURL(outputFormat, quality / 100);
    setCompressedDataUrl(dataUrl);

    // Approximate size
    const head = `data:${outputFormat};base64,`;
    const base64Len = dataUrl.length - head.length;
    setCompressedSize(Math.round(base64Len * 0.75));
  }, [
    sourceImage, activeSubTool, quality, outputFormat, resizeWidth, resizeHeight,
    brightness, contrast, saturation, grayscale, sepia, invert, blur,
    pixelSize, watermarkText, watermarkOpacity, watermarkPosition, scaleAlgorithm
  ]);

  const handleDownload = () => {
    if (!compressedDataUrl) return;
    playClick();
    const link = document.createElement('a');
    const ext = outputFormat.split('/')[1] || 'webp';
    link.download = `omnideck_${Date.now()}.${ext}`;
    link.href = compressedDataUrl;
    link.click();
    playSuccess();
  };

  // Universal coordinate helper for both touch and mouse events
  const getSigCoords = (e) => {
    const canvas = sigCanvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches && e.touches.length > 0 ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches && e.touches.length > 0 ? e.touches[0].clientY : e.clientY;
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  // Signature canvas handlers (supports desktop mouse and phone touch)
  const startDrawingSig = (e) => {
    if (e.cancelable && e.type.startsWith('touch')) {
      e.preventDefault();
    }
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const { x, y } = getSigCoords(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = sigColor;
    ctx.lineWidth = sigWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    setIsDrawingSig(true);
  };

  const drawSig = (e) => {
    if (!isDrawingSig) return;
    if (e.cancelable && e.type.startsWith('touch')) {
      e.preventDefault();
    }
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const { x, y } = getSigCoords(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawingSig = (e) => {
    if (e && e.cancelable && e.type.startsWith('touch')) {
      e.preventDefault();
    }
    setIsDrawingSig(false);
  };

  const clearSig = () => {
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    playClick();
  };

  const downloadSig = () => {
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    playClick();
    const link = document.createElement('a');
    link.download = `signature_${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    playSuccess();
  };

  return (
    <div className="space-y-6">
      {/* Sub-tool Selector Bar */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar border-b-2 border-deck-border pb-3">
        {[
          { id: 'compress', label: 'COMPRESS & CONVERT', icon: FileImage, activeClass: 'btn-pixel-pink' },
          { id: 'resize', label: 'RESIZER & CROP', icon: Maximize2, activeClass: 'btn-pixel-cyan' },
          { id: 'filter', label: 'FILTERS & COLOR', icon: Sliders, activeClass: 'btn-pixel-violet' },
          { id: 'pixelate', label: '8-BIT PIXEL ART', icon: Sparkles, activeClass: 'btn-pixel-amber' },
          { id: 'bgRemove', label: 'BG REMOVER', icon: Scissors, activeClass: 'btn-pixel-coral' },
          { id: 'watermark', label: 'WATERMARK', icon: Type, activeClass: 'btn-pixel-blue' },
          { id: 'palette', label: 'PALETTE PICKER', icon: Palette, activeClass: 'btn-pixel-purple' },
          { id: 'signature', label: 'SIGNATURE MAKER', icon: PenTool, activeClass: 'btn-pixel-emerald' },
        ].map(t => {
          const Icon = t.icon;
          const isActive = activeSubTool === t.id;
          return (
            <button
              key={t.id}
              onClick={() => { playClick(); setActiveSubTool(t.id); }}
              className={`btn-pixel px-3 py-1.5 font-pixel text-[9px] flex items-center gap-2 shrink-0 ${
                isActive ? t.activeClass : 'btn-pixel-surface'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Signature Studio Mode (No file upload needed) */}
      {activeSubTool === 'signature' ? (
        <div className="pixel-card bg-deck-dark p-6 space-y-4 border border-deck-border max-w-2xl mx-auto text-center">
          <div className="flex items-center justify-between border-b border-deck-border pb-3">
            <h3 className="font-pixel text-xs text-arcade-emerald flex items-center gap-2">
              <PenTool className="w-4 h-4 text-arcade-emerald" />
              VECTOR SIGNATURE STUDIO
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={clearSig}
                className="btn-pixel btn-pixel-surface px-3 py-1 font-pixel text-[9px] text-arcade-coral"
              >
                CLEAR
              </button>
              <button
                onClick={downloadSig}
                className="btn-pixel btn-pixel-emerald px-4 py-1 font-pixel text-[9px] flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                EXPORT PNG
              </button>
            </div>
          </div>

          <p className="text-xs font-mono text-arcade-muted">
            Draw your signature with mouse, stylus, or touch. Automatically exported with transparent alpha background.
          </p>

          {/* Controls: Color & Stroke Width */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-2 bg-deck-bg border border-deck-border font-mono text-xs">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-arcade-muted font-pixel">INK:</span>
              {[
                { hex: '#00ff88', label: 'Emerald' },
                { hex: '#ffffff', label: 'White' },
                { hex: '#00f0ff', label: 'Cyan' },
                { hex: '#ffb703', label: 'Amber' },
                { hex: '#3b82f6', label: 'Blue' },
                { hex: '#000000', label: 'Black' },
              ].map(c => (
                <button
                  key={c.hex}
                  type="button"
                  onClick={() => setSigColor(c.hex)}
                  style={{ backgroundColor: c.hex }}
                  className={`w-6 h-6 border-2 transition-transform ${
                    sigColor === c.hex ? 'border-white scale-125 shadow-pixel-sm' : 'border-black'
                  }`}
                  title={c.label}
                />
              ))}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] text-arcade-muted font-pixel">WIDTH:</span>
              {[2, 3, 5, 8].map(w => (
                <button
                  key={w}
                  type="button"
                  onClick={() => setSigWidth(w)}
                  className={`px-2 py-0.5 font-pixel text-[8px] border ${
                    sigWidth === w ? 'bg-arcade-emerald text-black border-black font-bold' : 'bg-deck-dark border-deck-border text-arcade-muted'
                  }`}
                >
                  {w}PX
                </button>
              ))}
            </div>
          </div>

          <div className="border-2 border-dashed border-arcade-emerald/60 bg-deck-bg p-2 inline-block w-full max-w-full">
            <canvas
              ref={sigCanvasRef}
              width={700}
              height={300}
              onMouseDown={startDrawingSig}
              onMouseMove={drawSig}
              onMouseUp={stopDrawingSig}
              onMouseLeave={stopDrawingSig}
              onTouchStart={startDrawingSig}
              onTouchMove={drawSig}
              onTouchEnd={stopDrawingSig}
              onTouchCancel={stopDrawingSig}
              style={{ touchAction: 'none' }}
              className="cursor-crosshair bg-transparent w-full h-auto max-h-[280px] border border-black/40 block"
            />
          </div>
        </div>
      ) : (
        /* Image Processing Studio (With uploaded image) */
        <div className="space-y-6">
          {/* File Upload Zone */}
          {!sourceImage ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="p-12 border-2 border-dashed border-deck-border hover:border-arcade-coral bg-deck-dark text-center cursor-pointer transition-colors space-y-3"
            >
              <ImageIcon className="w-12 h-12 mx-auto text-arcade-muted hover:text-arcade-coral" />
              <div className="font-pixel text-xs text-white">DRAG & DROP IMAGE OR CLICK TO BROWSE</div>
              <p className="text-xs font-mono text-arcade-muted">
                Supports PNG, JPG, WEBP, AVIF, SVG, BMP, ICO (All processed locally in browser)
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Image Canvas & Preview */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between text-xs font-mono">
                  <div className="text-arcade-muted">
                    Source: <span className="text-white font-bold">{sourceName}</span> ({(sourceSize / 1024).toFixed(1)} KB)
                  </div>
                  <button
                    onClick={() => { setSourceImage(null); playClick(); }}
                    className="text-arcade-coral hover:underline text-[11px] flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> REPLACE IMAGE
                  </button>
                </div>

                {/* Viewport Canvas Frame */}
                <div className="deck-viewport p-4 flex items-center justify-center min-h-[360px] max-h-[500px] overflow-auto">
                  <canvas ref={canvasRef} className="max-w-full max-h-[460px] object-contain shadow-pixel" />
                </div>

                {/* Comparison Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                  <div className="p-2 bg-deck-dark border border-deck-border">
                    <div className="text-arcade-muted text-[10px]">ORIGINAL SIZE</div>
                    <div className="text-white font-bold">{(sourceSize / 1024).toFixed(1)} KB</div>
                  </div>
                  <div className="p-2 bg-deck-dark border border-deck-border">
                    <div className="text-arcade-muted text-[10px]">OUTPUT SIZE</div>
                    <div className="text-arcade-emerald font-bold">{(compressedSize / 1024).toFixed(1)} KB</div>
                  </div>
                  <div className="p-2 bg-deck-dark border border-deck-border">
                    <div className="text-arcade-muted text-[10px]">DIMENSIONS</div>
                    <div className="text-arcade-cyan font-bold">{sourceDims.w} × {sourceDims.h}px</div>
                  </div>
                  <div className="p-2 bg-deck-dark border border-deck-border">
                    <div className="text-arcade-muted text-[10px]">SAVINGS</div>
                    <div className="text-arcade-amber font-bold">
                      {sourceSize > 0 ? `${Math.max(0, Math.round((1 - compressedSize / sourceSize) * 100))}%` : '0%'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Controls for Active Subtool */}
              <div className="pixel-card bg-deck-dark p-4 space-y-4 border border-deck-border">
                <div className="font-pixel text-[10px] text-arcade-coral border-b border-deck-border pb-2 uppercase flex items-center justify-between">
                  <span>{activeSubTool.toUpperCase()} CONTROL DECK</span>
                  <Sliders className="w-3.5 h-3.5" />
                </div>

                {/* 1. COMPRESS & CONVERT CONTROLS */}
                {activeSubTool === 'compress' && (
                  <div className="space-y-4 font-mono text-xs">
                    <div className="space-y-1">
                      <div className="flex justify-between text-arcade-muted">
                        <span>Quality ({quality}%)</span>
                        <span className="text-white">{quality}</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="100"
                        value={quality}
                        onChange={(e) => setQuality(Number(e.target.value))}
                        className="w-full accent-arcade-coral"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-arcade-muted">Target Format</label>
                      <select
                        value={outputFormat}
                        onChange={(e) => setOutputFormat(e.target.value)}
                        className="w-full bg-deck-bg border border-deck-border p-2 text-white"
                      >
                        <option value="image/webp">WEBP (Modern & Ultra Compressed)</option>
                        <option value="image/jpeg">JPEG (Universal Compatibility)</option>
                        <option value="image/png">PNG (Lossless & Alpha)</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* 2. RESIZE CONTROLS */}
                {activeSubTool === 'resize' && (
                  <div className="space-y-4 font-mono text-xs">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-arcade-muted">Width (px)</label>
                        <input
                          type="number"
                          value={resizeWidth}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setResizeWidth(val);
                            if (maintainAspect && sourceDims.w > 0) {
                              setResizeHeight(Math.round(val * (sourceDims.h / sourceDims.w)));
                            }
                          }}
                          className="w-full bg-deck-bg border border-deck-border p-2 text-white"
                        />
                      </div>
                      <div>
                        <label className="text-arcade-muted">Height (px)</label>
                        <input
                          type="number"
                          value={resizeHeight}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setResizeHeight(val);
                            if (maintainAspect && sourceDims.h > 0) {
                              setResizeWidth(Math.round(val * (sourceDims.w / sourceDims.h)));
                            }
                          }}
                          className="w-full bg-deck-bg border border-deck-border p-2 text-white"
                        />
                      </div>
                    </div>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={maintainAspect}
                        onChange={(e) => setMaintainAspect(e.target.checked)}
                        className="rounded-none accent-arcade-coral"
                      />
                      <span className="text-slate-300">Lock Aspect Ratio</span>
                    </label>

                    <div className="space-y-1">
                      <label className="text-arcade-muted">Sampling Algorithm</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setScaleAlgorithm('smooth')}
                          className={`p-2 font-pixel text-[8px] border ${
                            scaleAlgorithm === 'smooth' ? 'bg-deck-surface border-arcade-coral text-arcade-coral' : 'bg-deck-bg border-deck-border text-arcade-muted'
                          }`}
                        >
                          SMOOTH (BICUBIC)
                        </button>
                        <button
                          type="button"
                          onClick={() => setScaleAlgorithm('pixelated')}
                          className={`p-2 font-pixel text-[8px] border ${
                            scaleAlgorithm === 'pixelated' ? 'bg-deck-surface border-arcade-coral text-arcade-coral' : 'bg-deck-bg border-deck-border text-arcade-muted'
                          }`}
                        >
                          NEAREST (PIXEL)
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. FILTERS CONTROLS */}
                {activeSubTool === 'filter' && (
                  <div className="space-y-3 font-mono text-xs">
                    <div>
                      <div className="flex justify-between text-arcade-muted">
                        <span>Brightness</span>
                        <span>{brightness}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="200"
                        value={brightness}
                        onChange={(e) => setBrightness(Number(e.target.value))}
                        className="w-full accent-arcade-coral"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-arcade-muted">
                        <span>Contrast</span>
                        <span>{contrast}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="200"
                        value={contrast}
                        onChange={(e) => setContrast(Number(e.target.value))}
                        className="w-full accent-arcade-coral"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-arcade-muted">
                        <span>Saturation</span>
                        <span>{saturation}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="200"
                        value={saturation}
                        onChange={(e) => setSaturation(Number(e.target.value))}
                        className="w-full accent-arcade-coral"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-arcade-muted">
                        <span>Grayscale</span>
                        <span>{grayscale}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={grayscale}
                        onChange={(e) => setGrayscale(Number(e.target.value))}
                        className="w-full accent-arcade-coral"
                      />
                    </div>
                  </div>
                )}

                {/* 4. PIXEL ART GENERATOR */}
                {activeSubTool === 'pixelate' && (
                  <div className="space-y-4 font-mono text-xs">
                    <div className="space-y-1">
                      <div className="flex justify-between text-arcade-muted">
                        <span>Pixel Block Size ({pixelSize}px)</span>
                        <span className="text-arcade-amber font-pixel text-[9px]">{pixelSize}PX</span>
                      </div>
                      <input
                        type="range"
                        min="2"
                        max="32"
                        value={pixelSize}
                        onChange={(e) => setPixelSize(Number(e.target.value))}
                        className="w-full accent-arcade-amber"
                      />
                    </div>

                    <div className="p-3 bg-deck-bg border border-deck-border text-[11px] text-arcade-muted space-y-1">
                      <span className="text-arcade-amber font-bold font-pixel text-[9px]">8-BIT DOWNSAMPLE ENGINE</span>
                      <p>Renders true pixel grid downsample preserving high-contrast edge silhouettes.</p>
                    </div>
                  </div>
                )}

                {/* 5. WATERMARK CONTROLS */}
                {activeSubTool === 'watermark' && (
                  <div className="space-y-3 font-mono text-xs">
                    <div>
                      <label className="text-arcade-muted">Watermark Text</label>
                      <input
                        type="text"
                        value={watermarkText}
                        onChange={(e) => setWatermarkText(e.target.value)}
                        className="w-full bg-deck-bg border border-deck-border p-2 text-white"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-arcade-muted">
                        <span>Opacity ({watermarkOpacity}%)</span>
                        <span>{watermarkOpacity}%</span>
                      </div>
                      <input
                        type="range"
                        min="5"
                        max="100"
                        value={watermarkOpacity}
                        onChange={(e) => setWatermarkOpacity(Number(e.target.value))}
                        className="w-full accent-arcade-coral"
                      />
                    </div>

                    <div>
                      <label className="text-arcade-muted">Position Grid</label>
                      <select
                        value={watermarkPosition}
                        onChange={(e) => setWatermarkPosition(e.target.value)}
                        className="w-full bg-deck-bg border border-deck-border p-2 text-white"
                      >
                        <option value="center">Center Stamp</option>
                        <option value="top-left">Top Left</option>
                        <option value="bottom-right">Bottom Right</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* 6. COLOR PALETTE EXTRACTOR */}
                {activeSubTool === 'palette' && (
                  <div className="space-y-3 font-mono text-xs">
                    <span className="text-arcade-muted">Dominant Extracted Palette</span>
                    <div className="grid grid-cols-4 gap-2">
                      {extractedColors.map((color, idx) => (
                        <div
                          key={idx}
                          onClick={() => {
                            navigator.clipboard.writeText(color);
                            setCopiedColor(color);
                            playClick();
                            setTimeout(() => setCopiedColor(null), 1500);
                          }}
                          className="p-2 border border-deck-border cursor-pointer hover:scale-105 transition-transform text-center space-y-1"
                        >
                          <div className="w-full h-8 border border-black shadow-sm" style={{ backgroundColor: color }} />
                          <div className="font-mono text-[9px] text-white uppercase">{color}</div>
                        </div>
                      ))}
                    </div>
                    {copiedColor && (
                      <div className="text-center text-arcade-emerald text-[11px] font-pixel">
                        COPIED {copiedColor}!
                      </div>
                    )}
                  </div>
                )}

                {/* Download Button */}
                <div className="pt-4 border-t border-deck-border">
                  <button
                    onClick={handleDownload}
                    className="btn-pixel btn-pixel-coral w-full py-3.5 font-pixel text-xs flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    EXPORT PROCESSED IMAGE
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

