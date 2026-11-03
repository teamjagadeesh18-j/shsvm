import React, { useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getSettings } from '../../../services/content';
import './MobileDrawer.css';

/**
 * MobileDrawer Component
 * Full-screen mobile navigation drawer with bold editorial typography,
 * campus info, contact details, and social channels in our dark theme.
 */
export default function MobileDrawer({
  isOpen,
  onClose,
  navLinks = []
}) {
  const { t } = useTranslation();
  const settings = getSettings();

  const phoneDisplay = settings?.phone || '+91 89394 21231';
  const phoneTel = `tel:${settings?.phoneRaw || '+918939421231'}`;
  const instagramUrl = settings?.social?.instagram || 'https://www.instagram.com/shsvms_pakkam/';
  const facebookUrl = settings?.social?.facebook || 'https://www.facebook.com/shreehari.saradha/';
  const youtubeUrl = settings?.social?.youtube || 'https://www.youtube.com/watch?v=-NHgGxGt3wg';

  // Prevent background scrolling when drawer is open
  useEffect(() => {
    if (isOpen) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [isOpen]);

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      <div
        className={`drawer-backdrop ${isOpen ? 'open' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Mobile Nav Drawer */}
      <aside
        className={`mobile-nav-drawer ${isOpen ? 'open' : ''}`}
        aria-label="Mobile Navigation Drawer"
      >
        <div className="drawer-inner">
          {/* Top Brand Header Bar */}
          <div className="drawer-header">
            <Link to="/" className="drawer-brand" onClick={onClose} aria-label="SHSVM Home">
              <div className="drawer-logo-badge">
                <img
                  src="/images/logo.png"
                  alt=""
                  width="36"
                  height="36"
                  className="drawer-logo-img"
                />
              </div>
              <div className="drawer-brand-name">
                <span className="drawer-brand-accent">SHSVM</span>
                <span className="drawer-brand-sub"> SCHOOL</span>
              </div>
            </Link>

            <button
              type="button"
              className="drawer-close-btn"
              onClick={onClose}
              aria-label={t('drawer.closeAria', 'Close navigation menu')}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Main Large Editorial Navigation Links */}
          <nav className="drawer-nav" aria-label="Mobile Menu Links">
            <div className="drawer-links-list">
              {navLinks.map((item) => (
                <NavLink
                  key={item.id}
                  to={item.path}
                  className={({ isActive }) => `drawer-nav-item ${isActive ? 'active' : ''}`}
                  end={item.path === '/'}
                  onClick={onClose}
                >
                  <span className="drawer-nav-label">{t(item.labelKey)}</span>
                </NavLink>
              ))}
            </div>
          </nav>

          {/* Bottom Information Block (Matching heedhive layout in our theme) */}
          <div className="drawer-bottom-info">
            <div className="drawer-info-block">
              <span className="drawer-info-heading">{t('drawer.ourCampus', 'Our campus')}</span>
              <div className="drawer-info-title">{t('drawer.campusCity', 'Pakkam')}</div>
              <div className="drawer-info-subtitle">{t('drawer.campusState', 'Thiruvallur District, Tamil Nadu')}</div>
            </div>

            <div className="drawer-info-block">
              <span className="drawer-info-heading">{t('drawer.contactHeading', 'School Hours & Contact')}</span>
              <div className="drawer-info-phone">
                <a href={phoneTel} className="drawer-phone-link">{phoneDisplay}</a>
              </div>
              <div className="drawer-info-timings">{t('drawer.timings', 'Mon to Sat, 8:00 AM – 5:30 PM')}</div>
            </div>

            {/* Social Follow Icons */}
            <div className="drawer-social-block">
              <span className="drawer-info-heading">{t('drawer.followUs', 'Follow us')}</span>
              <div className="drawer-social-icons">
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="drawer-social-box"
                  aria-label="Instagram (opens in new tab)"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                  </svg>
                </a>
                <a
                  href={facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="drawer-social-box"
                  aria-label="Facebook (opens in new tab)"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                  </svg>
                </a>
                <a
                  href={youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="drawer-social-box"
                  aria-label="YouTube (opens in new tab)"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
                    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Quick Action Button */}
            <div className="drawer-actions">
              <Link
                to="/admissions"
                className="btn-pill btn-pill-accent drawer-cta-btn"
                onClick={onClose}
              >
                {t('btnApply')}
              </Link>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
