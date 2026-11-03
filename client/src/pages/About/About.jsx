import React from 'react';
import SEO from '../../components/common/SEO/SEO';
import AboutHero from './components/AboutHero';
import Marquee from '../../components/home/Marquee/Marquee';
import AboutStoryMilestones from './components/AboutStoryMilestones';
import AboutLeadershipPair from './components/AboutLeadershipPair';
import AboutMottoDark from './components/AboutMottoDark';
import AboutCommitment from './components/AboutCommitment';
import AboutExploreCards from './components/AboutExploreCards';
import AboutClosingCTA from './components/AboutClosingCTA';
import FactsGlance from '../../components/common/FactsGlance/FactsGlance';
import LocationCard from '../../components/common/LocationCard/LocationCard';
import Reveal from '../../components/common/Reveal/Reveal';
import { getAboutData } from '../../services/content';
import './About.css';

export default function About({ onOpenEnquiry }) {
  const aboutData = getAboutData();

  return (
    <div className="about-page">
      <SEO
        title="About S.H.S.V.M School | Matriculation School in Pakkam, Thiruvallur"
        description="About Sree Hari Saradha Vidhyalaya Matriculation School, Pakkam, Thiruvallur District. Established in 1999, co-educational, Tamil Nadu State Board school."
        path="/about"
        pageType="AboutPage"
      />

      {/* 1. Page Hero: Split Hero with Photo Card and Summary */}
      <AboutHero />

      {/* 2. Marquee Ribbon: Solid Black Dual-Line Band */}
      <Marquee variant="dark" dual={true} />

      {/* 3. Section 01: Our Story & 2-Column Milestone Grid */}
      <AboutStoryMilestones milestones={aboutData.milestones} />

      {/* 4. Facts at a Glance Definition List */}
      <div className="container">
        <Reveal>
          <FactsGlance />
        </Reveal>
      </div>

      {/* 5. Leadership Messages: Dual Split Package Cards */}
      <AboutLeadershipPair
        leadershipQuote={aboutData.leadershipQuote}
        managementQuote={aboutData.managementQuote}
      />

      {/* 6. Section 02: Our Motto (Deep Black Background + 6 Pillars + 3 Tall Cards) */}
      <AboutMottoDark
        learningProcess={aboutData.learningProcess}
        visionMission={aboutData.visionMission}
        onOpenEnquiry={onOpenEnquiry}
      />

      {/* 7. Section 03: What We Stand For */}
      <AboutCommitment />

      {/* 8. Campus Location Block */}
      <LocationCard id="about-location" />

      {/* 9. Explore More Cards: 3 White Cards with Corner Arrows */}
      <AboutExploreCards />

      {/* 10. Closing CTA: Deep Black Headline with Pill Buttons */}
      <AboutClosingCTA onOpenEnquiry={onOpenEnquiry} />
    </div>
  );
}
