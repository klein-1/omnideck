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
    <div className="space-y-4">
      {/* Category Banner & Sub-tool Switcher */}
      <div className="pixel-card bg-deck-surface border-2 border-deck-border p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b-2 border-deck-border pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-pixel text-xs text-arcade-cyan uppercase tracking-widest">
                // {category}
              </span>
              {badge && (
                <span className="font-pixel text-[8px] px-1.5 py-0.5 bg-deck-bg border border-arcade-amber text-arcade-amber">
                  {badge}
                </span>
              )}
            </div>
            <h1 className="font-pixel text-lg sm:text-xl text-white tracking-tight mt-1">
              {title}
            </h1>
            <p className="text-xs text-arcade-muted font-mono mt-0.5">
              {description}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <span className="font-pixel text-[8px] text-arcade-emerald bg-deck-dark px-2 py-1 border border-deck-border flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-arcade-emerald animate-ping inline-block"></span>
              CORE READY
            </span>
          </div>
        </div>

        {/* Sub-tools Tab Pills (if multiple sub-tools exist in category) */}
        {toolsList.length > 1 && (
          <div className="pt-3 flex items-center gap-2 overflow-x-auto no-scrollbar">
            {toolsList.map(t => {
              const isActive = activeToolId === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => onSelectSubTool(t.id)}
                  className={`px-3 py-1.5 border font-mono text-xs flex items-center gap-2 transition-all shrink-0 ${
                    isActive
                      ? 'bg-deck-dark border-arcade-emerald text-arcade-emerald shadow-pixel-sm font-bold'
                      : 'bg-deck-bg border-deck-border text-arcade-muted hover:text-white hover:border-deck-borderLight'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-none bg-current"></span>
                  <span className="font-pixel text-[9px]">{t.name}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Main Tool Content Container */}
      <div className="pixel-card bg-deck-surface border-2 border-deck-border p-4 sm:p-6 min-h-[500px]">
        {children}
      </div>
    </div>
  );
}

