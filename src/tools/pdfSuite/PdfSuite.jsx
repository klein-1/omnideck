import React, { useState, useRef } from 'react';
import { 
  FileText, Combine, Scissors, RotateCw, Image, 
  Lock, Shield, Download, Trash2, Plus, Sparkles, Check
} from 'lucide-react';
import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib';
import { playClick, playSuccess, playError } from '../../audio/soundEffects';

export default function PdfSuite() {
  const [activeTab, setActiveTab] = useState('merge'); // 'merge' | 'split' | 'rotate' | 'watermark' | 'imgToPdf'
  const [pdfFiles, setPdfFiles] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [resultPdfUrl, setResultPdfUrl] = useState(null);
  const [resultFilename, setResultFilename] = useState('');

  // Split options
  const [pageRange, setPageRange] = useState('1-2');

  // Rotate options
  const [rotationAngle, setRotationAngle] = useState(90);

  // Watermark options
  const [watermarkText, setWatermarkText] = useState('CONFIDENTIAL // OMNI-DECK');
  const [watermarkOpacity, setWatermarkOpacity] = useState(0.4);

  // Images to PDF
  const [imageFiles, setImageFiles] = useState([]);

  const fileInputRef = useRef(null);
  const imgInputRef = useRef(null);

  // Handle PDF file selection
  const handlePdfUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newFiles = files.map(file => ({
      file,
      name: file.name,
      size: file.size,
      id: Math.random().toString(36).substring(7)
    }));

    setPdfFiles(prev => [...prev, ...newFiles]);
    playSuccess();
  };

  const removeFile = (id) => {
    setPdfFiles(prev => prev.filter(f => f.id !== id));
    playClick();
  };

  // 1. MERGE PDFS
  const handleMergePdfs = async () => {
    if (pdfFiles.length < 2) return;
    setProcessing(true);
    playClick();

    try {
      const mergedPdf = await PDFDocument.create();

      for (const item of pdfFiles) {
        const arrayBuffer = await item.file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach(page => mergedPdf.addPage(page));
      }

      const mergedPdfBytes = await mergedPdf.save();
      const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
      setResultPdfUrl(URL.createObjectURL(blob));
      setResultFilename(`merged_${Date.now()}.pdf`);
      playSuccess();
    } catch (err) {
      alert('Error merging PDFs: ' + err.message);
      playError();
    } finally {
      setProcessing(false);
    }
  };

  // 2. SPLIT PDF
  const handleSplitPdf = async () => {
    if (pdfFiles.length === 0) return;
    setProcessing(true);
    playClick();

    try {
      const item = pdfFiles[0];
      const arrayBuffer = await item.file.arrayBuffer();
      const sourcePdf = await PDFDocument.load(arrayBuffer);
      const newPdf = await PDFDocument.create();

      // Parse page range e.g. "1-3, 5"
      const totalPages = sourcePdf.getPageCount();
      const targetIndices = [];

      const parts = pageRange.split(',').map(p => p.trim());
      for (const part of parts) {
        if (part.includes('-')) {
          const [start, end] = part.split('-').map(Number);
          for (let i = start; i <= end; i++) {
            if (i >= 1 && i <= totalPages) targetIndices.push(i - 1);
          }
        } else {
          const num = Number(part);
          if (num >= 1 && num <= totalPages) targetIndices.push(num - 1);
        }
      }

      const copiedPages = await newPdf.copyPages(sourcePdf, targetIndices);
      copiedPages.forEach(p => newPdf.addPage(p));

      const pdfBytes = await newPdf.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      setResultPdfUrl(URL.createObjectURL(blob));
      setResultFilename(`split_${item.name}`);
      playSuccess();
    } catch (err) {
      alert('Error splitting PDF: ' + err.message);
      playError();
    } finally {
      setProcessing(false);
    }
  };

  // 3. ROTATE PAGES
  const handleRotatePdf = async () => {
    if (pdfFiles.length === 0) return;
    setProcessing(true);
    playClick();

    try {
      const item = pdfFiles[0];
      const arrayBuffer = await item.file.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);

      const pages = pdf.getPages();
      pages.forEach(page => {
        const currentRotation = page.getRotation().angle;
        page.setRotation(degrees((currentRotation + rotationAngle) % 360));
      });

      const pdfBytes = await pdf.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      setResultPdfUrl(URL.createObjectURL(blob));
      setResultFilename(`rotated_${item.name}`);
      playSuccess();
    } catch (err) {
      alert('Error rotating PDF: ' + err.message);
      playError();
    } finally {
      setProcessing(false);
    }
  };

  // 4. WATERMARK PDF
  const handleWatermarkPdf = async () => {
    if (pdfFiles.length === 0) return;
    setProcessing(true);
    playClick();

    try {
      const item = pdfFiles[0];
      const arrayBuffer = await item.file.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      const font = await pdf.embedFont(StandardFonts.HelveticaBold);

      const pages = pdf.getPages();
      pages.forEach(page => {
        const { width, height } = page.getSize();
        page.drawText(watermarkText, {
          x: width / 4,
          y: height / 2,
          size: 38,
          font,
          color: rgb(0.8, 0.1, 0.2),
          opacity: watermarkOpacity,
          rotate: degrees(45)
        });
      });

      const pdfBytes = await pdf.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      setResultPdfUrl(URL.createObjectURL(blob));
      setResultFilename(`watermarked_${item.name}`);
      playSuccess();
    } catch (err) {
      alert('Error watermarking PDF: ' + err.message);
      playError();
    } finally {
      setProcessing(false);
    }
  };

  // 5. IMAGES TO PDF
  const handleImagesToPdf = async () => {
    if (imageFiles.length === 0) return;
    setProcessing(true);
    playClick();

    try {
      const pdf = await PDFDocument.create();

      for (const imgFile of imageFiles) {
        const arrayBuffer = await imgFile.arrayBuffer();
        let embeddedImage;
        if (imgFile.type.includes('png')) {
          embeddedImage = await pdf.embedPng(arrayBuffer);
        } else {
          embeddedImage = await pdf.embedJpg(arrayBuffer);
        }

        const page = pdf.addPage([embeddedImage.width, embeddedImage.height]);
        page.drawImage(embeddedImage, {
          x: 0,
          y: 0,
          width: embeddedImage.width,
          height: embeddedImage.height
        });
      }

      const pdfBytes = await pdf.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      setResultPdfUrl(URL.createObjectURL(blob));
      setResultFilename(`images_${Date.now()}.pdf`);
      playSuccess();
    } catch (err) {
      alert('Error converting images to PDF: ' + err.message);
      playError();
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Sub-navigation */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar border-b-2 border-deck-border pb-3">
        {[
          { id: 'merge', label: 'MERGE PDFS', icon: Combine, activeClass: 'btn-pixel-purple' },
          { id: 'split', label: 'SPLIT / EXTRACT', icon: Scissors, activeClass: 'btn-pixel-coral' },
          { id: 'rotate', label: 'ROTATE PAGES', icon: RotateCw, activeClass: 'btn-pixel-cyan' },
          { id: 'watermark', label: 'WATERMARK STAMP', icon: Sparkles, activeClass: 'btn-pixel-amber' },
          { id: 'imgToPdf', label: 'IMAGES TO PDF', icon: Image, activeClass: 'btn-pixel-pink' },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => { playClick(); setActiveTab(tab.id); setResultPdfUrl(null); }}
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

      {/* Upload Zone */}
      {activeTab === 'imgToPdf' ? (
        <div
          onClick={() => imgInputRef.current?.click()}
          className="p-8 border-2 border-dashed border-deck-border hover:border-arcade-amber bg-deck-dark text-center cursor-pointer transition-colors space-y-2"
        >
          <Image className="w-10 h-10 mx-auto text-arcade-amber" />
          <div className="font-pixel text-xs text-white">SELECT IMAGES TO BIND INTO PDF</div>
          <p className="text-xs font-mono text-arcade-muted">Select multiple PNG or JPG images</p>
          <input
            ref={imgInputRef}
            type="file"
            multiple
            accept="image/png, image/jpeg"
            onChange={(e) => setImageFiles(Array.from(e.target.files || []))}
            className="hidden"
          />
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="p-8 border-2 border-dashed border-deck-border hover:border-arcade-amber bg-deck-dark text-center cursor-pointer transition-colors space-y-2"
        >
          <FileText className="w-10 h-10 mx-auto text-arcade-amber" />
          <div className="font-pixel text-xs text-white">UPLOAD PDF DOCUMENTS</div>
          <p className="text-xs font-mono text-arcade-muted">Drag & drop PDF files or click to browse</p>
          <input
            ref={fileInputRef}
            type="file"
            multiple={activeTab === 'merge'}
            accept="application/pdf"
            onChange={handlePdfUpload}
            className="hidden"
          />
        </div>
      )}

      {/* Selected PDF Files Queue */}
      {pdfFiles.length > 0 && activeTab !== 'imgToPdf' && (
        <div className="pixel-card bg-deck-dark p-4 space-y-3 border border-deck-border">
          <div className="flex items-center justify-between font-pixel text-[10px] text-arcade-amber border-b border-deck-border pb-2">
            <span>DOCUMENTS QUEUE ({pdfFiles.length})</span>
            <button
              onClick={() => { setPdfFiles([]); playClick(); }}
              className="text-arcade-coral hover:underline font-mono text-[11px]"
            >
              CLEAR ALL
            </button>
          </div>

          <div className="space-y-2">
            {pdfFiles.map((item, idx) => (
              <div
                key={item.id}
                className="p-2.5 bg-deck-bg border border-deck-border flex items-center justify-between text-xs font-mono"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-pixel text-[9px] text-arcade-cyan shrink-0">#{idx + 1}</span>
                  <span className="text-white truncate font-bold">{item.name}</span>
                  <span className="text-arcade-muted text-[10px]">({(item.size / 1024).toFixed(1)} KB)</span>
                </div>
                <button
                  onClick={() => removeFile(item.id)}
                  className="text-arcade-coral hover:text-red-400 p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Settings Panel */}
      <div className="pixel-card bg-deck-dark p-4 space-y-4 border border-deck-border max-w-xl mx-auto font-mono text-xs">
        {/* MERGE ACTION */}
        {activeTab === 'merge' && (
          <div className="space-y-3">
            <p className="text-arcade-muted">
              Select two or more PDFs to combine them into one seamless document.
            </p>
            <button
              onClick={handleMergePdfs}
              disabled={pdfFiles.length < 2 || processing}
              className="btn-pixel btn-pixel-amber w-full py-3 font-pixel text-xs flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Combine className="w-4 h-4" />
              {processing ? 'MERGING...' : 'MERGE ALL DOCUMENTS'}
            </button>
          </div>
        )}

        {/* SPLIT ACTION */}
        {activeTab === 'split' && (
          <div className="space-y-3">
            <div>
              <label className="text-arcade-muted block mb-1">Page Ranges (e.g. 1-2, 4)</label>
              <input
                type="text"
                value={pageRange}
                onChange={(e) => setPageRange(e.target.value)}
                placeholder="1-2, 4"
                className="w-full bg-deck-bg border border-deck-border p-2 text-white"
              />
            </div>
            <button
              onClick={handleSplitPdf}
              disabled={pdfFiles.length === 0 || processing}
              className="btn-pixel btn-pixel-amber w-full py-3 font-pixel text-xs flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Scissors className="w-4 h-4" />
              {processing ? 'SPLITTING...' : 'EXTRACT PAGES'}
            </button>
          </div>
        )}

        {/* ROTATE ACTION */}
        {activeTab === 'rotate' && (
          <div className="space-y-3">
            <div>
              <label className="text-arcade-muted block mb-1">Rotation Angle</label>
              <div className="grid grid-cols-3 gap-2">
                {[90, 180, 270].map(deg => (
                  <button
                    key={deg}
                    type="button"
                    onClick={() => setRotationAngle(deg)}
                    className={`p-2 font-pixel text-[9px] border ${
                      rotationAngle === deg ? 'bg-deck-surface border-arcade-amber text-arcade-amber' : 'bg-deck-bg border-deck-border text-arcade-muted'
                    }`}
                  >
                    +{deg}°
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={handleRotatePdf}
              disabled={pdfFiles.length === 0 || processing}
              className="btn-pixel btn-pixel-amber w-full py-3 font-pixel text-xs flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <RotateCw className="w-4 h-4" />
              {processing ? 'ROTATING...' : 'APPLY ROTATION'}
            </button>
          </div>
        )}

        {/* WATERMARK ACTION */}
        {activeTab === 'watermark' && (
          <div className="space-y-3">
            <div>
              <label className="text-arcade-muted block mb-1">Watermark Stamp Text</label>
              <input
                type="text"
                value={watermarkText}
                onChange={(e) => setWatermarkText(e.target.value)}
                className="w-full bg-deck-bg border border-deck-border p-2 text-white"
              />
            </div>
            <div>
              <div className="flex justify-between text-arcade-muted">
                <span>Opacity</span>
                <span>{Math.round(watermarkOpacity * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="0.9"
                step="0.05"
                value={watermarkOpacity}
                onChange={(e) => setWatermarkOpacity(Number(e.target.value))}
                className="w-full accent-arcade-amber"
              />
            </div>
            <button
              onClick={handleWatermarkPdf}
              disabled={pdfFiles.length === 0 || processing}
              className="btn-pixel btn-pixel-amber w-full py-3 font-pixel text-xs flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              {processing ? 'WATERMARKING...' : 'APPLY WATERMARK'}
            </button>
          </div>
        )}

        {/* IMAGES TO PDF */}
        {activeTab === 'imgToPdf' && (
          <div className="space-y-3">
            <p className="text-arcade-muted">
              {imageFiles.length} Image(s) selected to combine into PDF pages.
            </p>
            <button
              onClick={handleImagesToPdf}
              disabled={imageFiles.length === 0 || processing}
              className="btn-pixel btn-pixel-amber w-full py-3 font-pixel text-xs flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Image className="w-4 h-4" />
              {processing ? 'GENERATING...' : 'CONVERT IMAGES TO PDF'}
            </button>
          </div>
        )}

        {/* Result Ready Download Card */}
        {resultPdfUrl && (
          <div className="pt-4 border-t border-deck-border flex items-center justify-between gap-3 bg-deck-bg p-3 border border-arcade-emerald animate-fadeIn">
            <div className="text-arcade-emerald font-pixel text-[9px] flex items-center gap-2">
              <Check className="w-4 h-4" />
              PDF READY: {resultFilename}
            </div>
            <a
              href={resultPdfUrl}
              download={resultFilename}
              className="btn-pixel btn-pixel-emerald px-4 py-2 font-pixel text-[9px] flex items-center gap-2"
            >
              <Download className="w-3.5 h-3.5" />
              DOWNLOAD PDF
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

