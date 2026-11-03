import React from 'react';
import { useTranslation } from 'react-i18next';
import ImageSlot from '../../../components/common/ImageSlot/ImageSlot';
import Icon from '../../../components/common/Icon/Icon';
import Reveal from '../../../components/common/Reveal/Reveal';
import './AboutLeadershipPair.css';

export default function AboutLeadershipPair({ leadershipQuote, managementQuote }) {
  const { t } = useTranslation();

  return (
    <section className="section about-leadership-section">
      <div className="container">
        <Reveal>
          {/* Outer Rounded Container with Icon Header */}
          <div className="packages-container-box">
            
            <div className="packages-box-header">
              <span className="packages-box-icon" aria-hidden="true">
                <Icon name="user" size={18} strokeWidth={2.4} />
              </span>
              <span className="packages-box-title">
                {t('about.leadershipContainerTag')}
              </span>
            </div>

            {/* Dual Cards Side-by-Side (Principal + Management) */}
            <div className="packages-cards-row">
              
              {/* Left Card: Principal */}
              <div className="package-card package-card-light">
                <h3 className="package-card-title">
                  {t('about.leadershipPrincipalTitle')}
                </h3>
                <div className="package-title-accent-line" aria-hidden="true" />

                <div className="package-photo-container">
                  <ImageSlot
                    slotKey="home.principal"
                    ratio="16/9"
                    alt="SHSVM School Principal"
                    className="package-photo-slot"
                  />
                </div>

                <blockquote className="package-quote-text">
                  "{leadershipQuote.quote}"
                </blockquote>
                <p className="package-body-paragraph">
                  {leadershipQuote.body}
                </p>

                <div className="package-footer-signoff">
                  <div className="signoff-details">
                    <h4 className="signoff-person-name">{leadershipQuote.name}</h4>
                    <p className="signoff-person-role">{leadershipQuote.role}</p>
                  </div>
                </div>
              </div>

              {/* Right Card: Management */}
              <div className="package-card package-card-dark">
                <h3 className="package-card-title title-dark">
                  {t('about.leadershipManagementTitle')}
                </h3>
                <div className="package-title-accent-line" aria-hidden="true" />

                <blockquote className="package-quote-text quote-dark">
                  "{managementQuote.quote}"
                </blockquote>
                <p className="package-body-paragraph text-dark-muted">
                  {managementQuote.body}
                </p>

                {managementQuote.points && (
                  <ul className="package-checklist">
                    {managementQuote.points.map((pt, i) => (
                      <li key={i} className="package-checklist-item">
                        <span className="checklist-bullet-icon" aria-hidden="true">
                          <Icon name="check" size={15} strokeWidth={2.5} />
                        </span>
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                )}

                <div className="package-footer-signoff footer-dark">
                  <div className="signoff-details">
                    <h4 className="signoff-person-name name-dark">{managementQuote.name}</h4>
                    <p className="signoff-person-role role-dark">{managementQuote.role}</p>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </Reveal>
      </div>
    </section>
  );
}
