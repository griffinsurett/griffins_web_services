// src/components/AddOnServicesContainer.jsx - Pure interactive logic
import React, { useState } from "react";
import Heading from "./Heading";
import Button from "./Buttons/Button";
import FeatureCard from "./LoopComponents/FeatureCard";
import RadioTab from "./LoopComponents/RadioTab";
import AnimatedElementWrapper from "./AnimatedElementWrapper";

const AddOnServicesContainer = ({ categories }) => {
  const [activeTab, setActiveTab] = useState("branding");
  const handleTabChange = (e) => setActiveTab(e.target.value);

  // If categories not provided, return null (should be passed from Astro)
  if (!categories) {
    console.warn("AddOnServicesContainer: categories prop is required");
    return null;
  }

  return (
    <>
      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 lg:gap-auto justify-center lg:justify-between">
        {Object.entries(categories).map(([key, category]) => (
          <AnimatedElementWrapper
            key={key}
            variant="fade-in"
            animationDuration={600}
            animationDelay={key * 600}
            threshold={0.2}
            rootMargin="0px 0px -50px 0px"
            once={false}
          >
            <RadioTab
              key={key}
              id={`addon-tab-${key}`}
              name="addon-category"
              value={key}
              checked={activeTab === key}
              onChange={handleTabChange}
              category={category}
              size="sm"
            />
          </AnimatedElementWrapper>
        ))}
      </div>

      {/* Active Category Content */}
      <div className="transition-all duration-500 ease-in-out">
        {/* Services Grid - Only Active Category */}
        <div className="max-3-primary my-6">
          {categories[activeTab].services.map((service, index) => (
            <AnimatedElementWrapper
              key={index}
              variant="scale-in"
              animationDuration={600}
              animationDelay={index * 120}
              threshold={0.2}
              rootMargin="0px 0px -50px 0px"
              once={false}
            >
              {<FeatureCard
                data={service}
                ringDuration={service.featured ? 600 : 800}
              />}
            </AnimatedElementWrapper>
          ))}
        </div>

        {/* CTA Section */}
        <AnimatedElementWrapper
          variant="scale-in"
          animationDuration={600}
          threshold={0.2}
          rootMargin="0px 0px -50px 0px"
          once={false}
        >
          <div className="text-center p-8 card-bg rounded-2xl w-full mx-auto">
            <Heading tagName="h3" className="h3 mb-3">
              Interested in {categories[activeTab].title} Services?
            </Heading>
            <p className="secondary-text mb-6">
              Let's discuss how we can enhance your website with these premium
              features.
            </p>
            <Button variant="primary" href="#contact">
              Get a Custom Quote 💬
            </Button>
          </div>
        </AnimatedElementWrapper>
      </div>
    </>
  );
};

export default AddOnServicesContainer;