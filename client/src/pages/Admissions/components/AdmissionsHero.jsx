import React from 'react';
import { useTranslation } from 'react-i18next';
import { DarkPanel } from '../../../components/common/PanelSection/PanelSection';
import SectionPill from '../../../components/common/SectionPill/SectionPill';
import Icon from '../../../components/common/Icon/Icon';
import Reveal from '../../../components/common/Reveal/Reveal';

export default function AdmissionsHero({ settings }) {
  const { t } = useTranslation();
  const phone = settings?.phone || '+91 89394 21231';
  const phoneTel = settings?.phoneRaw || '+918939421231';
  const timings = settings?.timings || 'Monday to Saturday, 8:00 AM to 5:30 PM. Sunday closed.';

  // If admission year exists in settings, append it, otherwise render clean badge
  const badgeText = settings?.admissionYear
    ? `${t('admissions.heroBadge')} ${settings.admissionYear}`
    : t('admissions.heroBadge');

  return (
    <section className="admissions-hero-section">
      <div className="container">
        <Reveal>
          <DarkPanel className="admissions-hero-panel" withGrid={true}>
            <div className="admissions-hero-content">
              <SectionPill text={badgeText} />

              <h1 className="admissions-hero-title">
                {t('admissions.heroTitle')}{' '}
                <span className="hero-title-dim">{t('admissions.heroHighlight')}</span>
              </h1>

              <p className="admissions-hero-desc">
                {t('admissions.heroSubtitle')}
              </p>

              <div className="admissions-contact-row">
                <a
                  href={`tel:${phoneTel}`}
                  className="admissions-contact-item contact-phone-link"
                  aria-label={`${t('admissions.callSchool')}: ${phone}`}
                >
                  <span className="contact-icon-bubble" aria-hidden="true">
                    <Icon name="phone" size={16} strokeWidth={2.2} />
                  </span>
                  <span className="contact-item-text">
                    <span className="contact-label">{t('admissions.callSchool')}</span>
                    <span className="contact-val">{phone}</span>
                  </span>
                </a>

                <div className="admissions-contact-item">
                  <span className="contact-icon-bubble" aria-hidden="true">
                    <Icon name="clock" size={16} strokeWidth={2.2} />
                  </span>
                  <span className="contact-item-text">
                    <span className="contact-label">Office Hours</span>
                    <span className="contact-val">{timings}</span>
                  </span>
                </div>
              </div>
            </div>
          </DarkPanel>
        </Reveal>
      </div>
    </section>
  );
}

