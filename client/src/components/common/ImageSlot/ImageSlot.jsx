import React, { useState } from 'react';
import { getImageUrl } from '../../../services/content';
import './ImageSlot.css';

/**
 * ImageSlot Component
 * Enforces fixed aspect ratio, lazy loading, and fallback placeholder.
 * Looks up image path from the slotKey in images.json via content service.
 */
export default function ImageSlot({
  slotKey,
  ratio = '16/9',
  alt = 'S.H.S.V.M School',
  className = '',
  loading = 'lazy',
  fetchPriority = 'auto',
  style = {},
  fallbackSrc = '/images/school-campus.jpg',
  children
}) {
  const primarySrc = slotKey ? getImageUrl(slotKey) : fallbackSrc;
  const [prevPrimarySrc, setPrevPrimarySrc] = useState(primarySrc);
  const [currentSrc, setCurrentSrc] = useState(primarySrc);
  const [hasError, setHasError] = useState(false);

  if (primarySrc !== prevPrimarySrc) {
    setPrevPrimarySrc(primarySrc);
    setCurrentSrc(primarySrc);
    setHasError(false);
  }

  const handleImgError = () => {
    const fallback = fallbackSrc || '/images/school-campus.jpg';
    if (currentSrc !== fallback && fallback) {
      setCurrentSrc(fallback);
    } else {
      setHasError(true);
    }
  };

  // Convert ratio "16/9" to CSS aspect-ratio property
  const aspectRatioStyle = ratio ? { aspectRatio: ratio.replace('/', ' / ') } : {};

  return (
    <div
      className={`image-slot-container ${className}`}
      style={{ ...aspectRatioStyle, ...style }}
    >
      {!hasError && currentSrc ? (
        <img
          src={currentSrc}
          alt={alt}
          loading={loading}
          fetchPriority={fetchPriority}
          className="image-slot-img"
          onError={handleImgError}
        />
      ) : (
        <div className="image-slot-placeholder">
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="placeholder-icon"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
          <span className="placeholder-slot-key">{slotKey || 'No Image'}</span>
        </div>
      )}
      {children}
    </div>
  );
}

