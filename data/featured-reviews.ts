export interface FeaturedReview {
  id: string;
  name: string;
  rating: number;
  text: string;
  relativeDate?: string;
}

export const FEATURED_REVIEWS: FeaturedReview[] = [
  {
    id: "jack-rothenberg",
    name: "Jack Rothenberg",
    rating: 5,
    relativeDate: "10 months ago",
    text: "The individuals that I dealt with were extremely polite and lived up to their word. They arrived on time, did an excellent job, and cleaned up well after themselves. The price was very reasonable, and I can highly recommend them.",
  },
  {
    id: "tarek-sharkawi",
    name: "Tarek Sharkawi",
    rating: 5,
    relativeDate: "10 months ago",
    text: "I can't recommend this company enough. Louis Phillipe was meticulous, incredibly efficient, thorough, and professional. The quality of his work is incomparable. We have tried out a few other companies but there is no comparison.",
  },
  {
    id: "teanoosh-zadeh",
    name: "Teanoosh Zadeh",
    rating: 5,
    relativeDate: "10 months ago",
    text: "I used this company for the first time and I could not be any happier. They were very professional and efficient. Both my outside and inside windows were cleaned. Soon after they left, I discovered that some of the basement windows were missed. I contacted them and they returned the same day to complete the work. Spotless! Highly recommended.",
  },
  {
    id: "brigid-scullion",
    name: "Brigid Scullion",
    rating: 5,
    relativeDate: "1 year ago",
    text: "I recently had my windows cleaned by Luca at a building on Victoria in Westmount, and I couldn't be happier with the results! Luca was professional, thorough, and left the windows spotless. Highly recommend his services!",
  },
  {
    id: "roger-kan",
    name: "Roger Kan",
    rating: 5,
    relativeDate: "1 year ago",
    text: "They did a great job at my place. A month ago they washed the windows from outside and yesterday they washed the patio with polymer filling. It looks new. Thanks for your good work.",
  },
  {
    id: "robert-hecht",
    name: "Robert Hecht",
    rating: 5,
    relativeDate: "11 months ago",
    text: "Great experience. Friendly, courteous and thorough. Will use their service again.",
  },
  {
    id: "david-gans",
    name: "David Gans",
    rating: 5,
    relativeDate: "8 months ago",
    text: "Incredible work, service and professionalism!",
  },
  {
    id: "sophie-banford",
    name: "Sophie Banford",
    rating: 5,
    relativeDate: "2 weeks ago",
    text: "Reliable, efficient and kind.",
  },
  {
    id: "hugo-fredoueil",
    name: "Hugo Fredoueil",
    rating: 5,
    relativeDate: "2 months ago",
    text: "Impeccable service! Thank you for your professional and efficient work.",
  },
];
