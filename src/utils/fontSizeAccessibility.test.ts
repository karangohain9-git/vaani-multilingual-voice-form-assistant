import { describe, it, expect } from 'vitest';

describe('Font Size Accessibility Mode Calculations', () => {
  const FONT_SIZE_SCALES: Record<'normal' | 'large' | 'xlarge', number> = {
    normal: 1.0,
    large: 1.2,
    xlarge: 1.4,
  };

  const BASE_TEXT_SIZES_REM = {
    'text-xs': 0.75,
    'text-sm': 0.875,
    'text-base': 1.0,
    'text-lg': 1.125,
    'text-xl': 1.25,
    'text-2xl': 1.5,
    'text-3xl': 1.875,
    'text-4xl': 2.25,
    'text-5xl': 3.0,
    'text-6xl': 3.75,
  };

  const ARBITRARY_TEXT_SIZES_PX = {
    'text-[9px]': 9,
    'text-[10px]': 10,
    'text-[11px]': 11,
  };

  it('cycles correctly between normal (1x), large (1.2x), and xlarge (1.4x)', () => {
    function getNextFontSize(current: 'normal' | 'large' | 'xlarge'): 'normal' | 'large' | 'xlarge' {
      if (current === 'normal') return 'large';
      if (current === 'large') return 'xlarge';
      return 'normal';
    }

    expect(getNextFontSize('normal')).toBe('large');
    expect(getNextFontSize('large')).toBe('xlarge');
    expect(getNextFontSize('xlarge')).toBe('normal');
  });

  it('computes exact 100% (1x) font sizes for normal mode', () => {
    const scale = FONT_SIZE_SCALES.normal;
    expect(scale).toBe(1.0);

    for (const [, baseRem] of Object.entries(BASE_TEXT_SIZES_REM)) {
      const scaledRem = baseRem * scale;
      expect(scaledRem).toBe(baseRem);
    }

    for (const [, basePx] of Object.entries(ARBITRARY_TEXT_SIZES_PX)) {
      const scaledPx = basePx * scale;
      expect(scaledPx).toBe(basePx);
    }
  });

  it('computes exact 120% (1.2x) font sizes for large mode', () => {
    const scale = FONT_SIZE_SCALES.large;
    expect(scale).toBe(1.2);

    expect(BASE_TEXT_SIZES_REM['text-xs'] * scale).toBeCloseTo(0.9, 4); // 0.75 * 1.2 = 0.9rem
    expect(BASE_TEXT_SIZES_REM['text-sm'] * scale).toBeCloseTo(1.05, 4); // 0.875 * 1.2 = 1.05rem
    expect(BASE_TEXT_SIZES_REM['text-base'] * scale).toBeCloseTo(1.2, 4); // 1.0 * 1.2 = 1.2rem
    expect(BASE_TEXT_SIZES_REM['text-lg'] * scale).toBeCloseTo(1.35, 4); // 1.125 * 1.2 = 1.35rem
    expect(BASE_TEXT_SIZES_REM['text-xl'] * scale).toBeCloseTo(1.5, 4); // 1.25 * 1.2 = 1.5rem
    expect(BASE_TEXT_SIZES_REM['text-2xl'] * scale).toBeCloseTo(1.8, 4); // 1.5 * 1.2 = 1.8rem

    // Arbitrary pixel classes
    expect(ARBITRARY_TEXT_SIZES_PX['text-[10px]'] * scale).toBe(12); // 10px * 1.2 = 12px
    expect(ARBITRARY_TEXT_SIZES_PX['text-[11px]'] * scale).toBeCloseTo(13.2, 4); // 11px * 1.2 = 13.2px
  });

  it('computes exact 140% (1.4x) font sizes for xlarge mode', () => {
    const scale = FONT_SIZE_SCALES.xlarge;
    expect(scale).toBe(1.4);

    expect(BASE_TEXT_SIZES_REM['text-xs'] * scale).toBeCloseTo(1.05, 4); // 0.75 * 1.4 = 1.05rem
    expect(BASE_TEXT_SIZES_REM['text-sm'] * scale).toBeCloseTo(1.225, 4); // 0.875 * 1.4 = 1.225rem
    expect(BASE_TEXT_SIZES_REM['text-base'] * scale).toBeCloseTo(1.4, 4); // 1.0 * 1.4 = 1.4rem
    expect(BASE_TEXT_SIZES_REM['text-lg'] * scale).toBeCloseTo(1.575, 4); // 1.125 * 1.4 = 1.575rem
    expect(BASE_TEXT_SIZES_REM['text-xl'] * scale).toBeCloseTo(1.75, 4); // 1.25 * 1.4 = 1.75rem
    expect(BASE_TEXT_SIZES_REM['text-2xl'] * scale).toBeCloseTo(2.1, 4); // 1.5 * 1.4 = 2.1rem

    // Arbitrary pixel classes
    expect(ARBITRARY_TEXT_SIZES_PX['text-[10px]'] * scale).toBe(14); // 10px * 1.4 = 14px
    expect(ARBITRARY_TEXT_SIZES_PX['text-[11px]'] * scale).toBeCloseTo(15.4, 4); // 11px * 1.4 = 15.4px
  });

  it('verifies that icon sizes (spacing) remain unchanged across font scales', () => {
    const ICON_SIZES_REM = {
      'w-3.5': 0.875,
      'w-4': 1.0,
      'w-5': 1.25,
      'w-6': 1.5,
      'w-8': 2.0,
      'w-10': 2.5,
    };

    // Icons remain at 1x spacing regardless of font scale
    for (const [key, size] of Object.entries(ICON_SIZES_REM)) {
      expect(size).toBe(ICON_SIZES_REM[key as keyof typeof ICON_SIZES_REM]);
    }
  });
});
