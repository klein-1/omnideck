import React, { useState, useRef, useEffect } from 'react';
import { 
  Music, Mic, Scissors, Video, Download, Play, 
  Pause, Square, Trash2, PenTool, FileAudio, Check
} from 'lucide-react';
import { playClick, playSuccess, playCoin } from '../../audio/soundEffects';

export default function MediaTools() {
  const [activeTab, setActiveTab] = useState('recorder'); 
  // 'recorder' | 'trim' | 'drawing' | 'v2a'

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

  // 2. DRAWING BOARD
  const drawCanvasRef = useRef(null);
  const [isPainting, setIsPainting] = useState(false);
  const [brushColor, setBrushColor] = useState('#00ff88');
  const [brushSize, setBrushSize] = useState(4);

  const startPaint = (e) => {
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.strokeStyle = brushColor;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    setIsPainting(true);
  };

  const paint = (e) => {
    if (!isPainting) return;
    const canvas = drawCanvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopPaint = () => {
    setIsPainting(false);
  };

  const clearCanvas = () => {
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#0a0d12';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    playClick();
  };

  useEffect(() => {
    if (drawCanvasRef.current) {
      clearCanvas();
    }
  }, []);

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
          { id: 'recorder', label: 'AUDIO RECORDER', icon: Mic },
          { id: 'drawing', label: 'DRAWING BOARD', icon: PenTool },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => { playClick(); setActiveTab(tab.id); }}
              className={`btn-pixel px-3 py-1.5 font-pixel text-[9px] flex items-center gap-2 shrink-0 ${
                isActive ? 'btn-pixel-emerald' : 'btn-pixel-surface'
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

      {/* 2. DRAWING BOARD */}
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

          <div className="flex justify-center">
            <canvas
              ref={drawCanvasRef}
              width={700}
              height={400}
              onMouseDown={startPaint}
              onMouseMove={paint}
              onMouseUp={stopPaint}
              onMouseLeave={stopPaint}
              className="border-2 border-deck-border shadow-pixel cursor-crosshair max-w-full"
            />
          </div>
        </div>
      )}
    </div>
  );
}

