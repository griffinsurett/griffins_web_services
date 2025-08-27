// src/Sections/TechStack.jsx
import React, { useState, useEffect } from "react";
import SmoothScrollCarousel from "../components/Carousels/SmoothScrollCarousel";
import TechStackLabel from "../components/LoopComponents/TechStackLabel";

export default function TechStack({ technologies = [] }) {
  const [hoveredTech, setHoveredTech] = useState(null);
  const [iconElements, setIconElements] = useState([]);

  // Extract Astro-rendered icons from template on mount
  useEffect(() => {
    const template = document.getElementById('tech-icons-template');
    if (template) {
      const icons = Array.from(template.content.querySelectorAll('[data-tech-name]'));
      const iconMap = {};
      
      icons.forEach(iconEl => {
        const techName = iconEl.dataset.techName;
        if (techName) {
          // Clone the icon element for React to use
          iconMap[techName] = iconEl.innerHTML;
        }
      });
      
      setIconElements(iconMap);
    }
  }, []);

  // Update Astro-rendered heading when hover state changes
  useEffect(() => {
    const headingText = document.getElementById('tech-heading-text');
    const headingOverlay = document.getElementById('tech-heading-overlay');
    const headingDynamic = document.getElementById('tech-heading-dynamic');
    
    if (headingText && headingOverlay && headingDynamic) {
      if (hoveredTech) {
        headingText.style.opacity = '0';
        headingOverlay.style.opacity = '1';
        headingDynamic.textContent = hoveredTech;
      } else {
        headingText.style.opacity = '1';
        headingOverlay.style.opacity = '0';
        headingDynamic.textContent = '';
      }
    }
  }, [hoveredTech]);

  const handleTechHover = (techName) => setHoveredTech(techName);
  const handleTechLeave = () => setHoveredTech(null);

  // Create React elements with Astro icons
  const techElements = technologies.map((tech, index) => (
    <TechStackLabel
      key={`${tech.name}-${index}`}
      name={tech.name}
      index={index}
      onTechHover={handleTechHover}
      onTechLeave={handleTechLeave}
    >
      {/* Render the Astro icon as dangerouslySetInnerHTML */}
      {iconElements[tech.name] ? (
        <div
          dangerouslySetInnerHTML={{
            __html: iconElements[tech.name]
          }}
        />
      ) : (
        // Fallback while icons are loading
        <div className="w-8 h-8 bg-accent/20 rounded animate-pulse" />
      )}
    </TechStackLabel>
  ));

  return (
    <SmoothScrollCarousel
      startDelay={5000}
      speed={30}
      gap={32}
      itemWidth={120}
      autoplay={true}
      pauseOnHover={true}
      pauseOnEngage={true}
      gradientMask={true}
      gradientWidth={{ base: 48, md: 30 }}
      className="relative w-full h-[84px] md:h-[96px]"
    >
      {techElements}
    </SmoothScrollCarousel>
  );
}