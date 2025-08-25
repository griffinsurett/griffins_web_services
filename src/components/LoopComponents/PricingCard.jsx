// src/components/LoopComponents/PricingCard.jsx
import React from "react";
import AnimatedBorder from "../AnimatedBorder/AnimatedBorder";
import Button from "../Buttons/Button";
import CheckListItem from "./CheckListItem";
// astro ready

export default function PricingCard({
  data,
  className = "",
  ringDuration = 800,
  featured = false,
}) {
  const {
    icon,
    title,
    description,
    price,
    period = "monthly",
    features,
    buttonText = "Choose Plan",
    buttonVariant = "primary",
  } = data;

  return (
    <div className={`group relative ${className}`}>
      {/* Featured badge */}
      {featured && (
        <div className="absolute -top-1.5 left-0 transform z-30">
          <div className="bg-accent text-primary-dark px-4 py-1 rounded-full text-sm font-semibold">
            Most Popular
          </div>
        </div>
      )}

{/* client visible */}
      <AnimatedBorder
        variant="progress-b-f"
        triggers={featured ? "visible" : "hover"}
        duration={ringDuration}
        borderRadius="rounded-3xl"
        borderWidth={featured ? 3 : 2}
        color="var(--color-accent)"
        className={`h-full outer-card-transition !duration-[900ms] ease-out ${
          featured ? "scale-105" : ""
        }`}
        innerClassName="h-full px-8 py-8 lg:px-10 lg:py-10 relative flex flex-col"
      >
        {/* Inner gradient overlay - shows accent hint on hover */}
        <div className="inner-card-style inner-card-transition inner-card-color" />

        <div className="relative z-10 flex flex-col h-full">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="icon-large mb-4 card-icon-color mx-auto">
              {icon}
            </div>
            <h4 className="h3 mb-3">{title}</h4>

            {/* Price */}
            {price && (
              <div className="mb-4">
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl lg:text-5xl font-bold text-accent">
                    ${price}
                  </span>
                  <span className="text-lg text-muted">/{period}</span>
                </div>
              </div>
            )}

            <p className="text-text leading-relaxed">{description}</p>
          </div>

          {/* Features */}
          <div className="flex-grow mb-8">
            <div className="space-y-3">
              {features?.map((feature, featureIdx) => (
                <CheckListItem key={featureIdx}>{feature}</CheckListItem>
              ))}
            </div>
          </div>

          {/* CTA Button */}
          <div className="mt-auto">
            <Button variant={buttonVariant} className="w-full justify-center">
              {buttonText}
            </Button>
          </div>
        </div>
      </AnimatedBorder>
    </div>
  );
}
