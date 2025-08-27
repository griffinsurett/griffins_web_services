// src/siteData.js - Compatible with both Astro and React
const siteDomain = import.meta.env.PUBLIC_SITE_DOMAIN || 'griffinswebservices.com';

export const siteData = {
  title: "Griffin's Web Services",
  legalName: "Griffin's Web Services LLC",
  description: "Professional website development services. Lightning-fast, secure, and mobile-first websites that convert visitors into customers. Get 50% off your first project!",
  url: `https://${siteDomain}`,
  email: "hello@griffinsweb.com",
  phone: "(123) 456-7890",
};

// Contact items using unified astro-icon naming
export const contactItems = [
  {
    type: "email",
    label: "hello@griffinsweb.com",
    href: "mailto:hello@griffinsweb.com",
    icon: "mail", // lucide icon name
  },
  {
    type: "phone",
    label: "(123) 456-7890", 
    href: "tel:+1234567890",
    icon: "phone", // lucide icon name
  },
];

// Social media links using unified astro-icon naming
export const socialMediaLinks = [
  {
    name: "LinkedIn",
    href: "#linkedin",
    icon: "linkedin", // lucide icon name
  },
  {
    name: "Twitter",
    href: "#twitter", 
    icon: "twitter", // lucide icon name
  },
  {
    name: "GitHub",
    href: "#github",
    icon: "github", // lucide icon name
  },
  {
    name: "Instagram", 
    href: "#instagram",
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