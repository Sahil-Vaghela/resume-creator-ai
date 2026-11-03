import React from 'react';
import { X, Check } from 'lucide-react';
import templatesData from '../data/templates.json';

interface TemplateSelectorProps {
  currentTemplateId: string;
  onSelect: (id: string) => void;
  onClose: () => void;
}

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  currentTemplateId,
  onSelect,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-[#202923]/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="bg-white dark:bg-[#18201B] w-full max-w-3xl rounded-3xl flex flex-col max-h-[90vh] sm:max-h-[85vh] overflow-hidden border border-[#E9EDE9] dark:border-[#26332B] shadow-2xl">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-[#E9EDE9] dark:border-[#26332B] flex items-center justify-between shrink-0 bg-white dark:bg-[#18201B]">
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-[#202923] dark:text-[#EEF4F0]">
              Choose Resume Template
            </h2>
            <p className="text-xs text-[#7E8494] dark:text-[#718278] mt-0.5">
              All 6 formats are ATS-optimized and adapt cleanly to your career data
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl neu-button-secondary text-[#7E8494] hover:text-[#202923] dark:text-[#A0B2A7] dark:hover:text-[#EEF4F0] cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Templates Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 bg-[#FAFAF8] dark:bg-[#111613]">
          {templatesData.map((tpl) => {
            const isSelected = currentTemplateId === tpl.id;

            return (
              <div
                key={tpl.id}
                onClick={() => {
                  onSelect(tpl.id);
                  onClose();
                }}
                className={`p-4 rounded-3xl transition-all cursor-pointer flex flex-col justify-between group ${
                  isSelected
                    ? 'neu-active-nav border-2 border-[var(--theme-primary)] shadow-sm'
                    : 'neu-raised-card neu-raised-card-hover'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm text-[#202923] dark:text-[#EEF4F0]">{tpl.name}</span>
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-black/10"
                      style={{ backgroundColor: tpl.accentColor }}
                    />
                  </div>
                  <div className="inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[var(--theme-primary-light)] text-[var(--theme-primary)] mb-2 uppercase tracking-wider">
                    {tpl.badge}
                  </div>
                  <p className="text-xs text-[#7E8494] dark:text-[#718278] leading-relaxed">{tpl.tagline}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#E9EDE9] dark:border-[#26332B]">
                  <div className="text-[10px] font-bold text-[#7E8494] dark:text-[#718278] mb-1 uppercase tracking-wider">
                    BEST FOR:
                  </div>
                  <div className="text-xs text-[#202923] dark:text-[#EEF4F0] font-medium leading-snug">
                    {tpl.recommendedFor}
                  </div>

                  <div className="mt-3.5 flex items-center justify-between">
                    <span className="text-[10px] text-[#7E8494] dark:text-[#718278]">
                      {tpl.features.length} ATS checks
                    </span>
                    {isSelected ? (
                      <span className="flex items-center gap-1 text-xs font-bold text-[var(--theme-primary)] dark:text-[var(--theme-accent)]">
                        <Check className="w-3.5 h-3.5" />
                        <span>Active</span>
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-[var(--theme-primary)] dark:text-[var(--theme-accent)] group-hover:underline">
                        Select →
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
