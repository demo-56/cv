import { useState, useEffect } from 'react';
import { Language } from '../types';

export const useLanguage = () => {
  // Initialize language from localStorage or default to Arabic
  const [language, setLanguage] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const savedLanguage = localStorage.getItem('language') as Language;
      return savedLanguage || 'ar';
    }
    return 'ar';
  });

  // Apply language settings to document
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    
    // Set language attribute
    root.setAttribute('lang', language);
    
    // Always maintain LTR direction as requested
    root.setAttribute('dir', 'ltr');
    
    // Add language class for CSS targeting if needed
    root.classList.remove('lang-ar', 'lang-en');
    root.classList.add(`lang-${language}`);
    
    // Add language class to body as well
    body.classList.remove('lang-ar', 'lang-en');
    body.classList.add(`lang-${language}`);
    
    // Save to localStorage
    localStorage.setItem('language', language);
    
    // Update document title based on language
    document.title = language === 'ar' ? 'Value - تطوير المهن' : 'Value - Career Development';

  }, [language]);

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'ar' ? 'en' : 'ar');
  };

  const setLanguageDirectly = (newLanguage: Language) => {
    setLanguage(newLanguage);
  };

  return {
    language,
    toggleLanguage,
    setLanguageDirectly,
    isArabic: language === 'ar'
  };
};