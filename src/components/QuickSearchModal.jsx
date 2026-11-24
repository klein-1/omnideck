import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Search, X, ArrowRight, Terminal, CornerDownLeft, 
  History, Sparkles, Filter, Hash, Check
} from 'lucide-react';
import { playClick, playBeep } from '../audio/soundEffects';
import { SEARCH_CATEGORY_FILTERS } from '../data/toolsCatalog';

// Highlighting component for matched search terms
function HighlightedText({ text, query }) {
  if (!query || !query.trim()) return <span>{text}</span>;
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (!terms.length) return <span>{text}</span>;

  // Build regex matching any term
  const escaped = terms.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
  const regex = new RegExp(`(${escaped})`, 'gi');
  const parts = text.split(regex);

  return (
    <span>
      {parts.map((part, i) => 
        regex.test(part) ? (
          <span key={i} className="text-arcade-amber bg-amber-500/20 px-0.5 font-bold">
            {part}
          </span>
        ) : (
          part
        )
      )}
    </span>
  );
}

export default function QuickSearchModal({ isOpen, onClose, tools, onSelectTool }) {
  const [query, setQuery] = useState('');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('all');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentTools, setRecentTools] = useState([]);
  const inputRef = useRef(null);
  const resultListRef = useRef(null);
  const selectedItemRef = useRef(null);

  // Load recent searches on mount / open
  useEffect(() => {
    try {
      const saved = localStorage.getItem('omnideck_recent_tools');
      if (saved) setRecentTools(JSON.parse(saved));
    } catch {
      // ignore
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setActiveCategoryFilter('all');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Save selected tool to recent history
  const handleSelect = (tool) => {
    playClick();
    try {
      const updated = [tool, ...recentTools.filter(t => t.id !== tool.id)].slice(0, 6);
      setRecentTools(updated);
      localStorage.setItem('omnideck_recent_tools', JSON.stringify(updated));
    } catch {
      // ignore
    }
    onSelectTool(tool);
    onClose();
  };

  const clearRecents = (e) => {
    e.stopPropagation();
    playClick();
    setRecentTools([]);
    localStorage.removeItem('omnideck_recent_tools');
  };

  // Advanced multi-token fuzzy and keyword filtering
  const filteredTools = useMemo(() => {
    const q = query.toLowerCase().trim();
    const tokens = q ? q.split(/\s+/).filter(Boolean) : [];

    return tools.filter(tool => {
      // Category filter check
      if (activeCategoryFilter !== 'all' && tool.categoryId !== activeCategoryFilter) {
        return false;
      }

      // If no query string, return all in that category
      if (!tokens.length) return true;

      // Every search token must match either name, description, category, tabId, or keywords
      const name = tool.name.toLowerCase();
      const desc = (tool.description || '').toLowerCase();
      const cat = tool.category.toLowerCase();
      const tab = (tool.tabId || '').toLowerCase();
      const kws = (tool.keywords || []).map(k => k.toLowerCase()).join(' ');

      return tokens.every(token => 
        name.includes(token) ||
        desc.includes(token) ||
        cat.includes(token) ||
        tab.includes(token) ||
        kws.includes(token)
      );
    });
  }, [tools, query, activeCategoryFilter]);

  // Keep selected index within bounds
  useEffect(() => {
    setSelectedIndex(0);
  }, [query, activeCategoryFilter]);

  // Scroll selected item into view automatically on keyboard navigation
  useEffect(() => {
    if (selectedItemRef.current) {
      selectedItemRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      });
    }
  }, [selectedIndex]);

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
          handleSelect(filteredTools[selectedIndex]);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredTools, selectedIndex]);

  if (!isOpen) return null;

  const popularQuickPicks = [
    { label: 'Protractor', q: 'protractor' },
    { label: 'Screen Ruler', q: 'ruler' },
    { label: 'Speed Test', q: 'speed' },
    { label: 'Stopwatch', q: 'stopwatch' },
    { label: 'Pomodoro', q: 'pomodoro' },
    { label: 'Password Gen', q: 'password' },
    { label: 'QR Generator', q: 'qr' },
    { label: 'Invoice Maker', q: 'invoice' },
    { label: 'Unit Converter', q: 'unit' },
    { label: 'Minesweeper', q: 'minesweeper' },
    { label: '2048', q: '2048' },
  ];

  return (
    <div 
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          playClick();
          onClose();
        }
      }}
      className="fixed inset-0 z-50 flex items-start justify-center pt-2 sm:pt-10 p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn"
    >
      <div className="pixel-card w-full max-w-3xl bg-deck-surface border-2 border-arcade-emerald shadow-pixel-lg max-h-[92vh] flex flex-col overflow-hidden">
        {/* Search Input Bar */}
        <div className="p-3 sm:p-4 bg-deck-dark border-b-2 border-deck-border flex items-center gap-3">
          <div className="w-8 h-8 rounded-none bg-arcade-emerald/10 border border-arcade-emerald/50 flex items-center justify-center shrink-0">
            <Search className="w-4 h-4 text-arcade-emerald" />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search all 90+ tools (e.g. protractor, ruler, speed, stopwatch, qr, invoice, 2048...)"
            className="w-full bg-transparent text-white font-mono text-sm sm:text-base placeholder:text-arcade-muted/70 focus:outline-none"
          />
          {query && (
            <button 
              onClick={() => { playClick(); setQuery(''); inputRef.current?.focus(); }}
              className="text-arcade-muted hover:text-white p-1.5 hover:bg-deck-surface border border-transparent hover:border-arcade-coral transition-colors"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => { playClick(); onClose(); }}
            className="font-pixel text-[9px] bg-deck-surface hover:bg-deck-surfaceHover border border-deck-border px-2 py-1 text-arcade-muted hover:text-white shrink-0 flex items-center gap-1"
            title="Press ESC to close"
          >
            <span>ESC</span>
          </button>
        </div>

        {/* Category Filter Chips Bar */}
        <div className="px-3 py-2 bg-deck-bg border-b border-deck-border/70 flex items-center gap-1.5 overflow-x-auto no-scrollbar touch-scroll">
          <div className="flex items-center gap-1 text-[10px] font-pixel text-arcade-muted pr-1 shrink-0">
            <Filter className="w-3 h-3 text-arcade-emerald" />
            <span className="hidden xs:inline">FILTER:</span>
          </div>
          {SEARCH_CATEGORY_FILTERS.map(filter => {
            const isActive = activeCategoryFilter === filter.id;
            return (
              <button
                key={filter.id}
                onClick={() => { playClick(); setActiveCategoryFilter(filter.id); }}
                className={`font-pixel text-[8px] sm:text-[9px] px-2 py-1 border transition-all shrink-0 ${
                  isActive
                    ? 'bg-arcade-emerald text-black border-arcade-emerald font-bold shadow-pixel-sm'
                    : 'bg-deck-surface/70 border-deck-border text-arcade-muted hover:text-white hover:border-deck-borderLight'
                }`}
              >
                {filter.label}
              </button>
            );
          })}
        </div>

        {/* Quick Launch & Recents when Query is Empty */}
        {!query && activeCategoryFilter === 'all' && (
          <div className="p-3 bg-deck-dark/60 border-b border-deck-border/40 space-y-2">
            {recentTools.length > 0 && (
              <div>
                <div className="flex items-center justify-between text-[10px] font-mono text-arcade-muted mb-1.5">
                  <span className="flex items-center gap-1 text-arcade-cyan font-pixel text-[8px]">
                    <History className="w-3 h-3" /> RECENTLY ACCESSED
                  </span>
                  <button 
                    onClick={clearRecents}
                    className="hover:text-arcade-coral underline text-[9px]"
                  >
                    Clear History
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {recentTools.map(tool => (
                    <button
                      key={`recent-${tool.id}`}
                      onClick={() => handleSelect(tool)}
                      className="px-2 py-1 bg-deck-surface border border-arcade-cyan/40 hover:border-arcade-cyan text-[11px] font-mono text-slate-200 hover:text-white flex items-center gap-1.5 transition-colors group"
                    >
                      <span className="w-1.5 h-1.5 bg-arcade-cyan group-hover:scale-125 transition-transform"></span>
                      <span>{tool.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Popular quick launch suggestions */}
            <div>
              <span className="text-[10px] font-mono text-arcade-muted flex items-center gap-1 mb-1.5">
                <Sparkles className="w-3 h-3 text-arcade-amber" />
                <span className="font-pixel text-[8px] text-arcade-amber">POPULAR ESSENTIALS:</span>
              </span>
              <div className="flex flex-wrap gap-1.5">
                {popularQuickPicks.map(p => (
                  <button
                    key={p.label}
                    onClick={() => { playClick(); setQuery(p.q); }}
                    className="px-2 py-0.5 bg-deck-bg hover:bg-deck-surface border border-deck-border hover:border-arcade-amber/60 text-[10px] font-mono text-arcade-muted hover:text-arcade-amber transition-colors"
                  >
                    +{p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Results List */}
        <div 
          ref={resultListRef}
          className="flex-1 overflow-y-auto divide-y divide-deck-border/40 font-mono text-xs max-h-[58vh]"
        >
          {filteredTools.length === 0 ? (
            <div className="p-8 text-center text-arcade-muted space-y-3">
              <div className="w-12 h-12 mx-auto bg-arcade-coral/10 border border-arcade-coral/40 flex items-center justify-center">
                <Terminal className="w-6 h-6 text-arcade-coral" />
              </div>
              <p className="font-pixel text-xs text-arcade-coral">NO TOOLS MATCHED "{query}"</p>
              <p className="text-[11px] text-arcade-muted max-w-sm mx-auto leading-relaxed">
                Try searching for simple keywords like <span className="text-white underline">protractor</span>, <span className="text-white underline">ruler</span>, <span className="text-white underline">speed</span>, <span className="text-white underline">timer</span>, or select a category filter above.
              </p>
            </div>
          ) : (
            filteredTools.map((tool, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={tool.id}
                  ref={isSelected ? selectedItemRef : null}
                  onClick={() => handleSelect(tool)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`p-3 sm:p-3.5 flex items-center justify-between cursor-pointer transition-colors ${
                    isSelected 
                      ? 'bg-deck-surfaceHover text-arcade-emerald border-l-4 border-arcade-emerald' 
                      : 'hover:bg-deck-bg text-slate-300 border-l-4 border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className={`w-8 h-8 flex items-center justify-center border shrink-0 transition-colors ${
                      isSelected 
                        ? 'border-arcade-emerald bg-deck-dark text-arcade-emerald shadow-pixel-sm' 
                        : 'border-deck-border bg-deck-bg text-arcade-muted'
                    }`}>
                      <Terminal className="w-4 h-4" />
                    </div>

                    <div className="min-w-0 flex-1 pr-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold truncate text-white text-xs sm:text-sm">
                          <HighlightedText text={tool.name} query={query} />
                        </span>
                        <span className="text-[8px] sm:text-[9px] uppercase px-1.5 py-0.5 bg-deck-bg border border-deck-border text-arcade-cyan font-pixel shrink-0">
                          {tool.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-arcade-muted truncate mt-0.5">
                        <HighlightedText text={tool.description} query={query} />
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {isSelected && (
                      <span className="hidden sm:flex items-center gap-1 font-pixel text-[8px] text-arcade-emerald">
                        ENTER <CornerDownLeft className="w-3 h-3" />
                      </span>
                    )}
                    <div className={`p-1.5 border transition-all ${
                      isSelected ? 'border-arcade-emerald text-arcade-emerald bg-arcade-emerald/10' : 'border-transparent text-deck-border'
                    }`}>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Navigation Bar */}
        <div className="p-2.5 sm:p-3 bg-deck-dark border-t-2 border-deck-border flex items-center justify-between text-[10px] text-arcade-muted font-mono">
          <div className="flex items-center gap-3 sm:gap-4">
            <span className="flex items-center gap-1">
              <kbd className="font-pixel text-[8px] px-1 py-0.2 bg-deck-surface border border-deck-border text-white">↑↓</kbd> Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="font-pixel text-[8px] px-1 py-0.2 bg-deck-surface border border-deck-border text-white">↵</kbd> Launch
            </span>
            <span className="hidden sm:flex items-center gap-1">
              <kbd className="font-pixel text-[8px] px-1 py-0.2 bg-deck-surface border border-deck-border text-white">ESC</kbd> Close
            </span>
          </div>
          <span className="text-arcade-amber font-pixel text-[8px] sm:text-[9px]">
            {filteredTools.length} {filteredTools.length === 1 ? 'TOOL' : 'TOOLS'} MATCHED
          </span>
        </div>
      </div>
    </div>
  );
}
