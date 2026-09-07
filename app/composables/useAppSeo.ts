import { useRuntimeConfig, useSeoMeta, useHead } from "#imports";
import {
  getCompanyPostalAddressSchema,
  COMPANY_CONTACT,
  COMPANY_SOCIAL,
} from "~/constants/company";
import { hasPublishablePrice } from "~~/shared/utils/priceLabel";

export interface PageSeoOptions {
  title: string;
  description: string;
  canonicalPath?: string;
  image?: string;
  type?: "website" | "article";
  noindex?: boolean;
  jsonLd?: Record<string, any> | Record<string, any>[];
}

export function useAppSeo() {
  const config = useRuntimeConfig();
  const siteUrl =
    (config.public.siteUrl as string) || "https://www.karmodint.co.uk";
  const defaultOgImage = `${siteUrl.replace(/\/$/, "")}/images/hero-building-kiosk.png`;

  function setPageSeo(options: PageSeoOptions) {
    const canonicalUrl = options.canonicalPath
      ? `${siteUrl.replace(/\/$/, "")}${options.canonicalPath.startsWith("/") ? options.canonicalPath : `/${options.canonicalPath}`}`
      : undefined;

    const imageUrl = options.image
      ? options.image.startsWith("http")
        ? options.image
        : `${siteUrl.replace(/\/$/, "")}${options.image.startsWith("/") ? options.image : `/${options.image}`}`
      : defaultOgImage;

    useSeoMeta({
      title: options.title,
      description: options.description,
      ogTitle: options.title,
      ogDescription: options.description,
      ogImage: imageUrl,
      ogUrl: canonicalUrl,
      ogType: options.type || "website",
      twitterTitle: options.title,
      twitterDescription: options.description,
      twitterImage: imageUrl,
      robots: options.noindex ? "noindex, nofollow" : "index, follow",
    });

    const headConfig: Record<string, any> = {};

    if (canonicalUrl) {
      headConfig.link = [{ rel: "canonical", href: canonicalUrl }];
    }

    if (options.jsonLd) {
      const schemas = Array.isArray(options.jsonLd)
        ? options.jsonLd
        : [options.jsonLd];
      headConfig.script = schemas.map((schema) => ({
        type: "application/ld+json",
        children: JSON.stringify(schema),
      }));
    }

    useHead(headConfig);
  }

  function getOrganizationSchema() {
    return {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "Karmod International",
      legalName: "Karmod International Ltd",
      url: siteUrl.replace(/\/$/, ""),
      logo: `${siteUrl.replace(/\/$/, "")}/images/karmod-logo.png`,
      description:
        "Specialist manufacturer of portable cabins, kiosks, security gatehouses, and modular building solutions across the UK and worldwide.",
      address: getCompanyPostalAddressSchema(),
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "sales and customer support",
        email: COMPANY_CONTACT.supportEmail,
        telephone: COMPANY_CONTACT.phoneDisplay,
        areaServed: ["GB", "Worldwide"],
        availableLanguage: ["English"],
      },
      sameAs: [
        COMPANY_SOCIAL.facebook,
        COMPANY_SOCIAL.linkedin,
        COMPANY_SOCIAL.pinterest,
        COMPANY_SOCIAL.instagram,
      ],
    };
  }

  function getWebSiteSchema() {
    return {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "Karmod International",
      url: siteUrl.replace(/\/$/, ""),
      description:
        "Engineered for durability, designed for efficiency. Premium modular and portable buildings across the UK.",
    };
  }

  function getProductSchema(product: {
    name: string;
    description?: string;
    image?: string;
    price?: number;
    isPoa?: boolean;
    specs?: string[];
  }) {
    const imageUrl = product.image
      ? product.image.startsWith("http")
        ? product.image
        : `${siteUrl.replace(/\/$/, "")}${product.image.startsWith("/") ? product.image : `/${product.image}`}`
      : undefined;

    const offers = hasPublishablePrice(product)
      ? {
          "@type": "Offer",
          price: product.price,
          priceCurrency: "GBP",
          availability: "https://schema.org/InStock",
          itemCondition: "https://schema.org/NewCondition",
          url: `${siteUrl.replace(/\/$/, "")}/products`,
          seller: {
            "@type": "Organization",
            name: "Karmod International",
          },
        }
      : undefined;

    return {
      "@context": "https://schema.org",
      "@type": "Product",
      name: product.name,
      description:
        product.description ||
        `Karmod ${product.name} modular building unit. ${product.specs ? product.specs.join(". ") : ""}`,
      image: imageUrl,
      brand: {
        "@type": "Brand",
        name: "Karmod International",
      },
      category: "Modular Buildings & Portable Cabins",
      ...(offers ? { offers } : {}),
    };
  }

  function getBreadcrumbSchema(items: { name: string; path: string }[]) {
    return {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: items.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.name,
        item: `${siteUrl.replace(/\/$/, "")}${item.path.startsWith("/") ? item.path : `/${item.path}`}`,
      })),
    };
  }

  return {
    siteUrl,
    setPageSeo,
    getOrganizationSchema,
    getWebSiteSchema,
    getProductSchema,
    getBreadcrumbSchema,
  };
}
