// src/stores/opportunitiesStore.ts
import { create } from 'zustand';
import type { JobOpportunity } from '../types/opportunities';
import { generateId } from '../utils/id';
import { getOpportunities, saveOpportunities } from '../storage/opportunities';

interface OpportunitiesState {
  opportunities: JobOpportunity[];
  isLoading: boolean;
  
  // Actions
  loadOpportunities: () => void;
  addOpportunity: (opportunity: Omit<JobOpportunity, 'id' | 'capturedDate'>) => JobOpportunity;
  deleteOpportunity: (id: string) => void;
  setOpportunities: (opportunities: JobOpportunity[]) => void;
  refreshOpportunities: () => void;
}

/**
 * Zustand store for managing job opportunities.
 * Persistence is handled by the storage layer (src/storage/opportunities.ts)
 */
export const useOpportunitiesStore = create<OpportunitiesState>()((set) => ({
  opportunities: [],
  isLoading: false,

  loadOpportunities: () => {
    set({ isLoading: true });
    try {
      const opps = getOpportunities();
      set({ opportunities: opps, isLoading: false });
    } catch (error) {
      console.error('Error loading opportunities:', error);
      set({ opportunities: [], isLoading: false });
    }
  },

  addOpportunity: (opportunityData) => {
    const newOpportunity: JobOpportunity = {
      ...opportunityData,
      id: generateId(),
      capturedDate: new Date().toISOString(),
    };

    set((state) => {
      const updated = [...state.opportunities, newOpportunity];
      saveOpportunities(updated);
      return { opportunities: updated };
    });

    return newOpportunity;
  },

  deleteOpportunity: (id) => {
    set((state) => {
      const updated = state.opportunities.filter((opp) => opp.id !== id);
      saveOpportunities(updated);
      return { opportunities: updated };
    });
  },

  setOpportunities: (opportunities) => {
    set({ opportunities });
    saveOpportunities(opportunities);
  },

  refreshOpportunities: () => {
    const opps = getOpportunities();
    set({ opportunities: opps });
  },
}));
