
import { format, addDays, isWeekend, parseISO, differenceInBusinessDays, startOfDay, isBefore, isAfter, isEqual } from 'date-fns';

/**
 * Checks if a date is a workday in Israel (Sunday-Thursday).
 * Friday (5) and Saturday (6) are weekends.
 */
export const isIsraelWorkday = (date: Date): boolean => {
  const day = date.getDay(); // 0 (Sun) to 6 (Sat)
  return day !== 5 && day !== 6;
};

/**
 * Adds workdays (Sun-Thu) to a start date.
 */
export const addIsraelWorkdays = (startDateStr: string, days: number): string => {
  if (days <= 0) return startDateStr;
  let date = parseISO(startDateStr);
  let added = 0;
  
  // If starting on a weekend, push to next Sunday
  while (!isIsraelWorkday(date)) {
    date = addDays(date, 1);
  }

  while (added < days - 1) {
    date = addDays(date, 1);
    if (isIsraelWorkday(date)) {
      added++;
    }
  }
  
  return format(date, 'yyyy-MM-dd');
};

export const getTodayStr = () => format(new Date(), 'yyyy-MM-dd');

export const isTaskOverdue = (plannedEnd: string, status: string): boolean => {
  if (status === 'הושלם') return false;
  const today = startOfDay(new Date());
  const end = startOfDay(parseISO(plannedEnd));
  return isBefore(end, today);
};

export const isPlannedUntilTodayNotDone = (plannedEnd: string, status: string): boolean => {
  if (status === 'הושלם') return false;
  const today = startOfDay(new Date());
  const end = startOfDay(parseISO(plannedEnd));
  return isBefore(end, today) || isEqual(end, today);
};
