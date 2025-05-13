
import React from 'react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import { requiredProductColumns } from './constants/productColumns';
import { ColumnMapping } from '@/hooks/api/useAttributeExtractionService';

interface ColumnMappingSectionProps {
  columnMapping: ColumnMapping;
  sourceColumns: string[];
  onColumnMappingChange: (requiredColumn: keyof ColumnMapping, sourceColumn: string) => void;
}

const ColumnMappingSection: React.FC<ColumnMappingSectionProps> = ({
  columnMapping,
  sourceColumns,
  onColumnMappingChange
}) => {
  return (
    <div className="mt-6">
      <h3 className="text-lg font-medium mb-4">Column Mapping</h3>
      <p className="text-sm text-gray-600 mb-4">
        {sourceColumns.length > 0 
          ? "Match each required column to the corresponding column in your uploaded file:"
          : "Upload a file to map the columns from your sheet."}
      </p>
      
      <div className="space-y-4">
        {requiredProductColumns.map((col) => (
          <div key={col.key} className="flex items-center gap-4">
            <div className="w-1/3">
              <label className="block text-sm font-medium">{col.display}{col.required ? "*" : ""}</label>
            </div>
            <div className="w-2/3">
              <Select 
                value={columnMapping[col.key as keyof ColumnMapping] || ""} 
                onValueChange={(value) => onColumnMappingChange(col.key as keyof ColumnMapping, value)}
                disabled={sourceColumns.length === 0}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={sourceColumns.length > 0 ? "-- Select column from your file --" : "Upload a file first"} />
                </SelectTrigger>
                <SelectContent>
                  {sourceColumns.map((sourceCol) => (
                    <SelectItem key={sourceCol} value={sourceCol}>{sourceCol}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-500 mt-2">* Required fields</p>
    </div>
  );
};

export default ColumnMappingSection;
