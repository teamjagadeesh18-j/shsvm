import React from 'react';
import { Link } from 'react-router-dom';
import './OutlineButton.css';

/**
 * OutlineButton Component
 * Outlined pill button with 1px border and hover transition.
 * Supports Link (to), anchor (href), or button (onClick).
 */
export default function OutlineButton({
  children,
  to,
  href,
  onClick,
  arrow = true,
  className = '',
  variant = 'dark',
  style = {},
  ariaLabel
}) {
  const content = (
    <>
      <span className="outline-btn-text">{children}</span>
      {arrow && (
        <svg
          className="outline-btn-arrow"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <line x1="7" y1="17" x2="17" y2="7" />
          <polyline points="7 7 17 7 17 17" />
        </svg>
      )}
    </>
  );

  const classes = `outline-btn outline-${variant} ${className}`;

  if (to) {
    return (
      <Link to={to} className={classes} style={style} aria-label={ariaLabel}>
        {content}
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} className={classes} style={style} aria-label={ariaLabel} target="_blank" rel="noopener noreferrer">
        {content}
      </a>
    );
  }

  return (
    <button type="button" onClick={onClick} className={classes} style={style} aria-label={ariaLabel}>
      {content}
    </button>
  );
}
