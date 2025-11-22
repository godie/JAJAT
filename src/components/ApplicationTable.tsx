// src/components/ApplicationTable.tsx
import React, { useState } from 'react';
import type { JobApplication } from '../utils/localStorage';
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

  return (
    <div className="overflow-x-auto shadow-xl rounded-lg border border-gray-100 bg-white">
      <table className="min-w-full divide-y divide-gray-200 text-xs sm:text-sm" data-testid="application-table">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column) => (
              <th
                key={column}
                scope="col"
                className="px-4 sm:px-6 py-3 text-left text-[11px] sm:text-xs font-semibold text-gray-600 uppercase tracking-wider bg-indigo-50 whitespace-nowrap"
              >
                {column}
              </th>
            ))}
            <th scope="col" className="relative px-4 sm:px-6 py-3 w-1">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length + 1} className="px-4 sm:px-6 py-10 text-center text-gray-400 italic text-sm">
                Use the "+ Add Entry" button to start tracking your applications!
              </td>
            </tr>
          ) : (
            data.map((item) => (
              <tr
                key={item.id}
                className="hover:bg-gray-50 transition duration-100 cursor-pointer group"
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
                      className="px-4 sm:px-6 py-3 whitespace-nowrap text-gray-900 border-r border-gray-100 group-hover:bg-indigo-50"
                    >
                      {key === 'link' ? (
                        <a
                          href={cellContent}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:underline"
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
                      className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-red-800 bg-red-50 px-3 py-1 rounded-full transition"
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
    </div>
  );
};

export default ApplicationTable;
