import React, { useState, useRef, useEffect } from 'react';
import {
  Home,
  MessageSquare,
  Layout,
  Settings,
  Plus,
  PanelLeftClose,
  PanelLeft,
  X,
  MoreVertical,
  Pencil,
  Trash2,
  Check,
  FileSpreadsheet,
  ChevronDown,
  UserPen,
  AlertTriangle,
  Moon,
  Sun,
  FileText,
} from 'lucide-react';
import { ChatSession, validateUsername } from '../engine/storageEngine';

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  onNewResume: () => void;
  onGoHome: () => void;
  onSelectChat: () => void;
  onOpenTemplates: () => void;
  onOpenSettings: () => void;
  onOpenMyResumes?: () => void;
  activeNav: 'home' | 'chat' | 'templates' | 'settings' | 'resumes';
  hasResumeData: boolean;
  // Chat History Props
  chats: ChatSession[];
  activeChatId: string | null;
  onSelectChatSession: (chatId: string) => void;
  onRenameChat: (chatId: string, newTitle: string) => void;
  onDeleteChat: (chatId: string) => void;
  // Username Props
  username: string;
  onChangeUsername: (newName: string) => void;
  onClearLocalData: () => void;
  // Dark mode
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
}

export const ProgressSidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
  onNewResume,
  onGoHome,
  onSelectChat,
  onOpenTemplates,
  onOpenSettings,
  onOpenMyResumes,
  activeNav,
  hasResumeData,
  chats,
  activeChatId,
  onSelectChatSession,
  onRenameChat,
  onDeleteChat,
  username,
  onChangeUsername,
  onClearLocalData,
  isDarkMode = false,
  onToggleDarkMode,
}) => {
  // Menu state: which chat ID has its 3-dot dropdown open
  const [openMenuChatId, setOpenMenuChatId] = useState<string | null>(null);

  // Rename state
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editTitleInput, setEditTitleInput] = useState<string>('');

  // Delete chat confirmation state
  const [confirmDeleteChatId, setConfirmDeleteChatId] = useState<string | null>(null);

  // User Profile Dropdown & Modal States
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isChangeUsernameModalOpen, setIsChangeUsernameModalOpen] = useState(false);
  const [newUsernameInput, setNewUsernameInput] = useState('');
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [isClearDataModalOpen, setIsClearDataModalOpen] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuChatId(null);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    if (openMenuChatId || isProfileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openMenuChatId, isProfileMenuOpen]);

  const handleStartRename = (chat: ChatSession, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingChatId(chat.id);
    setEditTitleInput(chat.title);
    setOpenMenuChatId(null);
  };

  const handleSaveRename = (chatId: string, e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (editTitleInput.trim()) {
      onRenameChat(chatId, editTitleInput.trim());
    }
    setEditingChatId(null);
    setEditTitleInput('');
  };

  const handleCancelRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingChatId(null);
    setEditTitleInput('');
  };

  const handleTriggerDelete = (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirmDeleteChatId(chatId);
    setOpenMenuChatId(null);
  };

  const handleConfirmDelete = () => {
    if (confirmDeleteChatId) {
      onDeleteChat(confirmDeleteChatId);
      setConfirmDeleteChatId(null);
    }
  };

  const handleOpenChangeUsername = () => {
    setNewUsernameInput(username);
    setUsernameError(null);
    setIsChangeUsernameModalOpen(true);
    setIsProfileMenuOpen(false);
  };

  const handleSaveUsernameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateUsername(newUsernameInput);
    if (!validation.isValid) {
      setUsernameError(validation.error || 'Please enter a valid username.');
      return;
    }
    onChangeUsername(newUsernameInput.trim());
    setIsChangeUsernameModalOpen(false);
  };

  const handleOpenClearData = () => {
    setIsClearDataModalOpen(true);
    setIsProfileMenuOpen(false);
  };

  const handleConfirmClearData = () => {
    setIsClearDataModalOpen(false);
    onClearLocalData();
  };

  const handleItemClick = (callback: () => void) => {
    callback();
    onCloseMobile();
  };

  const userInitial = username ? username.trim().charAt(0).toUpperCase() : 'U';

  const navContent = (
    <div className="flex flex-col h-full justify-between p-4 bg-[var(--theme-bg-sidebar,#FFFFFF)] dark:bg-[var(--theme-bg-sidebar,#18201B)] select-none relative transition-colors duration-200">
      <div className="flex-1 flex flex-col min-h-0">
        {/* Header with Logo and Close/Collapse */}
        <div className="flex items-center justify-between mb-5 px-1 min-h-[44px] shrink-0">
          <div
            onClick={() => handleItemClick(onGoHome)}
            className="flex items-center gap-3 cursor-pointer group"
          >
            {/* Raised Neomorphic Container for Logo */}
            <div className="w-10 h-10 rounded-2xl neu-raised flex items-center justify-center text-[var(--theme-primary)] dark:text-[var(--theme-accent)] font-bold text-xs shrink-0">
              <FileSpreadsheet className="w-5 h-5 text-[var(--theme-primary)] dark:text-[var(--theme-accent)]" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-extrabold text-[15px] text-[#202923] dark:text-[#EEF4F0] tracking-tight truncate leading-tight group-hover:text-[var(--theme-primary)] dark:group-hover:text-[var(--theme-accent)] transition-colors">
                ResumeCraft
              </span>
              <span className="text-[11px] text-[#7E8494] dark:text-[#718278] font-medium leading-tight">
                AI Resume Builder
              </span>
            </div>
          </div>

          {/* Desktop/Tablet collapse button */}
          <button
            onClick={onToggleCollapse}
            title="Collapse sidebar"
            className="hidden md:flex p-2 rounded-xl neu-button-secondary text-[#7E8494] hover:text-[#202923] dark:text-[#A0B2A7] dark:hover:text-[#EEF4F0] cursor-pointer"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>

          {/* Mobile close button */}
          <button
            onClick={onCloseMobile}
            title="Close menu"
            className="flex md:hidden p-2 rounded-xl neu-button-secondary text-[#7E8494] hover:text-[#202923] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Soft Raised Neomorphic "New Chat" Button with Theme background */}
        <button
          onClick={() => handleItemClick(onNewResume)}
          className="w-full min-h-[44px] flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl neu-button-deep text-xs font-bold text-white mb-5 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>New Chat</span>
        </button>

        {/* Top Navigation Items */}
        <div className="space-y-1.5 shrink-0 mb-5">
          {/* Home */}
          <button
            onClick={() => handleItemClick(onGoHome)}
            className={`w-full min-h-[38px] flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium text-left transition-all cursor-pointer ${
              activeNav === 'home'
                ? 'neu-active-nav font-bold'
                : 'text-[#4B5750] dark:text-[#A0B2A7] hover:bg-[#FAFAF8] dark:hover:bg-[#1F2922] hover:text-[#202923] dark:hover:text-[#EEF4F0]'
            }`}
          >
            <Home className={`w-4 h-4 shrink-0 ${activeNav === 'home' ? 'text-[var(--theme-primary)] dark:text-[var(--theme-accent)]' : 'text-[#7E8494] dark:text-[#718278]'}`} />
            <span className="truncate">Home</span>
          </button>

          {/* Chats */}
          <button
            onClick={() => handleItemClick(onSelectChat)}
            className={`w-full min-h-[38px] flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium text-left transition-all cursor-pointer ${
              activeNav === 'chat'
                ? 'neu-active-nav font-bold'
                : 'text-[#4B5750] dark:text-[#A0B2A7] hover:bg-[#FAFAF8] dark:hover:bg-[#1F2922] hover:text-[#202923] dark:hover:text-[#EEF4F0]'
            }`}
          >
            <MessageSquare className={`w-4 h-4 shrink-0 ${activeNav === 'chat' ? 'text-[var(--theme-primary)] dark:text-[var(--theme-accent)]' : 'text-[#7E8494] dark:text-[#718278]'}`} />
            <span className="truncate">Chats</span>
          </button>

          {/* Templates */}
          <button
            onClick={() => handleItemClick(onOpenTemplates)}
            className={`w-full min-h-[38px] flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium text-left transition-all cursor-pointer ${
              activeNav === 'templates'
                ? 'neu-active-nav font-bold'
                : 'text-[#4B5750] dark:text-[#A0B2A7] hover:bg-[#FAFAF8] dark:hover:bg-[#1F2922] hover:text-[#202923] dark:hover:text-[#EEF4F0]'
            }`}
          >
            <Layout className={`w-4 h-4 shrink-0 ${activeNav === 'templates' ? 'text-[var(--theme-primary)] dark:text-[var(--theme-accent)]' : 'text-[#7E8494] dark:text-[#718278]'}`} />
            <span className="truncate">Templates</span>
          </button>

          {/* Settings */}
          <button
            onClick={() => handleItemClick(onOpenSettings)}
            className={`w-full min-h-[38px] flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium text-left transition-all cursor-pointer ${
              activeNav === 'settings'
                ? 'neu-active-nav font-bold'
                : 'text-[#4B5750] dark:text-[#A0B2A7] hover:bg-[#FAFAF8] dark:hover:bg-[#1F2922] hover:text-[#202923] dark:hover:text-[#EEF4F0]'
            }`}
          >
            <Settings className={`w-4 h-4 shrink-0 ${activeNav === 'settings' ? 'text-[var(--theme-primary)] dark:text-[var(--theme-accent)]' : 'text-[#7E8494] dark:text-[#718278]'}`} />
            <span className="truncate">Settings</span>
          </button>
        </div>

        {/* Thin Separator */}
        <div className="border-t border-[#E9EDE9] dark:border-[#232E27] my-1" />

        {/* Recent Chats Section */}
        <div className="flex-1 flex flex-col min-h-0 pt-3">
          <div className="flex items-center justify-between px-2 mb-2.5 shrink-0">
            <span className="text-[11px] font-bold text-[#7E8494] dark:text-[#718278] uppercase tracking-wider">
              Recent Chats
            </span>
            <span className="text-[10px] font-semibold text-[var(--theme-primary)] dark:text-[var(--theme-accent)] bg-[var(--theme-primary-light)] dark:bg-[var(--theme-primary)]/20 px-2 py-0.5 rounded-full tabular-nums">
              {chats.length}
            </span>
          </div>

          {/* Scrollable Chat History List */}
          <div className="flex-1 overflow-y-auto pr-1 space-y-1.5 min-h-0">
            {chats.length === 0 ? (
              <div className="text-center py-6 text-xs text-[#7E8494] dark:text-[#718278] italic">
                No conversations yet
              </div>
            ) : (
              chats.map((chat) => {
                const isActive = activeNav === 'chat' && activeChatId === chat.id;
                const isEditing = editingChatId === chat.id;

                if (isEditing) {
                  return (
                    <div
                      key={chat.id}
                      className="p-1.5 rounded-xl border border-[var(--theme-primary)] bg-[#FAFAF8] dark:bg-[#1A231E] flex items-center gap-1.5"
                    >
                      <input
                        type="text"
                        value={editTitleInput}
                        onChange={(e) => setEditTitleInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveRename(chat.id);
                          if (e.key === 'Escape') setEditingChatId(null);
                        }}
                        autoFocus
                        className="flex-1 text-xs px-2 py-1 bg-transparent text-[#202923] dark:text-[#EEF4F0] focus:outline-none"
                      />
                      <button
                        onClick={() => handleSaveRename(chat.id)}
                        className="p-1 text-[var(--theme-primary)] dark:text-[var(--theme-accent)] hover:opacity-80 cursor-pointer"
                        title="Save title"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={handleCancelRename}
                        className="p-1 text-[#7E8494] hover:text-[#C77D86] cursor-pointer"
                        title="Cancel"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                }

                return (
                  <div
                    key={chat.id}
                    onClick={() => handleItemClick(() => onSelectChatSession(chat.id))}
                    className={`group relative flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                      isActive
                        ? 'neu-active-nav font-semibold'
                        : 'text-[#4B5750] dark:text-[#A0B2A7] hover:bg-[#FAFAF8] dark:hover:bg-[#1F2922] hover:text-[#202923] dark:hover:text-[#EEF4F0] border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate pr-1">
                      <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-[var(--theme-primary)] dark:text-[var(--theme-accent)]' : 'text-[#7E8494] dark:text-[#718278]'}`} />
                      <span className="truncate">{chat.title}</span>
                    </div>

                    {/* Three-Dot Menu Button */}
                    <div className="relative shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuChatId(openMenuChatId === chat.id ? null : chat.id);
                        }}
                        title="Chat options"
                        className={`p-1 rounded-md text-[#7E8494] hover:text-[#202923] dark:hover:text-[#EEF4F0] cursor-pointer transition ${
                          openMenuChatId === chat.id ? 'opacity-100 bg-white dark:bg-[#1A231E] shadow-xs' : 'opacity-0 group-hover:opacity-100'
                        }`}
                      >
                        <MoreVertical className="w-3.5 h-3.5" />
                      </button>

                      {/* Dropdown Menu */}
                      {openMenuChatId === chat.id && (
                        <div
                          ref={menuRef}
                          className="absolute right-0 top-7 z-50 w-32 bg-white dark:bg-[#1A231E] rounded-xl border border-[#E9EDE9] dark:border-[#26332B] py-1 shadow-lg animate-fadeIn"
                        >
                          <button
                            onClick={(e) => handleStartRename(chat, e)}
                            className="w-full px-3 py-1.5 text-xs font-medium text-[#202923] dark:text-[#EEF4F0] hover:text-[var(--theme-primary)] dark:hover:text-[var(--theme-accent)] hover:bg-[#FAFAF8] dark:hover:bg-[#202B25] flex items-center gap-2 cursor-pointer"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                            <span>Rename</span>
                          </button>
                          <button
                            onClick={(e) => handleTriggerDelete(chat.id, e)}
                            className="w-full px-3 py-1.5 text-xs font-medium text-[#C77D86] hover:bg-[#FFF5F5] dark:hover:bg-[#2E1B1E] flex items-center gap-2 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* User Profile Footer with Circular Theme Avatar */}
      <div className="pt-3 pb-1 safe-pb shrink-0 border-t border-[#E9EDE9] dark:border-[#232E27] mt-2 relative" ref={profileMenuRef}>
        <div
          onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
          className={`group flex items-center justify-between p-2 rounded-2xl transition-all cursor-pointer ${
            isProfileMenuOpen ? 'neu-inset' : 'hover:bg-[#FAFAF8] dark:hover:bg-[#1F2922]'
          }`}
          title="Account Menu"
        >
          <div className="flex items-center gap-3 min-w-0">
            {/* Circular Avatar with Theme primary color */}
            <div className="w-9 h-9 rounded-full neu-button-deep text-white flex items-center justify-center font-bold text-xs shrink-0">
              {userInitial}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-[#202923] dark:text-[#EEF4F0] truncate leading-tight">
                {username || 'Resume Builder'}
              </span>
              <span className="text-[10px] text-[var(--theme-primary)] dark:text-[var(--theme-accent)] font-semibold leading-tight flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--theme-accent,#059669)]" />
                <span>Free Plan</span>
              </span>
            </div>
          </div>

          <ChevronDown
            className={`w-4 h-4 text-[#7E8494] group-hover:text-[#202923] dark:group-hover:text-[#EEF4F0] transition-transform shrink-0 ${
              isProfileMenuOpen ? 'rotate-180 text-[var(--theme-primary)] dark:text-[var(--theme-accent)]' : ''
            }`}
          />
        </div>

        {/* User Options Dropdown */}
        {isProfileMenuOpen && (
          <div className="absolute bottom-16 left-3 right-3 z-50 bg-white dark:bg-[#1A231E] rounded-2xl border border-[#E9EDE9] dark:border-[#26332B] py-2 shadow-xl animate-fadeIn">
            {onToggleDarkMode && (
              <button
                onClick={() => {
                  onToggleDarkMode();
                  setIsProfileMenuOpen(false);
                }}
                className="w-full px-3.5 py-2 text-xs font-medium text-[#202923] dark:text-[#EEF4F0] hover:text-[var(--theme-primary)] dark:hover:text-[var(--theme-accent)] hover:bg-[#FAFAF8] dark:hover:bg-[#202B25] flex items-center justify-between cursor-pointer transition text-left"
              >
                <div className="flex items-center gap-2.5">
                  {isDarkMode ? <Sun className="w-4 h-4 text-[#F59E0B]" /> : <Moon className="w-4 h-4 text-[var(--theme-primary)] dark:text-[var(--theme-accent)]" />}
                  <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
                </div>
                <span className="text-[10px] text-[#7E8494] uppercase font-bold">
                  {isDarkMode ? 'Dark' : 'Light'}
                </span>
              </button>
            )}

            <button
              onClick={handleOpenChangeUsername}
              className="w-full px-3.5 py-2 text-xs font-medium text-[#202923] dark:text-[#EEF4F0] hover:text-[var(--theme-primary)] dark:hover:text-[var(--theme-accent)] hover:bg-[#FAFAF8] dark:hover:bg-[#202B25] flex items-center gap-2.5 cursor-pointer transition text-left"
            >
              <UserPen className="w-4 h-4 text-[var(--theme-primary)] dark:text-[var(--theme-accent)]" />
              <span>Change Username</span>
            </button>

            <button
              onClick={() => {
                onOpenSettings();
                setIsProfileMenuOpen(false);
              }}
              className="w-full px-3.5 py-2 text-xs font-medium text-[#202923] dark:text-[#EEF4F0] hover:text-[var(--theme-primary)] dark:hover:text-[var(--theme-accent)] hover:bg-[#FAFAF8] dark:hover:bg-[#202B25] flex items-center gap-2.5 cursor-pointer transition text-left"
            >
              <Settings className="w-4 h-4 text-[var(--theme-primary)] dark:text-[var(--theme-accent)]" />
              <span>Preferences</span>
            </button>

            <div className="my-1 border-t border-[#E9EDE9] dark:border-[#26332B]" />

            <button
              onClick={handleOpenClearData}
              className="w-full px-3.5 py-2 text-xs font-medium text-[#C77D86] hover:bg-[#FFF5F5] dark:hover:bg-[#2E1B1E] flex items-center gap-2.5 cursor-pointer transition text-left"
            >
              <Trash2 className="w-4 h-4 text-[#C77D86]" />
              <span>Clear Local Data</span>
            </button>
          </div>
        )}
      </div>

      {/* Delete Chat Confirmation Modal */}
      {confirmDeleteChatId && (
        <div className="fixed inset-0 z-50 bg-[#202923]/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-[#1A231E] rounded-2xl p-5 max-w-xs w-full border border-[#E9EDE9] dark:border-[#26332B] shadow-xl space-y-4">
            <div className="text-center">
              <div className="w-10 h-10 rounded-full bg-[#FFF1F2] dark:bg-[#2E1B1E] text-[#C77D86] flex items-center justify-center mx-auto mb-3">
                <Trash2 className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-[#202923] dark:text-[#EEF4F0]">Delete conversation?</h3>
              <p className="text-xs text-[#7E8494] dark:text-[#718278] mt-1.5 leading-relaxed">
                Are you sure you want to delete this conversation? This action cannot be undone.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setConfirmDeleteChatId(null)}
                className="flex-1 py-2 rounded-xl neu-button-secondary text-xs font-semibold text-[#4B5750] dark:text-[#A0B2A7] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 py-2 rounded-xl bg-[#C77D86] hover:bg-[#b56d76] text-white text-xs font-bold cursor-pointer transition shadow-xs"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Username Modal */}
      {isChangeUsernameModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#202923]/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-[#1A231E] rounded-3xl p-6 max-w-sm w-full border border-[#E9EDE9] dark:border-[#26332B] shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#E9EDE9] dark:border-[#26332B]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl neu-inset text-[var(--theme-primary)] dark:text-[var(--theme-accent)] flex items-center justify-center">
                  <UserPen className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-[#202923] dark:text-[#EEF4F0]">Change Username</h3>
              </div>
              <button
                onClick={() => setIsChangeUsernameModalOpen(false)}
                className="p-1 rounded-lg text-[#7E8494] hover:text-[#202923] dark:hover:text-[#EEF4F0] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveUsernameSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#202923] dark:text-[#EEF4F0] mb-1.5">
                  Your Username
                </label>
                <input
                  type="text"
                  autoFocus
                  value={newUsernameInput}
                  onChange={(e) => {
                    setNewUsernameInput(e.target.value);
                    if (usernameError) setUsernameError(null);
                  }}
                  placeholder="Enter your username"
                  maxLength={30}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs text-[#202923] dark:text-[#EEF4F0] bg-[#FAFAF8] dark:bg-[#131A15] focus:outline-none transition ${
                    usernameError
                      ? 'border-[#C77D86] ring-2 ring-[#C77D86]/15'
                      : 'border-[#E9EDE9] dark:border-[#26332B] focus:border-[var(--theme-primary)] focus:ring-2 focus:ring-[var(--theme-primary)]/15'
                  }`}
                />
                {usernameError && (
                  <p className="text-[11px] text-[#C77D86] font-semibold mt-1">
                    {usernameError}
                  </p>
                )}
                <p className="text-[11px] text-[#7E8494] dark:text-[#718278] mt-1.5">
                  Your conversations and resume progress will remain safe.
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsChangeUsernameModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl neu-button-secondary text-xs font-semibold text-[#4B5750] dark:text-[#A0B2A7] cursor-pointer transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl neu-button-deep text-white text-xs font-bold cursor-pointer transition"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Clear Local Data Confirmation Modal */}
      {isClearDataModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#202923]/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-[#1A231E] rounded-3xl p-6 max-w-sm w-full border border-[#E9EDE9] dark:border-[#26332B] shadow-2xl space-y-4">
            <div className="text-center">
              <div className="w-12 h-12 rounded-2xl bg-[#FFF1F2] dark:bg-[#2E1B1E] text-[#C77D86] flex items-center justify-center mx-auto mb-3.5">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-extrabold text-[#202923] dark:text-[#EEF4F0]">Clear All Local Data?</h3>
              <p className="text-xs text-[#7E8494] dark:text-[#718278] mt-2 leading-relaxed text-left bg-[#FAFAF8] dark:bg-[#131A15] p-3 rounded-xl border border-[#E9EDE9] dark:border-[#26332B]">
                This action will permanently delete all your saved conversations, resume information, and your username from this browser. This cannot be undone.
              </p>
            </div>

            <div className="flex items-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsClearDataModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl neu-button-secondary text-xs font-semibold text-[#4B5750] dark:text-[#A0B2A7] cursor-pointer transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmClearData}
                className="flex-1 py-2.5 rounded-xl bg-[#C77D86] hover:bg-[#b56d76] text-white text-xs font-bold cursor-pointer transition shadow-xs"
              >
                Clear All Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* 1. Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-[#202923]/30 backdrop-blur-xs md:hidden animate-fadeIn"
          aria-hidden="true"
        />
      )}

      {/* 2. Mobile Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[300px] max-w-[85vw] bg-[var(--theme-bg-sidebar,#FFFFFF)] dark:bg-[var(--theme-bg-sidebar,#18201B)] border-r border-[var(--theme-border,#E9EDE9)] dark:border-[var(--theme-border,#232E27)] shadow-2xl transition-transform duration-300 ease-in-out md:hidden ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {navContent}
      </aside>

      {/* 3. Desktop / Tablet In-Flow Sidebar */}
      {isCollapsed ? (
        <aside className="hidden md:flex w-18 h-full bg-[var(--theme-bg-sidebar,#FFFFFF)] dark:bg-[var(--theme-bg-sidebar,#18201B)] border-r border-[var(--theme-border,#E9EDE9)] dark:border-[var(--theme-border,#232E27)] flex-col items-center justify-between py-4 select-none shrink-0 transition-all duration-200">
          <div className="flex flex-col items-center">
            {/* Expand button */}
            <button
              onClick={onToggleCollapse}
              title="Expand sidebar"
              className="w-10 h-10 rounded-2xl neu-button-secondary flex items-center justify-center text-[#7E8494] hover:text-[#202923] dark:text-[#A0B2A7] dark:hover:text-[#EEF4F0] mb-5 cursor-pointer"
            >
              <PanelLeft className="w-4 h-4" />
            </button>

            {/* New Chat icon button */}
            <button
              onClick={onNewResume}
              title="New Chat"
              className="w-10 h-10 rounded-2xl neu-button-deep flex items-center justify-center text-white mb-5 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
            </button>

            <div className="space-y-3 flex flex-col items-center">
              {/* Home */}
              <button
                onClick={onGoHome}
                title="Home"
                className={`w-10 h-10 rounded-2xl flex items-center justify-center cursor-pointer transition-all ${
                  activeNav === 'home'
                    ? 'neu-active-nav'
                    : 'text-[#7E8494] dark:text-[#718278] hover:bg-[#FAFAF8] dark:hover:bg-[#1F2922] hover:text-[#202923] dark:hover:text-[#EEF4F0]'
                }`}
              >
                <Home className="w-4 h-4" />
              </button>

              {/* Chat */}
              <button
                onClick={onSelectChat}
                title="Chats"
                className={`w-10 h-10 rounded-2xl flex items-center justify-center cursor-pointer transition-all ${
                  activeNav === 'chat'
                    ? 'neu-active-nav'
                    : 'text-[#7E8494] dark:text-[#718278] hover:bg-[#FAFAF8] dark:hover:bg-[#1F2922] hover:text-[#202923] dark:hover:text-[#EEF4F0]'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
              </button>

              {/* Templates */}
              <button
                onClick={onOpenTemplates}
                title="Resume Templates"
                className={`w-10 h-10 rounded-2xl flex items-center justify-center cursor-pointer transition-all ${
                  activeNav === 'templates'
                    ? 'neu-active-nav'
                    : 'text-[#7E8494] dark:text-[#718278] hover:bg-[#FAFAF8] dark:hover:bg-[#1F2922] hover:text-[#202923] dark:hover:text-[#EEF4F0]'
                }`}
              >
                <Layout className="w-4 h-4" />
              </button>

              {/* Settings */}
              <button
                onClick={onOpenSettings}
                title="Settings"
                className={`w-10 h-10 rounded-2xl flex items-center justify-center cursor-pointer transition-all ${
                  activeNav === 'settings'
                    ? 'neu-active-nav'
                    : 'text-[#7E8494] dark:text-[#718278] hover:bg-[#FAFAF8] dark:hover:bg-[#1F2922] hover:text-[#202923] dark:hover:text-[#EEF4F0]'
                }`}
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Collapsed user avatar button */}
          <button
            onClick={onToggleCollapse}
            title={`${username || 'User'} - Click to expand`}
            className="w-9 h-9 rounded-full neu-button-deep text-white flex items-center justify-center font-bold text-xs cursor-pointer hover:scale-105 transition"
          >
            {userInitial}
          </button>
        </aside>
      ) : (
        <aside className="hidden md:flex md:w-[270px] lg:w-[290px] xl:w-[310px] h-full bg-[var(--theme-bg-sidebar,#FFFFFF)] dark:bg-[var(--theme-bg-sidebar,#18201B)] border-r border-[var(--theme-border,#E9EDE9)] dark:border-[var(--theme-border,#232E27)] flex-col select-none shrink-0 transition-all duration-200 overflow-hidden">
          {navContent}
        </aside>
      )}
    </>
  );
};
