import React, { useState } from "react";
import { Upload, Check, X } from "lucide-react";
import { validateFile } from "../../utils/utils";
import ChooseFromFeedButton from "@/components/common/ChooseFromFeedButton";

interface FileUploadProps {
  id?: string;
  statusId?: string;
  acceptedTypes?: string[];
  acceptedFileTypes?: string[]; // Added to support the prop name used in AEInputTab
  label?: string;
  requiredColumns?: string[];
  onFileChange?: (file: File | null) => void;
  onChange?: (file: File) => Promise<void> | void; // Added to support the prop name used in AEInputTab
  downloadTemplateLink?: string;
  mapColumn?: boolean;
  showFeedListOption?: boolean;
  onSelectFeed?: (feedId: string) => void;
  maxSizeInMB?: number;
}

const FileUpload: React.FC<FileUploadProps> = ({
  id = "file-upload",
  statusId,
  acceptedTypes = [],
  acceptedFileTypes = [], // Added support
  label = "Upload File",
  requiredColumns,
  onFileChange,
  onChange, // Added support
  downloadTemplateLink,
  mapColumn,
  showFeedListOption = true,
  onSelectFeed = () => {},
  maxSizeInMB = 10
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"pending" | "uploaded" | "error">("pending");
  const [selectedColumn, setSelectedColumn] = useState<string>("");

  // Use either acceptedTypes or acceptedFileTypes
  const fileTypes = acceptedTypes.length > 0 ? acceptedTypes : acceptedFileTypes;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    
    if (selectedFile && validateFile(selectedFile, fileTypes, maxSizeInMB)) {
      setFile(selectedFile);
      setStatus("uploaded");
      
      // Call both callback props if they exist
      if (onFileChange) onFileChange(selectedFile);
      if (onChange) onChange(selectedFile);
    } else if (selectedFile) {
      setStatus("error");
      setFile(null);
      if (onFileChange) onFileChange(null);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setStatus("pending");
    if (onFileChange) onFileChange(null);
    
    // Reset the file input
    const fileInput = document.getElementById(id) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const handleSelectFeed = (feedId: string) => {
    if (onSelectFeed) {
      onSelectFeed(feedId);
    }
  };

  return (
    <div className="card">
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <div className="text-base font-medium">{label}</div>
          {statusId && (
            <div className={`status-indicator ${status === "uploaded" ? "status-uploaded" : "status-pending"}`} id={statusId}>
              {status === "uploaded" ? "Uploaded" : "Pending"}
            </div>
          )}
        </div>
        
        {requiredColumns && requiredColumns.length > 0 && (
          <div className="text-sm text-gray-500 mb-3">
            <p className="mb-1">Required Columns:</p>
            <div className="flex flex-wrap gap-1">
              {requiredColumns.map((col, index) => (
                <span key={index} className="px-2 py-0.5 bg-gray-100 rounded-full text-xs">
                  {col}{index === 0 && "*"}
                </span>
              ))}
            </div>
          </div>
        )}
        
        <div className="file-upload-area">
          {file ? (
            <div className="w-full">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Check className="h-5 w-5 text-green-500" />
                  <span className="text-sm font-medium">{file.name}</span>
                </div>
                <button 
                  type="button" 
                  onClick={handleRemoveFile}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              
              {mapColumn && (
                <div className="mt-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Map Product ID Column
                  </label>
                  <select 
                    className="mt-1 block w-full rounded-md border border-gray-300 py-2 pl-3 pr-10 text-base focus:border-primary focus:outline-none focus:ring-primary sm:text-sm"
                    value={selectedColumn}
                    onChange={(e) => setSelectedColumn(e.target.value)}
                  >
                    <option value="">Select column</option>
                    <option value="product_id">product_id</option>
                    <option value="id">id</option>
                    <option value="sku">sku</option>
                  </select>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <Upload className="h-8 w-8 text-gray-400 mb-2" />
              <label htmlFor={id} className="btn btn-outline cursor-pointer mb-4">
                Choose File
              </label>
              <input
                id={id}
                type="file"
                className="hidden"
                onChange={handleFileChange}
                accept={fileTypes.join(",")}
              />
              <p className="mt-2 text-xs text-gray-500">
                {fileTypes.join(", ")} files up to {maxSizeInMB}MB
              </p>

              {showFeedListOption && onSelectFeed && (
                <div className="mt-4 w-full">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-muted-foreground">Or</span>
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
          )}
        </div>
        
        {downloadTemplateLink && (
          <div className="text-center mt-2">
            <a 
              href={downloadTemplateLink} 
              className="text-xs text-primary hover:underline"
            >
              Download Template
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
