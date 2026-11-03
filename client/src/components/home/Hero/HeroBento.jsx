import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { getSettings } from '../../../services/content';
import ImageSlot from '../../common/ImageSlot/ImageSlot';
import Icon from '../../common/Icon/Icon';
import BentoCountUp from './BentoCountUp';
import BentoLiveStatus from './BentoLiveStatus';
import './HeroBento.css';

export default function HeroBento() {
  const { t } = useTranslation();
  const settings = getSettings();
  const gridRef = useRef(null);

  const handlePointerMove = (e) => {
    if (e.pointerType === 'touch') return;
    const grid = gridRef.current;
    if (!grid) return;

    const prefersReducedMotion = typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const rect = grid.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    grid.style.setProperty('--spotlight-x', `${x}px`);
    grid.style.setProperty('--spotlight-y', `${y}px`);
  };

  const handlePointerLeave = () => {
    const grid = gridRef.current;
    if (!grid) return;
    grid.style.setProperty('--spotlight-x', '-9999px');
    grid.style.setProperty('--spotlight-y', '-9999px');
  };

  const mapsUrl = settings.openInMapsUrl || settings.mapUrl || 'https://maps.google.com';
  const locationLabel = t('bentoLocation', 'Pakkam, Thiruvallur');
  const schoolAlt = t('bentoSchoolAlt', 'Sree Hari Saradha Vidhyalaya Matriculation School Campus Building and Entrance');

  return (
    <div
      ref={gridRef}
      className="hero-bento-grid"
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      {/* Tile A: School Campus Showcase Photo (Spans 2 rows on desktop) */}
      <div className="bento-tile bento-photo-tile">
        <ImageSlot
          slotKey="home.bentoShowcase"
          alt={schoolAlt}
          loading="eager"
          fetchPriority="high"
          ratio="4/5"
          className="bento-photo-slot"
        />
      </div>

      {/* Tile B: Count-up "27+ Years in Pakkam" */}
      <BentoCountUp />

      {/* Tile C: Live School Status Badge */}
      <BentoLiveStatus />

      {/* Tile D: Interactive Location Card with Radar Pulse */}
      <a
        href={mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="bento-tile bento-location-tile"
        aria-label={`${locationLabel} - ${t('bentoMapAria', 'Open school location in Google Maps')}`}
      >
        <div className="bento-location-bg" aria-hidden="true" />
        <div className="bento-location-content">
          <div className="bento-radar-pin">
            <span className="bento-radar-ring" aria-hidden="true" />
            <span className="bento-radar-ring-delayed" aria-hidden="true" />
            <span className="bento-radar-dot" aria-hidden="true">
              <Icon name="pin" size={16} strokeWidth={2} />
            </span>
          </div>
          <div className="bento-location-info">
            <span className="bento-location-label">{locationLabel}</span>
            <span className="bento-location-action">
              <Icon name="arrowUpRight" size={14} strokeWidth={2} />
            </span>
          </div>
        </div>
      </a>
    </div>
  );
}

