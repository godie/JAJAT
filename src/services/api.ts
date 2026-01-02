// src/services/api.ts
import type { JobApplication } from '../types/applications';
import { generateId } from '../utils/id';

// Simulate a database in memory
let applications: JobApplication[] = [];

// Simulate API latency
const LATENCY = 500;

/**
 * Fetches all job applications.
 */
export const getApplications = async (): Promise<JobApplication[]> => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve([...applications]);
    }, LATENCY);
  });
};

/**
 * Resets the applications array.
 * This is for testing purposes only.
 */
export const __dangerouslyResetApplications = () => {
  applications = [];
};

/**
 * Adds a new job application.
 */
export const addApplication = async (appData: Omit<JobApplication, 'id'>): Promise<JobApplication> => {
  return new Promise(resolve => {
    setTimeout(() => {
      const newApplication: JobApplication = {
        ...appData,
        id: generateId(),
      };
      applications.push(newApplication);
      resolve(newApplication);
    }, LATENCY);
  });
};

/**
 * Updates an existing job application.
 */
export const updateApplication = async (updatedApp: JobApplication): Promise<JobApplication> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = applications.findIndex(app => app.id === updatedApp.id);
      if (index !== -1) {
        applications[index] = updatedApp;
        resolve(updatedApp);
      } else {
        reject(new Error('Application not found'));
      }
    }, LATENCY);
  });
};

/**
 * Deletes a job application by its ID.
 */
export const deleteApplication = async (id: string): Promise<{ id: string }> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = applications.findIndex(app => app.id === id);
      if (index !== -1) {
        applications.splice(index, 1);
        resolve({ id });
      } else {
        reject(new Error('Application not found'));
      }
    }, LATENCY);
  });
};
