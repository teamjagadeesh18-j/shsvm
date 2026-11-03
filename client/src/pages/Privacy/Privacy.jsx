import React from 'react';
import { useTranslation } from 'react-i18next';
import SEO from '../../components/common/SEO/SEO';
import '../Legal/Legal.css';

export default function Privacy() {
  const { t } = useTranslation();

  return (
    <div className="legal-page">
      <SEO
        title={t('privacyPage.metaTitle', 'Privacy Policy | Sree Hari Saradha Vidhyalaya Matriculation School')}
        description={t('privacyPage.metaDesc', 'Privacy Policy of Sree Hari Saradha Vidhyalaya Matriculation School (S.H.S.V.M School) in Pakkam, Thiruvallur District, Tamil Nadu.')}
        path="/privacy"
        pageType="WebPage"
      />

      <div className="container legal-container">
        <div className="legal-card">
          <h1 className="legal-title">{t('privacyPage.title', 'Privacy Policy')}</h1>
          <div className="legal-updated">{t('privacyPage.lastUpdated', 'Last Updated: November 3, 2026')}</div>

          <section className="legal-section">
            <h2 className="legal-section-title">{t('privacyPage.sec1Title', '1. Introduction')}</h2>
            <p className="legal-text">{t('privacyPage.sec1P1')}</p>
            <p className="legal-text">{t('privacyPage.sec1P2')}</p>
          </section>

          <section className="legal-section">
            <h2 className="legal-section-title">{t('privacyPage.sec2Title', '2. Data We Collect')}</h2>
            <p className="legal-text">{t('privacyPage.sec2Intro')}</p>
            <ul className="legal-list">
              <li>
                <strong>Identity Data:</strong> {t('privacyPage.sec2Identity').replace(/^Identity Data:\s*/, '')}
              </li>
              <li>
                <strong>Contact Data:</strong> {t('privacyPage.sec2Contact').replace(/^Contact Data:\s*/, '')}
              </li>
              <li>
                <strong>Academic &amp; Enquiry Data:</strong> {t('privacyPage.sec2Enquiry').replace(/^Academic & Enquiry Data:\s*/, '')}
              </li>
              <li>
                <strong>Technical Data:</strong> {t('privacyPage.sec2Technical').replace(/^Technical Data:\s*/, '')}
              </li>
            </ul>
          </section>

          <section className="legal-section">
            <h2 className="legal-section-title">{t('privacyPage.sec3Title', '3. How We Use Your Data')}</h2>
            <p className="legal-text">{t('privacyPage.sec3Intro')}</p>
            <ul className="legal-list">
              <li>{t('privacyPage.sec3U1')}</li>
              <li>{t('privacyPage.sec3U2')}</li>
              <li>{t('privacyPage.sec3U3')}</li>
              <li>{t('privacyPage.sec3U4')}</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2 className="legal-section-title">{t('privacyPage.sec4Title', '4. Data Security')}</h2>
            <p className="legal-text">{t('privacyPage.sec4P')}</p>
          </section>

          <section className="legal-section">
            <h2 className="legal-section-title">{t('privacyPage.sec5Title', '5. Contact Us')}</h2>
            <p className="legal-text">{t('privacyPage.sec5Intro')}</p>
            <div className="legal-contact-box">
              <div className="legal-contact-item">
                <strong>School:</strong> {t('privacyPage.sec5School')}
              </div>
              <div className="legal-contact-item">
                <strong>Address:</strong> {t('privacyPage.sec5Address')}
              </div>
              <div className="legal-contact-item">
                <strong>Phone:</strong> {t('privacyPage.sec5Phone')}
              </div>
              <div className="legal-contact-item">
                <strong>Hours:</strong> {t('privacyPage.sec5Timings')}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
