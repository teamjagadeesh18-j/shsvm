import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SEO from '../../components/common/SEO/SEO';
import PageHero from '../../components/common/PageHero/PageHero';
import ImageSlot from '../../components/common/ImageSlot/ImageSlot';
import Button from '../../components/common/Button/Button';
import Icon from '../../components/common/Icon/Icon';
import SectionHeader from '../../components/common/SectionHeader/SectionHeader';
import ProgramCard from '../../components/common/ProgramCard/ProgramCard';
import WhyRow from '../../components/home/WhyRow/WhyRow';
import Reveal from '../../components/common/Reveal/Reveal';
import { getAcademicsData } from '../../services/content';
import './Academics.css';

export default function Academics({ onOpenEnquiry }) {
  const { t } = useTranslation();
  const { stages = [], dailySchedule = [] } = getAcademicsData();

  return (
    <div className="academics-page">
      <SEO
        title="Academics & State Board Curriculum | S.H.S.V.M School, Pakkam"
        description="Academics at SHSVM School, Pakkam: Primary, Upper Primary, and Secondary schooling following the Tamil Nadu State Board curriculum."
        path="/academics"
      />

      {/* 1. Page Hero */}
      <PageHero
        badge={t('academics.heroBadge')}
        title={t('academics.heroTitle')}
        highlight={t('academics.heroHighlight')}
        subtitle={t('academics.heroSubtitle')}
      />

      {/* 2. Visual Photos Grid (4 Authentic School Photos) */}
      <section className="section academics-photos-section">
        <div className="container">
          <Reveal>
            <div className="academics-photos-grid">
              <div className="academics-photo-item">
                <ImageSlot
                  slotKey="academics.gallery1"
                  ratio="4/3"
                  alt="SHSVM Students Celebrating Chandrayaan-3 Achievement"
                />
                <div className="academics-photo-caption">
                  <span className="academics-photo-tag">Science & Enquiry</span>
                  <h4>Chandrayaan-3 Celebration</h4>
                </div>
              </div>

              <div className="academics-photo-item">
                <ImageSlot
                  slotKey="academics.gallery2"
                  ratio="4/3"
                  alt="Parent-Teacher General Assembly in SHSVM Campus Courtyard"
                />
                <div className="academics-photo-caption">
                  <span className="academics-photo-tag">Campus Community</span>
                  <h4>General Body Assembly</h4>
                </div>
              </div>

              <div className="academics-photo-item">
                <ImageSlot
                  slotKey="academics.gallery3"
                  ratio="4/3"
                  alt="Campus Courtyard & School Building"
                />
                <div className="academics-photo-caption">
                  <span className="academics-photo-tag">Learning Environment</span>
                  <h4>Campus Courtyard</h4>
                </div>
              </div>

              <div className="academics-photo-item">
                <ImageSlot
                  slotKey="academics.gallery4"
                  ratio="4/3"
                  alt="Academic Honors & World Record Felicitation"
                />
                <div className="academics-photo-caption">
                  <span className="academics-photo-tag">Academic Honors</span>
                  <h4>World Record Felicitation</h4>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 3. Stage-Wise Continuum (3 Stages: Primary, Upper Primary, Secondary) */}
      <section className="section section-dark">
        <div className="container">
          <Reveal>
            <SectionHeader
              tag={t('academics.continuumTag')}
              title={t('academics.continuumTitle')}
              subtitle="Co-educational schooling following the Tamil Nadu State Board curriculum across academic subjects, arts, and physical education."
            />
          </Reveal>

          <div className="programs-grid" style={{ marginBottom: '24px' }}>
            {stages.map((st, idx) => (
              <Reveal key={st.id} delay={idx * 0.15}>
                <ProgramCard
                  id={st.id}
                  icon={<Icon name={st.icon} size={22} strokeWidth={2} />}
                  title={st.title}
                  description={st.desc}
                  highlightTag={st.focus}
                />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Daily Routine & Schedule */}
      <section className="section why-choose-section">
        <div className="container">
          <Reveal>
            <h2 className="why-choose-title">
              {t('academics.rhythmTitle')} <span className="text-muted">{t('academics.rhythmSubtitle')}</span>
            </h2>
          </Reveal>

          <div className="alternating-rows-list">
            {dailySchedule.map((item, index) => (
              <Reveal key={index} delay={index * 0.1}>
                <WhyRow
                  variant={item.variant}
                  title={item.time}
                  description={item.desc}
                  icon={item.icon}
                  showArrow={false}
                />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 5. CTA Card */}
      <section className="section" style={{ padding: '20px 0 80px' }}>
        <div className="container">
          <Reveal>
            <div className="academics-cta-panel">
              <h2>
                {t('academics.ctaTitle')} <span style={{ color: 'var(--color-accent)' }}>{t('academics.ctaHighlight')}</span>
              </h2>
              <p>
                {t('academics.ctaText')}
              </p>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
                <Button variant="accent" size="lg" onClick={onOpenEnquiry}>
                  {t('academics.ctaButton')}
                </Button>
                <Link to="/contact" className="btn-pill btn-pill-outline" style={{ display: 'inline-flex', alignItems: 'center' }}>
                  Contact Campus
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
