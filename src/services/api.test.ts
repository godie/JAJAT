// src/services/api.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  getApplications, 
  addApplication, 
  updateApplication, 
  deleteApplication,
  __dangerouslyResetApplications
} from './api';
import type { JobApplication } from '../types/applications';

// Mock the generateId function to return predictable IDs for testing
vi.mock('../utils/id', () => ({
  generateId: vi.fn(() => `mock-id-${Math.random()}`),
}));

describe('API Service', () => {
  // Use fake timers to control async operations without waiting
  beforeEach(() => {
    vi.useFakeTimers();
    __dangerouslyResetApplications();
  });

  it('should return an empty array when no applications have been added', async () => {
    const promise = getApplications();
    vi.runAllTimers();
    const result = await promise;
    expect(result).toEqual([]);
  });

  it('should add an application and return it with a new ID', async () => {
    const appData = { position: 'Software Engineer', company: 'Tech Corp', status: 'Applied', applicationDate: '2024-01-01' } as Omit<JobApplication, 'id'>;
    const promise = addApplication(appData);
    vi.runAllTimers();
    const newApplication = await promise;
    expect(newApplication).toHaveProperty('id');
    expect(newApplication.position).toBe('Software Engineer');
  });

  it('should get all applications after adding them', async () => {
    const appData1 = { position: 'Software Engineer', company: 'Tech Corp', status: 'Applied', applicationDate: '2024-01-01' } as Omit<JobApplication, 'id'>;
    const appData2 = { position: 'Data Analyst', company: 'Data Inc.', status: 'Interviewing', applicationDate: '2024-01-02' } as Omit<JobApplication, 'id'>;
    
    const addPromise1 = addApplication(appData1);
    vi.runAllTimers();
    await addPromise1;

    const addPromise2 = addApplication(appData2);
    vi.runAllTimers();
    await addPromise2;

    const getPromise = getApplications();
    vi.runAllTimers();
    const applications = await getPromise;
    expect(applications).toHaveLength(2);
    expect(applications[0].position).toBe('Software Engineer');
    expect(applications[1].position).toBe('Data Analyst');
  });

  it('should update an existing application', async () => {
    const appData = { position: 'Frontend Developer', company: 'Creative LLC', status: 'Applied', applicationDate: '2024-02-01' } as Omit<JobApplication, 'id'>;
    const addPromise = addApplication(appData);
    vi.runAllTimers();
    const newApplication = await addPromise;

    const updatedData = { ...newApplication, status: 'Offer' };
    const updatePromise = updateApplication(updatedData);
    vi.runAllTimers();
    const updatedApplication = await updatePromise;

    expect(updatedApplication.status).toBe('Offer');

    const getPromise = getApplications();
    vi.runAllTimers();
    const applications = await getPromise;
    expect(applications[0].status).toBe('Offer');
  });

  it('should reject when trying to update a non-existent application', async () => {
    const nonExistentApp = { id: 'non-existent-id', position: 'Ghost Developer', company: 'Nowhere Inc', status: 'Vanished' } as JobApplication;
    const updatePromise = updateApplication(nonExistentApp);
    vi.runAllTimers();
    await expect(updatePromise).rejects.toThrow('Application not found');
  });

  it('should delete an application by its ID', async () => {
    const appData = { position: 'Backend Developer', company: 'Server Solutions', status: 'Applied', applicationDate: '2024-03-01' } as Omit<JobApplication, 'id'>;
    const addPromise = addApplication(appData);
    vi.runAllTimers();
    const newApplication = await addPromise;

    const deletePromise = deleteApplication(newApplication.id);
    vi.runAllTimers();
    const result = await deletePromise;
    expect(result).toEqual({ id: newApplication.id });

    const getPromise = getApplications();
    vi.runAllTimers();
    const applications = await getPromise;
    expect(applications).toHaveLength(0);
  });

  it('should reject when trying to delete a non-existent application', async () => {
    const deletePromise = deleteApplication('non-existent-id');
    vi.runAllTimers();
    await expect(deletePromise).rejects.toThrow('Application not found');
  });
});
