import React, { useEffect, useState } from 'react';
import Footer from '../components/Footer';
import { useAlert } from '../components/AlertProvider';
import {
  DEFAULT_FIELDS,
  type FieldDefinition,
  type ViewType,
  type DateFormat,
  type CustomInterviewEvent,
  generateId,
} from '../utils/localStorage';
import packageJson from '../../package.json';
import { usePreferencesStore } from '../stores/preferencesStore';

import { type PageType } from '../App';

interface SettingsPageProps {
  onNavigate?: (page: PageType) => void;
}

const SettingsPageContent: React.FC<SettingsPageProps> = () => {
  const { showSuccess } = useAlert();
  
  // Use Zustand store
  const preferences = usePreferencesStore((state) => state.preferences);
  const loadPreferences = usePreferencesStore((state) => state.loadPreferences);
  const updatePreferences = usePreferencesStore((state) => state.updatePreferences);
  const resetPreferences = usePreferencesStore((state) => state.resetPreferences);
  
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
    loadPreferences();
  }, [loadPreferences]);

  const allFields: FieldDefinition[] = [...DEFAULT_FIELDS, ...(preferences.customFields || [])];

  const handleToggleField = (fieldId: string) => {
    const isEnabled = preferences.enabledFields.includes(fieldId);
    const enabledFields = isEnabled
      ? preferences.enabledFields.filter((id) => id !== fieldId)
      : [...preferences.enabledFields, fieldId];
    updatePreferences({ enabledFields });
    setHasChanges(true);
  };

  const handleMoveField = (fieldId: string, direction: 'up' | 'down') => {
    const order = [...preferences.columnOrder];
    const index = order.indexOf(fieldId);
    if (index === -1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= order.length) return;

    [order[index], order[targetIndex]] = [order[targetIndex], order[index]];
    updatePreferences({ columnOrder: order });
    setHasChanges(true);
  };

  const handleDefaultViewChange = (view: ViewType) => {
    updatePreferences({ defaultView: view });
    setHasChanges(true);
  };

  const handleDateFormatChange = (format: DateFormat) => {
    updatePreferences({ dateFormat: format });
    setHasChanges(true);
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

    const customFields = [...(preferences.customFields || []), newField];
    const enabledFields = [...preferences.enabledFields, newField.id];
    const columnOrder = [...preferences.columnOrder, newField.id];
    updatePreferences({ customFields, enabledFields, columnOrder });
    setHasChanges(true);

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

    const customFields = (preferences.customFields || []).map((field) =>
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
    updatePreferences({ customFields });
    setHasChanges(true);

    setCustomFieldForm({ label: '', type: 'text', required: false, options: [] });
    setEditingCustomField(null);
  };

  const handleDeleteCustomField = (fieldId: string) => {
    const customFields = (preferences.customFields || []).filter((f) => f.id !== fieldId);
    const enabledFields = preferences.enabledFields.filter((id) => id !== fieldId);
    const columnOrder = preferences.columnOrder.filter((id) => id !== fieldId);
    updatePreferences({ customFields, enabledFields, columnOrder });
    setHasChanges(true);
  };

  const handleAddInterviewEvent = () => {
    if (!interviewEventForm.label) return;
    
    const newEvent: CustomInterviewEvent = {
      id: `interview-event-${generateId()}`,
      label: interviewEventForm.label,
    };

    const customInterviewEvents = [...(preferences.customInterviewEvents || []), newEvent];
    updatePreferences({ customInterviewEvents });
    setHasChanges(true);

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

    const customInterviewEvents = (preferences.customInterviewEvents || []).map((event) =>
      event.id === editingInterviewEvent.id
        ? {
            ...event,
            label: interviewEventForm.label!,
          }
        : event
    );
    updatePreferences({ customInterviewEvents });
    setHasChanges(true);

    setInterviewEventForm({ label: '' });
    setEditingInterviewEvent(null);
  };

  const handleDeleteInterviewEvent = (eventId: string) => {
    const customInterviewEvents = (preferences.customInterviewEvents || []).filter((e) => e.id !== eventId);
    updatePreferences({ customInterviewEvents });
    setHasChanges(true);
  };

  const handleReset = () => {
    resetPreferences();
    setHasChanges(true);
    setCustomFieldForm({ label: '', type: 'text', required: false, options: [] });
    setEditingCustomField(null);
    setInterviewEventForm({ label: '' });
    setEditingInterviewEvent(null);
  };

  const handleSave = () => {
    // Preferences are already saved automatically by the store
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
    <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white dark:text-white mb-2">Settings</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-400">
            Customize your application tracking experience. All changes are saved locally in your browser.
          </p>
        </div>

        {/* Section Navigation */}
        <div className="mb-6 flex flex-wrap gap-2 bg-white dark:bg-gray-800 dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 dark:border-gray-700 p-2">
          {sections.map((section) => (
            <button
              key={section.id}
              type="button"
              onClick={() => setActiveSection(section.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                activeSection === section.id
                  ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300'
                  : 'text-gray-600 dark:text-gray-400 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 dark:hover:bg-gray-700'
              }`}
            >
              <span>{section.icon}</span>
              <span>{section.label}</span>
            </button>
          ))}
        </div>

        {/* Save/Reset Controls */}
        <div className="mb-6 flex justify-between items-center bg-white dark:bg-gray-800 dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 dark:border-gray-700 p-4">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={!hasChanges}
              className={`px-4 py-2 rounded-full text-sm font-semibold shadow-sm transition ${
                hasChanges
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                  : 'bg-gray-200 text-gray-500 dark:text-gray-400 cursor-not-allowed'
              }`}
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2 rounded-full text-sm font-semibold border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-700 transition"
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
        <div className="bg-white dark:bg-gray-800 dark:bg-gray-800 shadow-lg rounded-xl p-6 sm:p-8">
          {/* Table Fields Section */}
          {activeSection === 'fields' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white dark:text-white mb-2">Application Fields Configuration</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-400 mb-6">
                Choose which columns you want to see in your Applications table and adjust their order.
              </p>

              <div className="mt-4 border border-gray-100 rounded-lg divide-y divide-gray-100">
                {orderedFields.map((field, index) => {
                  const isEnabled = preferences.enabledFields.includes(field.id);
                  const isCustom = !DEFAULT_FIELDS.find((f) => f.id === field.id);
                  return (
                    <div
                      key={field.id}
                      className="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-700"
                    >
                      <div className="flex items-center gap-3">
                        <input
                          id={`field-${field.id}`}
                          name={`field-${field.id}`}
                          type="checkbox"
                          checked={isEnabled}
                          onChange={() => handleToggleField(field.id)}
                          className="h-4 w-4 text-indigo-600 border-gray-300 dark:border-gray-600 rounded"
                        />
                        <div>
                          <label
                            htmlFor={`field-${field.id}`}
                            className="text-sm font-medium text-gray-800 dark:text-white"
                          >
                            {field.label}
                            {isCustom && (
                              <span className="ml-2 text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                                Custom
                              </span>
                            )}
                          </label>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
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
                              ? 'text-gray-300 border-gray-200 dark:border-gray-700 cursor-not-allowed'
                              : 'text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
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
                              ? 'text-gray-300 border-gray-200 dark:border-gray-700 cursor-not-allowed'
                              : 'text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
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
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white dark:text-white mb-2">Default View</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-400 mb-6">
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
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
                    }`}
                  >
                    <div className="text-left">
                      <div className="font-semibold text-gray-800 dark:text-white capitalize mb-1">{view}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
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
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white dark:text-white mb-2">Date Format</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-400 mb-6">
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
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
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
                        <div className="font-semibold text-gray-800 dark:text-white">{format}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Example: {example}</div>
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
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white dark:text-white mb-2">Custom Fields</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-400 mb-6">
                Create your own fields to track additional information about your applications.
              </p>

              {/* Add/Edit Custom Field Form */}
              <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">
                  {editingCustomField ? 'Edit Custom Field' : 'Add New Custom Field'}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Field Label *
                    </label>
                    <input
                      type="text"
                      value={customFieldForm.label || ''}
                      onChange={(e) => setCustomFieldForm({ ...customFieldForm, label: e.target.value })}
                      placeholder="e.g., Recruiter Phone"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
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
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Enter one option per line. These will appear as dropdown options.
                      </p>
                    </div>
                  )}
                  <div className="sm:col-span-2 flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="required-field"
                      name="required-field"
                      checked={customFieldForm.required || false}
                      onChange={(e) =>
                        setCustomFieldForm({ ...customFieldForm, required: e.target.checked })
                      }
                      className="h-4 w-4 text-indigo-600 border-gray-300 dark:border-gray-600 rounded"
                    />
                    <label htmlFor="required-field" className="text-sm text-gray-700 dark:text-gray-300">
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
                            : 'bg-gray-200 text-gray-500 dark:text-gray-400 cursor-not-allowed'
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
                        className="px-4 py-2 rounded-md text-sm font-medium border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-700"
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
                          : 'bg-gray-200 text-gray-500 dark:text-gray-400 cursor-not-allowed'
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
                      className="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-700"
                    >
                      <div>
                        <div className="font-medium text-gray-800 dark:text-white">
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
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
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
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <p className="text-sm">No custom fields yet. Create one above to get started!</p>
                </div>
              )}
            </div>
          )}

          {/* Interview Events Section */}
          {activeSection === 'interviewing' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white dark:text-white mb-2">Interview Events</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-400 mb-6">
                Manage custom interview event types that will be available when creating timeline events.
              </p>

              {/* Add/Edit Interview Event Form */}
              <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">
                  {editingInterviewEvent ? 'Edit Interview Event' : 'Add New Interview Event'}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Event Label *
                    </label>
                    <input
                      type="text"
                      value={interviewEventForm.label || ''}
                      onChange={(e) => setInterviewEventForm({ ...interviewEventForm, label: e.target.value })}
                      placeholder="e.g., Phone Screen, Panel Interview"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
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
                            : 'bg-gray-200 text-gray-500 dark:text-gray-400 cursor-not-allowed'
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
                        className="px-4 py-2 rounded-md text-sm font-medium border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-700"
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
                          : 'bg-gray-200 text-gray-500 dark:text-gray-400 cursor-not-allowed'
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
                      className="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-700"
                    >
                      <div>
                        <div className="font-medium text-gray-800 dark:text-white">
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
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <p className="text-sm">No custom interview events yet. Create one above to get started!</p>
                </div>
              )}
            </div>
          )}
        </div>
      <Footer version={packageJson.version} />
    </div>
  );
};

const SettingsPage: React.FC<SettingsPageProps> = ({ onNavigate }) => {
  return <SettingsPageContent onNavigate={onNavigate} />;
};

export default SettingsPage;
