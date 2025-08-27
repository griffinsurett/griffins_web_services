// src/Sections/TechStack.jsx
import React, { useState } from "react";
import Heading from "../components/Heading";
import BorderTitle from "../components/BorderTitle";
import SmoothScrollCarousel from "../components/Carousels/SmoothScrollCarousel";
import TechStackLabel from "../components/LoopComponents/TechStackLabel";

// Simple Icons + Font Awesome (brands)
import {
  SiAstro,
  SiNextdotjs,
  SiReact,
  SiGatsby,
  SiSvelte,
  SiShopify,
  SiWordpress,
  SiElementor,
  SiWebflow,
  SiFramer,
  SiVercel,
  SiGithub,
  SiNodedotjs,
  // NEW:
  SiHtml5,
  SiCss3,
  SiJavascript,
} from "react-icons/si";
import { FaAws, FaFigma, FaCloudflare, FaPhp, FaPython } from "react-icons/fa";

export default function TechStack() {
  const [hoveredTech, setHoveredTech] = useState(null);
  const iconClass = "w-8 h-8"; // global icon size

  const technologies = [
    // NEW: Core web platform
    { name: "HTML",        icon: <SiHtml5 className={iconClass} aria-hidden /> },
    { name: "CSS",         icon: <SiCss3 className={iconClass} aria-hidden /> },
    { name: "JavaScript",  icon: <SiJavascript className={iconClass} aria-hidden /> }, // Vanilla JS

    // Existing stack
    { name: "Astro",       icon: <SiAstro className={iconClass} aria-hidden /> },
    { name: "Next.js",     icon: <SiNextdotjs className={iconClass} aria-hidden /> },
    { name: "React",       icon: <SiReact className={iconClass} aria-hidden /> },
    { name: "PHP",         icon: <FaPhp className={iconClass} aria-hidden /> },
    { name: "Node.js",     icon: <SiNodedotjs className={iconClass} aria-hidden /> },
    { name: "Gatsby",      icon: <SiGatsby className={iconClass} aria-hidden /> },
    { name: "Svelte",      icon: <SiSvelte className={iconClass} aria-hidden /> },
    { name: "Shopify",     icon: <SiShopify className={iconClass} aria-hidden /> },
    { name: "WordPress",   icon: <SiWordpress className={iconClass} aria-hidden /> },
    { name: "Elementor",   icon: <SiElementor className={iconClass} aria-hidden /> },
    { name: "Webflow",     icon: <SiWebflow className={iconClass} aria-hidden /> },
    { name: "Figma",       icon: <FaFigma className={iconClass} aria-hidden /> },
    { name: "Framer",      icon: <SiFramer className={iconClass} aria-hidden /> },
    { name: "Vercel",      icon: <SiVercel className={iconClass} aria-hidden /> },
    { name: "Cloudflare",  icon: <FaCloudflare className={iconClass} aria-hidden /> },
    { name: "GitHub",      icon: <SiGithub className={iconClass} aria-hidden /> },
    { name: "Python",      icon: <FaPython className={iconClass} aria-hidden /> },
    { name: "AWS",         icon: <FaAws className={iconClass} aria-hidden /> },
  ];

  const DEFAULT_BEFORE = "We've mastered ";
  const DEFAULT_HEADING_TEXT = "the tools that matter.";

  const handleTechHover = (techName) => setHoveredTech(techName);
  const handleTechLeave = () => setHoveredTech(null);

  return (
    <section className="outer-section bg-bg relative overflow-hidden" id="tech-stack">
      <div className="inner-section text-center lg:text-left">
        <BorderTitle>Our Tech Stack</BorderTitle>

        <div className="flex flex-col lg:grid lg:grid-cols-[1fr_2fr] gap-4 lg:gap-8 items-center">
          {/* Left: heading */}
          <div className="w-sm">
            <div className="relative inline-block mb-6 leading-tight">
              <Heading
                tagName="h2"
                before={DEFAULT_BEFORE}
                beforeClass="text-heading block lg:inline"
                text={DEFAULT_HEADING_TEXT}
                textClass={`text-heading block lg:inline transition-opacity duration-150 ${
                  hoveredTech ? "opacity-0" : "opacity-100"
                }`}
              />
              <div
                className={`absolute inset-0 transition-opacity duration-150 ${
                  hoveredTech ? "opacity-100" : "opacity-0 pointer-events-none"
                }`}
              >
                <Heading
                  tagName="h2"
                  before={DEFAULT_BEFORE}
                  beforeClass="text-heading block lg:inline"
                  text={hoveredTech || ""}
                  textClass="text-accent block lg:inline"
                />
              </div>
            </div>
          </div>

          {/* Right: Smooth scroll carousel */}
          <SmoothScrollCarousel
            items={technologies}
            startDelay={5000}
            renderItem={(tech, index) => (
              <TechStackLabel
                key={`${tech.name}-${index}`}
                tech={tech}
                index={index}
                onTechHover={handleTechHover}
                onTechLeave={handleTechLeave}
              />
            )}
            speed={30}
            gap={32}
            itemWidth={120}
            autoplay={true}
            pauseOnHover={true}
            pauseOnEngage={true}
            gradientMask={true}
            gradientWidth={{ base: 48, md: 30 }}
            className="relative w-full h-[84px] md:h-[96px]"
          />
        </div>
      </div>
    </section>
  );
};