
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';

// Define the shape of the translation object
type Translations = { [key: string]: any };

// Define the shape of the context
interface LanguageContextType {
  language: string;
  setLanguage: (language: string) => void;
  translations: Translations;
  t: (key: string) => string;
  supportedLanguages: { code: string, name: string }[];
}

// Create the context
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Define supported languages
const supportedLanguages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'हिन्दी' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' },
    { code: 'de', name: 'Deutsch' },
    { code: 'zh', name: '中文' },
    { code: 'ja', name: '日本語' },
    { code: 'ar', name: 'العربية' },
    { code: 'ru', name: 'Русский' },
    { code: 'pt', name: 'Português' },
];

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState('en');
  const [translations, setTranslations] = useState<Translations>({});

  useEffect(() => {
    // Get saved language from localStorage or default to 'en'
    const savedLanguage = localStorage.getItem('language') || 'en';
    if (supportedLanguages.some(l => l.code === savedLanguage)) {
        setLanguageState(savedLanguage);
    }
  }, []);

  useEffect(() => {
    const loadTranslations = async () => {
      try {
        const module = await import(`@/locales/${language}.json`);
        setTranslations(module.default);
      } catch (error) {
        console.error(`Could not load translation file for language: ${language}`, error);
        // Fallback to English if translation is missing
        const module = await import(`@/locales/en.json`);
        setTranslations(module.default);
      }
    };
    loadTranslations();
  }, [language]);

  const setLanguage = (lang: string) => {
    localStorage.setItem('language', lang);
    setLanguageState(lang);
  };
  
  // Translation function
  const t = useCallback((key: string): string => {
    const keys = key.split('.');
    let result: any = translations;
    for (const k of keys) {
      result = result?.[k];
      if (result === undefined) {
        // Fallback to the key itself if not found
        console.warn(`Translation key not found: ${key}`);
        return key;
      }
    }
    return typeof result === 'string' ? result : key;
  }, [translations]);


  return (
    <LanguageContext.Provider value={{ language, setLanguage, translations, t, supportedLanguages }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook to use the language context
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
