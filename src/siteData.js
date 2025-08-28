// src/siteData.js - Compatible with both Astro and React
const siteDomain = import.meta.env.PUBLIC_SITE_DOMAIN;

export const siteData = {
  title: "Griffin's Web Services",
  legalName: "Griffin's Web Services LLC",
  description: "Professional website development services. Lightning-fast, secure, and mobile-first websites that convert visitors into customers. Get 50% off your first project!",
  domain: siteDomain,
  url: `https://${siteDomain}`,
};

// Contact items using unified astro-icon naming
export const contactItems = [
  {
    type: "email",
    label: "griffin@griffinswebservices.com",
    href: "mailto:griffin@griffinswebservices.com",
    icon: "mail",
  },
  {
    type: "phone",
    label: "(732) 939-1309",
    href: "tel:+17329391309",
    icon: "phone",
  },
];

// Social media links using unified astro-icon naming
export const socialMediaLinks = [
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/in/griffin-surett/",
    icon: "linkedin", // lucide icon name
  },
  {
    name: "Twitter",
    href: "https://twitter.com/griffinsurett",
    icon: "twitter", // lucide icon name
  },
  {
    name: "GitHub",
    href: "https://github.com/griffinsurett",
    icon: "github", // lucide icon name
  },
  {
    name: "Instagram",
    href: "https://www.instagram.com/griffinsjoshs/",
    icon: "instagram", // lucide icon name
  },
];

// SEO defaults
export const seoDefaults = {
  title: siteData.title,
  description: siteData.description,
  image: "/og-image.jpg",
  imageAlt: "Griffin's Web Services - Professional Website Development",
  type: "website",
  locale: "en_US",
};