// src/components/Logo/LottieLogo.jsx
// Simplified logo component using the new OptimizedLottie

import OptimizedLottie from "../OptimizedLottie.jsx";

export default function LottieLogo({
  alt = "Griffin's Web Services Animated Logo",
  className = "logo-class",
  mediaClasses = "block w-[40px] h-[40px] lg:w-[45px] lg:h-[45px] object-contain",
  loading = "lazy",
  trigger = "auto",
  respectReducedMotion = true,
  fadeMs = 180,
  children, // Astro <Image /> passed from parent
}) {
  // Logo-specific animation path
  const logoAnimationPath = new URL("../../Lotties/Animation_logo_small_size.json", import.meta.url).href;
  
  // Logo-specific Lottie configuration
  const logoLottieOptions = {
    renderer: "svg",
    loop: true,
    autoplay: false,
    speed: 0.5,
  };
  
  // Logo-specific trigger options
  const logoTriggerOptions = {
    trigger,
    loading,
  };
  
  // Logo-specific interaction options
  const logoInteractionOptions = {
    scrollThreshold: 1,
    debounceDelay: 8,
    wheelSensitivity: 1,
    pauseDelay: 200,
    enableScrollDrive: true,
    enableWheelDrive: true,
  };

  return (
    <OptimizedLottie
      animationData={logoAnimationPath}
      className={className}
      mediaClasses={mediaClasses}
      alt={alt}
      lottieOptions={logoLottieOptions}
      triggerOptions={logoTriggerOptions}
      interactionOptions={logoInteractionOptions}
      respectReducedMotion={respectReducedMotion}
      fadeMs={fadeMs}
    >
      {children}
    </OptimizedLottie>
  );
}