
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ColumnMapping } from "./types";

interface FinalizeStepProps {
  feedName: string;
  setFeedName: (name: string) => void;
  mappedColumns: ColumnMapping[];
  onGoBack: () => void;
  onFinalize: () => void;
}

const FinalizeStep: React.FC<FinalizeStepProps> = ({
  feedName,
  setFeedName,
  mappedColumns,
  onGoBack,
  onFinalize,
}) => {
  return (
    <div>
      <Card className="mb-6">
        <CardContent className="pt-6">
          <h3 className="font-medium mb-4">Finalize Feed Configuration</h3>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Feed Name
            </label>
            <input
              type="text"
              className="w-full p-2 border rounded"
              placeholder="Enter a name for this feed"
              value={feedName}
              onChange={(e) => setFeedName(e.target.value)}
            />
          </div>
          
          <h4 className="font-medium mt-6 mb-2">Column Mapping Summary</h4>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="text-left p-2">Source Column</th>
                <th className="text-left p-2">Target Column</th>
              </tr>
            </thead>
            <tbody>
              {mappedColumns.map((mapping, index) => (
                <tr key={index} className="border-t">
                  <td className="p-2">{mapping.sourceColumn}</td>
                  <td className="p-2">{mapping.targetColumn}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
      
      <div className="flex justify-end gap-3">
        <Button 
          onClick={onGoBack} 
          variant="outline"
        >
          Back to Mapping
        </Button>
        <Button 
          onClick={onFinalize} 
          disabled={!feedName.trim()}
          className="btn-primary"
        >
          Save Feed Configuration
        </Button>
      </div>
    </div>
  );
};

export default FinalizeStep;
