
// src/hooks/useScrollTriggeredLottie.js
import { useEffect, useRef, useState } from "react";
import lottie from "lottie-web";

export function useScrollTriggeredLottie(
  containerRef,
  animationPath, // Path to your Lottie JSON file
  options = {}
) {
  const {
    loop = false,
    autoplay = false,
    scrollSensitivity = 0.5, // How fast animation progresses with scroll
  } = options;

  const [activated, setActivated] = useState(false);
  const animationRef = useRef(null);
  const lastScrollY = useRef(0);
  const currentFrame = useRef(0);

  // Initialize Lottie animation
  useEffect(() => {
    if (!containerRef.current) return;

    animationRef.current = lottie.loadAnimation({
      container: containerRef.current,
      renderer: "svg", // or 'canvas' for better performance
      loop: false, // We'll control looping manually
      autoplay: false, // We'll control playback manually
      path: animationPath,
    });

    // Start from first frame
    animationRef.current.goToAndStop(0, true);

    return () => {
      animationRef.current?.destroy();
    };
  }, [animationPath, containerRef]);

  // Handle scroll
  useEffect(() => {
    const handleScroll = () => {
      const anim = animationRef.current;
      if (!anim) return;

      const currentScrollY = window.pageYOffset || window.scrollY;
      const deltaY = currentScrollY - lastScrollY.current;
      lastScrollY.current = currentScrollY;

      // First scroll down - activate
      if (!activated && deltaY > 0) {
        setActivated(true);
      }

      if (!activated) return;

      const totalFrames = anim.totalFrames;
      
      // Calculate frame change based on scroll
      const frameChange = deltaY * scrollSensitivity;
      currentFrame.current += frameChange;

      // Handle looping
      if (currentFrame.current >= totalFrames) {
        currentFrame.current = currentFrame.current % totalFrames;
      } else if (currentFrame.current < 0) {
        currentFrame.current = totalFrames + (currentFrame.current % totalFrames);
      }

      // Set the animation to the exact frame
      anim.goToAndStop(currentFrame.current, true);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    lastScrollY.current = window.pageYOffset || window.scrollY;

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [activated, scrollSensitivity]);

  return {
    activated,
    animation: animationRef.current,
  };
}

// ──────────────────────────────────────────────────────────────
// Alternative: Even simpler version with direct play/reverse
// ──────────────────────────────────────────────────────────────

export function useScrollTriggeredLottieSimple(
  containerRef,
  animationPath,
  options = {}
) {
  const {
    speed = 0.5,
    activateOnFirstScroll = true,
  } = options;

  const [activated, setActivated] = useState(false);
  const animationRef = useRef(null);
  const pauseTimeout = useRef(null);
  const lastDirection = useRef(null);

  // Initialize Lottie
  useEffect(() => {
    if (!containerRef.current) return;

    animationRef.current = lottie.loadAnimation({
      container: containerRef.current,
      renderer: "svg",
      loop: true,
      autoplay: false,
      path: animationPath,
    });

    animationRef.current.setSpeed(speed);

    return () => {
      animationRef.current?.destroy();
    };
  }, [animationPath, containerRef, speed]);

  // Handle scroll events
  useEffect(() => {
    const handleScroll = () => {
      const anim = animationRef.current;
      if (!anim) return;

      const currentScrollY = window.pageYOffset || window.scrollY;
      const lastScrollY = handleScroll.lastScrollY || 0;
      const deltaY = currentScrollY - lastScrollY;
      handleScroll.lastScrollY = currentScrollY;

      if (Math.abs(deltaY) < 1) return;

      // Activate on first scroll down
      if (!activated && deltaY > 0 && activateOnFirstScroll) {
        setActivated(true);
      }

      if (!activated && activateOnFirstScroll) return;

      clearTimeout(pauseTimeout.current);

      if (deltaY > 0) {
        // Scrolling down - play forward
        if (lastDirection.current !== 'forward') {
          anim.setDirection(1); // Forward
          anim.play();
          lastDirection.current = 'forward';
        }
      } else if (deltaY < 0) {
        // Scrolling up - play reverse
        if (lastDirection.current !== 'reverse') {
          anim.setDirection(-1); // Reverse
          anim.play();
          lastDirection.current = 'reverse';
        }
      }

      // Pause after inactivity
      pauseTimeout.current = setTimeout(() => {
        anim.pause();
        lastDirection.current = null;
      }, 100);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll.lastScrollY = window.pageYOffset || window.scrollY;

    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(pauseTimeout.current);
    };
  }, [activated, activateOnFirstScroll]);

  return {
    activated,
    animation: animationRef.current,
  };
}