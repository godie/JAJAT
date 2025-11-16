// src/components/GoogleSheetsSync.tsx

import React, { useState, useEffect } from 'react';
import { useAlert } from './AlertProvider';
import { checkLoginStatus } from '../utils/localStorage';
import {
  createSpreadsheet,
  syncToGoogleSheets,
  getSyncStatus,
  getStoredSpreadsheetId,
  formatLastSyncTime,
  type SyncStatus,
} from '../utils/googleSheets';
import type { JobApplication } from '../utils/localStorage';

interface GoogleSheetsSyncProps {
  applications: JobApplication[];
  onSyncComplete?: () => void;
}

const GoogleSheetsSync: React.FC<GoogleSheetsSyncProps> = ({ applications, onSyncComplete }) => {
  const { showSuccess, showError } = useAlert();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(getSyncStatus());
  const [isCreatingSheet, setIsCreatingSheet] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [spreadsheetUrl, setSpreadsheetUrl] = useState<string | null>(null);

  useEffect(() => {
    const updateStatus = () => {
      setIsLoggedIn(checkLoginStatus());
      setSyncStatus(getSyncStatus());
      
      // Load spreadsheet URL if ID exists
      const spreadsheetId = getStoredSpreadsheetId();
      if (spreadsheetId) {
        setSpreadsheetUrl(`https://docs.google.com/spreadsheets/d/${spreadsheetId}`);
      }
    };

    updateStatus();

    // Listen for storage changes (login/logout)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'isLoggedIn') {
        updateStatus();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also check periodically in case localStorage is updated in same window
    const interval = setInterval(updateStatus, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const handleCreateSheet = async () => {
    if (!isLoggedIn) {
      showError('Please log in with Google first');
      return;
    }

    setIsCreatingSheet(true);
    try {
      const sheetInfo = await createSpreadsheet('Job Application Tracker');
      setSpreadsheetUrl(sheetInfo.spreadsheetUrl);
      showSuccess(`Spreadsheet created! Opening in new tab...`);
      
      // Open spreadsheet in new tab
      window.open(sheetInfo.spreadsheetUrl, '_blank');
      
      // Auto-sync after creation
      setTimeout(() => {
        handleSync();
      }, 1000);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create spreadsheet';
      showError(errorMessage);
      console.error('Error creating spreadsheet:', error);
    } finally {
      setIsCreatingSheet(false);
    }
  };

  const handleSync = async () => {
    if (!isLoggedIn) {
      showError('Please log in with Google first');
      return;
    }

    const spreadsheetId = getStoredSpreadsheetId();
    if (!spreadsheetId) {
      showError('No spreadsheet found. Please create one first.');
      return;
    }

    setIsSyncing(true);
    try {
      const result = await syncToGoogleSheets(applications, spreadsheetId);
      setSyncStatus(getSyncStatus());
      showSuccess(`Successfully synced ${result.rowsSynced} application${result.rowsSynced !== 1 ? 's' : ''} to Google Sheets!`);
      
      if (onSyncComplete) {
        onSyncComplete();
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to sync data';
      showError(errorMessage);
      console.error('Error syncing to Google Sheets:', error);
      setSyncStatus(getSyncStatus());
    } finally {
      setIsSyncing(false);
    }
  };

  const handleOpenSheet = () => {
    if (spreadsheetUrl) {
      window.open(spreadsheetUrl, '_blank');
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
        <p className="text-sm text-yellow-800">
          <strong>Google Sheets Sync:</strong> Please log in with Google to enable spreadsheet synchronization.
        </p>
      </div>
    );
  }

  const hasSpreadsheet = !!getStoredSpreadsheetId();
  const isLoading = isCreatingSheet || isSyncing;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Google Sheets Integration</h3>
          
          {hasSpreadsheet ? (
            <div className="space-y-1">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Status:</span>{' '}
                {syncStatus.lastSyncError ? (
                  <span className="text-red-600">Error: {syncStatus.lastSyncError}</span>
                ) : syncStatus.lastSyncTime ? (
                  <span className="text-green-600">Synced {formatLastSyncTime(syncStatus.lastSyncTime)}</span>
                ) : (
                  <span className="text-gray-500">Not synced yet</span>
                )}
              </p>
              {spreadsheetUrl && (
                <button
                  onClick={handleOpenSheet}
                  className="text-sm text-blue-600 hover:text-blue-800 underline"
                  type="button"
                >
                  Open Spreadsheet →
                </button>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-600">
              Create a Google Sheet to sync your job applications.
            </p>
          )}
        </div>

        <div className="flex gap-2">
          {!hasSpreadsheet ? (
            <button
              onClick={handleCreateSheet}
              disabled={isLoading}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                isLoading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
              type="button"
            >
              {isCreatingSheet ? 'Creating...' : 'Create Sheet'}
            </button>
          ) : (
            <button
              onClick={handleSync}
              disabled={isLoading}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                isLoading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
              type="button"
            >
              {isSyncing ? 'Syncing...' : 'Sync Now'}
            </button>
          )}
        </div>
      </div>

      {syncStatus.lastSyncError && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-800">
          <strong>Sync Error:</strong> {syncStatus.lastSyncError}
        </div>
      )}
    </div>
  );
};

export default GoogleSheetsSync;

