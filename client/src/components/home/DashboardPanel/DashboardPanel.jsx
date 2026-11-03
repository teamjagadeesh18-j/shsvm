import React from 'react';
import { useTranslation } from 'react-i18next';
import OutlineButton from '../../common/OutlineButton/OutlineButton';
import SectionPill from '../../common/SectionPill/SectionPill';
import PanelSection from '../../common/PanelSection/PanelSection';
import Icon from '../../common/Icon/Icon';
import CalendarWidget from '../CalendarWidget/CalendarWidget';
import ResultsCard from '../ResultsCard/ResultsCard';
import Reveal from '../../common/Reveal/Reveal';
import useInViewReplay from '../../../hooks/useInViewReplay';
import './DashboardPanel.css';

const BEYOND_ITEMS = [
  { id: 'sports', icon: 'sports', textKey: 'beyond1' },
  { id: 'arts', icon: 'arts', textKey: 'beyond2' },
  { id: 'book', icon: 'book', textKey: 'beyond3' },
  { id: 'community', icon: 'community', textKey: 'beyond4' }
];

export default function DashboardPanel({ _onOpenEnquiry, mockDate }) {
  const { t } = useTranslation();
  const { ref: beyondRef, isVisible: isBeyondVisible } = useInViewReplay({
    threshold: 0.3,
    rootMargin: '0px 0px -10% 0px'
  });

  return (
    <PanelSection id="campus-life" ariaLabel="Life at SHSVM Campus">
      <Reveal>
        {/* Top Row: Tag Pill & Headline + Outline Button */}
        <div className="life-panel-top">
          <div>
            <SectionPill variant="dark" style={{ marginBottom: '16px' }}>
              {t('tagLife')}
            </SectionPill>
            <h2 className="life-panel-title">
              <span>{t('lifeTitle')}</span>{' '}
              <span className="text-muted">{t('lifeTitleSub')}</span>
            </h2>
          </div>
          <div>
            <OutlineButton to="/campus" arrow={true}>
              Campus Highlights
            </OutlineButton>
          </div>
        </div>

        {/* 3 Dashboard-Style Dark Cards (Equal Heights on Desktop, Top-Aligned Content) */}
        <div className="dashboard-cards-grid">
          {/* Card 01: Academic Schedule & Routine (Reference Height) */}
          <div className="dashboard-card calendar-card">
            <div className="dashboard-card-header">
              <span className="dashboard-card-title">{t('card1Title')}</span>
            </div>
            <CalendarWidget mockDate={mockDate} />
          </div>

          {/* Card 02: Provable School Facts */}
          <ResultsCard />

          {/* Card 03: Beyond the Classroom */}
          <div
            ref={beyondRef}
            className={`dashboard-card beyond-card ${isBeyondVisible ? 'is-animated' : ''}`}
          >
            <div className="dashboard-card-header">
              <span className="dashboard-card-title">{t('card3Title')}</span>
              <span className="dashboard-card-subtitle">{t('card3Subtitle')}</span>
            </div>

            <div className="beyond-list">
              {BEYOND_ITEMS.map((item, idx) => (
                <div
                  key={item.id}
                  className="beyond-item"
                  tabIndex={0}
                  role="listitem"
                  style={{ '--item-idx': idx }}
                >
                  <span className="beyond-item-icon">
                    <Icon name={item.icon} size={20} />
                  </span>
                  <span className="beyond-item-text">{t(item.textKey)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Reveal>
    </PanelSection>
  );
}
