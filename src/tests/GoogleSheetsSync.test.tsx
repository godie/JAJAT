// src/tests/GoogleSheetsSync.test.tsx

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { expect, test, describe, beforeEach, vi } from 'vitest';
import GoogleSheetsSync from '../components/GoogleSheetsSync';
import { AlertProvider } from '../components/AlertProvider';
import * as googleSheetsUtils from '../utils/googleSheets';
import type { JobApplication } from '../utils/localStorage';

// Mock localStorage
const localStorageStore: Record<string, string> = {};

// Mock window.open
const mockWindowOpen = vi.fn();
window.open = mockWindowOpen;

// Mock the localStorage utilities
vi.mock('../utils/localStorage', () => ({
  checkLoginStatus: vi.fn(() => localStorageStore['isLoggedIn'] === 'true'),
  setLoginStatus: vi.fn(),
  getApplications: vi.fn(() => []),
  saveApplications: vi.fn(),
}));

// Mock the googleSheets utilities
vi.mock('../utils/googleSheets', () => ({
  createSpreadsheet: vi.fn(),
  syncToGoogleSheets: vi.fn(),
  getSyncStatus: vi.fn(() => ({
    isSyncing: false,
    lastSyncTime: null,
    lastSyncError: null,
    spreadsheetId: null,
  })),
  getStoredSpreadsheetId: vi.fn(() => localStorageStore['googleSheetsSpreadsheetId'] || null),
  formatLastSyncTime: vi.fn((time: string | null) => {
    if (!time) return 'Never';
    return '2 minutes ago';
  }),
}));

// Helper function to render with AlertProvider
const renderWithProviders = (ui: React.ReactElement) => {
  return render(<AlertProvider>{ui}</AlertProvider>);
};

const mockApplications: JobApplication[] = [
  {
    id: '1',
    position: 'Software Engineer',
    company: 'Tech Corp',
    salary: '100k',
    status: 'Applied',
    applicationDate: '2024-01-01',
    interviewDate: '',
    timeline: [],
    notes: '',
    link: 'https://example.com',
    platform: 'LinkedIn',
    contactName: 'John Doe',
    followUpDate: '',
  },
];

describe('GoogleSheetsSync Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.keys(localStorageStore).forEach(key => delete localStorageStore[key]);
    localStorageStore['isLoggedIn'] = 'false';
    mockWindowOpen.mockClear();
  });

  describe('When user is not logged in', () => {
    test('should show login prompt message', () => {
      renderWithProviders(<GoogleSheetsSync applications={mockApplications} />);
      
      expect(screen.getByText(/Please log in with Google to enable spreadsheet synchronization/i)).toBeInTheDocument();
    });

    test('should not show sync controls when not logged in', () => {
      renderWithProviders(<GoogleSheetsSync applications={mockApplications} />);
      
      expect(screen.queryByText('Create Sheet')).not.toBeInTheDocument();
      expect(screen.queryByText('Sync Now')).not.toBeInTheDocument();
    });
  });

  describe('When user is logged in', () => {
    beforeEach(() => {
      localStorageStore['isLoggedIn'] = 'true';
    });

    test('should show create sheet button when no spreadsheet exists', () => {
      renderWithProviders(<GoogleSheetsSync applications={mockApplications} />);
      
      expect(screen.getByText('Create Sheet')).toBeInTheDocument();
      expect(screen.getByText(/Create a Google Sheet to sync your job applications/i)).toBeInTheDocument();
    });

    test('should show sync button when spreadsheet exists', () => {
      localStorageStore['googleSheetsSpreadsheetId'] = 'test-id-123';
      
      renderWithProviders(<GoogleSheetsSync applications={mockApplications} />);
      
      expect(screen.getByText('Sync Now')).toBeInTheDocument();
      expect(screen.queryByText('Create Sheet')).not.toBeInTheDocument();
    });

    test('should show sync status when spreadsheet exists', () => {
      localStorageStore['googleSheetsSpreadsheetId'] = 'test-id-123';
      vi.mocked(googleSheetsUtils.getSyncStatus).mockReturnValue({
        isSyncing: false,
        lastSyncTime: null,
        lastSyncError: null,
        spreadsheetId: 'test-id-123',
      });

      renderWithProviders(<GoogleSheetsSync applications={mockApplications} />);
      
      expect(screen.getByText(/Status:/i)).toBeInTheDocument();
      expect(screen.getByText(/Not synced yet/i)).toBeInTheDocument();
    });

    test('should show last sync time when available', () => {
      localStorageStore['googleSheetsSpreadsheetId'] = 'test-id-123';
      vi.mocked(googleSheetsUtils.getSyncStatus).mockReturnValue({
        isSyncing: false,
        lastSyncTime: '2024-01-01T00:00:00Z',
        lastSyncError: null,
        spreadsheetId: 'test-id-123',
      });

      renderWithProviders(<GoogleSheetsSync applications={mockApplications} />);
      
      expect(screen.getByText(/Synced/i)).toBeInTheDocument();
    });

    test('should show error message when sync error exists', () => {
      localStorageStore['googleSheetsSpreadsheetId'] = 'test-id-123';
      vi.mocked(googleSheetsUtils.getSyncStatus).mockReturnValue({
        isSyncing: false,
        lastSyncTime: null,
        lastSyncError: 'Failed to sync',
        spreadsheetId: 'test-id-123',
      });

      renderWithProviders(<GoogleSheetsSync applications={mockApplications} />);
      
      // Check for sync error section (more specific)
      expect(screen.getByText(/Sync Error:/i)).toBeInTheDocument();
      // Check that error message appears (use getAllByText since it appears in multiple places)
      const errorTexts = screen.getAllByText(/Failed to sync/i);
      expect(errorTexts.length).toBeGreaterThan(0);
    });

    test('should show "Open Spreadsheet" link when spreadsheet exists', () => {
      localStorageStore['googleSheetsSpreadsheetId'] = 'test-id-123';
      
      renderWithProviders(<GoogleSheetsSync applications={mockApplications} />);
      
      const openLink = screen.getByText('Open Spreadsheet →');
      expect(openLink).toBeInTheDocument();
    });
  });

  describe('Create Sheet functionality', () => {
    beforeEach(() => {
      localStorageStore['isLoggedIn'] = 'true';
    });

    test('should call createSpreadsheet when button is clicked', async () => {
      const mockSheetInfo = {
        spreadsheetId: 'new-id-123',
        spreadsheetUrl: 'https://docs.google.com/spreadsheets/d/new-id-123',
        title: 'Job Application Tracker',
      };

      vi.mocked(googleSheetsUtils.createSpreadsheet).mockResolvedValue(mockSheetInfo);
      vi.mocked(googleSheetsUtils.syncToGoogleSheets).mockResolvedValue({ rowsSynced: 1 });

      renderWithProviders(<GoogleSheetsSync applications={mockApplications} />);
      
      const createButton = screen.getByText('Create Sheet');
      fireEvent.click(createButton);

      await waitFor(() => {
        expect(googleSheetsUtils.createSpreadsheet).toHaveBeenCalledWith('Job Application Tracker');
      });
    });

    test('should show error when createSpreadsheet fails', async () => {
      vi.mocked(googleSheetsUtils.createSpreadsheet).mockRejectedValue(new Error('API Error'));

      renderWithProviders(<GoogleSheetsSync applications={mockApplications} />);
      
      const createButton = screen.getByText('Create Sheet');
      fireEvent.click(createButton);

      await waitFor(() => {
        expect(screen.getByText(/API Error/i)).toBeInTheDocument();
      });
    });

    test('should open spreadsheet in new tab after creation', async () => {
      const mockSheetInfo = {
        spreadsheetId: 'new-id-123',
        spreadsheetUrl: 'https://docs.google.com/spreadsheets/d/new-id-123',
        title: 'Job Application Tracker',
      };

      vi.mocked(googleSheetsUtils.createSpreadsheet).mockResolvedValue(mockSheetInfo);
      vi.mocked(googleSheetsUtils.syncToGoogleSheets).mockResolvedValue({ rowsSynced: 1 });

      renderWithProviders(<GoogleSheetsSync applications={mockApplications} />);
      
      const createButton = screen.getByText('Create Sheet');
      fireEvent.click(createButton);

      await waitFor(() => {
        expect(mockWindowOpen).toHaveBeenCalledWith(
          'https://docs.google.com/spreadsheets/d/new-id-123',
          '_blank'
        );
      });
    });

    test('should disable button while creating', async () => {
      let resolveCreate: (value: googleSheetsUtils.SheetInfo) => void;
      const createPromise = new Promise<googleSheetsUtils.SheetInfo>((resolve) => {
        resolveCreate = resolve;
      });

      vi.mocked(googleSheetsUtils.createSpreadsheet).mockReturnValue(createPromise);

      renderWithProviders(<GoogleSheetsSync applications={mockApplications} />);
      
      const createButton = screen.getByText('Create Sheet');
      fireEvent.click(createButton);

      await waitFor(() => {
        expect(createButton).toBeDisabled();
        expect(createButton).toHaveTextContent('Creating...');
      });

      resolveCreate!({
        spreadsheetId: 'new-id',
        spreadsheetUrl: 'https://docs.google.com/spreadsheets/d/new-id',
        title: 'Test',
      });
    });
  });

  describe('Sync functionality', () => {
    beforeEach(() => {
      localStorageStore['isLoggedIn'] = 'true';
      localStorageStore['googleSheetsSpreadsheetId'] = 'test-id-123';
    });

    test('should call syncToGoogleSheets when sync button is clicked', async () => {
      vi.mocked(googleSheetsUtils.syncToGoogleSheets).mockResolvedValue({ rowsSynced: 2 });

      renderWithProviders(<GoogleSheetsSync applications={mockApplications} />);
      
      const syncButton = screen.getByText('Sync Now');
      fireEvent.click(syncButton);

      await waitFor(() => {
        expect(googleSheetsUtils.syncToGoogleSheets).toHaveBeenCalledWith(
          mockApplications,
          'test-id-123'
        );
      });
    });

    test('should show success message after successful sync', async () => {
      vi.mocked(googleSheetsUtils.syncToGoogleSheets).mockResolvedValue({ rowsSynced: 1 });

      renderWithProviders(<GoogleSheetsSync applications={mockApplications} />);
      
      const syncButton = screen.getByText('Sync Now');
      fireEvent.click(syncButton);

      await waitFor(() => {
        expect(screen.getByText(/Successfully synced 1 application/i)).toBeInTheDocument();
      });
    });

    test('should show error message when sync fails', async () => {
      vi.mocked(googleSheetsUtils.syncToGoogleSheets).mockRejectedValue(new Error('Sync failed'));

      renderWithProviders(<GoogleSheetsSync applications={mockApplications} />);
      
      const syncButton = screen.getByText('Sync Now');
      fireEvent.click(syncButton);

      await waitFor(() => {
        expect(screen.getByText(/Sync failed/i)).toBeInTheDocument();
      });
    });

    test('should call onSyncComplete callback after successful sync', async () => {
      const onSyncComplete = vi.fn();
      vi.mocked(googleSheetsUtils.syncToGoogleSheets).mockResolvedValue({ rowsSynced: 1 });

      renderWithProviders(
        <GoogleSheetsSync 
          applications={mockApplications} 
          onSyncComplete={onSyncComplete}
        />
      );
      
      const syncButton = screen.getByText('Sync Now');
      fireEvent.click(syncButton);

      await waitFor(() => {
        expect(onSyncComplete).toHaveBeenCalled();
      });
    });

    test('should disable button while syncing', async () => {
      let resolveSync: (value: { rowsSynced: number }) => void;
      const syncPromise = new Promise<{ rowsSynced: number }>((resolve) => {
        resolveSync = resolve;
      });

      vi.mocked(googleSheetsUtils.syncToGoogleSheets).mockReturnValue(syncPromise);

      renderWithProviders(<GoogleSheetsSync applications={mockApplications} />);
      
      const syncButton = screen.getByText('Sync Now');
      fireEvent.click(syncButton);

      await waitFor(() => {
        expect(syncButton).toBeDisabled();
        expect(syncButton).toHaveTextContent('Syncing...');
      });

      resolveSync!({ rowsSynced: 1 });
    });

    test('should show error when no spreadsheet ID exists', async () => {
      delete localStorageStore['googleSheetsSpreadsheetId'];
      vi.mocked(googleSheetsUtils.getStoredSpreadsheetId).mockReturnValue(null);

      renderWithProviders(<GoogleSheetsSync applications={mockApplications} />);
      
      // Should show create button instead
      expect(screen.getByText('Create Sheet')).toBeInTheDocument();
    });
  });

  describe('Open Spreadsheet functionality', () => {
    beforeEach(() => {
      localStorageStore['isLoggedIn'] = 'true';
      localStorageStore['googleSheetsSpreadsheetId'] = 'test-id-123';
      // Clear any error state and ensure URL is set
      vi.mocked(googleSheetsUtils.getSyncStatus).mockReturnValue({
        isSyncing: false,
        lastSyncTime: null,
        lastSyncError: null,
        spreadsheetId: 'test-id-123',
      });
      vi.mocked(googleSheetsUtils.getStoredSpreadsheetId).mockReturnValue('test-id-123');
    });

    test('should open spreadsheet URL when link is clicked', async () => {
      renderWithProviders(<GoogleSheetsSync applications={mockApplications} />);
      
      // Wait for component to render and set spreadsheet URL
      await waitFor(() => {
        expect(screen.getByText(/Open Spreadsheet/i)).toBeInTheDocument();
      });
      
      const openLink = screen.getByText(/Open Spreadsheet/i);
      fireEvent.click(openLink);

      expect(mockWindowOpen).toHaveBeenCalledWith(
        'https://docs.google.com/spreadsheets/d/test-id-123',
        '_blank'
      );
    });
  });
});

