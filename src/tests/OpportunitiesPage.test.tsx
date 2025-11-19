// src/tests/OpportunitiesPage.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import OpportunitiesPage from '../pages/OpportunitiesPage';
import * as localStorageUtils from '../utils/localStorage';

// Mock localStorage utilities
vi.mock('../utils/localStorage', () => ({
  getOpportunities: vi.fn(() => []),
  addOpportunity: vi.fn((opp) => ({
    ...opp,
    id: 'test-id-1',
    capturedDate: new Date().toISOString(),
  })),
  deleteOpportunity: vi.fn(),
  convertOpportunityToApplication: vi.fn((opp) => ({
    id: 'app-id-1',
    position: opp.position,
    company: opp.company,
    status: 'Applied',
    applicationDate: new Date().toISOString().split('T')[0],
    timeline: [],
    notes: '',
    link: opp.link,
    platform: 'LinkedIn',
    contactName: '',
    followUpDate: '',
    salary: '',
    interviewDate: '',
  })),
  saveApplications: vi.fn(),
  getApplications: vi.fn(() => []),
}));

// Mock Header and Footer
vi.mock('../components/Header', () => ({
  default: ({ currentPage }: { currentPage: string }) => (
    <div data-testid="header">Header - {currentPage}</div>
  ),
}));

vi.mock('../components/Footer', () => ({
  default: ({ version }: { version: string }) => (
    <div data-testid="footer">Footer - {version}</div>
  ),
}));

describe('OpportunitiesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (localStorageUtils.getOpportunities as ReturnType<typeof vi.fn>).mockReturnValue([]);
  });

  it('should render empty state when no opportunities', () => {
    render(<OpportunitiesPage />);
    
    expect(screen.getByText('Interesting Opportunities')).toBeInTheDocument();
    expect(screen.getByText('No opportunities yet')).toBeInTheDocument();
    expect(screen.getByText(/Install the Chrome extension/i)).toBeInTheDocument();
  });

  it('should render add opportunity button', () => {
    render(<OpportunitiesPage />);
    
    expect(screen.getByText('+ Add Opportunity')).toBeInTheDocument();
  });

  it('should open form when add button is clicked', () => {
    render(<OpportunitiesPage />);
    
    const addButton = screen.getByText('+ Add Opportunity');
    fireEvent.click(addButton);

    expect(screen.getByText('Add New Opportunity')).toBeInTheDocument();
  });

  it('should display opportunities when available', () => {
    const mockOpportunities = [
      {
        id: '1',
        position: 'Software Engineer',
        company: 'Google',
        link: 'https://linkedin.com/jobs/view/123',
        location: 'Remote',
        jobType: 'Remote',
        salary: '$120k',
        postedDate: '2024-01-15',
        capturedDate: new Date().toISOString(),
      },
    ];

    (localStorageUtils.getOpportunities as ReturnType<typeof vi.fn>).mockReturnValue(mockOpportunities);

    render(<OpportunitiesPage />);
    
    expect(screen.getByText('Software Engineer')).toBeInTheDocument();
    expect(screen.getByText('Google')).toBeInTheDocument();
    // There might be multiple "Remote" texts (location and jobType), so use getAllByText
    const remoteTexts = screen.getAllByText('Remote');
    expect(remoteTexts.length).toBeGreaterThan(0);
  });

  it('should handle adding opportunity manually', async () => {
    render(<OpportunitiesPage />);
    
    // Open form
    const addButton = screen.getByText('+ Add Opportunity');
    fireEvent.click(addButton);

    // Wait for form to appear
    await waitFor(() => {
      expect(screen.getByText('Add New Opportunity')).toBeInTheDocument();
    });

    // Fill form - use getByRole or getByPlaceholderText for more reliable selection
    const positionInput = screen.getByPlaceholderText(/Software Engineer/i);
    const companyInput = screen.getByPlaceholderText(/Google/i);
    const linkInput = screen.getByPlaceholderText(/linkedin.com/i);
    
    fireEvent.change(positionInput, { target: { value: 'Software Engineer' } });
    fireEvent.change(companyInput, { target: { value: 'Google' } });
    fireEvent.change(linkInput, { target: { value: 'https://linkedin.com/jobs/view/123' } });
    
    // Submit form
    const saveButton = screen.getByText('Save Opportunity');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(localStorageUtils.addOpportunity).toHaveBeenCalledWith({
        position: 'Software Engineer',
        company: 'Google',
        link: 'https://linkedin.com/jobs/view/123',
        description: '',
        location: '',
        jobType: '',
        salary: '',
        postedDate: '',
      });
    });
  });

  it('should handle converting opportunity to application', () => {
    const mockOpportunities = [
      {
        id: '1',
        position: 'Software Engineer',
        company: 'Google',
        link: 'https://linkedin.com/jobs/view/123',
        capturedDate: new Date().toISOString(),
      },
    ];

    (localStorageUtils.getOpportunities as ReturnType<typeof vi.fn>).mockReturnValue(mockOpportunities);

    render(<OpportunitiesPage />);
    
    const applyButton = screen.getByText('Apply');
    fireEvent.click(applyButton);

    expect(localStorageUtils.convertOpportunityToApplication).toHaveBeenCalledWith(mockOpportunities[0]);
    expect(localStorageUtils.saveApplications).toHaveBeenCalled();
    expect(localStorageUtils.deleteOpportunity).toHaveBeenCalledWith('1');
  });

  it('should handle deleting opportunity', () => {
    const mockOpportunities = [
      {
        id: '1',
        position: 'Software Engineer',
        company: 'Google',
        link: 'https://linkedin.com/jobs/view/123',
        capturedDate: new Date().toISOString(),
      },
    ];

    (localStorageUtils.getOpportunities as ReturnType<typeof vi.fn>).mockReturnValue(mockOpportunities);

    // Mock window.confirm
    window.confirm = vi.fn(() => true);

    render(<OpportunitiesPage />);
    
    const deleteButton = screen.getByText('Delete');
    fireEvent.click(deleteButton);

    expect(window.confirm).toHaveBeenCalled();
    expect(localStorageUtils.deleteOpportunity).toHaveBeenCalledWith('1');
  });

  it('should filter opportunities by search term', () => {
    const mockOpportunities = [
      {
        id: '1',
        position: 'Software Engineer',
        company: 'Google',
        link: 'https://linkedin.com/jobs/view/123',
        capturedDate: new Date().toISOString(),
      },
      {
        id: '2',
        position: 'Frontend Developer',
        company: 'Facebook',
        link: 'https://linkedin.com/jobs/view/456',
        capturedDate: new Date().toISOString(),
      },
    ];

    (localStorageUtils.getOpportunities as ReturnType<typeof vi.fn>).mockReturnValue(mockOpportunities);

    render(<OpportunitiesPage />);
    
    const searchInput = screen.getByPlaceholderText('Search opportunities...');
    fireEvent.change(searchInput, { target: { value: 'Google' } });

    expect(screen.getByText('Software Engineer')).toBeInTheDocument();
    expect(screen.queryByText('Frontend Developer')).not.toBeInTheDocument();
  });
});

