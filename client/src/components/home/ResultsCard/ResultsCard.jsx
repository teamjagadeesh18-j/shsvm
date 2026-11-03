import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import useInViewReplay from '../../../hooks/useInViewReplay';
import './ResultsCard.css';

export default function ResultsCard() {
  const { t } = useTranslation();
  const { ref, isVisible, isReduced } = useInViewReplay({ threshold: 0.3, rootMargin: '0px 0px -10% 0px' });
  const [establishedYear, setEstablishedYear] = useState(() => (isReduced ? 1999 : 1990));

  useEffect(() => {
    if (!isVisible || isReduced) return;

    const startYear = 1990;
    const targetYear = 1999;
    const duration = 900;
    const startTime = performance.now();

    let rafId;
    const tick = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(startYear + (targetYear - startYear) * eased);
      setEstablishedYear(current);

      if (progress < 1) {
        rafId = requestAnimationFrame(tick);
      } else {
        setEstablishedYear(targetYear);
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(rafId);
      setEstablishedYear(1990);
    };
  }, [isVisible, isReduced]);

  return (
    <div
      ref={ref}
      className={`dashboard-card results-card ${isVisible ? 'is-animated' : ''}`}
    >
      <div className="dashboard-card-header">
        <span className="dashboard-card-title">{t('card2Title')}</span>
      </div>

      {/* Two Stat Mini Tiles */}
      <div className="stats-mini-grid">
        <div
          className="stat-mini-tile stat-tile-1"
          aria-label={`${t('statPassRate')} 1999`}
        >
          <div className="stat-mini-val stat-val-established">
            {establishedYear}
          </div>
          <div className="stat-mini-lbl">{t('statPassRate')}</div>
        </div>
        <div
          className="stat-mini-tile stat-tile-2"
          aria-label={`${t('statStudents')} Co-Ed`}
        >
          <div className="stat-mini-val stat-val-coed">
            Co-Ed
          </div>
          <div className="stat-mini-lbl">{t('statStudents')}</div>
        </div>
      </div>

      {/* Levels We Teach Staircase */}
      <div className="levels-section">
        <div className="levels-title-row">
          <span className="levels-title">{t('levelsWeTeach')}</span>
        </div>

        <div className="levels-staircase" aria-label={t('levelsWeTeach')}>
          {/* Primary Step */}
          <div className="level-col" style={{ '--step-idx': 0 }}>
            <div className="level-bar-slot">
              <div
                className="level-bar level-bar-primary"
                style={{ height: '40%' }}
                role="img"
                tabIndex={0}
                aria-label={`${t('levelPrimary')}: 40%`}
              />
            </div>
            <span className="level-label">{t('levelPrimary')}</span>
          </div>

          {/* Middle Step */}
          <div className="level-col" style={{ '--step-idx': 1 }}>
            <div className="level-bar-slot">
              <div
                className="level-bar level-bar-middle"
                style={{ height: '65%' }}
                role="img"
                tabIndex={0}
                aria-label={`${t('levelMiddle')}: 65%`}
              />
            </div>
            <span className="level-label">{t('levelMiddle')}</span>
          </div>

          {/* Secondary Step */}
          <div className="level-col" style={{ '--step-idx': 2 }}>
            <div className="level-bar-slot">
              <div
                className="level-bar level-bar-secondary"
                style={{ height: '100%' }}
                role="img"
                tabIndex={0}
                aria-label={`${t('levelSecondary')}: 100%`}
              />
            </div>
            <span className="level-label">{t('levelSecondary')}</span>
          </div>
        </div>

        <div className="levels-desc">{t('levelsDesc')}</div>
      </div>
    </div>
  );
}
