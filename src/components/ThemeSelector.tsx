import React, { useState, useRef, useEffect } from 'react';
import { Palette, Check, Sparkles } from 'lucide-react';
import { CHAT_THEMES, ChatTheme } from '../data/chatThemes';

interface ThemeSelectorProps {
  currentTheme: string;
  onSelectTheme: (themeId: string) => void;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  currentTheme,
  onSelectTheme,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const activeTheme = CHAT_THEMES.find((t) => t.id === currentTheme) || CHAT_THEMES[0];

  return (
    <div className="relative shrink-0" ref={containerRef}>
      {/* Palette Icon Button in Header */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        title={`Application Theme: ${activeTheme.name}`}
        aria-label="Customize application color theme"
        className={`w-9 h-9 rounded-xl neu-button-secondary flex items-center justify-center cursor-pointer transition relative ${
          isOpen ? 'neu-pressed' : ''
        }`}
      >
        <Palette className="w-4 h-4 text-[#4B5750] dark:text-[#A0B2A7] hover:text-[var(--theme-primary)] dark:hover:text-[var(--theme-accent)]" />
        {/* Subtle active color badge dot */}
        <span
          className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-[#18201B] shadow-xs"
          style={{ backgroundColor: activeTheme.preview.primary }}
        />
      </button>

      {/* Popover / Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-11 z-50 w-72 max-w-[calc(100vw-28px)] bg-white dark:bg-[#18201B] rounded-2xl border border-[#E9EDE9] dark:border-[#26332B] shadow-2xl p-2.5 animate-fadeIn select-none">
          {/* Popover Header */}
          <div className="px-2.5 py-1.5 mb-1.5 border-b border-[#E9EDE9] dark:border-[#26332B] flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-[var(--theme-primary)] dark:text-[var(--theme-accent)]" />
              <span className="text-xs font-bold text-[#202923] dark:text-[#EEF4F0]">
                Application Theme
              </span>
            </div>
            <span className="text-[10px] text-[#7E8494] dark:text-[#718278] font-medium">
              7 Color Schemes
            </span>
          </div>

          {/* Theme list */}
          <div className="space-y-1 max-h-72 overflow-y-auto pr-0.5">
            {CHAT_THEMES.map((theme) => {
              const isSelected = theme.id === currentTheme;

              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => {
                    onSelectTheme(theme.id);
                    setIsOpen(false);
                  }}
                  className={`w-full px-3 py-2 rounded-xl flex items-center justify-between text-left transition cursor-pointer group ${
                    isSelected
                      ? 'neu-active-nav font-semibold'
                      : 'hover:bg-[#FAFAF8] dark:hover:bg-[#202B25] text-[#202923] dark:text-[#EEF4F0]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {/* Color Swatch Trio */}
                    <div className="flex items-center -space-x-1 shrink-0 p-0.5 rounded-md bg-black/5 dark:bg-white/5">
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-white dark:border-[#18201B] shadow-xs"
                        style={{ backgroundColor: theme.preview.primary }}
                      />
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-white dark:border-[#18201B] shadow-xs"
                        style={{ backgroundColor: theme.preview.accent }}
                      />
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-white dark:border-[#18201B] shadow-xs"
                        style={{ backgroundColor: theme.preview.secondary }}
                      />
                    </div>

                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-bold truncate leading-tight">
                        {theme.name}
                      </span>
                      <span className="text-[10px] text-[#7E8494] dark:text-[#718278] truncate leading-tight">
                        {theme.tagline}
                      </span>
                    </div>
                  </div>

                  {/* Selected Indicator */}
                  {isSelected && (
                    <Check className="w-4 h-4 text-[var(--theme-primary)] dark:text-[var(--theme-accent)] shrink-0 ml-2" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
