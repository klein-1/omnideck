import React, { useState, useEffect, useRef } from 'react';
import { Search, X, ArrowRight, Sparkles, Terminal, CornerDownLeft } from 'lucide-react';
import { playClick, playBeep } from '../audio/soundEffects';

export default function QuickSearchModal({ isOpen, onClose, tools, onSelectTool }) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const filteredTools = tools.filter(tool => {
    const q = query.toLowerCase().trim();
    if (!q) return true;
    return (
      tool.name.toLowerCase().includes(q) ||
      tool.category.toLowerCase().includes(q) ||
      (tool.description && tool.description.toLowerCase().includes(q)) ||
      (tool.keywords && tool.keywords.some(k => k.toLowerCase().includes(q)))
    );
  }).slice(0, 25);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % Math.max(1, filteredTools.length));
        playBeep(400, 0.02);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredTools.length) % Math.max(1, filteredTools.length));
        playBeep(480, 0.02);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredTools[selectedIndex]) {
          playClick();
          onSelectTool(filteredTools[selectedIndex]);
          onClose();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredTools, selectedIndex, onSelectTool, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="pixel-card w-full max-w-2xl bg-deck-surface border-2 border-arcade-emerald shadow-pixel-lg">
        {/* Search Input Bar */}
        <div className="p-3 bg-deck-dark border-b-2 border-deck-border flex items-center gap-3">
          <Search className="w-5 h-5 text-arcade-emerald shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search all 120+ tools (e.g. youtube, spotify, ssl, pdf, invoice, 2048, age...)"
            className="w-full bg-transparent text-white font-mono text-sm placeholder:text-arcade-muted focus:outline-none"
          />
          {query && (
            <button 
              onClick={() => setQuery('')}
              className="text-arcade-muted hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="font-pixel text-[8px] bg-deck-surface border border-deck-border px-1.5 py-0.5 text-arcade-amber shrink-0">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto divide-y divide-deck-border/40 font-mono text-xs">
          {filteredTools.length === 0 ? (
            <div className="p-8 text-center text-arcade-muted space-y-2">
              <Terminal className="w-8 h-8 mx-auto text-arcade-coral opacity-60" />
              <p className="font-pixel text-xs text-arcade-coral">NO TOOLS MATCHED QUERY</p>
              <p className="text-[11px]">Try searching for "downloader", "image", "calculator", "speed", "games"</p>
            </div>
          ) : (
            filteredTools.map((tool, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={tool.id}
                  onClick={() => {
                    playClick();
                    onSelectTool(tool);
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`p-3 flex items-center justify-between cursor-pointer transition-colors ${
                    isSelected 
                      ? 'bg-deck-surfaceHover text-arcade-emerald border-l-4 border-arcade-emerald' 
                      : 'hover:bg-deck-bg text-slate-300 border-l-4 border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-7 h-7 flex items-center justify-center border ${
                      isSelected ? 'border-arcade-emerald bg-deck-dark text-arcade-emerald' : 'border-deck-border bg-deck-bg text-arcade-muted'
                    }`}>
                      {tool.icon || <Terminal className="w-3.5 h-3.5" />}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold truncate text-white">{tool.name}</span>
                        <span className="text-[9px] uppercase px-1.5 py-0.2 bg-deck-bg border border-deck-border text-arcade-cyan font-pixel">
                          {tool.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-arcade-muted truncate">{tool.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {isSelected && (
                      <span className="hidden sm:flex items-center gap-1 font-pixel text-[8px] text-arcade-emerald">
                        ENTER <CornerDownLeft className="w-3 h-3" />
                      </span>
                    )}
                    <ArrowRight className={`w-4 h-4 ${isSelected ? 'text-arcade-emerald translate-x-1' : 'text-deck-border'} transition-transform`} />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Navigation Hints */}
        <div className="p-2.5 bg-deck-dark border-t-2 border-deck-border flex items-center justify-between text-[10px] text-arcade-muted font-mono">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>ESC Close</span>
          </div>
          <span className="text-arcade-amber font-pixel text-[8px]">
            {filteredTools.length} TOOLS FOUND
          </span>
        </div>
      </div>
    </div>
  );
}

