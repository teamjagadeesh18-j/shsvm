import React from 'react';
import './FullBleedSection.css';

/**
 * FullBleedSection Component
 * Spans 100% of the viewport width with flat background from tokens.
 * Variant 'dark' (black) or 'light' (white).
 */
export default function FullBleedSection({
  variant = 'light',
  className = '',
  id,
  children,
  style = {},
  withContainer = false,
  containerClassName = 'container',
  ariaLabel
}) {
  const content = withContainer ? (
    <div className={containerClassName}>{children}</div>
  ) : (
    children
  );

  return (
    <section
      id={id}
      aria-label={ariaLabel}
      className={`full-bleed-section variant-${variant} ${className}`}
      style={style}
    >
      {content}
    </section>
  );
}
