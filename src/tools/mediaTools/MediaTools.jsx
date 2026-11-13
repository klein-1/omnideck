import React, { useState, useRef, useEffect } from 'react';
import { 
  Music, Mic, Scissors, Video, Download, Play, 
  Pause, Square, Trash2, PenTool, FileAudio, Check,
  Camera, Sliders, Volume2, Palette, Clock, Radio, Eye
} from 'lucide-react';
import { playClick, playSuccess, playCoin, playBeep } from '../../audio/soundEffects';

export default function MediaTools() {
  const [activeTab, setActiveTab] = useState('recorder'); 
  // 'recorder' | 'screenrec' | 'synth' | 'visualizer' | 'palette' | 'videograb' | 'metronome' | 'drawing'

  const [copied, setCopied] = useState(false);
  const copyText = (txt) => {
    navigator.clipboard.writeText(txt);
    setCopied(true);
    playClick();
    setTimeout(() => setCopied(false), 1500);
  };

  // 1. AUDIO RECORDER
  const [isRecording, setIsRecording] = useState(false);
  const [recordTime, setRecordTime] = useState(0);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setRecordedAudioUrl(URL.createObjectURL(audioBlob));
        playSuccess();
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordTime(0);
      playClick();
    } catch (e) {
      alert('Microphone access is required to record audio.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop());
      setIsRecording(false);
      playClick();
    }
  };

  useEffect(() => {
    let timer = null;
    if (isRecording) {
      timer = setInterval(() => setRecordTime(t => t + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [isRecording]);

  // 2. SCREEN RECORDER
  const [isScreenRecording, setIsScreenRecording] = useState(false);
  const [screenRecordTime, setScreenRecordTime] = useState(0);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState(null);
  const screenRecorderRef = useRef(null);
  const screenChunksRef = useRef([]);

  const startScreenRecord = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
      screenRecorderRef.current = new MediaRecorder(stream);
      screenChunksRef.current = [];

      screenRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) screenChunksRef.current.push(e.data);
      };

      screenRecorderRef.current.onstop = () => {
        const videoBlob = new Blob(screenChunksRef.current, { type: 'video/webm' });
        setRecordedVideoUrl(URL.createObjectURL(videoBlob));
        playSuccess();
      };

      // Handle user stopping share via browser native UI
      stream.getVideoTracks()[0].onended = () => {
        stopScreenRecord();
      };

      screenRecorderRef.current.start();
      setIsScreenRecording(true);
      setScreenRecordTime(0);
      playClick();
    } catch (e) {
      // User cancelled or no permissions
    }
  };

  const stopScreenRecord = () => {
    if (screenRecorderRef.current && isScreenRecording) {
      screenRecorderRef.current.stop();
      screenRecorderRef.current.stream.getTracks().forEach(t => t.stop());
      setIsScreenRecording(false);
      playClick();
    }
  };

  useEffect(() => {
    let timer = null;
    if (isScreenRecording) {
      timer = setInterval(() => setScreenRecordTime(t => t + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [isScreenRecording]);

  // 3. 8-BIT RETRO SYNTHESIZER
  const [synthWave, setSynthWave] = useState('square'); // 'square' | 'sawtooth' | 'triangle' | 'sine'
  const [synthOctave, setSynthOctave] = useState(4);
  const synthCtxRef = useRef(null);

  const NOTES = [
    { name: 'C', freq: 261.63, key: 'A', isBlack: false },
    { name: 'C#', freq: 277.18, key: 'W', isBlack: true },
    { name: 'D', freq: 293.66, key: 'S', isBlack: false },
    { name: 'D#', freq: 311.13, key: 'E', isBlack: true },
    { name: 'E', freq: 329.63, key: 'D', isBlack: false },
    { name: 'F', freq: 349.23, key: 'F', isBlack: false },
    { name: 'F#', freq: 369.99, key: 'T', isBlack: true },
    { name: 'G', freq: 392.00, key: 'G', isBlack: false },
    { name: 'G#', freq: 415.30, key: 'Y', isBlack: true },
    { name: 'A', freq: 440.00, key: 'H', isBlack: false },
    { name: 'A#', freq: 466.16, key: 'U', isBlack: true },
    { name: 'B', freq: 493.88, key: 'J', isBlack: false },
    { name: 'C5', freq: 523.25, key: 'K', isBlack: false },
  ];

  const playTone = (baseFreq) => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const ctx = synthCtxRef.current || new AudioCtx();
      synthCtxRef.current = ctx;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      const multiplier = Math.pow(2, synthOctave - 4);
      osc.type = synthWave;
      osc.frequency.setValueAtTime(baseFreq * multiplier, ctx.currentTime);

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch {}
  };

  // 4. LIVE AUDIO VISUALIZER & OSCILLOSCOPE
  const [visActive, setVisActive] = useState(false);
  const visCanvasRef = useRef(null);
  const visStreamRef = useRef(null);
  const visAnimRef = useRef(null);

  const startVisualizer = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      visStreamRef.current = stream;
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const canvas = visCanvasRef.current;
      if (!canvas) return;
      const canvasCtx = canvas.getContext('2d');

      const draw = () => {
        visAnimRef.current = requestAnimationFrame(draw);
        analyser.getByteFrequencyData(dataArray);

        canvasCtx.fillStyle = '#080a0f';
        canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

        const barWidth = (canvas.width / bufferLength) - 2;
        let x = 1;

        for (let i = 0; i < bufferLength; i++) {
          const barHeight = (dataArray[i] / 255) * canvas.height;
          canvasCtx.fillStyle = i % 2 === 0 ? '#00ff88' : '#00f0ff';
          canvasCtx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
          x += barWidth + 2;
        }
      };
      draw();
      setVisActive(true);
      playClick();
    } catch (e) {
      alert('Microphone access is required to run the audio visualizer.');
    }
  };

  const stopVisualizer = () => {
    if (visAnimRef.current) cancelAnimationFrame(visAnimRef.current);
    if (visStreamRef.current) visStreamRef.current.getTracks().forEach(t => t.stop());
    setVisActive(false);
    playClick();
  };

  // 5. COLOR PALETTE GENERATOR & EYEDROPPER
  const [palette, setPalette] = useState(['#080a0f', '#00ff88', '#00f0ff', '#ffb703', '#ff4757']);
  const [pickedColor, setPickedColor] = useState('');

  const generateHarmoniousPalette = () => {
    playClick();
    const randColor = () => '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
    setPalette([randColor(), randColor(), randColor(), randColor(), randColor()]);
    playCoin();
  };

  const handleEyeDropper = async () => {
    if ('EyeDropper' in window) {
      try {
        const eyeDropper = new window.EyeDropper();
        const res = await eyeDropper.open();
        setPickedColor(res.sRGBHex);
        playSuccess();
      } catch {}
    } else {
      alert('EyeDropper API is supported in Chromium-based browsers (Chrome, Edge, Brave, Opera).');
    }
  };

  // 6. VIDEO FRAME GRABBER
  const [videoFileUrl, setVideoFileUrl] = useState(null);
  const [capturedFrameUrl, setCapturedFrameUrl] = useState(null);
  const videoElemRef = useRef(null);

  const handleVideoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFileUrl(URL.createObjectURL(file));
      setCapturedFrameUrl(null);
      playCoin();
    }
  };

  const captureFrame = () => {
    const video = videoElemRef.current;
    if (!video) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    setCapturedFrameUrl(canvas.toDataURL('image/png'));
    playSuccess();
  };

  // 7. TACTILE BPM METRONOME
  const [metronomeBpm, setMetronomeBpm] = useState(120);
  const [metronomePlaying, setMetronomePlaying] = useState(false);
  const [metronomeBeat, setMetronomeBeat] = useState(0);
  const metronomeTimerRef = useRef(null);

  useEffect(() => {
    if (metronomePlaying) {
      const interval = (60 / metronomeBpm) * 1000;
      metronomeTimerRef.current = setInterval(() => {
        setMetronomeBeat(b => {
          const next = (b + 1) % 4;
          playBeep(next === 0 ? 880 : 440, 0.04);
          return next;
        });
      }, interval);
    } else {
      clearInterval(metronomeTimerRef.current);
    }
    return () => clearInterval(metronomeTimerRef.current);
  }, [metronomePlaying, metronomeBpm]);

  // 8. DRAWING BOARD
  const drawCanvasRef = useRef(null);
  const [isPainting, setIsPainting] = useState(false);
  const [brushColor, setBrushColor] = useState('#00ff88');
  const [brushSize, setBrushSize] = useState(4);

  const getCanvasPos = (canvas, clientX, clientY) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const startPaint = (clientX, clientY) => {
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const pos = getCanvasPos(canvas, clientX, clientY);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    ctx.strokeStyle = brushColor;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    setIsPainting(true);
  };

  const paint = (clientX, clientY) => {
    if (!isPainting) return;
    const canvas = drawCanvasRef.current;
    const ctx = canvas.getContext('2d');
    const pos = getCanvasPos(canvas, clientX, clientY);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };

  const clearCanvas = () => {
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#080a0f';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    playClick();
  };

  useEffect(() => {
    if (activeTab === 'drawing' && drawCanvasRef.current) {
      clearCanvas();
    }
  }, [activeTab]);

  const downloadCanvasArt = () => {
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    playClick();
    const link = document.createElement('a');
    link.download = `omnideck_art_${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    playSuccess();
  };

  return (
    <div className="space-y-6">
      {/* Subtool Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar border-b-2 border-deck-border pb-3">
        {[
          { id: 'recorder', label: 'AUDIO RECORDER', icon: Mic, activeClass: 'btn-pixel-pink' },
          { id: 'screenrec', label: 'SCREEN RECORDER', icon: Video, activeClass: 'btn-pixel-coral' },
          { id: 'synth', label: '8-BIT SYNTHESIZER', icon: Music, activeClass: 'btn-pixel-cyan' },
          { id: 'visualizer', label: 'SPECTRUM VISUALIZER', icon: Radio, activeClass: 'btn-pixel-emerald' },
          { id: 'palette', label: 'COLOR PALETTE', icon: Palette, activeClass: 'btn-pixel-amber' },
          { id: 'videograb', label: 'VIDEO FRAME GRAB', icon: Camera, activeClass: 'btn-pixel-blue' },
          { id: 'metronome', label: 'BPM METRONOME', icon: Clock, activeClass: 'btn-pixel-purple' },
          { id: 'drawing', label: 'PIXEL CANVAS', icon: PenTool, activeClass: 'btn-pixel-lime' },
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

      {/* 1. AUDIO RECORDER */}
      {activeTab === 'recorder' && (
        <div className="max-w-md mx-auto pixel-card bg-deck-dark p-6 space-y-6 border border-deck-border font-mono text-xs text-center">
          <span className="font-pixel text-[10px] text-arcade-emerald uppercase">HI-FI MICROPHONE RECORDER</span>

          <div className="py-6 bg-deck-bg border-2 border-black shadow-pixel">
            <div className={`font-pixel text-4xl py-2 ${isRecording ? 'text-arcade-coral animate-pulse' : 'text-white'}`}>
              {Math.floor(recordTime / 60).toString().padStart(2, '0')}:
              {(recordTime % 60).toString().padStart(2, '0')}
            </div>
            <div className="text-[10px] text-arcade-muted font-pixel">
              {isRecording ? '● LIVE MICROPHONE RECORDING' : 'READY TO RECORD'}
            </div>
          </div>

          <div className="flex justify-center gap-3">
            <button
              onClick={isRecording ? stopRecording : startRecording}
              className={`btn-pixel px-6 py-3 font-pixel text-xs flex items-center gap-2 ${
                isRecording ? 'btn-pixel-coral' : 'btn-pixel-emerald'
              }`}
            >
              {isRecording ? <Square className="w-4 h-4 fill-white" /> : <Mic className="w-4 h-4" />}
              {isRecording ? 'STOP RECORDING' : 'START RECORDING'}
            </button>
          </div>

          {recordedAudioUrl && (
            <div className="p-4 bg-deck-bg border border-arcade-emerald space-y-3">
              <audio controls src={recordedAudioUrl} className="w-full" />
              <a
                href={recordedAudioUrl}
                download={`recording_${Date.now()}.wav`}
                className="btn-pixel btn-pixel-emerald px-4 py-2 font-pixel text-[9px] inline-flex items-center gap-2"
              >
                <Download className="w-3.5 h-3.5" /> SAVE AUDIO WAV
              </a>
            </div>
          )}
        </div>
      )}

      {/* 2. SCREEN RECORDER */}
      {activeTab === 'screenrec' && (
        <div className="max-w-xl mx-auto pixel-card bg-deck-dark p-6 space-y-6 border border-deck-border font-mono text-xs text-center">
          <span className="font-pixel text-[10px] text-arcade-coral uppercase">DESKTOP & TAB SCREEN RECORDER</span>

          <div className="py-6 bg-deck-bg border-2 border-black shadow-pixel">
            <div className={`font-pixel text-4xl py-2 ${isScreenRecording ? 'text-arcade-coral animate-pulse' : 'text-white'}`}>
              {Math.floor(screenRecordTime / 60).toString().padStart(2, '0')}:
              {(screenRecordTime % 60).toString().padStart(2, '0')}
            </div>
            <div className="text-[10px] text-arcade-muted font-pixel">
              {isScreenRecording ? '● CAPTURING SCREEN & AUDIO' : 'READY TO RECORD DISPLAY'}
            </div>
          </div>

          <div className="flex justify-center gap-3">
            <button
              onClick={isScreenRecording ? stopScreenRecord : startScreenRecord}
              className={`btn-pixel px-6 py-3 font-pixel text-xs flex items-center gap-2 ${
                isScreenRecording ? 'btn-pixel-coral' : 'btn-pixel-cyan'
              }`}
            >
              {isScreenRecording ? <Square className="w-4 h-4 fill-white" /> : <Video className="w-4 h-4" />}
              {isScreenRecording ? 'FINISH SCREEN RECORD' : 'SELECT SCREEN TO RECORD'}
            </button>
          </div>

          {recordedVideoUrl && (
            <div className="p-4 bg-deck-bg border border-arcade-coral space-y-3">
              <video controls src={recordedVideoUrl} className="w-full max-h-60 rounded border border-black" />
              <a
                href={recordedVideoUrl}
                download={`screen_capture_${Date.now()}.webm`}
                className="btn-pixel btn-pixel-coral px-4 py-2 font-pixel text-[9px] inline-flex items-center gap-2"
              >
                <Download className="w-3.5 h-3.5" /> DOWNLOAD WEBM VIDEO
              </a>
            </div>
          )}
        </div>
      )}

      {/* 3. 8-BIT SYNTHESIZER */}
      {activeTab === 'synth' && (
        <div className="max-w-2xl mx-auto pixel-card bg-deck-dark p-6 space-y-5 border border-deck-border font-mono text-xs text-center">
          <div className="flex flex-wrap justify-between items-center border-b border-deck-border pb-3 gap-2">
            <span className="font-pixel text-xs text-arcade-cyan">CHIPTUNE SYNTHESIZER</span>

            {/* Waveform Selector */}
            <div className="flex gap-1">
              {['square', 'sawtooth', 'triangle', 'sine'].map(w => (
                <button
                  key={w}
                  onClick={() => setSynthWave(w)}
                  className={`px-2 py-1 font-pixel text-[8px] uppercase border ${
                    synthWave === w ? 'bg-deck-surface border-arcade-cyan text-arcade-cyan' : 'bg-deck-bg border-deck-border text-arcade-muted'
                  }`}
                >
                  {w}
                </button>
              ))}
            </div>

            {/* Octave Selector */}
            <div className="flex items-center gap-1.5 text-xs text-arcade-muted">
              <span>OCTAVE:</span>
              {[3, 4, 5].map(oct => (
                <button
                  key={oct}
                  onClick={() => setSynthOctave(oct)}
                  className={`w-6 h-6 font-pixel text-[9px] border ${
                    synthOctave === oct ? 'bg-arcade-cyan text-black font-bold border-black' : 'bg-deck-bg border-deck-border text-white'
                  }`}
                >
                  {oct}
                </button>
              ))}
            </div>
          </div>

          {/* Piano Keys */}
          <div className="relative flex justify-center py-4 select-none overflow-x-auto no-scrollbar">
            <div className="flex bg-black p-2 border-4 border-black shadow-pixel-lg">
              {NOTES.map((note) => {
                if (note.isBlack) {
                  return (
                    <button
                      key={note.name}
                      onClick={() => playTone(note.freq)}
                      className="w-8 h-24 bg-black text-white hover:bg-slate-700 active:bg-arcade-cyan active:text-black border border-slate-700 -mx-4 z-10 flex flex-col justify-end pb-2 font-pixel text-[8px] shadow-md transition-colors"
                    >
                      {note.name}
                    </button>
                  );
                }
                return (
                  <button
                    key={note.name}
                    onClick={() => playTone(note.freq)}
                    className="w-12 h-36 bg-white hover:bg-slate-200 active:bg-arcade-emerald text-black border border-slate-400 flex flex-col justify-end pb-3 font-pixel text-[9px] shadow-inner transition-colors"
                  >
                    <span>{note.name}</span>
                    <span className="text-[7px] text-slate-500 font-mono">[{note.key}]</span>
                  </button>
                );
              })}
            </div>
          </div>
          <p className="text-arcade-muted text-[11px]">Click keys to synthesize 8-bit soundwaves directly through Web Audio.</p>
        </div>
      )}

      {/* 4. SPECTRUM VISUALIZER */}
      {activeTab === 'visualizer' && (
        <div className="max-w-xl mx-auto pixel-card bg-deck-dark p-6 space-y-4 border border-deck-border font-mono text-xs text-center">
          <span className="font-pixel text-xs text-arcade-emerald uppercase">REAL-TIME FFT AUDIO SPECTRUM</span>

          <div className="border-2 border-black bg-deck-bg shadow-pixel">
            <canvas ref={visCanvasRef} width={500} height={200} className="w-full h-48 block" />
          </div>

          <button
            onClick={visActive ? stopVisualizer : startVisualizer}
            className={`btn-pixel w-full py-2.5 font-pixel text-xs ${visActive ? 'btn-pixel-coral' : 'btn-pixel-emerald'}`}
          >
            {visActive ? 'STOP LIVE SPECTRUM' : 'START LIVE MICROPHONE SPECTRUM'}
          </button>
        </div>
      )}

      {/* 5. COLOR PALETTE */}
      {activeTab === 'palette' && (
        <div className="max-w-xl mx-auto pixel-card bg-deck-dark p-6 space-y-5 border border-deck-border font-mono text-xs">
          <div className="flex justify-between items-center border-b border-deck-border pb-3">
            <span className="font-pixel text-xs text-arcade-amber uppercase">COLOR PALETTE & EYEDROPPER</span>
            <div className="flex gap-2">
              <button
                onClick={handleEyeDropper}
                className="btn-pixel btn-pixel-cyan px-2.5 py-1 font-pixel text-[8px] flex items-center gap-1"
              >
                <Eye className="w-3 h-3" /> SCREEN PICKER
              </button>
              <button
                onClick={generateHarmoniousPalette}
                className="btn-pixel btn-pixel-amber px-2.5 py-1 font-pixel text-[8px]"
              >
                RANDOMIZE
              </button>
            </div>
          </div>

          {pickedColor && (
            <div className="p-3 bg-deck-bg border border-arcade-cyan flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 border border-black shadow-sm" style={{ backgroundColor: pickedColor }} />
                <span className="text-white font-mono font-bold">PICKED: {pickedColor}</span>
              </div>
              <button onClick={() => copyText(pickedColor)} className="text-arcade-cyan hover:underline text-[10px]">
                COPY
              </button>
            </div>
          )}

          {/* Palette display */}
          <div className="grid grid-cols-5 gap-2 h-36">
            {palette.map((c, idx) => (
              <div
                key={idx}
                onClick={() => copyText(c)}
                className="h-full border-2 border-black shadow-pixel cursor-pointer flex flex-col justify-end p-2 transition-transform hover:scale-105"
                style={{ backgroundColor: c }}
              >
                <span className="bg-black/80 text-white font-mono text-[9px] px-1 py-0.5 text-center truncate">
                  {c}
                </span>
              </div>
            ))}
          </div>
          <p className="text-center text-arcade-muted text-[10px]">Click any color block above to copy hex code to clipboard.</p>
        </div>
      )}

      {/* 6. VIDEO FRAME GRAB */}
      {activeTab === 'videograb' && (
        <div className="max-w-xl mx-auto pixel-card bg-deck-dark p-6 space-y-4 border border-deck-border font-mono text-xs">
          <span className="font-pixel text-xs text-arcade-blue uppercase">PRECISE VIDEO FRAME GRABBER</span>

          {!videoFileUrl ? (
            <label className="p-8 border-2 border-dashed border-deck-border hover:border-arcade-blue bg-deck-bg text-center cursor-pointer block space-y-2">
              <Camera className="w-8 h-8 mx-auto text-arcade-blue" />
              <div className="font-pixel text-xs text-white">SELECT OR DROP VIDEO (MP4, WEBM)</div>
              <input type="file" accept="video/*" onChange={handleVideoUpload} className="hidden" />
            </label>
          ) : (
            <div className="space-y-4">
              <video ref={videoElemRef} src={videoFileUrl} controls className="w-full max-h-64 border border-black bg-black rounded" />
              <div className="flex gap-2">
                <button
                  onClick={captureFrame}
                  className="btn-pixel btn-pixel-blue flex-1 py-2 font-pixel text-xs flex items-center justify-center gap-1.5"
                >
                  <Camera className="w-4 h-4" /> CAPTURE CURRENT FRAME
                </button>
                <button
                  onClick={() => setVideoFileUrl(null)}
                  className="btn-pixel btn-pixel-surface px-4 py-2 font-pixel text-xs text-arcade-coral"
                >
                  NEW VIDEO
                </button>
              </div>

              {capturedFrameUrl && (
                <div className="p-3 bg-deck-bg border border-arcade-blue space-y-2 text-center">
                  <img src={capturedFrameUrl} alt="Captured" className="max-h-48 mx-auto border border-black shadow-md" />
                  <a
                    href={capturedFrameUrl}
                    download={`frame_${Date.now()}.png`}
                    className="btn-pixel btn-pixel-emerald px-4 py-1.5 font-pixel text-[9px] inline-flex items-center gap-1"
                  >
                    <Download className="w-3.5 h-3.5" /> DOWNLOAD HIGH-RES PNG
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 7. BPM METRONOME */}
      {activeTab === 'metronome' && (
        <div className="max-w-md mx-auto pixel-card bg-deck-dark p-6 space-y-6 border border-deck-border font-mono text-xs text-center">
          <span className="font-pixel text-xs text-arcade-purple uppercase">PRECISION BPM METRONOME</span>

          <div className="py-6 bg-deck-bg border-2 border-black shadow-pixel">
            <div className="font-pixel text-5xl text-arcade-purple text-glow-purple">{metronomeBpm}</div>
            <div className="text-[10px] text-arcade-muted font-pixel mt-1">BEATS PER MINUTE</div>
          </div>

          <div className="flex justify-center gap-3">
            {[0, 1, 2, 3].map(b => (
              <div
                key={b}
                className={`w-8 h-8 rounded-full border-2 border-black transition-all ${
                  metronomePlaying && metronomeBeat === b
                    ? b === 0 ? 'bg-arcade-coral scale-125' : 'bg-arcade-purple scale-110'
                    : 'bg-deck-bg'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-3">
            <input
              type="range"
              min="40"
              max="240"
              value={metronomeBpm}
              onChange={(e) => setMetronomeBpm(parseInt(e.target.value))}
              className="flex-1 accent-arcade-purple"
            />
            <input
              type="number"
              min="40"
              max="240"
              value={metronomeBpm}
              onChange={(e) => setMetronomeBpm(parseInt(e.target.value) || 120)}
              className="w-16 bg-deck-bg border border-deck-border p-1 text-center font-bold text-white font-mono"
            />
          </div>

          <button
            onClick={() => { setMetronomePlaying(!metronomePlaying); playClick(); }}
            className={`btn-pixel w-full py-3 font-pixel text-xs ${
              metronomePlaying ? 'btn-pixel-coral' : 'btn-pixel-purple'
            }`}
          >
            {metronomePlaying ? 'STOP METRONOME' : 'START METRONOME'}
          </button>
        </div>
      )}

      {/* 8. DRAWING BOARD */}
      {activeTab === 'drawing' && (
        <div className="pixel-card bg-deck-dark p-6 space-y-4 border border-deck-border font-mono text-xs">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-deck-border pb-3">
            <span className="font-pixel text-xs text-arcade-emerald">CYBER PIXEL DRAWING CANVAS</span>

            {/* Colors & Controls */}
            <div className="flex items-center gap-2">
              {['#00ff88', '#00f0ff', '#ffb703', '#ff4757', '#ffffff'].map(c => (
                <button
                  key={c}
                  onClick={() => setBrushColor(c)}
                  className={`w-6 h-6 border-2 ${brushColor === c ? 'border-white scale-110' : 'border-black'}`}
                  style={{ backgroundColor: c }}
                />
              ))}

              <button
                onClick={clearCanvas}
                className="btn-pixel btn-pixel-surface px-3 py-1 font-pixel text-[8px] text-arcade-coral"
              >
                CLEAR
              </button>

              <button
                onClick={downloadCanvasArt}
                className="btn-pixel btn-pixel-emerald px-3 py-1 font-pixel text-[8px] flex items-center gap-1"
              >
                <Download className="w-3 h-3" /> EXPORT
              </button>
            </div>
          </div>

          <div className="flex justify-center touch-none">
            <canvas
              ref={drawCanvasRef}
              width={700}
              height={400}
              onMouseDown={(e) => startPaint(e.clientX, e.clientY)}
              onMouseMove={(e) => paint(e.clientX, e.clientY)}
              onMouseUp={() => setIsPainting(false)}
              onMouseLeave={() => setIsPainting(false)}
              onTouchStart={(e) => {
                if (e.touches[0]) {
                  e.preventDefault();
                  startPaint(e.touches[0].clientX, e.touches[0].clientY);
                }
              }}
              onTouchMove={(e) => {
                if (e.touches[0]) {
                  e.preventDefault();
                  paint(e.touches[0].clientX, e.touches[0].clientY);
                }
              }}
              onTouchEnd={() => setIsPainting(false)}
              className="border-2 border-deck-border shadow-pixel cursor-crosshair max-w-full touch-none"
            />
          </div>
        </div>
      )}
    </div>
  );
}
