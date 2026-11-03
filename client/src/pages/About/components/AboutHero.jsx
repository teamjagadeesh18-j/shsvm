import React, { useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '../../../components/common/Button/Button';
import Icon from '../../../components/common/Icon/Icon';
import ImageSlot from '../../../components/common/ImageSlot/ImageSlot';
import BentoLiveStatus from '../../../components/home/Hero/BentoLiveStatus';
import { getSettings } from '../../../services/content';
import { observeAnimation } from '../../../services/animationObserver';
import './AboutHero.css';

export default function AboutHero({ mockTime = null }) {
  const { t } = useTranslation();
  const settings = getSettings();
  const phoneTel = `tel:${settings?.phoneRaw || '+918939421231'}`;

  const heroCardRef = useRef(null);
  const ringRef = useRef(null);
  const chipARef = useRef(null);
  const chipBRef = useRef(null);

  // Pause continuous animations when off-screen or tab hidden
  useEffect(() => {
    const cleanups = [];
    if (ringRef.current) cleanups.push(observeAnimation(ringRef.current));
    if (chipARef.current) cleanups.push(observeAnimation(chipARef.current));
    if (chipBRef.current) cleanups.push(observeAnimation(chipBRef.current));
    return () => cleanups.forEach((c) => c());
  }, []);

  // Spotlight pointer tracking on photo card
  const handlePointerMove = (e) => {
    if (e.pointerType === 'touch') return;
    const card = heroCardRef.current;
    if (!card) return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    const rect = card.getBoundingClientRect();
    card.style.setProperty('--spotlight-x', `${e.clientX - rect.left}px`);
    card.style.setProperty('--spotlight-y', `${e.clientY - rect.top}px`);
  };

  const handlePointerLeave = () => {
    const card = heroCardRef.current;
    if (card) {
      card.style.setProperty('--spotlight-x', '-9999px');
      card.style.setProperty('--spotlight-y', '-9999px');
    }
  };

  return (
    <section className="about-hero-section bg-grid" aria-labelledby="about-hero-heading">
      {/* Soft accent glow positioned behind left column */}
      <div className="about-hero-glow" aria-hidden="true" />

      <div className="container about-hero-container">
        <div className="about-hero-split">
          {/* Left Column (52%) */}
          <div className="about-hero-left">
            <div className="about-hero-badge-pill">
              {t('about.heroBadge', 'ABOUT OUR SCHOOL')}
            </div>

            <h1 id="about-hero-heading" className="about-hero-title">
              {t('about.heroTitle', 'Who We')}{' '}
              <span className="text-muted">{t('about.heroHighlight', 'Are')}</span>
            </h1>

            <p className="about-hero-subtitle">
              {t('about.heroSubtitle', 'A co-educational Matriculation school in Pakkam, Thiruvallur District, Tamil Nadu, following the State Board curriculum since 1999 with the motto Smile • Study • Serve.')}
            </p>

            <span className="sr-only">Motto: Smile, Study, Serve</span>

            <div className="about-hero-actions">
              <Button to="/admissions" variant="black" className="about-btn-primary">
                Begin an Enquiry
              </Button>
              <Button href={phoneTel} variant="outline" className="about-btn-call">
                Call the School
              </Button>
            </div>
          </div>

          {/* Right Column (48%): Photo Card & Overlapping Elements */}
          <div className="about-hero-right">
            <div
              ref={heroCardRef}
              className="about-photo-card"
              onPointerMove={handlePointerMove}
              onPointerLeave={handlePointerLeave}
            >
              <ImageSlot
                slotKey="about.hero"
                ratio="4/3"
                loading="eager"
                fetchPriority="high"
                alt="Entrance of Sree Hari Saradha Vidyalaya Matriculation School in Pakkam with the school name board"
                className="about-hero-img-slot"
              />

              {/* Spotlight overlay on photo */}
              <div className="about-photo-spotlight" aria-hidden="true" />

              {/* Floating Chip a: Top-Left */}
              <div ref={chipARef} className="about-floating-chip chip-est">
                <Icon name="calendar" size={16} className="chip-icon" />
                <span>Established 1999</span>
              </div>

              {/* Rotating Motto Badge d: Top-Right */}
              <div className="about-motto-badge" aria-hidden="true">
                <svg
                  ref={ringRef}
                  className="about-badge-svg"
                  viewBox="0 0 112 112"
                  width="112"
                  height="112"
                >
                  <path
                    id="about-motto-circle"
                    d="M 56, 56 m -42, 0 a 42,42 0 1,1 84,0 a 42,42 0 1,1 -84,0"
                    fill="none"
                  />
                  <text className="about-badge-text">
                    <textPath
                      href="#about-motto-circle"
                      startOffset="0%"
                      textLength="263.89"
                      lengthAdjust="spacing"
                    >
                      SMILE • STUDY • SERVE •{' '}
                    </textPath>
                  </text>
                </svg>
                <div className="about-badge-crest">
                  <img
                    src="/images/logo.png"
                    alt=""
                    className="about-crest-img"
                    width="48"
                    height="48"
                  />
                </div>
              </div>

              {/* Status Chip c: Bottom-Left (Static, does not float) */}
              <div className="about-status-chip-wrapper">
                <BentoLiveStatus mockTime={mockTime} className="about-status-badge-chip" />
              </div>

              {/* Floating Chip b: Bottom-Right (Opposite phase drift) */}
              <div ref={chipBRef} className="about-floating-chip chip-board">
                <Icon name="check" size={16} className="chip-icon" />
                <span>Tamil Nadu State Board</span>
              </div>
            </div>
          </div>
        </div>

        {/* Factual Summary Card spanning full width below columns */}
        <div className="about-hero-summary-card">
          <div className="about-summary-grid">
            <div className="about-summary-col">
              <span className="about-summary-term">{t('about.summarySmileTerm', 'Smile.')}</span>
              <p className="about-summary-desc">{t('about.summarySmileDesc', 'Because a child who feels safe learns better.')}</p>
            </div>
            <div className="about-summary-col">
              <span className="about-summary-term">{t('about.summaryStudyTerm', 'Study.')}</span>
              <p className="about-summary-desc">{t('about.summaryStudyDesc', 'Because steady effort beats shortcuts.')}</p>
            </div>
            <div className="about-summary-col">
              <span className="about-summary-term">{t('about.summaryServeTerm', 'Serve.')}</span>
              <p className="about-summary-desc">{t('about.summaryServeDesc', 'Because school is where we learn to look beyond ourselves.')}</p>
            </div>
          </div>
          <div className="about-summary-footer">
            <p className="about-summary-closing">
              {t('about.summaryClosing', 'Since 1999, this has been the way of Sree Hari Saradha Vidhyalaya in Pakkam.')}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

