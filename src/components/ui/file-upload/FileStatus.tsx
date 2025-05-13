
import React from "react";
import { Check, X, FileText } from "lucide-react";
import { FileUploadStatus, FileValidationResult } from "./types";
import FileValidationFeedback from "./FileValidationFeedback";
import UploadProgress from "./UploadProgress";

interface FileStatusProps {
  file: File;
  status: FileUploadStatus;
  onRemove: () => void;
  children?: React.ReactNode;
  progress?: number;
  validation?: FileValidationResult;
  showValidationFeedback?: boolean;
}

const FileStatus: React.FC<FileStatusProps> = ({ 
  file, 
  status, 
  onRemove,
  children,
  progress = 100,
  validation,
  showValidationFeedback = true
}) => {
  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " bytes";
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    else return (bytes / 1048576).toFixed(1) + " MB";
  };
  
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <FileText className="h-5 w-5 text-blue-500" />
          <div className="text-sm">
            <div className="font-medium">{file.name}</div>
            <div className="text-xs text-gray-500">{formatFileSize(file.size)}</div>
          </div>
        </div>
        <button 
          type="button" 
          onClick={onRemove}
          className="text-gray-400 hover:text-gray-500"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      
      <UploadProgress 
        status={status} 
        progress={progress} 
        fileName={file.name} 
      />
      
      {showValidationFeedback && validation && (
        <FileValidationFeedback validation={validation} />
      )}
      
      {children}
    </div>
  );
};

export default FileStatus;
