// src/utils/localStorage.ts
import DOMPurify from 'dompurify';

export const STORAGE_KEY = 'jobTrackerData';
const PREFERENCES_STORAGE_KEY = 'jobTrackerPreferences';

/**
 * Validates and sanitizes a URL for safe use in href attributes.
 * Prevents javascript:, data:, vbscript: and other dangerous URL schemes.
 * @param url The URL to validate
 * @returns A safe URL string, or '#' if the URL is invalid or dangerous
 */
export const sanitizeUrl = (url: string): string => {
  if (!url || typeof url !== 'string') {
    return '#';
  }

  try {
    const parsedUrl = new URL(url);
    const protocol = parsedUrl.protocol.toLowerCase();

    // Allow only safe URL schemes
    const allowedSchemes = ['http:', 'https:', 'mailto:', 'tel:'];
    if (!allowedSchemes.includes(protocol)) {
      return '#';
    }

    return url;
  } catch {
    // If URL parsing fails, check if it's a relative URL (starts with /)
    // Only allow relative URLs that start with /
    if (url.startsWith('/') && !url.startsWith('//')) {
      return url;
    }
    // Return safe default for invalid URLs
    return '#';
  }
};

/**
 * Recursively sanitizes all string properties of an object.
 * @param obj The object to sanitize.
 * @returns A new object with all string properties sanitized.
 */
const sanitizeObject = <T extends Record<string, unknown>>(obj: T): T => {
  const sanitizedObj: Record<string, unknown> = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key];
      if (typeof value === 'string') {
        // Sanitize string values
        sanitizedObj[key] = DOMPurify.sanitize(value);
      } else if (Array.isArray(value)) {
        // Recursively sanitize items in arrays
        sanitizedObj[key] = value.map(item => {
          if (typeof item === 'object' && item !== null) {
            return sanitizeObject(item as Record<string, unknown>);
          }
          if (typeof item === 'string') {
            return DOMPurify.sanitize(item);
          }
          return item;
        });
      } else if (typeof value === 'object' && value !== null) {
        // Recursively sanitize nested objects
        sanitizedObj[key] = sanitizeObject(value as Record<string, unknown>);
      } else {
        // Keep non-string, non-object, non-array values as is
        sanitizedObj[key] = value;
      }
    }
  }
  return sanitizedObj as T;
};


/**
 * Interview Event Types
 */
export type InterviewStageType = 
  | 'application_submitted'
  | 'screener_call'
  | 'first_contact'
  | 'technical_interview'
  | 'code_challenge'
  | 'live_coding'
  | 'hiring_manager'
  | 'system_design'
  | 'cultural_fit'
  | 'final_round'
  | 'offer'
  | 'rejected'
  | 'withdrawn'
  | 'custom';

export type EventStatus = 'completed' | 'scheduled' | 'cancelled' | 'pending';

/**
 * Interview Event - Individual milestone in the interview process
 */
export interface InterviewEvent {
  id: string;
  type: InterviewStageType;
  date: string; // ISO format date
  notes?: string;
  status: EventStatus;
  customTypeName?: string; // For custom types
  interviewerName?: string; // Name of the interviewer
}

/**
 * Job Application - Hybrid approach combining timeline, status, and flexibility
 */
export interface JobApplication {
  // Core identification
  id: string;
  position: string;
  company: string;
  
  // Quick reference fields (legacy support)
  salary: string;
  status: string; // Quick status reference
  applicationDate: string;
  interviewDate: string;
  
  // New timeline-based tracking
  timeline: InterviewEvent[];
  
  // Additional fields
  notes: string;
  link: string;
  platform: string;
  contactName: string;
  followUpDate: string;
  
  // User-defined custom fields
  customFields?: Record<string, string>;
}

/**
 * Configurable field definitions for applications table & forms
 */
export type FieldType = 'text' | 'date' | 'number' | 'select' | 'checkbox' | 'url';

export interface FieldDefinition {
  /**
   * Internal identifier, also used to map against JobApplication keys.
   * Example: "position", "company", "applicationdate"
   */
  id: string;
  /** Human readable label shown in UI */
  label: string;
  type: FieldType;
  required: boolean;
  options?: string[];
}

export type DateFormat = 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';
export type ViewType = 'table' | 'timeline' | 'kanban' | 'calendar';

export interface UserPreferences {
  /** IDs of fields that should be visible/enabled in the table */
  enabledFields: string[];
  /** User defined additional fields (stored for future expansion) */
  customFields: FieldDefinition[];
  /** Order of columns in the table (references field IDs) */
  columnOrder: string[];
  /** Default view to show when opening the applications page */
  defaultView: ViewType;
  /** Date format preference */
  dateFormat: DateFormat;
}

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
};

export const getPreferences = (): UserPreferences => {
  try {
    const stored = localStorage.getItem(PREFERENCES_STORAGE_KEY);
    if (!stored) {
      return DEFAULT_PREFERENCES;
    }
    const parsed = JSON.parse(stored) as Partial<UserPreferences>;

    // Merge with defaults to be resilient to schema changes
    const enabledFields = parsed.enabledFields && parsed.enabledFields.length > 0
      ? parsed.enabledFields
      : DEFAULT_PREFERENCES.enabledFields;

    const columnOrder = parsed.columnOrder && parsed.columnOrder.length > 0
      ? parsed.columnOrder
      : DEFAULT_PREFERENCES.columnOrder;

    const customFields = parsed.customFields ?? DEFAULT_PREFERENCES.customFields;
    
    const defaultView = (parsed.defaultView && ['table', 'timeline', 'kanban', 'calendar'].includes(parsed.defaultView))
      ? parsed.defaultView
      : DEFAULT_PREFERENCES.defaultView;
    
    const dateFormat = (parsed.dateFormat && ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'].includes(parsed.dateFormat))
      ? parsed.dateFormat
      : DEFAULT_PREFERENCES.dateFormat;

    return {
      enabledFields,
      columnOrder,
      customFields,
      defaultView,
      dateFormat,
    };
  } catch (error) {
    console.error('Error loading preferences from localStorage:', error);
    return DEFAULT_PREFERENCES;
  }
};

export const savePreferences = (preferences: UserPreferences): void => {
  try {
    localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(preferences));
  } catch (error) {
    console.error('Error saving preferences to localStorage:', error);
  }
};

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

/**
 * Legacy JobApplication for backward compatibility during migration
 */
export interface LegacyJobApplication {
  id: string;
  position: string;
  company: string;
  salary: string;
  status: string;
  applicationDate: string;
  interviewDate: string;
  notes: string;
  link: string;
  platform: string;
  contactName: string;
  followUpDate: string;
}

/**
 * Helper function to generate unique IDs
 */
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Helper function to map legacy status to interview stage type
 */
const mapStatusToStageType = (status: string): InterviewStageType => {
  const statusMap: Record<string, InterviewStageType> = {
    'Applied': 'application_submitted',
    'Interviewing': 'technical_interview',
    'Offer': 'offer',
    'Rejected': 'rejected',
    'Withdrawn': 'withdrawn',
  };
  return statusMap[status] || 'application_submitted';
};

/**
 * Migrate legacy application data to new format
 */
export const migrateApplicationData = (legacyApp: LegacyJobApplication): JobApplication => {
  const timeline: InterviewEvent[] = [];
  
  // Add application submitted event if date exists
  if (legacyApp.applicationDate) {
    timeline.push({
      id: generateId(),
      type: 'application_submitted',
      date: legacyApp.applicationDate,
      status: 'completed',
    });
  }
  
  // Add interview event if date exists
  if (legacyApp.interviewDate) {
    timeline.push({
      id: generateId(),
      type: mapStatusToStageType(legacyApp.status),
      date: legacyApp.interviewDate,
      status: 'scheduled',
    });
  }
  
  // Create new application with timeline
  return {
    ...legacyApp,
    timeline: timeline.length > 0 ? timeline : [
      {
        id: generateId(),
        type: 'application_submitted',
        date: legacyApp.applicationDate || new Date().toISOString().split('T')[0],
        status: 'completed',
      }
    ],
  };
};

/**
 * Check if an application is in legacy format
 */
const isLegacyApplication = (app: unknown): app is LegacyJobApplication => {
  return typeof app === 'object' && app !== null && !('timeline' in app);
};

/**
 * Obtiene las aplicaciones guardadas o un array vacío si no hay datos.
 * Automatically migrates legacy data to new format.
 */
export const getApplications = (): JobApplication[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    
    let apps = JSON.parse(data);
    if (!Array.isArray(apps)) return [];

    // Sanitize every field to prevent XSS from previously stored data
    apps = apps.map((app: unknown) => sanitizeObject(app as Record<string, unknown>));
    
    // Migrate legacy applications if needed
    const migrated = apps.map((app: unknown) => {
      if (isLegacyApplication(app)) {
        const migratedApp = migrateApplicationData(app);
        // Save migrated data back
        setTimeout(() => {
          const currentApps = getApplications();
          const updatedApps = currentApps.map((a) => 
            a.id === migratedApp.id ? migratedApp : a
          );
          saveApplications(updatedApps);
        }, 0);
        return migratedApp;
      }
      return app;
    });
    
    return migrated;
  } catch (error) {
    console.error("Error loading data from localStorage:", error);
    return [];
  }
};

/**
 * Guarda el array de aplicaciones en localStorage.
 */
export const saveApplications = (applications: JobApplication[]): void => {
  try {
    const sanitizedApplications = applications.map(app => sanitizeObject(app as unknown as Record<string, unknown>));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitizedApplications));
  } catch (error) {
    console.error("Error saving data to localStorage:", error);
  }
};

/**
 * Simula la verificación de login.
 * En un proyecto real, esto verificaría un token JWT o una sesión.
 */
export const checkLoginStatus = (): boolean => {
  return localStorage.getItem('isLoggedIn') === 'true';
};

/**
 * Simula el login/logout (se usará como placeholder).
 */
export const setLoginStatus = (status: boolean): void => {
  if (status) {
    localStorage.setItem('isLoggedIn', 'true');
  } else {
    localStorage.removeItem('isLoggedIn');
  }
};

/**
 * Job Opportunity - Vacantes interesantes capturadas desde LinkedIn
 */
export interface JobOpportunity {
  id: string;
  position: string;
  company: string;
  link: string;
  description?: string;
  location?: string;
  jobType?: string; // Remote, Hybrid, On-site
  salary?: string;
  postedDate?: string; // ISO format date
  capturedDate: string; // ISO format date - when it was captured
}

const OPPORTUNITIES_STORAGE_KEY = 'jobOpportunities';

/**
 * Obtiene las oportunidades guardadas o un array vacío si no hay datos.
 */
export const getOpportunities = (): JobOpportunity[] => {
  try {
    const data = localStorage.getItem(OPPORTUNITIES_STORAGE_KEY);
    if (!data) return [];
    
    let opportunities = JSON.parse(data);
    if (!Array.isArray(opportunities)) return [];
    
    // Sanitize every field
    opportunities = opportunities.map(opp => sanitizeObject(opp));

    return opportunities;
  } catch (error) {
    console.error("Error loading opportunities from localStorage:", error);
    return [];
  }
};

/**
 * Guarda el array de oportunidades en localStorage.
 */
export const saveOpportunities = (opportunities: JobOpportunity[]): void => {
  try {
    const sanitizedOpportunities = opportunities.map(opp => sanitizeObject(opp as unknown as Record<string, unknown>));
    localStorage.setItem(OPPORTUNITIES_STORAGE_KEY, JSON.stringify(sanitizedOpportunities));
  } catch (error) {
    console.error("Error saving opportunities to localStorage:", error);
  }
};

/**
 * Agrega una nueva oportunidad a la lista.
 */
export const addOpportunity = (opportunity: Omit<JobOpportunity, 'id' | 'capturedDate'>): JobOpportunity => {
  const newOpportunity: JobOpportunity = {
    ...opportunity,
    id: generateId(),
    capturedDate: new Date().toISOString(),
  };
  
  const opportunities = getOpportunities();
  opportunities.push(newOpportunity);
  saveOpportunities(opportunities);
  
  return newOpportunity;
};

/**
 * Elimina una oportunidad por ID.
 */
export const deleteOpportunity = (id: string): void => {
  const opportunities = getOpportunities();
  const filtered = opportunities.filter(opp => opp.id !== id);
  saveOpportunities(filtered);
};

/**
 * Convierte una oportunidad en una aplicación de trabajo.
 * Crea un JobApplication con status "Applied" y fecha actual.
 */
export const convertOpportunityToApplication = (opportunity: JobOpportunity): JobApplication => {
  const now = new Date().toISOString().split('T')[0];
  
  const application: JobApplication = {
    id: generateId(),
    position: opportunity.position,
    company: opportunity.company,
    salary: opportunity.salary || '',
    status: 'Applied',
    applicationDate: now,
    interviewDate: '',
    timeline: [
      {
        id: generateId(),
        type: 'application_submitted',
        date: now,
        status: 'completed',
      }
    ],
    notes: opportunity.description || '',
    link: opportunity.link,
    platform: 'LinkedIn',
    contactName: '',
    followUpDate: '',
  };
  
  // Agregar información adicional en notes si está disponible
  if (opportunity.location || opportunity.jobType) {
    const additionalInfo = [];
    if (opportunity.location) additionalInfo.push(`Location: ${opportunity.location}`);
    if (opportunity.jobType) additionalInfo.push(`Type: ${opportunity.jobType}`);
    if (opportunity.postedDate) additionalInfo.push(`Posted: ${opportunity.postedDate}`);
    
    if (application.notes) {
      application.notes += `\n\n${additionalInfo.join('\n')}`;
    } else {
      application.notes = additionalInfo.join('\n');
    }
  }
  
  return application;
};
