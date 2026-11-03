import React from 'react';
import { useTranslation } from 'react-i18next';
import Icon from '../../common/Icon/Icon';
import ImageSlot from '../../common/ImageSlot/ImageSlot';
import './WelcomePopupPhoto.css';

export default function WelcomePopupPhoto() {
  const { t } = useTranslation();

  return (
    <div className="welcome-photo-col">
      <div className="welcome-photo-wrap">
        <ImageSlot
          slotKey="popup.welcome"
          fallbackSrc="/images/school-campus.jpg"
          ratio="4/3"
          alt={t('welcomePopup.photoAlt')}
          className="welcome-photo-slot"
          loading="eager"
        />
        <div className="welcome-caption-chip">
          <Icon name="pin" size={12} color="var(--color-accent)" />
          <span>{t('welcomePopup.photoCaption')}</span>
        </div>
      </div>
    </div>
  );
}
