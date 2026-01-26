// src/components/ApplicationTable.tsx
import React, { useState, memo, useCallback } from 'react';
import type { JobApplication } from '../utils/localStorage';
import ConfirmDialog from './ConfirmDialog';
import ApplicationTableRow from './ApplicationTableRow';
import ApplicationCard from './ApplicationCard';

interface ApplicationTableProps {
    columns: string[];
    data: JobApplication[];
    onEdit: (application: JobApplication) => void;
    onDelete: (id: string) => void;
}

// Get primary columns for mobile view (Position, Company, Status)
const getPrimaryColumns = (columns: string[]): string[] => {
  const primary = ['Position', 'Company', 'Status'];
  return columns.filter(col => primary.includes(col)).slice(0, 3);
};

const ApplicationTable: React.FC<ApplicationTableProps> = ({ columns, data, onEdit, onDelete }) => {
  const [hoveredRowId, setHoveredRowId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; application: JobApplication | null }>({
    isOpen: false,
    application: null,
  });

  const handleDeleteRequest = useCallback((application: JobApplication) => {
    setDeleteConfirm({ isOpen: true, application });
  }, []);

  const primaryColumns = getPrimaryColumns(columns);
  const otherColumns = columns.filter(col => !primaryColumns.includes(col));

  return (
    <>
      {/* Mobile Card View */}
      <div className="md:hidden space-y-3" data-testid="application-cards">
        {data.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl border border-gray-100 dark:border-gray-700 text-center text-gray-400 dark:text-gray-500 italic text-sm">
            Use the "+ Add Entry" button to start tracking your applications!
          </div>
        ) : (
          data.map((item) => (
            <ApplicationCard
              key={item.id}
              item={item}
              primaryColumns={primaryColumns}
              otherColumns={otherColumns}
              onEdit={onEdit}
              onDeleteRequest={handleDeleteRequest}
            />
          ))
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto shadow-xl rounded-lg border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-xs sm:text-sm" data-testid="application-table">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              {columns.map((column) => (
                <th
                  key={column}
                  scope="col"
                  className="px-4 sm:px-6 py-3 text-left text-[11px] sm:text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider bg-indigo-50 dark:bg-indigo-900 whitespace-nowrap"
                >
                  {column}
                </th>
              ))}
              <th scope="col" className="relative px-4 sm:px-6 py-3 w-1">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} className="px-4 sm:px-6 py-10 text-center text-gray-400 dark:text-gray-500 italic text-sm">
                  Use the "+ Add Entry" button to start tracking your applications!
                </td>
              </tr>
            ) : (
              data.map((item) => (
                <ApplicationTableRow
                  key={item.id}
                  item={item}
                  columns={columns}
                  onEdit={onEdit}
                  onDeleteRequest={handleDeleteRequest}
                  isHovered={hoveredRowId === item.id}
                  onMouseEnter={() => setHoveredRowId(item.id)}
                  onMouseLeave={() => setHoveredRowId(null)}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title="Delete Application"
        message={`Are you sure you want to delete the application for "${deleteConfirm.application?.position}" at ${deleteConfirm.application?.company}? This action will mark it as deleted.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="warning"
        onConfirm={() => {
          if (deleteConfirm.application) {
            onDelete(deleteConfirm.application.id);
          }
          setDeleteConfirm({ isOpen: false, application: null });
        }}
        onCancel={() => setDeleteConfirm({ isOpen: false, application: null })}
      />
    </>
  );
};

export default memo(ApplicationTable);
