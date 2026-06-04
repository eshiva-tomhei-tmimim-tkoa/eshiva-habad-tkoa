'use client';
import { create } from 'zustand';

export type Theme = 'light' | 'dark';

/**
 * Глобальный UI-стор (Zustand). Сюда выносится только действительно
 * сквозной клиентский стейт уровня приложения:
 *  - тема light/dark (читают/меняют header и т.д.; синхронизируется с
 *    атрибутом data-theme и localStorage — тем же ключом, что использует
 *    инлайн-скрипт в layout для предотвращения мигания при загрузке);
 *  - открытость мобильного меню.
 *
 * Локальный эфемерный стейт виджетов (поля форм, активная вкладка, фильтры,
 * открытая модалка) намеренно остаётся на useState — это не состояние
 * приложения и в глобальный стор не выносится.
 */
interface UIState {
  theme: Theme;
  mobileNavOpen: boolean;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  setMobileNav: (open: boolean) => void;
  /** Прочитать сохранённую тему из localStorage и применить (на маунте клиента). */
  hydrateTheme: () => void;
}

const THEME_KEY = 'theme';

function applyTheme(theme: Theme) {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute('data-theme', theme);
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    /* приватный режим / недоступное хранилище — игнорируем */
  }
}

export const useUIStore = create<UIState>((set, get) => ({
  theme: 'light',
  mobileNavOpen: false,

  setTheme: (theme) => {
    applyTheme(theme);
    set({ theme });
  },

  toggleTheme: () => get().setTheme(get().theme === 'light' ? 'dark' : 'light'),

  setMobileNav: (open) => set({ mobileNavOpen: open }),

  hydrateTheme: () => {
    if (typeof window === 'undefined') return;
    let stored: Theme = 'light';
    try {
      stored = (localStorage.getItem(THEME_KEY) as Theme | null) ?? 'light';
    } catch {
      /* ignore */
    }
    set({ theme: stored });
  },
}));
