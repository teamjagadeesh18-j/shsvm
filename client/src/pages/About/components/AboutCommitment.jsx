import React from 'react';
import { useTranslation } from 'react-i18next';
import Icon from '../../../components/common/Icon/Icon';
import Reveal from '../../../components/common/Reveal/Reveal';
import './AboutCommitment.css';

export default function AboutCommitment() {
  const { t } = useTranslation();

  const rawChecklist = t('about.checklistItems', { returnObjects: true });
  const checklistItems = Array.isArray(rawChecklist) ? rawChecklist : [];
  const rawDepts = t('about.departmentHeads', { returnObjects: true });
  const departmentHeads = Array.isArray(rawDepts) ? rawDepts : [];

  return (
    <section className="section about-commitment-section bg-grid">
      <div className="container">

        {/* Section Header */}
        <Reveal>
          <div className="about-section-header">
            <div className="section-tag-pill">
              {t('about.standForBadge')}
            </div>
            <h2 className="about-section-title">
              {t('about.standForTitle')}{' '}
              <span className="text-muted">{t('about.standForHighlight')}</span>
            </h2>
          </div>
        </Reveal>

        {/* Part 1: Two-Column Checklist */}
        <Reveal delay={0.1}>
          <div className="commitment-block">
            <div className="commitment-block-header">
              <span className="commitment-block-title">{t('about.checklistTitle')}</span>
              <div className="commitment-block-line" aria-hidden="true" />
            </div>

            <div className="checklist-grid">
              {checklistItems.map((item, idx) => (
                <div key={idx} className="checklist-item">
                  <div className="checklist-check-icon">
                    <Icon name="check" size={16} strokeWidth={2.5} />
                  </div>
                  <span className="checklist-text">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        {/* Part 2: Department Areas Bordered Row List */}
        <Reveal delay={0.15}>
          <div className="commitment-block">
            <div className="commitment-block-header">
              <span className="commitment-block-title">{t('about.leadershipListTitle')}</span>
              <div className="commitment-block-line" aria-hidden="true" />
            </div>

            <div className="dept-heads-list">
              {departmentHeads.map((dept, idx) => (
                <div key={idx} className="dept-head-row">
                  <div className="dept-head-left">
                    <span className="dept-name">{dept.dept}</span>
                  </div>
                  <div className="dept-head-right">
                    <span className="dept-lead">{dept.head}</span>
                    <span className="dept-qual">({dept.qualification})</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        {/* Part 3: Dual Facility Highlight Cards */}
        <div className="facilities-dual-grid">
          <Reveal delay={0.1}>
            <div className="facility-card facility-card-light">
              <span className="facility-badge">ACADEMIC RESOURCES</span>
              <h3 className="facility-title">{t('about.academicFacilityTitle')}</h3>
              <p className="facility-desc">{t('about.academicFacilityDesc')}</p>
            </div>
          </Reveal>

          <Reveal delay={0.2}>
            <div className="facility-card facility-card-dark">
              <span className="facility-badge badge-dark">WELLNESS & SUPPORT</span>
              <h3 className="facility-title title-dark">{t('about.holisticFacilityTitle')}</h3>
              <p className="facility-desc desc-dark">{t('about.holisticFacilityDesc')}</p>
            </div>
          </Reveal>
        </div>

      </div>
    </section>
  );
}
