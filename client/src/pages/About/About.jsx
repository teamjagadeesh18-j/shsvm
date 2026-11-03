import React from 'react';
import { useTranslation } from 'react-i18next';
import SEO from '../../components/common/SEO/SEO';
import PageHero from '../../components/common/PageHero/PageHero';
import Breadcrumbs from '../../components/common/Breadcrumbs/Breadcrumbs';
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
  const { t } = useTranslation();
  const aboutData = getAboutData();

  return (
    <div className="about-page">
      <SEO
        title="About S.H.S.V.M School | Matriculation School in Pakkam, Thiruvallur"
        description="About Sree Hari Saradha Vidhyalaya Matriculation School, Pakkam, Thiruvallur District. Established in 1999, co-educational, Tamil Nadu State Board school."
        path="/about"
        pageType="AboutPage"
      />

      <Breadcrumbs items={[{ label: 'About Us', path: '/about' }]} />

      {/* 1. Page Hero: Light with Grid Background */}
      <PageHero
        badge={t('about.heroBadge')}
        title={t('about.heroTitle')}
        highlight={t('about.heroHighlight')}
        highlightClass="text-muted"
        subtitle={t('about.heroSubtitle')}
      />

      {/* Answer-first summary for AI answer engines and search engines */}
      <div className="container" style={{ marginTop: '16px', marginBottom: '8px' }}>
        <p className="about-lead-answer">
          Sree Hari Saradha Vidhyalaya Matriculation School is a co-educational State Board school in Pakkam, Thiruvallur District, Tamil Nadu, established in 1999. Located on Korattur Thinnanur Periyapalayam Road (SH-50A) near Avadi, the school provides Primary, Upper Primary, and Secondary education grounded in the motto Smile, Study, Serve.
        </p>
      </div>

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
