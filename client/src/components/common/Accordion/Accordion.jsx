import React, { useState } from 'react';
import './Accordion.css';

/**
 * Reusable Accordion Component
 * Used for FAQs and collapsible information items with full keyboard and ARIA support.
 */
export default function Accordion({
  items = [],
  openIndex: controlledOpenIndex,
  onToggle: controlledOnToggle,
  className = ''
}) {
  const [internalOpenIndex, setInternalOpenIndex] = useState(null);

  const isControlled = controlledOpenIndex !== undefined;
  const activeIndex = isControlled ? controlledOpenIndex : internalOpenIndex;

  const handleToggle = (idx) => {
    if (isControlled) {
      if (controlledOnToggle) controlledOnToggle(idx);
    } else {
      setInternalOpenIndex((prev) => (prev === idx ? null : idx));
    }
  };

  return (
    <div className={`accordion-list ${className}`}>
      {items.map((item, idx) => {
        const isOpen = activeIndex === idx;
        const qText = item.question || item.q || item.title;
        const aText = item.answer || item.a || item.content;
        const panelId = `accordion-panel-${idx}`;
        const headerId = `accordion-header-${idx}`;

        return (
          <div
            key={item.id || idx}
            className={`accordion-item ${isOpen ? 'open' : ''}`}
          >
            <button
              id={headerId}
              type="button"
              className="accordion-trigger"
              onClick={() => handleToggle(idx)}
              aria-expanded={isOpen}
              aria-controls={panelId}
            >
              <div className="accordion-trigger-left">
                <span className="accordion-q-icon" aria-hidden="true">Q</span>
                <span>{qText}</span>
              </div>
              <div className="accordion-icon-wrap" aria-hidden="true">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </div>
            </button>
            {isOpen && (
              <div
                id={panelId}
                role="region"
                aria-labelledby={headerId}
                className="accordion-panel"
              >
                {aText}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
