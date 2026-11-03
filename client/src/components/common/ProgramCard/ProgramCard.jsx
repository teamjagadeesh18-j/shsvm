import React from 'react';
import { Link } from 'react-router-dom';
import './ProgramCard.css';

/**
 * Reusable ProgramCard Component
 * Used in Programs, About, Academics, Contact info cards.
 */
export default function ProgramCard({
  id,
  icon,
  title,
  titleStyle = {},
  description,
  highlightTag,
  link,
  linkText,
  className = '',
  children
}) {
  return (
    <div className={`program-card ${className}`} id={id}>
      {icon && <div className="card-icon-tile">{icon}</div>}
      <div className="card-content">
        {title && <h3 style={titleStyle}>{title}</h3>}
        {description && (typeof description === 'string' ? <p>{description}</p> : description)}
        {children}
      </div>
      {highlightTag && <span className="card-highlight-tag">{highlightTag}</span>}
      {link && (
        <Link to={link} className="card-action-link">
          {linkText}
        </Link>
      )}
    </div>
  );
}

