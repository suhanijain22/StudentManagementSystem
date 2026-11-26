import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { useColorScheme } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'sms.theme';

export const lightColors = {
  bg: '#F4F6FB', card: '#FFFFFF', text: '#1B1F2A', subtext: '#6B7280', primary: '#4F46E5',
  onPrimary: '#FFFFFF', border: '#E5E7EB', danger: '#DC2626', success: '#16A34A', highlight: '#E0E7FF',
};
export const darkColors = {
  bg: '#0F1220', card: '#1A1E2E', text: '#F3F4F6', subtext: '#9CA3AF', primary: '#818CF8',
  onPrimary: '#0F1220', border: '#2A2F45', danger: '#F87171', success: '#4ADE80', highlight: '#2B2F5C',
};

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const system = useColorScheme();
  const [override, setOverride] = useState(null); // 'light' | 'dark' | null (follow system)

  useEffect(() => {
    AsyncStorage.getItem(KEY).then((v) => { if (v === 'light' || v === 'dark') setOverride(v); }).catch(() => {});
  }, []);

  const mode = override || system || 'light';
  const isDark = mode === 'dark';

  const toggleTheme = useCallback(() => {
    const next = isDark ? 'light' : 'dark';
    setOverride(next);
    AsyncStorage.setItem(KEY, next).catch(() => {});
  }, [isDark]);

  const value = useMemo(
    () => ({ isDark, mode, toggleTheme, colors: isDark ? darkColors : lightColors }),
    [isDark, mode, toggleTheme]
  );

  return (
    <ThemeContext.Provider value={value}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
