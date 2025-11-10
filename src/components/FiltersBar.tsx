import React from 'react';

export interface Filters {
  search: string;
  status: string;
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

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 space-y-3 md:space-y-0 md:flex md:flex-wrap md:items-end md:gap-4">
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

      <div className="min-w-[160px]">
        <label htmlFor="status-filter" className="block text-xs font-semibold text-gray-600 mb-1">Status</label>
        <select
          id="status-filter"
          value={filters.status}
          onChange={handleChange('status')}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white"
        >
          <option value="">All</option>
          {availableStatuses.map((status) => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
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
  );
};

export default FiltersBar;


