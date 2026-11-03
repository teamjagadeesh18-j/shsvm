import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getFaqs, getSettings } from '../../services/content';
import SEO from '../../components/common/SEO/SEO';
import PageHero from '../../components/common/PageHero/PageHero';
import Accordion from '../../components/common/Accordion/Accordion';
import PanelSection from '../../components/common/PanelSection/PanelSection';
import SectionPill from '../../components/common/SectionPill/SectionPill';
import Reveal from '../../components/common/Reveal/Reveal';
import Button from '../../components/common/Button/Button';
import './FAQ.css';

export default function FAQ() {
  const { t } = useTranslation();
  const faqs = getFaqs();
  const settings = getSettings();
  const phone = settings?.phone || '+91 89394 21231';
  const phoneRaw = settings?.phoneRaw || '+918939421231';

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
    <div className="faq-page">
      <SEO
        title="Frequently Asked Questions | S.H.S.V.M School, Pakkam"
        description="Find verified answers to common questions about Sree Hari Saradha Vidhyalaya Matriculation School in Pakkam: board, levels, timings, location, and admissions."
        path="/faq"
        pageType="FAQPage"
        extraSchemas={[faqPageSchema]}
      />

      <PageHero
        badge={t('faq.heroBadge', 'QUESTIONS & ANSWERS')}
        title="Frequently Asked "
        highlight="Questions"
        subtitle="Verified details on curriculum, schooling levels, campus hours, facilities, and reaching our Pakkam campus."
      />

      <PanelSection id="faq-section" ariaLabel="Frequently Asked Questions" className="faq-section">
        <Reveal>
          <div className="faq-layout-container">
            {/* Answer-first summary for search engines and AI engines */}
            <p className="faq-lead-summary">
              Sree Hari Saradha Vidhyalaya Matriculation School (S.H.S.V.M School) is a co-educational Tamil Nadu State Board institution established in 1999 in Pakkam, Thiruvallur District. We offer Primary, Upper Primary, and Secondary schooling from Monday to Saturday, 8:00 AM to 5:30 PM.
            </p>

            <Accordion items={faqs} className="faq-accordion" />

            <div className="faq-contact-card">
              <SectionPill variant="dark">MORE QUESTIONS?</SectionPill>
              <h3 className="faq-contact-title">Have a specific enquiry regarding admissions?</h3>
              <p className="faq-contact-desc">
                For questions regarding fees, admission documents, or seat availability, please call our office directly or visit us in Pakkam.
              </p>
              <div className="faq-contact-actions">
                <Button variant="white" href={`tel:${phoneRaw}`}>
                  Call {phone}
                </Button>
                <Link to="/contact" className="btn-pill btn-pill-outline">
                  View Contact & Location
                </Link>
                <Link to="/admissions" className="btn-pill btn-pill-outline">
                  Admission Enquiry
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </PanelSection>
    </div>
  );
}

