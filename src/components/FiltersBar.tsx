import React from 'react';

export interface Filters {
  search: string;
  status: string; // Legacy: single status filter (for backward compatibility)
  statusInclude: string[]; // Statuses to include (if empty, include all)
  statusExclude: string[]; // Statuses to exclude
  platform: string;
  dateFrom: string;
  dateTo: string;
}

interface FiltersBarProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  availableStatuses: string[];
  availablePlatforms: string[];
  onClear: () => void;
}

const FiltersBar: React.FC<FiltersBarProps> = ({ filters, onFiltersChange, availableStatuses, availablePlatforms, onClear }) => {
  const handleChange = (key: keyof Filters) => (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    onFiltersChange({ ...filters, [key]: event.target.value });
  };

  const handleStatusIncludeToggle = (status: string) => {
    const currentInclude = filters.statusInclude || [];
    const newInclude = currentInclude.includes(status)
      ? currentInclude.filter(s => s !== status)
      : [...currentInclude, status];
    onFiltersChange({ 
      ...filters, 
      statusInclude: newInclude,
      status: '' // Clear legacy status filter when using new system
    });
  };

  const handleStatusExcludeToggle = (status: string) => {
    const currentExclude = filters.statusExclude || [];
    const newExclude = currentExclude.includes(status)
      ? currentExclude.filter(s => s !== status)
      : [...currentExclude, status];
    onFiltersChange({ 
      ...filters, 
      statusExclude: newExclude,
      status: '' // Clear legacy status filter when using new system
    });
  };

  // Initialize arrays if they don't exist (for backward compatibility)
  const statusInclude = filters.statusInclude || [];
  const statusExclude = filters.statusExclude || [];

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 space-y-3">
      <div className="md:flex md:flex-wrap md:items-end md:gap-4">
        <div className="flex-1 min-w-[180px]">
          <label htmlFor="search" className="block text-xs font-semibold text-gray-600 mb-1">Search</label>
          <input
            id="search"
            type="text"
            value={filters.search}
            onChange={handleChange('search')}
            placeholder="Search by position, company, notes..."
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        {/* Status filters - Advanced mode */}
        <div className="min-w-[200px] relative">
          <label htmlFor="status-filters" className="block text-xs font-semibold text-gray-600 mb-1">Status</label>
          <div id="status-filters" className="flex gap-2">
            <div className="flex-1 relative">
              <details className="group">
                <summary className="cursor-pointer text-xs px-3 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 text-gray-700 hover:text-indigo-600">
                  {statusInclude.length > 0 ? `✓ Include (${statusInclude.length})` : 'Include'}
                </summary>
                <div className="absolute mt-1 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-2 bg-white shadow-lg z-20 w-48">
                  {availableStatuses.map((status) => (
                    <label key={status} className="flex items-center gap-2 py-1.5 px-2 cursor-pointer hover:bg-indigo-50 rounded">
                      <input
                        type="checkbox"
                        checked={statusInclude.includes(status)}
                        onChange={() => handleStatusIncludeToggle(status)}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-xs text-gray-700">{status}</span>
                    </label>
                  ))}
                </div>
              </details>
            </div>
            <div className="flex-1 relative">
              <details className="group">
                <summary className="cursor-pointer text-xs px-3 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 text-gray-700 hover:text-red-600">
                  {statusExclude.length > 0 ? `✗ Exclude (${statusExclude.length})` : 'Exclude'}
                </summary>
                <div className="absolute mt-1 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-2 bg-white shadow-lg z-20 w-48">
                  {availableStatuses.map((status) => (
                    <label key={status} className="flex items-center gap-2 py-1.5 px-2 cursor-pointer hover:bg-red-50 rounded">
                      <input
                        type="checkbox"
                        checked={statusExclude.includes(status)}
                        onChange={() => handleStatusExcludeToggle(status)}
                        className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                      />
                      <span className="text-xs text-gray-700">{status}</span>
                    </label>
                  ))}
                </div>
              </details>
            </div>
          </div>
          {(statusInclude.length > 0 || statusExclude.length > 0) && (
            <button
              type="button"
              onClick={() => onFiltersChange({ ...filters, statusInclude: [], statusExclude: [] })}
              className="mt-1 text-xs text-gray-500 hover:text-gray-700 underline"
            >
              Clear status filters
            </button>
          )}
        </div>

      <div className="min-w-[160px]">
        <label htmlFor="platform-filter" className="block text-xs font-semibold text-gray-600 mb-1">Platform</label>
        <select
          id="platform-filter"
          value={filters.platform}
          onChange={handleChange('platform')}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white"
        >
          <option value="">All</option>
          {availablePlatforms.map((platform) => (
            <option key={platform} value={platform}>{platform}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-end gap-2">
        <div className="min-w-[140px]">
          <label htmlFor="date-from" className="block text-xs font-semibold text-gray-600 mb-1">From</label>
          <input
            id="date-from"
            type="date"
            value={filters.dateFrom}
            onChange={handleChange('dateFrom')}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        <div className="min-w-[140px]">
          <label htmlFor="date-to" className="block text-xs font-semibold text-gray-600 mb-1">To</label>
          <input
            id="date-to"
            type="date"
            value={filters.dateTo}
            onChange={handleChange('dateTo')}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
      </div>

        <div className="flex items-center gap-2 mt-2 md:mt-0">
          <button
            type="button"
            onClick={onClear}
            className="px-3 py-2 text-xs font-semibold text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
};

export default FiltersBar;


