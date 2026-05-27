import curatedReviews from "@/data/curated-reviews.json";

export type CuratedLang = "en" | "fr";

export type ApiReview = {
  id: string;
  name: string;
  rating: number;
  text: string;
  date?: string;
  jobType?: string;
  source: "google" | "internal";
};

type CuratedEntry = {
  id: string;
  name: string;
  rating: number;
  textEn: string;
  textFr: string;
  date?: string;
  jobType?: string;
};

const entries = curatedReviews as CuratedEntry[];

export const CURATED_GOOGLE_META = {
  rating: 4.9,
  userRatingsTotal: entries.length > 0 ? Math.max(entries.length, 49) : 49,
  placeName: "Stornway Group",
};

export function getCuratedGoogleReviewsForApi(lang: CuratedLang): ApiReview[] {
  return entries.map((entry) => ({
    id: entry.id,
    name: entry.name,
    rating: entry.rating,
    text: lang === "fr" ? entry.textFr : entry.textEn,
    date: entry.date,
    jobType: entry.jobType,
    source: "google" as const,
  }));
}

export function mergeApiGoogleReviewsWithCurated(
  apiReviews: Array<{
    author: string;
    rating: number;
    text: string;
    relativePublishTimeDescription?: string;
  }>,
  lang: CuratedLang,
): ApiReview[] {
  return apiReviews.map((review, idx) => {
    const curated = entries.find(
      (entry) => entry.name.toLowerCase() === review.author.toLowerCase(),
    );

    const fallbackText = curated
      ? lang === "fr"
        ? curated.textFr
        : curated.textEn
      : "";

    return {
      id: curated?.id ?? `google-${idx}`,
      name: review.author,
      rating: Math.min(5, Math.max(1, Math.round(review.rating))),
      text: review.text.trim() || fallbackText,
      date: review.relativePublishTimeDescription ?? curated?.date,
      jobType: curated?.jobType,
      source: "google" as const,
    };
  });
}
