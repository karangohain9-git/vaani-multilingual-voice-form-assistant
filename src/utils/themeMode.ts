/**
 * Theme Mode Management Utilities for Vaani
 * Provides accessible Light/Dark theme resolution, persistence, and DOM sync.
 */

export type Theme = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'vaani_theme';

/**
 * Resolves initial theme based on localStorage preference or system fallback.
 */
export function resolveInitialTheme(
  savedPreference: string | null,
  systemPrefersDark: boolean = false
): boolean {
  if (savedPreference === 'dark') return true;
  if (savedPreference === 'light') return false;
  return systemPrefersDark;
}

/**
 * Applies dark/light class and data-theme attribute to DOM element.
 */
export function syncThemeWithElement(
  isDark: boolean,
  element: {
    classList: { add: (token: string) => void; remove: (token: string) => void };
    setAttribute: (name: string, value: string) => void;
  }
): void {
  if (isDark) {
    element.classList.add('dark');
    element.setAttribute('data-theme', 'dark');
  } else {
    element.classList.remove('dark');
    element.setAttribute('data-theme', 'light');
  }
}

/**
 * Persists selected theme to localStorage safely.
 */
export function persistTheme(
  isDark: boolean,
  storage?: { setItem: (key: string, value: string) => void }
): void {
  const store = storage || (typeof window !== 'undefined' ? window.localStorage : undefined);
  if (store) {
    store.setItem(THEME_STORAGE_KEY, isDark ? 'dark' : 'light');
  }
}
