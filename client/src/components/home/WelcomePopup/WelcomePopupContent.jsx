import React from 'react';
import { useTranslation } from 'react-i18next';
import Icon from '../../common/Icon/Icon';
import Button from '../../common/Button/Button';
import OutlineButton from '../../common/OutlineButton/OutlineButton';
import './WelcomePopupContent.css';

export default function WelcomePopupContent({
  settings,
  onEnquiry,
  onActionClick
}) {
  const { t } = useTranslation();

  const headlineRaw = t('welcomePopup.headline');
  const [headPrefix, headAccent] = headlineRaw.includes('*')
    ? headlineRaw.split('*')
    : [t('welcomePopup.headlinePrefix'), t('welcomePopup.headlineAccent')];

  const waUrl = `https://wa.me/${settings.whatsappNumber || '918939421231'}?text=${encodeURIComponent(
    settings.whatsappMessage || ''
  )}`;
  const dirUrl = settings.directionsUrl || settings.openInMapsUrl;
  const telUrl = `tel:${settings.phoneRaw || settings.phone}`;

  return (
    <div className="welcome-content-col">
      {settings.admissionsOpen && (
        <div className="welcome-stagger welcome-pill-row" style={{ animationDelay: '0ms' }}>
          <span className="welcome-pill welcome-pill-admissions">
            {t('welcomePopup.admissionsOpenPill')}
          </span>
        </div>
      )}

      {/* Headline */}
      <h2
        id="welcome-popup-title"
        className="welcome-stagger welcome-headline"
        style={{ animationDelay: settings.admissionsOpen ? '70ms' : '0ms' }}
      >
        <span className="welcome-headline-prefix">{headPrefix} </span>
        <span className="welcome-headline-accent">{headAccent}</span>
      </h2>

      {/* Subtext */}
      <p
        className="welcome-stagger welcome-subtext"
        style={{ animationDelay: settings.admissionsOpen ? '140ms' : '70ms' }}
      >
        {t('welcomePopup.subtext')}
      </p>

      {/* Action Buttons */}
      <div
        className="welcome-stagger welcome-buttons-row"
        style={{ animationDelay: settings.admissionsOpen ? '210ms' : '140ms' }}
      >
        <Button
          variant="black"
          onClick={onEnquiry}
          className="welcome-btn-primary"
        >
          <span>{t('welcomePopup.btnEnquiry')}</span>
          <Icon name="arrowUpRight" size={15} />
        </Button>

        <OutlineButton
          href={telUrl}
          onClick={onActionClick}
          variant="dark"
          className="welcome-btn-secondary"
          arrow={false}
        >
          <Icon name="phone" size={15} />
          <span>{t('welcomePopup.btnCall')}</span>
        </OutlineButton>
      </div>

      {/* Quick Text Links */}
      <div
        className="welcome-stagger welcome-links-row"
        style={{ animationDelay: settings.admissionsOpen ? '280ms' : '210ms' }}
      >
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="welcome-link welcome-link-whatsapp"
          onClick={onActionClick}
        >
          <Icon name="whatsapp" size={15} />
          <span>{t('welcomePopup.linkWhatsApp')}</span>
        </a>

        <a
          href={dirUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="welcome-link welcome-link-directions"
          onClick={onActionClick}
        >
          <Icon name="directions" size={15} />
          <span>{t('welcomePopup.linkDirections')}</span>
        </a>
      </div>

      {/* Info Line */}
      <div
        className="welcome-stagger welcome-info-line"
        style={{ animationDelay: settings.admissionsOpen ? '350ms' : '280ms' }}
      >
        <Icon name="clock" size={14} color="var(--color-gray-muted)" />
        <span>{t('welcomePopup.timings')}</span>
      </div>

      {/* Motto Strip */}
      <div
        className="welcome-stagger welcome-motto-strip"
        style={{ animationDelay: settings.admissionsOpen ? '420ms' : '350ms' }}
      >
        <span>{t('welcomePopup.motto')}</span>
      </div>
    </div>
  );
}
