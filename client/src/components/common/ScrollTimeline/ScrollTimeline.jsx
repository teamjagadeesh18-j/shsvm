import React, { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Icon from '../Icon/Icon';
import { addScrollListener } from '../../../services/scrollController';
import './ScrollTimeline.css';

const TRIGGER_RATIO = 0.55;

/**
 * ScrollTimeline Component
 * A scroll-driven progress timeline with continuous line fill and discrete stage updates.
 * Features:
 * - Real <ol>/<li> semantic accessibility with screen-reader completion announcements.
 * - Single passive scroll listener + ResizeObserver, throttled via requestAnimationFrame.
 * - One getBoundingClientRect per frame to compute progress along circle centers.
 * - prefers-reduced-motion override without transitions.
 */
export default function ScrollTimeline({
  items = [],
  activeId = null,
  onHover = null,
  onCurrentStepChange = null,
  className = ''
}) {
  const { t } = useTranslation();
  const containerRef = useRef(null);
  const circleRefs = useRef([]);
  const circleCentersRef = useRef([]);
  const reachedCountRef = useRef(items.length);
  const lastProgressRef = useRef(-1);
  const [reachedCount, setReachedCount] = useState(items.length);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let cachedContainerPageTop = 0;

    const measure = () => {
      const containerRect = container.getBoundingClientRect();
      const scrollY = window.scrollY || window.pageYOffset || 0;
      cachedContainerPageTop = containerRect.top + scrollY;

      const centers = [];
      circleRefs.current.forEach((el) => {
        if (el) {
          const r = el.getBoundingClientRect();
          centers.push((r.top - containerRect.top) + r.height / 2);
        }
      });

      if (centers.length > 0) {
        circleCentersRef.current = centers;
        const first = centers[0];
        const last = centers[centers.length - 1];
        container.style.setProperty('--timeline-first-center', `${first}px`);
        container.style.setProperty('--timeline-track-height', `${Math.max(0, last - first)}px`);
      }
    };

    const updateProgress = (scrollY = (window.scrollY || 0), winHeight = (window.innerHeight || 800)) => {
      const centers = circleCentersRef.current;
      if (!centers || centers.length === 0) return;

      const containerTop = cachedContainerPageTop - scrollY;
      const triggerY = winHeight * TRIGGER_RATIO;
      const firstCenter = centers[0];
      const lastCenter = centers[centers.length - 1];
      const maxProgress = Math.max(0, lastCenter - firstCenter);

      const rawProgress = triggerY - containerTop - firstCenter;
      const progressPx = Math.min(Math.max(rawProgress, 0), maxProgress);

      if (Math.abs(progressPx - lastProgressRef.current) < 0.5) return;
      lastProgressRef.current = progressPx;

      container.style.setProperty('--timeline-progress', `${progressPx}px`);

      let newCount = 0;
      if (rawProgress >= 0) {
        for (let i = 0; i < centers.length; i++) {
          if (progressPx >= (centers[i] - firstCenter) - 1) {
            newCount = i + 1;
          }
        }
      }

      if (newCount !== reachedCountRef.current) {
        reachedCountRef.current = newCount;
        setReachedCount(newCount);
        if (onCurrentStepChange) {
          const currentId = newCount > 0 ? items[newCount - 1]?.id : null;
          onCurrentStepChange(currentId);
        }
      }
    };

    measure();
    updateProgress();

    const unsubscribeScroll = addScrollListener((scrollY, winH) => {
      updateProgress(scrollY, winH);
    });

    const onResize = () => {
      measure();
      updateProgress();
    };

    window.addEventListener('resize', onResize, { passive: true });

    let ro = null;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(() => {
        measure();
        updateProgress();
      });
      ro.observe(container);
    }

    return () => {
      unsubscribeScroll();
      window.removeEventListener('resize', onResize);
      if (ro) ro.disconnect();
    };
  }, [items, onCurrentStepChange]);

  const currentIdx = reachedCount > 0 ? reachedCount - 1 : -1;

  return (
    <div
      ref={containerRef}
      className={`scroll-timeline-container ${className}`}
      data-reached-count={reachedCount}
    >
      {/* Background Grey Track & Continuous Accent Fill */}
      <div className="scroll-timeline-track" aria-hidden="true">
        <div className="scroll-timeline-fill" />
      </div>

      <ol className="scroll-timeline-list" aria-label={t('journey.timelineAriaLabel')}>
        {items.map((item, idx) => {
          const isReached = idx < reachedCount;
          const isCurrent = idx === currentIdx;
          const isHovered = activeId === item.id;

          const cardContent = (
            <>
              <div className="scroll-timeline-card-header">
                <div className="scroll-timeline-card-title-group">
                  <Icon name={item.icon || 'star'} size={20} className="scroll-timeline-card-icon" />
                  <h3 className="scroll-timeline-card-title">{item.title}</h3>
                </div>
                {item.link ? (
                  <Icon name="arrowUpRight" size={18} className="scroll-timeline-card-arrow" />
                ) : null}
              </div>
              <p className="scroll-timeline-card-desc">{item.desc}</p>
            </>
          );

          return (
            <li
              key={item.id}
              className={`scroll-timeline-item ${isReached ? 'is-reached' : ''} ${isCurrent ? 'is-current' : ''}`}
            >
              {/* Left Circle Node */}
              <div className="scroll-timeline-node">
                <div
                  ref={(el) => { circleRefs.current[idx] = el; }}
                  className="scroll-timeline-circle"
                  aria-hidden="true"
                >
                  {item.number}
                </div>
                <span className="sr-only">
                  {isReached
                    ? t('journey.stepCompleted', { number: item.number, total: items.length })
                    : t('journey.stepPending', { number: item.number, total: items.length })}
                </span>
              </div>

              {/* Right Step Card */}
              {item.link ? (
                <Link
                  to={item.link}
                  className={`scroll-timeline-card ${isCurrent ? 'is-current' : ''} ${isHovered ? 'is-hovered' : ''}`}
                  aria-current={isCurrent ? 'step' : undefined}
                  onMouseEnter={() => onHover && onHover(item.id)}
                  onMouseLeave={() => onHover && onHover(null)}
                  onFocus={() => onHover && onHover(item.id)}
                  onBlur={() => onHover && onHover(null)}
                >
                  {cardContent}
                </Link>
              ) : (
                <div
                  tabIndex={0}
                  className={`scroll-timeline-card ${isCurrent ? 'is-current' : ''} ${isHovered ? 'is-hovered' : ''}`}
                  aria-current={isCurrent ? 'step' : undefined}
                  onMouseEnter={() => onHover && onHover(item.id)}
                  onMouseLeave={() => onHover && onHover(null)}
                  onFocus={() => onHover && onHover(item.id)}
                  onBlur={() => onHover && onHover(null)}
                >
                  {cardContent}
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

