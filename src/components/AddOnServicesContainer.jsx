// src/components/AddOnServicesContainer.jsx
import React, { useState } from "react";
import Heading from "./Heading";
import Button from "./Buttons/Button";
import FeatureCard from "./LoopComponents/FeatureCard";
import RadioTab from "./LoopComponents/RadioTab";
import AnimatedElementWrapper from "./AnimatedElementWrapper";

const AddOnServicesContainer = () => {
  const [activeTab, setActiveTab] = useState("branding");
  const handleTabChange = (e) => setActiveTab(e.target.value);

  const categories = {
    branding: {
      title: "Branding",
      icon: "🎨",
      services: [
        {
          icon: "🎨",
          title: "Logo Design",
          description:
            "Custom logo design that captures your brand identity and makes a lasting impression.",
          featured: true,
        },
        {
          icon: "📋",
          title: "Full Brand Kit",
          description:
            "Complete branding package with colors, fonts, guidelines, and brand assets.",
          featured: true,
        },
        {
          icon: "📱",
          title: "Social Media Design Templates",
          description:
            "Professional templates for all your social media platforms and campaigns.",
          featured: true,
        },
        {
          icon: "✍️",
          title: "Content & Copywriting",
          description:
            "Engaging content and copy that speaks to your audience and drives conversions.",
          featured: false,
        },
      ],
    },
    marketing: {
      title: "Marketing",
      icon: "📈",
      services: [
        {
          icon: "🔍",
          title: "Search Engine Optimization (SEO)",
          description:
            "Boost your search rankings and drive organic traffic to your website.",
          featured: true,
        },
        {
          icon: "🤖",
          title: "AI Optimization (SEO for ChatGPT, etc.)",
          description:
            "Optimize your website for AI search engines and chatbot discovery.",
          featured: true,
        },
        {
          icon: "📲",
          title: "Social Media Account Setup",
          description:
            "Professional setup and optimization of your social media presence.",
          featured: true,
        },
        {
          icon: "🗺️",
          title: "Google Business Setup",
          description:
            "Complete Google My Business setup and optimization for local search.",
          featured: true,
        },
        {
          icon: "📘",
          title: "Meta (Facebook) Business Setup",
          description:
            "Professional Facebook and Instagram business account configuration.",
          featured: true,
        },
        {
          icon: "🎵",
          title: "TikTok Shop Setup",
          description:
            "E-commerce integration and setup for TikTok's shopping platform.",
          featured: true,
        },
        {
          icon: "📊",
          title: "Conversion Rate Optimization",
          description:
            "Analyze and improve your website's conversion performance.",
          featured: false,
        },
        {
          icon: "📱",
          title: "Social Media Design Templates",
          description:
            "Professional templates for all your social media platforms and campaigns.",
          featured: true,
        },
        {
          icon: "✍️",
          title: "Content & Copywriting",
          description:
            "Engaging content and copy that speaks to your audience and drives conversions.",
          featured: false,
        },
      ],
    },
    dataCollection: {
      title: "Data Collection",
      icon: "📊",
      services: [
        {
          icon: "📝",
          title: "Custom Forms",
          description:
            "Tailored forms for lead generation, surveys, and user feedback.",
          featured: false,
        },
        {
          icon: "🏷️",
          title: "Tracking Tag Integration",
          description:
            "Performance-minded implementation of analytics and tracking systems.",
          featured: true,
        },
      ],
    },
    dataManagement: {
      title: "Data Management",
      icon: "🗄️",
      services: [
        {
          icon: "📈",
          title: "Analytics Setup",
          description:
            "Complete analytics implementation for data-driven decision making.",
          featured: false,
        },
        {
          icon: "📊",
          title: "Spreadsheet Setup",
          description:
            "Custom spreadsheet solutions for data organization and analysis.",
          featured: false,
        },
        {
          icon: "📅",
          title: "Booking System Setup",
          description: "Integrated booking and appointment scheduling systems.",
          featured: false,
        },
        {
          icon: "🔗",
          title: "Calendar Integrations",
          description:
            "Seamless calendar synchronization and scheduling automation.",
          featured: false,
        },
        {
          icon: "🍕",
          title: "Restaurant Online Ordering",
          description:
            "Complete online ordering system for restaurants and food businesses.",
          featured: false,
        },
        {
          icon: "👥",
          title: "CRM Setup",
          description:
            "Customer relationship management system implementation and setup.",
          featured: false,
        },
        {
          icon: "🗃️",
          title: "Custom Database Solutions",
          description:
            "Tailored database design and implementation for complex data needs.",
          featured: false,
        },
      ],
    },
    engagement: {
      title: "Customer Engagement",
      icon: "💬",
      services: [
        {
          icon: "💬",
          title: "Live-chat or Helpdesk Widgets",
          description:
            "Real-time customer support chat-bot integration for better user experience.",
          featured: true,
        },
        {
          icon: "🔔",
          title: "Push Notifications",
          description:
            "Engage users with timely push notifications and alerts.",
          featured: false,
        },
      ],
    },
    automation: {
      title: "Automation",
      icon: "⚡",
      services: [
        {
          icon: "🔄",
          title: "Workflow Automations",
          description:
            "Streamline business processes with intelligent automation workflows.",
          featured: true,
        },
        {
          icon: "⏰",
          title: "Scheduled Tasks",
          description:
            "Automated task execution and scheduling for routine operations.",
          featured: false,
        },
        {
          icon: "⚡",
          title: "Custom Automation Scripts",
          description:
            "Bespoke automation solutions tailored to your specific needs.",
          featured: true,
        },
        {
          icon: "🔗",
          title: "Webhooks",
          description:
            "Real-time data synchronization and third-party integrations.",
          featured: false,
        },
        {
          icon: "🧠",
          title: "AI Agents",
          description:
            "Autonomous AI agents that plan, execute, and integrate with your stack to complete tasks end-to-end.",
          featured: true,
        },
      ],
    },
    ai: {
      title: "AI",
      icon: "🤖",
      services: [
        {
          icon: "💬",
          title: "Live-chat or Helpdesk Widgets",
          description:
            "Real-time customer support chat-bot integration for better user experience.",
          featured: true,
        },
        {
          icon: "🧠",
          title: "AI Agents",
          description:
            "Autonomous AI agents that plan, execute, and integrate with your stack to complete tasks end-to-end.",
          featured: true,
        },
        {
          icon: "✨",
          title: "AI-Powered Content Generation",
          description:
            "Automated content creation and optimization using AI technology.",
          featured: true,
        },
        {
          icon: "🎯",
          title: "AI-Driven Personalization",
          description:
            "Personalized user experiences based on behavior and preferences.",
          featured: true,
        },
        {
          icon: "💡",
          title: "AI Recommendations Engine",
          description:
            "Smart product and content recommendations for increased engagement.",
          featured: true,
        },
      ],
    },
    technical: {
      title: "Technical",
      icon: "🔧",
      services: [
        {
          icon: "⚡",
          title: "Advanced Performance Optimization",
          description:
            "Deep performance analysis and optimization for lightning-fast websites.",
          featured: false,
        },
        {
          icon: "🔒",
          title: "Advanced Security Package",
          description:
            "Enterprise-grade security measures and vulnerability protection.",
          featured: true,
        },
        {
          icon: "✅",
          title: "Compliance Enhancements",
          description:
            "GDPR, CCPA, and other regulatory compliance implementations.",
          featured: true,
        },
        {
          icon: "♿",
          title: "Accessibility Enhancements",
          description:
            "WCAG compliance and accessibility improvements for all users.",
          featured: true,
        },
        {
          icon: "🌍",
          title: "Localization",
          description:
            "Cultural and regional adaptation for international markets.",
          featured: true,
        },
        {
          icon: "🗣️",
          title: "Multi‑Language Support",
          description:
            "Complete multi-language website implementation and management.",
          featured: true,
        },
      ],
    },
  };

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
              <FeatureCard
                data={service}
                ringDuration={service.featured ? 600 : 800}
              />
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