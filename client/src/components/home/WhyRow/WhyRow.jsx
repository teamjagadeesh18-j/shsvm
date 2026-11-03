import React from 'react';
import Icon from '../../common/Icon/Icon';
import './WhyRow.css';

/**
 * Reusable WhyRow Component
 * Renders alternating black/white rows with checkmark icon and corner arrow square.
 * Used in WhyChooseUs, About, Academics, Careers.
 */
export default function WhyRow({
  variant = 'black',
  title,
  description,
  icon = 'check',
  showArrow = true,
  onClick,
  className = ''
}) {
  return (
    <div
      className={`alt-row-item alt-row-${variant} ${className}`}
      onClick={onClick}
    >
      <div className="alt-row-left">
        <div className="alt-check-icon">
          <Icon name={icon} size={18} strokeWidth={2.5} />
        </div>
        <div className="alt-row-content">
          <div className="alt-row-title">{title}</div>
          <div className="alt-row-desc">{description}</div>
        </div>
      </div>

      {showArrow && (
        <div className="alt-arrow-square" aria-hidden="true">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="7" y1="17" x2="17" y2="7" />
            <polyline points="7 7 17 7 17 17" />
          </svg>
        </div>
      )}
    </div>
  );
}

