
import { differenceInBusinessDays, isFriday, isSaturday, eachDayOfInterval, format } from 'date-fns';

/**
 * Calculates working days between two dates, excluding Friday and Saturday (Israel).
 */
export const calculateWorkingDays = (start: Date | string, end: Date | string): number => {
  // Fix: Using native Date constructor as parseISO might not be exported in the current date-fns version
  const startDate = typeof start === 'string' ? new Date(start) : start;
  const endDate = typeof end === 'string' ? new Date(end) : end;
  
  if (startDate > endDate) return 0;
  
  const days = eachDayOfInterval({ start: startDate, end: endDate });
  return days.filter(day => !isFriday(day) && !isSaturday(day)).length;
};

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS' }).format(amount);
};

export const formatDate = (dateStr: string) => {
  // Fix: Using native Date constructor as parseISO might not be exported in the current date-fns version
  return format(new Date(dateStr), 'dd/MM/yyyy');
};