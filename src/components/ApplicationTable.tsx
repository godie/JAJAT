// src/components/ApplicationTable.tsx (Actualizado para aceptar props)
import React from 'react';

interface ApplicationTableProps {
    columns: string[];
    data: any[];
}

const ApplicationTable: React.FC<ApplicationTableProps> = ({ columns, data }) => {
  return (
    <div className="overflow-x-auto shadow-xl rounded-lg border border-gray-100">
      <table className="min-w-full divide-y divide-gray-200" data-testid="application-table">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column) => (
              <th
                key={column}
                scope="col"
                className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider bg-indigo-50 whitespace-nowrap"
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-6 py-10 text-center text-gray-400 italic">
                Use the "+ Add Entry" button to start tracking your applications!
              </td>
            </tr>
          ) : (
            // 💡 Placeholder para la renderización de datos (si hay datos)
            data.map((item, index) => (
                <tr key={item.id || index} className="hover:bg-gray-50 transition duration-100">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.position}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.company}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.salary}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.status}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.applicationDate}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.interviewDate}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.platform}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.contactName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.followUpDate}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.notes}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.link}</td>                    
                </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ApplicationTable;