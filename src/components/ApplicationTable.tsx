// src/components/ApplicationTable.tsx (Actualizado para aceptar props)
import React, { useState } from 'react';
import type { JobApplication } from '../utils/localStorage';

interface ApplicationTableProps {
    columns: string[];
    data: any[];
    onEdit: (application: JobApplication) => void;
    onDelete: (id:string) => void;
}

const ApplicationTable: React.FC<ApplicationTableProps> = ({ columns, data, onEdit, onDelete }) => {
  const [hoveredRowId, setHoveredRowId] = useState<string | null>(null);
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
                            <td colSpan={columns.length + 1} className="px-6 py-10 text-center text-gray-400 italic">
                                Use the "+ Add Entry" button to start tracking your applications!
                            </td>
                        </tr>
                    ) : (
                        data.map((item) => (
                            <tr 
                                key={item.id} 
                                className="hover:bg-gray-50 transition duration-100 cursor-pointer group"
                                onMouseEnter={() => setHoveredRowId(item.id)}
                                onMouseLeave={() => setHoveredRowId(null)}
                                data-testid={`row-${item.id}`}
                            >
                                {columns.map((column, index) => {
                                    // Determinar la clave de propiedad para el mapeo (asumiendo que las columnas coinciden con las claves)
                                    const key = column.toLowerCase().replace(/ /g, '').replace(/-/g, '');
                                    const cellContent = (item as any)[key] || item[key as keyof JobApplication] || '';
                                    
                                    return (
                                        // 💡 Habilitar edición al hacer clic en cualquier TD (excepto en el último que es el botón)
                                        <td 
                                            key={index}
                                            onClick={() => onEdit(item)}
                                            className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-r border-gray-100 group-hover:bg-indigo-50"
                                        >
                                            {cellContent}
                                        </td>
                                    );
                                })}

                                {/* 💡 Columna de Acción (Delete Button) */}
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium w-1">
                                    {hoveredRowId === item.id && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation(); // Evita que se active el evento onEdit del TD
                                                if (confirm(`Are you sure you want to delete the application for ${item.position}?`)) {
                                                    onDelete(item.id);
                                                }
                                            }}
                                            className="text-red-600 hover:text-red-900 font-bold p-1 rounded-full bg-white hover:bg-red-100 transition"
                                            aria-label={`Delete application for ${item.position}`}
                                            data-testid={`delete-btn-${item.id}`}
                                        >
                                            
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
      </table>
    </div>
  );
};

export default ApplicationTable;