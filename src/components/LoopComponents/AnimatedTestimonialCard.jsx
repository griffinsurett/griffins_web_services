// src/components/LoopComponents/AnimatedTestimonialCard.jsx
import React from "react";
import TestimonialCard from "./TestimonialCard.jsx";
import AnimatedElementWrapper from "../AnimatedElementWrapper.jsx";

// Wrap with as many layers as you like here
const STAGGER_MS = 120;

export default function AnimatedTestimonialCard({ data, index = 0 }) {
  return (
    <AnimatedElementWrapper
      variant="scale-in"
      animationDuration={600}
      animationDelay={index * STAGGER_MS}
      threshold={0.2}
      rootMargin="0px 0px -50px 0px"
      once={false}
    >
      <TestimonialCard data={data} />
    </AnimatedElementWrapper>
  );
}
