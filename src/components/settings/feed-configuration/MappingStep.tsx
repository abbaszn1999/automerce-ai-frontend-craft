
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ColumnMapping } from "./types";

interface MappingStepProps {
  targetColumns: string[];
  sampleColumns: string[];
  mappedColumns: ColumnMapping[];
  onColumnMapping: (sourceColumn: string, targetColumn: string) => void;
  onSaveMapping: () => void;
}

const MappingStep: React.FC<MappingStepProps> = ({
  targetColumns,
  sampleColumns,
  mappedColumns,
  onColumnMapping,
  onSaveMapping,
}) => {
  return (
    <div>
      <Card className="mb-6">
        <CardContent className="pt-6">
          <h3 className="font-medium mb-4">Map your columns</h3>
          <p className="text-sm text-gray-600 mb-4">
            Match each required column to the corresponding column in your uploaded file:
          </p>
          <div className="space-y-4">
            {targetColumns.map((targetCol, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="w-1/3">
                  <label className="block text-sm font-medium">
                    {targetCol.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}
                  </label>
                </div>
                <div className="w-2/3">
                  <select
                    className="w-full p-2 border rounded"
                    onChange={(e) => onColumnMapping(e.target.value, targetCol)}
                    value={mappedColumns.find(c => c.targetColumn === targetCol)?.sourceColumn || ""}
                  >
                    <option value="">-- Select column from your file --</option>
                    {sampleColumns.map((sourceCol) => (
                      <option key={sourceCol} value={sourceCol}>
                        {sourceCol}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-end">
        <Button 
          onClick={onSaveMapping} 
          disabled={mappedColumns.length < Math.min(3, targetColumns.length)}
          className="btn-primary"
        >
          Save Column Mapping
        </Button>
      </div>
    </div>
  );
};

export default MappingStep;
