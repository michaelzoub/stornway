import { NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
import { jobManager } from "@/lib/supabase";
import { fetchGooglePlaceDetails } from "@/lib/google-place-reviews";
import {
  CURATED_GOOGLE_META,
  getCuratedGoogleReviewsForApi,
  mergeApiGoogleReviewsWithCurated,
  type CuratedLang,
} from "@/lib/curated-google-reviews";

const getCachedGooglePlace = unstable_cache(
  async () => fetchGooglePlaceDetails(),
  ["google-business-place-details-v6"],
  { revalidate: 3600 },
);

function hasGooglePlacesKey(): boolean {
  return Boolean(
    process.env.GOOGLE_MAPS_API_KEY?.trim() ||
      process.env.GOOGLE_PLACES_API_KEY?.trim(),
  );
}

function resolveReviewLang(request: Request): CuratedLang {
  const raw = new URL(request.url).searchParams.get("lang");
  return raw === "en" ? "en" : "fr";
}

export async function GET(request: Request) {
  try {
    const lang = resolveReviewLang(request);
    const useGoogle = hasGooglePlacesKey();

    if (useGoogle) {
      const place =
        process.env.NODE_ENV === "development"
          ? await fetchGooglePlaceDetails()
          : await getCachedGooglePlace();
      if (place) {
        const googleMeta = {
          rating: place.placeRating,
          userRatingsTotal: place.userRatingsTotal,
          placeName: place.placeName,
        };

        const merged = mergeApiGoogleReviewsWithCurated(place.reviews, lang);
        const body = merged.map((r) => ({
          ...r,
          text:
            r.text.trim() ||
            "Avis Google (texte non fourni par l’API — voir la fiche Google).",
        }));

        if (body.length > 0) {
          return NextResponse.json({
            body,
            source: "google" as const,
            googleMeta,
          });
        }

        if (
          (place.userRatingsTotal ?? 0) > 0 ||
          place.placeRating != null
        ) {
          return NextResponse.json({
            body: getCuratedGoogleReviewsForApi(lang),
            source: "google" as const,
            googleMeta,
          });
        }

        console.warn(
          "[getReviews] Google Places: aucun avis ni statistique; repli sur la base.",
        );
      }
    }

    const jobs = await jobManager.getAllJobs();
    const reviews = jobs
      .filter(
        (job) =>
          (job.review && job.review.trim().length > 0) || job.rating != null,
      )
      .map((job) => ({
        id: job.id,
        name: `Client ${job.id.slice(0, 8)}`,
        rating: Math.min(5, Math.max(1, Math.round(job.rating ?? 5))),
        text:
          job.review?.trim() ||
          (job.rating != null
            ? `Note ${job.rating}/5 — merci pour votre confiance.`
            : ""),
        jobType: job.job_type ?? undefined,
        date: job.completed_date || job.created_at || undefined,
        source: "internal" as const,
      }));

    if (reviews.length > 0) {
      return NextResponse.json({
        body: reviews,
        source: "internal" as const,
      });
    }

    const curated = getCuratedGoogleReviewsForApi(lang);
    return NextResponse.json({
      body: curated,
      source: "google" as const,
      googleMeta: {
        rating: CURATED_GOOGLE_META.rating,
        userRatingsTotal: CURATED_GOOGLE_META.userRatingsTotal,
        placeName: CURATED_GOOGLE_META.placeName,
      },
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      { error: "Failed to fetch reviews", body: [] },
      { status: 500 },
    );
  }
}
