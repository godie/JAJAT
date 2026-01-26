// src/pages/InsightsPage.tsx
import React from 'react';
import StatCard from '../components/StatCard';
import StatusBarChart from '../components/StatusBarChart';
import InterviewBarChart from '../components/InterviewBarChart';
import { useApplicationsStore } from '../stores/applicationsStore';

/**
 * Check if an event type is considered an interview event
 */
const isInterviewEvent = (eventType: string): boolean => {
  const interviewTypes = [
    'screener_call',
    'first_contact',
    'technical_interview',
    'code_challenge',
    'live_coding',
    'hiring_manager',
    'system_design',
    'cultural_fit',
    'final_round',
  ];
  return interviewTypes.includes(eventType);
};

/**
 * Get display name for interview event type
 */
const getInterviewTypeDisplayName = (eventType: string): string => {
  const typeNames: Record<string, string> = {
    'screener_call': 'Screener Call',
    'first_contact': 'First Contact',
    'technical_interview': 'Technical Interview',
    'code_challenge': 'Code Challenge',
    'live_coding': 'Live Coding',
    'hiring_manager': 'Hiring Manager',
    'system_design': 'System Design',
    'cultural_fit': 'Cultural Fit',
    'final_round': 'Final Round',
  };
  return typeNames[eventType] || eventType;
};

const InsightsPage: React.FC = () => {
  const applications = useApplicationsStore((state) => state.applications);

  // Get all interview events
  const allInterviewEvents = applications.flatMap(app => 
    (app.timeline || []).filter(event => isInterviewEvent(event.type))
  );

  const totalInterviews = allInterviewEvents.length;

  const rejectedApplications = applications.filter(app => app.status.toLowerCase() === 'rejected').length;
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

  // Interviews by application status (the current chart)
  const interviewStatusData = applications.reduce((acc, app) => {
    const interviewEvents = (app.timeline || []).filter(event => isInterviewEvent(event.type));
    if (interviewEvents.length > 0) {
      const status = app.status.toLowerCase();
      acc[status] = (acc[status] || 0) + interviewEvents.length;
    }
    return acc;
  }, {} as Record<string, number>);

  const interviewChartData = Object.keys(interviewStatusData).map(key => ({
    name: key,
    value: interviewStatusData[key],
  }));

  // Interviews by type (new chart - more useful!)
  const interviewTypeData = allInterviewEvents.reduce((acc, event) => {
    const type = event.type;
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const interviewTypeChartData = Object.keys(interviewTypeData)
    .map(key => ({
      name: getInterviewTypeDisplayName(key),
      value: interviewTypeData[key],
    }))
    .sort((a, b) => b.value - a.value); // Sort by count descending

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Insights</h1>
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-8">
        <StatCard title="Total Applications" value={totalApplications} compact />
        <StatCard title="Total Interviews" value={totalInterviews} compact />
        <StatCard title="Rejected Applications" value={rejectedApplications} compact />
        <StatCard title="Rejection Percentage" value={rejectionPercentage} compact />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <StatusBarChart data={statusChartData} />
        <InterviewBarChart 
          data={interviewChartData} 
          title="Interviews by Application Status"
        />
      </div>
      {interviewTypeChartData.length > 0 && (
        <div className="mb-8">
          <InterviewBarChart 
            data={interviewTypeChartData} 
            title="Interviews by Type"
          />
        </div>
      )}
    </div>
  );
};

export default InsightsPage;
