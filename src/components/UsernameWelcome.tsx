import React, { useState } from 'react';
import { FileSpreadsheet, ArrowRight, ShieldCheck } from 'lucide-react';
import { validateUsername } from '../engine/storageEngine';

interface UsernameWelcomeProps {
  onComplete: (username: string) => void;
}

export const UsernameWelcome: React.FC<UsernameWelcomeProps> = ({ onComplete }) => {
  const [usernameInput, setUsernameInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateUsername(usernameInput);
    if (!validation.isValid) {
      setError(validation.error || 'Please enter a valid username.');
      return;
    }
    setError(null);
    onComplete(usernameInput.trim());
  };

  return (
    <div className="fixed inset-0 z-50 bg-[var(--theme-bg-main,#FAFAF8)] flex flex-col items-center justify-center p-4 sm:p-6 select-none font-sans transition-colors duration-200">
      <div className="w-full max-w-md bg-[var(--theme-bg-card,#FFFFFF)] dark:bg-[var(--theme-bg-card,#18201B)] rounded-3xl neu-raised-card p-6 sm:p-10 animate-fadeIn relative overflow-hidden">
        {/* Top Logo Container */}
        <div className="w-14 h-14 rounded-2xl neu-raised flex items-center justify-center text-[var(--theme-primary)] dark:text-[var(--theme-accent)] mb-5">
          <FileSpreadsheet className="w-7 h-7 text-[var(--theme-primary)] dark:text-[var(--theme-accent)]" />
        </div>

        {/* Heading & Subheading */}
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#202923] dark:text-[#EEF4F0] tracking-tight mb-1">
          Welcome to ResumeCraft
        </h1>
        <div className="text-sm sm:text-base font-bold text-[var(--theme-primary)] dark:text-[var(--theme-accent)] mb-3">
          Build professional resumes through AI conversation.
        </div>

        {/* Description */}
        <p className="text-xs sm:text-sm text-[#7E8494] dark:text-[#718278] leading-relaxed mb-6">
          Set your display name to begin. Your sessions and resume data are saved securely in your browser.
        </p>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="username-input"
              className="block text-xs font-bold text-[#202923] dark:text-[#EEF4F0] mb-1.5"
            >
              What should we call you?
            </label>
            <div className="rounded-2xl neu-inset px-4 py-2">
              <input
                id="username-input"
                type="text"
                autoFocus
                value={usernameInput}
                onChange={(e) => {
                  setUsernameInput(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="Enter your name or handle..."
                maxLength={30}
                className="w-full bg-transparent text-sm text-[#202923] dark:text-[#EEF4F0] placeholder:text-[#7E8494] dark:placeholder:text-[#718278] focus:outline-none py-1"
              />
            </div>
            {error && (
              <p className="text-xs text-[#C77D86] font-semibold mt-1.5 animate-fadeIn">
                {error}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-3.5 px-5 rounded-2xl neu-button-deep text-white font-bold text-sm flex items-center justify-center gap-2 cursor-pointer transition"
          >
            <span>Start Building</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Footer info */}
        <div className="mt-8 pt-5 border-t border-[#E9EDE9] dark:border-[#26332B] text-center">
          <p className="text-[11px] sm:text-xs text-[#7E8494] dark:text-[#718278] flex items-center justify-center gap-1.5 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-[var(--theme-primary)] dark:text-[var(--theme-accent)]" />
            <span>100% Client-Side • No login required</span>
          </p>
        </div>
      </div>
    </div>
  );
};
