'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'fr' | 'sw' | 'pt';

const translations = {
  en: {
    'settings.title': 'Settings',
    'settings.darkMode': 'Dark Mode',
    'settings.darkModeDesc': 'Switch between light and dark themes',
    'settings.notifications': 'Notifications',
    'settings.notificationsDesc': 'Order updates and promotions',
    'settings.language': 'Language',
    'settings.languageDesc': 'System language',
    'settings.changePassword': 'Change Password',
    'settings.changePasswordDesc': 'Update your account password'
  },
  fr: {
    'settings.title': 'Paramètres',
    'settings.darkMode': 'Mode Sombre',
    'settings.darkModeDesc': 'Basculer entre les thèmes clairs et sombres',
    'settings.notifications': 'Notifications',
    'settings.notificationsDesc': 'Mises à jour des commandes et promotions',
    'settings.language': 'Langue',
    'settings.languageDesc': 'Langue du système',
    'settings.changePassword': 'Changer le Mot de Passe',
    'settings.changePasswordDesc': 'Mettre à jour le mot de passe de votre compte'
  },
  sw: {
    'settings.title': 'Mipangilio',
    'settings.darkMode': 'Hali ya Giza',
    'settings.darkModeDesc': 'Badilisha kati ya mandhari nyepesi na giza',
    'settings.notifications': 'Arifa',
    'settings.notificationsDesc': 'Taarifa za agizo na matangazo',
    'settings.language': 'Lugha',
    'settings.languageDesc': 'Lugha ya mfumo',
    'settings.changePassword': 'Badilisha Nenosiri',
    'settings.changePasswordDesc': 'Sasisha nenosiri la akaunti yako'
  },
  pt: {
    'settings.title': 'Configurações',
    'settings.darkMode': 'Modo Escuro',
    'settings.darkModeDesc': 'Alternar entre temas claros e escuros',
    'settings.notifications': 'Notificações',
    'settings.notificationsDesc': 'Atualizações de pedidos e promoções',
    'settings.language': 'Idioma',
    'settings.languageDesc': 'Idioma do sistema',
    'settings.changePassword': 'Mudar Senha',
    'settings.changePasswordDesc': 'Atualize a senha da sua conta'
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('app_lang') as Language;
    if (saved && translations[saved]) {
      setLanguageState(saved);
    }
    setMounted(true);
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('app_lang', lang);
    }
  };

  const t = (key: string) => {
    const currentLang = mounted ? language : 'en';
    // @ts-ignore
    return translations[currentLang][key] || translations['en'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language: mounted ? language : 'en', setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
