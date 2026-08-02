/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#0F172A',
    textOpposite: '#F8FAFC',
    background: '#F8FAFC',
    backgroundSecondary: '#f1f4fa',
    backgroundTertiary: '#e9edf5',
    backgroundElement: '#E6F8FF',
    backgroundSelected: '#BFEFFF',
    textSecondary: '#4B5563',
    accentPrimary: '#00b6fe',
    accentSecondary: '#36d6fd',
    accentTertiary: '#1854fc',
    success: '#18ca00',
    fail: '#db1c1c',

    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
  },
  dark: {
    text: '#F8FAFC',
    textOpposite: '#020618',
    background: '#020618',
    backgroundSecondary: '#0f172b',
    backgroundTertiary: '#1d293d',
    backgroundElement: '#0F172A',
    backgroundSelected: '#1E3A8A',
    textSecondary: '#94A3B8',
    accentPrimary: '#00b6fe',
    accentSecondary: '#36d6fd',
    accentTertiary: '#1854fc',
    success: '#18ca00',
    fail: '#db1c1c',

    boxShadow: '0 8px 24px rgba(30, 30, 30, 0.5), 0 1px 2px rgba(30, 30, 30, 0.4)'
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
