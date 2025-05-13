
import React, { useState, useEffect } from "react";
import { Upload, Check, X, FileInput } from "lucide-react";
import { validateFile } from "../../utils/utils";
import ChooseFromFeedButton from "@/components/common/ChooseFromFeedButton";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
// Fix the XLSX import to use named exports instead of default export
import * as XLSX from 'xlsx';
import useFileProcessor from "@/hooks/useFileProcessor";

interface FileUploadProps {
  id: string;
  acceptedTypes?: string[];
  label?: string;
  onFileChange?: (file: File | null) => void;
  onColumnsExtracted?: (columns: string[]) => void;
  className?: string;
  showFeedButton?: boolean;
  // Add the missing props
  requiredColumns?: string[];
  downloadTemplateLink?: string;
  statusId?: string;
  showFeedListOption?: boolean;
  mapColumn?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({
  id,
  acceptedTypes = [".csv", ".xlsx", ".xls"],
  label = "Upload File",
  onFileChange,
  onColumnsExtracted,
  className = "",
  showFeedButton = false,
  // Default values for new props
  requiredColumns,
  downloadTemplateLink,
  statusId,
  showFeedListOption,
  mapColumn
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const { extractColumnsFromFile, columns } = useFileProcessor();

  useEffect(() => {
    if (onColumnsExtracted && columns.length > 0) {
      onColumnsExtracted(columns);
    }
  }, [columns, onColumnsExtracted]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    await processFile(selectedFile);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files?.[0] || null;
    await processFile(droppedFile);
  };

  const processFile = async (selectedFile: File | null) => {
    setFile(selectedFile);
    if (selectedFile) {
      const valid = validateFile(selectedFile, acceptedTypes);
      setIsValid(valid);
      
      if (valid) {
        if (onFileChange) onFileChange(selectedFile);
        
        try {
          // Extract columns from the file
          const extractedColumns = await extractColumnsFromFile(selectedFile);
          
          toast.success(`File "${selectedFile.name}" successfully loaded`);
        } catch (err: any) {
          console.error("Error processing file:", err);
          toast.error(`Error processing file: ${err.message || 'Unknown error'}`);
          setIsValid(false);
          if (onFileChange) onFileChange(null);
        }
      } else {
        toast.error(`Invalid file type. Accepted types: ${acceptedTypes.join(", ")}`);
        if (onFileChange) onFileChange(null);
      }
    } else {
      setIsValid(null);
      if (onFileChange) onFileChange(null);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const clearFile = () => {
    setFile(null);
    setIsValid(null);
    if (onFileChange) onFileChange(null);
  };

  // Handle empty selection for feed
  const handleSelectFeed = (feedId: string) => {
    console.log("Feed selected:", feedId);
    // This would normally do something with the selected feed
  };

  return (
    <div className={`mb-6 ${className}`}>
      <div className="flex justify-between items-center mb-2">
        <label htmlFor={id} className="block text-sm font-medium">
          {label}
        </label>
        
        {showFeedButton && (
          <ChooseFromFeedButton 
            onSelectFeed={handleSelectFeed}
          />
        )}
      </div>

      {!file ? (
        <div
          className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-colors ${
            isDragging
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 hover:border-gray-400"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => document.getElementById(id)?.click()}
        >
          <Upload className="w-12 h-12 text-gray-400 mb-2" />
          <p className="text-sm text-gray-600 mb-1">
            Drag and drop your file here, or click to browse
          </p>
          <p className="text-xs text-gray-500">
            Supported formats: {acceptedTypes.join(", ")}
          </p>
          <input
            type="file"
            id={id}
            className="hidden"
            accept={acceptedTypes.join(",")}
            onChange={handleFileChange}
          />
        </div>
      ) : (
        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                  isValid === true
                    ? "bg-green-100 text-green-600"
                    : isValid === false
                    ? "bg-red-100 text-red-600"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {isValid === true ? (
                  <Check className="w-5 h-5" />
                ) : isValid === false ? (
                  <X className="w-5 h-5" />
                ) : (
                  <FileInput className="w-5 h-5" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium truncate max-w-[200px]">
                  {file.name}
                </p>
                <p className="text-xs text-gray-500">
                  {(file.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                clearFile();
              }}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Optional display of required columns if provided */}
      {requiredColumns && requiredColumns.length > 0 && (
        <div className="mt-2">
          <p className="text-xs text-gray-500">
            Required columns: {requiredColumns.join(", ")}
          </p>
        </div>
      )}
      
      {/* Optional template download link */}
      {downloadTemplateLink && (
        <div className="mt-2 text-center">
          <a 
            href={downloadTemplateLink} 
            className="text-xs text-blue-600 hover:underline"
            target="_blank" 
            rel="noopener noreferrer"
          >
            Download template
          </a>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
