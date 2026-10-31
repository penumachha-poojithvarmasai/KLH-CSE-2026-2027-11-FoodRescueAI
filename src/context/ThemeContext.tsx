import React, { createContext, useContext, useState, useEffect } from 'react';

export type ThemeId = 'warm-sunlight';

export interface Theme {
  id: ThemeId;
  name: string;
  emoji: string;
  description: string;
  preview: { bg: string; accent: string; card: string };
}

export const THEMES: Theme[] = [
  {
    id: 'warm-sunlight',
    name: 'Warm Sunlight & Fresh Emerald (Single Unified Theme)',
    emoji: '☀️',
    description: 'Bright, warm, uplifting ivory, organic emerald, and golden amber',
    preview: { bg: '#f6f8f5', accent: '#059669', card: '#ffffff' },
  },
];

interface ThemeContextType {
  themeId: ThemeId;
  theme: Theme;
  setTheme: (id: ThemeId) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeId, setThemeId] = useState<ThemeId>('warm-sunlight');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'warm-sunlight');
    localStorage.setItem('foodrescue_theme', 'warm-sunlight');
  }, [themeId]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'warm-sunlight');
  }, []);

  const setTheme = (id: ThemeId) => setThemeId(id);
  const theme = THEMES[0];

  return (
    <ThemeContext.Provider value={{ themeId, theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};
