import React, { useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { observeAnimation } from '../../../services/animationObserver';
import './Marquee.css';

const DEFAULT_LINE1 = [
  'Smile • Study • Serve',
  'State Board Matriculation',
  'Primary to Secondary Schooling',
  'Academic Book Bank',
  'Recreation Playground',
  'Medical Support',
  'Pakkam, Thiruvallur'
];

const DEFAULT_LINE2 = [
  { text: 'Established in 1999', highlight: false },
  { text: 'Co-educational Schooling', highlight: true },
  { text: 'Tamil Nadu State Board', highlight: false },
  { text: 'Academic Subjects & Arts', highlight: false },
  { text: 'Physical Education & Sports', highlight: false },
  { text: 'Pakkam, Thiruvallur PIN 602024', highlight: true }
];

// Exact geometric 8-petal rosette flower glyph from the reference
function RosetteGlyph() {
  return (
    <span className="marquee-rosette" aria-hidden="true">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <circle cx="12" cy="12" r="2.8" />
        <circle cx="12" cy="4.8" r="2.2" />
        <circle cx="12" cy="19.2" r="2.2" />
        <circle cx="4.8" cy="12" r="2.2" />
        <circle cx="19.2" cy="12" r="2.2" />
        <circle cx="6.9" cy="6.9" r="2.2" />
        <circle cx="17.1" cy="17.1" r="2.2" />
        <circle cx="6.9" cy="17.1" r="2.2" />
        <circle cx="17.1" cy="6.9" r="2.2" />
      </svg>
    </span>
  );
}

export default function Marquee({
  variant = 'accent',
  dual = false,
  line1,
  line2,
  items
}) {
  const { t } = useTranslation();
  const bandRef = useRef(null);

  useEffect(() => {
    return observeAnimation(bandRef.current);
  }, []);

  // Load items from i18n or use defaults
  const i18nLine1 = t('about.marqueeLine1', { returnObjects: true });
  const i18nLine2 = t('about.marqueeLine2', { returnObjects: true });
  const i18nItems = t('marqueeItems', { returnObjects: true });

  // Render dual-line marquee for dark variant
  const isDual = dual || variant === 'dark';

  const defaultList1 = isDual
    ? (Array.isArray(i18nLine1) && i18nLine1.length > 0 ? i18nLine1 : DEFAULT_LINE1)
    : (Array.isArray(i18nItems) && i18nItems.length > 0 ? i18nItems : DEFAULT_LINE1);

  const list1 = Array.isArray(line1) && line1.length > 0
    ? line1
    : (Array.isArray(items) && items.length > 0 ? items : defaultList1);

  const list2 = Array.isArray(line2) && line2.length > 0
    ? line2
    : (Array.isArray(i18nLine2) && i18nLine2.length > 0 ? i18nLine2 : DEFAULT_LINE2);

  return (
    <div
      ref={bandRef}
      className={`marquee-band ${variant === 'dark' ? 'marquee-dark' : ''} ${isDual ? 'marquee-dual' : ''}`}
      aria-label="School highlights marquee ticker"
    >
      {/* Upper Line (Row 1): Scrolls to Left, changes to official blue on hover */}
      <div className="marquee-row marquee-row-1">
        <div className="marquee-inner marquee-inner-left">
          <div className="marquee-content-block">
            {list1.map((item, idx) => {
              const text = typeof item === 'string' ? item : item.text;
              const isHighlight = typeof item === 'object' && item.highlight;
              return (
                <React.Fragment key={idx}>
                  <span className={`marquee-text-item ${isHighlight ? 'item-highlighted' : ''}`}>
                    {text}
                  </span>
                  <RosetteGlyph />
                </React.Fragment>
              );
            })}
          </div>
          {/* Seamless duplicate */}
          <div className="marquee-content-block" aria-hidden="true">
            {list1.map((item, idx) => {
              const text = typeof item === 'string' ? item : item.text;
              const isHighlight = typeof item === 'object' && item.highlight;
              return (
                <React.Fragment key={`dup1-${idx}`}>
                  <span className={`marquee-text-item ${isHighlight ? 'item-highlighted' : ''}`}>
                    {text}
                  </span>
                  <RosetteGlyph />
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      {/* Lower Line (Row 2): Scrolls to Right, highlighted items + blue hover */}
      {isDual && (
        <div className="marquee-row marquee-row-2">
          <div className="marquee-inner marquee-inner-right">
            <div className="marquee-content-block">
              {list2.map((item, idx) => {
                const text = typeof item === 'string' ? item : item.text;
                const isHighlight = typeof item === 'object' && item.highlight;
                return (
                  <React.Fragment key={idx}>
                    <span className={`marquee-text-item ${isHighlight ? 'item-highlighted' : 'item-dimmed'}`}>
                      {text}
                    </span>
                    <RosetteGlyph />
                  </React.Fragment>
                );
              })}
            </div>
            {/* Seamless duplicate */}
            <div className="marquee-content-block" aria-hidden="true">
              {list2.map((item, idx) => {
                const text = typeof item === 'string' ? item : item.text;
                const isHighlight = typeof item === 'object' && item.highlight;
                return (
                  <React.Fragment key={`dup2-${idx}`}>
                    <span className={`marquee-text-item ${isHighlight ? 'item-highlighted' : 'item-dimmed'}`}>
                      {text}
                    </span>
                    <RosetteGlyph />
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
