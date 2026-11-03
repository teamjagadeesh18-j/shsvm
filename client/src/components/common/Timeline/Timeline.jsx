import React from 'react';

/**
 * Reusable Timeline Component
 * Renders numbered journey steps.
 */
export default function Timeline({ steps = [], className = '' }) {
  return (
    <div className={`timeline-container ${className}`}>
      {steps.map((step) => (
        <div key={step.num} className="timeline-step">
          <div className="step-number">{step.num}</div>
          <div className="step-card">
            <h3>{step.title}</h3>
            <p>{step.desc}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

