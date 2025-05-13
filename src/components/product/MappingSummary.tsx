
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requiredProductColumns } from './constants/productColumns';
import { ColumnMapping } from '@/hooks/api/useAttributeExtractionService';

interface MappingSummaryProps {
  columnMapping: ColumnMapping;
}

const MappingSummary: React.FC<MappingSummaryProps> = ({ columnMapping }) => {
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
              {requiredProductColumns.map((col) => (
                <tr key={col.key} className="border-t">
                  <td className="p-2">{col.display}{col.required ? "*" : ""}</td>
                  <td className="p-2">{columnMapping[col.key as keyof ColumnMapping] || "-"}</td>
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
