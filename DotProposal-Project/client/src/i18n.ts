// src/i18n.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import tr from './locales/tr.json';
import en from './locales/en.json';

i18n
  .use(LanguageDetector) // Tarayıcı dilini algıla
  .use(initReactI18next) // React entegrasyonu
  .init({
    resources: {
      tr: { translation: tr },
      en: { translation: en }
    },
    fallbackLng: 'tr', // Varsayılan dil Türkçe
    interpolation: {
      escapeValue: false 
    }
  });

export default i18n;