import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Paperclip,
  Check,
  Sparkles,
  Upload,
} from 'lucide-react';
import {
  QuestionDef,
  getSuggestionsForQuestion,
  getOptionsForQuestion,
  getSummarySuggestions,
} from '../engine/questionEngine';
import skillsData from '../data/skills.json';
import { ResumeData } from '../engine/resumeEngine';

interface ChatInputProps {
  question?: QuestionDef;
  resume: ResumeData;
  onSubmit: (answer: any) => void;
  onSkip?: () => void;
  onPrevious?: () => void;
  isSubmitting?: boolean;
  onImportSample?: () => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  question,
  resume,
  onSubmit,
  onSkip,
  onPrevious,
  isSubmitting = false,
  onImportSample,
}) => {
  const [textValue, setTextValue] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [showAttachMenu, setShowAttachMenu] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const attachMenuRef = useRef<HTMLDivElement>(null);

  // Skill selector state
  const [selectedSkills, setSelectedSkills] = useState<Record<string, string[]>>({
    programmingLanguages: [],
    frontend: [],
    backend: [],
    databases: [],
    frameworks: [],
    tools: [],
    other: [],
  });
  const [activeSkillCategory, setActiveSkillCategory] = useState<string>('programmingLanguages');
  const [customSkillInput, setCustomSkillInput] = useState<string>('');

  // Multi-tag selector state (languages, interests)
  const [tags, setTags] = useState<string[]>([]);
  const [customTagInput, setCustomTagInput] = useState<string>('');

  // Close attach menu on outside click
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (attachMenuRef.current && !attachMenuRef.current.contains(e.target as Node)) {
        setShowAttachMenu(false);
      }
    };
    if (showAttachMenu) {
      document.addEventListener('mousedown', handleOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutside);
    };
  }, [showAttachMenu]);

  useEffect(() => {
    setTextValue('');
    setError(null);
    setCustomSkillInput('');
    setCustomTagInput('');

    if (question?.type === 'skill_selector') {
      setSelectedSkills(
        resume.skills || {
          programmingLanguages: [],
          frontend: [],
          backend: [],
          databases: [],
          frameworks: [],
          tools: [],
          other: [],
        }
      );
    } else if (question?.type === 'multi_tag_selector') {
      const existing = (resume as any)[question.field || ''] || [];
      setTags(Array.isArray(existing) ? existing : []);
    } else if (question?.type === 'summary_generator') {
      setTextValue(resume.career.summary || '');
    }
  }, [question?.id]);

  const suggestions = question ? getSuggestionsForQuestion(question, resume) : [];
  const options = question ? getOptionsForQuestion(question) : [];

  const handleSend = (overrideValue?: any) => {
    let valueToValidate: any = overrideValue !== undefined ? overrideValue : textValue;

    if (question?.type === 'skill_selector') {
      valueToValidate = selectedSkills;
      const totalCount = Object.values(selectedSkills).reduce((acc, arr) => acc + arr.length, 0);
      if (question.required && totalCount === 0) {
        setError('Please select at least 3 skills to continue.');
        return;
      }
      setError(null);
      onSubmit(selectedSkills);
      return;
    }

    if (question?.type === 'multi_tag_selector') {
      valueToValidate = tags;
      if (question.required && tags.length === 0) {
        setError('Please select or add at least one item.');
        return;
      }
      setError(null);
      onSubmit(tags);
      return;
    }

    if (typeof valueToValidate === 'string') {
      if (!valueToValidate.trim()) return;
    }

    setError(null);
    onSubmit(valueToValidate);
    setTextValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (e.shiftKey) return;
      e.preventDefault();
      handleSend();
    }
  };

  const toggleSkill = (category: string, skill: string) => {
    setSelectedSkills((prev) => {
      const currentList = prev[category] || [];
      const updated = currentList.includes(skill)
        ? currentList.filter((s) => s !== skill)
        : [...currentList, skill];
      return { ...prev, [category]: updated };
    });
  };

  const addCustomSkill = () => {
    if (!customSkillInput.trim()) return;
    const skill = customSkillInput.trim();
    setSelectedSkills((prev) => {
      const currentList = prev[activeSkillCategory] || [];
      if (!currentList.includes(skill)) {
        return { ...prev, [activeSkillCategory]: [...currentList, skill] };
      }
      return prev;
    });
    setCustomSkillInput('');
  };

  const toggleTag = (item: string) => {
    setTags((prev) => (prev.includes(item) ? prev.filter((t) => t !== item) : [...prev, item]));
  };

  const addCustomTag = () => {
    if (!customTagInput.trim()) return;
    const tag = customTagInput.trim();
    if (!tags.includes(tag)) {
      setTags((prev) => [...prev, tag]);
    }
    setCustomTagInput('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      try {
        const parsed = JSON.parse(content);
        if (parsed.personal || parsed.experience || parsed.education) {
          onSubmit(parsed);
          setError(null);
          setShowAttachMenu(false);
          return;
        }
      } catch {
        // Not a JSON file, treat as text answer
      }
      setTextValue(content.slice(0, 500));
      setShowAttachMenu(false);
    };
    reader.readAsText(file);
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 pb-4 sm:pb-6 pt-1">
      {/* Validation Error Message */}
      {error && (
        <div className="mb-2 text-xs font-semibold text-[#C77D86] bg-[#FFF5F5] dark:bg-[#2E1B1E] border border-[#FED7D7] dark:border-[#4A262B] px-4 py-2 rounded-2xl animate-fadeIn text-center shadow-xs">
          {error}
        </div>
      )}

      {/* 1. Skill Selector Overlay */}
      {question?.type === 'skill_selector' && (
        <div className="mb-3.5 p-4 rounded-3xl chat-scoped-bot-bubble space-y-3 animate-fadeIn">
          <div className="flex flex-wrap gap-1.5">
            {skillsData.categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveSkillCategory(cat.id)}
                className={`text-xs px-3.5 py-1.5 rounded-xl font-medium transition cursor-pointer ${
                  activeSkillCategory === cat.id
                    ? 'chat-scoped-send-btn text-white font-bold'
                    : 'neu-button-secondary text-[#4B5750] dark:text-[#A0B2A7]'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {(() => {
            const currentCat = skillsData.categories.find((c) => c.id === activeSkillCategory);
            const currentSkills = currentCat ? currentCat.skills : [];
            const selectedInCat = selectedSkills[activeSkillCategory] || [];
            return (
              <div className="space-y-2">
                <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1.5 chat-scoped-input-inset rounded-2xl">
                  {currentSkills.map((sk) => {
                    const isSelected = selectedInCat.includes(sk);
                    return (
                      <button
                        key={sk}
                        type="button"
                        onClick={() => toggleSkill(activeSkillCategory, sk)}
                        className={`text-xs px-3 py-1.5 rounded-xl transition cursor-pointer font-medium flex items-center gap-1.5 ${
                          isSelected
                            ? 'chat-scoped-tag font-semibold'
                            : 'bg-white dark:bg-[#18201B] text-[#4B5750] dark:text-[#A0B2A7] border border-[#E9EDE9] dark:border-[#26332B]'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                        <span>{sk}</span>
                      </button>
                    );
                  })}
                </div>
                <div className="flex items-center gap-2 pt-2 border-t border-[#E9EDE9] dark:border-[#26332B]">
                  <input
                    type="text"
                    value={customSkillInput}
                    onChange={(e) => setCustomSkillInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomSkill())}
                    placeholder={`+ Add custom skill to ${currentCat?.name || 'category'}...`}
                    className="flex-1 text-xs px-3.5 py-2 rounded-xl chat-scoped-input-inset focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={addCustomSkill}
                    className="text-xs px-3.5 py-2 neu-button-secondary rounded-xl font-semibold cursor-pointer transition"
                  >
                    Add
                  </button>
                </div>
              </div>
            );
          })()}

          <div className="flex items-center justify-between pt-1">
            <span className="text-xs chat-scoped-meta">
              Selected:{' '}
              <strong className="font-bold tabular-nums">
                {Object.values(selectedSkills).reduce((acc, arr) => acc + arr.length, 0)}
              </strong>
            </span>
            <button
              type="button"
              onClick={() => handleSend()}
              className="text-xs px-5 py-2 chat-scoped-send-btn text-white rounded-xl font-bold cursor-pointer transition"
            >
              Confirm Skills
            </button>
          </div>
        </div>
      )}

      {/* 2. Options Chips for radio/boolean choice */}
      {question && (question.type === 'radio_cards' || question.type === 'boolean_choice') && (
        <div className="mb-3 flex flex-wrap gap-2 justify-center animate-fadeIn">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => handleSend(opt.value)}
              className="text-xs px-4 py-2 rounded-2xl neu-button-secondary hover:chat-scoped-tag text-[#202923] dark:text-[#EEF4F0] font-semibold cursor-pointer transition"
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}

      {/* 3. Predefined Suggestion Chips */}
      {suggestions.length > 0 && question?.type !== 'skill_selector' && (
        <div className="mb-2.5 flex flex-wrap gap-1.5 justify-center max-h-20 overflow-y-auto">
          {suggestions.map((s, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setTextValue(s)}
              className="text-[11px] px-3 py-1 rounded-xl neu-button-secondary hover:chat-scoped-tag text-[#4B5750] dark:text-[#A0B2A7] cursor-pointer transition"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* 4. Multi-tag Chips (Languages, Interests) */}
      {question?.type === 'multi_tag_selector' && (
        <div className="mb-3 p-3.5 rounded-3xl chat-scoped-bot-bubble space-y-2.5 animate-fadeIn">
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-xl chat-scoped-tag font-semibold"
                >
                  <span>{tag}</span>
                  <button
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className="hover:text-[#C77D86] cursor-pointer text-sm font-bold ml-0.5"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={customTagInput}
              onChange={(e) => setCustomTagInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomTag())}
              placeholder="Type and add or pick suggestions above..."
              className="flex-1 text-xs px-3.5 py-2 rounded-xl chat-scoped-input-inset focus:outline-none"
            />
            <button
              type="button"
              onClick={addCustomTag}
              className="text-xs px-3.5 py-2 neu-button-secondary rounded-xl font-semibold cursor-pointer transition"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => handleSend()}
              className="text-xs px-4 py-2 chat-scoped-send-btn text-white rounded-xl font-bold cursor-pointer transition"
            >
              Save
            </button>
          </div>
        </div>
      )}

      {/* 5. Summary Generator Options */}
      {question?.type === 'summary_generator' && (
        <div className="mb-3 flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
          {getSummarySuggestions(
            resume.career?.experienceLevel,
            resume.personal?.professionalTitle
          ).map((tpl, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setTextValue(tpl.text)}
              className="text-[11px] px-3.5 py-1.5 rounded-xl neu-button-secondary hover:chat-scoped-tag text-[#4B5750] dark:text-[#A0B2A7] text-left line-clamp-1 cursor-pointer transition"
            >
              ✦ {tpl.category}
            </button>
          ))}
        </div>
      )}

      {/* Floating Neomorphic Chat Input Box with Scoped Theme */}
      {question?.type !== 'skill_selector' && (
        <div className="relative flex items-center rounded-3xl chat-scoped-input-bar p-2 pl-3 sm:pl-3.5 transition-all gap-2">
          {/* Attachment Icon */}
          <div className="relative shrink-0" ref={attachMenuRef}>
            <button
              type="button"
              onClick={() => setShowAttachMenu(!showAttachMenu)}
              title="Attach or import resume data"
              className="w-9 h-9 rounded-2xl neu-button-secondary text-[#7E8494] hover:text-[var(--theme-primary)] dark:text-[#A0B2A7] dark:hover:text-[var(--theme-accent)] flex items-center justify-center cursor-pointer transition shrink-0"
              aria-label="Attachment options"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            {/* Hidden native file input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".json,.txt"
              className="hidden"
            />

            {/* Attachment Dropdown Menu */}
            {showAttachMenu && (
              <div className="absolute bottom-12 left-0 z-50 w-52 bg-white dark:bg-[#1A231E] rounded-2xl border border-[#E9EDE9] dark:border-[#26332B] p-1.5 shadow-xl animate-fadeIn space-y-1">
                <button
                  type="button"
                  onClick={() => {
                    fileInputRef.current?.click();
                  }}
                  className="w-full px-3 py-2 text-xs font-medium text-[#202923] dark:text-[#EEF4F0] hover:text-[var(--theme-primary)] dark:hover:text-[var(--theme-accent)] hover:bg-[#FAFAF8] dark:hover:bg-[#202B25] rounded-xl flex items-center gap-2 cursor-pointer transition text-left"
                >
                  <Upload className="w-3.5 h-3.5 text-[var(--theme-primary)] dark:text-[var(--theme-accent)]" />
                  <span>Import JSON / Text</span>
                </button>

                {onImportSample && (
                  <button
                    type="button"
                    onClick={() => {
                      onImportSample();
                      setShowAttachMenu(false);
                    }}
                    className="w-full px-3 py-2 text-xs font-medium text-[#202923] dark:text-[#EEF4F0] hover:text-[var(--theme-primary)] dark:hover:text-[var(--theme-accent)] hover:bg-[#FAFAF8] dark:hover:bg-[#202B25] rounded-xl flex items-center gap-2 cursor-pointer transition text-left"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[var(--theme-accent,#059669)]" />
                    <span>Load Sample Resume</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Scoped Inset Input Field */}
          <div className="flex-1 flex items-center rounded-2xl chat-scoped-input-inset px-3.5 py-1.5 min-w-0 transition-all">
            <input
              type="text"
              value={textValue}
              onChange={(e) => setTextValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                question?.placeholder ||
                'Tell me about your education, skills, or experience...'
              }
              className="w-full bg-transparent text-xs sm:text-sm placeholder:text-[#7E8494] dark:placeholder:text-[#718278] focus:outline-none py-1.5"
              autoFocus
            />
          </div>

          {/* Action buttons on the right */}
          <div className="flex items-center gap-1.5 pr-0.5 shrink-0">
            {question?.skipAllowed && onSkip && (
              <button
                type="button"
                onClick={onSkip}
                title="Skip optional question"
                className="text-[11px] sm:text-xs text-[#7E8494] dark:text-[#718278] hover:text-[#202923] dark:hover:text-[#EEF4F0] px-2.5 py-1.5 rounded-xl hover:bg-[#FAFAF8] dark:hover:bg-[#202B25] transition cursor-pointer min-h-[36px] flex items-center font-medium"
              >
                Skip
              </button>
            )}

            {/* Scoped Theme Send Button with White Send Icon */}
            <button
              type="button"
              onClick={() => handleSend()}
              disabled={isSubmitting || (question?.required && !textValue.trim())}
              className="w-10 h-10 rounded-2xl chat-scoped-send-btn disabled:opacity-40 flex items-center justify-center cursor-pointer shrink-0 transition"
              aria-label="Send message"
            >
              <Send className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
