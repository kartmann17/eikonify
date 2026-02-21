import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import fr from '@/locales/fr.json';
import en from '@/locales/en.json';
import es from '@/locales/es.json';

export const languages = {
    fr: { name: 'Français', flag: '🇫🇷' },
    en: { name: 'English', flag: '🇬🇧' },
    es: { name: 'Español', flag: '🇪🇸' },
} as const;

export type Language = keyof typeof languages;

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources: {
            fr: { translation: fr },
            en: { translation: en },
            es: { translation: es },
        },
        fallbackLng: 'fr',
        supportedLngs: ['fr', 'en', 'es'],
        interpolation: {
            escapeValue: false,
        },
        detection: {
            order: ['localStorage', 'navigator', 'htmlTag'],
            caches: ['localStorage'],
            lookupLocalStorage: 'eikonify-lang',
        },
    });

export default i18n;
