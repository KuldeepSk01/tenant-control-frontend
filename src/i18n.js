import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import translations from "./translation/translationsContent";

const createDictionary = (language) =>
  Object.fromEntries(
    translations.map(({ key, ...values }) => [key, values[language]]),
  );

const resources = {
  en: {
    translation: createDictionary("en"),
  },
  hi: {
    translation: createDictionary("hi"),
  },
};

const savedLanguage = localStorage.getItem("appLanguage");

i18n.use(initReactI18next).init({
  resources,
  lng: ["en", "hi"].includes(savedLanguage)
    ? savedLanguage
    : "en",
  fallbackLng: "en",
  keySeparator: false,
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;