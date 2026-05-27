"use client";

import { useLanguage } from "@/lib/i18n/language-provider";

export function LanguageToggle() {
  const { language, setLanguage, t } = useLanguage();

  function toggleLanguage() {
    setLanguage(language === "en" ? "fr" : "en");
  }

  return (
    <button
      type="button"
      className="language-toggle"
      onClick={toggleLanguage}
      aria-label={t.language.toggleLabel}
    >
      <span className={language === "en" ? "is-active" : ""}>{t.language.english}</span>
      <span className="language-toggle-sep" aria-hidden="true">
        /
      </span>
      <span className={language === "fr" ? "is-active" : ""}>{t.language.french}</span>
    </button>
  );
}
