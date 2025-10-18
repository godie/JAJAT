// src/utils/localStorage.ts

export const STORAGE_KEY = 'jobTrackerData';

export interface JobApplication {
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
 * Obtiene las aplicaciones guardadas o un array vacío si no hay datos.
 */
export const getApplications = (): JobApplication[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
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
    localStorage.setItem(STORAGE_KEY, JSON.stringify(applications));
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