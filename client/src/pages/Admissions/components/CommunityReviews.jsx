import React from 'react';
import { getTestimonials } from '../../../services/content';
import SectionPill from '../../../components/common/SectionPill/SectionPill';
import Reveal from '../../../components/common/Reveal/Reveal';

export default function CommunityReviews() {
  const testimonials = getTestimonials() || [];

  if (!Array.isArray(testimonials) || testimonials.length === 0) {
    return null;
  }

  return (
    <section className="admissions-reviews-section">
      <div className="container">
        <Reveal>
          <div className="reviews-header text-center">
            <SectionPill text="COMMUNITY VOICE" />
            <h2 className="reviews-title">
              Loved by Our <span className="hero-title-dim">Parents, Alumni & Community</span>
            </h2>
            <p className="reviews-subtitle">
              Feedback and reflections from parents and guardians of Sree Hari Saradha Vidhyalaya Matriculation School.
            </p>
          </div>

          <div className="reviews-cards-grid">
            {testimonials.map((item, idx) => {
              const initials = item.name
                ? item.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
                : 'P';
              return (
                <div key={idx} className="review-card">
                  <p className="review-quote">"{item.quote}"</p>
                  <div className="review-author-row">
                    <div className="review-avatar" aria-hidden="true">{initials}</div>
                    <div className="review-meta">
                      <div className="review-name">{item.name}</div>
                      <div className="review-relation">{item.relation || 'Parent'}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

