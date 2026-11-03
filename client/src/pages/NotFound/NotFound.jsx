import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import './NotFound.css';

export default function NotFound() {
  const { t } = useTranslation();

  return (
    <>
      <Helmet>
        <title>{t('notfound.pageTitle', '404 - Page Not Found | S.H.S.V.M School, Pakkam')}</title>
        <meta name="description" content={t('notfound.pageDescription', 'The requested page could not be found.')} />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <section className="not-found-section bg-grid">
        <div className="hero-glow-circle" aria-hidden="true" />
        <div className="not-found-card">
          <div className="not-found-code">404</div>
          <h1 className="not-found-title">{t('notfound.title', 'Page Not Found')}</h1>
          <p className="not-found-desc">
            {t('notfound.desc', 'The page you are looking for does not exist or has been moved.')}
          </p>
          <div className="not-found-actions">
            <Link to="/" className="btn-pill btn-pill-accent">
              {t('notfound.returnHome', 'Return to Home')}
            </Link>
            <Link to="/contact" className="btn-pill btn-pill-white">
              {t('notfound.contactOffice', 'Contact School Office')}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
