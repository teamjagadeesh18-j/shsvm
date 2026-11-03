import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { getSettings } from '../../../services/content';
import Icon from '../../common/Icon/Icon';
import './HeroDock.css';

export default function HeroDock() {
  const { t } = useTranslation();
  const settings = getSettings();
  const dockRef = useRef(null);

  const phoneRaw = settings.phoneRaw || '+918939421231';
  const waNum = settings.whatsappNumber || '918939421231';
  const waMsg = encodeURIComponent(
    settings.whatsappMessage || 'Hello, I would like to enquire about admission.'
  );

  const dockItems = [
    {
      id: 'call',
      label: t('dockCall', 'Call School'),
      icon: 'phone',
      href: `tel:${phoneRaw}`,
      isExternal: false
    },
    {
      id: 'whatsapp',
      label: t('dockWhatsApp', 'WhatsApp'),
      icon: 'whatsapp',
      href: `https://wa.me/${waNum}?text=${waMsg}`,
      isExternal: true
    },
    {
      id: 'directions',
      label: t('dockDirections', 'Directions'),
      icon: 'directions',
      href: settings.directionsUrl || settings.openInMapsUrl,
      isExternal: true
    },
    {
      id: 'admissions',
      label: t('dockAdmissions', 'Admissions'),
      icon: 'graduation',
      href: settings.links?.admissions || '/admissions',
      isExternal: false
    },
    {
      id: 'instagram',
      label: t('dockInstagram', 'Instagram'),
      icon: 'instagram',
      href: settings.social?.instagram || 'https://www.instagram.com/shsvms_pakkam/',
      isExternal: true
    }
  ];

  const handlePointerMove = (e) => {
    // Only magnify for fine pointers (mouse), not touch
    if (e.pointerType === 'touch') return;

    const dock = dockRef.current;
    if (!dock) return;

    const prefersReducedMotion = typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const items = dock.querySelectorAll('.hero-dock-item');
    const mouseX = e.clientX;

    items.forEach((item) => {
      const rect = item.getBoundingClientRect();
      const itemCenterX = rect.left + rect.width / 2;
      const distance = Math.abs(mouseX - itemCenterX);
      const maxDistance = 120; // 120px influence radius

      if (distance < maxDistance) {
        const ratio = 1 - distance / maxDistance;
        // Scale smoothly up to ~1.35
        const scale = 1 + 0.35 * Math.sin((ratio * Math.PI) / 2);
        item.style.setProperty('--dock-scale', scale.toFixed(3));
      } else {
        item.style.setProperty('--dock-scale', '1');
      }
    });
  };

  const handlePointerLeave = () => {
    const dock = dockRef.current;
    if (!dock) return;
    const items = dock.querySelectorAll('.hero-dock-item');
    items.forEach((item) => {
      item.style.setProperty('--dock-scale', '1');
    });
  };

  return (
    <nav
      ref={dockRef}
      className="hero-dock"
      aria-label="Quick Actions Dock"
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      <div className="hero-dock-track">
        {dockItems.map((item) => (
          <a
            key={item.id}
            href={item.href}
            className="hero-dock-item"
            aria-label={item.label}
            {...(item.isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          >
            <span className="hero-dock-icon-wrap" aria-hidden="true">
              <Icon name={item.icon} size={20} strokeWidth={1.8} />
            </span>
            <span className="hero-dock-tooltip" role="tooltip">
              {item.label}
            </span>
          </a>
        ))}
      </div>
    </nav>
  );
}

