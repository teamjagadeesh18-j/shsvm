import React from 'react';
import './PageHero.css';

export default function PageHero({
  badge,
  title,
  highlight,
  highlightClass = 'hero-highlight',
  subtitle
}) {
  return (
    <section className="subpage-hero bg-grid">
      {/* Soft blurred glow circle behind headline */}
      <div className="hero-glow-circle" aria-hidden="true" />

      <div className="container hero-content">
        {badge && (
          <div className="subpage-badge-pill">
            {badge}
          </div>
        )}

        <h1 className="subpage-title">
          {title}{' '}
          {highlight && <span className={highlightClass}>{highlight}</span>}
        </h1>

        {subtitle && <p className="subpage-desc">{subtitle}</p>}
      </div>
    </section>
  );
}

