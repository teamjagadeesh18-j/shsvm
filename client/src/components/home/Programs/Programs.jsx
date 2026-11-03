import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getPrograms } from '../../../services/content';
import Button from '../../common/Button/Button';
import SectionHeader from '../../common/SectionHeader/SectionHeader';
import ProgramCard from '../../common/ProgramCard/ProgramCard';
import FullBleedSection from '../../common/FullBleedSection/FullBleedSection';
import Reveal from '../../common/Reveal/Reveal';
import './Programs.css';

export default function Programs() {
  const { t } = useTranslation();
  const programs = getPrograms();

  const getProgramIcon = (iconName) => {
    switch (iconName) {
      case 'book-open':
        return (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 19l7-7 3 3-7 7-3-3z" />
            <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
            <path d="M2 2l7.586 7.586" />
            <circle cx="11" cy="11" r="2" />
          </svg>
        );
      case 'compass':
        return (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 18h8" />
            <path d="M3 22h18" />
            <path d="M14 22a7 7 0 1 0-14 0" />
            <path d="M9 14l3.5-3.5" />
            <circle cx="14" cy="9" r="3" />
          </svg>
        );
      case 'award':
      default:
        return (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
            <path d="M6 12v5c3 3 9 3 12 0v-5" />
          </svg>
        );
    }
  };

  return (
    <FullBleedSection
      variant="dark"
      className="programs-section"
      id="programs"
      ariaLabel="Levels of Schooling"
      withContainer={true}
    >
      {/* Section Header Row */}
      <Reveal>
        <SectionHeader
          title={t('programsTitle')}
          subtitle={t('programsSubtitle')}
          action={
            <Button variant="white" to="/academics">
              {t('btnExploreAcademics')}
            </Button>
          }
        />
      </Reveal>

      {/* 3 Dark Rounded Cards Grid with Stagger */}
      <div className="programs-grid">
        {programs.map((prog, idx) => (
          <Reveal key={prog.id} delay={idx * 0.15}>
            <ProgramCard
              icon={getProgramIcon(prog.icon)}
              title={t(prog.titleKey)}
              description={t(prog.descKey)}
            >
              <div className="program-card-footer">
                <span className="card-grade-badge">{prog.grades}</span>
                <Link to={prog.link} className="card-learn-more">
                  <span>{t('learnMore')}</span>
                  <span aria-hidden="true">→</span>
                </Link>
              </div>
            </ProgramCard>
          </Reveal>
        ))}
      </div>
    </FullBleedSection>
  );
}
