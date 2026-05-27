"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/lib/i18n/language-provider";
import { LanguageToggle } from "./language-toggle";

const EMAIL = "info@stornway.com";

export function SiteHeader() {
  const { t } = useLanguage();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const updateHeader = () => {
      setIsScrolled(window.scrollY > 32);
    };

    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });
    document.addEventListener("scroll", updateHeader, { passive: true });
    const intervalId = window.setInterval(updateHeader, 120);

    return () => {
      window.removeEventListener("scroll", updateHeader);
      document.removeEventListener("scroll", updateHeader);
      window.clearInterval(intervalId);
    };
  }, []);

  return (
    <header className={`site-header${isScrolled ? " is-scrolled" : ""}`}>
      <div className="page-shell site-header-inner">
        <a className="header-brand" href="#top" aria-label={t.footer.homeAria}>
          <img
            src="/stornwaylogo1.svg"
            alt="Stornway Group"
            className="header-logo"
          />
        </a>
        <nav aria-label="Main navigation">
          <a href="#top">{t.nav.home}</a>
          <a href="#services">{t.nav.services}</a>
          <a href="#contact">{t.nav.contact}</a>
          <a href="#portfolio">{t.nav.portfolio}</a>
          <a href="#testimonials">{t.nav.testimonials}</a>
        </nav>
        <div className="header-actions">
          <LanguageToggle />
        </div>
      </div>
    </header>
  );
}
