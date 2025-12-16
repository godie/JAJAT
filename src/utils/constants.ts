// src/utils/constants.ts
import type { FieldDefinition, UserPreferences } from '../types/preferences';

export const STORAGE_KEY = 'jobTrackerData';
export const PREFERENCES_STORAGE_KEY = 'jobTrackerPreferences';
export const OPPORTUNITIES_STORAGE_KEY = 'jobOpportunities';

export const DEFAULT_FIELDS: FieldDefinition[] = [
  { id: 'position', label: 'Position', type: 'text', required: true },
  { id: 'company', label: 'Company', type: 'text', required: true },
  { id: 'salary', label: 'Salary', type: 'text', required: false },
  { id: 'status', label: 'Status', type: 'text', required: false },
  { id: 'applicationdate', label: 'Application Date', type: 'date', required: false },
  { id: 'interviewdate', label: 'Interview Date', type: 'date', required: false },
  { id: 'platform', label: 'Platform', type: 'text', required: false },
  { id: 'contactname', label: 'Contact Name', type: 'text', required: false },
  { id: 'followupdate', label: 'Follow-up Date', type: 'date', required: false },
  { id: 'notes', label: 'Notes', type: 'text', required: false },
  { id: 'link', label: 'Link', type: 'url', required: false },
];

export const DEFAULT_PREFERENCES: UserPreferences = {
  enabledFields: DEFAULT_FIELDS.map((field) => field.id),
  customFields: [],
  columnOrder: DEFAULT_FIELDS.map((field) => field.id),
  defaultView: 'table',
  dateFormat: 'YYYY-MM-DD',
  customInterviewEvents: [],
};

