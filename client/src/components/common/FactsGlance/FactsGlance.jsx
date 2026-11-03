import React from 'react';
import { getSettings } from '../../../services/content';
import './FactsGlance.css';

/**
 * FactsGlance Component
 * Semantic Definition List (<dl>) of verified school facts for SEO and AI entity extraction.
 */
export default function FactsGlance() {
  const settings = getSettings();

  const facts = [
    { label: 'Established', value: String(settings.established || '1999') },
    { label: 'School Type', value: settings.type || 'Co-educational Matriculation School' },
    { label: 'Educational Board', value: settings.board || 'Tamil Nadu State Board' },
    { label: 'Levels Offered', value: (settings.levels || ['Primary', 'Upper Primary', 'Secondary']).join(', ') },
    { label: 'Campus Address', value: settings.address || 'Pakkam, Thiruvallur District, Tamil Nadu 602024 (Korattur Thinnanur Periyapalayam Road, SH-50A, near Avadi)' },
    { label: 'Operating Hours', value: settings.timings || 'Monday to Saturday, 8:00 AM to 5:30 PM (Sunday closed)' },
    {
      label: 'Telephone Helpline',
      value: (
        <a href={`tel:${settings.phoneRaw || '+918939421231'}`}>
          {settings.phone || '+91 89394 21231'}
        </a>
      )
    },
    { label: 'On-Campus Facilities', value: (settings.facilities || ['Academic Book Bank', 'Recreation Playground', 'Medical Support']).join(', ') }
  ];

  return (
    <section className="facts-glance-section" aria-label="School Facts at a Glance">
      <div className="facts-glance-card">
        <h3 className="facts-glance-title">School Facts at a Glance</h3>
        <dl className="facts-glance-grid">
          {facts.map((item, idx) => (
            <div key={idx} className="facts-glance-item">
              <dt className="facts-glance-dt">{item.label}</dt>
              <dd className="facts-glance-dd">{item.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

