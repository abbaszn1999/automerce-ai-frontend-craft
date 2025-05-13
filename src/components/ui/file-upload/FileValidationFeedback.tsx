
import React from "react";
import { AlertCircle, CheckCircle, AlertTriangle } from "lucide-react";
import { FileValidationResult } from "./types";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

interface FileValidationFeedbackProps {
  validation: FileValidationResult;
}

const FileValidationFeedback: React.FC<FileValidationFeedbackProps> = ({ validation }) => {
  if (!validation || (validation.errors.length === 0 && validation.warnings.length === 0 && validation.isValid)) {
    return (
      <Alert className="mt-2 bg-green-50 border-green-200">
        <CheckCircle className="h-4 w-4 text-green-500" />
        <AlertTitle>File Validated</AlertTitle>
        <AlertDescription>
          The file meets all requirements and is ready to be processed.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-2 mt-2">
      {validation.errors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Validation Errors</AlertTitle>
          <AlertDescription>
            <ul className="list-disc pl-4 text-sm">
              {validation.errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}
      
      {validation.warnings.length > 0 && (
        <Alert className="bg-yellow-50 border-yellow-200">
          <AlertTriangle className="h-4 w-4 text-yellow-500" />
          <AlertTitle>Warnings</AlertTitle>
          <AlertDescription>
            <ul className="list-disc pl-4 text-sm">
              {validation.warnings.map((warning, index) => (
                <li key={index}>{warning}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default FileValidationFeedback;
