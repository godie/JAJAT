// src/pages/OpportunitiesPage.tsx
import React, { useState, useEffect, useMemo } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { AlertProvider, useAlert } from '../components/AlertProvider';
import { 
  getOpportunities, 
  deleteOpportunity, 
  convertOpportunityToApplication,
  saveApplications,
  getApplications,
  type JobOpportunity 
} from '../utils/localStorage';
import packageJson from '../../package.json';

interface OpportunitiesPageContentProps {
  onNavigate?: (page: 'applications' | 'opportunities') => void;
}

const OpportunitiesPageContent: React.FC<OpportunitiesPageContentProps> = ({ onNavigate }) => {
  const { showSuccess, showError } = useAlert();
  const [opportunities, setOpportunities] = useState<JobOpportunity[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadOpportunities();
    
    // Listen for storage changes (from Chrome extension)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'jobOpportunities' || e.key === null) {
        loadOpportunities();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Also poll for changes (in case extension uses chrome.storage.local)
    const interval = setInterval(() => {
      loadOpportunities();
    }, 2000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
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
    if (window.confirm(`Are you sure you want to delete "${opportunity.position}" at ${opportunity.company}?`)) {
      deleteOpportunity(opportunity.id);
      loadOpportunities();
      showSuccess(`Opportunity "${opportunity.position}" has been deleted.`);
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
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Interesting Opportunities</h2>
          <p className="text-sm text-gray-600">
            Job opportunities captured from LinkedIn. Click "Apply" to convert them into applications.
          </p>
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
                              href={opp.link}
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
    </div>
  );
};

interface OpportunitiesPageProps {
  onNavigate?: (page: 'applications' | 'opportunities') => void;
}

const OpportunitiesPage: React.FC<OpportunitiesPageProps> = ({ onNavigate }) => {
  return (
    <AlertProvider>
      <OpportunitiesPageContent onNavigate={onNavigate} />
    </AlertProvider>
  );
};

export default OpportunitiesPage;

