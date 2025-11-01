// src/pages/HomePage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import Header from '../components/Header';
import ApplicationTable from '../components/ApplicationTable';
import TimelineView from '../components/TimelineView';
import ViewSwitcher, { type ViewType } from '../components/ViewSwitcher';
import { AlertProvider } from '../components/AlertProvider';
import { getApplications, saveApplications, generateId, type JobApplication } from '../utils/localStorage';
import AddJobForm from '../components/AddJobComponent';

const initialColumns = [
    'Position', 'Company', 'Salary', 'Status', 'Application Date', 
    'Interview Date', 'Platform', 'Contact Name', 'Follow-up Date', 'Notes', 'Link'
];

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
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 my-8" data-testid="metrics-summary">
      {metrics.map((metric) => (
        <div 
          key={metric.label} 
          className={`bg-white p-6 rounded-xl shadow-lg border-l-4 ${metric.color} transition duration-300 hover:shadow-xl`}
        >
          <p className="text-sm font-medium text-gray-500">{metric.label}</p>
          <p className="mt-1 text-4xl font-extrabold text-gray-900">{metric.value}</p>
        </div>
      ))}
    </section>
  );
};

const HomePage: React.FC = () => {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [currentApplication, setCurrentApplication] = useState<JobApplication | null>(null);
  const [currentView, setCurrentView] = useState<ViewType>('table');
  const isFormOpen = currentApplication !== null;

  useEffect(() => {
    setApplications(getApplications());
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
    const newApplications = applications.filter(app => app.id !== id);
    setApplications(newApplications);
    saveApplications(newApplications);
  }, [applications]);

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

  const renderCurrentView = () => {
    switch (currentView) {
      case 'timeline':
        return (
          <TimelineView
            applications={applications}
            onEdit={handleEdit}
            onDelete={handleDeleteEntry}
          />
        );
      case 'table':
      default:
        return (
          <ApplicationTable
            columns={initialColumns}
            data={applications}
            onEdit={handleEdit}
            onDelete={handleDeleteEntry}
          />
        );
      case 'kanban':
      case 'calendar':
        return (
          <div className="text-center py-20 text-gray-400">
            <p className="text-lg font-medium">Coming Soon!</p>
            <p className="text-sm mt-2">{currentView} view is under development</p>
          </div>
        );
    }
  };

  return (
    <AlertProvider>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          
          {/* Summary Section */}
          <MetricsSummary applications={applications} />
          
          {/* View Switcher, Header and Add Button */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 mt-10">
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <h2 className="text-2xl font-bold text-gray-800">Application Pipeline</h2>
              <ViewSwitcher currentView={currentView} onViewChange={setCurrentView} />
            </div>
            <button 
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 px-6 rounded-full shadow-lg transition duration-150 transform hover:scale-[1.05]"
              onClick={handleCreateNew}
              aria-label="Add new application entry"
              data-testid="add-entry-button"
            >
              + Add Entry
            </button>
          </div>
          
          {/* Current View */}
          {renderCurrentView()}
        </main>
        {isFormOpen && (
          <AddJobForm 
            initialData={currentApplication} // Pasar datos para prellenar
            onSave={handleSaveEntry}
            onCancel={handleCancel}
          />
        )}
      </div>
    </AlertProvider>
  );
};

export default HomePage;