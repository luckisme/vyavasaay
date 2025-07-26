
'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

type Translations = Record<string, any>;

interface TranslationContextType {
  language: string;
  setLanguage: (language: string) => void;
  t: (key: string, fallback?: string, replacements?: Record<string, string>) => string;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

// Cache for loaded languages to avoid re-fetching
const loadedLanguages: Record<string, Translations> = {};

export const TranslationProvider = ({ children, initialLanguage = 'en' }: { children: React.ReactNode, initialLanguage?: string }) => {
  const [language, setLanguage] = useState(initialLanguage);
  const [translations, setTranslations] = useState<Translations>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTranslations = async (lang: string) => {
      setIsLoading(true);
      if (loadedLanguages[lang]) {
        setTranslations(loadedLanguages[lang]);
        setIsLoading(false);
        return;
      }
      try {
        const response = await import(`@/locales/${lang}.json`);
        loadedLanguages[lang] = response.default;
        setTranslations(response.default);
      } catch (error) {
        console.error(`Could not load translation file for language: ${lang}`, error);
        // Fallback to English if the selected language fails to load
        if (lang !== 'en') {
            try {
              const fallback = await import(`@/locales/en.json`);
              loadedLanguages['en'] = fallback.default;
              setTranslations(fallback.default);
            } catch (e) {
                console.error('Could not load fallback translation file', e)
            }
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchTranslations(language);
  }, [language]);

  const t = useCallback((key: string, fallback?: string, replacements?: Record<string, string>): string => {
    const keys = key.split('.');
    let result: any = translations;
    for (const k of keys) {
      if (result && typeof result === 'object' && k in result) {
        result = result[k];
      } else {
        result = fallback || key;
        break;
      }
    }
    
    let strResult = typeof result === 'string' ? result : (fallback || key);

    if (replacements) {
        for(const placeholder in replacements) {
            strResult = strResult.replace(`{{${placeholder}}}`, replacements[placeholder]);
        }
    }

    return strResult;
  }, [translations]);

  const value = { language, setLanguage, t };

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(TranslationContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
};
