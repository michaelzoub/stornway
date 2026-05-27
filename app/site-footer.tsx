"use client";

import { Mail, Phone } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-provider";

const PHONE_DISPLAY = "514-758-6241";
const PHONE_TEL = "tel:+15147586241";
const EMAIL = "info@stornway.com";

export function SiteFooter() {
  const { t } = useLanguage();
  const year = new Date().getFullYear();

  const companyLinks = [
    { label: t.nav.home, href: "#top" },
    { label: t.nav.services, href: "#services" },
    { label: t.nav.contact, href: "#contact" },
    { label: t.nav.portfolio, href: "#portfolio" },
    { label: t.nav.testimonials, href: "#testimonials" },
  ];

  const serviceLinks = [
    { label: t.services.landscaping.title, href: "#services" },
    { label: t.services.pressureWashing.title, href: "#services" },
    { label: t.services.windowWashing.title, href: "#services" },
  ];

  return (
    <footer className="site-footer">
      <div className="site-footer-inner page-shell--content">
        <div className="site-footer-grid">
          <div className="site-footer-brand">
            <a className="footer-logo-link" href="#top" aria-label={t.footer.homeAria}>
              <img
                src="/stornwaylogo2.svg"
                alt="Stornway Group"
                className="footer-logo"
              />
            </a>
            <p className="site-footer-description">{t.footer.description}</p>
            <div className="site-footer-contact">
              <a className="site-footer-phone" href={PHONE_TEL}>
                <Phone size={16} aria-hidden="true" />
                <span>{PHONE_DISPLAY}</span>
              </a>
              <a className="site-footer-email" href={`mailto:${EMAIL}`}>
                <Mail size={16} aria-hidden="true" />
                <span>{EMAIL}</span>
              </a>
            </div>
            <div className="site-footer-social" aria-label={t.footer.socialLinks}>
              <a
                href="https://www.facebook.com/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
              >
                Facebook
              </a>
              <a
                href="https://www.linkedin.com/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
              >
                LinkedIn
              </a>
            </div>
          </div>

          <div className="site-footer-column">
            <h4>{t.footer.company}</h4>
            <nav aria-label="Footer company links">
              {companyLinks.map((link) => (
                <a key={link.href + link.label} href={link.href}>
                  {link.label}
                </a>
              ))}
            </nav>
          </div>

          <div className="site-footer-column">
            <h4>{t.footer.services}</h4>
            <nav aria-label="Footer service links">
              {serviceLinks.map((link) => (
                <a key={link.label} href={link.href}>
                  {link.label}
                </a>
              ))}
            </nav>
          </div>
        </div>

        <div className="site-footer-bottom">
          © {year} Stornway Group. {t.footer.rights}
        </div>
      </div>
    </footer>
  );
}
