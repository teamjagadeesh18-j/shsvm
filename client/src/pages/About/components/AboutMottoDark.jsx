import React from 'react';
import { useTranslation } from 'react-i18next';
import Icon from '../../../components/common/Icon/Icon';
import Button from '../../../components/common/Button/Button';
import Reveal from '../../../components/common/Reveal/Reveal';
import './AboutMottoDark.css';

export default function AboutMottoDark({ learningProcess = [], visionMission = [], onOpenEnquiry }) {
  const { t } = useTranslation();

  return (
    <section className="section section-dark about-motto-dark-section bg-grid-dark">
      <div className="container">

        {/* 2-Column Split Header */}
        <Reveal>
          <div className="motto-split-header">
            <div className="motto-header-left">
              <div className="section-tag-pill tag-dark-pill">
                {t('about.mottoTag')}
              </div>
              <h2 className="motto-main-title">
                {t('about.mottoTitle')} <br className="title-break" />
                <span className="text-muted">{t('about.mottoHighlight')}</span>
              </h2>
            </div>
            <div className="motto-header-right">
              <p className="motto-lead-desc">
                {t('about.mottoSubtitle')}
              </p>
            </div>
          </div>
        </Reveal>

        {/* 6 Dark Step Cards with Stagger */}
        <div className="dark-steps-grid-3col">
          {learningProcess.map((step, idx) => (
            <Reveal key={step.step} delay={idx * 0.1}>
              <div className="dark-step-card-box">
                <span className="dark-step-pill-label">
                  Step {step.step}
                </span>
                <h3 className="dark-step-title">{step.title}</h3>
                <p className="dark-step-desc">{step.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>

        {/* THREE Tall Dark Rounded Cards with Stagger */}
        <div className="tall-cards-grid-3col">
          {visionMission.map((item, index) => (
            <Reveal key={index} delay={index * 0.15}>
              <div className="tall-dark-card-box">
                <div className="tall-card-top-content">
                  <span className="tall-card-index-num">0{index + 1}</span>
                  <h3 className="tall-card-main-title">{item.title}</h3>
                  <p className="tall-card-lead-desc">{item.desc}</p>
                </div>

                {item.points && (
                  <ul className="tall-card-bullet-list">
                    {item.points.map((pt, pIdx) => (
                      <li key={pIdx} className="tall-card-bullet-item">
                        <span className="tall-bullet-icon" aria-hidden="true">
                          <Icon name="check" size={14} strokeWidth={2.5} />
                        </span>
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                )}

                <div className="tall-card-action-wrap">
                  <Button
                    variant="white"
                    className="tall-card-action-btn"
                    onClick={onOpenEnquiry}
                    to={!onOpenEnquiry ? '/admissions' : undefined}
                  >
                    {t('btnApply')}
                  </Button>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

      </div>
    </section>
  );
}
