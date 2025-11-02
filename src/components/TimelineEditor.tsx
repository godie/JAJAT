// src/components/TimelineEditor.tsx
import React, { useState } from 'react';
import type { InterviewEvent, InterviewStageType, EventStatus } from '../utils/localStorage';
import { generateId } from '../utils/localStorage';

interface TimelineEditorProps {
  events: InterviewEvent[];
  onChange: (events: InterviewEvent[]) => void;
}

const TimelineEditor: React.FC<TimelineEditorProps> = ({ events, onChange }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const stageOptions: { value: InterviewStageType; label: string }[] = [
    { value: 'application_submitted', label: 'Application Submitted' },
    { value: 'screener_call', label: 'Screener Call' },
    { value: 'first_contact', label: 'First Contact' },
    { value: 'technical_interview', label: 'Technical Interview' },
    { value: 'code_challenge', label: 'Code Challenge' },
    { value: 'live_coding', label: 'Live Coding' },
    { value: 'hiring_manager', label: 'Hiring Manager' },
    { value: 'system_design', label: 'System Design' },
    { value: 'cultural_fit', label: 'Cultural Fit' },
    { value: 'final_round', label: 'Final Round' },
    { value: 'offer', label: 'Offer' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'withdrawn', label: 'Withdrawn' },
    { value: 'custom', label: 'Custom' },
  ];

  const statusOptions: { value: EventStatus; label: string }[] = [
    { value: 'pending', label: 'Pending' },
    { value: 'scheduled', label: 'Scheduled' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  const handleAddEvent = (type: InterviewStageType, date: string, status: EventStatus, notes: string, interviewerName: string) => {
    const newEvent: InterviewEvent = {
      id: generateId(),
      type,
      date,
      status,
      notes: notes || undefined,
      interviewerName: interviewerName || undefined,
    };
    onChange([...events, newEvent]);
    setIsAdding(false);
  };

  const handleUpdateEvent = (id: string, type: InterviewStageType, date: string, status: EventStatus, notes: string, interviewerName: string) => {
    const updated = events.map(event =>
      event.id === id ? { ...event, type, date, status, notes: notes || undefined, interviewerName: interviewerName || undefined } : event
    );
    onChange(updated);
    setEditingId(null);
  };

  const handleDeleteEvent = (id: string) => {
    if (confirm('Are you sure you want to delete this timeline event?')) {
      onChange(events.filter(event => event.id !== id));
    }
  };

  const sortedEvents = [...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Interview Timeline</h3>
        {!isAdding && (
          <button
            type="button"
            onClick={() => setIsAdding(true)}
            className="text-sm px-3 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
          >
            + Add Event
          </button>
        )}
      </div>

      {/* Timeline List */}
      <div className="space-y-2">
        {sortedEvents.map((event) => (
          <div key={event.id} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            {editingId === event.id ? (
              <EventForm
                event={event}
                stageOptions={stageOptions}
                statusOptions={statusOptions}
                onSave={(type, date, status, notes, interviewerName) => handleUpdateEvent(event.id, type, date, status, notes, interviewerName)}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-900">
                      {stageOptions.find(opt => opt.value === event.type)?.label || event.type}
                    </span>
                    <span className="text-sm text-gray-600">{event.date}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                      event.status === 'completed' ? 'bg-green-100 text-green-800' :
                      event.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                      event.status === 'cancelled' ? 'bg-gray-100 text-gray-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {event.status}
                    </span>
                  </div>
                  {event.interviewerName && (
                    <p className="text-sm text-indigo-600 mt-1 font-medium">
                      👤 {event.interviewerName}
                    </p>
                  )}
                  {event.notes && (
                    <p className="text-sm text-gray-600 mt-1 italic">"{event.notes}"</p>
                  )}
                </div>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setEditingId(event.id)}
                    className="text-indigo-600 hover:text-indigo-800 text-sm"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteEvent(event.id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Add Event Form */}
        {isAdding && (
          <EventForm
            stageOptions={stageOptions}
            statusOptions={statusOptions}
            onSave={(type, date, status, notes, interviewerName) => handleAddEvent(type, date, status, notes, interviewerName)}
            onCancel={() => setIsAdding(false)}
          />
        )}

        {events.length === 0 && !isAdding && (
          <p className="text-sm text-gray-500 text-center py-4">
            No timeline events yet. Click "+ Add Event" to get started.
          </p>
        )}
      </div>
    </div>
  );
};

interface EventFormProps {
  event?: InterviewEvent;
  stageOptions: { value: InterviewStageType; label: string }[];
  statusOptions: { value: EventStatus; label: string }[];
  onSave: (type: InterviewStageType, date: string, status: EventStatus, notes: string, interviewerName: string) => void;
  onCancel: () => void;
}

const EventForm: React.FC<EventFormProps> = ({ event, stageOptions, statusOptions, onSave, onCancel }) => {
  const [type, setType] = useState<InterviewStageType>(event?.type || 'application_submitted');
  const [date, setDate] = useState(event?.date || '');
  const [status, setStatus] = useState<EventStatus>(event?.status || 'scheduled');
  const [notes, setNotes] = useState(event?.notes || '');
  const [customType, setCustomType] = useState(event?.customTypeName || '');
  const [interviewerName, setInterviewerName] = useState(event?.interviewerName || '');

  const handleSubmit = (e: React.FormEvent) => {
    console.log('handleSubmit', type, date, status, notes, interviewerName);  
    e.preventDefault();
    e.stopPropagation(); // Prevent event from bubbling to parent form
    onSave(type, date, status, notes, interviewerName);
  };

  const handleSave = () => {
    console.log('handleSave', type, date, status, notes, interviewerName);  
    onSave(type, date, status, notes, interviewerName);
  };

  return (
    <div className="space-y-3" role="group" aria-label="Timeline event form">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label htmlFor="stage-type" className="block text-xs font-medium text-gray-700 mb-1">Stage Type</label>
          <select
            id="stage-type"
            value={type}
            onChange={(e) => setType(e.target.value as InterviewStageType)}
            className="w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
          >
            {stageOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="event-date" className="block text-xs font-medium text-gray-700 mb-1">Date</label>
          <input
            id="event-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
          />
        </div>

        <div>
          <label htmlFor="event-status" className="block text-xs font-medium text-gray-700 mb-1">Status</label>
          <select
            id="event-status"
            value={status}
            onChange={(e) => setStatus(e.target.value as EventStatus)}
            className="w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
          >
            {statusOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {type === 'custom' && (
        <div>
          <label htmlFor="custom-type-name" className="block text-xs font-medium text-gray-700 mb-1">Custom Type Name</label>
          <input
            id="custom-type-name"
            type="text"
            value={customType}
            onChange={(e) => setCustomType(e.target.value)}
            placeholder="Enter custom event name"
            className="w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
          />
        </div>
      )}

      <div>
        <label htmlFor="event-notes" className="block text-xs font-medium text-gray-700 mb-1">Notes (optional)</label>
        <textarea
          id="event-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className="w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
        />
      </div>

      <div>
        <label htmlFor="interviewer-name" className="block text-xs font-medium text-gray-700 mb-1">Interviewer Name (optional)</label>
        <input
          id="interviewer-name"
          type="text"
          value={interviewerName}
          onChange={(e) => setInterviewerName(e.target.value)}
          placeholder="John Doe"
          className="w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
        />
      </div>

      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="px-3 py-1 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
        >
          Save
        </button>
      </div>
    </div>
  );
};

export default TimelineEditor;

