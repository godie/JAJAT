import React, { useMemo, useState } from 'react';
import type { JobApplication } from '../utils/localStorage';
import ConfirmDialog from './ConfirmDialog';

interface KanbanViewProps {
  applications: JobApplication[];
  onEdit?: (application: JobApplication) => void;
  onDelete?: (id: string) => void;
}

const DEFAULT_STATUS_ORDER = [
  'Applied',
  'Interviewing',
  'Offer',
  'Rejected',
  'Withdrawn',
  'Hold',
];

// Map stage types to readable names
const getStageDisplayName = (type: string, customName?: string): string => {
  if (type === 'custom' && customName) {
    return customName;
  }
  
  const stageNames: Record<string, string> = {
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
  };
  
  return stageNames[type] || type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

// Determine the current interview stage for applications in "Interviewing" status
const getInterviewingSubStatus = (app: JobApplication): string | null => {
  if (app.status !== 'Interviewing' || !app.timeline || app.timeline.length === 0) {
    return null;
  }

  // Sort timeline events by date (ascending - earliest first)
  const sortedEvents = [...app.timeline].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // First, look for the next active event (scheduled or pending) - the upcoming step
  const activeEvent = sortedEvents.find(
    (event) => (event.status === 'scheduled' || event.status === 'pending') && 
               new Date(event.date) >= new Date()
  );

  if (activeEvent) {
    return getStageDisplayName(activeEvent.type, activeEvent.customTypeName);
  }

  // If no upcoming active event, use the most recent completed event
  // Sort by date descending to get the most recent
  const completedEvents = sortedEvents
    .filter((event) => event.status === 'completed')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  if (completedEvents.length > 0) {
    return getStageDisplayName(completedEvents[0].type, completedEvents[0].customTypeName);
  }

  return null;
};

const KanbanView: React.FC<KanbanViewProps> = ({ applications, onEdit, onDelete }) => {
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; application: JobApplication | null }>({
    isOpen: false,
    application: null,
  });

  const grouped = useMemo(() => {
    const byStatus = new Map<string, JobApplication[]>();
    const statuses = new Set<string>();

    applications.forEach((app) => {
      let statusKey = app.status || 'Unknown';
      
      // For "Interviewing" status, check if we should create a sub-status based on timeline
      if (app.status === 'Interviewing') {
        const subStatus = getInterviewingSubStatus(app);
        if (subStatus) {
          statusKey = `Interviewing - ${subStatus}`;
        }
      }
      
      statuses.add(statusKey);
      if (!byStatus.has(statusKey)) {
        byStatus.set(statusKey, []);
      }
      byStatus.get(statusKey)!.push(app);
    });

    // Build ordered array of statuses
    // For "Interviewing" sub-statuses, we want to keep them together after the main "Interviewing" status
    const orderedStatuses: string[] = [];
    const interviewingSubStatuses: string[] = [];
    const otherStatuses: string[] = [];

    // First, add default statuses in order (but skip "Interviewing" for now)
    DEFAULT_STATUS_ORDER.forEach((status) => {
      if (status === 'Interviewing') {
        // Collect all "Interviewing - *" sub-statuses
        statuses.forEach((s) => {
          if (s.startsWith('Interviewing - ')) {
            interviewingSubStatuses.push(s);
          }
        });
        // Sort sub-statuses alphabetically
        interviewingSubStatuses.sort();
        // Add main "Interviewing" if it exists (without sub-status)
        if (statuses.has('Interviewing')) {
          orderedStatuses.push('Interviewing');
        }
        // Add all sub-statuses
        orderedStatuses.push(...interviewingSubStatuses);
      } else if (statuses.has(status)) {
        orderedStatuses.push(status);
      }
    });

    // Add any remaining statuses that weren't in DEFAULT_STATUS_ORDER
    statuses.forEach((status) => {
      if (!orderedStatuses.includes(status) && !status.startsWith('Interviewing - ')) {
        otherStatuses.push(status);
      }
    });
    otherStatuses.sort();
    orderedStatuses.push(...otherStatuses);

    return orderedStatuses.map((status) => ({
      status,
      items: byStatus.get(status) ?? [],
    }));
  }, [applications]);

  if (applications.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md border border-dashed border-gray-300 p-8 text-center text-gray-500">
        <p className="font-medium">No applications yet.</p>
        <p className="text-sm mt-2">Start adding entries to see them organized here.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      {grouped.map(({ status, items }) => (
        <section key={status} className="bg-gray-50 border border-gray-200 rounded-xl shadow-sm flex flex-col">
          <header className="px-4 py-3 border-b border-gray-200 bg-white rounded-t-xl">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-600 flex items-center justify-between">
              <span>{status}</span>
              <span className="text-xs font-semibold text-indigo-600 bg-indigo-100 rounded-full px-2 py-0.5">{items.length}</span>
            </h3>
          </header>
          <div className="flex-1 px-4 py-3 space-y-3">
            {items.length === 0 ? (
              <p className="text-sm text-gray-400 italic">No applications in this stage.</p>
            ) : (
              items.map((application) => (
                <article
                  key={application.id}
                  className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition cursor-pointer"
                  onClick={() => onEdit?.(application)}
                >
                  <div className="p-4 space-y-2">
                    <div>
                      <h4 className="text-base font-semibold text-gray-900">{application.position}</h4>
                      <p className="text-sm text-gray-600">{application.company}</p>
                    </div>
                    <div className="flex items-center text-xs text-gray-500 flex-wrap gap-1">
                      {application.platform && (
                        <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">{application.platform}</span>
                      )}
                      {application.applicationDate && (
                        <span className="text-gray-500">Applied {application.applicationDate}</span>
                      )}
                    </div>
                    {application.timeline && application.timeline.length > 0 && (
                      <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-2">
                        <p className="text-xs text-indigo-700 font-semibold">Timeline</p>
                        <ul className="mt-1 space-y-1 text-xs text-indigo-600">
                          {application.timeline.slice(0, 2).map((event) => (
                            <li key={event.id} className="flex items-center gap-1">
                              <span className="w-2 h-2 bg-indigo-400 rounded-full"></span>
                              <span className="font-medium">{event.type.replace(/_/g, ' ')}</span>
                              {event.date && <span className="text-gray-500">· {event.date}</span>}
                            </li>
                          ))}
                          {application.timeline.length > 2 && (
                            <li className="text-xs text-gray-500">+{application.timeline.length - 2} more</li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                  <footer className="px-4 py-2 border-t border-gray-200 bg-gray-50 rounded-b-lg flex justify-end">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteConfirm({ isOpen: true, application });
                      }}
                      className="text-xs font-semibold text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </footer>
                </article>
              ))
            )}
          </div>
        </section>
      ))}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title="Delete Application"
        message={`Are you sure you want to delete the application for "${deleteConfirm.application?.position}" at ${deleteConfirm.application?.company}? This action will mark it as deleted.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="warning"
        onConfirm={() => {
          if (deleteConfirm.application && onDelete) {
            onDelete(deleteConfirm.application.id);
          }
          setDeleteConfirm({ isOpen: false, application: null });
        }}
        onCancel={() => setDeleteConfirm({ isOpen: false, application: null })}
      />
    </div>
  );
};

export default KanbanView;


