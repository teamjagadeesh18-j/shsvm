import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Reveal from '../../../components/common/Reveal/Reveal';
import './AboutStoryMilestones.css';

export default function AboutStoryMilestones({ milestones = [] }) {
  const { t } = useTranslation();

  return (
    <section className="section about-story-section bg-grid">
      <div className="container">
        
        {/* 2-Column Header Block */}
        <Reveal>
          <div className="story-split-header">
            <div className="story-header-left">
              <div className="section-tag-pill">
                {t('about.storyBadge')}
              </div>
              <h2 className="story-main-title">
                {t('about.storyTitle')} <br className="title-break" />
                <span className="text-muted">{t('about.storyHighlight')}</span>
              </h2>
            </div>
            <div className="story-header-right">
              <p className="story-lead-desc">
                {t('about.storySubtitle')}
              </p>
            </div>
          </div>
        </Reveal>

        {/* Subheading with Vertical Accent Bar */}
        <Reveal delay={0.1}>
          <div className="milestones-bar">
            <span className="milestones-bar-accent" aria-hidden="true" />
            <h3 className="milestones-bar-title">{t('about.journeyHeading')}</h3>
          </div>
        </Reveal>

        {/* 4-Column Step-Card Grid with Stagger Animation */}
        <div className="milestones-grid-4col">
          {milestones.map((item, idx) => (
            <Reveal key={item.step} delay={idx * 0.1}>
              <div className="milestone-card-4col">
                <span className="milestone-faded-corner" aria-hidden="true">
                  {item.step}
                </span>
                <div className="milestone-card-inner">
                  <div className="milestone-step-header">
                    <span className="milestone-step-tag">Step {item.step}</span>
                    <span className="milestone-year-text">{item.year}</span>
                  </div>
                  <h4 className="milestone-card-heading">{item.title}</h4>
                  <p className="milestone-card-paragraph">{item.desc}</p>
                </div>
              </div>
            </Reveal>
          ))}

          {/* Final Card: Solid Black Card */}
          <Reveal delay={milestones.length * 0.1}>
            <div className="milestone-card-4col milestone-card-black">
              <div className="final-sparkle-icon" aria-hidden="true">
                ✦
              </div>
              <h4 className="final-card-heading">
                {t('about.finalCardTitle')}
              </h4>
              <p className="final-card-subheading">
                {t('about.finalCardDesc')}
              </p>
              <Link to="/academics" className="final-card-action-link">
                {t('about.finalCardAction')}
              </Link>
            </div>
          </Reveal>
        </div>

      </div>
    </section>
  );
}
