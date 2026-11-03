import React from 'react';
import HeroLeft from './HeroLeft';
import HeroBento from './HeroBento';
import './Hero.css';

export default function Hero({ onOpenEnquiry }) {
  return (
    <section className="hero-section bg-grid" aria-label="Hero Section">
      {/* Soft blurred royal blue glowing circle placed behind headline column */}
      <div className="hero-glow-circle" aria-hidden="true" />

      <div className="container hero-container">
        <div className="hero-grid-layout">
          <HeroLeft onOpenEnquiry={onOpenEnquiry} />
          <HeroBento />
        </div>
      </div>
    </section>
  );
}
