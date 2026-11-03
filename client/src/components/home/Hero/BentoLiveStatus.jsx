import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getSchoolStatus } from './schoolStatus';

export default function BentoLiveStatus({ mockTime = null }) {
  const { t } = useTranslation();
  const [liveStatus, setLiveStatus] = useState(() => getSchoolStatus(new Date()));

  useEffect(() => {
    if (mockTime) return;

    const interval = setInterval(() => {
      setLiveStatus(getSchoolStatus(new Date()));
    }, 60000);

    return () => clearInterval(interval);
  }, [mockTime]);

  const status = mockTime ? getSchoolStatus(mockTime) : liveStatus;

  const statusText = status.isOpen
    ? t('bentoOpen', 'Open now, closes 5:30 PM')
    : t('bentoClosedOpens', { day: status.day, defaultValue: `Closed, opens ${status.day} 8:00 AM` });

  return (
    <div
      className={`bento-tile bento-status-tile ${status.isOpen ? 'status-open' : 'status-closed'}`}
      role="status"
      aria-live="polite"
    >
      <div className="bento-status-content">
        <span className="bento-status-indicator">
          <span className="bento-status-dot" aria-hidden="true" />
          {status.isOpen && <span className="bento-status-ring" aria-hidden="true" />}
        </span>
        <span className="bento-status-text">{statusText}</span>
      </div>
    </div>
  );
}
