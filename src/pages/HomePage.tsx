// src/pages/HomePage.tsx
import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import Footer from '../components/Footer';
import ApplicationTable from '../components/ApplicationTable';
import TimelineView from '../components/TimelineView';
import KanbanView from '../components/KanbanView';
import CalendarView from '../components/CalendarView';
import ViewSwitcher, { type ViewType } from '../components/ViewSwitcher';
import FiltersBar, { type Filters } from '../components/FiltersBar';
import { useAlert } from '../components/AlertProvider';
import {
  getApplications,
  saveApplications,
  generateId,
  getPreferences,
  DEFAULT_FIELDS,
  type JobApplication,
  type UserPreferences,
} from '../utils/localStorage';
import AddJobForm from '../components/AddJobComponent';
import GoogleSheetsSync from '../components/GoogleSheetsSync';
import packageJson from '../../package.json';
import { parseLocalDate } from '../utils/date';

const VIEW_STORAGE_KEY = 'preferredView';
const FILTERS_STORAGE_KEY = 'applicationFilters';

const defaultFilters: Filters = {
  search: '',
  status: '',
  statusInclude: [],
  statusExclude: [],
  platform: '',
  dateFrom: '',
  dateTo: '',
};

// Componente Placeholder para la sección de métricas
// Memoized to prevent re-renders when filteredApplications reference changes but content is the same
const MetricsSummary: React.FC<{ applications: JobApplication[] }> = ({ applications }) => {
  const metrics = useMemo(() => {
    // ⚡ Bolt: Optimized metrics calculation.
    // Replaced multiple .filter() calls with a single .reduce() to compute stats
    // in one pass. This avoids creating intermediate arrays and reduces computation
    // time, improving performance for large datasets.
    const stats = applications.reduce(
      (acc, app) => {
        if (app.interviewDate) {
          acc.interviews++;
        }
        if (app.status === 'Offer') {
          acc.offers++;
        }
        return acc;
      },
      { interviews: 0, offers: 0 }
    );

    return [
      { label: 'Applications', value: applications.length, color: 'border-blue-500' },
      { label: 'Interviews', value: stats.interviews, color: 'border-yellow-500' },
      { label: 'Offers', value: stats.offers, color: 'border-green-500' },
    ];
  }, [applications]);

  return (
    <section className="grid grid-cols-3 gap-2 sm:gap-4 my-8" data-testid="metrics-summary">
      {metrics.map((metric) => (
        <div 
          key={metric.label} 
          className={`bg-white dark:bg-gray-800 p-2 sm:p-6 rounded-lg sm:rounded-xl shadow sm:shadow-lg border-l-4 ${metric.color} transition duration-300 hover:shadow-lg sm:hover:shadow-xl`}
        >
          <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">{metric.label}</p>
          <p className="mt-0.5 sm:mt-1 text-xl sm:text-4xl font-extrabold text-gray-900 dark:text-white">{metric.value}</p>
        </div>
      ))}
    </section>
  );
};

MetricsSummary.displayName = 'MetricsSummary';

// Export memoized version
const MemoizedMetricsSummary = memo(MetricsSummary);

import { type PageType } from '../App';

interface HomePageContentProps {
  onNavigate?: (page: PageType) => void;
}

const HomePageContent: React.FC<HomePageContentProps> = () => {
  const { showSuccess } = useAlert();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [currentApplication, setCurrentApplication] = useState<JobApplication | null>(null);
  const [currentView, setCurrentView] = useState<ViewType>('table');
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const isFormOpen = currentApplication !== null;

  useEffect(() => {
    setApplications(getApplications());
    setPreferences(getPreferences());
    
    // Listen for new opportunities from Chrome extension
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'JOB_OPPORTUNITY_SYNC') {
        // New opportunity added from extension
        // Refresh applications count in header will be handled automatically
        showSuccess('New job opportunity captured from LinkedIn!');
      }
    };
    
    window.addEventListener('message', handleMessage);
    
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [showSuccess]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Use default view from preferences, fallback to localStorage for backward compatibility
      const prefs = getPreferences();
      if (prefs.defaultView) {
        setCurrentView(prefs.defaultView);
        // Also update localStorage for backward compatibility
        window.localStorage.setItem(VIEW_STORAGE_KEY, prefs.defaultView);
      } else {
        const storedView = window.localStorage.getItem(VIEW_STORAGE_KEY) as ViewType | null;
        if (storedView) {
          setCurrentView(storedView);
        }
      }
      
      const storedFilters = window.localStorage.getItem(FILTERS_STORAGE_KEY);
      if (storedFilters) {
        try {
          const parsed = JSON.parse(storedFilters) as Filters;
          setFilters({ ...defaultFilters, ...parsed });
        } catch {
          // ignore JSON parse errors
        }
      }
    }
  }, []);
  
  // Update view when preferences change
  useEffect(() => {
    if (preferences?.defaultView) {
      setCurrentView(preferences.defaultView);
      window.localStorage.setItem(VIEW_STORAGE_KEY, preferences.defaultView);
    }
  }, [preferences?.defaultView]);

  const handleViewChange = useCallback((view: ViewType) => {
    setCurrentView(view);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(VIEW_STORAGE_KEY, view);
    }
  }, []);

  const handleFiltersChange = useCallback((nextFilters: Filters) => {
    setFilters(nextFilters);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(FILTERS_STORAGE_KEY, JSON.stringify(nextFilters));
    }
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters(defaultFilters);
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(FILTERS_STORAGE_KEY);
    }
  }, []);

  const handleSaveEntry = useCallback((entryData: Omit<JobApplication, 'id'> | JobApplication) => {
    // By using the functional update form of setState, we avoid including `applications`
    // in the dependency array. This prevents this callback from being recreated on every
    // render, which in turn prevents re-rendering of child components like ApplicationTable.
    setApplications(prevApplications => {
      let newApplications: JobApplication[];
      if ('id' in entryData) {
        newApplications = prevApplications.map(app =>
          app.id === entryData.id ? (entryData as JobApplication) : app
        );
      } else {
        const newEntry: JobApplication = {
          ...entryData,
          id: generateId(),
          timeline: 'timeline' in entryData ? entryData.timeline : [],
        } as JobApplication;
        newApplications = [...prevApplications, newEntry];
      }
      saveApplications(newApplications);
      return newApplications;
    });
    setCurrentApplication(null);
  }, []);

  const handleDeleteEntry = useCallback((id: string) => {
    // ⚡ Bolt: Optimized with functional update to prevent re-renders.
    // By using the functional form of setApplications, we remove the `applications`
    // dependency from useCallback. This stabilizes the function, preventing
    // unnecessary re-renders of memoized child components like ApplicationTable
    // that receive this function as a prop.
    
    // Get the application to delete from current state (prevApplications) instead of
    // reading from localStorage. This is more efficient and prevents duplicate messages.
    // The callback executes synchronously, so appToDelete will be available immediately.
    let appToDelete: JobApplication | undefined;
    
    setApplications(prevApplications => {
      appToDelete = prevApplications.find(app => app.id === id);
      const newApplications = prevApplications.map(app =>
        app.id === id ? { ...app, status: 'Deleted' } : app
      );
      saveApplications(newApplications);
      return newApplications;
    });
    
    // Show success message outside of setApplications callback to prevent duplicate messages
    if (appToDelete) {
      showSuccess(`Application "${appToDelete.position}" at ${appToDelete.company} has been marked as deleted.`);
    }
  }, [showSuccess]);

  const handleEdit = useCallback((appToEdit: JobApplication | null) => {
    setCurrentApplication(appToEdit);
  }, []);

  const handleCreateNew = () => {
    setCurrentApplication({} as JobApplication);
  }
  const handleCancel = () => {
    setCurrentApplication(null);
  }

  //useKeyboardEscape(handleCancel, isFormOpen);

  const availableStatuses = useMemo(() => {
    const set = new Set<string>();
    applications.forEach((app) => {
      if (app.status) {
        set.add(app.status);
      }
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [applications]);

  const availablePlatforms = useMemo(() => {
    const set = new Set<string>();
    applications.forEach((app) => {
      if (app.platform) {
        set.add(app.platform);
      }
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [applications]);

  const filteredApplications = useMemo(() => {
    const normalizedSearch = filters.search.trim().toLowerCase();
    const fromDate = filters.dateFrom ? parseLocalDate(filters.dateFrom) : null;
    const toDate = filters.dateTo ? parseLocalDate(filters.dateTo) : null;

    return applications.filter(app => {
      // Exclude deleted applications by default
      if (app.status === 'Deleted') {
        return false;
      }

      const position = app.position?.toLowerCase() || '';
      const company = app.company?.toLowerCase() || '';
      const contact = app.contactName?.toLowerCase() || '';
      const notes = app.notes?.toLowerCase() || '';
      const timelineNotes = app.timeline?.map(event => `${event.notes ?? ''} ${event.customTypeName ?? ''} ${event.interviewerName ?? ''}`.toLowerCase()).join(' ') || '';

      const matchesSearch = normalizedSearch
        ? [position, company, contact, notes, timelineNotes].some(value => value.includes(normalizedSearch))
        : true;

      // Advanced status filtering with include/exclude
      let matchesStatus = true;
      const statusInclude = filters.statusInclude || [];
      const statusExclude = filters.statusExclude || [];
      
      // If using legacy single status filter
      if (filters.status && statusInclude.length === 0 && statusExclude.length === 0) {
        matchesStatus = app.status === filters.status;
      } else {
        // New advanced filtering
        // If there are included statuses, app must be in that list
        if (statusInclude.length > 0) {
          matchesStatus = statusInclude.includes(app.status);
        }
        // Excluded statuses always take precedence
        if (statusExclude.length > 0 && statusExclude.includes(app.status)) {
          matchesStatus = false;
        }
      }

      const matchesPlatform = filters.platform ? app.platform === filters.platform : true;

      let matchesDateFrom = true;
      let matchesDateTo = true;

      if (fromDate) {
        if (!app.applicationDate) {
          matchesDateFrom = false;
        } else {
          matchesDateFrom = parseLocalDate(app.applicationDate) >= fromDate;
        }
      }

      if (toDate) {
        if (!app.applicationDate) {
          matchesDateTo = false;
        } else {
          const appDate = parseLocalDate(app.applicationDate);
          matchesDateTo = appDate <= toDate;
        }
      }

      return matchesSearch && matchesStatus && matchesPlatform && matchesDateFrom && matchesDateTo;
    });
  }, [applications, filters]);

  const tableColumns = useMemo(() => {
    if (!preferences) {
      return DEFAULT_FIELDS.map((field) => field.label);
    }

    const enabledSet = new Set(preferences.enabledFields);

    // Map from id to label using DEFAULT_FIELDS first, then custom fields
    const fieldById = new Map<string, string>();
    DEFAULT_FIELDS.forEach((field) => {
      fieldById.set(field.id, field.label);
    });
    preferences.customFields.forEach((field) => {
      fieldById.set(field.id, field.label);
    });

    return preferences.columnOrder
      .filter((id) => enabledSet.has(id))
      .map((id) => fieldById.get(id))
      .filter((label): label is string => Boolean(label));
  }, [preferences]);

  const renderCurrentView = () => {
    switch (currentView) {
      case 'timeline':
        return (
          <TimelineView
            applications={filteredApplications}
            onEdit={handleEdit}
            onDelete={handleDeleteEntry}
          />
        );
      case 'kanban':
        return (
          <KanbanView
            applications={filteredApplications}
            onEdit={handleEdit}
            onDelete={handleDeleteEntry}
          />
        );
      case 'calendar':
        return (
          <CalendarView
            applications={filteredApplications}
            onEdit={handleEdit}
          />
        );
      case 'table':
      default:
        return (
          <ApplicationTable
            columns={tableColumns} 
            data={filteredApplications}
            onEdit={handleEdit}
            onDelete={handleDeleteEntry} />
        );
    }
  };

  const nonDeletedApplications = useMemo(() => {
    // ⚡ Bolt: Memoize the list of non-deleted applications.
    // This prevents the GoogleSheetsSync component from re-rendering every time
    // the filters change, as it was receiving a new array instance on every render.
    // Now, it only re-renders when the core `applications` data changes.
    return applications.filter(app => app.status !== 'Deleted');
  }, [applications]);

  return (
    <div className="max-w-7xl mx-auto">
          
          {/* Summary Section */}
          <MemoizedMetricsSummary applications={filteredApplications} />

          {/* Google Sheets Sync */}
          <GoogleSheetsSync 
            applications={nonDeletedApplications}
            onSyncComplete={() => {
              // Refresh applications after sync if needed
              setApplications(getApplications());
            }}
          />

          <div className="space-y-4">
            <FiltersBar
              filters={filters}
              onFiltersChange={handleFiltersChange}
              availableStatuses={availableStatuses}
              availablePlatforms={availablePlatforms}
              onClear={handleClearFilters}
            />
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                Showing <span className="font-semibold text-gray-700 dark:text-gray-300">{filteredApplications.length}</span> of {applications.length} applications
              </p>
            </div>
          </div>
          
          {/* View Switcher, Header and Add Button */}
          <div className="flex flex-col gap-4 mb-6 mt-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between lg:flex-1">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Application Pipeline</h2>
              <ViewSwitcher currentView={currentView} onViewChange={handleViewChange} />
            </div>
            <button 
              className="self-start sm:self-auto bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 px-6 rounded-full shadow-lg transition duration-150 transform hover:scale-[1.02]"
              onClick={handleCreateNew}
              aria-label="Add new application entry"
              data-testid="add-entry-button"
            >
              + Add Entry
            </button>
          </div>
          
          {/* Current View */}
          {renderCurrentView()}
        <Footer version={packageJson.version} />
        {isFormOpen && (
          <AddJobForm 
            initialData={currentApplication} // Pasar datos para prellenar
            onSave={handleSaveEntry}
            onCancel={handleCancel}
          />
        )}
      </div>
  );
};

interface HomePageProps {
  onNavigate?: (page: PageType) => void;
}

const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  return <HomePageContent onNavigate={onNavigate} />;
};

export default HomePage;