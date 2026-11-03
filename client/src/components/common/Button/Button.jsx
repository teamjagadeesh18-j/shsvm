import React from 'react';
import { Link } from 'react-router-dom';
import './Button.css';

/**
 * Reusable Pill Button Component
 * Supports variants: 'black', 'accent' (or 'amber'), 'white', 'outline'
 * Can render as a standard button, react-router Link, or external anchor tag.
 */
export default function Button({
  children,
  to,
  href,
  onClick,
  type = 'button',
  variant = 'black',
  size = 'md',
  className = '',
  disabled = false,
  target,
  rel,
  ariaLabel,
  ...rest
}) {
  const combinedClass = `btn-pill btn-pill-${variant} btn-${size} ${className}`.trim();

  if (to) {
    return (
      <Link to={to} className={combinedClass} onClick={onClick} aria-label={ariaLabel} {...rest}>
        {children}
      </Link>
    );
  }

  if (href) {
    return (
      <a
        href={href}
        className={combinedClass}
        onClick={onClick}
        target={target}
        rel={target === '_blank' ? 'noopener noreferrer' : rel}
        aria-label={ariaLabel}
        {...rest}
      >
        {children}
      </a>
    );
  }

  return (
    <button
      type={type}
      className={combinedClass}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      {...rest}
    >
      {children}
    </button>
  );
}

