// src/stores/applicationsStore.ts
import { create } from 'zustand';
import type { JobApplication, LegacyJobApplication } from '../types/applications';
import { generateId } from '../utils/id';
import { getApplications, saveApplications, migrateApplicationData } from '../storage/applications';

interface ApplicationsState {
  applications: JobApplication[];
  isLoading: boolean;
  
  // Actions
  loadApplications: () => void;
  addApplication: (application: Omit<JobApplication, 'id'>) => void;
  updateApplication: (id: string, updates: Partial<JobApplication>) => void;
  deleteApplication: (id: string) => void;
  setApplications: (applications: JobApplication[]) => void;
  refreshApplications: () => void;
}

/**
 * Check if an application is in legacy format
 */
const isLegacyApplication = (app: unknown): app is LegacyJobApplication => {
  return typeof app === 'object' && app !== null && !('timeline' in app);
};

/**
 * Zustand store for managing job applications.
 * Persistence is handled by the storage layer (src/storage/applications.ts)
 */
export const useApplicationsStore = create<ApplicationsState>()((set) => ({
  applications: [],
  isLoading: false,

  loadApplications: () => {
    set({ isLoading: true });
    try {
      const apps = getApplications();
      // Migrate legacy applications if needed
      const migrated = apps.map((app) => {
        if (isLegacyApplication(app)) {
          return migrateApplicationData(app);
        }
        return app as JobApplication;
      });
      
      // Save migrated data back if any migration occurred
      const hasLegacy = apps.some((app) => isLegacyApplication(app));
      if (hasLegacy) {
        saveApplications(migrated);
      }
      
      set({ applications: migrated, isLoading: false });
    } catch (error) {
      console.error('Error loading applications:', error);
      set({ applications: [], isLoading: false });
    }
  },

  addApplication: (applicationData) => {
    const newApplication: JobApplication = {
      ...applicationData,
      id: generateId(),
      timeline: applicationData.timeline || [],
    } as JobApplication;

    set((state) => {
      const updated = [...state.applications, newApplication];
      saveApplications(updated);
      return { applications: updated };
    });
  },

  updateApplication: (id, updates) => {
    set((state) => {
      const updated = state.applications.map((app) =>
        app.id === id ? { ...app, ...updates } : app
      );
      saveApplications(updated);
      return { applications: updated };
    });
  },

  deleteApplication: (id) => {
    set((state) => {
      // Mark as deleted instead of removing
      const updated = state.applications.map((app) =>
        app.id === id ? { ...app, status: 'Deleted' } : app
      );
      saveApplications(updated);
      return { applications: updated };
    });
  },

  setApplications: (applications) => {
    set({ applications });
    saveApplications(applications);
  },

  refreshApplications: () => {
    const apps = getApplications();
    set({ applications: apps });
  },
}));
