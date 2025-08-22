import React, { createContext, useContext, useState, useEffect } from 'react';
import i18n from '@/i18n';
import { useTranslation } from 'react-i18next';

const LanguageContext = createContext();

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language);
  const { t } = useTranslation();
  const [date, setDate] = useState({ from: undefined, to: undefined });

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  useEffect(() => {
    const onLanguageChanged = (lng) => {
      setCurrentLanguage(lng);
      document.documentElement.lang = lng;
    };
    i18n.on('languageChanged', onLanguageChanged);
    return () => {
      i18n.off('languageChanged', onLanguageChanged);
    };
  }, []);

  const value = {
    currentLanguage,
    changeLanguage,
    t,
    date,
    onDateChange: setDate
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};