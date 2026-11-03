export interface AppTheme {
  id: string;
  name: string;
  tagline: string;
  preview: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

export const APP_THEMES: AppTheme[] = [
  {
    id: 'forest-green',
    name: 'Forest Green',
    tagline: 'Deep green, soft mint & clean white',
    preview: {
      primary: '#064E3B',
      secondary: '#E5F3EB',
      accent: '#059669',
    },
  },
  {
    id: 'ocean-blue',
    name: 'Ocean Blue',
    tagline: 'Deep navy blue, soft sky blue & white',
    preview: {
      primary: '#1E3A8A',
      secondary: '#E0F2FE',
      accent: '#0284C7',
    },
  },
  {
    id: 'royal-purple',
    name: 'Royal Purple',
    tagline: 'Rich purple, soft lavender & white',
    preview: {
      primary: '#581C87',
      secondary: '#F3E8FF',
      accent: '#7E22CE',
    },
  },
  {
    id: 'sunset-orange',
    name: 'Sunset Orange',
    tagline: 'Deep burnt orange, warm peach & white',
    preview: {
      primary: '#9A3412',
      secondary: '#FFEDD5',
      accent: '#EA580C',
    },
  },
  {
    id: 'rose-pink',
    name: 'Rose Pink',
    tagline: 'Deep rose, soft petal pink & white',
    preview: {
      primary: '#881337',
      secondary: '#FFE4E6',
      accent: '#BE123C',
    },
  },
  {
    id: 'midnight',
    name: 'Midnight',
    tagline: 'Dark charcoal, emerald & muted slate',
    preview: {
      primary: '#0F172A',
      secondary: '#1E293B',
      accent: '#10B981',
    },
  },
  {
    id: 'minimal-gray',
    name: 'Minimal Gray',
    tagline: 'Neutral gray, soft slate & charcoal',
    preview: {
      primary: '#1F2937',
      secondary: '#F1F5F9',
      accent: '#4B5563',
    },
  },
];

// Aliases for compatibility
export const CHAT_THEMES = APP_THEMES;
export type ChatTheme = AppTheme;

export const DEFAULT_THEME = 'forest-green';
export const DEFAULT_CHAT_THEME = DEFAULT_THEME;
export const APP_THEME_STORAGE_KEY = 'resumecraft_app_theme';
export const CHAT_THEME_STORAGE_KEY = 'resumecraft_chat_theme';

export function getStoredAppTheme(): string {
  if (typeof window === 'undefined') return DEFAULT_THEME;
  // Try app theme storage first, fallback to chat theme storage
  const stored =
    localStorage.getItem(APP_THEME_STORAGE_KEY) ||
    localStorage.getItem(CHAT_THEME_STORAGE_KEY);
  if (stored && APP_THEMES.some((t) => t.id === stored)) {
    return stored;
  }
  return DEFAULT_THEME;
}

export function saveStoredAppTheme(themeId: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(APP_THEME_STORAGE_KEY, themeId);
  localStorage.setItem(CHAT_THEME_STORAGE_KEY, themeId);
}

// Backward-compatible wrappers
export const getStoredChatTheme = getStoredAppTheme;
export const saveStoredChatTheme = saveStoredAppTheme;
