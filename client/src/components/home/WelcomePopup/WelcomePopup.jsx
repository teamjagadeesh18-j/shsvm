import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getSettings } from '../../../services/content';
import { addScrollListener } from '../../../services/scrollController';
import Icon from '../../common/Icon/Icon';
import WelcomePopupPhoto from './WelcomePopupPhoto';
import WelcomePopupContent from './WelcomePopupContent';
import './WelcomePopup.css';

const SESSION_KEY = 'welcomePopupSeen';
let memorySeen = false;

function getHasSeen() {
  try {
    return sessionStorage.getItem(SESSION_KEY) === 'true';
  } catch {
    return memorySeen;
  }
}

function setHasSeen() {
  try {
    sessionStorage.setItem(SESSION_KEY, 'true');
  } catch {
    memorySeen = true;
  }
}

export default function WelcomePopup({ isEnquiryOpen = false }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const settings = getSettings();

  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const dialogRef = useRef(null);
  const closeBtnRef = useRef(null);
  const prevActiveRef = useRef(null);

  const handleClose = useCallback(() => {
    setHasSeen();
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setIsOpen(false);
      return;
    }
    setIsClosing(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
    }, 200);
  }, []);

  const handleEnquiry = () => {
    handleClose();
    navigate('/admissions');
  };

  // Preload photo & schedule opening timer
  useEffect(() => {
    if (getHasSeen()) return;
    if (typeof window === 'undefined') return;
    if (window.location.hash || isEnquiryOpen) return;

    const isDrawerOpen = () => Boolean(document.querySelector('.mobile-nav-drawer.open'));
    if (isDrawerOpen()) return;

    // Preload image after 1.5s so hero LCP is unaffected
    const preloadTimer = setTimeout(() => {
      if (!getHasSeen()) {
        const img = new Image();
        img.src = '/images/school/campus-front.webp';
      }
    }, 1500);

    const isMobile = window.innerWidth < 768;

    if (!isMobile) {
      // Desktop / Tablet: open after 2.5s
      const timer = setTimeout(() => {
        if (!getHasSeen() && !window.location.hash && !isDrawerOpen()) {
          prevActiveRef.current = document.activeElement;
          setIsOpen(true);
        }
      }, 2500);
      return () => {
        clearTimeout(preloadTimer);
        clearTimeout(timer);
      };
    } else {
      // Mobile: SEO-safe deferred trigger (scroll >= 40% of first screen OR after 8s)
      let triggered = false;
      let unsubscribeScroll = () => {};

      const triggerOpen = () => {
        if (triggered || getHasSeen()) return;
        triggered = true;
        unsubscribeScroll();
        if (!window.location.hash && !isDrawerOpen()) {
          prevActiveRef.current = document.activeElement;
          setIsOpen(true);
        }
      };

      unsubscribeScroll = addScrollListener((scrollY, winH) => {
        if (scrollY >= winH * 0.4) {
          triggerOpen();
        }
      });

      const mobileTimer = setTimeout(triggerOpen, 8000);

      return () => {
        clearTimeout(preloadTimer);
        clearTimeout(mobileTimer);
        unsubscribeScroll();
      };
    }
  }, [isEnquiryOpen]);

  // Focus trap, Escape key, inert background, and scroll-lock
  useEffect(() => {
    if (!isOpen) return;

    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    const origOverflow = document.body.style.overflow;
    const origPaddingRight = document.body.style.paddingRight;
    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    const bgNodes = [
      document.getElementById('main-content'),
      document.querySelector('header.site-header'),
      document.querySelector('footer.site-footer')
    ].filter(Boolean);
    bgNodes.forEach((node) => {
      node.setAttribute('inert', '');
      node.setAttribute('aria-hidden', 'true');
    });

    const focusTimeout = setTimeout(() => {
      closeBtnRef.current?.focus();
    }, 50);

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleClose();
        return;
      }
      if (e.key === 'Tab' && dialogRef.current) {
        const focusables = dialogRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusables.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(focusTimeout);
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = origOverflow;
      document.body.style.paddingRight = origPaddingRight;
      bgNodes.forEach((node) => {
        node.removeAttribute('inert');
        node.removeAttribute('aria-hidden');
      });
      if (prevActiveRef.current && typeof prevActiveRef.current.focus === 'function') {
        prevActiveRef.current.focus();
      }
    };
  }, [isOpen, handleClose]);

  if (!isOpen || typeof document === 'undefined') return null;

  return createPortal(
    <div
      className={`welcome-overlay ${isClosing ? 'is-closing' : ''}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
      role="presentation"
    >
      <div
        ref={dialogRef}
        className={`welcome-card ${isClosing ? 'is-closing' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="welcome-popup-title"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button Inside Card Top-Right */}
        <button
          ref={closeBtnRef}
          type="button"
          className="welcome-close-btn"
          onClick={handleClose}
          onTouchEnd={(e) => {
            e.preventDefault();
            handleClose();
          }}
          aria-label={t('welcomePopup.closeAriaLabel')}
        >
          <Icon name="close" size={18} />
        </button>

        {/* Left Column: Photo */}
        <WelcomePopupPhoto />

        {/* Right Column: Content */}
        <WelcomePopupContent
          settings={settings}
          onEnquiry={handleEnquiry}
          onActionClick={setHasSeen}
        />
      </div>
    </div>,
    document.body
  );
}
