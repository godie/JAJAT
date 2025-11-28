// src/pages/OpportunitiesPage.tsx
import React, { useState, useEffect, useMemo } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { AlertProvider, useAlert } from '../components/AlertProvider';
import { 
  getOpportunities, 
  addOpportunity,
  deleteOpportunity, 
  convertOpportunityToApplication,
  saveApplications,
  getApplications,
  sanitizeUrl,
  type JobOpportunity 
} from '../utils/localStorage';
import OpportunityForm from '../components/OpportunityForm';
import ConfirmDialog from '../components/ConfirmDialog';
import packageJson from '../../package.json';

interface OpportunitiesPageContentProps {
  onNavigate?: (page: 'applications' | 'opportunities' | 'settings') => void;
}

const OpportunitiesPageContent: React.FC<OpportunitiesPageContentProps> = ({ onNavigate }) => {
  const { showSuccess, showError } = useAlert();
  const [opportunities, setOpportunities] = useState<JobOpportunity[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    opportunity: JobOpportunity | null;
  }>({
    isOpen: false,
    opportunity: null,
  });

  useEffect(() => {
    loadOpportunities();
    
    // Listen for storage changes (from Chrome extension)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'jobOpportunities' || e.key === null) {
        loadOpportunities();
      }
    };
    
        // Listen for custom event from webapp-content script
        const handleOpportunitiesUpdate = () => {
          loadOpportunities();
        };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('jobOpportunitiesUpdated', handleOpportunitiesUpdate as EventListener);
    
    // Also poll for changes (in case extension uses chrome.storage.local)
    const interval = setInterval(() => {
      loadOpportunities();
    }, 2000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('jobOpportunitiesUpdated', handleOpportunitiesUpdate as EventListener);
      clearInterval(interval);
    };
  }, []);

  const loadOpportunities = () => {
    setOpportunities(getOpportunities());
  };

  const handleApply = (opportunity: JobOpportunity) => {
    try {
      // Convert to application
      const application = convertOpportunityToApplication(opportunity);
      
      // Save application
      const applications = getApplications();
      applications.push(application);
      saveApplications(applications);
      
      // Remove opportunity
      deleteOpportunity(opportunity.id);
      loadOpportunities();
      
      showSuccess(`"${opportunity.position}" at ${opportunity.company} has been added to your applications!`);
    } catch (error) {
      console.error('Error converting opportunity:', error);
      showError('Failed to convert opportunity to application. Please try again.');
    }
  };

  const handleDelete = (opportunity: JobOpportunity) => {
    setDeleteConfirm({ isOpen: true, opportunity });
  };

  const confirmDelete = () => {
    if (deleteConfirm.opportunity) {
      const opportunity = deleteConfirm.opportunity;
      deleteOpportunity(opportunity.id);
      
      // Also delete from chrome.storage.local via content script
      // Use window.postMessage to send to content script
      // Send to same origin for security, but content script will receive it
      try {
        console.log('[Web App] Sending DELETE_OPPORTUNITY message to extension:', opportunity.id);
        window.postMessage({
          type: 'DELETE_OPPORTUNITY',
          opportunityId: opportunity.id,
        }, window.location.origin);
      } catch (error) {
        console.error('Error sending delete message to extension:', error);
      }
      
      loadOpportunities();
      showSuccess(`Opportunity "${opportunity.position}" has been deleted.`);
      setDeleteConfirm({ isOpen: false, opportunity: null });
    }
  };

  const handleAddOpportunity = (opportunityData: Omit<JobOpportunity, 'id' | 'capturedDate'>) => {
    try {
      const newOpportunity = addOpportunity(opportunityData);
      loadOpportunities();
      showSuccess(`Opportunity "${opportunityData.position}" at ${opportunityData.company} has been added!`);
      
      // Also sync to chrome.storage.local if extension is available
      // Use window.postMessage to send to content script
      try {
        window.postMessage({
          type: 'SYNC_OPPORTUNITY',
          data: newOpportunity,
        }, window.location.origin);
      } catch (error) {
        // Ignore if extension is not available
        console.debug('Extension not available for sync:', error);
      }
    } catch (error) {
      console.error('Error adding opportunity:', error);
      showError('Failed to add opportunity. Please try again.');
    }
  };

  const filteredOpportunities = useMemo(() => {
    if (!searchTerm.trim()) return opportunities;
    
    const normalized = searchTerm.toLowerCase();
    return opportunities.filter(opp => 
      opp.position.toLowerCase().includes(normalized) ||
      opp.company.toLowerCase().includes(normalized) ||
      opp.location?.toLowerCase().includes(normalized) ||
      opp.jobType?.toLowerCase().includes(normalized)
    );
  }, [opportunities, searchTerm]);

  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onNavigate={onNavigate} currentPage="opportunities" />
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Interesting Opportunities</h2>
            <p className="text-sm text-gray-600">
              Job opportunities captured from LinkedIn or added manually. Click "Apply" to convert them into applications.
            </p>
          </div>
          <button
            onClick={() => setIsFormOpen(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 transition duration-150"
          >
            + Add Opportunity
          </button>
        </div>

        {opportunities.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-500 text-lg mb-2">No opportunities yet</p>
            <p className="text-gray-400 text-sm">
              Install the Chrome extension to capture job opportunities from LinkedIn.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search opportunities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-2">
                Showing {filteredOpportunities.length} of {opportunities.length} opportunities
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Position
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Company
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Job Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Posted
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Captured
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredOpportunities.map((opp) => (
                      <tr key={opp.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{opp.position}</div>
                          {opp.salary && (
                            <div className="text-xs text-gray-500">{opp.salary}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{opp.company}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{opp.location || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            {opp.jobType || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(opp.postedDate)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(opp.capturedDate)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end gap-2">
                            <a
                              href={sanitizeUrl(opp.link)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-indigo-600 hover:text-indigo-900"
                              title="View on LinkedIn"
                            >
                              View
                            </a>
                            <button
                              onClick={() => handleApply(opp)}
                              className="text-green-600 hover:text-green-900 font-semibold"
                            >
                              Apply
                            </button>
                            <button
                              onClick={() => handleDelete(opp)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>
      <Footer version={packageJson.version} />
      <OpportunityForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleAddOpportunity}
      />
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title="Delete Opportunity"
        message={`Are you sure you want to delete "${deleteConfirm.opportunity?.position}" at ${deleteConfirm.opportunity?.company}?`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirm({ isOpen: false, opportunity: null })}
      />
    </div>
  );
};

interface OpportunitiesPageProps {
  onNavigate?: (page: 'applications' | 'opportunities' | 'settings') => void;
}

const OpportunitiesPage: React.FC<OpportunitiesPageProps> = ({ onNavigate }) => {
  return (
    <AlertProvider>
      <OpportunitiesPageContent onNavigate={onNavigate} />
    </AlertProvider>
  );
};

export default OpportunitiesPage;

