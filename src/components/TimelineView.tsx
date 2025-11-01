// src/components/TimelineView.tsx
import React from 'react';
import type { JobApplication, InterviewEvent } from '../utils/localStorage';

interface TimelineViewProps {
  applications: JobApplication[];
  onEdit?: (application: JobApplication) => void;
  onDelete?: (id: string) => void;
}

const TimelineView: React.FC<TimelineViewProps> = ({ applications, onEdit, onDelete }) => {
  const getStageDisplayName = (type: string): string => {
    const names: Record<string, string> = {
      'application_submitted': 'Application Submitted',
      'screener_call': 'Screener Call',
      'first_contact': 'First Contact',
      'technical_interview': 'Technical Interview',
      'code_challenge': 'Code Challenge',
      'live_coding': 'Live Coding',
      'hiring_manager': 'Hiring Manager',
      'system_design': 'System Design',
      'cultural_fit': 'Cultural Fit',
      'final_round': 'Final Round',
      'offer': 'Offer',
      'rejected': 'Rejected',
      'withdrawn': 'Withdrawn',
      'custom': 'Custom',
    };
    return names[type] || type;
  };

  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      'completed': 'bg-green-500',
      'scheduled': 'bg-blue-500',
      'cancelled': 'bg-gray-400',
      'pending': 'bg-yellow-500',
    };
    return colors[status] || 'bg-gray-400';
  };

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateString;
    }
  };

  const sortEvents = (events: InterviewEvent[]): InterviewEvent[] => {
    return [...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const getNextEvent = (events: InterviewEvent[]): InterviewEvent | null => {
    const sorted = sortEvents(events);
    const now = new Date();
    const upcoming = sorted.find((event) => new Date(event.date) >= now && event.status === 'scheduled');
    return upcoming || null;
  };

  if (applications.length === 0) {
    return (
      <div className="text-center py-20 text-gray-400">
        <svg className="mx-auto h-16 w-16 mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-lg font-medium">No applications yet</p>
        <p className="text-sm mt-2">Add your first job application to see the timeline</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {applications.map((app) => {
        const sortedEvents = sortEvents(app.timeline);
        const nextEvent = getNextEvent(app.timeline);
        
        return (
          <div
            key={app.id}
            className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900">{app.position}</h3>
                  <p className="text-gray-600 font-medium">{app.company}</p>
                </div>
                {nextEvent && (
                  <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
                    <span className="inline-block w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                    <span className="text-sm font-medium text-gray-700">
                      Next: {formatDate(nextEvent.date)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Timeline */}
            <div className="px-6 py-6">
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                
                {/* Timeline events */}
                <div className="space-y-6">
                  {sortedEvents.map((event) => (
                    <div key={event.id} className="relative flex items-start">
                      {/* Timeline dot */}
                      <div className="relative z-10">
                        <div className={`w-8 h-8 rounded-full ${getStatusColor(event.status)} border-4 border-white shadow-lg flex items-center justify-center`}>
                          {event.status === 'completed' && (
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                          {event.status === 'scheduled' && (
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                            </svg>
                          )}
                          {event.status === 'cancelled' && (
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          )}
                          {event.status === 'pending' && (
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                      </div>
                      
                      {/* Event content */}
                      <div className="ml-4 flex-1">
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:bg-gray-100 transition-colors">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-semibold text-gray-900">
                                {getStageDisplayName(event.type)}
                              </h4>
                              <p className="text-sm text-gray-600 mt-1">{formatDate(event.date)}</p>
                              {event.notes && (
                                <p className="text-sm text-gray-700 mt-2 italic">"{event.notes}"</p>
                              )}
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                              event.status === 'completed' ? 'bg-green-100 text-green-800' :
                              event.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                              event.status === 'cancelled' ? 'bg-gray-100 text-gray-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {event.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-2">
              {onEdit && (
                <button
                  onClick={() => onEdit(app)}
                  className="px-4 py-2 text-sm font-medium text-indigo-700 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
                >
                  Edit
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => {
                    if (confirm(`Are you sure you want to delete ${app.position} at ${app.company}?`)) {
                      onDelete(app.id);
                    }
                  }}
                  className="px-4 py-2 text-sm font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TimelineView;

