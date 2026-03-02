"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { translations } from "./i18n";
import type { Language, Translations } from "./i18n";

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: "sv",
  setLang: () => {},
  t: translations.sv,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>("sv");

  useEffect(() => {
    const stored = localStorage.getItem("wx_lang") as Language | null;
    if (stored === "en" || stored === "sv") setLangState(stored);
  }, []);

  function setLang(l: Language) {
    setLangState(l);
    localStorage.setItem("wx_lang", l);
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: translations[lang] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
