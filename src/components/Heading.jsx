// components/Heading.jsx
export default function Heading({
  tagName: Tag = "h2",
  className = "",
  before,
  text,
  after,
  beforeClass = "",
  textClass = "",
  afterClass = "",
  children,
  ...props
}) {
  const tagLevel = typeof Tag === "string" ? Tag.toLowerCase() : "h2";

  // Only auto-apply h1..h6 utility if Tag is a heading element
  const hasManualHeadingClass = /\bh[1-6]\b/.test(className);
  const isHeadingTag = ["h1", "h2", "h3", "h4", "h5", "h6"].includes(tagLevel);
  const finalClassName =
    hasManualHeadingClass || !isHeadingTag
      ? className
      : `${tagLevel} ${className}`.trim();

  const isPropBased =
    before !== undefined || text !== undefined || after !== undefined;

  return (
    <Tag className={finalClassName} {...props}>
      {isPropBased ? (
        <>
          {before !== undefined && <span className={beforeClass}>{before}</span>}
          {text !== undefined && <span className={textClass}>{text}</span>}
          {after !== undefined && <span className={afterClass}>{after}</span>}
        </>
      ) : (
        children
      )}
    </Tag>
  );
}
