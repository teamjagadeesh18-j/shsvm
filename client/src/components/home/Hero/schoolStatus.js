/**
 * Computes the school's live open/closed status in the Asia/Kolkata timezone.
 * Schedule: Monday - Saturday 8:00 AM to 5:30 PM (17:30), Sunday Closed.
 */
export function getSchoolStatus(dateObj = new Date()) {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kolkata',
    weekday: 'short',
    hour: 'numeric',
    minute: 'numeric',
    hour12: false
  });

  const parts = formatter.formatToParts(dateObj);
  const partMap = {};
  for (const p of parts) {
    partMap[p.type] = p.value;
  }

  const weekday = partMap.weekday; // 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'
  const hour = parseInt(partMap.hour, 10);
  const minute = parseInt(partMap.minute, 10);
  const timeInMinutes = hour * 60 + minute;

  const openTime = 8 * 60; // 08:00
  const closeTime = 17 * 60 + 30; // 17:30

  const isSunday = weekday === 'Sun';
  const isSaturday = weekday === 'Sat';

  if (!isSunday && timeInMinutes >= openTime && timeInMinutes < closeTime) {
    return {
      isOpen: true,
      day: null
    };
  }

  // Determine next opening day
  let nextDay = 'Monday';
  if (isSunday || (isSaturday && timeInMinutes >= closeTime)) {
    nextDay = 'Monday';
  } else if (timeInMinutes < openTime) {
    const fullDayNames = {
      Mon: 'Monday',
      Tue: 'Tuesday',
      Wed: 'Wednesday',
      Thu: 'Thursday',
      Fri: 'Friday',
      Sat: 'Saturday'
    };
    nextDay = fullDayNames[weekday] || 'Monday';
  } else {
    const nextDays = {
      Mon: 'Tuesday',
      Tue: 'Wednesday',
      Wed: 'Thursday',
      Thu: 'Friday'
    };
    nextDay = nextDays[weekday] || 'Monday';
  }

  return {
    isOpen: false,
    day: nextDay
  };
}

