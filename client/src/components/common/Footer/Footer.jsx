import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getSettings } from '../../../services/content';
import './Footer.css';

/**
 * Global Site Footer Component
 * School Footer Component
 */
export default function Footer() {
  const { t } = useTranslation();
  const settings = getSettings();

  const facebookUrl = settings?.social?.facebook || 'https://www.facebook.com/shreehari.saradha/';
  const instagramUrl = settings?.social?.instagram || 'https://www.instagram.com/shsvms_pakkam/';
  const youtubeUrl = settings?.social?.youtube || 'https://www.youtube.com/watch?v=-NHgGxGt3wg';
  const phoneDisplay = settings?.phone || '+91 89394 21231';
  const phoneTel = settings?.phoneRaw || '+918939421231';
  const openInMapsUrl = settings?.openInMapsUrl || 'https://www.google.com/maps/search/?api=1&query=13.1536061,80.0378861';

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-top-grid">
          
          {/* Column 1: Brand Wordmark, Tagline & Socials */}
          <div className="footer-brand-col">
            <div className="footer-brand-title">SHSVM.</div>
            <p className="footer-tagline">
              {t('footerAbout')}
            </p>
            <div className="footer-socials">
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-btn"
                aria-label="Instagram (opens in new tab)"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
              <a
                href={facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-btn"
                aria-label="Facebook (opens in new tab)"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>
              <a
                href={youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-btn"
                aria-label="YouTube (opens in new tab)"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
                  <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
                </svg>
              </a>
            </div>
          </div>

          {/* Column 2: QUICK LINKS */}
          <div className="footer-links-col">
            <h4 className="footer-heading">{t('quickLinks')}</h4>
            <ul className="footer-nav-list">
              <li><Link to="/about">{t('navAbout')}</Link></li>
              <li><Link to="/academics">{t('navAcademics')}</Link></li>
              <li><Link to="/campus">{t('navCampus')}</Link></li>
              <li><Link to="/contact">{t('navContact')}</Link></li>
            </ul>
          </div>

          {/* Column 3: GET IN TOUCH */}
          <div className="footer-contact-col">
            <h4 className="footer-heading">{t('contactUs')}</h4>
            <div className="footer-contact-text">
              <a href={`tel:${phoneTel}`} className="footer-phone-link">
                {phoneDisplay}
              </a>
              <div className="footer-address-line">Pakkam, Thiruvallur District,</div>
              <div className="footer-address-line">Tamil Nadu, PIN 602024</div>
              <a
                href={openInMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="footer-map-link"
              >
                {t('location.footerMapLink')} ↗
              </a>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom-bar">
          <div className="footer-copyright">
            {t('copyright')}
          </div>
          <div className="footer-legal-links">
            <Link to="/contact">{t('privacy')}</Link>
            <span className="footer-dot" aria-hidden="true">·</span>
            <Link to="/contact">{t('terms')}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
