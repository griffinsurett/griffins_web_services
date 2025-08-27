// src/components/Logo/LottieLogo.jsx
// Simplified logo component using the reusable OptimizedLottie

import OptimizedLottie from "../OptimizedLottie.jsx";

export default function LottieLogo({
  alt = "",
  className = "logo-class",
  mediaClasses = "block w-[40px] h-[40px] lg:w-[45px] lg:h-[45px] object-contain",
  loading = "lazy",
  trigger = "auto",
  respectReducedMotion = true,
  fadeMs = 180,
  children, // Astro <Image /> passed from parent (poster)
}) {
  return (
    <OptimizedLottie
      animationUrl={new URL("../../Lotties/Animation_logo_small_size.json", import.meta.url)}
      alt={alt}
      className={className}
      containerClasses={`relative ${mediaClasses}`}
      trigger={trigger}
      respectReducedMotion={respectReducedMotion}
      fadeMs={fadeMs}
      
      // Animation settings optimized for logo
      loop={true}
      autoplay={false}
      speed={0.5}
      renderer="svg"
      
      // Performance settings
      scrollThreshold={1}
      debounceDelay={8}
      wheelSensitivity={1}
    >
      {children}
    </OptimizedLottie>
  );
}