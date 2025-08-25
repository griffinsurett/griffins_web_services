// src/Sections/TechStack.jsx - Updated for unified Astro Icon approach
import React, { useState } from "react";
import Heading from "../components/Heading";
import BorderTitle from "../components/BorderTitle";
import SmoothScrollCarousel from "../components/Carousels/SmoothScrollCarousel";
import TechStackLabel from "../components/LoopComponents/TechStackLabel";

// Using Icon component from Astro Icon in React components
import { Icon } from 'astro-icon/components';

const TechStack = () => {
  // Hovered tech label to show in overlay
  const [hoveredTech, setHoveredTech] = useState(null);

  const iconClass = "w-8 h-8"; // adjust globally here

  // Updated to use astro-icon naming convention
  const technologies = [
    { name: "Astro",       icon: "simple-icons:astro" },
    { name: "Next.js",     icon: "simple-icons:nextdotjs" },
    { name: "React",       icon: "simple-icons:react" },
    { name: "Gatsby",      icon: "simple-icons:gatsby" },
    { name: "Svelte",      icon: "simple-icons:svelte" },
    { name: "Shopify",     icon: "simple-icons:shopify" },
    { name: "WordPress",   icon: "simple-icons:wordpress" },
    { name: "Elementor",   icon: "simple-icons:elementor" },
    { name: "PHP",         icon: "fa6-brands:php" },
    { name: "Webflow",     icon: "simple-icons:webflow" },
    { name: "Figma",       icon: "fa6-brands:figma" }, 
    { name: "Framer",      icon: "simple-icons:framer" },
    { name: "Vercel",      icon: "simple-icons:vercel" },
    { name: "Cloudflare",  icon: "fa6-brands:cloudflare" },
    { name: "GitHub",      icon: "simple-icons:github" },
    { name: "Node.js",     icon: "simple-icons:nodedotjs" },
    { name: "Python",      icon: "fa6-brands:python" },
    { name: "AWS",         icon: "fa6-brands:aws" },
  ];

  const DEFAULT_BEFORE = "We've mastered ";
  const DEFAULT_HEADING_TEXT = "the tools that matter.";

  // Simple callbacks for tech hover/leave
  const handleTechHover = (techName) => {
    setHoveredTech(techName);
  };

  const handleTechLeave = () => {
    setHoveredTech(null);
  };

  return (
    <section className="outer-section bg-bg relative overflow-hidden" id="tech-stack">
      <div className="inner-section text-center lg:text-left">
        <BorderTitle>Our Tech Stack</BorderTitle>

        <div className="flex flex-col lg:grid lg:grid-cols-[1fr_2fr] gap-4 lg:gap-8 items-center">
          {/* Left side - Text content */}
          <div className="w-sm">
            <div className="relative inline-block mb-6 leading-tight">
              {/* Base heading IN FLOW — stays text-heading */}
              <Heading
                tagName="h2"
                before={DEFAULT_BEFORE}
                beforeClass="text-heading block lg:inline"
                text={DEFAULT_HEADING_TEXT}
                textClass={`text-heading block lg:inline transition-opacity duration-150 ${
                  hoveredTech ? "opacity-0" : "opacity-100"
                }`}
              />

              {/* Overlay heading — ONLY the tech label uses text-accent */}
              <div
                className={`absolute inset-0 transition-opacity duration-150 ${
                  hoveredTech ? "opacity-100" : "opacity-0 pointer-events-none"
                }`}
              >
                <Heading
                  tagName="h2"
                  before={DEFAULT_BEFORE}
                  beforeClass="text-heading block lg:inline" // "We've mastered" stays heading color
                  text={hoveredTech || ""}                   // tech name
                  textClass="text-accent block lg:inline"    // accent color for the tech text
                />
              </div>
            </div>
          </div>

          {/* Right side - Smooth Scroll Carousel */}
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
            className="relative w-full h-[84px] md:h-[96px]" // reserves carousel lane height
          />
        </div>
      </div>
    </section>
  );
};

export default TechStack;