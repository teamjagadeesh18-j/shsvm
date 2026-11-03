import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getTestimonials } from '../../../services/content';
import FullBleedSection from '../../common/FullBleedSection/FullBleedSection';
import SectionPill from '../../common/SectionPill/SectionPill';
import Reveal from '../../common/Reveal/Reveal';
import './TestimonialsSection.css';

export default function TestimonialsSection() {
  const { t } = useTranslation();
  const testimonials = getTestimonials();
  const [startIndex, setStartIndex] = useState(0);

  if (!testimonials || testimonials.length === 0) {
    return null;
  }

  const handleNext = () => {
    setStartIndex((prev) => (prev + 1) % testimonials.length);
  };

  const handlePrev = () => {
    setStartIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const visible = [
    testimonials[startIndex],
    testimonials[(startIndex + 1) % testimonials.length]
  ].filter(Boolean);

  return (
    <FullBleedSection
      variant="light"
      className="testimonials-section"
      id="testimonials"
      ariaLabel="Parent & Student Testimonials"
      withContainer={true}
    >
      <Reveal>
        {/* Header Row */}
        <div className="testimonials-header-row">
          <div>
            <SectionPill variant="light" style={{ marginBottom: '16px' }}>
              {t('testimonialsLabel')}
            </SectionPill>
            <h2 className="testimonials-title">{t('testimonialsTitle')}</h2>
          </div>
          <div className="carousel-arrows-row" style={{ marginTop: 0 }}>
            <button
              type="button"
              className="circle-nav-btn"
              onClick={handlePrev}
              aria-label="Previous testimonial"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <button
              type="button"
              className="circle-nav-btn"
              onClick={handleNext}
              aria-label="Next testimonial"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        </div>
      </Reveal>

      {/* Testimonials Grid */}
      <div className="testimonials-grid">
        {visible.map((item, idx) => (
          <Reveal key={`${item.id}-${idx}`} delay={idx * 0.15}>
            <div className="testimonial-card">
              <div className="testimonial-meta">
                <div className="parent-name">{item.name}</div>
                <div className="parent-rel">{item.role}</div>
              </div>
              <div>
                <div className="testimonial-quote-icon">“</div>
                <p className="testimonial-quote-text">{item.quote}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </FullBleedSection>
  );
}
