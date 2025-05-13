
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface MappingSummaryProps {
  requiredColumns: { key: string; display: string; required: boolean }[];
  columnMapping: Record<string, string>;
  isReady: boolean;
}

const MappingSummary: React.FC<MappingSummaryProps> = ({ 
  requiredColumns, 
  columnMapping, 
  isReady 
}) => {
  if (!isReady) return null;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Column Mapping Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="text-left p-2">Required Column</th>
                <th className="text-left p-2">Your Sheet Column</th>
              </tr>
            </thead>
            <tbody>
              {requiredColumns.map((col) => (
                <tr key={col.key} className="border-t">
                  <td className="p-2">{col.display}{col.required ? "*" : ""}</td>
                  <td className="p-2">{columnMapping[col.key] || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default MappingSummary;
