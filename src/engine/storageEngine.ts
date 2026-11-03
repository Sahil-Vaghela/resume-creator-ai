import { ResumeData, INITIAL_RESUME_DATA } from './resumeEngine';
import sampleResume from '../data/sample-resume.json';
import chatbotResponses from '../data/chatbot-responses.json';

export interface ChatSession {
  id: string;
  title: string;
  isManuallyRenamed: boolean;
  createdAt: string;
  updatedAt: string;
  messages: any[];
  resumeData: ResumeData;
  conversationState: {
    currentQuestionId: string;
    currentRecord: any;
    questionHistory: string[];
  };
  status: 'in-progress' | 'completed';
}

export interface ChatHistoryStore {
  chats: ChatSession[];
  activeChatId: string | null;
}

const CHAT_STORE_KEY = 'resumecraft_chats_store';

// Legacy keys for backward compatibility
const LEGACY_KEYS = {
  RESUME: 'resumecraft_resume_data',
  CURRENT_STEP: 'resumecraft_current_step',
  MESSAGES: 'resumecraft_chat_messages',
  CURRENT_RECORD: 'resumecraft_current_record',
};

// Automatic title generator from user input
export function generateChatTitle(userText: string): string {
  if (!userText || typeof userText !== 'string') return 'New Chat';

  const clean = userText.trim().replace(/[.,!?;:()\[\]{}"'\\]/g, ' ');
  const lower = clean.toLowerCase();

  // If message is pure greeting, do not rename chat yet
  const greetingWords = ['hi', 'hii', 'hiii', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening', 'how are you', 'how r u', 'what\'s up', 'whats up'];
  if (greetingWords.some((g) => lower === g || lower.startsWith(g + ' ') && lower.length < 15 && !lower.includes('name is') && !lower.includes('work'))) {
    return 'New Chat';
  }

  // Check if user says "My name is X" or "I am X"
  const nameMatch = clean.match(/(?:my\s+name\s+is|i\s+am|i'm)\s+([A-Za-z]+)(?:\s+and\s+i\s+work|\s+and\s+i'm|\s+and|,|$)/i);
  const occupationMatch = clean.match(/(?:work\s+as\s+(?:a|an)?|work\s+in\s+(?:the)?|as\s+an?)\s*([A-Za-z\s]+?)(?:[.,;]|$)/i);

  if (nameMatch && nameMatch[1] && !['not', 'a', 'just', 'simple'].includes(nameMatch[1].toLowerCase()) && occupationMatch && occupationMatch[1]) {
    const occ = occupationMatch[1].trim();
    return `${occ.charAt(0).toUpperCase() + occ.slice(1).toLowerCase()} Resume`;
  }

  // Known role and resume intentions (both tech and non-tech)
  const knownRoles: { [key: string]: string } = {
    'stock department': 'Stock Department Resume',
    'stock worker': 'Stock Department Resume',
    'inventory': 'Inventory Resume',
    'warehouse worker': 'Warehouse Worker Resume',
    'warehouse': 'Warehouse Worker Resume',
    'teacher': 'Teacher Resume',
    'educator': 'Teacher Resume',
    'accountant': 'Accountant Resume',
    'accounting': 'Accountant Resume',
    'sales executive': 'Sales Executive Resume',
    'sales': 'Sales Resume',
    'office assistant': 'Office Assistant Resume',
    'shopkeeper': 'Retail Resume',
    'retail associate': 'Retail Associate Resume',
    'business owner': 'Business Owner Resume',
    'technician': 'Technician Resume',
    'customer support': 'Customer Support Resume',
    'frontend developer': 'Frontend Developer Resume',
    'frontend engineer': 'Frontend Engineer Resume',
    'backend developer': 'Backend Developer Resume',
    'backend engineer': 'Backend Engineer Resume',
    'full stack developer': 'Full Stack Developer Resume',
    'full stack engineer': 'Full Stack Engineer Resume',
    'full stack': 'Full Stack Developer Resume',
    'software engineer': 'Software Engineer Resume',
    'software developer': 'Software Developer Resume',
    'data analyst': 'Data Analyst Resume',
    'data scientist': 'Data Scientist Resume',
    'data engineer': 'Data Engineer Resume',
    'devops engineer': 'DevOps Engineer Resume',
    'cloud engineer': 'Cloud Engineer Resume',
    'product manager': 'Product Manager Resume',
    'ui/ux designer': 'UI/UX Designer Resume',
    'ux designer': 'UX Designer Resume',
    'ui designer': 'UI Designer Resume',
    'qa engineer': 'QA Engineer Resume',
    'mobile developer': 'Mobile Developer Resume',
    'python development': 'Python Developer Resume',
    'python developer': 'Python Developer Resume',
    'java developer': 'Java Developer Resume',
    'react developer': 'React Developer Resume',
    'fresher resume': 'Fresher Resume',
    'fresher': 'Fresher Resume',
    'student resume': 'Student Resume',
    'student': 'Student Resume',
    'internship': 'Internship Resume',
    'intern': 'Intern Resume',
  };

  for (const [key, title] of Object.entries(knownRoles)) {
    if (lower.includes(key)) {
      return title;
    }
  }

  if (nameMatch && nameMatch[1] && !['not', 'a', 'just', 'simple', 'fresher', 'student'].includes(nameMatch[1].toLowerCase())) {
    const formattedName = nameMatch[1].charAt(0).toUpperCase() + nameMatch[1].slice(1).toLowerCase();
    return `${formattedName}'s Resume`;
  }

  // Remove conversational filler prefixes
  let processed = clean
    .replace(/^(i\s+want\s+to\s+create\s+a\s+resume\s+for\s+(a\s+|an\s+)?)/i, '')
    .replace(/^(i\s+want\s+to\s+build\s+a\s+resume\s+for\s+(a\s+|an\s+)?)/i, '')
    .replace(/^(help\s+me\s+create\s+(a\s+|an\s+)?)/i, '')
    .replace(/^(help\s+me\s+build\s+(a\s+|an\s+)?)/i, '')
    .replace(/^(create\s+a\s+resume\s+for\s+(a\s+|an\s+)?)/i, '')
    .replace(/^(build\s+a\s+resume\s+for\s+(a\s+|an\s+)?)/i, '')
    .replace(/^(create\s+(a\s+|an\s+)?)/i, '')
    .replace(/^(i\s+have\s+(?:\w+\s+)?(?:years?\s+of\s+)?experience\s+in\s+)/i, '')
    .replace(/(\s+job|\s+position|\s+role)$/i, '')
    .trim();

  const words = processed
    .split(/\s+/)
    .filter(
      (w) =>
        w.length > 0 &&
        !['i', 'a', 'an', 'the', 'to', 'for', 'in', 'of', 'and', 'my', 'me', 'with', 'want'].includes(
          w.toLowerCase()
        )
    );

  if (words.length > 0) {
    const selected = words
      .slice(0, 4)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');

    if (selected.toLowerCase().includes('resume')) {
      return selected;
    }
    return `${selected} Resume`;
  }

  return 'Professional Resume';
}

// Generate new unique chat session
export function createNewChatSession(initialTitle: string = 'New Chat'): ChatSession {
  const now = new Date().toISOString();
  return {
    id: `chat-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    title: initialTitle,
    isManuallyRenamed: false,
    createdAt: now,
    updatedAt: now,
    messages: [
      {
        id: `msg-greet-${Date.now()}`,
        sender: 'bot',
        text: chatbotResponses.greetings[0],
        timestamp: 'Just now',
      },
    ],
    resumeData: JSON.parse(JSON.stringify(INITIAL_RESUME_DATA)),
    conversationState: {
      currentQuestionId: 'full_name',
      currentRecord: {},
      questionHistory: [],
    },
    status: 'in-progress',
  };
}

// Load Chat History Store with backward compatibility
export function loadChatHistory(): ChatHistoryStore {
  try {
    const raw = localStorage.getItem(CHAT_STORE_KEY);
    if (raw) {
      const parsed: ChatHistoryStore = JSON.parse(raw);
      if (Array.isArray(parsed.chats) && parsed.chats.length > 0) {
        // Ensure sorted by updatedAt descending
        parsed.chats.sort(
          (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
        return parsed;
      }
    }

    // Migrate from legacy single-resume storage if present
    const legacyResumeRaw = localStorage.getItem(LEGACY_KEYS.RESUME);
    if (legacyResumeRaw) {
      const legacyResume: ResumeData = JSON.parse(legacyResumeRaw);
      const legacyMessagesRaw = localStorage.getItem(LEGACY_KEYS.MESSAGES);
      const legacyStep = localStorage.getItem(LEGACY_KEYS.CURRENT_STEP);
      const legacyRecord = localStorage.getItem(LEGACY_KEYS.CURRENT_RECORD);

      const title = legacyResume.personal.fullName
        ? `${legacyResume.personal.fullName} Resume`
        : 'Resume Draft';

      const migratedChat: ChatSession = {
        id: `chat-${Date.now()}`,
        title,
        isManuallyRenamed: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messages: legacyMessagesRaw ? JSON.parse(legacyMessagesRaw) : [],
        resumeData: legacyResume,
        conversationState: {
          currentQuestionId: legacyStep || 'full_name',
          currentRecord: legacyRecord ? JSON.parse(legacyRecord) : {},
          questionHistory: [],
        },
        status: 'in-progress',
      };

      const initialStore: ChatHistoryStore = {
        chats: [migratedChat],
        activeChatId: migratedChat.id,
      };
      saveChatHistory(initialStore);
      return initialStore;
    }
  } catch (err) {
    console.error('Error loading chat history store', err);
  }

  // Fresh initial store with one New Chat
  const firstChat = createNewChatSession();
  const freshStore: ChatHistoryStore = {
    chats: [firstChat],
    activeChatId: firstChat.id,
  };
  saveChatHistory(freshStore);
  return freshStore;
}

// Save Chat History Store to LocalStorage
export function saveChatHistory(store: ChatHistoryStore): void {
  try {
    localStorage.setItem(CHAT_STORE_KEY, JSON.stringify(store));
  } catch (err) {
    console.error('Error saving chat history store', err);
  }
}

// Retrieve currently active chat
export function getActiveChat(store: ChatHistoryStore): ChatSession | null {
  if (!store.chats || store.chats.length === 0) return null;
  const found = store.chats.find((c) => c.id === store.activeChatId);
  return found || store.chats[0];
}

// Rename chat
export function renameChatInStore(
  store: ChatHistoryStore,
  chatId: string,
  newTitle: string
): ChatHistoryStore {
  const updatedChats = store.chats.map((chat) => {
    if (chat.id === chatId) {
      return {
        ...chat,
        title: newTitle.trim() || chat.title,
        isManuallyRenamed: true,
        updatedAt: new Date().toISOString(),
      };
    }
    return chat;
  });

  const updatedStore = { ...store, chats: updatedChats };
  saveChatHistory(updatedStore);
  return updatedStore;
}

// Delete chat
export function deleteChatFromStore(
  store: ChatHistoryStore,
  chatId: string
): { store: ChatHistoryStore; nextActiveChat: ChatSession | null } {
  const remainingChats = store.chats.filter((c) => c.id !== chatId);
  let nextActiveId: string | null = null;

  if (remainingChats.length > 0) {
    // If active chat was deleted, pick the first remaining
    if (store.activeChatId === chatId) {
      nextActiveId = remainingChats[0].id;
    } else {
      nextActiveId = store.activeChatId;
    }
  }

  const updatedStore: ChatHistoryStore = {
    chats: remainingChats,
    activeChatId: nextActiveId,
  };

  saveChatHistory(updatedStore);
  const nextChat = remainingChats.find((c) => c.id === nextActiveId) || null;

  return { store: updatedStore, nextActiveChat: nextChat };
}

export function hasSavedProgress(): boolean {
  try {
    const raw = localStorage.getItem(CHAT_STORE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.chats) && parsed.chats.length > 0) {
        return parsed.chats.some(
          (c: any) => (c.messages && c.messages.length > 0) || Boolean(c.resumeData?.personalInfo?.fullName)
        );
      }
    }
    return Boolean(localStorage.getItem(LEGACY_KEYS.RESUME));
  } catch {
    return false;
  }
}

export function getSampleResume(): ResumeData {
  return sampleResume as ResumeData;
}

// ---------------- USERNAME & ACCESS MANAGEMENT ----------------
export const USERNAME_STORAGE_KEY = 'resumecraft_username';

export function validateUsername(username: string): { isValid: boolean; error?: string } {
  const trimmed = username ? username.trim() : '';
  if (!trimmed) {
    return { isValid: false, error: 'Username is required.' };
  }
  if (trimmed.length < 2) {
    return { isValid: false, error: 'Username must be at least 2 characters.' };
  }
  if (trimmed.length > 30) {
    return { isValid: false, error: 'Username cannot exceed 30 characters.' };
  }
  // Allow letters, numbers, spaces, and common name characters (apostrophe, dash, dot, underscore)
  const validPattern = /^[a-zA-Z0-9\s._'-]+$/;
  if (!validPattern.test(trimmed)) {
    return { isValid: false, error: 'Username can only contain letters, numbers, spaces, and common name characters.' };
  }
  return { isValid: true };
}

export function getStoredUsername(): string | null {
  try {
    const raw = localStorage.getItem(USERNAME_STORAGE_KEY);
    if (!raw) return null;
    const trimmed = raw.trim();
    return trimmed.length >= 2 ? trimmed : null;
  } catch {
    return null;
  }
}

export function saveStoredUsername(username: string): void {
  try {
    localStorage.setItem(USERNAME_STORAGE_KEY, username.trim());
  } catch (e) {
    console.error('Failed to save username to localStorage', e);
  }
}

export function removeStoredUsername(): void {
  try {
    localStorage.removeItem(USERNAME_STORAGE_KEY);
  } catch (e) {
    console.error('Failed to remove username from localStorage', e);
  }
}

export function clearAllLocalData(): void {
  try {
    localStorage.removeItem(USERNAME_STORAGE_KEY);
    localStorage.removeItem(CHAT_STORE_KEY);
    Object.values(LEGACY_KEYS).forEach((key) => {
      try {
        localStorage.removeItem(key);
      } catch {}
    });
  } catch (e) {
    console.error('Failed to clear local data from localStorage', e);
  }
}
