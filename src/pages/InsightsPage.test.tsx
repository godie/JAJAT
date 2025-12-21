// src/pages/InsightsPage.test.tsx
import { render, screen } from '@testing-library/react';
import InsightsPage from './InsightsPage';
import * as storage from '../storage/applications';
import type { JobApplication } from '../types/applications';

const mockApplications: JobApplication[] = [
  {
    id: '1',
    position: 'Software Engineer',
    company: 'Tech Corp',
    status: 'interviewing',
    timeline: [
      { id: 'e1', type: 'application_submitted', date: '2023-01-01', status: 'completed' },
      { id: 'e2', type: 'technical_interview', date: '2023-01-10', status: 'scheduled' },
    ],
    salary: '',
    applicationDate: '2023-01-01',
    interviewDate: '2023-01-10',
    notes: '',
    link: '',
    platform: '',
    contactName: '',
    followUpDate: ''
  },
  {
    id: '2',
    position: 'Product Manager',
    company: 'Innovate LLC',
    status: 'rejected',
    timeline: [],
    salary: '',
    applicationDate: '2023-02-01',
    interviewDate: '',
    notes: '',
    link: '',
    platform: '',
    contactName: '',
    followUpDate: ''
  },
  {
    id: '3',
    position: 'UX Designer',
    company: 'Creative Inc',
    status: 'applied',
    timeline: [],
    salary: '',
    applicationDate: '2023-02-15',
    interviewDate: '',
    notes: '',
    link: '',
    platform: '',
    contactName: '',
    followUpDate: ''
  },
];

vi.mock('recharts', async () => {
  const OriginalRecharts = await vi.importActual('recharts');
  return {
    ...OriginalRecharts,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div className="recharts-responsive-container">{children}</div>
    ),
  };
});

describe('InsightsPage', () => {
  beforeEach(() => {
    vi.spyOn(storage, 'getApplications').mockReturnValue(mockApplications);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders insights title', () => {
    render(<InsightsPage />);
    expect(screen.getByText('Insights')).toBeInTheDocument();
  });

  it('displays correct stats', () => {
    render(<InsightsPage />);
    const totalApplicationsTitle = screen.getByText('Total Applications');
    expect(totalApplicationsTitle.nextElementSibling).toHaveTextContent('3');

    const totalInterviewsTitle = screen.getByText('Total Interviews');
    expect(totalInterviewsTitle.nextElementSibling).toHaveTextContent('1');

    const rejectedApplicationsTitle = screen.getByText('Rejected Applications');
    expect(rejectedApplicationsTitle.nextElementSibling).toHaveTextContent('1');

    const rejectionPercentageTitle = screen.getByText('Rejection Percentage');
    expect(rejectionPercentageTitle.nextElementSibling).toHaveTextContent('33.33%');
  });

  it('renders both charts', () => {
    render(<InsightsPage />);
    expect(screen.getByText('Applications by Status')).toBeInTheDocument();
    expect(screen.getByText('Interviews by Status')).toBeInTheDocument();
  });
});
