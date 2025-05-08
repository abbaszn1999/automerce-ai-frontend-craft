
import React from "react";

interface Column {
  key: string;
  label: string;
}

interface Action {
  label: string;
  onClick: (rowData: any) => void;
  className?: string;
}

interface DataTableProps {
  data: any[];
  columns: Column[];
  actions?: Action[];
  id?: string;
}

const DataTable: React.FC<DataTableProps> = ({ 
  data, 
  columns, 
  actions,
  id
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="data-table" id={id}>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key} className="whitespace-nowrap">
                {column.label}
              </th>
            ))}
            {actions && actions.length > 0 && (
              <th>Actions</th>
            )}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length + (actions ? 1 : 0)} className="text-center py-4 text-gray-500">
                No data available
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {columns.map((column) => (
                  <td key={column.key}>
                    {row[column.key]}
                  </td>
                ))}
                {actions && actions.length > 0 && (
                  <td className="whitespace-nowrap">
                    <div className="flex space-x-2">
                      {actions.map((action, actionIndex) => (
                        <button 
                          key={actionIndex} 
                          onClick={() => action.onClick(row)} 
                          className={`btn btn-sm ${action.className || "btn-outline"}`}
                        >
                          {action.label}
                        </button>
                      ))}
                    </div>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
