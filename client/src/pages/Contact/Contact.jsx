import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import SEO from '../../components/common/SEO/SEO';
import PageHero from '../../components/common/PageHero/PageHero';
import ContactInfoCards from './components/ContactInfoCards';
import ContactForm from './components/ContactForm';
import Reveal from '../../components/common/Reveal/Reveal';
import LocationCard from '../../components/common/LocationCard/LocationCard';
import { getSettings } from '../../services/content';
import './Contact.css';

export default function Contact() {
  const { t } = useTranslation();
  const settings = getSettings();
  const phone = settings?.phone || '+91 89394 21231';
  const phoneRaw = settings?.phoneRaw || '+918939421231';

  return (
    <div className="contact-page">
      <SEO
        title="Contact and Location | S.H.S.V.M School, Pakkam"
        description="Contact Sree Hari Saradha Vidhyalaya Matriculation School in Pakkam, Thiruvallur District, Tamil Nadu. Phone: +91 89394 21231. Office hours Mon-Sat 8:00 AM - 5:30 PM."
        path="/contact"
        pageType="ContactPage"
      />

      {/* 1. Page Hero */}
      <PageHero
        badge={t('contact.heroBadge')}
        title={t('contact.heroTitle')}
        highlight={t('contact.heroHighlight')}
        subtitle={t('contact.heroSubtitle')}
      />

      {/* 2. Contact Grid: Cards + Message Form */}
      <section className="section" style={{ paddingTop: '20px' }}>
        <div className="container">
          <div className="contact-dual-grid">
            <Reveal delay={0}>
              <ContactInfoCards settings={settings} />
            </Reveal>
            <Reveal delay={0.15}>
              <ContactForm />
            </Reveal>
          </div>

          {/* How to Reach Our Campus & Visiting Guide */}
          <Reveal delay={0.2}>
            <div className="contact-transit-banner">
              <div className="transit-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
              </div>
              <div>
                <h4 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--color-black)', marginBottom: '6px' }}>
                  How to Reach Our Campus
                </h4>
                <p style={{ fontSize: '0.9rem', color: 'var(--color-gray-body)', margin: '0 0 10px', lineHeight: '1.6' }}>
                  Sree Hari Saradha Vidhyalaya Matriculation School is located on Korattur Thinnanur Periyapalayam Road (SH-50A) in Pakkam, near Avadi, Thiruvallur District, Tamil Nadu (PIN 602024). The campus is directly accessible by road via SH-50A.
                </p>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-gray-body)', margin: 0, lineHeight: '1.5' }}>
                  Operating hours: Monday to Saturday, 8:00 AM to 5:30 PM (Sunday closed). Direct helpline: <a href={`tel:${phoneRaw}`} style={{ color: 'var(--color-accent)', fontWeight: 600 }}>{phone}</a>. Interested in admission? <Link to="/admissions" style={{ color: 'var(--color-accent)', fontWeight: 600 }}>Submit an Admission Enquiry</Link>.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 3. Themed Campus Location Block */}
      <LocationCard id="campus-location" />
    </div>
  );
}
