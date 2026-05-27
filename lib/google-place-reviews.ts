export interface GooglePlaceReview {
  author: string;
  rating: number;
  text: string;
  relativePublishTimeDescription?: string;
  publishTime?: string;
}

export interface GooglePlaceDetails {
  placeName?: string;
  placeRating?: number;
  userRatingsTotal?: number;
  reviews: GooglePlaceReview[];
}

export async function fetchGooglePlaceDetails(): Promise<GooglePlaceDetails | null> {
  const apiKey =
    process.env.GOOGLE_MAPS_API_KEY?.trim() ||
    process.env.GOOGLE_PLACES_API_KEY?.trim();
  const placeId = process.env.GOOGLE_PLACE_ID?.trim();

  if (!apiKey || !placeId) return null;

  try {
    const res = await fetch(
      `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`,
      {
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask": "displayName,rating,userRatingCount,reviews",
        },
        next: { revalidate: 3600 },
      },
    );

    if (!res.ok) {
      console.warn("[google-place-reviews] Places API failed:", res.status);
      return null;
    }

    const data = (await res.json()) as {
      displayName?: { text?: string };
      rating?: number;
      userRatingCount?: number;
      reviews?: Array<{
        rating?: number;
        text?: { text?: string };
        originalText?: { text?: string };
        relativePublishTimeDescription?: string;
        publishTime?: string;
        authorAttribution?: { displayName?: string };
      }>;
    };

    const reviews: GooglePlaceReview[] = (data.reviews ?? []).map((r, idx) => ({
      author: r.authorAttribution?.displayName ?? `Reviewer ${idx + 1}`,
      rating: r.rating ?? 5,
      text: r.text?.text ?? r.originalText?.text ?? "",
      relativePublishTimeDescription: r.relativePublishTimeDescription,
      publishTime: r.publishTime,
    }));

    return {
      placeName: data.displayName?.text,
      placeRating: data.rating,
      userRatingsTotal: data.userRatingCount,
      reviews,
    };
  } catch (error) {
    console.warn("[google-place-reviews] error:", error);
    return null;
  }
}
