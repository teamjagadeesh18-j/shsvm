import React from 'react';
import { getSettings } from '../../../services/content';
import './WhatsAppButton.css';

export default function WhatsAppButton() {
  const settings = getSettings();
  const phone = settings?.whatsappNumber || '918939421231';
  const whatsappUrl = `https://wa.me/${phone}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="floating-whatsapp"
      aria-label="Chat with Admissions Office on WhatsApp (opens in new tab)"
    >
      <div className="whatsapp-tooltip">Chat with Admissions</div>
      <svg viewBox="0 0 32 32" fill="currentColor" width="30" height="30">
        <path d="M16.002 2C8.28 2 2 8.28 2 16c0 2.51.66 4.96 1.91 7.12L2 30l7.08-1.86A13.92 13.92 0 0 0 16 30c7.72 0 14-6.28 14-14S23.72 2 16.002 2zm8.17 19.82c-.34.96-1.7 1.83-2.77 1.94-.74.07-1.7.12-5.46-1.44-4.81-2-7.9-6.91-8.14-7.23-.24-.32-1.95-2.6-1.95-4.96s1.23-3.52 1.67-4c.44-.48.96-.6 1.28-.6.32 0 .64 0 .92.02.3.02.7-.12 1.09.82.41.98 1.4 3.42 1.52 3.66.12.24.2.52.04.84-.16.32-.24.52-.48.8-.24.28-.5.62-.71.84-.24.24-.49.5-.21.98.28.48 1.25 2.06 2.68 3.34 1.85 1.65 3.41 2.16 3.89 2.4.48.24.76.2 1.04-.12.28-.32 1.2-1.4 1.52-1.88.32-.48.64-.4 1.08-.24.44.16 2.77 1.31 3.25 1.55.48.24.8.36.92.56.12.2.12 1.16-.22 2.12z" />
      </svg>
    </a>
  );
}
