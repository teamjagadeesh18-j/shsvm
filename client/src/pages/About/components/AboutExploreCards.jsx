import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Reveal from '../../../components/common/Reveal/Reveal';
import './AboutExploreCards.css';

export default function AboutExploreCards() {
  const { t } = useTranslation();

  const exploreList = [
    {
      to: '/academics',
      title: t('about.exploreAcademicsTitle'),
      desc: t('about.exploreAcademicsDesc')
    },
    {
      to: '/admissions',
      title: t('about.exploreAdmissionsTitle'),
      desc: t('about.exploreAdmissionsDesc')
    },
    {
      to: '/campus',
      title: t('about.exploreCampusTitle'),
      desc: t('about.exploreCampusDesc')
    }
  ];

  return (
    <section className="section about-explore-section">
      <div className="container">
        
        <Reveal>
          <div className="explore-header">
            <h2 className="explore-section-title">
              {t('about.exploreMoreTitle')}
            </h2>
          </div>
        </Reveal>

        <div className="explore-cards-grid">
          {exploreList.map((card, idx) => (
            <Reveal key={idx} delay={idx * 0.15}>
              <Link to={card.to} className="explore-card">
                <div className="explore-card-top">
                  <div className="explore-arrow-circle" aria-hidden="true">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                      <line x1="7" y1="17" x2="17" y2="7" />
                      <polyline points="7 7 17 7 17 17" />
                    </svg>
                  </div>
                </div>

                <div className="explore-card-content">
                  <h3 className="explore-card-title">{card.title}</h3>
                  <p className="explore-card-desc">{card.desc}</p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>

      </div>
    </section>
  );
}
