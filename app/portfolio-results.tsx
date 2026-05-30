"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeftRight,
  Maximize2,
  X,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-provider";
import {
  focusToObjectPosition,
  getAlignedObjectPositions,
  getCachedImageElement,
  preloadImageSources,
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
          title: `${t.portfolio.landscaping} 3`,
          beforeSrc: "/LD/3_LD_before.jpeg",
          afterSrc: "/LD/3_LD_after.jpeg",
          focus: { x: 0.5, y: 0.78 },
        },
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

function defaultAlign(slide: PortfolioSlide) {
  return {
    before: focusToObjectPosition(slide.focus),
    after: focusToObjectPosition(slide.focus),
  };
}

function PortfolioServiceBlock({ service }: { service: PortfolioService }) {
  const { t } = useLanguage();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [hasDragged, setHasDragged] = useState(false);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [slideAlignments, setSlideAlignments] = useState<
    Record<string, { before: string; after: string }>
  >({});

  const stageRef = useRef<HTMLDivElement | null>(null);
  const dragStageRef = useRef<HTMLDivElement | null>(null);
  const dragOriginRef = useRef(50);

  const active = service.slides[currentSlide]!;
  const activeAlign =
    slideAlignments[active.beforeSrc] ?? defaultAlign(active);

  useEffect(() => {
    preloadImageSources(
      service.slides.flatMap((slide) => [slide.beforeSrc, slide.afterSrc]),
    );
  }, [service.slides]);

  useEffect(() => {
    const stageEl = stageRef.current;
    if (!stageEl) return;

    let cancelled = false;
    let resizeTimer: ReturnType<typeof setTimeout> | undefined;

    async function computeAlignments() {
      const { width, height } = stageEl!.getBoundingClientRect();
      if (width <= 0 || height <= 0) return;

      const next: Record<string, { before: string; after: string }> = {};

      await Promise.all(
        service.slides.map(async (slide) => {
          try {
            const [beforeImg, afterImg] = await Promise.all([
              getCachedImageElement(slide.beforeSrc),
              getCachedImageElement(slide.afterSrc),
            ]);

            if (cancelled) return;

            next[slide.beforeSrc] = getAlignedObjectPositions(
              beforeImg,
              afterImg,
              width,
              height,
              slide.focus,
            );
          } catch {
            if (!cancelled) {
              next[slide.beforeSrc] = defaultAlign(slide);
            }
          }
        }),
      );

      if (!cancelled) {
        setSlideAlignments(next);
      }
    }

    void computeAlignments();

    const observer = new ResizeObserver(() => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        void computeAlignments();
      }, 150);
    });
    observer.observe(stageEl);

    return () => {
      cancelled = true;
      clearTimeout(resizeTimer);
      observer.disconnect();
    };
  }, [service.slides]);

  const switchToSlide = useCallback((idx: number) => {
    setIsDragging(false);
    setHasDragged(false);
    setCurrentSlide(idx);
    setSliderPosition(50);
  }, []);

  const computePercent = (clientX: number) => {
    const el = dragStageRef.current ?? stageRef.current;
    if (!el) return 50;
    const rect = el.getBoundingClientRect();
    const x = clientX - rect.left;
    return Math.max(0, Math.min(100, (x / rect.width) * 100));
  };

  const startDrag = useCallback(() => {
    dragOriginRef.current = sliderPosition;
    setHasDragged(false);
    setIsDragging(true);
  }, [sliderPosition]);

  const stopDrag = useCallback(() => {
    setIsDragging(false);
    dragStageRef.current = null;
  }, []);

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      dragStageRef.current = e.currentTarget.parentElement as HTMLDivElement | null;
      startDrag();
      setSliderPosition(computePercent(e.clientX));
    },
    [startDrag],
  );

  const onTouchStart = useCallback(
    (e: React.TouchEvent) => {
      dragStageRef.current = e.currentTarget.parentElement as HTMLDivElement | null;
      dragOriginRef.current = sliderPosition;
      setHasDragged(false);
      setIsDragging(true);
      const x = e.touches[0]?.clientX;
      if (x != null) setSliderPosition(computePercent(x));
    },
    [sliderPosition],
  );

  useEffect(() => {
    if (!isDragging) return;

    const onMove = (e: MouseEvent) => {
      const next = computePercent(e.clientX);
      if (Math.abs(next - dragOriginRef.current) > 1.2) setHasDragged(true);
      setSliderPosition(next);
    };
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
      if (x != null) {
        const next = computePercent(x);
        if (Math.abs(next - dragOriginRef.current) > 1.2) setHasDragged(true);
        setSliderPosition(next);
      }
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

  const openInspector = useCallback(() => {
    if (hasDragged) return;
    setIsInspectorOpen(true);
  }, [hasDragged]);

  const closeInspector = useCallback(() => {
    setIsInspectorOpen(false);
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (!isInspectorOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeInspector();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [closeInspector, isInspectorOpen]);

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
        {service.slides.map((slide, idx) => {
          const align = slideAlignments[slide.beforeSrc] ?? defaultAlign(slide);
          const isActive = idx === currentSlide;

          return (
            <div
              key={slide.beforeSrc}
              className={`portfolio-slide${isActive ? " is-active" : ""}`}
              aria-hidden={!isActive}
            >
              <div className="portfolio-stage-layer">
                <Image
                  src={slide.beforeSrc}
                  alt=""
                  fill
                  unoptimized
                  sizes="960px"
                  className="portfolio-stage-img portfolio-stage-img-before"
                  style={{
                    objectFit: "cover",
                    objectPosition: align.before,
                  }}
                />
              </div>

              <div
                className="portfolio-stage-after"
                style={{
                  clipPath: `inset(0 0 0 ${isActive ? sliderPosition : 50}%)`,
                  WebkitClipPath: `inset(0 0 0 ${isActive ? sliderPosition : 50}%)`,
                }}
              >
                <Image
                  src={slide.afterSrc}
                  alt=""
                  fill
                  unoptimized
                  sizes="960px"
                  className="portfolio-stage-img portfolio-stage-img-after"
                  style={{
                    objectFit: "cover",
                    objectPosition: align.after,
                  }}
                />
              </div>
            </div>
          );
        })}

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
          onClick={openInspector}
          aria-label={`${t.portfolio.dragCompare} ${service.title}`}
        />

        <div className="portfolio-open-hint" aria-hidden="true">
          <Maximize2 size={15} />
        </div>
      </div>

      {isInspectorOpen && (
        <div
          className="portfolio-inspector"
          role="dialog"
          aria-modal="true"
          aria-label={`${active.title} enlarged before and after comparison`}
        >
          <div className="portfolio-inspector-top">
            <div>
              <p>{service.title}</p>
              <h3>{active.title}</h3>
            </div>
            <button
              type="button"
              className="portfolio-inspector-close"
              onClick={closeInspector}
              aria-label="Close enlarged comparison"
            >
              <X size={22} aria-hidden="true" />
            </button>
          </div>

          <div
            className={`portfolio-inspector-stage${isDragging ? " is-dragging" : ""}`}
          >
            <div className="portfolio-inspector-label is-before">Before</div>
            <div className="portfolio-inspector-label is-after">After</div>

            <Image
              src={active.beforeSrc}
              alt=""
              fill
              unoptimized
              sizes="100vw"
              className="portfolio-stage-img portfolio-stage-img-before"
              style={{
                objectFit: "cover",
                objectPosition: activeAlign.before,
              }}
            />

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
                unoptimized
                sizes="100vw"
                className="portfolio-stage-img portfolio-stage-img-after"
                style={{
                  objectFit: "cover",
                  objectPosition: activeAlign.after,
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
              aria-label={`${t.portfolio.dragCompare} ${active.title}`}
            />
          </div>
        </div>
      )}

      {slideCount > 1 && (
        <div className="portfolio-image-controls">
          <button
            type="button"
            className="portfolio-control-btn"
            onClick={() => switchToSlide((currentSlide + slideCount - 1) % slideCount)}
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
                key={slide.beforeSrc}
                type="button"
                role="tab"
                aria-selected={idx === currentSlide}
                tabIndex={idx === currentSlide ? 0 : -1}
                className={`portfolio-dot ${idx === currentSlide ? "is-active" : ""}`}
                onClick={() => switchToSlide(idx)}
                aria-label={`${t.portfolio.showProject} ${idx + 1}`}
              />
            ))}
          </div>

          <button
            type="button"
            className="portfolio-control-btn"
            onClick={() => switchToSlide((currentSlide + 1) % slideCount)}
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
