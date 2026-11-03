import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import useInViewReplay from '../../../hooks/useInViewReplay';
import './CalendarWidget.css';

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

function getKolkataMonthData(mockDate) {
  const fallback = typeof window !== 'undefined' && window.__MOCK_CALENDAR_DATE__;
  const target = mockDate || fallback || new Date();
  const date = target instanceof Date ? target : new Date(target);

  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric'
  });
  const parts = dtf.formatToParts(date);
  const year = parseInt(parts.find((p) => p.type === 'year').value, 10);
  const month = parseInt(parts.find((p) => p.type === 'month').value, 10);
  const todayDay = parseInt(parts.find((p) => p.type === 'day').value, 10);

  const monthName = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kolkata',
    month: 'long',
    year: 'numeric'
  }).format(date);

  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const firstDay = new Date(Date.UTC(year, month - 1, 1, 6, 0, 0));
  const weekdayStr = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kolkata',
    weekday: 'short'
  }).format(firstDay);

  const dayMap = { Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4, Sat: 5, Sun: 6 };
  const leadingBlanks = dayMap[weekdayStr] ?? 0;

  return { year, month, monthName, todayDay, daysInMonth, leadingBlanks };
}

export default function CalendarWidget({ mockDate }) {
  const { t } = useTranslation();
  const { ref, isVisible } = useInViewReplay({ threshold: 0.3, rootMargin: '0px 0px -10% 0px' });

  const data = useMemo(() => getKolkataMonthData(mockDate), [mockDate]);
  const { monthName, todayDay, daysInMonth, leadingBlanks } = data;

  const totalSlots = leadingBlanks + daysInMonth;

  return (
    <div
      ref={ref}
      className={`calendar-widget ${isVisible ? 'is-animated' : ''}`}
      role="region"
      aria-label={`${t('card1Title')}, ${monthName}`}
    >
      {/* Month & Year Header */}
      <div className="cal-header">
        <span className="cal-month-title">{monthName}</span>
      </div>

      {/* 7-column Calendar Grid */}
      <div className="cal-grid" role="grid" aria-label={monthName}>
        {/* Day-of-week headers */}
        <div className="cal-days-header" role="row">
          {DAY_LABELS.map((day, idx) => (
            <div
              key={idx}
              className="cal-day-label"
              role="columnheader"
              style={{ '--day-col': idx }}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Date cells with leading blanks */}
        <div className="cal-dates-wrap">
          {Array.from({ length: totalSlots }).map((_, slotIdx) => {
            if (slotIdx < leadingBlanks) {
              return (
                <div
                  key={`blank-${slotIdx}`}
                  className="cal-cell cal-blank"
                  aria-hidden="true"
                />
              );
            }

            const dayNum = slotIdx - leadingBlanks + 1;
            const colIdx = slotIdx % 7;
            const rowIdx = Math.floor(slotIdx / 7);
            const isSunday = colIdx === 6;
            const isToday = dayNum === todayDay;

            let cellClass = 'cal-cell';
            let cellTitle = t('legendSchoolDay');

            if (isToday) {
              cellClass += ' cal-today';
              cellTitle = `${t('legendToday')}, ${isSunday ? t('legendSundayClosed') : t('legendSchoolDay')}`;
            } else if (isSunday) {
              cellClass += ' cal-closed';
              cellTitle = t('legendSundayClosed');
            } else {
              cellClass += ' cal-school-day';
            }

            return (
              <div
                key={`day-${dayNum}`}
                className={cellClass}
                role="gridcell"
                tabIndex={-1}
                aria-current={isToday ? 'date' : undefined}
                title={cellTitle}
                style={{
                  '--cell-wave': rowIdx + colIdx,
                  '--cell-idx': slotIdx
                }}
              >
                <span className="cal-cell-inner">{dayNum}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend Row */}
      <div className="cal-legend" aria-hidden="true">
        <div className="cal-legend-item">
          <span className="cal-legend-dot cal-dot-school" />
          <span>{t('legendSchoolDay')}</span>
        </div>
        <div className="cal-legend-item">
          <span className="cal-legend-dot cal-dot-closed" />
          <span>{t('legendSundayClosed')}</span>
        </div>
        <div className="cal-legend-item">
          <span className="cal-legend-dot cal-dot-today" />
          <span>{t('legendToday')}</span>
        </div>
      </div>

      {/* Bottom Timing Pill */}
      <div className="cal-timings-pill">
        <span className="cal-timings-dot" aria-hidden="true" />
        <span className="cal-timings-text">{t('calendarTimings')}</span>
      </div>
    </div>
  );
}
