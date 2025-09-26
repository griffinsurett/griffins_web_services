// Testimonials.jsx
import React from "react";
import TestimonialCard from "../LoopComponents/TestimonialCard";
import BorderTitle from "../BorderTitle";
import Carousel from "../Carousels/Carousel";
import Heading from "../Heading";
import AnimatedElementWrapper from "../AnimatedElementWrapper";

// astro ready

export default function Testimonials({ data }) {
  const STAGGER_MS = 120;

  return (
    <div className="inner-section">
      <div className="text-section">
        {/* client idle */}
        <BorderTitle>Testimonials</BorderTitle>
        <Heading
          tagName="h2"
          className="mb-6"
          before="What Our "
          text="Clients Say"
          textClass="emphasized-text"
        />
        <p className="large-text">
          Don't just take our word for it - hear from businesses who've
          transformed...
        </p>
      </div>

      {/* client visible */}
      <Carousel
        items={data}
        // If your Carousel passes (item, index) to renderItem, use i for a stagger
        renderItem={(t, i = 0) => (
          // client visible
          <AnimatedElementWrapper
            variant="scale-in"
            animationDuration={600}
            animationDelay={i * STAGGER_MS}
            threshold={0.2}
            rootMargin="0px 0px -50px 0px"
            once={false}
          >
            <TestimonialCard data={t} />
          </AnimatedElementWrapper>
        )}
        slidesPerView={{ base: 1, md: 2 }}
        gap={32}
        autoplay
        autoAdvanceDelay={4500}
        showArrows={false}
        showDots
        drag={false}
      />
    </div>
  );
}
