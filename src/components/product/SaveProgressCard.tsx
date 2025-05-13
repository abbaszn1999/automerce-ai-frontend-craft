
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Save } from "lucide-react";

interface SaveProgressCardProps {
  isSaving: boolean;
  isSaved: boolean;
  saveProgress: { processed: number; total: number } | null;
  onSaveToDatabase: () => void;
  projectId?: string;
  processedData: any[] | null;
}

const SaveProgressCard: React.FC<SaveProgressCardProps> = ({
  isSaving,
  isSaved,
  saveProgress,
  onSaveToDatabase,
  projectId,
  processedData
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Save to Database</span>
          {isSaved && <span className="text-sm text-green-600 font-normal">✓ Saved</span>}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 mb-4">
          Before proceeding to attribute extraction, you must first save the processed data to the database.
        </p>
        
        {saveProgress && (
          <div className="mb-4">
            <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-2 bg-blue-600 rounded-full transition-all duration-300" 
                style={{ width: `${Math.round((saveProgress.processed / saveProgress.total) * 100)}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1 text-right">
              Saved {saveProgress.processed} of {saveProgress.total} records
            </p>
          </div>
        )}
        
        <div className="flex justify-center">
          <Button
            onClick={onSaveToDatabase}
            disabled={isSaving || isSaved || !projectId || !processedData}
            className="flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save size={16} />
                <span>Save Sheet to Database</span>
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SaveProgressCard;
