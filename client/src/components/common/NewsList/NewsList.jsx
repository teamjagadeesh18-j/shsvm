import React from 'react';

/**
 * Reusable NewsList Component
 * Displays a list of official school notices/announcements with date badge and category tag.
 */
export default function NewsList({ articles = [], onSelectArticle, className = '' }) {
  if (!articles || articles.length === 0) return null;

  return (
    <div className={`news-cards-list ${className}`}>
      {articles.map((item) => (
        <div
          key={item.id}
          className="news-item-card"
          onClick={() => onSelectArticle && onSelectArticle(item)}
        >
          <div className="news-date-block">
            <span className="news-day">{item.day}</span>
            <span className="news-month">{item.month}</span>
          </div>
          <div className="news-item-content">
            <span className="news-category-tag">{item.category}</span>
            <h3 className="news-item-title">{item.title}</h3>
            <p className="news-item-summary">{item.summary}</p>
          </div>
          <div className="news-item-arrow" aria-hidden="true">
            ↗
          </div>
        </div>
      ))}
    </div>
  );
}

