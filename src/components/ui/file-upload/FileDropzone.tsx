
import React, { useState, useRef } from "react";
import { Upload } from "lucide-react";
import ChooseFromFeedButton from "@/components/common/ChooseFromFeedButton";

interface FileDropzoneProps {
  id: string;
  acceptedTypes: string[];
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  showFeedListOption?: boolean;
  onSelectFeed?: (feedId: string) => void;
}

const FileDropzone: React.FC<FileDropzoneProps> = ({
  id,
  acceptedTypes,
  onFileChange,
  showFeedListOption = true,
  onSelectFeed
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSelectFeed = (feedId: string) => {
    if (onSelectFeed) {
      onSelectFeed(feedId);
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) {
      setIsDragging(true);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      // Create a synthetic event to pass to onFileChange
      const fileChangeEvent = {
        target: {
          files: e.dataTransfer.files
        }
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      
      onFileChange(fileChangeEvent);
    }
  };

  const handleFileInputClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div
      className={`flex flex-col items-center py-6 px-4 ${
        isDragging
          ? "bg-blue-50 border-blue-300 border-dashed"
          : "bg-gray-50 border-gray-200 border-dashed"
      } border-2 rounded-lg transition-all duration-200 ease-in-out`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <Upload className="h-8 w-8 text-gray-400 mb-2" />
      <div className="text-sm text-center mb-2">
        <p className="font-medium text-gray-700">
          Drop your file here or
        </p>
        <p className="text-gray-500">
          {acceptedTypes.join(", ")} files up to 10MB
        </p>
      </div>
      
      <button
        type="button"
        onClick={handleFileInputClick}
        className="mt-2 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
      >
        Choose File
      </button>
      
      <input
        ref={fileInputRef}
        id={id}
        type="file"
        className="hidden"
        onChange={onFileChange}
        accept={acceptedTypes.join(",")}
      />

      {showFeedListOption && onSelectFeed && (
        <div className="mt-4 w-full">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-gray-50 px-2 text-muted-foreground">Or</span>
            </div>
          </div>
          <div className="mt-4">
            <ChooseFromFeedButton 
              className="w-full" 
              onSelectFeed={handleSelectFeed}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default FileDropzone;
