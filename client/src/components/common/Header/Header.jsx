import React, { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ImageSlot from '../ImageSlot/ImageSlot';
import MobileDrawer from './MobileDrawer';
import { getNavLinks } from '../../../services/content';
import './Header.css';

export default function Header({ onOpenEnquiry }) {
  const { t } = useTranslation();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const allNavLinks = getNavLinks();
  const desktopNavLinks = allNavLinks.filter((item) =>
    ['home', 'about', 'academics', 'contact'].includes(item.id)
  );

  // Handle escape key to close drawer
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && drawerOpen) {
        setDrawerOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [drawerOpen]);

  return (
    <>
      <header className="site-header">
        <div className="container header-container">
          
          {/* Logo Tile */}
          <Link to="/" className="header-logo" aria-label="SHSVM Home">
            <div className="logo-badge">
              <ImageSlot
                slotKey="school.logo"
                ratio="1/1"
                alt="Sree Hari Saradha Vidhyalaya Matriculation School Crest"
                className="school-logo-slot"
              />
            </div>
            <div className="logo-text">
              <div className="logo-title">
                <span className="accent">SHSVM</span>
              </div>
              <span className="logo-subtitle">{t('schoolTagline')}</span>
            </div>
          </Link>

          {/* Center: Black Rounded Rectangle Nav Container  */}
          <nav className="header-nav-box header-nav-desktop" aria-label="Main Navigation">
            {desktopNavLinks.map((item, index) => (
              <React.Fragment key={item.id}>
                {index > 0 && <div className="nav-divider" aria-hidden="true" />}
                <NavLink
                  to={item.path}
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                  end={item.path === '/'}
                >
                  {t(item.labelKey)}
                </NavLink>
              </React.Fragment>
            ))}
          </nav>

          {/* Right Header Actions */}
          <div className="header-actions">
            {/* Black Pill Action Button */}
            <Link
              to="/admissions"
              className="btn-pill btn-pill-black header-cta-desktop"
            >
              {t('btnApply')}
            </Link>

            {/* Hamburger Menu Button  */}
            <button
              type="button"
              className="hamburger-btn"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open menu drawer"
              aria-expanded={drawerOpen}
            >
              <svg width="20" height="14" viewBox="0 0 20 14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <line x1="1" y1="3" x2="19" y2="3" />
                <line x1="1" y1="11" x2="19" y2="11" />
              </svg>
            </button>
          </div>

        </div>
      </header>

      {/* Mobile Nav Drawer */}
      <MobileDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        navLinks={allNavLinks}
        onOpenEnquiry={onOpenEnquiry}
      />
    </>
  );
}

