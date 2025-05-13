
import React from "react";
import ProgressBar from "@/components/ui/ProgressBar";
import { FileUploadStatus } from "./types";

interface UploadProgressProps {
  status: FileUploadStatus;
  progress: number;
  fileName: string;
}

const UploadProgress: React.FC<UploadProgressProps> = ({ 
  status, 
  progress,
  fileName
}) => {
  const getStatusText = () => {
    switch (status) {
      case "uploading": return `Uploading ${fileName}... ${progress}%`;
      case "mapping": return "Analyzing file contents...";
      case "uploaded": return "Upload complete";
      case "error": return "Upload failed";
      default: return "Ready to upload";
    }
  };

  return (
    <div className="w-full mt-4">
      <div className="flex justify-between text-xs text-gray-600 mb-1">
        <span>{getStatusText()}</span>
        {status === "uploading" && <span>{progress}%</span>}
      </div>
      <ProgressBar progress={progress} height="h-1" />
    </div>
  );
};

export default UploadProgress;
