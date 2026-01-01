// src/utils/constants.ts
import type { UserPreferences, FieldDefinition } from "../types/preferences";

export const STORAGE_KEY = 'jobTrackerData';
export const OPPORTUNITIES_STORAGE_KEY = 'jobOpportunities';
export const PREFERENCES_STORAGE_KEY = 'jobTrackerPreferences';

export const VALUE_BY_STATUS: Record<string, string> = {
  'applied': 'Applied',
  'interviewing': 'Interviewing',
  'offer': 'Offer',
  'rejected': 'Rejected',
  'withdrawn': 'Withdrawn',
};

export const DEFAULT_FIELDS: FieldDefinition[] = [
  { id: 'position', label: 'Position', type: 'text', required: true },
  { id: 'company', label: 'Company', type: 'text', required: true },
  { id: 'status', label: 'Status', type: 'text', required: false },
  { id: 'applicationDate', label: 'Application Date', type: 'date', required: false },
  { id: 'timeline', label: 'Timeline', type: 'text', required: false },
  { id: 'notes', label: 'Notes', type: 'text', required: false },
  { id: 'link', label: 'Link', type: 'url', required: false },
  { id: 'platform', label: 'Platform', type: 'text', required: false },
  { id: 'salary', label: 'Salary', type: 'text', required: false },
  { id: 'contactName', label: 'Contact', type: 'text', required: false },
  { id: 'followUpDate', label: 'Follow Up', type: 'date', required: false },
];

export const DEFAULT_PREFERENCES: UserPreferences = {
  enabledFields: DEFAULT_FIELDS.filter(field => field.id !== 'notes').map(field => field.id),
  columnOrder: DEFAULT_FIELDS.map(field => field.id),
  customFields: [],
  defaultView: 'table',
  dateFormat: 'YYYY-MM-DD',
  customInterviewEvents: [],
};
