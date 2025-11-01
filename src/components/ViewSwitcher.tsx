// src/components/ViewSwitcher.tsx
import React from 'react';

export type ViewType = 'table' | 'timeline' | 'kanban' | 'calendar';

interface ViewSwitcherProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}

const ViewSwitcher: React.FC<ViewSwitcherProps> = ({ currentView, onViewChange }) => {
  const views = [
    { 
      id: 'table' as ViewType, 
      label: 'Table', 
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      ),
      description: 'Enhanced table with filters'
    },
    { 
      id: 'timeline' as ViewType, 
      label: 'Timeline', 
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      description: 'Chronological interview flow'
    },
    { 
      id: 'kanban' as ViewType, 
      label: 'Kanban', 
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
        </svg>
      ),
      description: 'Board view [Coming Soon]'
    },
    { 
      id: 'calendar' as ViewType, 
      label: 'Calendar', 
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      description: 'Calendar view [Coming Soon]'
    },
  ];

  return (
    <div className="flex items-center space-x-2 bg-white rounded-lg shadow-sm border border-gray-200 p-2">
      {views.map((view) => {
        const isActive = currentView === view.id;
        const isDisabled = view.id === 'kanban' || view.id === 'calendar';
        
        return (
          <button
            key={view.id}
            onClick={() => !isDisabled && onViewChange(view.id)}
            disabled={isDisabled}
            className={`
              flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-150
              ${isActive 
                ? 'bg-indigo-100 text-indigo-700 font-semibold shadow-sm' 
                : isDisabled
                ? 'text-gray-400 cursor-not-allowed opacity-50'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }
            `}
            title={view.description}
          >
            {view.icon}
            <span className="hidden sm:inline">{view.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default ViewSwitcher;

