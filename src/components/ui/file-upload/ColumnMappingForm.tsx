
import React from "react";
import { ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { ColumnMappingProps } from "./types";

const ColumnMappingForm: React.FC<ColumnMappingProps> = ({
  sourceColumns,
  targetColumns,
  columnMapping,
  onColumnMappingChange,
  onComplete,
  onCancel,
  requiredColumns
}) => {
  const handleColumnMappingComplete = () => {
    // Check if all required columns are mapped
    if (requiredColumns) {
      const requiredMapped = requiredColumns
        .filter(col => col.endsWith('*'))
        .map(col => col.replace('*', ''))
        .every(col => 
          Object.values(columnMapping).includes(col)
        );
      
      if (!requiredMapped) {
        toast.error("Not all required columns have been mapped");
        return;
      }
    }
    
    onComplete();
  };

  // Helper function to check if a column is required
  const isRequired = (column: string) => {
    return requiredColumns?.some(col => col === column || col === `${column}*`);
  };

  return (
    <div className="w-full">
      <h3 className="font-medium mb-4">Map Your Sheet Columns</h3>
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {sourceColumns.length > 0 ? (
          sourceColumns.map((sourceColumn, index) => (
            <div key={index} className="flex items-center gap-4">
              <div className="w-1/3 p-2 bg-gray-100 rounded">
                <span className="text-sm font-medium">{sourceColumn}</span>
              </div>
              <ArrowDown className="text-gray-400" />
              <select
                className="w-1/3 p-2 border rounded"
                value={columnMapping[sourceColumn] || ""}
                onChange={(e) => onColumnMappingChange(sourceColumn, e.target.value)}
              >
                <option value="">-- Select target column --</option>
                {targetColumns?.map((col) => {
                  const cleanCol = col.endsWith('*') ? col.replace('*', '') : col;
                  return (
                    <option key={col} value={cleanCol}>
                      {cleanCol}{col.endsWith('*') ? '*' : ''}
                    </option>
                  );
                })}
              </select>
            </div>
          ))
        ) : (
          <div className="text-center py-4 text-gray-500">
            No columns found in the uploaded file.
          </div>
        )}
      </div>
      <div className="flex justify-end mt-4 gap-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleColumnMappingComplete}>
          Complete Mapping
        </Button>
      </div>
    </div>
  );
};

export default ColumnMappingForm;
