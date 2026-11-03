import React from 'react';
import { Sparkles } from 'lucide-react';

interface SuggestionChipsProps {
  suggestions: string[];
  onSelect: (value: string) => void;
  label?: string;
}

export const SuggestionChips: React.FC<SuggestionChipsProps> = ({
  suggestions,
  onSelect,
  label = 'Suggestions',
}) => {
  if (!suggestions || suggestions.length === 0) return null;

  return (
    <div className="mt-3">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-[#7E8494] dark:text-[#718278] mb-2">
        <Sparkles className="w-3.5 h-3.5 text-[#064E3B] dark:text-[#6EE7B7]" />
        <span>{label}</span>
      </div>
      <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto pr-1">
        {suggestions.map((suggestion, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onSelect(suggestion)}
            className="text-xs px-3.5 py-1.5 rounded-xl neu-button-secondary text-[#202923] dark:text-[#EEF4F0] hover:text-[#064E3B] dark:hover:text-[#6EE7B7] transition-all cursor-pointer text-left font-medium"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
};
