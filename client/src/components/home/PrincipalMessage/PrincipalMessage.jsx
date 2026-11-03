import React from 'react';
import { useTranslation } from 'react-i18next';
import ImageSlot from '../../common/ImageSlot/ImageSlot';
import PanelSection from '../../common/PanelSection/PanelSection';
import SectionPill from '../../common/SectionPill/SectionPill';
import Reveal from '../../common/Reveal/Reveal';
import './PrincipalMessage.css';

export default function PrincipalMessage() {
  const { t } = useTranslation();

  return (
    <PanelSection
      id="principal-message"
      ariaLabel="Principal's Message"
      className="principal-section"
      panelClassName="principal-panel-inner"
      withGrid={false}
    >
      <Reveal>
        <div className="principal-card-container">
          
          {/* School Celebration & Campus Photo Slot */}
          <div className="principal-photo-slot">
            <ImageSlot
              slotKey="home.principal"
              ratio=""
              alt={t('principalAlt')}
              className="principal-image-container"
            />
          </div>

          {/* Content Slot */}
          <div className="principal-content-slot">
            <SectionPill variant="dark" style={{ marginBottom: '16px' }}>
              {t('principalTag')}
            </SectionPill>

            <p className="principal-quote">
              "{t('principalQuote')}{' '}
              <span className="accent">{t('principalQuoteHighlight')}</span>"
            </p>

            <p className="principal-body-text">
              {t('principalBody')}
            </p>

            {/* Designation */}
            <div className="principal-sign-row">
              <div className="principal-name-wrap">
                <h4>{t('principalName')}</h4>
                <p>{t('principalRole')}</p>
              </div>
            </div>
          </div>

        </div>
      </Reveal>
    </PanelSection>
  );
}
