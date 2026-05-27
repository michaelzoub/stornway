"use client";

import Image from "next/image";
import { useLanguage } from "@/lib/i18n/language-provider";
import { IntroSection } from "./intro-section";
import { SiteHeader } from "./site-header";
import { PortfolioResults } from "./portfolio-results";
import { ReviewsSection } from "./reviews-section";
import { ContactSection } from "./contact-section";
import { SiteFooter } from "./site-footer";

export function HomePage() {
  const { t } = useLanguage();

  const services = [
    {
      title: t.services.landscaping.title,
      text: t.services.landscaping.text,
      imageSrc: "/landscaping1.png",
      imageAlt: t.services.landscaping.imageAlt,
    },
    {
      title: t.services.pressureWashing.title,
      text: t.services.pressureWashing.text,
      imageSrc: "/pressurewashing1.png",
      imageAlt: t.services.pressureWashing.imageAlt,
    },
    {
      title: t.services.windowWashing.title,
      text: t.services.windowWashing.text,
      imageSrc: "/windowwashing1.png",
      imageAlt: t.services.windowWashing.imageAlt,
    },
  ];

  return (
    <main>
      <SiteHeader />

      <section className="hero-intro" id="top">
        <div className="hero-intro-bg" aria-hidden="true">
          <Image
            src="/stornwayhero2.png"
            alt=""
            fill
            priority
            unoptimized
            sizes="100vw"
            className="hero-intro-image"
          />
          <div className="hero-intro-shade" />
        </div>
        <div className="hero-intro-content">
          <div className="hero">
            <div className="hero-inner page-shell">
              <div className="hero-copy">
                <h1>
                  <span>{t.hero.titleLine1}</span>
                  <span>{t.hero.titleLine2}</span>
                </h1>
                <p className="hero-lede">{t.hero.lede}</p>
                <div className="hero-actions">
                  <a className="primary-button" href="#contact">
                    {t.hero.contactUs}
                  </a>
                  <a className="secondary-button" href="#services">
                    {t.hero.viewServices}
                  </a>
                </div>
              </div>
            </div>
          </div>
          <div
            className="hero-intro-separator-wrap page-shell--content"
            aria-hidden="true"
          >
            <hr className="hero-intro-separator" />
          </div>
          <IntroSection />
        </div>
      </section>

      <section className="services" id="services" aria-labelledby="services-title">
        <div className="services-inner page-shell--content">
          <header className="services-header">
            <p className="eyebrow">{t.services.eyebrow}</p>
            <h2 id="services-title">{t.services.title}</h2>
            <p className="services-lede">{t.services.lede}</p>
          </header>
          <div className="services-grid">
            {services.map((service) => (
              <article className="service-card" key={service.title}>
                <div className="service-image">
                  <Image
                    src={service.imageSrc}
                    alt={service.imageAlt}
                    fill
                    sizes="(min-width: 1200px) 420px, (min-width: 980px) 32vw, 92vw"
                    className="service-img"
                  />
                </div>
                <h3>{service.title}</h3>
                <p>{service.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <ContactSection />

      <section className="portfolio" id="portfolio" aria-labelledby="portfolio-title">
        <div className="portfolio-inner page-shell--content">
          <header className="portfolio-header">
            <p className="eyebrow">{t.portfolio.eyebrow}</p>
            <h2 id="portfolio-title">{t.portfolio.title}</h2>
            <p className="portfolio-lede">{t.portfolio.lede}</p>
          </header>

          <PortfolioResults />
        </div>
      </section>

      <ReviewsSection />

      <SiteFooter />
    </main>
  );
}
