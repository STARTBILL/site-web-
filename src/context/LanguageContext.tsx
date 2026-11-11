import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'fr' | 'en';

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  toggleLang: () => void;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'fr',
  setLang: () => {},
  toggleLang: () => {},
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('startbill_lang');
      if (saved === 'fr' || saved === 'en') {
        return saved;
      }
    }
    return 'fr';
  });

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('startbill_lang', newLang);
      document.documentElement.lang = newLang;
    }
  };

  const toggleLang = () => {
    setLang(lang === 'fr' ? 'en' : 'fr');
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.lang = lang;
    }
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
