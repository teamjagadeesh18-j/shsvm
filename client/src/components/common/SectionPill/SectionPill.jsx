import React from 'react';
import './SectionPill.css';

/**
 * SectionPill Component
 * Reference style pill label with 1px border and filled status dot.
 * Variants: 'dark' (for dark surfaces), 'light' (for light surfaces).
 */
export default function SectionPill({
  children,
  text,
  variant = 'dark',
  className = '',
  withDot = true,
  style = {}
}) {
  const content = children || text;
  return (
    <div
      className={`section-pill pill-${variant} ${className}`}
      style={style}
    >
      {withDot && <span className="section-pill-dot" aria-hidden="true" />}
      <span className="section-pill-text">{content}</span>
    </div>
  );
}
