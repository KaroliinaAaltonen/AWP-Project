// client/src/i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
// Import the language JSON files
import enTranslation from './lang/en.json'; 
import sveTranslation from './lang/sv.json';
import finTranslation from './lang/fi.json';
i18n
  .use(initReactI18next)
  .use(LanguageDetector)
  .init({
    resources: {
      en: {
        translation: enTranslation,
      },
      sv: {
        translation: sveTranslation,
      },
      fi: {
        translation: finTranslation,
      }
    },
    // Default langauge is English
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
