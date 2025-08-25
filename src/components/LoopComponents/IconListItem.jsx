import React from "react";
// astro ready

export default function IconListItem({ 
  data,
  layout = "vertical", // "vertical" | "horizontal" | "horizontal-reverse"
  alignment = "center", // "center" | "left" | "right"
  
  // Container styling
  className = "",
  containerClassName = "",
  
  // Icon styling
  iconClassName = "icon-medium card-icon-color",
  
  // Title styling and behavior
  titleClassName = "h4",
  titleTag = "h4", // h1, h2, h3, h4, h5, h6, div, span, p
  
  // Description styling and behavior
  descriptionClassName = "text-text text-sm",
  descriptionTag = "p", // p, div, span
  
  // Show/hide elements
  showIcon = true,
  showTitle = true,
  showDescription = true
}) {
  const { icon, title, description } = data;

  // Layout configurations
  const layouts = {
    vertical: "flex flex-col",
    horizontal: "flex items-center",
    "horizontal-reverse": "flex items-start flex-row-reverse"
  };

  // Alignment configurations
  const alignments = {
    center: "text-center",
    left: "text-left", 
    right: "text-right"
  };

  // Dynamic tag components
  const TitleTag = titleTag;
  const DescriptionTag = descriptionTag;

  return (
    <div className={`${layouts[layout]} ${alignments[alignment]} ${className}`}>
      {showIcon && (
        <div className={iconClassName}>
          {icon}
        </div>
      )}
      
      {layout.includes("horizontal") ? (
        <div className={containerClassName}>
          {showTitle && (
            <TitleTag className={titleClassName}>{title}</TitleTag>
          )}
          {showDescription && (
            <DescriptionTag className={descriptionClassName}>{description}</DescriptionTag>
          )}
        </div>
      ) : (
        <>
          {showTitle && (
            <TitleTag className={titleClassName}>{title}</TitleTag>
          )}
          {showDescription && (
            <DescriptionTag className={descriptionClassName}>{description}</DescriptionTag>
          )}
        </>
      )}
    </div>
  );
}