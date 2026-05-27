"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { FEATURED_REVIEWS, type FeaturedReview } from "@/data/featured-reviews";
import { useLanguage } from "@/lib/i18n/language-provider";
import { formatTranslation } from "@/lib/i18n/translations";

const DEFAULT_GOOGLE_LISTING_URL =
  "https://share.google/0gXX1ufLW8A91Oe0h";

const FADE_MS = 380;
const MIN_READ_MS = 2000;
const MS_PER_WORD = 95;
const MAX_READ_MS = 10000;
const MANUAL_PAUSE_MS = 12000;

function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) {
    return 0;
  }

  return trimmed.split(/\s+/).length;
}

function getReadDurationMs(text: string): number {
  const words = countWords(text);
  return Math.min(MAX_READ_MS, Math.max(MIN_READ_MS, words * MS_PER_WORD));
}

function formatAttribution(review: FeaturedReview, googleLabel: string): string {
  if (review.relativeDate) {
    return `— ${review.name}, ${googleLabel} · ${review.relativeDate}`;
  }

  return `— ${review.name}, ${googleLabel}`;
}

function ReviewStars({ rating }: { rating: number }) {
  const { t } = useLanguage();
  const rounded = Math.round(rating);

  return (
    <div
      className="reviews-stars"
      aria-label={formatTranslation(t.testimonials.starsLabel, {
        rating: rounded,
      })}
    >
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          size={18}
          strokeWidth={1.5}
          className={index < rounded ? "reviews-star is-filled" : "reviews-star"}
          fill={index < rounded ? "currentColor" : "none"}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}

export function ReviewsSection() {
  const { t } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isContentVisible, setIsContentVisible] = useState(true);
  const pauseUntilRef = useRef(0);
  const isHoveredRef = useRef(false);
  const fadeTimeoutRef = useRef<number | null>(null);
  const prefersReducedMotionRef = useRef(false);

  const googleListingUrl =
    process.env.NEXT_PUBLIC_GOOGLE_BUSINESS_URL ?? DEFAULT_GOOGLE_LISTING_URL;

  const reviews = FEATURED_REVIEWS;
  const activeReview = reviews[currentIndex]!;

  useEffect(() => {
    prefersReducedMotionRef.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
  }, []);

  useEffect(() => {
    return () => {
      if (fadeTimeoutRef.current !== null) {
        window.clearTimeout(fadeTimeoutRef.current);
      }
    };
  }, []);

  const transitionToIndex = useCallback(
    (nextIndex: number) => {
      if (fadeTimeoutRef.current !== null) {
        window.clearTimeout(fadeTimeoutRef.current);
      }

      const fadeMs = prefersReducedMotionRef.current ? 0 : FADE_MS;

      if (fadeMs === 0) {
        setCurrentIndex(nextIndex);
        setIsContentVisible(true);
        return;
      }

      setIsContentVisible(false);
      fadeTimeoutRef.current = window.setTimeout(() => {
        setCurrentIndex(nextIndex);
        requestAnimationFrame(() => setIsContentVisible(true));
      }, fadeMs);
    },
    [],
  );

  function pauseAutoAdvance() {
    pauseUntilRef.current = Date.now() + MANUAL_PAUSE_MS;
  }

  function goToPrevious() {
    pauseAutoAdvance();
    transitionToIndex((currentIndex - 1 + reviews.length) % reviews.length);
  }

  function goToNext() {
    pauseAutoAdvance();
    transitionToIndex((currentIndex + 1) % reviews.length);
  }

  useEffect(() => {
    if (prefersReducedMotionRef.current || reviews.length < 2) {
      return;
    }

    let cancelled = false;
    let timeoutId = 0;

    const readMs = getReadDurationMs(reviews[currentIndex]!.text);
    const fadeMs = prefersReducedMotionRef.current ? 0 : FADE_MS;

    function tryAdvance() {
      if (cancelled) {
        return;
      }

      if (isHoveredRef.current || Date.now() < pauseUntilRef.current) {
        timeoutId = window.setTimeout(tryAdvance, 250);
        return;
      }

      transitionToIndex((currentIndex + 1) % reviews.length);
    }

    timeoutId = window.setTimeout(tryAdvance, readMs + fadeMs);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [currentIndex, reviews, transitionToIndex]);

  return (
    <section
      className="reviews"
      id="testimonials"
      aria-labelledby="testimonials-title"
    >
      <div className="reviews-media" aria-hidden="true">
        <Image
          src="/westmountdrone2.png"
          alt=""
          fill
          sizes="100vw"
          className="reviews-media-image"
        />
        <div className="reviews-shade" />
      </div>

      <div className="reviews-top page-shell--content">
        <div className="reviews-top-grid">
          <h2 id="testimonials-title">{t.testimonials.title}</h2>

          <div
            className="reviews-quote-wrap"
            onMouseEnter={() => {
              isHoveredRef.current = true;
            }}
            onMouseLeave={() => {
              isHoveredRef.current = false;
            }}
            onFocusCapture={pauseAutoAdvance}
          >
            <div
              className="reviews-slider"
              aria-live="polite"
              aria-atomic="true"
              aria-relevant="text"
            >
              <div
                className={`reviews-slider-content${isContentVisible ? "" : " is-fading"}`}
              >
                <ReviewStars rating={activeReview.rating} />
                <blockquote className="reviews-quote">
                  <p>&ldquo;{activeReview.text}&rdquo;</p>
                </blockquote>
                <p className="reviews-attribution">
                  {formatAttribution(activeReview, t.testimonials.googleReviewer)}
                </p>
                <a
                  className="reviews-google-link"
                  href={googleListingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t.testimonials.viewOnGoogle}
                </a>
              </div>
            </div>

            <div className="reviews-arrows">
              <button
                type="button"
                className="reviews-arrow"
                onClick={goToPrevious}
                aria-label={t.testimonials.previousTestimonial}
              >
                <ChevronLeft size={18} aria-hidden="true" />
              </button>
              <button
                type="button"
                className="reviews-arrow"
                onClick={goToNext}
                aria-label={t.testimonials.nextTestimonial}
              >
                <ChevronRight size={18} aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>

        <hr className="testimonials-divider" aria-hidden="true" />
      </div>

      <div className="reviews-bottom-spacer" aria-hidden="true" />
    </section>
  );
}
