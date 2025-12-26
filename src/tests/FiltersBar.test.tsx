import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, expect, test, vi, beforeEach, afterEach } from 'vitest';
import FiltersBar, { type Filters } from '../components/FiltersBar';

const defaultFilters: Filters = {
  search: '',
  status: '',
  statusInclude: [],
  statusExclude: [],
  platform: '',
  dateFrom: '',
  dateTo: '',
};

describe('FiltersBar', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

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
    expect(handleChange).not.toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(300);
    });
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

