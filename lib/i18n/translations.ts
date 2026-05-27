import type { Language, Translations } from "./types";

export const translations: Record<Language, Translations> = {
  en: {
    nav: {
      home: "Home",
      services: "Services",
      portfolio: "Portfolio",
      testimonials: "Testimonials",
      contact: "Contact",
    },
    hero: {
      titleLine1: "Exterior Care ",
      titleLine2: "Done Right",
      lede: "Landscaping, pressure washing, and window washing delivered with careful planning and clean execution.",
      contactUs: "Contact Us",
      viewServices: "View Services",
    },
    intro: {
      title: "Exterior care built around your property",
      lead: "We plan every visit with care so lawns, hard surfaces, and glass finish clean — residential and commercial.",
      body: "Stornway Group brings landscaping, pressure washing, and window washing together under one reliable crew. From routine upkeep to seasonal refreshes, we show up prepared, work efficiently, and leave your property looking sharp.",
      learnMore: "Learn more",
      stats: [
        {
          label: "Projects",
          value: "200+",
          description:
            "Residential and commercial jobs completed with attention to detail.",
        },
        {
          label: "Clients",
          value: "100+",
          description:
            "Homeowners and businesses who trust us with their exterior care.",
        },
        {
          label: "Years",
          value: "6+",
          description:
            "Years of hands-on experience across landscaping and surface cleaning.",
        },
        {
          label: "Core services",
          value: "3",
          description:
            "Landscaping, pressure washing, and window washing under one team.",
        },
      ],
    },
    services: {
      eyebrow: "What we do",
      title: "Our services",
      lede: "Complete solutions to refresh every exterior surface on your property — residential and commercial.",
      landscaping: {
        title: "Landscaping",
        text: "Lawns, planting, edging, and seasonal care for homes and commercial sites that need a clean, finished look.",
        imageAlt: "Landscaping service",
      },
      pressureWashing: {
        title: "Pressure Washing",
        text: "Driveways, walkways, patios, siding, and decks refreshed for residential and commercial properties.",
        imageAlt: "Pressure washing service",
      },
      windowWashing: {
        title: "Window Washing",
        text: "Interior and exterior glass cleaned with care for brighter views at home or on the job site.",
        imageAlt: "Window washing service",
      },
    },
    portfolio: {
      eyebrow: "Recent work",
      title: "Portfolio",
      lede: "Scroll through each service and drag the slider to compare before and after.",
      residentialCommercial: "Residential & commercial",
      landscaping: "Landscaping",
      pressureWashing: "Pressure Washing",
      windowWashing: "Window Washing",
      dragCompare: "Drag to compare before and after for",
      previousProject: "Previous project",
      nextProject: "Next project",
      showProject: "Show project",
    },
    testimonials: {
      eyebrow: "Testimonials",
      title: "Client testimonials",
      viewOnGoogle: "View on Google",
      basedOnCount: "Based on {count} testimonials",
      loading: "Loading testimonials…",
      googleSummary: "Read what our clients say on Google.",
      basedOnGoogleCount: "Based on {count} testimonials (Google)",
      noneAvailable: "No testimonials available right now.",
      verifiedClient: "Verified client",
      googleReviewer: "Google review",
      seeAll: "See all testimonials",
      previousTestimonial: "Previous testimonial",
      nextTestimonial: "Next testimonial",
      starsLabel: "{rating} out of 5 stars",
    },
    contact: {
      eyebrow: "Get a quote",
      title: "Contact us",
      lede: "Send a quick message and we'll get back to you with a quote.",
      phoneLabel: "Phone",
      emailLabel: "Email",
      nameLabel: "Full name",
      namePlaceholder: "Your name",
      emailFieldLabel: "Email",
      emailPlaceholder: "you@example.com",
      phoneFieldLabel: "Phone",
      phonePlaceholder: "514-555-0100",
      servicesLabel: "Service",
      servicePlaceholder: "Optional",
      serviceLandscaping: "Landscaping",
      servicePressureWashing: "Pressure washing",
      serviceWindowWashing: "Window washing",
      serviceGeneral: "General inquiry",
      messageLabel: "Message",
      messagePlaceholder: "What do you need help with?",
      submit: "Send request",
      sendAnother: "Send another message",
      sending: "Sending…",
      successTitle: "Thank you",
      successMessage:
        "Your message was sent. We will contact you shortly.",
      errorMessage:
        "Something went wrong. Please try again or call us directly.",
      required: "This field is required.",
      invalidEmail: "Enter a valid email address.",
    },
    footer: {
      homeAria: "Stornway Group home",
      description:
        "Professional landscaping, pressure washing, and window washing for residential and commercial properties.",
      socialLinks: "Social links",
      company: "Company",
      services: "Services",
      rights: "All rights reserved.",
    },
    language: {
      toggleLabel: "Language",
      english: "ENG",
      french: "FR",
    },
  },
  fr: {
    nav: {
      home: "Accueil",
      services: "Services",
      portfolio: "Portfolio",
      testimonials: "Témoignages",
      contact: "Contact",
    },
    hero: {
      titleLine1: "Entretien extérieur ",
      titleLine2: "bien fait",
      lede: "Aménagement paysager, lavage à pression et lavage de vitres réalisés avec soin et exécution impeccable.",
      contactUs: "Contactez-nous",
      viewServices: "Voir les services",
    },
    intro: {
      title: "Entretien extérieur pensé pour votre propriété",
      lead: "Chaque visite est planifiée avec soin pour des pelouses, surfaces dures et vitres impeccables — résidentiel et commercial.",
      body: "Stornway Group regroupe l'aménagement paysager, le lavage à pression et le lavage de vitres sous une même équipe fiable. De l'entretien régulier aux rafraîchissements saisonniers, nous arrivons préparés, travaillons efficacement et laissons votre propriété impeccable.",
      learnMore: "En savoir plus",
      stats: [
        {
          label: "Projets",
          value: "200+",
          description:
            "Mandats résidentiels et commerciaux livrés avec attention aux détails.",
        },
        {
          label: "Clients",
          value: "100+",
          description:
            "Propriétaires et entreprises qui nous confient l'entretien extérieur.",
        },
        {
          label: "Années",
          value: "6+",
          description:
            "Années d'expérience en aménagement paysager et nettoyage de surfaces.",
        },
        {
          label: "Services clés",
          value: "3",
          description:
            "Aménagement paysager, lavage à pression et lavage de vitres, une seule équipe.",
        },
      ],
    },
    services: {
      eyebrow: "Ce que nous faisons",
      title: "Nos services",
      lede: "Des solutions complètes pour rafraîchir chaque surface extérieure de votre propriété — résidentielle et commerciale.",
      landscaping: {
        title: "Aménagement paysager",
        text: "Pelouses, plantation, bordures et entretien saisonnier pour des propriétés résidentielles et commerciales.",
        imageAlt: "Service d'aménagement paysager",
      },
      pressureWashing: {
        title: "Lavage à pression",
        text: "Entrées, trottoirs, patios, revêtements et terrasses rafraîchis pour propriétés résidentielles et commerciales.",
        imageAlt: "Service de lavage à pression",
      },
      windowWashing: {
        title: "Lavage de vitres",
        text: "Vitres intérieures et extérieures nettoyées avec soin pour des vues plus lumineuses.",
        imageAlt: "Service de lavage de vitres",
      },
    },
    portfolio: {
      eyebrow: "Travaux récents",
      title: "Portfolio",
      lede: "Parcourez chaque service et faites glisser le curseur pour comparer avant et après.",
      residentialCommercial: "Résidentiel et commercial",
      landscaping: "Aménagement paysager",
      pressureWashing: "Lavage à pression",
      windowWashing: "Lavage de vitres",
      dragCompare: "Glisser pour comparer avant et après pour",
      previousProject: "Projet précédent",
      nextProject: "Projet suivant",
      showProject: "Afficher le projet",
    },
    testimonials: {
      eyebrow: "Témoignages",
      title: "Témoignages clients",
      viewOnGoogle: "Voir sur Google",
      basedOnCount: "Basé sur {count} témoignages",
      loading: "Chargement des témoignages…",
      googleSummary: "Lisez ce que nos clients disent sur Google.",
      basedOnGoogleCount: "Basé sur {count} témoignages (Google)",
      noneAvailable: "Aucun témoignage disponible pour le moment.",
      verifiedClient: "Client vérifié",
      googleReviewer: "Avis Google",
      seeAll: "Voir tous les témoignages",
      previousTestimonial: "Témoignage précédent",
      nextTestimonial: "Témoignage suivant",
      starsLabel: "{rating} sur 5 étoiles",
    },
    contact: {
      eyebrow: "Obtenir un devis",
      title: "Contactez-nous",
      lede: "Envoyez-nous un message et nous vous répondrons avec un devis.",
      phoneLabel: "Téléphone",
      emailLabel: "Courriel",
      nameLabel: "Nom complet",
      namePlaceholder: "Votre nom",
      emailFieldLabel: "Courriel",
      emailPlaceholder: "vous@exemple.com",
      phoneFieldLabel: "Téléphone",
      phonePlaceholder: "514-555-0100",
      servicesLabel: "Service",
      servicePlaceholder: "Facultatif",
      serviceLandscaping: "Aménagement paysager",
      servicePressureWashing: "Lavage à pression",
      serviceWindowWashing: "Lavage de vitres",
      serviceGeneral: "Demande générale",
      messageLabel: "Message",
      messagePlaceholder: "En quoi pouvons-nous vous aider?",
      submit: "Envoyer la demande",
      sendAnother: "Envoyer un autre message",
      sending: "Envoi…",
      successTitle: "Merci",
      successMessage:
        "Votre message a été envoyé. Nous vous contacterons sous peu.",
      errorMessage:
        "Une erreur est survenue. Réessayez ou appelez-nous directement.",
      required: "Ce champ est obligatoire.",
      invalidEmail: "Entrez une adresse courriel valide.",
    },
    footer: {
      homeAria: "Accueil Stornway Group",
      description:
        "Aménagement paysager, lavage à pression et lavage de vitres professionnels pour propriétés résidentielles et commerciales.",
      socialLinks: "Réseaux sociaux",
      company: "Entreprise",
      services: "Services",
      rights: "Tous droits réservés.",
    },
    language: {
      toggleLabel: "Langue",
      english: "ENG",
      french: "FR",
    },
  },
};

export function formatTranslation(
  template: string,
  values: Record<string, string | number>,
): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) =>
    String(values[key] ?? ""),
  );
}
