export type Language = "en" | "fr";

export interface Translations {
  nav: {
    home: string;
    services: string;
    portfolio: string;
    testimonials: string;
    contact: string;
  };
  hero: {
    titleLine1: string;
    titleLine2: string;
    lede: string;
    contactUs: string;
    viewServices: string;
  };
  intro: {
    title: string;
    lead: string;
    body: string;
    learnMore: string;
    stats: Array<{
      label: string;
      value: string;
      description: string;
    }>;
  };
  services: {
    eyebrow: string;
    title: string;
    lede: string;
    landscaping: { title: string; text: string; imageAlt: string };
    pressureWashing: { title: string; text: string; imageAlt: string };
    windowWashing: { title: string; text: string; imageAlt: string };
  };
  portfolio: {
    eyebrow: string;
    title: string;
    lede: string;
    residentialCommercial: string;
    landscaping: string;
    pressureWashing: string;
    windowWashing: string;
    dragCompare: string;
    previousProject: string;
    nextProject: string;
    showProject: string;
  };
  testimonials: {
    eyebrow: string;
    title: string;
    viewOnGoogle: string;
    basedOnCount: string;
    loading: string;
    googleSummary: string;
    basedOnGoogleCount: string;
    noneAvailable: string;
    verifiedClient: string;
    googleReviewer: string;
    seeAll: string;
    previousTestimonial: string;
    nextTestimonial: string;
    starsLabel: string;
  };
  contact: {
    eyebrow: string;
    title: string;
    lede: string;
    phoneLabel: string;
    emailLabel: string;
    nameLabel: string;
    namePlaceholder: string;
    emailFieldLabel: string;
    emailPlaceholder: string;
    phoneFieldLabel: string;
    phonePlaceholder: string;
    servicesLabel: string;
    servicePlaceholder: string;
    serviceLandscaping: string;
    servicePressureWashing: string;
    serviceWindowWashing: string;
    serviceGeneral: string;
    messageLabel: string;
    messagePlaceholder: string;
    submit: string;
    sendAnother: string;
    sending: string;
    successTitle: string;
    successMessage: string;
    errorMessage: string;
    required: string;
    invalidEmail: string;
  };
  footer: {
    homeAria: string;
    description: string;
    socialLinks: string;
    company: string;
    services: string;
    rights: string;
  };
  language: {
    toggleLabel: string;
    english: string;
    french: string;
  };
}
