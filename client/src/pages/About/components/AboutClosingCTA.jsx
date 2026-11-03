import React from 'react';
import { useTranslation } from 'react-i18next';
import Button from '../../../components/common/Button/Button';
import Reveal from '../../../components/common/Reveal/Reveal';
import './AboutClosingCTA.css';

export default function AboutClosingCTA({ onOpenEnquiry }) {
  const { t } = useTranslation();

  return (
    <section className="section section-dark about-closing-section bg-grid-dark">
      <div className="container">
        <Reveal>
          <div className="closing-content-box">
            <h2 className="closing-title">
              {t('about.ctaTitle')}
            </h2>
            <p className="closing-subtitle">
              {t('about.ctaSubtitle')}
            </p>
            <div className="closing-actions-row">
              <Button
                variant="white"
                size="lg"
                onClick={onOpenEnquiry}
                to={!onOpenEnquiry ? '/admissions' : undefined}
                className="closing-btn-white"
              >
                {t('btnEnquiry')} &gt;
              </Button>
              <Button
                variant="outline"
                size="lg"
                to="/contact"
                className="closing-btn-outline"
              >
                {t('navContact')} &gt;
              </Button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
