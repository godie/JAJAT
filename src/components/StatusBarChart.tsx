// src/components/StatusBarChart.tsx
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';
import { VALUE_BY_STATUS } from '../utils/constants';

interface StatusBarChartProps {
  data: { name: string; value: number }[];
}

const StatusBarChart: React.FC<StatusBarChartProps> = ({ data }) => {
  const chartData = data.map(item => ({
    ...item,
    name: VALUE_BY_STATUS[item.name] || item.name,
  }));

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Applications by Status</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="value" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StatusBarChart;
