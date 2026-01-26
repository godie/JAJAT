// src/components/ApplicationCard.tsx
import React from 'react';
import type { JobApplication } from '../utils/localStorage';
import { sanitizeUrl } from '../utils/localStorage';
import DOMPurify from 'dompurify';

interface ApplicationCardProps {
    item: JobApplication;
    primaryColumns: string[];
    otherColumns: string[];
    onEdit: (application: JobApplication) => void;
    onDeleteRequest: (application: JobApplication) => void;
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

const getCellValue = (item: JobApplication, column: string): string => {
    const normalizedColumn = column.toLowerCase().replace(/ /g, '').replace(/-/g, '');
    const key = columnToKeyMap[normalizedColumn];
    return key ? String(item[key] ?? '') : '';
};

const createMarkup = (htmlContent: string) => {
    return { __html: DOMPurify.sanitize(htmlContent) };
};

const ApplicationCard: React.FC<ApplicationCardProps> = ({
    item,
    primaryColumns,
    otherColumns,
    onEdit,
    onDeleteRequest,
}) => {
    return (
        <div
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
                        onDeleteRequest(item);
                    }}
                    className="text-xs font-semibold text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 px-3 py-1 rounded transition"
                    aria-label={`Delete application for ${item.position}`}
                    data-testid={`delete-btn-${item.id}`}
                >
                    Delete
                </button>
            </div>
        </div>
    );
};

// ⚡ Bolt: Memoize the card component.
// Similar to the table row, memoizing the card component prevents it from
// re-rendering unnecessarily when parent state changes. This is crucial for
// maintaining a smooth user experience on mobile devices, especially when
// filtering or sorting a large list of applications.
export default React.memo(ApplicationCard);