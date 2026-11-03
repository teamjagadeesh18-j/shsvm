import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SEO from '../../components/common/SEO/SEO';
import Marquee from '../../components/home/Marquee/Marquee';
import OutlineButton from '../../components/common/OutlineButton/OutlineButton';
import AdmissionsHero from './components/AdmissionsHero';
import AdmissionEnquiryForm from './components/AdmissionEnquiryForm';
import CommunityReviews from './components/CommunityReviews';
import FactsStrip from './components/FactsStrip';
import Accordion from '../../components/common/Accordion/Accordion';
import CommunityTestimonials from '@/components/ui/community-testimonial';
import { getSettings, getAdmissionsData, getFaqs } from '../../services/content';
import './Admissions.css';

const ADMISSIONS_HIGHLIGHTS = [
  'Established 1999',
  'Co-educational',
  'State Board',
  'Mon to Sat, 8:00 AM to 5:30 PM',
  'Pakkam, Thiruvallur'
];

export default function Admissions() {
  const { t } = useTranslation();
  const settings = getSettings();
  const admissionsData = getAdmissionsData();
  const faqs = getFaqs();

  const faqPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': faqs.map(item => ({
      '@type': 'Question',
      'name': item.question,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': item.answer
      }
    }))
  };

  return (
    <div className="admissions-page">
      <SEO
        title="Admission Enquiry | S.H.S.V.M School, Pakkam"
        description="Submit an online admission enquiry for Sree Hari Saradha Vidhyalaya Matriculation School, Pakkam. Welcoming students for Primary, Upper Primary, and Secondary."
        path="/admissions"
        extraSchemas={[faqPageSchema]}
      />

      {/* 1. Highlights Strip: Single row ticker with provable items */}
      <Marquee items={ADMISSIONS_HIGHLIGHTS} />

      {/* 2. Back Link: Small outlined pill linking to Home */}
      <div className="container admissions-back-row">
        <OutlineButton
          to="/"
          arrow={false}
          variant="light"
          className="admissions-back-btn"
          ariaLabel="Return to homepage"
        >
          {t('admissions.backToHome')}
        </OutlineButton>
      </div>

      {/* 3. Hero Panel: Inset dark panel with faint grid and contact info */}
      <AdmissionsHero settings={settings} />

      {/* 4. Online Enquiry Form Card: Inset white rounded form card */}
      <AdmissionEnquiryForm
        levels={admissionsData?.levels || []}
        tcOptions={admissionsData?.tcOptions || []}
      />

      {/* 5. Parent Voices Section: Rendered only when real testimonials exist */}
      <CommunityReviews />

      {/* 6. Facts Strip: 3 provable fact pills */}
      <FactsStrip />

      {/* 7. Admission FAQs Section */}
      <section className="section" style={{ padding: '40px 0 20px' }}>
        <div className="container" style={{ maxWidth: '860px' }}>
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <span className="tag-pill" style={{ color: 'var(--color-accent)', borderColor: 'var(--color-accent-glow)' }}>
              ADMISSION FAQS
            </span>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-black)', margin: '10px 0 8px' }}>
              Frequently Asked Questions
            </h2>
            <p style={{ fontSize: '0.925rem', color: 'var(--color-gray-body)', margin: 0 }}>
              Verified details regarding classes, campus timings, and school procedures. For more questions, visit our <Link to="/faq" style={{ color: 'var(--color-accent)', fontWeight: 600 }}>FAQ Page</Link> or <Link to="/contact" style={{ color: 'var(--color-accent)', fontWeight: 600 }}>Contact Us</Link>.
            </p>
          </div>
          <Accordion items={faqs} />
        </div>
      </section>

      {/* 8. Community Testimonials Showcase (Above Footer) */}
      <CommunityTestimonials />
    </div>
  );
}
