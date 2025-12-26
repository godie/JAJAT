// src/components/ApplicationTable.tsx
import React, { useState } from 'react';
import type { JobApplication } from '../utils/localStorage';
import { sanitizeUrl } from '../utils/localStorage';
import ConfirmDialog from './ConfirmDialog';
import DOMPurify from 'dompurify';

interface ApplicationTableProps {
    columns: string[];
    data: JobApplication[];
    onEdit: (application: JobApplication) => void;
    onDelete: (id: string) => void;
}

// Map column names to JobApplication properties
const columnToKeyMap: Record<string, keyof JobApplication> = {
  'position': 'position',
  'company': 'company',
  'salary': 'salary',
  'status': 'status',
  'applicationdate': 'applicationDate',
  'interviewdate': 'interviewDate',
  'platform': 'platform',
  'contactname': 'contactName',
  'followupdate': 'followUpDate',
  'notes': 'notes',
  'link': 'link',
};

const ApplicationTable: React.FC<ApplicationTableProps> = ({ columns, data, onEdit, onDelete }) => {
  const [hoveredRowId, setHoveredRowId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; application: JobApplication | null }>({
    isOpen: false,
    application: null,
  });

  // Since data is sanitized on load from localStorage, we can trust it.
  // However, for defense-in-depth, we'll sanitize it again before rendering.
  const createMarkup = (htmlContent: string) => {
    return { __html: DOMPurify.sanitize(htmlContent) };
  };

  const getCellValue = (item: JobApplication, column: string): string => {
    const normalizedColumn = column.toLowerCase().replace(/ /g, '').replace(/-/g, '');
    const key = columnToKeyMap[normalizedColumn];
    return key ? String(item[key] ?? '') : '';
  };

  // Get primary columns for mobile view (Position, Company, Status)
  const getPrimaryColumns = (): string[] => {
    const primary = ['Position', 'Company', 'Status'];
    return columns.filter(col => primary.includes(col)).slice(0, 3);
  };

  const primaryColumns = getPrimaryColumns();
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
            <div
              key={item.id}
              onClick={() => onEdit(item)}
              className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-100 dark:border-gray-700 cursor-pointer hover:shadow-lg transition-shadow"
              data-testid={`card-${item.id}`}
            >
              {/* Primary Info */}
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white truncate">
                    {getCellValue(item, 'Position') || 'No Position'}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 truncate mt-0.5">
                    {getCellValue(item, 'Company') || 'No Company'}
                  </p>
                </div>
                <div className="ml-3 flex-shrink-0">
                  <span className="inline-block px-2 py-1 text-xs font-medium rounded bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200">
                    {getCellValue(item, 'Status') || 'N/A'}
                  </span>
                </div>
              </div>

              {/* Other Important Info */}
              <div className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
                {otherColumns.slice(0, 3).map((column) => {
                  const value = getCellValue(item, column);
                  if (!value) return null;
                  const normalizedColumn = column.toLowerCase().replace(/ /g, '').replace(/-/g, '');
                  const isLink = normalizedColumn === 'link';
                  
                  return (
                    <div key={column} className="flex items-center">
                      <span className="font-medium text-gray-500 dark:text-gray-500 w-24 flex-shrink-0">
                        {column}:
                      </span>
                      {isLink ? (
                        <a
                          href={sanitizeUrl(value)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 truncate text-indigo-600 dark:text-indigo-400 hover:underline"
                          onClick={(e) => e.stopPropagation()}
                          dangerouslySetInnerHTML={createMarkup(value)}
                        />
                      ) : (
                        <span 
                          className="flex-1 truncate"
                          dangerouslySetInnerHTML={createMarkup(value)}
                        />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Actions */}
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteConfirm({ isOpen: true, application: item });
                  }}
                  className="text-xs font-semibold text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 px-3 py-1 rounded transition"
                  aria-label={`Delete application for ${item.position}`}
                  data-testid={`delete-btn-${item.id}`}
                >
                  Delete
                </button>
              </div>
            </div>
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
              <tr
                key={item.id}
                className="hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-100 cursor-pointer group"
                onMouseEnter={() => setHoveredRowId(item.id)}
                onMouseLeave={() => setHoveredRowId(null)}
                data-testid={`row-${item.id}`}
              >
                {columns.map((column, index) => {
                  const normalizedColumn = column.toLowerCase().replace(/ /g, '').replace(/-/g, '');
                  const key = columnToKeyMap[normalizedColumn];
                  const cellContent = key ? String(item[key] ?? '') : '';

                  return (
                    <td
                      key={index}
                      onClick={() => onEdit(item)}
                      className="px-4 sm:px-6 py-3 whitespace-nowrap text-gray-900 dark:text-gray-100 border-r border-gray-100 dark:border-gray-700 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900"
                    >
                      {key === 'link' ? (
                        <a
                          href={sanitizeUrl(cellContent)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 dark:text-indigo-400 hover:underline"
                          dangerouslySetInnerHTML={createMarkup(cellContent)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <span
                          className="block truncate max-w-[180px] sm:max-w-none"
                          dangerouslySetInnerHTML={createMarkup(cellContent)}
                        />
                      )}
                    </td>
                  );
                })}

                <td className="px-4 sm:px-6 py-3 whitespace-nowrap text-right text-sm font-medium w-1">
                  {hoveredRowId === item.id && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteConfirm({ isOpen: true, application: item });
                      }}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 bg-red-50 dark:bg-red-900 px-3 py-1 rounded-full transition"
                      aria-label={`Delete application for ${item.position}`}
                      data-testid={`delete-btn-${item.id}`}
                    >
                      <span>Delete</span>
                    </button>
                  )}
                </td>
              </tr>
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

export default ApplicationTable;
