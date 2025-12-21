// src/pages/InsightsPage.tsx
import React from 'react';
import { getApplications } from '../storage/applications';
import StatCard from '../components/StatCard';
import StatusBarChart from '../components/StatusBarChart';
import InterviewBarChart from '../components/InterviewBarChart';

const InsightsPage: React.FC = () => {
  const applications = getApplications();

  const totalInterviews = applications.reduce((count, app) => {
    return count + (app.timeline || []).filter(event => event.type.includes('interview')).length;
  }, 0);

  const rejectedApplications = applications.filter(app => app.status === 'rejected').length;
  const totalApplications = applications.length;
  const rejectionPercentage = totalApplications > 0 ? ((rejectedApplications / totalApplications) * 100).toFixed(2) + '%' : '0%';

  const statusData = applications.reduce((acc, app) => {
    const status = app.status.toLowerCase();
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const statusChartData = Object.keys(statusData).map(key => ({
    name: key,
    value: statusData[key],
  }));

  const interviewStatusData = applications.reduce((acc, app) => {
    (app.timeline || []).forEach(event => {
      if (event.type.includes('interview')) {
        const status = app.status.toLowerCase();
        acc[status] = (acc[status] || 0) + 1;
      }
    });
    return acc;
  }, {} as Record<string, number>);

  const interviewChartData = Object.keys(interviewStatusData).map(key => ({
    name: key,
    value: interviewStatusData[key],
  }));

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Insights</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Applications" value={totalApplications} />
        <StatCard title="Total Interviews" value={totalInterviews} />
        <StatCard title="Rejected Applications" value={rejectedApplications} />
        <StatCard title="Rejection Percentage" value={rejectionPercentage} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <StatusBarChart data={statusChartData} />
        <InterviewBarChart data={interviewChartData} />
      </div>
    </div>
  );
};

export default InsightsPage;
