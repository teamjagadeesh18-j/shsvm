import React from 'react';
import ImageSlot from '../ImageSlot/ImageSlot';

/**
 * Reusable GalleryGrid Component
 * Masonry grid with alternating span ratios and overlay card captions.
 */
export default function GalleryGrid({ items = [], onSelectPhoto, className = '' }) {
  if (!items || items.length === 0) return null;

  return (
    <div className={`gallery-masonry-grid ${className}`}>
      {items.map((item, idx) => {
        const isSpan2 = idx % 5 === 0;
        return (
          <div
            key={item.id}
            className={`gallery-card-item ${isSpan2 ? 'span-2' : ''}`}
            onClick={() => onSelectPhoto && onSelectPhoto(idx)}
          >
            <ImageSlot
              slotKey={item.slotKey}
              ratio={isSpan2 ? '21/9' : '4/3'}
              alt={item.title}
              className="gallery-slot-image"
            />
            <div className="gallery-card-overlay">
              <span className="gallery-card-tag">{item.category}</span>
              <h3 className="gallery-card-title">{item.title}</h3>
              <p className="gallery-card-caption">{item.caption}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

