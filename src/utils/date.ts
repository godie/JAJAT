// src/utils/date.ts
import type { DateFormat } from '../types/preferences';

/**
 * Format a date string according to user's date format preference
 * @param dateString - ISO date string (YYYY-MM-DD) or any date string
 * @param format - Date format preference
 * @returns Formatted date string
 */
export const formatDate = (dateString: string, format: DateFormat = 'YYYY-MM-DD'): string => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString; // Return original if invalid
    
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    
    switch (format) {
      case 'DD/MM/YYYY':
        return `${day}/${month}/${year}`;
      case 'MM/DD/YYYY':
        return `${month}/${day}/${year}`;
      case 'YYYY-MM-DD':
      default:
        return `${year}-${month}-${day}`;
    }
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
};

