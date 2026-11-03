import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './MobileDrawer.css';

/**
 * MobileDrawer Component
 * Off-canvas slide-in menu on mobile viewports.
 */
export default function MobileDrawer({
  isOpen,
  onClose,
  navLinks = []
}) {
  const { t } = useTranslation();
  const filteredNavLinks = navLinks.filter((item) => item.id !== 'admissions');

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
        <div>
          <div className="drawer-header">
            <div className="logo-title" style={{ color: 'var(--color-white)' }}>
              <span className="accent">SHSVM</span> SCHOOL
            </div>
            <button
              type="button"
              className="drawer-close-btn"
              onClick={onClose}
              aria-label="Close menu"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <div className="drawer-links">
            {filteredNavLinks.map((item) => (
              <NavLink
                key={item.id}
                to={item.path}
                className={({ isActive }) => `drawer-link ${isActive ? 'active' : ''}`}
                end={item.path === '/'}
                onClick={onClose}
              >
                {t(item.labelKey)}
              </NavLink>
            ))}
          </div>
        </div>

        <div>
          <Link
            to="/admissions"
            className="btn-pill btn-pill-accent"
            style={{ width: '100%', marginBottom: '14px', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onClick={onClose}
          >
            {t('btnApply')}
          </Link>
          <p style={{ fontSize: '0.75rem', color: 'var(--color-gray-muted)', textAlign: 'center' }}>
            Motto: Smile • Study • Serve | Established 1999
          </p>
        </div>
      </aside>
    </>
  );
}

