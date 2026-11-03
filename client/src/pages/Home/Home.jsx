import React from 'react';
import SEO from '../../components/common/SEO/SEO';

// Home Components
import Hero from '../../components/home/Hero/Hero';
import Marquee from '../../components/home/Marquee/Marquee';
import Programs from '../../components/home/Programs/Programs';
import ImageMarquee from '../../components/home/ImageMarquee/ImageMarquee';
import JourneySection from '../../components/home/JourneySection/JourneySection';
import InkOrbitFeatures from '@/components/ui/ink-orbit-features';
import DashboardPanel from '../../components/home/DashboardPanel/DashboardPanel';
import WhyChooseUs from '../../components/home/WhyChooseUs/WhyChooseUs';
import StatsSection from '../../components/home/StatsSection/StatsSection';
import PrincipalMessage from '../../components/home/PrincipalMessage/PrincipalMessage';
import CommunityTestimonials from '@/components/ui/community-testimonial';
import LocationCard from '../../components/common/LocationCard/LocationCard';
import WelcomePopup from '../../components/home/WelcomePopup/WelcomePopup';

export default function Home({ onOpenEnquiry, isEnquiryOpen }) {
  return (
    <div className="home-page-root">
      <SEO
        title="Sree Hari Saradha Vidhyalaya Matriculation School, Pakkam, Thiruvallur"
        description="Sree Hari Saradha Vidhyalaya Matriculation School (S.H.S.V.M School) is a co-educational State Board school in Pakkam, Thiruvallur District, established in 1999."
        path="/"
        pageType="WebPage"
      />

      {/* 1. Hero Section */}
      <Hero onOpenEnquiry={onOpenEnquiry} />

      {/* 2. Royal Blue Marquee Band */}
      <Marquee />

      {/* 3. Programs We Offer (Levels of Schooling) */}
      <Programs />

      {/* 4. Continuous Photo Marquee (Events, Awards, Felicitation & Campus) */}
      <ImageMarquee />

      {/* 5. Every Journey Begins With One Step (Stepping Stones) */}
      <JourneySection />

      {/* 6. Interactive Academic & Holistic Features Bento */}
      <InkOrbitFeatures theme="dark" brand="SHSVM School" />

      {/* 7. Life at SHSVM Dashboard Panel */}
      <DashboardPanel onOpenEnquiry={onOpenEnquiry} />

      {/* 8. Why Parents Choose Us */}
      <WhyChooseUs onSelectRow={onOpenEnquiry} />

      {/* 9. Stats Section */}
      <StatsSection />

      {/* 10. Principal's Message */}
      <PrincipalMessage />

      {/* 11. Community Testimonials Showcase */}
      <CommunityTestimonials />

      {/* 12. Themed Campus Location Block (Above Footer) */}
      <LocationCard id="home-location" />

      {/* 13. Welcome Popup Modal (Home page only, client-side session popup) */}
      <WelcomePopup isEnquiryOpen={isEnquiryOpen} />
    </div>
  );
}
