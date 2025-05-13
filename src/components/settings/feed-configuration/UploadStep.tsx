
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import FileUpload from "@/components/ui/FileUpload";
import { List } from "lucide-react";
import { FeedModeType } from "./types";

interface UploadStepProps {
  selectedFeedMode: FeedModeType;
  targetColumns: string[];
  onFileUpload: (file: File | null) => void;
  onColumnsExtracted: (columns: string[]) => void;
  onOpenChooseFeedDialog: () => void;
}

const UploadStep: React.FC<UploadStepProps> = ({
  selectedFeedMode,
  targetColumns,
  onFileUpload,
  onColumnsExtracted,
  onOpenChooseFeedDialog
}) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-6">
          <FileUpload
            id="feed-upload"
            acceptedTypes={[".csv", ".xlsx"]}
            onFileChange={onFileUpload}
            onColumnsExtracted={onColumnsExtracted}
            label={`Upload your ${selectedFeedMode === "plp" ? "PLP" : "Product"} feed file`}
            requiredColumns={targetColumns}
            downloadTemplateLink="#"
            showFeedListOption={false}
          />
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or</span>
            </div>
          </div>
          
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={onOpenChooseFeedDialog}
          >
            <List className="mr-2 h-4 w-4" />
            Choose from Feed List
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default UploadStep;
