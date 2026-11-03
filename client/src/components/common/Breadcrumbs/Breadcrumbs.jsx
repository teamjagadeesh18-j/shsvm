import React from 'react';
import { Link } from 'react-router-dom';
import { getSettings } from '../../../services/content';
import './Breadcrumbs.css';

/**
 * Breadcrumbs Component
 * Accessible navigational breadcrumb trail for inner pages.
 * Also generates BreadcrumbList JSON-LD.
 */
export default function Breadcrumbs({ items = [] }) {
  const settings = getSettings();
  const siteUrl = settings?.siteUrl || 'https://shsvm-school.edu.in';

  const fullTrail = [
    { label: 'Home', path: '/' },
    ...items
  ];

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': fullTrail.map((crumb, idx) => ({
      '@type': 'ListItem',
      'position': idx + 1,
      'name': crumb.label,
      'item': `${siteUrl}${crumb.path === '/' ? '' : crumb.path}`
    }))
  };

  return (
    <nav className="breadcrumbs-nav" aria-label="Breadcrumbs">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <ol className="breadcrumbs-list">
        {fullTrail.map((crumb, idx) => {
          const isLast = idx === fullTrail.length - 1;
          return (
            <li key={crumb.path || idx} className="breadcrumb-item">
              {idx > 0 && <span className="breadcrumb-separator" aria-hidden="true">/</span>}
              {isLast ? (
                <span className="breadcrumb-current" aria-current="page">
                  {crumb.label}
                </span>
              ) : (
                <Link to={crumb.path} className="breadcrumb-link">
                  {crumb.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

