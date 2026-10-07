/**
 * Page titles and meta descriptions (UK migration design, "Titles and descriptions").
 *
 * - Kept URLs (`/`, `/products/`) carry the Legacy Site's `<title>` and meta description word for word.
 * - Every other page uses the commercial pattern `{Thing} for Sale UK | Karmod`.
 * - Exception: the Privacy Policy, a Kept URL with no Legacy title, sells nothing and takes a plain title.
 */

export interface PageSeoText {
  title: string;
  description: string;
}

export function commercialTitle(thing: string): string {
  return `${thing} for Sale UK | Karmod`;
}

export const PAGE_SEO = {
  home: {
    title: "Karmod International | Portable Buildings and Cabins",
    description:
      "Leading the Future of Modular Construction. Discover Innovative Solutions at Karmod International. Build with Confidence.",
  },
  products: {
    title: "Innovative Solutions: Discover Karmod International's Products",
    description:
      "Explore Karmod International's cutting-edge products, designed to address diverse needs. Elevate your projects with our innovative solutions.",
  },
  solutions: {
    title: commercialTitle("Modular Building Solutions"),
    description:
      "Modular building solutions for sale UK: Karmod cabins, kiosks and gatehouses for construction sites, events, schools and more, in the sizes you need.",
  },
  gallery: {
    title: commercialTitle("Portable Cabins and Modular Buildings"),
    description:
      "Portable cabins and modular buildings for sale UK, as delivered by Karmod: containers, kiosks, gatehouses and bulletproof cabins on real projects.",
  },
  about: {
    title: commercialTitle("Modular and Prefabricated Buildings"),
    description:
      "Modular and prefabricated buildings for sale UK from Karmod, manufacturer of portable cabins, kiosks and gatehouses since 1986. Our story and mission.",
  },
  contact: {
    title: commercialTitle("Portable Cabins, Kiosks and Gatehouses"),
    description:
      "Portable cabins, kiosks and gatehouses for sale UK. Contact Karmod for prices, specifications and a quote by phone, WhatsApp, email or online form.",
  },
  // Kept URL without a Legacy title (the Legacy page answers 404), and nothing for sale: a plain title.
  privacyPolicy: {
    title: "Privacy Policy | Karmod International",
    description:
      "How Karmod International Ltd collects, uses, stores and protects your personal data when you enquire, request a quotation or buy from us.",
  },
} as const satisfies Record<string, PageSeoText>;

interface SolutionSeoInput {
  name: string;
  seo?: { metaTitle?: string; metaDescription?: string };
}

/** A Solution's own Studio SEO fields win; otherwise the commercial pattern built from its name. */
export function solutionPageSeo(solution: SolutionSeoInput): PageSeoText {
  return {
    title: solution.seo?.metaTitle?.trim() || commercialTitle(solution.name),
    description:
      solution.seo?.metaDescription?.trim() ||
      `${solution.name} for sale UK from Karmod. Pick the units and sizes you need, configure them online and request a quote.`,
  };
}

interface ProductLineSeoInput {
  name: string;
  description: string;
  seo?: { metaTitle?: string; metaDescription?: string };
}

/**
 * A Product Line is a Kept URL: its Studio SEO fields hold the Legacy title and description word
 * for word. The commercial pattern and its short description are only a fallback for a blank field.
 */
export function productLinePageSeo(line: ProductLineSeoInput): PageSeoText {
  return {
    title: line.seo?.metaTitle?.trim() || commercialTitle(line.name),
    description: line.seo?.metaDescription?.trim() || line.description,
  };
}
