// src/utils/tableUtils.ts
import type { JobApplication } from './localStorage';

export const columnToKeyMap: Record<string, keyof JobApplication> = {
  'position': 'position',
  'company': 'company',
  'salary': 'salary',
  'status': 'status',
  'applicationdate': 'applicationDate',
  'interviewdate': 'interviewDate',
  'platform': 'platform',
  'contactname': 'contactName',
  'followupdate': 'followUpDate',
  'notes': 'notes',
  'link': 'link',
};

export const getCellValue = (item: JobApplication, column: string): string => {
  const normalizedColumn = column.toLowerCase().replace(/ /g, '').replace(/-/g, '');
  const key = columnToKeyMap[normalizedColumn];
  return key ? String(item[key] ?? '') : '';
};
