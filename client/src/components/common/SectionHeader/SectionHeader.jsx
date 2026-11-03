import React from 'react';
import './SectionHeader.css';

/**
 * Reusable SectionHeader Component
 * Renders tag pill, main title, subtitle, and optional right-aligned action button/slot.
 */
export default function SectionHeader({
  tag,
  tagColor = 'var(--color-accent)',
  tagBorderColor = 'var(--color-accent-glow)',
  title,
  titleClass = 'section-title-white',
  subtitle,
  subtitleClass = 'section-subtitle-gray',
  action = null,
  className = ''
}) {
  return (
    <div className={`section-header-row ${className}`}>
      <div className="section-title-wrap">
        {tag && (
          <div
            className="tag-pill"
            style={{ color: tagColor, borderColor: tagBorderColor }}
          >
            {tag}
          </div>
        )}
        {title && <h2 className={titleClass}>{title}</h2>}
        {subtitle && <p className={subtitleClass}>{subtitle}</p>}
      </div>
      {action && <div className="section-header-action">{action}</div>}
    </div>
  );
}

