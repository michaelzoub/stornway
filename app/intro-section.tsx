"use client";

import { ChevronDown } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-provider";

export function IntroSection() {
  const { t } = useLanguage();
  const { stats } = t.intro;

  return (
    <div className="intro" aria-labelledby="intro-title">
      <div className="intro-inner page-shell--content">
        <div className="intro-top">
          <h2 id="intro-title">{t.intro.title}</h2>
          <div className="intro-copy">
            <p className="intro-lead">{t.intro.lead}</p>
            <p className="intro-body">{t.intro.body}</p>
            <a className="intro-link" href="#services">
              {t.intro.learnMore}
              <ChevronDown size={18} aria-hidden="true" />
            </a>
          </div>
        </div>

        <hr className="intro-divider" aria-hidden="true" />

        <div className="intro-stats">
          {stats.map((stat) => (
            <article className="intro-stat" key={stat.label}>
              <p className="intro-stat-label">{stat.label}</p>
              <p className="intro-stat-value">{stat.value}</p>
              <p className="intro-stat-desc">{stat.description}</p>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
