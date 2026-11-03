import React from 'react';
import { useTranslation } from 'react-i18next';
import { getSettings, getImageUrl } from '../../../services/content';
import PanelSection from '../PanelSection/PanelSection';
import SectionPill from '../SectionPill/SectionPill';
import Button from '../Button/Button';
import OutlineButton from '../OutlineButton/OutlineButton';
import Icon from '../Icon/Icon';
import Reveal from '../Reveal/Reveal';
import './LocationCard.css';

/**
 * LocationCard Component
 * Interactive campus location showcase with embedded neutral preview map,
 * custom pulsing accent pin, and deep Google Maps navigation links.
 */
export default function LocationCard({ id = 'location', className = '' }) {
  const { t } = useTranslation();
  const settings = getSettings();

  const schoolName = settings?.name || t('location.schoolName');
  const address = settings?.address || 'Pakkam, Thiruvallur District, Tamil Nadu, PIN 602024';
  const phoneDisplay = settings?.phone || '+91 89394 21231';
  const phoneRaw = settings?.phoneRaw || '+918939421231';
  const openInMapsUrl = settings?.openInMapsUrl || 'https://www.google.com/maps/search/?api=1&query=13.1536061,80.0378861';
  const directionsUrl = settings?.directionsUrl || 'https://www.google.com/maps/dir/?api=1&destination=13.1536061,80.0378861';
  const mapPreviewImage = getImageUrl('location.map') || '/images/map-preview.jpg';
  const timings = settings?.timings || 'Monday to Saturday, 8:00 AM to 5:30 PM, Sunday closed.';

  return (
    <PanelSection
      id={id}
      ariaLabel="Campus Location and Directions"
      className={`location-section ${className}`}
      panelClassName="location-card-panel"
      withGrid={true}
    >
      <Reveal>
        <div className="location-grid-container">
          
          {/* Left Column: Campus Info & Action Buttons */}
          <div className="location-info-col">
            <div className="location-heading-group">
              <SectionPill variant="dark">
                {t('location.pill')}
              </SectionPill>
              <h2 className="location-title">
                {t('location.titlePrefix')}
                <span className="location-title-dim">{t('location.titleSuffix')}</span>
              </h2>
              <p className="location-subtitle">
                {t('location.subtitle')}
              </p>
            </div>

            <div className="location-details-list">
              {/* School Name & Address */}
              <div className="location-detail-item">
                <div className="location-detail-icon" aria-hidden="true">
                  <Icon name="pin" size={18} color="currentColor" />
                </div>
                <div className="location-detail-content">
                  <span className="location-detail-label">{t('location.addressLabel')}</span>
                  <span className="location-school-name">{schoolName}</span>
                  <span>{address}</span>
                </div>
              </div>

              {/* Phone Helpline */}
              <div className="location-detail-item">
                <div className="location-detail-icon" aria-hidden="true">
                  <Icon name="phone" size={18} color="currentColor" />
                </div>
                <div className="location-detail-content">
                  <span className="location-detail-label">{t('location.phoneLabel')}</span>
                  <a href={`tel:${phoneRaw}`} className="location-phone-link">
                    {phoneDisplay}
                  </a>
                </div>
              </div>

              {/* Timings */}
              <div className="location-detail-item">
                <div className="location-detail-icon" aria-hidden="true">
                  <Icon name="clock" size={18} color="currentColor" />
                </div>
                <div className="location-detail-content">
                  <span className="location-detail-label">{t('location.timingsLabel')}</span>
                  <span>{timings}</span>
                </div>
              </div>
            </div>

            {/* Actions: Directions, Open in Maps, Call */}
            <div className="location-btn-group">
              <Button
                variant="white"
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                ariaLabel="Get directions to school campus in Google Maps (opens in a new tab)"
              >
                <Icon name="directions" size={16} color="currentColor" />
                <span>{t('location.btnDirections')}</span>
              </Button>

              <OutlineButton
                variant="dark"
                href={openInMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                arrow={false}
                ariaLabel="Open campus location in Google Maps (opens in a new tab)"
              >
                <span>{t('location.btnOpenMaps')}</span>
                <Icon name="externalLink" size={14} color="currentColor" />
              </OutlineButton>

              <Button
                variant="outline"
                href={`tel:${phoneRaw}`}
                ariaLabel={`Call school desk at ${phoneDisplay}`}
              >
                <Icon name="phone" size={16} color="currentColor" />
                <span>{t('location.btnCall')}</span>
              </Button>
            </div>
          </div>

          {/* Right Column: Full-Card Map Link with Centered Pin & Themed Preview */}
          <div className="location-map-col">
            <a
              href={openInMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="location-map-link-card"
              aria-label={t('location.mapAriaLabel')}
            >
              {/* Fallback Grid Layer */}
              <div className="location-map-placeholder" aria-hidden="true" />

              {/* Map Preview Image */}
              <img
                src={mapPreviewImage}
                alt={t('location.mapImageAlt')}
                className="location-map-img"
                loading="lazy"
              />

              {/* Contrast Shade Overlay for Badge Legibility */}
              <div className="location-map-overlay" aria-hidden="true" />

              {/* Centered Accent Pin with Soft Glow Ring */}
              <div className="location-map-pin-container" aria-hidden="true">
                <div className="location-map-pin-pulse" />
                <svg
                  className="location-map-pin-svg"
                  viewBox="0 0 24 24"
                  width="38"
                  height="38"
                  fill="var(--color-accent, #0000d8)"
                >
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                </svg>
              </div>

              {/* Bottom Left Label Chip */}
              <div className="location-chip-label" aria-hidden="true">
                <Icon name="pin" size={14} color="var(--color-accent, #0000d8)" />
                <span>{t('location.mapChipLabel')}</span>
              </div>

              {/* Bottom Right Interactive Pill */}
              <div className="location-pill-open" aria-hidden="true">
                <span>{t('location.btnOpenMaps')}</span>
                <Icon name="externalLink" size={13} color="currentColor" />
              </div>
            </a>
          </div>

        </div>
      </Reveal>
    </PanelSection>
  );
}

