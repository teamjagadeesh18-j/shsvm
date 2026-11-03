import React from 'react';

/**
 * Reusable StatsCard Component
 * Displays a large metric number with title and description.
 * Used in StatsSection, Faculty stats strip, etc.
 */
export default function StatsCard({
  number,
  title,
  description,
  className = ''
}) {
  return (
    <div className={`stat-column ${className}`}>
      <div className="stat-huge-number">{number}</div>
      <div className="stat-title">{title}</div>
      <div className="stat-desc">{description}</div>
    </div>
  );
}

