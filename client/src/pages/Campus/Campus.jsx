import React from 'react';
import { useTranslation } from 'react-i18next';
import SEO from '../../components/common/SEO/SEO';
import PageHero from '../../components/common/PageHero/PageHero';
import ImageSlot from '../../components/common/ImageSlot/ImageSlot';
import Button from '../../components/common/Button/Button';
import Reveal from '../../components/common/Reveal/Reveal';
import { getCampusData } from '../../services/content';
import './Campus.css';

export default function Campus() {
  const { t } = useTranslation();
  const { facilities = [] } = getCampusData();

  const getFacilityIcon = (iconName) => {
    switch (iconName) {
      case 'book':
        return (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
          </svg>
        );
      case 'award':
        return (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="8" r="7" />
            <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
          </svg>
        );
      case 'shield':
      default:
        return (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        );
    }
  };

  return (
    <div className="campus-page">
      <SEO
        title="Campus & Facilities | S.H.S.V.M School, Pakkam"
        description="Explore the campus facilities of SHSVM School, Pakkam: Academic Book Bank, Recreation Playground, and on-campus Medical Support."
        path="/campus"
      />

      {/* 1. Page Hero */}
      <PageHero
        badge={t('campus.heroBadge')}
        title={t('campus.heroTitle')}
        highlight={t('campus.heroHighlight')}
        subtitle={t('campus.heroSubtitle')}
      />

      {/* 2. Visual Photo Showcase */}
      <section className="section" style={{ padding: '20px 0 60px' }}>
        <div className="container">
          <Reveal>
            <div className="campus-top-photos-grid">
              <ImageSlot slotKey="campus.front" ratio="16/9" alt="SHSVM School Campus in Pakkam" />
              <ImageSlot slotKey="campus.sports" ratio="16/9" alt="Recreation playground and sports activities" />
            </div>
          </Reveal>
        </div>
      </section>

      {/* 3. Facilities Dark Section: Only the 3 Provided Facilities */}
      <section className="section section-dark">
        <div className="container">
          <Reveal>
            <div className="section-header-row">
              <div className="section-title-wrap">
                <div className="tag-pill" style={{ color: 'var(--color-accent)', borderColor: 'var(--color-accent-glow)' }}>
                  CAMPUS INFRASTRUCTURE
                </div>
                <h2 className="section-title-white">Essential School Facilities</h2>
                <p className="section-subtitle-gray">
                  Core facilities designed to support academic studies, physical wellness, and student health in Pakkam.
                </p>
              </div>
            </div>
          </Reveal>

          <div className="programs-grid">
            {facilities.map((fac, idx) => (
              <Reveal key={idx} delay={idx * 0.15}>
                <div className="program-card">
                  <div className="card-icon-tile">{getFacilityIcon(fac.icon)}</div>
                  <div className="card-content">
                    <h3>{fac.title}</h3>
                    <p>{fac.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          <div style={{ marginTop: '48px', textAlign: 'center', display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button to="/admissions" variant="white" size="md">
              Apply for Admission
            </Button>
            <Button to="/contact" variant="outline" size="md" style={{ color: 'var(--color-white)', borderColor: 'var(--color-white-a30)' }}>
              Contact & Visit Campus
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
