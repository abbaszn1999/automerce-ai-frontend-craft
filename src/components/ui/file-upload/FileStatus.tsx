
import React from "react";
import { Check, X } from "lucide-react";
import { FileUploadStatus } from "./types";

interface FileStatusProps {
  file: File;
  status: FileUploadStatus;
  onRemove: () => void;
  children?: React.ReactNode;
}

const FileStatus: React.FC<FileStatusProps> = ({ 
  file, 
  status, 
  onRemove,
  children 
}) => {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Check className="h-5 w-5 text-green-500" />
          <span className="text-sm font-medium">{file.name}</span>
        </div>
        <button 
          type="button" 
          onClick={onRemove}
          className="text-gray-400 hover:text-gray-500"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      
      {children}
    </div>
  );
};

export default FileStatus;
