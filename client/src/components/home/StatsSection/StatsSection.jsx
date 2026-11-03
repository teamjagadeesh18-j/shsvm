import React from 'react';
import { useTranslation } from 'react-i18next';
import { getStats } from '../../../services/content';
import StatsCard from '../StatsCard/StatsCard';
import FullBleedSection from '../../common/FullBleedSection/FullBleedSection';
import Reveal from '../../common/Reveal/Reveal';
import './StatsSection.css';

export default function StatsSection() {
  const { t } = useTranslation();
  const stats = getStats();

  return (
    <FullBleedSection
      variant="light"
      className="stats-section"
      id="stats"
      ariaLabel="School Achievements & Statistics"
      withContainer={true}
    >
      <div className="stats-row-grid">
        {stats.map((stat, idx) => (
          <Reveal key={stat.id} delay={idx * 0.15}>
            <StatsCard
              number={stat.number}
              title={t(stat.titleKey)}
              description={t(stat.descKey)}
            />
          </Reveal>
        ))}
      </div>
    </FullBleedSection>
  );
}
