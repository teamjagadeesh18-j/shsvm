import React from 'react';
import ProgramCard from '../../../components/common/ProgramCard/ProgramCard';

/**
 * ContactInfoCards Component
 * Campus address, phone lines, and office hours cards.
 */
export default function ContactInfoCards({ settings }) {
  const phone = settings?.phone || '+91 89394 21231';
  const phoneTel = settings?.phoneRaw || '+918939421231';

  return (
    <div className="contact-cards-col">
      {/* Campus Address Card */}
      <ProgramCard
        className="contact-info-card"
        icon={
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
        }
        title="Campus Address"
      >
        <p className="contact-card-text">
          Sree Hari Saradha Vidyalaya Matriculation School<br />
          Pakkam, Thiruvallur District (Tiruvallur),<br />
          Tamil Nadu, PIN 602024.
        </p>
      </ProgramCard>

      {/* Phone Lines Card */}
      <ProgramCard
        className="contact-info-card"
        icon={
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
          </svg>
        }
        title="Phone & Enquiry"
      >
        <p className="contact-card-text">
          School Office & Admissions:{' '}
          <a href={`tel:${phoneTel}`} className="contact-card-phone-link" style={{ color: 'inherit', fontWeight: 600 }}>
            {phone}
          </a>
          <br />
          WhatsApp:{' '}
          <a
            href="https://wa.me/918939421231"
            target="_blank"
            rel="noopener noreferrer"
            className="contact-card-phone-link"
            style={{ color: 'inherit', fontWeight: 600 }}
          >
            +91 89394 21231
          </a>
        </p>
      </ProgramCard>

      {/* Office Timings Card */}
      <ProgramCard
        className="contact-info-card"
        icon={
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        }
        title="Office Timings"
      >
        <p className="contact-card-text">
          Monday – Saturday: 8:00 AM – 5:30 PM<br />
          Sunday: Closed
        </p>
      </ProgramCard>
    </div>
  );
}
