"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, ChevronsLeftRight } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-provider";
import {
  getAlignedObjectPositions,
  loadImageElement,
  type CompareFocus,
} from "@/lib/portfolio-image-alignment";
import type { Translations } from "@/lib/i18n/types";

type PortfolioSlide = {
  title: string;
  beforeSrc: string;
  afterSrc: string;
  focus?: CompareFocus;
};

type PortfolioService = {
  title: string;
  subtitle: string;
  slides: PortfolioSlide[];
};

function buildPortfolioServices(t: Translations): PortfolioService[] {
  return [
    {
      title: t.portfolio.landscaping,
      subtitle: t.portfolio.residentialCommercial,
      slides: [
        {
          title: `${t.portfolio.landscaping} 1`,
          beforeSrc: "/LD/1_LD_before.jpeg",
          afterSrc: "/LD/1_LD_after.jpeg",
          focus: { x: 0.5, y: 0.52 },
        },
        {
          title: `${t.portfolio.landscaping} 2`,
          beforeSrc: "/LD/2_LD_before.png",
          afterSrc: "/LD/2_LD_after.png",
          focus: { x: 0.5, y: 0.52 },
        },
      ],
    },
    {
      title: t.portfolio.pressureWashing,
      subtitle: t.portfolio.residentialCommercial,
      slides: [
        {
          title: `${t.portfolio.pressureWashing} 1`,
          beforeSrc: "/PW/1_PW_before.jpeg",
          afterSrc: "/PW/1_PW_after.jpeg",
          focus: { x: 0.5, y: 0.5 },
        },
        {
          title: `${t.portfolio.pressureWashing} 2`,
          beforeSrc: "/PW/2_PW_before.jpeg",
          afterSrc: "/PW/2_PW_after.jpeg",
          focus: { x: 0.5, y: 0.5 },
        },
        {
          title: `${t.portfolio.pressureWashing} 3`,
          beforeSrc: "/PW/3_PW_before.jpeg",
          afterSrc: "/PW/3_PW_after.jpeg",
          focus: { x: 0.5, y: 0.5 },
        },
        {
          title: `${t.portfolio.pressureWashing} 4`,
          beforeSrc: "/PW/4_PW_before.jpeg",
          afterSrc: "/PW/4_PW_after.jpeg",
          focus: { x: 0.5, y: 0.5 },
        },
      ],
    },
    {
      title: t.portfolio.windowWashing,
      subtitle: t.portfolio.residentialCommercial,
      slides: [
        {
          title: `${t.portfolio.windowWashing} 1`,
          beforeSrc: "/WD/1_WD_before.jpeg",
          afterSrc: "/WD/1_WD_after.jpeg",
          focus: { x: 0.5, y: 0.5 },
        },
        {
          title: `${t.portfolio.windowWashing} 2`,
          beforeSrc: "/WD/2_WD_before.jpeg",
          afterSrc: "/WD/2_WD_after.jpeg",
          focus: { x: 0.5, y: 0.5 },
        },
      ],
    },
  ];
}

function PortfolioServiceBlock({ service }: { service: PortfolioService }) {
  const { t } = useLanguage();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const [imageAlign, setImageAlign] = useState({
    before: "50% 50%",
    after: "50% 50%",
  });

  const stageRef = useRef<HTMLDivElement | null>(null);
  const switchReqRef = useRef(0);

  const active = service.slides[currentSlide]!;

  useEffect(() => {
    const stageEl = stageRef.current;
    if (!stageEl) return;

    let cancelled = false;

    async function alignImages() {
      const { width, height } = stageEl!.getBoundingClientRect();
      if (width <= 0 || height <= 0) return;

      try {
        const [beforeImg, afterImg] = await Promise.all([
          loadImageElement(active.beforeSrc),
          loadImageElement(active.afterSrc),
        ]);

        if (cancelled) return;

        setImageAlign(
          getAlignedObjectPositions(
            beforeImg,
            afterImg,
            width,
            height,
            active.focus,
          ),
        );
      } catch {
        if (!cancelled) {
          setImageAlign({ before: "50% 50%", after: "50% 50%" });
        }
      }
    }

    void alignImages();

    const observer = new ResizeObserver(() => {
      void alignImages();
    });
    observer.observe(stageEl);

    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, [active.beforeSrc, active.afterSrc, active.focus]);

  const preloadImage = useCallback((src: string) => {
    return new Promise<void>((resolve) => {
      const img = new window.Image();
      img.onload = () => resolve();
      img.onerror = () => resolve();
      img.src = src;
    });
  }, []);

  const switchToSlide = useCallback(
    async (idx: number) => {
      const req = ++switchReqRef.current;
      setIsSwitching(true);
      setIsDragging(false);

      const slide = service.slides[idx]!;
      await Promise.all([
        preloadImage(slide.beforeSrc),
        preloadImage(slide.afterSrc),
      ]);

      if (req !== switchReqRef.current) return;
      setCurrentSlide(idx);
      setSliderPosition(50);
      setIsSwitching(false);
    },
    [preloadImage, service.slides],
  );

  const computePercent = (clientX: number) => {
    const el = stageRef.current;
    if (!el) return 50;
    const rect = el.getBoundingClientRect();
    const x = clientX - rect.left;
    return Math.max(0, Math.min(100, (x / rect.width) * 100));
  };

  const startDrag = useCallback(() => {
    if (isSwitching) return;
    setIsDragging(true);
  }, [isSwitching]);

  const stopDrag = useCallback(() => {
    setIsDragging(false);
  }, []);

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      startDrag();
      setSliderPosition(computePercent(e.clientX));
    },
    [startDrag],
  );

  const onTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (isSwitching) return;
      setIsDragging(true);
      const x = e.touches[0]?.clientX;
      if (x != null) setSliderPosition(computePercent(x));
    },
    [isSwitching],
  );

  useEffect(() => {
    if (!isDragging) return;

    const onMove = (e: MouseEvent) => setSliderPosition(computePercent(e.clientX));
    const onUp = () => stopDrag();

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [isDragging, stopDrag]);

  useEffect(() => {
    if (!isDragging) return;

    const onMove = (e: TouchEvent) => {
      const x = e.touches[0]?.clientX;
      if (x != null) setSliderPosition(computePercent(x));
    };
    const onUp = () => stopDrag();

    window.addEventListener("touchmove", onMove, { passive: true });
    window.addEventListener("touchend", onUp);
    return () => {
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onUp);
    };
  }, [isDragging, stopDrag]);

  const slideCount = service.slides.length;

  return (
    <article className="portfolio-item">
      <header className="portfolio-item-header">
        <h3>{service.title}</h3>
        <p>{service.subtitle}</p>
      </header>

      <div
        className={`portfolio-stage${isDragging ? " is-dragging" : ""}`}
        ref={stageRef}
      >
        <div
          className={`portfolio-stage-layer ${isSwitching ? "portfolio-stage-fade" : ""}`}
          aria-hidden="true"
        >
          <Image
            src={active.beforeSrc}
            alt=""
            fill
            sizes="(min-width: 1400px) 1200px, (min-width: 980px) 90vw, 100vw"
            className="portfolio-stage-img portfolio-stage-img-before"
            style={{
              objectFit: "cover",
              objectPosition: imageAlign.before,
            }}
          />
        </div>

        <div
          className="portfolio-stage-after"
          style={{
            clipPath: `inset(0 0 0 ${sliderPosition}%)`,
            WebkitClipPath: `inset(0 0 0 ${sliderPosition}%)`,
          }}
        >
          <Image
            src={active.afterSrc}
            alt=""
            fill
            sizes="(min-width: 1400px) 1200px, (min-width: 980px) 90vw, 100vw"
            className="portfolio-stage-img portfolio-stage-img-after"
            style={{
              objectFit: "cover",
              objectPosition: imageAlign.after,
            }}
          />
        </div>

        <div
          className="portfolio-slider-handle"
          style={{ left: `${sliderPosition}%` }}
          aria-hidden="true"
        >
          <div className="portfolio-slider-handle-inner">
            <ChevronsLeftRight size={16} strokeWidth={2.25} aria-hidden="true" />
          </div>
        </div>

        <button
          type="button"
          className="portfolio-slider-hit"
          onMouseDown={onMouseDown}
          onTouchStart={onTouchStart}
          aria-label={`${t.portfolio.dragCompare} ${service.title}`}
        />
      </div>

      {slideCount > 1 && (
        <div className="portfolio-image-controls">
          <button
            type="button"
            className="portfolio-control-btn"
            onClick={() =>
              void switchToSlide((currentSlide + slideCount - 1) % slideCount)
            }
            aria-label={`${t.portfolio.previousProject} — ${service.title}`}
          >
            <ChevronLeft size={18} aria-hidden="true" />
          </button>

          <div
            className="portfolio-dots"
            role="tablist"
            aria-label={`${service.title} projects`}
          >
            {service.slides.map((slide, idx) => (
              <button
                key={slide.title}
                type="button"
                role="tab"
                aria-selected={idx === currentSlide}
                tabIndex={idx === currentSlide ? 0 : -1}
                className={`portfolio-dot ${idx === currentSlide ? "is-active" : ""}`}
                onClick={() => void switchToSlide(idx)}
                aria-label={`${t.portfolio.showProject} ${idx + 1}`}
              />
            ))}
          </div>

          <button
            type="button"
            className="portfolio-control-btn"
            onClick={() => void switchToSlide((currentSlide + 1) % slideCount)}
            aria-label={`${t.portfolio.nextProject} — ${service.title}`}
          >
            <ChevronRight size={18} aria-hidden="true" />
          </button>
        </div>
      )}
    </article>
  );
}

export function PortfolioResults() {
  const { t } = useLanguage();
  const portfolioServices = useMemo(() => buildPortfolioServices(t), [t]);

  return (
    <div className="portfolio-gallery">
      {portfolioServices.map((service) => (
        <PortfolioServiceBlock key={service.title} service={service} />
      ))}
    </div>
  );
}
