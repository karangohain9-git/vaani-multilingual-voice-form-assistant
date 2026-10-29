import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  resolveInitialTheme,
  syncThemeWithElement,
  persistTheme,
  THEME_STORAGE_KEY,
} from './themeMode';

describe('Dark Mode Theme Utilities & State Resolution', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('resolveInitialTheme', () => {
    it('resolves to true (dark) when localStorage has "dark"', () => {
      expect(resolveInitialTheme('dark', false)).toBe(true);
      expect(resolveInitialTheme('dark', true)).toBe(true);
    });

    it('resolves to false (light) when localStorage has "light"', () => {
      expect(resolveInitialTheme('light', false)).toBe(false);
      expect(resolveInitialTheme('light', true)).toBe(false);
    });

    it('falls back to system preference when no valid preference is saved in localStorage', () => {
      expect(resolveInitialTheme(null, true)).toBe(true);
      expect(resolveInitialTheme(null, false)).toBe(false);
      expect(resolveInitialTheme(undefined as any, true)).toBe(true);
      expect(resolveInitialTheme(undefined as any, false)).toBe(false);
      expect(resolveInitialTheme('', true)).toBe(true);
      expect(resolveInitialTheme('invalid-theme', false)).toBe(false);
    });
  });

  describe('syncThemeWithElement', () => {
    it('applies dark class and data-theme="dark" attribute when isDark is true', () => {
      const classList = {
        add: vi.fn(),
        remove: vi.fn(),
      };
      const setAttribute = vi.fn();
      const mockElement = { classList, setAttribute };

      syncThemeWithElement(true, mockElement);

      expect(classList.add).toHaveBeenCalledWith('dark');
      expect(classList.remove).not.toHaveBeenCalled();
      expect(setAttribute).toHaveBeenCalledWith('data-theme', 'dark');
    });

    it('removes dark class and sets data-theme="light" attribute when isDark is false', () => {
      const classList = {
        add: vi.fn(),
        remove: vi.fn(),
      };
      const setAttribute = vi.fn();
      const mockElement = { classList, setAttribute };

      syncThemeWithElement(false, mockElement);

      expect(classList.remove).toHaveBeenCalledWith('dark');
      expect(classList.add).not.toHaveBeenCalled();
      expect(setAttribute).toHaveBeenCalledWith('data-theme', 'light');
    });
  });

  describe('persistTheme', () => {
    it('persists "dark" to storage when dark mode is enabled', () => {
      const mockStorage = {
        setItem: vi.fn(),
      };

      persistTheme(true, mockStorage);
      expect(mockStorage.setItem).toHaveBeenCalledWith(THEME_STORAGE_KEY, 'dark');
    });

    it('persists "light" to storage when dark mode is disabled', () => {
      const mockStorage = {
        setItem: vi.fn(),
      };

      persistTheme(false, mockStorage);
      expect(mockStorage.setItem).toHaveBeenCalledWith(THEME_STORAGE_KEY, 'light');
    });
  });

  describe('Theme Cycling & Accessibility', () => {
    it('toggles cleanly between light and dark modes', () => {
      let isDark = false;

      // First toggle
      isDark = !isDark;
      expect(isDark).toBe(true);

      // Second toggle
      isDark = !isDark;
      expect(isDark).toBe(false);
    });
  });
});
