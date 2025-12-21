// src/pages/HomePage.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
const MetricsSummary: React.FC<{ applications: JobApplication[] }> = ({ applications }) => {
  const totalApplications = applications.length;
  const interviews = applications.filter(a => a.interviewDate);
  const offers = applications.filter(a => a.status === 'Offer');

  const metrics = [
        { label: 'Applications', value: totalApplications, color: 'border-blue-500' },
        { label: 'Interviews', value: interviews.length, color: 'border-yellow-500' },
        { label: 'Offers', value: offers.length, color: 'border-green-500' },
    ];

  return (
    <section className="grid grid-cols-1 gap-4 my-8 sm:grid-cols-2 lg:grid-cols-3" data-testid="metrics-summary">
      {metrics.map((metric) => (
        <div 
          key={metric.label} 
          className={`bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border-l-4 ${metric.color} transition duration-300 hover:shadow-xl`}
        >
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{metric.label}</p>
          <p className="mt-1 text-4xl font-extrabold text-gray-900 dark:text-white">{metric.value}</p>
        </div>
      ))}
    </section>
  );
};

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
    let newApplications:JobApplication[];

    if ('id' in entryData) {
      newApplications = applications.map(app => 
            app.id === entryData.id ? (entryData as JobApplication) : app
        );
    }
    else {
       const newEntry: JobApplication = {
      ...entryData,
      id: generateId(), // Generar ID único
      // Initialize timeline if not present
      timeline: 'timeline' in entryData ? entryData.timeline : [],
    } as JobApplication;
    newApplications = [...applications, newEntry];
    }
   

    setApplications(newApplications);
    saveApplications(newApplications);
    setCurrentApplication(null);
  }, [applications]);

  const handleDeleteEntry = useCallback((id: string) => {
    const appToDelete = applications.find(app => app.id === id);
    const newApplications = applications.map(app => 
      app.id === id ? { ...app, status: 'Deleted' } : app
    );
    setApplications(newApplications);
    saveApplications(newApplications);
    if (appToDelete) {
      showSuccess(`Application "${appToDelete.position}" at ${appToDelete.company} has been marked as deleted.`);
    }
  }, [applications, showSuccess]);

  const handleEdit = (appToEdit: JobApplication | null) => {
    setCurrentApplication(appToEdit);
  }

  const handleCreateNew = () => {
    setCurrentApplication({} as JobApplication); // Usar un objeto vacío (no nulo) para CREAR
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

  return (
    <div className="max-w-7xl mx-auto">
          
          {/* Summary Section */}
          <MetricsSummary applications={filteredApplications} />

          {/* Google Sheets Sync */}
          <GoogleSheetsSync 
            applications={applications.filter(app => app.status !== 'Deleted')}
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