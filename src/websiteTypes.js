// src/data/websiteTypes.js
import demoVideo from "./assets/Black-Microwave-Earrape.mp4";

/**
 * Master list of website types used across the app.
 * - `key` is the stable identifier (used in forms / routing)
 * - `title`, `description`, `icon` power UI
 * - `videoSrc` optional; currently using a shared demo clip
 */
export const WEBSITE_TYPES = [
  {
    key: "landing-page",
    icon: "🚀",
    title: "Landing Pages",
    description:
      "High-converting single-page websites designed to capture leads and drive specific actions for your marketing campaigns.",
    videoSrc: demoVideo,
  },
    {
    key: "micro-site",
    icon: "📄",
    title: "Micro Sites",
    description:
      "Single-purpose websites designed to achieve specific marketing goals, often with minimal content and a focused user experience.",
    videoSrc: demoVideo,
  },
  {
    key: "custom-website",
    icon: "🛠️",
    title: "Custom Websites",
    description:
      "Fully custom sites built around your brand and workflow—unique UX, motion, integrations, and back-end logic tailored end-to-end.",
    videoSrc: demoVideo,
  },
  {
    key: "small-business",
    icon: "🏢",
    title: "Small Business Websites",
    description:
      "Professional websites that establish credibility and help local businesses attract and retain customers online.",
    videoSrc: demoVideo,
  },
  {
    key: "portfolio",
    icon: "💼",
    title: "Personal Portfolio Websites",
    description:
      "Showcase your work, skills, and achievements with a stunning portfolio that makes you stand out from the competition.",
    videoSrc: demoVideo,
  },
  {
    key: "blog",
    icon: "✍️",
    title: "Blogs",
    description:
      "Content-focused websites with easy-to-use publishing tools to share your expertise and build your audience.",
    videoSrc: demoVideo,
  },
  {
    key: "ecommerce",
    icon: "🛒",
    title: "E-Commerce Websites",
    description:
      "Complete online stores with shopping carts, secure payments, inventory management, and everything you need to sell online.",
    videoSrc: demoVideo,
  },
  {
    key: "restaurant",
    icon: "🤝",
    title: "Restaurant Websites",
    description:
      "Websites designed specifically for restaurants, featuring menus, reservations, and online ordering.",
    videoSrc: demoVideo,
  },
  {
    key: "corporate",
    icon: "🏛️",
    title: "Large Corporate Websites",
    description:
      "Enterprise-level websites with advanced functionality, multi-user management, and scalable architecture for growing companies.",
    videoSrc: demoVideo,
  },
  {
    key: "custom-app",
    icon: "⚙️",
    title: "Custom Full-Stack Applications",
    description:
      "Bespoke web applications tailored to your unique business processes, with custom databases and advanced functionality.",
    videoSrc: demoVideo,
  },
];

export default WEBSITE_TYPES;
