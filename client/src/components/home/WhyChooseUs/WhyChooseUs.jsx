import React from 'react';
import { useTranslation } from 'react-i18next';
import { getWhyRows } from '../../../services/content';
import WhyRow from '../WhyRow/WhyRow';
import FullBleedSection from '../../common/FullBleedSection/FullBleedSection';
import Reveal from '../../common/Reveal/Reveal';
import './WhyChooseUs.css';

export default function WhyChooseUs({ onSelectRow }) {
  const { t } = useTranslation();
  const rows = getWhyRows();

  return (
    <FullBleedSection
      variant="light"
      className="why-choose-section"
      id="why-choose-us"
      ariaLabel="Why Parents Choose Us"
      withContainer={true}
    >
      {/* Headline: "Why Parents" + "Choose Us?" in gray */}
      <Reveal>
        <h2 className="why-choose-title">
          <span>{t('whyTitle')}</span>{' '}
          <span className="text-muted">{t('whyTitleSub')}</span>
        </h2>
      </Reveal>

      {/* Alternating Rows List with Stagger */}
      <div className="alternating-rows-list">
        {rows.map((row, idx) => (
          <Reveal key={row.id} delay={idx * 0.15}>
            <WhyRow
              variant={row.variant}
              title={t(row.titleKey)}
              description={t(row.descKey)}
              onClick={() => onSelectRow && onSelectRow(row)}
            />
          </Reveal>
        ))}
      </div>
    </FullBleedSection>
  );
}
