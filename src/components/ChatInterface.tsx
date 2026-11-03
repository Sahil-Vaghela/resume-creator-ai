import React, { useRef, useEffect } from 'react';
import {
  Menu,
  Layout,
  FileSpreadsheet,
  Eye,
  PanelLeft,
  Sparkles,
  GraduationCap,
  Briefcase,
  Plus,
} from 'lucide-react';
import { ChatMessageItem } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { ThemeSelector } from './ThemeSelector';
import { ChatMessage } from '../engine/conversationEngine';
import { QuestionDef } from '../engine/questionEngine';
import { ResumeData } from '../engine/resumeEngine';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  currentQuestion: QuestionDef;
  resume: ResumeData;
  isTyping: boolean;
  onAnswer: (answer: any) => void;
  onSkip: () => void;
  onPrevious?: () => void;
  onEditMessage: (message: ChatMessage) => void;
  onOpenTemplates: () => void;
  onOpenPreview: () => void;
  onStartNewResume: () => void;
  onContinuePrevious: () => void;
  onImportSample?: () => void;
  hasStarted: boolean;
  setHasStarted: (val: boolean) => void;
  isSidebarCollapsed: boolean;
  onToggleSidebar: () => void;
  onOpenMobileMenu: () => void;
  chatTheme: string;
  onSelectChatTheme: (themeId: string) => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  currentQuestion,
  resume,
  isTyping,
  onAnswer,
  onSkip,
  onPrevious,
  onEditMessage,
  onOpenTemplates,
  onOpenPreview,
  onStartNewResume,
  onContinuePrevious,
  onImportSample,
  hasStarted,
  setHasStarted,
  isSidebarCollapsed,
  onToggleSidebar,
  onOpenMobileMenu,
  chatTheme,
  onSelectChatTheme,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (hasStarted) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, currentQuestion?.id, hasStarted]);

  // Handler for starter prompts on the home screen
  const handleStarterPrompt = (promptText: string) => {
    setHasStarted(true);
    setTimeout(() => {
      onAnswer(promptText);
    }, 40);
  };

  const hasResumeData = Boolean(
    resume.personal?.fullName ||
      resume.career?.summary ||
      (resume.education && resume.education.length > 0) ||
      (resume.experience && resume.experience.length > 0)
  );

  return (
    <div
      className="chat-interface flex flex-col h-full w-full min-w-0 bg-[var(--theme-bg-main,#FAFAF8)] overflow-hidden relative transition-colors duration-200"
      data-chat-theme={chatTheme}
    >
      {/* Top Header */}
      <header className="h-16 px-4 sm:px-6 bg-[var(--theme-bg-header,#FFFFFF)] dark:bg-[var(--theme-bg-header,#18201B)] border-b border-[var(--theme-border,#E9EDE9)] dark:border-[var(--theme-border,#26332B)] flex items-center justify-between shrink-0 select-none z-10 transition-colors duration-200">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          {/* Mobile hamburger menu toggle */}
          <button
            onClick={onOpenMobileMenu}
            title="Open navigation"
            className="flex md:hidden p-2 rounded-xl neu-button-secondary text-[#4B5750] dark:text-[#A0B2A7] cursor-pointer shrink-0 items-center justify-center"
            aria-label="Open navigation menu"
          >
            <Menu className="w-4 h-4" />
          </button>

          {/* Desktop/Tablet collapse button toggle */}
          {isSidebarCollapsed && (
            <button
              onClick={onToggleSidebar}
              title="Expand sidebar"
              className="hidden md:flex p-2 rounded-xl neu-button-secondary text-[#7E8494] hover:text-[#202923] dark:text-[#A0B2A7] dark:hover:text-[#EEF4F0] cursor-pointer shrink-0"
            >
              <PanelLeft className="w-4 h-4" />
            </button>
          )}

          <div className="flex items-center gap-2.5 min-w-0">
            <span className="text-xs sm:text-sm font-bold text-[#202923] dark:text-[#EEF4F0] tracking-tight truncate">
              {hasStarted ? 'Conversation' : 'ResumeCraft AI'}
            </span>
            <span className="hidden sm:inline-block text-[10px] text-[var(--theme-primary)] dark:text-[var(--theme-accent)] bg-[var(--theme-primary-light)] dark:bg-[var(--theme-primary)]/20 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
              ATS-Ready
            </span>
          </div>
        </div>

        {/* Right Header Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Theme Customization Popover Button */}
          <ThemeSelector
            currentTheme={chatTheme}
            onSelectTheme={onSelectChatTheme}
          />

          {/* Resume Preview button (enabled whenever user has data or started) */}
          {(hasStarted || hasResumeData) && (
            <button
              onClick={onOpenPreview}
              title="View & Export Resume"
              className="text-xs font-bold px-3.5 py-1.5 rounded-xl neu-button-secondary text-[var(--theme-primary)] dark:text-[var(--theme-accent)] border-[var(--theme-primary)]/30 flex items-center gap-2 cursor-pointer transition min-h-[36px]"
            >
              <Eye className="w-3.5 h-3.5 text-[var(--theme-primary)] dark:text-[var(--theme-accent)]" />
              <span className="hidden xs:inline">Preview Resume</span>
            </button>
          )}

          <button
            onClick={onOpenTemplates}
            title="Select resume template"
            className="text-xs font-semibold px-3 py-1.5 rounded-xl neu-button-secondary text-[#4B5750] dark:text-[#A0B2A7] hover:text-[var(--theme-primary)] dark:hover:text-[var(--theme-accent)] flex items-center gap-1.5 cursor-pointer min-h-[36px]"
          >
            <Layout className="w-3.5 h-3.5 text-[var(--theme-primary)] dark:text-[var(--theme-accent)]" />
            <span className="hidden sm:inline">Templates</span>
          </button>
        </div>
      </header>

      {/* Main Center Area */}
      <div
        className={`flex-1 overflow-y-auto flex flex-col min-h-0 w-full min-w-0 ${
          hasStarted ? 'chat-scoped-surface' : ''
        }`}
      >
        {!hasStarted ? (
          /* ========================================================
             4. MAIN HOME SCREEN
             ======================================================== */
          <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-10 text-center max-w-3xl mx-auto my-auto animate-fadeIn select-none w-full min-w-0">
            {/* Raised Document Icon inside a rounded Neomorphic Container */}
            <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-3xl neu-raised flex items-center justify-center text-[var(--theme-primary)] dark:text-[var(--theme-accent)] mb-6 shrink-0">
              <FileSpreadsheet className="w-10 h-10 sm:w-11 sm:h-11 text-[var(--theme-primary)] dark:text-[var(--theme-accent)]" />
            </div>

            {/* Main Heading */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#202923] dark:text-[#EEF4F0] tracking-tight max-w-xl leading-tight mb-3">
              Build Your Resume with AI
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base text-[#7E8494] dark:text-[#718278] max-w-md mx-auto leading-relaxed mb-8">
              Create a professional, ATS-friendly resume through a simple conversation.
            </p>

            {/* Clean starter conversation suggestions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xl text-left">
              <button
                onClick={() => handleStarterPrompt('I want to create a new resume from scratch')}
                className="p-3.5 rounded-2xl neu-raised-card neu-raised-card-hover text-left cursor-pointer transition flex items-center gap-3 group"
              >
                <div className="w-9 h-9 rounded-xl neu-inset flex items-center justify-center text-[var(--theme-primary)] dark:text-[var(--theme-accent)] shrink-0">
                  <Plus className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-[#202923] dark:text-[#EEF4F0] group-hover:text-[var(--theme-primary)] dark:group-hover:text-[var(--theme-accent)] truncate">
                    Start from Scratch
                  </div>
                  <div className="text-[11px] text-[#7E8494] dark:text-[#718278] truncate">
                    Personalized step-by-step guidance
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleStarterPrompt('I am a fresher and want an entry-level resume')}
                className="p-3.5 rounded-2xl neu-raised-card neu-raised-card-hover text-left cursor-pointer transition flex items-center gap-3 group"
              >
                <div className="w-9 h-9 rounded-xl neu-inset flex items-center justify-center text-[var(--theme-primary)] dark:text-[var(--theme-accent)] shrink-0">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-[#202923] dark:text-[#EEF4F0] group-hover:text-[var(--theme-primary)] dark:group-hover:text-[var(--theme-accent)] truncate">
                    Fresher / Graduate
                  </div>
                  <div className="text-[11px] text-[#7E8494] dark:text-[#718278] truncate">
                    Focus on education & projects
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleStarterPrompt('I am an experienced professional highlighting my career')}
                className="p-3.5 rounded-2xl neu-raised-card neu-raised-card-hover text-left cursor-pointer transition flex items-center gap-3 group"
              >
                <div className="w-9 h-9 rounded-xl neu-inset flex items-center justify-center text-[var(--theme-primary)] dark:text-[var(--theme-accent)] shrink-0">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-[#202923] dark:text-[#EEF4F0] group-hover:text-[var(--theme-primary)] dark:group-hover:text-[var(--theme-accent)] truncate">
                    Experienced Professional
                  </div>
                  <div className="text-[11px] text-[#7E8494] dark:text-[#718278] truncate">
                    Highlight achievements & impact
                  </div>
                </div>
              </button>

              {onImportSample ? (
                <button
                  onClick={onImportSample}
                  className="p-3.5 rounded-2xl neu-raised-card neu-raised-card-hover text-left cursor-pointer transition flex items-center gap-3 group"
                >
                  <div className="w-9 h-9 rounded-xl neu-inset flex items-center justify-center text-[var(--theme-primary)] dark:text-[var(--theme-accent)] shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-[#202923] dark:text-[#EEF4F0] group-hover:text-[var(--theme-primary)] dark:group-hover:text-[var(--theme-accent)] truncate">
                      Load Sample Resume
                    </div>
                    <div className="text-[11px] text-[#7E8494] dark:text-[#718278] truncate">
                      Explore with prefilled senior profile
                    </div>
                  </div>
                </button>
              ) : (
                <button
                  onClick={onOpenTemplates}
                  className="p-3.5 rounded-2xl neu-raised-card neu-raised-card-hover text-left cursor-pointer transition flex items-center gap-3 group"
                >
                  <div className="w-9 h-9 rounded-xl neu-inset flex items-center justify-center text-[var(--theme-primary)] dark:text-[var(--theme-accent)] shrink-0">
                    <Layout className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-[#202923] dark:text-[#EEF4F0] group-hover:text-[var(--theme-primary)] dark:group-hover:text-[var(--theme-accent)] truncate">
                      Explore ATS Templates
                    </div>
                    <div className="text-[11px] text-[#7E8494] dark:text-[#718278] truncate">
                      6 proven layout formats
                    </div>
                  </div>
                </button>
              )}
            </div>
          </div>
        ) : (
          /* ========================================================
             6. CHAT CONVERSATION
             Rendered with scoped theme background and elements
             ======================================================== */
          <div className="w-full max-w-3xl mx-auto p-4 sm:p-6 space-y-4 min-w-0">
            {messages.map((msg) => (
              <ChatMessageItem key={msg.id} message={msg} onEdit={onEditMessage} />
            ))}

            {/* Current Active Bot Question */}
            {!isTyping && currentQuestion && (
              <div className="flex items-start gap-3 my-4 justify-start animate-fadeIn min-w-0">
                <div className="w-8 h-8 rounded-2xl chat-scoped-avatar flex items-center justify-center shrink-0 mt-0.5">
                  <FileSpreadsheet className="w-4 h-4 text-white" />
                </div>

                <div className="max-w-[88%] sm:max-w-[80%] flex flex-col items-start min-w-0">
                  <div className="flex items-center gap-2 mb-1 px-1">
                    <span className="text-[11px] font-bold chat-scoped-meta">
                      ResumeCraft
                    </span>
                  </div>

                  <div className="px-4 py-3 rounded-2xl chat-scoped-bot-bubble text-xs sm:text-sm leading-relaxed break-words overflow-hidden w-full">
                    <div className="font-medium whitespace-pre-line">
                      {currentQuestion.question}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex items-center gap-3 text-xs chat-scoped-meta py-2 animate-fadeIn">
                <div className="w-8 h-8 rounded-2xl chat-scoped-avatar flex items-center justify-center shrink-0">
                  <FileSpreadsheet className="w-4 h-4 text-white" />
                </div>
                <div className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl chat-scoped-bot-bubble">
                  <span
                    className="w-2 h-2 rounded-full animate-bounce"
                    style={{ backgroundColor: 'var(--chat-primary)' }}
                  />
                  <span
                    className="w-2 h-2 rounded-full animate-bounce"
                    style={{ backgroundColor: 'var(--chat-primary)', animationDelay: '150ms' }}
                  />
                  <span
                    className="w-2 h-2 rounded-full animate-bounce"
                    style={{ backgroundColor: 'var(--chat-primary)', animationDelay: '300ms' }}
                  />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Floating Bottom Input Bar */}
      <div className="shrink-0 w-full safe-pb">
        <ChatInput
          question={hasStarted ? currentQuestion : undefined}
          resume={resume}
          onSubmit={(answer) => {
            if (!hasStarted) {
              setHasStarted(true);
            }
            onAnswer(answer);
          }}
          onSkip={hasStarted && currentQuestion?.skipAllowed ? onSkip : undefined}
          onPrevious={hasStarted ? onPrevious : undefined}
          isSubmitting={isTyping}
          onImportSample={onImportSample}
        />
      </div>
    </div>
  );
};
