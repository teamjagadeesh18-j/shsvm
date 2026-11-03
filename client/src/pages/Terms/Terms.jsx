import React from 'react';
import { useTranslation } from 'react-i18next';
import SEO from '../../components/common/SEO/SEO';
import '../Legal/Legal.css';

export default function Terms() {
  const { t } = useTranslation();

  return (
    <div className="legal-page">
      <SEO
        title={t('termsPage.metaTitle', 'Terms & Conditions | Sree Hari Saradha Vidhyalaya Matriculation School')}
        description={t('termsPage.metaDesc', 'Terms & Conditions for Sree Hari Saradha Vidhyalaya Matriculation School (S.H.S.V.M School) website in Pakkam, Thiruvallur District, Tamil Nadu.')}
        path="/terms"
        pageType="WebPage"
      />

      <div className="container legal-container">
        <div className="legal-card">
          <h1 className="legal-title">{t('termsPage.title', 'Terms & Conditions')}</h1>
          <div className="legal-updated">{t('termsPage.lastUpdated', 'Last Updated: November 3, 2026')}</div>

          <section className="legal-section">
            <h2 className="legal-section-title">{t('termsPage.sec1Title', '1. Agreement to Terms')}</h2>
            <p className="legal-text">{t('termsPage.sec1P')}</p>
          </section>

          <section className="legal-section">
            <h2 className="legal-section-title">{t('termsPage.sec2Title', '2. Use of Services & Website')}</h2>
            <p className="legal-text">{t('termsPage.sec2P')}</p>
          </section>

          <section className="legal-section">
            <h2 className="legal-section-title">{t('termsPage.sec3Title', '3. School Content & Intellectual Property')}</h2>
            <p className="legal-text">{t('termsPage.sec3P')}</p>
          </section>

          <section className="legal-section">
            <h2 className="legal-section-title">{t('termsPage.sec4Title', '4. Admissions, Enquiries & Fees')}</h2>
            <p className="legal-text">{t('termsPage.sec4P')}</p>
          </section>

          <section className="legal-section">
            <h2 className="legal-section-title">{t('termsPage.sec5Title', '5. Limitation of Liability')}</h2>
            <p className="legal-text">{t('termsPage.sec5P')}</p>
          </section>

          <section className="legal-section">
            <h2 className="legal-section-title">{t('termsPage.sec6Title', '6. Changes to Terms')}</h2>
            <p className="legal-text">{t('termsPage.sec6P')}</p>
          </section>

          <section className="legal-section">
            <h2 className="legal-section-title">{t('termsPage.sec7Title', '7. Contact Information')}</h2>
            <p className="legal-text">{t('termsPage.sec7P')}</p>
            <div className="legal-contact-box">
              <div className="legal-contact-item">
                <strong>School:</strong> {t('termsPage.sec7School')}
              </div>
              <div className="legal-contact-item">
                <strong>Address:</strong> {t('termsPage.sec7Address')}
              </div>
              <div className="legal-contact-item">
                <strong>Phone:</strong> {t('termsPage.sec7Phone')}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
