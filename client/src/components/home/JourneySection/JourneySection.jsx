import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PanelSection from '../../common/PanelSection/PanelSection';
import SectionPill from '../../common/SectionPill/SectionPill';
import Button from '../../common/Button/Button';
import OutlineButton from '../../common/OutlineButton/OutlineButton';
import ImageSlot from '../../common/ImageSlot/ImageSlot';
import ScrollTimeline from '../../common/ScrollTimeline/ScrollTimeline';
import { getJourney } from '../../../services/content';
import './JourneySection.css';

/**
 * JourneySection Component
 * Light Inset Panel showing student progression using a continuous scroll-driven timeline.
 * Desktop: 2-column layout with sticky pinned illustration and 2-way sync with stone hotspots.
 * Mobile: Responsive single-column with illustration first, followed by timeline cards.
 */
export default function JourneySection() {
  const { t } = useTranslation();
  const journeyData = getJourney();
  const stages = journeyData?.stages || [];

  const [currentStepId, setCurrentStepId] = useState(null);
  const [hoveredStageId, setHoveredStageId] = useState(null);
  const [hasAnimated, setHasAnimated] = useState(false);
  const sectionRef = useRef(null);

  const activeStageId = hoveredStageId || currentStepId;

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setHasAnimated(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleMobileDotClick = (stageId) => {
    setHoveredStageId(stageId);
  };

  const timelineItems = stages.map((st) => ({
    id: st.id,
    number: st.number,
    title: t(st.titleKey),
    desc: t(st.descKey),
    link: st.link,
    icon: st.icon
  }));

  return (
    <PanelSection
      variant="light"
      id="journey"
      withGrid={true}
      ariaLabel={t('journey.pill')}
      className="journey-panel-section"
    >
      <div ref={sectionRef} className="journey-layout-grid">
        
        {/* Left Column: Heading, Subtext, Scroll Progress Timeline, Actions */}
        <div className="journey-info-col">
          <div className="journey-header-block">
            <SectionPill text={t('journey.pill')} variant="light" />
            <h2 className="journey-heading">
              {t('journey.titlePrefix')}<span className="text-muted">{t('journey.titleHighlight')}</span>
            </h2>
            <p className="journey-subtext">
              {t('journey.subtitle')}
            </p>
          </div>

          {/* Scroll-Driven Progress Timeline */}
          <div className="journey-timeline-wrap">
            <ScrollTimeline
              items={timelineItems}
              activeId={activeStageId}
              onHover={setHoveredStageId}
              onCurrentStepChange={setCurrentStepId}
              className="journey-scroll-timeline"
            />
          </div>

          {/* Buttons Row */}
          <div className="journey-cta-row">
            <Button to="/admissions" variant="black" className="journey-cta-btn">
              {t('journey.btnEnquiry')}
            </Button>
            <OutlineButton to="/academics" variant="light" className="journey-cta-outline">
              {t('journey.btnAcademics')}
            </OutlineButton>
          </div>
        </div>

        {/* Right Column: 4:5 Illustration with Synchronized Hotspots (Sticky on Desktop) */}
        <div className="journey-visual-col">
          <div className="journey-card-frame">
            <ImageSlot
              slotKey="home.journey"
              ratio="4/5"
              alt={t('journey.imageAlt')}
              className="journey-slot-frame"
            >
              {/* Hotspots Overlay */}
              <div className="journey-hotspots-layer" aria-hidden="false">
                {stages.map((st, idx) => {
                  const isActive = activeStageId === st.id;
                  const title = t(st.titleKey);
                  const desc = t(st.descKey);
                  const delayMs = idx * 120;
                  const alignClass = `align-${st.labelAlign || 'right'}`;

                  return (
                    <div
                      key={st.id}
                      className={`journey-hotspot-pin ${alignClass} ${isActive ? 'is-active' : ''} ${hasAnimated ? 'is-animated' : ''}`}
                      style={{
                        left: `${st.stone.x}%`,
                        top: `${st.stone.y}%`,
                        animationDelay: `${delayMs}ms`
                      }}
                    >
                      {/* Anchor Dot on Stone */}
                      <span className="hotspot-center-dot" aria-hidden="true" />

                      {/* Desktop Full Label Pill */}
                      {st.link ? (
                        <Link
                          to={st.link}
                          className="hotspot-label-pill desktop-only"
                          onMouseEnter={() => setHoveredStageId(st.id)}
                          onMouseLeave={() => setHoveredStageId(null)}
                          onFocus={() => setHoveredStageId(st.id)}
                          onBlur={() => setHoveredStageId(null)}
                          aria-label={`Stage ${st.number}: ${title} - ${desc}`}
                        >
                          <span className="pill-badge">{st.number}</span>
                          <span className="pill-title">{title}</span>
                          <span className="pill-accent-dot" aria-hidden="true" />
                        </Link>
                      ) : (
                        <button
                          type="button"
                          className="hotspot-label-pill desktop-only"
                          onMouseEnter={() => setHoveredStageId(st.id)}
                          onMouseLeave={() => setHoveredStageId(null)}
                          onFocus={() => setHoveredStageId(st.id)}
                          onBlur={() => setHoveredStageId(null)}
                          aria-label={`Stage ${st.number}: ${title} - ${desc}`}
                        >
                          <span className="pill-badge">{st.number}</span>
                          <span className="pill-title">{title}</span>
                          <span className="pill-accent-dot" aria-hidden="true" />
                        </button>
                      )}

                      {/* Mobile Small Tappable Number Badge */}
                      <button
                        type="button"
                        className="hotspot-mobile-dot mobile-only"
                        onClick={() => handleMobileDotClick(st.id)}
                        aria-label={`Stage ${st.number}: ${title}. Tap to view details`}
                      >
                        {st.number}
                      </button>
                    </div>
                  );
                })}
              </div>
            </ImageSlot>
          </div>
        </div>

      </div>
    </PanelSection>
  );
}
