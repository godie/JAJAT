// src/components/ApplicationTableRow.tsx
import React from 'react';
import type { JobApplication } from '../utils/localStorage';
import { sanitizeUrl } from '../utils/localStorage';
import DOMPurify from 'dompurify';

interface ApplicationTableRowProps {
    item: JobApplication;
    columns: string[];
    onEdit: (application: JobApplication) => void;
    onDeleteRequest: (application: JobApplication) => void;
    isHovered: boolean;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
}

// Constants for notes column formatting
const NOTES_TRUNCATE_LENGTH = 100; // Maximum characters before truncation
const NOTES_WORD_WRAP_LENGTH = 50; // Minimum characters to trigger word-wrap

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

const createMarkup = (htmlContent: string) => {
    return { __html: DOMPurify.sanitize(htmlContent) };
};

const ApplicationTableRow: React.FC<ApplicationTableRowProps> = ({
    item,
    columns,
    onEdit,
    onDeleteRequest,
    isHovered,
    onMouseEnter,
    onMouseLeave,
}) => {
    return (
        <tr
            className="hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-100 cursor-pointer group"
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            data-testid={`row-${item.id}`}
        >
            {columns.map((column, index) => {
                const normalizedColumn = column.toLowerCase().replace(/ /g, '').replace(/-/g, '');
                const key = columnToKeyMap[normalizedColumn];
                let cellContent = key ? String(item[key] ?? '') : '';
                const isNotes = key === 'notes';

                if (isNotes) {
                    const originalLength = cellContent.length;
                    const hasLineBreaks = /[\r\n]/.test(cellContent);

                    if (originalLength > NOTES_TRUNCATE_LENGTH) {
                        cellContent = cellContent.substring(0, NOTES_TRUNCATE_LENGTH) + '...';
                    }

                    if (hasLineBreaks) {
                        cellContent = cellContent.replace(/\r\n/g, '<br>').replace(/\n/g, '<br>').replace(/\r/g, '<br>');
                    }

                    const shouldWrap = hasLineBreaks || originalLength > NOTES_WORD_WRAP_LENGTH;

                    return (
                        <td
                            key={index}
                            onClick={() => onEdit(item)}
                            className={`px-4 sm:px-6 py-3 text-gray-900 dark:text-gray-100 border-r border-gray-100 dark:border-gray-700 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900 ${
                                shouldWrap ? 'whitespace-normal' : 'whitespace-nowrap'
                            } ${isNotes ? 'max-w-xs' : ''}`}
                        >
                            <span
                                className={`block ${shouldWrap ? 'break-words' : 'truncate'} ${isNotes ? '' : 'max-w-[180px] sm:max-w-none'}`}
                                dangerouslySetInnerHTML={createMarkup(cellContent)}
                            />
                        </td>
                    );
                }

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
                {isHovered && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDeleteRequest(item);
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
    );
};

// ⚡ Bolt: Memoize the row component.
// This is a key performance optimization. By wrapping the row in React.memo,
// we ensure that it only re-renders when its specific props have changed.
// This prevents the entire list from re-rendering when the parent's state
// changes (e.g., during filtering or sorting), which can be a major
// performance bottleneck in large tables.
export default React.memo(ApplicationTableRow);