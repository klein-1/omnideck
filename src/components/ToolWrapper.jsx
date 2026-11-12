import React from 'react';
import { Sparkles, Terminal } from 'lucide-react';

export default function ToolWrapper({ 
  title, 
  category, 
  description, 
  badge, 
  toolsList = [], 
  activeToolId, 
  onSelectSubTool, 
  children 
}) {
  return (
    <div className="space-y-3 sm:space-y-4 w-full max-w-full overflow-hidden">
      {/* Category Banner & Sub-tool Switcher */}
      <div className="pixel-card bg-deck-surface border-2 border-deck-border p-3 sm:p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5 sm:gap-3 border-b-2 border-deck-border pb-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-pixel text-[10px] sm:text-xs text-arcade-cyan uppercase tracking-widest truncate">
                // {category}
              </span>
              {badge && (
                <span className="font-pixel text-[7px] sm:text-[8px] px-1.5 py-0.5 bg-deck-bg border border-arcade-amber text-arcade-amber shrink-0">
                  {badge}
                </span>
              )}
            </div>
            <h1 className="font-pixel text-base sm:text-lg md:text-xl text-white tracking-tight mt-1 break-words">
              {title}
            </h1>
            <p className="text-[11px] sm:text-xs text-arcade-muted font-mono mt-0.5 leading-relaxed">
              {description}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
            <span className="font-pixel text-[7px] sm:text-[8px] text-arcade-emerald bg-deck-dark px-2 py-1 border border-deck-border flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-arcade-emerald animate-ping inline-block"></span>
              CORE READY
            </span>
          </div>
        </div>

        {/* Sub-tools Tab Pills (if multiple sub-tools exist in category) */}
        {toolsList.length > 1 && (
          <div className="pt-2.5 sm:pt-3 flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar touch-scroll">
            {toolsList.map(t => {
              const isActive = activeToolId === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => onSelectSubTool(t.id)}
                  className={`px-2.5 sm:px-3 py-1.5 border font-mono text-xs flex items-center gap-1.5 sm:gap-2 transition-all shrink-0 ${
                    isActive
                      ? 'bg-deck-dark border-arcade-emerald text-arcade-emerald shadow-pixel-sm font-bold'
                      : 'bg-deck-bg border-deck-border text-arcade-muted hover:text-white hover:border-deck-borderLight'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-none bg-current"></span>
                  <span className="font-pixel text-[8px] sm:text-[9px] whitespace-nowrap">{t.name}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Main Tool Content Container */}
      <div className="pixel-card bg-deck-surface border-2 border-deck-border p-3 sm:p-5 md:p-6 min-h-[420px] w-full max-w-full overflow-hidden">
        {children}
      </div>
    </div>
  );
}
