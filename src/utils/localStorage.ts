// src/utils/localStorage.ts
import DOMPurify from 'dompurify';

export const STORAGE_KEY = 'jobTrackerData';

/**
 * Recursively sanitizes all string properties of an object.
 * @param obj The object to sanitize.
 * @returns A new object with all string properties sanitized.
 */
const sanitizeObject = <T extends Record<string, any>>(obj: T): T => {
  const sanitizedObj: Record<string, any> = {};
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
            return sanitizeObject(item);
          }
          if (typeof item === 'string') {
            return DOMPurify.sanitize(item);
          }
          return item;
        });
      } else if (typeof value === 'object' && value !== null) {
        // Recursively sanitize nested objects
        sanitizedObj[key] = sanitizeObject(value);
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
    apps = apps.map(app => sanitizeObject(app));
    
    // Migrate legacy applications if needed
    const migrated = apps.map((app) => {
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
    const sanitizedApplications = applications.map(app => sanitizeObject(app));
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
    const sanitizedOpportunities = opportunities.map(opp => sanitizeObject(opp));
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
