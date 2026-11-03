import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { getSettings } from '../../../services/content';
import Icon from '../../common/Icon/Icon';
import HeroDock from './HeroDock';
import {
  HERO_TYPING_MS,
  HERO_DELETE_MS,
  HERO_HOLD_MS,
  HERO_PAUSE_BEFORE_NEXT_MS,
  HERO_REVEAL_STAGGER_MS
} from './heroTiming';
import './HeroLeft.css';

const DEFAULT_TYPEWORDS = [
  'Smile, Study, Serve',
  'Primary to Secondary',
  'Academic & Arts Focus',
  'Care & Discipline'
];

export default function HeroLeft({ onOpenEnquiry }) {
  const { t } = useTranslation();
  const settings = getSettings();
  const words = t('heroTypewords', { returnObjects: true }) || DEFAULT_TYPEWORDS;
  const wordList = Array.isArray(words) && words.length > 0 ? words : DEFAULT_TYPEWORDS;
  const [wordIndex, setWordIndex] = useState(0);
  const [displayText, setDisplayText] = useState(wordList[0]);
  const [isDeleting, setIsDeleting] = useState(false);

  // Check prefers-reduced-motion
  const prefersReducedMotion = typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const currentWord = wordList[wordIndex % wordList.length];
  const longestWord = wordList.reduce(
    (acc, curr) => (curr.length > acc.length ? curr : acc),
    wordList[0]
  );

  // Typewriter effect (strictly preserved keyframes & timing)
  useEffect(() => {
    if (prefersReducedMotion) return;

    let timer;
    if (!isDeleting && displayText === currentWord) {
      timer = setTimeout(() => setIsDeleting(true), HERO_HOLD_MS);
    } else if (isDeleting && displayText === '') {
      timer = setTimeout(() => {
        setIsDeleting(false);
        setWordIndex((prev) => (prev + 1) % wordList.length);
      }, HERO_PAUSE_BEFORE_NEXT_MS);
    } else {
      const speed = isDeleting ? HERO_DELETE_MS : HERO_TYPING_MS;
      timer = setTimeout(() => {
        setDisplayText((prev) =>
          isDeleting
            ? currentWord.substring(0, prev.length - 1)
            : currentWord.substring(0, prev.length + 1)
        );
      }, speed);
    }

    return () => clearTimeout(timer);
  }, [displayText, isDeleting, wordIndex, currentWord, prefersReducedMotion, wordList.length]);

  const renderedText = prefersReducedMotion ? wordList[0] : displayText;

  const prefixText = t('heroTitlePrefix', 'Where Every Child Learns to');
  const prefixWords = useMemo(() => prefixText.split(' '), [prefixText]);

  const phoneDisplay = settings.phone || '+91 89394 21231';
  const phoneRaw = settings.phoneRaw || '+918939421231';
  const pillText = t('pillCallSchool', {
    phone: phoneDisplay,
    defaultValue: `Call the school: ${phoneDisplay}`
  });

  return (
    <div className="hero-left-col">
      {/* Pills Container */}
      <div className="hero-pills-wrap">
        <a href={`tel:${phoneRaw}`} className="hero-shiny-pill">
          <span className="shiny-pill-dot" aria-hidden="true" />
          <span className="shiny-pill-text">{pillText}</span>
        </a>

        {Boolean(settings.admissionsOpen) && (
          <span className="hero-admissions-pill">
            <span className="admissions-pill-dot" aria-hidden="true" />
            <span>{t('pillAdmissionsOpen', 'Admissions open')}</span>
          </span>
        )}
      </div>

      {/* Main Left-Aligned Headline */}
      <h1
        className="hero-bento-title"
        aria-label={`${prefixText} ${wordList[0]} - ${settings.name}`}
      >
        <span className="hero-title-prefix">
          {prefixWords.map((word, idx) => (
            <span
              key={idx}
              className="hero-word-reveal"
              style={{ animationDelay: `${idx * HERO_REVEAL_STAGGER_MS}ms` }}
            >
              {word}
              {idx < prefixWords.length - 1 ? '\u00A0' : ''}
            </span>
          ))}
        </span>
        <span className="hero-highlight" aria-hidden="true">
          <span className="typewriter-sizer" aria-hidden="true">
            {longestWord}
          </span>
          <span className="typewriter-visible">
            <span className="typewriter-text hero-typewriter-shimmer">
              {renderedText}
            </span>
            {!prefersReducedMotion && <span className="typing-cursor">|</span>}
          </span>
        </span>
        <span className="sr-only"> - Sree Hari Saradha Vidhyalaya Matriculation School, Pakkam, Thiruvallur</span>
      </h1>

      {/* Hero Subtext */}
      <p className="hero-bento-subtext">
        {t('heroSubtext')}
      </p>

      {/* CTA Buttons */}
      <div className="hero-bento-actions">
        <button
          type="button"
          className="btn-conic-border"
          onClick={onOpenEnquiry}
        >
          <span className="btn-conic-inner">
            {t('btnEnquiry')}
          </span>
        </button>

        <a href={`tel:${phoneRaw}`} className="btn-outline-pill">
          <Icon name="phone" size={16} strokeWidth={2} />
          <span>{t('btnCallSchool', 'Call the School')}</span>
        </a>
      </div>

      {/* Quick Actions Dock Row */}
      <HeroDock />
    </div>
  );
}

