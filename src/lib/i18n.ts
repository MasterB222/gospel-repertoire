import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import commonFr from "../locales/fr/common.json";
import authFr from "../locales/fr/auth.json";
import songsFr from "../locales/fr/songs.json";
import playlistsFr from "../locales/fr/playlists.json";
import calendarFr from "../locales/fr/calendar.json";
import adminFr from "../locales/fr/admin.json";
import pagesFr from "../locales/fr/pages.json";
import editorFr from "../locales/fr/editor.json";

import commonEn from "../locales/en/common.json";
import authEn from "../locales/en/auth.json";
import songsEn from "../locales/en/songs.json";
import playlistsEn from "../locales/en/playlists.json";
import calendarEn from "../locales/en/calendar.json";
import adminEn from "../locales/en/admin.json";
import pagesEn from "../locales/en/pages.json";
import editorEn from "../locales/en/editor.json";

export const SUPPORTED_LANGUAGES = ["fr", "en"] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

const STORAGE_KEY = "gospel-lang";

function readStoredLanguage(): SupportedLanguage {
  if (typeof window === "undefined") return "fr";
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored === "en" ? "en" : "fr";
}

i18n.use(initReactI18next).init({
  resources: {
    fr: {
      common: commonFr,
      auth: authFr,
      songs: songsFr,
      playlists: playlistsFr,
      calendar: calendarFr,
      admin: adminFr,
      pages: pagesFr,
      editor: editorFr,
    },
    en: {
      common: commonEn,
      auth: authEn,
      songs: songsEn,
      playlists: playlistsEn,
      calendar: calendarEn,
      admin: adminEn,
      pages: pagesEn,
      editor: editorEn,
    },
  },
  lng: readStoredLanguage(),
  fallbackLng: "fr",
  defaultNS: "common",
  ns: ["common", "auth", "songs", "playlists", "calendar", "admin", "pages", "editor"],
  interpolation: { escapeValue: false },
});

i18n.on("languageChanged", (lng) => {
  window.localStorage.setItem(STORAGE_KEY, lng);
});

export default i18n;
