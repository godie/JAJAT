import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import FiltersBar, { type Filters } from '../components/FiltersBar';

const defaultFilters: Filters = {
  search: '',
  status: '',
  platform: '',
  dateFrom: '',
  dateTo: '',
};

describe('FiltersBar', () => {
  test('calls onFiltersChange when search input changes', () => {
    const handleChange = vi.fn();
    render(
      <FiltersBar
        filters={defaultFilters}
        onFiltersChange={handleChange}
        availableStatuses={['Applied']}
        availablePlatforms={['LinkedIn']}
        onClear={vi.fn()}
      />
    );

    fireEvent.change(screen.getByLabelText(/Search/i), { target: { value: 'frontend' } });
    expect(handleChange).toHaveBeenCalledWith({ ...defaultFilters, search: 'frontend' });
  });

  test('calls onClear when clear button clicked', () => {
    const handleClear = vi.fn();
    render(
      <FiltersBar
        filters={defaultFilters}
        onFiltersChange={vi.fn()}
        availableStatuses={[]}
        availablePlatforms={[]}
        onClear={handleClear}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /Clear/i }));
    expect(handleClear).toHaveBeenCalledTimes(1);
  });
});

