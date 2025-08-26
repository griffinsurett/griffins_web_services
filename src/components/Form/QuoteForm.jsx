// src/components/QuoteForm/QuoteForm.jsx
import React, { useState } from "react";
import Button from "../Buttons/Button";
import Input from "../Form/Input";
import Textarea from "../Form/Textarea";
import Select from "../Form/Select";
import { siteData } from "@/siteData.js";
import { WEBSITE_TYPES } from "@/websiteTypes";

// Build the <Select /> options locally (moved from data file)
const WEBSITE_TYPE_OPTIONS = WEBSITE_TYPES.map((t) => ({
  value: t.key,
  label: t.title,
}));

const DEFAULT_BUDGETS = [
  { value: "under-5k", label: "Under $5,000" },
  { value: "5k-10k", label: "$5,000 - $10,000" },
  { value: "10k-25k", label: "$10,000 - $25,000" },
  { value: "25k-50k", label: "$25,000 - $50,000" },
  { value: "over-50k", label: "$50,000+" },
];

const DEFAULT_TIMELINES = [
  { value: "asap", label: "ASAP" },
  { value: "1-month", label: "Within 1 month" },
  { value: "2-3-months", label: "2-3 months" },
  { value: "3-6-months", label: "3-6 months" },
  { value: "flexible", label: "I'm flexible" },
];

/**
 * Pure form component (no section/heading).
 * If you pass `onSubmit(formData)`, the form will preventDefault and call it.
 * Otherwise it will POST to `action`/`method`.
 */
export default function QuoteForm({
  action = "https://formspree.io/f/mjkgojyo",
  method = "POST",
  className = "group section-box card-bg outer-card-transition md:mx-5 lg:mx-10 xl:mx-15 flex flex-col",
  websiteTypeOptions = WEBSITE_TYPE_OPTIONS,
  budgetOptions = DEFAULT_BUDGETS,
  timelineOptions = DEFAULT_TIMELINES,
  initialData = {},
  onSubmit, // optional: (formData) => void
}) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    websiteType: "",
    budget: "",
    timeline: "",
    message: "",
    ...initialData,
  });

  const handleInputChange = (e) =>
    setFormData((d) => ({ ...d, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    if (!onSubmit) return; // allow native submit to Formspree
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form
      action={onSubmit ? undefined : action}
      method={onSubmit ? undefined : method}
      onSubmit={handleSubmit}
      className={className}
    >
      <div className="inner-card-style"></div>

     <div className="grid md:grid-cols-2 gap-4 relative z-10">
        <Input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          placeholder="Full Name *"
          label="Full Name"
          labelHidden
          required
        />
        <Input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          placeholder="Email Address *"
          label="Email Address"
          labelHidden
          required
        />
        <Input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleInputChange}
          placeholder="Phone Number"
          label="Phone Number"
          labelHidden
        />
        <Input
          type="text"
          name="company"
          value={formData.company}
          onChange={handleInputChange}
          placeholder="Company Name"
          label="Company Name"
          labelHidden
        />
        <Select
          name="websiteType"
          value={formData.websiteType}
          onChange={handleInputChange}
          placeholder="Type of Website *"
          label="Type of Website"
          labelHidden
          colSpan="md:col-span-2"
          required
          options={websiteTypeOptions}
        />
        <Select
          name="budget"
          value={formData.budget}
          onChange={handleInputChange}
          placeholder="Project Budget"
          label="Project Budget"
          labelHidden
          options={budgetOptions}
        />
        <Select
          name="timeline"
          value={formData.timeline}
          onChange={handleInputChange}
          placeholder="Project Timeline"
          label="Project Timeline"
          labelHidden
          options={timelineOptions}
        />
        <Textarea
          name="message"
          value={formData.message}
          onChange={handleInputChange}
          placeholder="Project Details * - Tell us about your project, goals, and any specific requirements..."
          label="Project Details"
          labelHidden
          colSpan="md:col-span-2"
          required
        />
      </div>

      {/* Consent checkbox already has a visible label */}
      <div className="md:col-span-2 flex items-start lg:items-center gap-2 my-2">
        <input
          id="consent"
          type="checkbox"
          name="consent"
          required
          className="h-4 w-4 rounded border-muted/60 accent-primary"
        />
        <label htmlFor="consent" className="text-sm">
          I consent to have{" "}
          <span className="emphasized-text">{siteData.title}</span> store my
          submitted information so they can respond to my inquiry.
        </label>
      </div>

      <div className="text-center relative z-10 py-5">
        <Button
          type={onSubmit ? "button" : "submit"}
          onClick={onSubmit ? handleSubmit : undefined}
          variant="primary"
        >
          Get a Quote
        </Button>
      </div>
    </form>
  );
}