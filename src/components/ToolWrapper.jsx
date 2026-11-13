import React from 'react';
import { Sparkles, Terminal } from 'lucide-react';
import { CATEGORIES } from './Navigation';

export default function ToolWrapper({ 
  title, 
  category, 
  categoryId,
  description, 
  badge, 
  toolsList = [], 
  activeToolId, 
  onSelectSubTool, 
  children 
}) {
  // Find category signature color & styling
  const cat = CATEGORIES.find(c => 
    (categoryId && c.id === categoryId) || 
    (category && (c.label === category || category.includes(c.label) || c.label.includes(category)))
  ) || CATEGORIES[0];

  const themeHex = cat?.hex || '#ffb703';

  return (
    <div className="space-y-3 sm:space-y-4 w-full max-w-full overflow-hidden">
      {/* Category Banner & Sub-tool Switcher */}
      <div 
        style={{ borderTop: `4px solid ${themeHex}` }}
        className="pixel-card bg-deck-surface border-2 border-deck-border p-3 sm:p-4 shadow-pixel"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5 sm:gap-3 border-b-2 border-deck-border pb-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span 
                style={{ color: themeHex }}
                className="font-pixel text-[10px] sm:text-xs uppercase tracking-widest truncate font-bold"
              >
                // {category}
              </span>
              {badge && (
                <span 
                  style={{ borderColor: themeHex, color: themeHex, backgroundColor: `${themeHex}15` }}
                  className="font-pixel text-[7px] sm:text-[8px] px-1.5 py-0.5 border shrink-0 font-bold"
                >
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
            <span 
              style={{ borderColor: `${themeHex}60` }}
              className="font-pixel text-[7px] sm:text-[8px] bg-deck-dark px-2 py-1 border flex items-center gap-1.5"
            >
              <span 
                style={{ backgroundColor: themeHex }}
                className="w-1.5 h-1.5 animate-ping inline-block"
              ></span>
              <span style={{ color: themeHex }}>CORE READY</span>
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
                  style={isActive ? { 
                    borderColor: themeHex, 
                    color: themeHex, 
                    backgroundColor: `${themeHex}20`,
                    boxShadow: `2px 2px 0px ${themeHex}` 
                  } : {}}
                  className={`px-2.5 sm:px-3 py-1.5 border font-mono text-xs flex items-center gap-1.5 sm:gap-2 transition-all shrink-0 ${
                    isActive
                      ? 'shadow-pixel-sm font-bold'
                      : 'bg-deck-bg border-deck-border text-arcade-muted hover:text-white hover:border-deck-borderLight'
                  }`}
                >
                  <span 
                    style={isActive ? { backgroundColor: themeHex } : {}}
                    className="w-1.5 h-1.5 rounded-none bg-current"
                  ></span>
                  <span className="font-pixel text-[8px] sm:text-[9px] whitespace-nowrap">{t.name}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Main Tool Content Container */}
      <div 
        style={{ borderTop: `2px solid ${themeHex}40` }}
        className="pixel-card bg-deck-surface border-2 border-deck-border p-3 sm:p-5 md:p-6 min-h-[420px] w-full max-w-full overflow-hidden"
      >
        {children}
      </div>
    </div>
  );
}
