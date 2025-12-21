// src/utils/constants.ts
import { UserPreferences } from "../types/preferences";
import { FieldDefinition } from "../types/fields";

export const STORAGE_KEY = 'jobApplications';
export const OPPORTUNITIES_STORAGE_KEY = 'jobOpportunities';
export const PREFERENCES_STORAGE_KEY = 'userPreferences';

export const VALUE_BY_STATUS: Record<string, string> = {
  'applied': 'Applied',
  'interviewing': 'Interviewing',
  'offer': 'Offer',
  'rejected': 'Rejected',
  'withdrawn': 'Withdrawn',
};

export const DEFAULT_FIELDS: FieldDefinition[] = [
  { id: 'position', label: 'Position', type: 'text', enabled: true },
  { id: 'company', label: 'Company', type: 'text', enabled: true },
  { id: 'status', label: 'Status', type: 'text', enabled: true },
  { id: 'applicationDate', label: 'Application Date', type: 'date', enabled: true },
  { id: 'timeline', label: 'Timeline', type: 'timeline', enabled: true },
  { id: 'notes', label: 'Notes', type: 'textarea', enabled: true },
  { id: 'link', label: 'Link', type: 'url', enabled: true },
  { id: 'platform', label: 'Platform', type: 'text', enabled: false },
  { id: 'salary', label: 'Salary', type: 'text', enabled: false },
  { id: 'contactName', label: 'Contact', type: 'text', enabled: false },
  { id: 'followUpDate', label: 'Follow Up', type: 'date', enabled: false },
];

export const DEFAULT_PREFERENCES: UserPreferences = {
  enabledFields: ['position', 'company', 'status', 'applicationDate'],
  columnOrder: ['position', 'company', 'status', 'applicationDate'],
  customFields: [],
  defaultView: 'table',
  dateFormat: 'YYYY-MM-DD',
  customInterviewEvents: [],
};
