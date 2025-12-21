import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { AlertProvider, useAlert } from '../components/AlertProvider';
import {
  DEFAULT_FIELDS,
  DEFAULT_PREFERENCES,
  getPreferences,
  savePreferences,
  type FieldDefinition,
  type UserPreferences,
  type ViewType,
  type DateFormat,
  type CustomInterviewEvent,
  generateId,
} from '../utils/localStorage';
import packageJson from '../../package.json';

import { type PageType } from '../App';

interface SettingsPageProps {
  onNavigate?: (page: PageType) => void;
}

const SettingsPageContent: React.FC<SettingsPageProps> = ({ onNavigate }) => {
  const { showSuccess } = useAlert();
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [hasChanges, setHasChanges] = useState(false);
  const [activeSection, setActiveSection] = useState<'fields' | 'view' | 'date' | 'custom' | 'interviewing'>('fields');
  const [editingCustomField, setEditingCustomField] = useState<FieldDefinition | null>(null);
  const [customFieldForm, setCustomFieldForm] = useState<Partial<FieldDefinition>>({
    label: '',
    type: 'text',
    required: false,
    options: [],
  });
  const [editingInterviewEvent, setEditingInterviewEvent] = useState<CustomInterviewEvent | null>(null);
  const [interviewEventForm, setInterviewEventForm] = useState<Partial<CustomInterviewEvent>>({
    label: '',
  });

  useEffect(() => {
    const loaded = getPreferences();
    setPreferences(loaded);
  }, []);

  const allFields: FieldDefinition[] = [...DEFAULT_FIELDS, ...(preferences.customFields || [])];

  const handleToggleField = (fieldId: string) => {
    setPreferences((prev) => {
      const isEnabled = prev.enabledFields.includes(fieldId);
      const enabledFields = isEnabled
        ? prev.enabledFields.filter((id) => id !== fieldId)
        : [...prev.enabledFields, fieldId];
      setHasChanges(true);
      return { ...prev, enabledFields };
    });
  };

  const handleMoveField = (fieldId: string, direction: 'up' | 'down') => {
    setPreferences((prev) => {
      const order = [...prev.columnOrder];
      const index = order.indexOf(fieldId);
      if (index === -1) return prev;

      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= order.length) return prev;

      [order[index], order[targetIndex]] = [order[targetIndex], order[index]];
      setHasChanges(true);
      return { ...prev, columnOrder: order };
    });
  };

  const handleDefaultViewChange = (view: ViewType) => {
    setPreferences((prev) => {
      setHasChanges(true);
      return { ...prev, defaultView: view };
    });
  };

  const handleDateFormatChange = (format: DateFormat) => {
    setPreferences((prev) => {
      setHasChanges(true);
      return { ...prev, dateFormat: format };
    });
  };

  const handleAddCustomField = () => {
    if (!customFieldForm.label || !customFieldForm.type) return;
    
    const newField: FieldDefinition = {
      id: `custom-${generateId()}`,
      label: customFieldForm.label,
      type: customFieldForm.type as FieldDefinition['type'],
      required: customFieldForm.required || false,
      options: customFieldForm.type === 'select' ? (customFieldForm.options || []) : undefined,
    };

    setPreferences((prev) => {
      const customFields = [...(prev.customFields || []), newField];
      const enabledFields = [...prev.enabledFields, newField.id];
      const columnOrder = [...prev.columnOrder, newField.id];
      setHasChanges(true);
      return { ...prev, customFields, enabledFields, columnOrder };
    });

    setCustomFieldForm({ label: '', type: 'text', required: false, options: [] });
    setEditingCustomField(null);
  };

  const handleEditCustomField = (field: FieldDefinition) => {
    setEditingCustomField(field);
    setCustomFieldForm({
      label: field.label,
      type: field.type,
      required: field.required,
      options: field.options || [],
    });
  };

  const handleUpdateCustomField = () => {
    if (!editingCustomField || !customFieldForm.label) return;

    setPreferences((prev) => {
      const customFields = (prev.customFields || []).map((field) =>
        field.id === editingCustomField.id
          ? {
              ...field,
              label: customFieldForm.label!,
              type: customFieldForm.type as FieldDefinition['type'],
              required: customFieldForm.required || false,
              options: customFieldForm.type === 'select' ? (customFieldForm.options || []) : undefined,
            }
          : field
      );
      setHasChanges(true);
      return { ...prev, customFields };
    });

    setCustomFieldForm({ label: '', type: 'text', required: false, options: [] });
    setEditingCustomField(null);
  };

  const handleDeleteCustomField = (fieldId: string) => {
    setPreferences((prev) => {
      const customFields = (prev.customFields || []).filter((f) => f.id !== fieldId);
      const enabledFields = prev.enabledFields.filter((id) => id !== fieldId);
      const columnOrder = prev.columnOrder.filter((id) => id !== fieldId);
      setHasChanges(true);
      return { ...prev, customFields, enabledFields, columnOrder };
    });
  };

  const handleAddInterviewEvent = () => {
    if (!interviewEventForm.label) return;
    
    const newEvent: CustomInterviewEvent = {
      id: `interview-event-${generateId()}`,
      label: interviewEventForm.label,
    };

    setPreferences((prev) => {
      const customInterviewEvents = [...(prev.customInterviewEvents || []), newEvent];
      setHasChanges(true);
      return { ...prev, customInterviewEvents };
    });

    setInterviewEventForm({ label: '' });
    setEditingInterviewEvent(null);
  };

  const handleEditInterviewEvent = (event: CustomInterviewEvent) => {
    setEditingInterviewEvent(event);
    setInterviewEventForm({
      label: event.label,
    });
  };

  const handleUpdateInterviewEvent = () => {
    if (!editingInterviewEvent || !interviewEventForm.label) return;

    setPreferences((prev) => {
      const customInterviewEvents = (prev.customInterviewEvents || []).map((event) =>
        event.id === editingInterviewEvent.id
          ? {
              ...event,
              label: interviewEventForm.label!,
            }
          : event
      );
      setHasChanges(true);
      return { ...prev, customInterviewEvents };
    });

    setInterviewEventForm({ label: '' });
    setEditingInterviewEvent(null);
  };

  const handleDeleteInterviewEvent = (eventId: string) => {
    setPreferences((prev) => {
      const customInterviewEvents = (prev.customInterviewEvents || []).filter((e) => e.id !== eventId);
      setHasChanges(true);
      return { ...prev, customInterviewEvents };
    });
  };

  const handleReset = () => {
    setPreferences(DEFAULT_PREFERENCES);
    setHasChanges(true);
    setCustomFieldForm({ label: '', type: 'text', required: false, options: [] });
    setEditingCustomField(null);
    setInterviewEventForm({ label: '' });
    setEditingInterviewEvent(null);
  };

  const handleSave = () => {
    savePreferences(preferences);
    setHasChanges(false);
    showSuccess('Settings saved successfully!');
  };

  // Build ordered list of fields based on columnOrder
  const orderedFields = preferences.columnOrder
    .map((id) => allFields.find((field) => field.id === id))
    .filter((field): field is FieldDefinition => Boolean(field));

  const sections = [
    { id: 'fields' as const, label: 'Table Fields', icon: '📋' },
    { id: 'view' as const, label: 'Default View', icon: '👁️' },
    { id: 'date' as const, label: 'Date Format', icon: '📅' },
    { id: 'custom' as const, label: 'Custom Fields', icon: '➕' },
    { id: 'interviewing' as const, label: 'Interview Events', icon: '🎯' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onNavigate={onNavigate} currentPage="settings" />
      <main className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Settings</h1>
          <p className="text-sm text-gray-500">
            Customize your application tracking experience. All changes are saved locally in your browser.
          </p>
        </div>

        {/* Section Navigation */}
        <div className="mb-6 flex flex-wrap gap-2 bg-white rounded-lg shadow-sm border border-gray-200 p-2">
          {sections.map((section) => (
            <button
              key={section.id}
              type="button"
              onClick={() => setActiveSection(section.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                activeSection === section.id
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span>{section.icon}</span>
              <span>{section.label}</span>
            </button>
          ))}
        </div>

        {/* Save/Reset Controls */}
        <div className="mb-6 flex justify-between items-center bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={!hasChanges}
              className={`px-4 py-2 rounded-full text-sm font-semibold shadow-sm transition ${
                hasChanges
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2 rounded-full text-sm font-semibold border border-gray-300 text-gray-600 hover:bg-gray-50 transition"
            >
              Reset to Default
            </button>
          </div>
          {hasChanges && (
            <span className="text-xs text-amber-600 font-medium">
              You have unsaved changes
            </span>
          )}
        </div>

        {/* Section Content */}
        <div className="bg-white shadow-lg rounded-xl p-6 sm:p-8">
          {/* Table Fields Section */}
          {activeSection === 'fields' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Application Fields Configuration</h2>
              <p className="text-sm text-gray-500 mb-6">
                Choose which columns you want to see in your Applications table and adjust their order.
              </p>

              <div className="mt-4 border border-gray-100 rounded-lg divide-y divide-gray-100">
                {orderedFields.map((field, index) => {
                  const isEnabled = preferences.enabledFields.includes(field.id);
                  const isCustom = !DEFAULT_FIELDS.find((f) => f.id === field.id);
                  return (
                    <div
                      key={field.id}
                      className="flex items-center justify-between px-4 py-3 bg-white hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-3">
                        <input
                          id={`field-${field.id}`}
                          type="checkbox"
                          checked={isEnabled}
                          onChange={() => handleToggleField(field.id)}
                          className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                        />
                        <div>
                          <label
                            htmlFor={`field-${field.id}`}
                            className="text-sm font-medium text-gray-800"
                          >
                            {field.label}
                            {isCustom && (
                              <span className="ml-2 text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                                Custom
                              </span>
                            )}
                          </label>
                          <p className="text-xs text-gray-500">
                            {field.required ? 'Required core field' : 'Optional field'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleMoveField(field.id, 'up')}
                          disabled={index === 0}
                          className={`px-2 py-1 rounded-md text-xs font-medium border ${
                            index === 0
                              ? 'text-gray-300 border-gray-200 cursor-not-allowed'
                              : 'text-gray-600 border-gray-300 hover:bg-gray-100'
                          }`}
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveField(field.id, 'down')}
                          disabled={index === orderedFields.length - 1}
                          className={`px-2 py-1 rounded-md text-xs font-medium border ${
                            index === orderedFields.length - 1
                              ? 'text-gray-300 border-gray-200 cursor-not-allowed'
                              : 'text-gray-600 border-gray-300 hover:bg-gray-100'
                          }`}
                        >
                          ↓
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Default View Section */}
          {activeSection === 'view' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Default View</h2>
              <p className="text-sm text-gray-500 mb-6">
                Choose which view should be displayed when you open the Applications page.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(['table', 'timeline', 'kanban', 'calendar'] as ViewType[]).map((view) => (
                  <button
                    key={view}
                    type="button"
                    onClick={() => handleDefaultViewChange(view)}
                    className={`p-4 rounded-lg border-2 transition ${
                      preferences.defaultView === view
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="text-left">
                      <div className="font-semibold text-gray-800 capitalize mb-1">{view}</div>
                      <div className="text-xs text-gray-500">
                        {view === 'table' && 'Enhanced table with filters'}
                        {view === 'timeline' && 'Chronological interview flow'}
                        {view === 'kanban' && 'Board view grouped by status'}
                        {view === 'calendar' && 'Monthly calendar of interviews'}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Date Format Section */}
          {activeSection === 'date' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Date Format</h2>
              <p className="text-sm text-gray-500 mb-6">
                Choose how dates should be displayed throughout the application.
              </p>

              <div className="space-y-3">
                {(['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'] as DateFormat[]).map((format) => {
                  const exampleDate = new Date('2025-01-15');
                  let example = '';
                  const [day, month, year] = [
                    String(exampleDate.getDate()).padStart(2, '0'),
                    String(exampleDate.getMonth() + 1).padStart(2, '0'),
                    exampleDate.getFullYear(),
                  ];
                  switch (format) {
                    case 'DD/MM/YYYY':
                      example = `${day}/${month}/${year}`;
                      break;
                    case 'MM/DD/YYYY':
                      example = `${month}/${day}/${year}`;
                      break;
                    case 'YYYY-MM-DD':
                      example = `${year}-${month}-${day}`;
                      break;
                  }

                  return (
                    <label
                      key={format}
                      className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition ${
                        preferences.dateFormat === format
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <input
                        type="radio"
                        name="dateFormat"
                        value={format}
                        checked={preferences.dateFormat === format}
                        onChange={() => handleDateFormatChange(format)}
                        className="h-4 w-4 text-indigo-600"
                      />
                      <div className="flex-1">
                        <div className="font-semibold text-gray-800">{format}</div>
                        <div className="text-xs text-gray-500">Example: {example}</div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Custom Fields Section */}
          {activeSection === 'custom' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Custom Fields</h2>
              <p className="text-sm text-gray-500 mb-6">
                Create your own fields to track additional information about your applications.
              </p>

              {/* Add/Edit Custom Field Form */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">
                  {editingCustomField ? 'Edit Custom Field' : 'Add New Custom Field'}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Field Label *
                    </label>
                    <input
                      type="text"
                      value={customFieldForm.label || ''}
                      onChange={(e) => setCustomFieldForm({ ...customFieldForm, label: e.target.value })}
                      placeholder="e.g., Recruiter Phone"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Field Type *
                    </label>
                    <select
                      value={customFieldForm.type || 'text'}
                      onChange={(e) =>
                        setCustomFieldForm({
                          ...customFieldForm,
                          type: e.target.value as FieldDefinition['type'],
                          options: e.target.value === 'select' ? [] : undefined,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="text">Text</option>
                      <option value="date">Date</option>
                      <option value="number">Number</option>
                      <option value="select">Select (Dropdown)</option>
                      <option value="checkbox">Checkbox</option>
                      <option value="url">URL</option>
                    </select>
                  </div>
                  {customFieldForm.type === 'select' && (
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Options (one per line) *
                      </label>
                      <textarea
                        value={(customFieldForm.options || []).join('\n')}
                        onChange={(e) =>
                          setCustomFieldForm({
                            ...customFieldForm,
                            options: e.target.value.split('\n').filter((opt) => opt.trim()),
                          })
                        }
                        placeholder="Remote&#10;Hybrid&#10;On-site"
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Enter one option per line. These will appear as dropdown options.
                      </p>
                    </div>
                  )}
                  <div className="sm:col-span-2 flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="required-field"
                      checked={customFieldForm.required || false}
                      onChange={(e) =>
                        setCustomFieldForm({ ...customFieldForm, required: e.target.checked })
                      }
                      className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                    />
                    <label htmlFor="required-field" className="text-sm text-gray-700">
                      Required field
                    </label>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  {editingCustomField ? (
                    <>
                      <button
                        type="button"
                        onClick={handleUpdateCustomField}
                        disabled={!customFieldForm.label}
                        className={`px-4 py-2 rounded-md text-sm font-medium ${
                          customFieldForm.label
                            ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        Update Field
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingCustomField(null);
                          setCustomFieldForm({ label: '', type: 'text', required: false, options: [] });
                        }}
                        className="px-4 py-2 rounded-md text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={handleAddCustomField}
                      disabled={!customFieldForm.label || (customFieldForm.type === 'select' && (!customFieldForm.options || customFieldForm.options.length === 0))}
                      className={`px-4 py-2 rounded-md text-sm font-medium ${
                        customFieldForm.label && (customFieldForm.type !== 'select' || (customFieldForm.options && customFieldForm.options.length > 0))
                          ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                          : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      Add Field
                    </button>
                  )}
                </div>
              </div>

              {/* Custom Fields List */}
              {preferences.customFields && preferences.customFields.length > 0 ? (
                <div className="border border-gray-100 rounded-lg divide-y divide-gray-100">
                  {preferences.customFields.map((field) => (
                    <div
                      key={field.id}
                      className="flex items-center justify-between px-4 py-3 bg-white hover:bg-gray-50"
                    >
                      <div>
                        <div className="font-medium text-gray-800">
                          {field.label}
                          <span className="ml-2 text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                            {field.type}
                          </span>
                          {field.required && (
                            <span className="ml-2 text-xs text-red-600 bg-red-50 px-2 py-0.5 rounded">
                              Required
                            </span>
                          )}
                        </div>
                        {field.options && field.options.length > 0 && (
                          <div className="text-xs text-gray-500 mt-1">
                            Options: {field.options.join(', ')}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleEditCustomField(field)}
                          className="px-3 py-1 text-xs font-medium text-indigo-600 border border-indigo-300 rounded hover:bg-indigo-50"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCustomField(field.id)}
                          className="px-3 py-1 text-xs font-medium text-red-600 border border-red-300 rounded hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-sm">No custom fields yet. Create one above to get started!</p>
                </div>
              )}
            </div>
          )}

          {/* Interview Events Section */}
          {activeSection === 'interviewing' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Interview Events</h2>
              <p className="text-sm text-gray-500 mb-6">
                Manage custom interview event types that will be available when creating timeline events.
              </p>

              {/* Add/Edit Interview Event Form */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">
                  {editingInterviewEvent ? 'Edit Interview Event' : 'Add New Interview Event'}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Event Label *
                    </label>
                    <input
                      type="text"
                      value={interviewEventForm.label || ''}
                      onChange={(e) => setInterviewEventForm({ ...interviewEventForm, label: e.target.value })}
                      placeholder="e.g., Phone Screen, Panel Interview"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  {editingInterviewEvent ? (
                    <>
                      <button
                        type="button"
                        onClick={handleUpdateInterviewEvent}
                        disabled={!interviewEventForm.label}
                        className={`px-4 py-2 rounded-md text-sm font-medium ${
                          interviewEventForm.label
                            ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        Update Event
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingInterviewEvent(null);
                          setInterviewEventForm({ label: '' });
                        }}
                        className="px-4 py-2 rounded-md text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={handleAddInterviewEvent}
                      disabled={!interviewEventForm.label}
                      className={`px-4 py-2 rounded-md text-sm font-medium ${
                        interviewEventForm.label
                          ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                          : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      Add Event
                    </button>
                  )}
                </div>
              </div>

              {/* Interview Events List */}
              {preferences.customInterviewEvents && preferences.customInterviewEvents.length > 0 ? (
                <div className="border border-gray-100 rounded-lg divide-y divide-gray-100">
                  {preferences.customInterviewEvents.map((event) => (
                    <div
                      key={event.id}
                      className="flex items-center justify-between px-4 py-3 bg-white hover:bg-gray-50"
                    >
                      <div>
                        <div className="font-medium text-gray-800">
                          {event.label}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleEditInterviewEvent(event)}
                          className="px-3 py-1 text-xs font-medium text-indigo-600 border border-indigo-300 rounded hover:bg-indigo-50"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteInterviewEvent(event.id)}
                          className="px-3 py-1 text-xs font-medium text-red-600 border border-red-300 rounded hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-sm">No custom interview events yet. Create one above to get started!</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer version={packageJson.version} />
    </div>
  );
};

const SettingsPage: React.FC<SettingsPageProps> = ({ onNavigate }) => {
  return (
    <AlertProvider>
      <SettingsPageContent onNavigate={onNavigate} />
    </AlertProvider>
  );
};

export default SettingsPage;
