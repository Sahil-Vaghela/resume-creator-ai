import React, { useState, useEffect, useRef } from 'react';
import { ProgressSidebar } from '../components/ProgressSidebar';
import { ChatInterface } from '../components/ChatInterface';
import { ResumePreview } from '../components/ResumePreview';
import { TemplateSelector } from '../components/TemplateSelector';
import { ResumeEditor } from '../components/ResumeEditor';
import {
  ResumeData,
  INITIAL_RESUME_DATA,
} from '../engine/resumeEngine';
import {
  ChatMessage,
  getInitialQuestionId,
  processAnswer,
} from '../engine/conversationEngine';
import {
  getQuestionById,
  formatQuestionPrompt,
  QuestionDef,
} from '../engine/questionEngine';
import {
  ChatSession,
  ChatHistoryStore,
  loadChatHistory,
  saveChatHistory,
  getActiveChat,
  createNewChatSession,
  renameChatInStore,
  deleteChatFromStore,
  generateChatTitle,
  getStoredUsername,
  saveStoredUsername,
  clearAllLocalData,
  getSampleResume,
} from '../engine/storageEngine';
import {
  getStoredAppTheme,
  saveStoredAppTheme,
  APP_THEMES,
  CHAT_THEMES,
} from '../data/chatThemes';
import { UsernameWelcome } from '../components/UsernameWelcome';
import chatbotResponses from '../data/chatbot-responses.json';
import {
  X,
  Settings as SettingsIcon,
  Moon,
  Sun,
  Trash2,
  Layout,
  ShieldCheck,
  Palette,
  Check,
} from 'lucide-react';

interface BuilderProps {
  onBackToHome?: () => void;
  initialResumeData?: ResumeData;
}

export const Builder: React.FC<BuilderProps> = ({ initialResumeData }) => {
  // Theme state: dark / light mode with persistence
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('resumecraft_theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('resumecraft_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('resumecraft_theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode((prev) => !prev);

  // Global Application Color Theme State (applies to sidebar, chatbot, modals, and preview)
  const [chatTheme, setChatTheme] = useState<string>(() => getStoredAppTheme());

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', chatTheme);
    }
  }, [chatTheme]);

  const handleSelectChatTheme = (themeId: string) => {
    setChatTheme(themeId);
    saveStoredAppTheme(themeId);
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', themeId);
    }
  };

  // 1. Chat History Store State
  const [chatStore, setChatStore] = useState<ChatHistoryStore>(() => {
    const loaded = loadChatHistory();
    if (initialResumeData && loaded.chats.length > 0) {
      const active = getActiveChat(loaded);
      if (active) {
        active.resumeData = initialResumeData;
      }
    }
    return loaded;
  });

  // Current active chat session reference
  const activeChat = getActiveChat(chatStore);

  // 2. Active Chat's Local States
  const [resume, setResume] = useState<ResumeData>(() => {
    return activeChat ? activeChat.resumeData : INITIAL_RESUME_DATA;
  });

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    return activeChat ? activeChat.messages : [];
  });

  const [currentQuestionId, setCurrentQuestionId] = useState<string>(() => {
    return activeChat?.conversationState?.currentQuestionId || getInitialQuestionId();
  });

  const [currentRecord, setCurrentRecord] = useState<any>(() => {
    return activeChat?.conversationState?.currentRecord || {};
  });

  const [questionHistory, setQuestionHistory] = useState<string[]>(() => {
    return activeChat?.conversationState?.questionHistory || [];
  });

  // Has started chat state: whether home screen or active conversation is showing
  const [hasStarted, setHasStarted] = useState<boolean>(() => {
    if (!activeChat) return false;
    const hasUserMsg = activeChat.messages.some((m) => m.sender === 'user');
    const hasName = Boolean(activeChat.resumeData?.personal?.fullName);
    return hasUserMsg || hasName;
  });

  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [showTemplatesModal, setShowTemplatesModal] = useState<boolean>(false);
  const [showResumeModal, setShowResumeModal] = useState<boolean>(false);
  const [showEditorModal, setShowEditorModal] = useState<boolean>(false);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);

  // Username State
  const [username, setUsername] = useState<string | null>(() => getStoredUsername());

  const handleUsernameComplete = (newUsername: string) => {
    saveStoredUsername(newUsername);
    setUsername(newUsername);
  };

  const handleChangeUsername = (newName: string) => {
    saveStoredUsername(newName);
    setUsername(newName);
  };

  const handleClearLocalData = () => {
    clearAllLocalData();
    const freshChat = createNewChatSession();
    const freshStore: ChatHistoryStore = {
      chats: [freshChat],
      activeChatId: freshChat.id,
    };
    saveChatHistory(freshStore);
    setChatStore(freshStore);
    setResume(freshChat.resumeData);
    setMessages(freshChat.messages);
    setCurrentQuestionId(freshChat.conversationState.currentQuestionId);
    setCurrentRecord({});
    setQuestionHistory([]);
    setHasStarted(false);
    setShowResumeModal(false);
    setShowTemplatesModal(false);
    setShowEditorModal(false);
    setShowSettingsModal(false);
    setUsername(null);
  };

  // Keep a ref to activeChat to avoid stale closures in effects
  const activeChatIdRef = useRef<string | null>(chatStore.activeChatId);
  useEffect(() => {
    activeChatIdRef.current = chatStore.activeChatId;
  }, [chatStore.activeChatId]);

  // Sync active chat's state into the ChatHistoryStore and LocalStorage
  const persistCurrentChatState = (
    updatedResume: ResumeData,
    updatedMessages: ChatMessage[],
    updatedQuestionId: string,
    updatedRecord: any,
    updatedHistory: string[],
    newTitle?: string
  ) => {
    if (!activeChatIdRef.current) return;

    setChatStore((prevStore) => {
      const updatedChats = prevStore.chats.map((c) => {
        if (c.id === activeChatIdRef.current) {
          const now = new Date().toISOString();
          return {
            ...c,
            title: newTitle || c.title,
            updatedAt: now,
            messages: updatedMessages,
            resumeData: updatedResume,
            conversationState: {
              currentQuestionId: updatedQuestionId,
              currentRecord: updatedRecord,
              questionHistory: updatedHistory,
            },
          };
        }
        return c;
      });

      updatedChats.sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );

      const newStore = { ...prevStore, chats: updatedChats };
      saveChatHistory(newStore);
      return newStore;
    });
  };

  const currentQuestionRaw = getQuestionById(currentQuestionId) || getQuestionById('full_name')!;
  const activeQuestionPrompt = formatQuestionPrompt(currentQuestionRaw, resume, currentRecord);
  const currentQuestion: QuestionDef = {
    ...currentQuestionRaw,
    question: activeQuestionPrompt,
  };

  const hasResumeData = Boolean(
    resume.personal?.fullName ||
      resume.career?.summary ||
      (resume.education && resume.education.length > 0) ||
      (resume.experience && resume.experience.length > 0)
  );

  // Switch to an existing chat session
  const handleSelectChatSession = (chatId: string) => {
    if (chatId === chatStore.activeChatId) {
      setShowResumeModal(false);
      return;
    }

    const targetChat = chatStore.chats.find((c) => c.id === chatId);
    if (!targetChat) return;

    persistCurrentChatState(
      resume,
      messages,
      currentQuestionId,
      currentRecord,
      questionHistory
    );

    const updatedStore: ChatHistoryStore = {
      ...chatStore,
      activeChatId: chatId,
    };
    saveChatHistory(updatedStore);
    setChatStore(updatedStore);

    setResume(targetChat.resumeData || INITIAL_RESUME_DATA);
    setMessages(targetChat.messages || []);
    setCurrentQuestionId(targetChat.conversationState?.currentQuestionId || getInitialQuestionId());
    setCurrentRecord(targetChat.conversationState?.currentRecord || {});
    setQuestionHistory(targetChat.conversationState?.questionHistory || []);

    const hasUserMsg = (targetChat.messages || []).some((m) => m.sender === 'user');
    const hasName = Boolean(targetChat.resumeData?.personal?.fullName);
    setHasStarted(hasUserMsg || hasName);
    setShowResumeModal(false);
  };

  // Create a brand new chat session
  const handleStartNewResume = () => {
    if (activeChatIdRef.current) {
      persistCurrentChatState(
        resume,
        messages,
        currentQuestionId,
        currentRecord,
        questionHistory
      );
    }

    const newChat = createNewChatSession();
    const updatedStore: ChatHistoryStore = {
      chats: [newChat, ...chatStore.chats],
      activeChatId: newChat.id,
    };
    saveChatHistory(updatedStore);
    setChatStore(updatedStore);

    setResume(newChat.resumeData);
    setMessages(newChat.messages);
    setCurrentQuestionId(newChat.conversationState.currentQuestionId);
    setCurrentRecord(newChat.conversationState.currentRecord);
    setQuestionHistory([]);
    setHasStarted(false);
    setShowResumeModal(false);
  };

  // Rename a chat
  const handleRenameChat = (chatId: string, newTitle: string) => {
    const updated = renameChatInStore(chatStore, chatId, newTitle);
    setChatStore(updated);
  };

  // Delete a chat
  const handleDeleteChat = (chatId: string) => {
    const { store: updatedStore, nextActiveChat } = deleteChatFromStore(chatStore, chatId);
    setChatStore(updatedStore);

    if (nextActiveChat) {
      setResume(nextActiveChat.resumeData || INITIAL_RESUME_DATA);
      setMessages(nextActiveChat.messages || []);
      setCurrentQuestionId(nextActiveChat.conversationState?.currentQuestionId || getInitialQuestionId());
      setCurrentRecord(nextActiveChat.conversationState?.currentRecord || {});
      setQuestionHistory(nextActiveChat.conversationState?.questionHistory || []);

      const hasUserMsg = (nextActiveChat.messages || []).some((m) => m.sender === 'user');
      const hasName = Boolean(nextActiveChat.resumeData?.personal?.fullName);
      setHasStarted(hasUserMsg || hasName);
    } else {
      const freshChat = createNewChatSession();
      const freshStore: ChatHistoryStore = {
        chats: [freshChat],
        activeChatId: freshChat.id,
      };
      saveChatHistory(freshStore);
      setChatStore(freshStore);

      setResume(freshChat.resumeData);
      setMessages(freshChat.messages);
      setCurrentQuestionId(freshChat.conversationState.currentQuestionId);
      setCurrentRecord({});
      setQuestionHistory([]);
      setHasStarted(false);
    }
  };

  // User submits an answer
  const handleAnswer = (answer: any) => {
    setIsTyping(true);
    const newHistory = [...questionHistory, currentQuestionId];
    setQuestionHistory(newHistory);

    let autoTitle: string | undefined = undefined;
    const currentChat = chatStore.chats.find((c) => c.id === chatStore.activeChatId);
    const isFirstUserMessage = !messages.some((m) => m.sender === 'user');

    if (
      isFirstUserMessage &&
      currentChat &&
      !currentChat.isManuallyRenamed &&
      (currentChat.title === 'New Chat' || currentChat.title === 'New Resume')
    ) {
      autoTitle = generateChatTitle(String(answer));
    }

    const result = processAnswer(
      currentQuestion,
      answer,
      resume,
      currentRecord,
      messages
    );

    setResume(result.updatedResume);
    setMessages(result.updatedMessages);
    setCurrentRecord(result.updatedCurrentRecord);

    persistCurrentChatState(
      result.updatedResume,
      result.updatedMessages,
      result.nextQuestionId || 'review_complete',
      result.updatedCurrentRecord,
      newHistory,
      autoTitle
    );

    setTimeout(() => {
      setIsTyping(false);

      if (result.nextQuestionId) {
        setCurrentQuestionId(result.nextQuestionId);

        const nextQ = getQuestionById(result.nextQuestionId);
        if (nextQ && nextQ.section !== currentQuestion.section && result.nextQuestionId !== currentQuestion.id) {
          const transitionText =
            (chatbotResponses.sectionTransitions as any)[nextQ.section] ||
            chatbotResponses.encouragements[0];

          const withTransition = [
            ...result.updatedMessages,
            {
              id: `msg-trans-${Date.now()}`,
              sender: 'bot' as const,
              text: transitionText,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            },
          ];

          setMessages(withTransition);
          persistCurrentChatState(
            result.updatedResume,
            withTransition,
            result.nextQuestionId,
            result.updatedCurrentRecord,
            newHistory,
            autoTitle
          );
        }
      } else {
        setCurrentQuestionId('review_complete');
        const doneMessages = [
          ...result.updatedMessages,
          {
            id: `msg-done-${Date.now()}`,
            sender: 'bot' as const,
            text: chatbotResponses.allDone,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ];
        setMessages(doneMessages);
        persistCurrentChatState(
          result.updatedResume,
          doneMessages,
          'review_complete',
          result.updatedCurrentRecord,
          newHistory,
          autoTitle
        );
        setShowResumeModal(true);
      }
    }, 350);
  };

  // User skips an optional question
  const handleSkip = () => {
    const newHistory = [...questionHistory, currentQuestionId];
    setQuestionHistory(newHistory);

    const skippedMessage: ChatMessage = {
      id: `msg-user-skip-${Date.now()}`,
      sender: 'user',
      text: 'Skipped this step',
      questionId: currentQuestion.id,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setIsTyping(true);
    const updatedMessages = [...messages, skippedMessage];
    setMessages(updatedMessages);

    setTimeout(() => {
      setIsTyping(false);

      const result = processAnswer(
        currentQuestion,
        '',
        resume,
        currentRecord,
        messages
      );

      setResume(result.updatedResume);
      const nextId = result.nextQuestionId || 'review_complete';
      setCurrentQuestionId(nextId);

      persistCurrentChatState(
        result.updatedResume,
        updatedMessages,
        nextId,
        currentRecord,
        newHistory
      );
    }, 250);
  };

  // Previous button
  const handlePrevious = () => {
    if (questionHistory.length === 0) return;
    const prevHistory = [...questionHistory];
    const prevQId = prevHistory.pop();
    setQuestionHistory(prevHistory);

    if (prevQId) {
      setCurrentQuestionId(prevQId);
      persistCurrentChatState(
        resume,
        messages,
        prevQId,
        currentRecord,
        prevHistory
      );
    }
  };

  // Edit message in-line
  const handleEditMessage = (targetMsg: ChatMessage) => {
    if (targetMsg.questionId) {
      setCurrentQuestionId(targetMsg.questionId);
      setHasStarted(true);
    }
  };

  // Continue previous draft
  const handleContinuePrevious = () => {
    setHasStarted(true);
  };

  // Load sample resume profile
  const handleImportSample = () => {
    const sample = getSampleResume();
    setResume(sample);
    setHasStarted(true);

    const welcomeSampleMsg: ChatMessage = {
      id: `msg-sample-${Date.now()}`,
      sender: 'bot',
      text: `Loaded Alex Morgan's Senior Full-Stack Engineer resume profile! Click "Preview Resume" in the header to view and export the PDF, or tell me anything you'd like to adjust.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, welcomeSampleMsg];
    setMessages(newMessages);

    persistCurrentChatState(
      sample,
      newMessages,
      currentQuestionId,
      currentRecord,
      questionHistory,
      'Senior Software Engineer (Sample)'
    );
  };

  // Determine active navigation item
  const activeNav: 'home' | 'chat' | 'templates' | 'settings' | 'resumes' = showResumeModal
    ? 'resumes'
    : !hasStarted
    ? 'home'
    : 'chat';

  return (
    <div
      className="app-container flex h-screen w-full bg-[var(--theme-bg-main,#FAFAF8)] text-[var(--theme-text-primary,#202923)] overflow-hidden select-none font-sans transition-colors duration-200"
      data-theme={chatTheme}
    >
      {/* Ask for username on first visit */}
      {!username && <UsernameWelcome onComplete={handleUsernameComplete} />}

      {/* 1. LEFT SIDEBAR */}
      <ProgressSidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
        onNewResume={handleStartNewResume}
        onGoHome={() => {
          setShowResumeModal(false);
          setHasStarted(false);
        }}
        onSelectChat={() => {
          setShowResumeModal(false);
          if (!hasStarted && messages.some((m) => m.sender === 'user')) {
            setHasStarted(true);
          }
        }}
        onOpenTemplates={() => setShowTemplatesModal(true)}
        onOpenSettings={() => setShowSettingsModal(true)}
        onOpenMyResumes={() => setShowResumeModal(true)}
        activeNav={activeNav}
        hasResumeData={hasResumeData}
        chats={chatStore.chats}
        activeChatId={chatStore.activeChatId}
        onSelectChatSession={handleSelectChatSession}
        onRenameChat={handleRenameChat}
        onDeleteChat={handleDeleteChat}
        username={username || ''}
        onChangeUsername={handleChangeUsername}
        onClearLocalData={handleClearLocalData}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
      />

      {/* 2. MAIN WORKSPACE */}
      <main className="flex-1 flex flex-col h-full w-full min-w-0 overflow-hidden relative">
        <ChatInterface
          messages={messages}
          currentQuestion={currentQuestion}
          resume={resume}
          isTyping={isTyping}
          onAnswer={handleAnswer}
          onSkip={handleSkip}
          onPrevious={questionHistory.length > 0 ? handlePrevious : undefined}
          onEditMessage={handleEditMessage}
          onOpenTemplates={() => setShowTemplatesModal(true)}
          onOpenPreview={() => setShowResumeModal(true)}
          onStartNewResume={handleStartNewResume}
          onContinuePrevious={handleContinuePrevious}
          onImportSample={handleImportSample}
          hasStarted={hasStarted}
          setHasStarted={setHasStarted}
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          chatTheme={chatTheme}
          onSelectChatTheme={handleSelectChatTheme}
        />
      </main>

      {/* Templates Selector Modal */}
      {showTemplatesModal && (
        <TemplateSelector
          currentTemplateId={resume.template}
          onSelect={(tplId) => {
            const updated = { ...resume, template: tplId };
            setResume(updated);
            persistCurrentChatState(
              updated,
              messages,
              currentQuestionId,
              currentRecord,
              questionHistory
            );
            setShowTemplatesModal(false);
          }}
          onClose={() => setShowTemplatesModal(false)}
        />
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 bg-[#202923]/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-[#18201B] w-full max-w-md rounded-3xl p-6 border border-[#E9EDE9] dark:border-[#26332B] shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#E9EDE9] dark:border-[#26332B]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl neu-inset text-[var(--theme-primary)] dark:text-[var(--theme-accent)] flex items-center justify-center">
                  <SettingsIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#202923] dark:text-[#EEF4F0]">Application Settings</h3>
                  <p className="text-[11px] text-[#7E8494] dark:text-[#718278]">Preferences & theme management</p>
                </div>
              </div>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="p-1.5 rounded-xl neu-button-secondary text-[#7E8494] hover:text-[#202923] dark:text-[#A0B2A7] dark:hover:text-[#EEF4F0] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Application Theme Section in Settings */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#202923] dark:text-[#EEF4F0] flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-[var(--theme-primary)] dark:text-[var(--theme-accent)]" />
                  <span>Application Theme</span>
                </label>
                <span className="text-[10px] text-[#7E8494] dark:text-[#718278]">Applies globally</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {APP_THEMES.map((theme) => {
                  const isSelected = theme.id === chatTheme;
                  return (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => handleSelectChatTheme(theme.id)}
                      className={`p-2.5 rounded-xl flex items-center justify-between text-left transition cursor-pointer text-xs font-semibold ${
                        isSelected
                          ? 'neu-active-nav font-bold'
                          : 'neu-button-secondary text-[#4B5750] dark:text-[#A0B2A7]'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span
                          className="w-3.5 h-3.5 rounded-full shrink-0 border border-black/10"
                          style={{ backgroundColor: theme.preview.primary }}
                        />
                        <span className="truncate">{theme.name}</span>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 shrink-0 text-[var(--theme-primary)] dark:text-[var(--theme-accent)]" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Appearance Section */}
            <div className="space-y-2 pt-2 border-t border-[#E9EDE9] dark:border-[#26332B]">
              <label className="text-xs font-bold text-[#202923] dark:text-[#EEF4F0]">App Appearance</label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsDarkMode(false)}
                  className={`p-3 rounded-2xl flex items-center gap-2.5 transition cursor-pointer text-xs font-semibold ${
                    !isDarkMode
                      ? 'neu-active-nav font-bold'
                      : 'neu-button-secondary text-[#4B5750] dark:text-[#A0B2A7]'
                  }`}
                >
                  <Sun className="w-4 h-4 text-[#F59E0B]" />
                  <span>Light Mode</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsDarkMode(true)}
                  className={`p-3 rounded-2xl flex items-center gap-2.5 transition cursor-pointer text-xs font-semibold ${
                    isDarkMode
                      ? 'neu-active-nav font-bold'
                      : 'neu-button-secondary text-[#4B5750] dark:text-[#A0B2A7]'
                  }`}
                >
                  <Moon className="w-4 h-4 text-[var(--theme-primary)] dark:text-[var(--theme-accent)]" />
                  <span>Dark Mode</span>
                </button>
              </div>
            </div>

            {/* Resume Template Shortcut */}
            <div className="space-y-2 pt-2 border-t border-[#E9EDE9] dark:border-[#26332B]">
              <label className="text-xs font-bold text-[#202923] dark:text-[#EEF4F0]">Default Template</label>
              <button
                type="button"
                onClick={() => {
                  setShowSettingsModal(false);
                  setShowTemplatesModal(true);
                }}
                className="w-full p-3 rounded-2xl neu-raised-card flex items-center justify-between text-xs font-semibold cursor-pointer text-[#202923] dark:text-[#EEF4F0]"
              >
                <div className="flex items-center gap-2">
                  <Layout className="w-4 h-4 text-[var(--theme-primary)] dark:text-[var(--theme-accent)]" />
                  <span>Current: <strong className="capitalize font-bold text-[var(--theme-primary)] dark:text-[var(--theme-accent)]">{resume.template}</strong></span>
                </div>
                <span className="text-[11px] text-[var(--theme-primary)] dark:text-[var(--theme-accent)] font-bold">Change →</span>
              </button>
            </div>

            {/* Privacy & Storage */}
            <div className="space-y-2 pt-2 border-t border-[#E9EDE9] dark:border-[#26332B]">
              <label className="text-xs font-bold text-[#202923] dark:text-[#EEF4F0]">Privacy & Data</label>
              <div className="p-3 rounded-2xl neu-inset text-xs text-[#7E8494] dark:text-[#718278] space-y-1.5 leading-relaxed">
                <div className="flex items-center gap-1.5 text-[var(--theme-primary)] dark:text-[var(--theme-accent)] font-bold text-[11px]">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>100% Client-Side Privacy</span>
                </div>
                <p className="text-[11px]">
                  All chats, theme preferences, and resume records are stored in your browser's LocalStorage only.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowSettingsModal(false);
                  handleClearLocalData();
                }}
                className="w-full mt-2 py-2 px-3 rounded-xl border border-[#C77D86]/30 text-[#C77D86] hover:bg-[#FFF5F5] dark:hover:bg-[#2E1B1E] text-xs font-bold cursor-pointer transition flex items-center justify-center gap-2"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Reset All Conversations & Data</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Resume Document Modal */}
      {showResumeModal && (
        <div className="fixed inset-0 z-50 bg-[#202923]/40 backdrop-blur-xs flex items-center justify-center p-0 sm:p-4 md:p-6 animate-fadeIn">
          <div className="bg-white dark:bg-[#18201B] w-full max-w-5xl h-full sm:h-[92vh] sm:rounded-3xl flex flex-col overflow-hidden border-0 sm:border border-[#E9EDE9] dark:border-[#26332B] shadow-2xl">
            {/* Modal Top Bar */}
            <div className="px-4 sm:px-6 py-3.5 border-b border-[#E9EDE9] dark:border-[#26332B] flex items-center justify-between shrink-0 select-none bg-white dark:bg-[#18201B]">
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="font-bold text-xs sm:text-sm text-[#202923] dark:text-[#EEF4F0]">
                  Resume Document
                </span>
                <span className="text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full bg-[var(--theme-primary-light)] text-[var(--theme-primary)] font-bold uppercase tracking-wider">
                  {resume.template}
                </span>
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  onClick={() => setShowEditorModal(true)}
                  className="text-xs font-semibold px-3 py-1.5 rounded-xl neu-button-secondary text-[#202923] dark:text-[#EEF4F0] hover:text-[var(--theme-primary)] dark:hover:text-[var(--theme-accent)] cursor-pointer transition"
                >
                  Edit Data
                </button>

                <button
                  onClick={() => setShowResumeModal(false)}
                  title="Close resume view"
                  className="p-1.5 rounded-xl neu-button-secondary text-[#7E8494] hover:text-[#202923] dark:text-[#A0B2A7] dark:hover:text-[#EEF4F0] cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Body: Resume Document & Export Tools */}
            <div className="flex-1 overflow-hidden bg-[var(--theme-bg-main,#FAFAF8)]">
              <ResumePreview
                resume={resume}
                onSelectTemplate={(tplId) => {
                  const updated = { ...resume, template: tplId };
                  setResume(updated);
                  persistCurrentChatState(
                    updated,
                    messages,
                    currentQuestionId,
                    currentRecord,
                    questionHistory
                  );
                }}
                onOpenEditor={() => setShowEditorModal(true)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Direct Resume Editor Modal */}
      {showEditorModal && (
        <ResumeEditor
          resume={resume}
          onSave={(updated) => {
            setResume(updated);
            persistCurrentChatState(
              updated,
              messages,
              currentQuestionId,
              currentRecord,
              questionHistory
            );
          }}
          onClose={() => setShowEditorModal(false)}
        />
      )}
    </div>
  );
};
