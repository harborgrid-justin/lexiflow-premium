/**
 * I18nProvider - Internationalization provider
 */

import { createContext, useContext, useState, type ReactNode } from 'react';
import { loadDictionary } from './load/dictionaries';
import { resolveLocale } from './load/resolveLocale';
import type { Dictionary, Locale } from './types';

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string>) => string;
  dictionary: Dictionary;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return context;
}

interface I18nProviderProps {
  children: ReactNode;
  defaultLocale?: Locale;
}

export function I18nProvider({ children, defaultLocale = 'en' }: I18nProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (typeof window !== 'undefined') {
      return resolveLocale() || defaultLocale;
    }
    return defaultLocale;
  });

  const [dictionary, setDictionary] = useState<Dictionary>(() => {
    return loadDictionary(locale);
  });

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    setDictionary(loadDictionary(newLocale));

    if (typeof window !== 'undefined') {
      localStorage.setItem('locale', newLocale);
      document.documentElement.lang = newLocale;
    }
  };

  const t = (key: string, params?: Record<string, string>): string => {
    let value = dictionary[key] || key;

    if (params) {
      Object.entries(params).forEach(([param, replacement]) => {
        value = value.replace(`{{${param}}}`, replacement);
      });
    }

    return value;
  };

  const value: I18nContextValue = {
    locale,
    setLocale,
    t,
    dictionary,
  };

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
}
