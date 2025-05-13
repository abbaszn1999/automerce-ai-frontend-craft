
import React, { useState, useEffect } from "react";
import * as XLSX from 'xlsx';
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Download } from "lucide-react";
import FileDropzone from "./file-upload/FileDropzone";
import FileStatus from "./file-upload/FileStatus";

interface FileUploadProps {
  id: string;
  statusId?: string;
  acceptedTypes: string[];
  label: string;
  requiredColumns?: string[];
  onFileChange: (file: File | null) => void;
  downloadTemplateLink?: string;
  mapColumn?: boolean;
  showFeedListOption?: boolean;
  onSelectFeed?: (feedId: string) => void;
  onColumnsExtracted?: (columns: string[]) => void;
  maxFileSize?: number; // Max file size in MB
}

const FileUpload: React.FC<FileUploadProps> = ({
  id,
  statusId,
  acceptedTypes,
  label,
  requiredColumns,
  onFileChange,
  downloadTemplateLink,
  mapColumn,
  showFeedListOption,
  onSelectFeed,
  onColumnsExtracted,
  maxFileSize = 10
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"pending" | "uploading" | "uploaded" | "error">("pending");
  const [progress, setProgress] = useState<number>(0);

  // Simulate upload progress
  useEffect(() => {
    let progressTimer: NodeJS.Timeout;
    
    if (status === "uploading" && progress < 100) {
      progressTimer = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + (10 - prev / 10);
          if (newProgress >= 100) {
            clearInterval(progressTimer);
            return 100;
          }
          return newProgress;
        });
      }, 200);
    }
    
    return () => {
      if (progressTimer) clearInterval(progressTimer);
    };
  }, [status, progress]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    
    if (selectedFile) {
      // Basic file size validation
      if (selectedFile.size > maxFileSize * 1024 * 1024) {
        toast.error(`File is too large. Maximum size is ${maxFileSize}MB.`);
        setStatus("error");
        return;
      }
      
      // Check file extension
      const fileExtension = `.${selectedFile.name.split('.').pop()?.toLowerCase()}`;
      if (!acceptedTypes.includes(fileExtension)) {
        toast.error(`Invalid file type. Please upload ${acceptedTypes.join(", ")} files only.`);
        setStatus("error");
        return;
      }
      
      setFile(selectedFile);
      setStatus("uploading");
      setProgress(0);
      
      // Process the file to extract columns without deep analysis
      setTimeout(() => {
        extractColumnsFromFile(selectedFile);
      }, 1000); // Short delay for better UX
    }
  };

  const extractColumnsFromFile = async (selectedFile: File) => {
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          
          // Get the first worksheet
          const worksheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[worksheetName];
          
          // Convert to JSON to get headers
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          
          if (jsonData && jsonData.length > 0) {
            // Extract column headers from first row
            const extractedColumns = Object.keys(jsonData[0]);
            
            // Check if required columns are present
            if (requiredColumns && requiredColumns.length > 0) {
              const missingColumns = requiredColumns.filter(
                col => !extractedColumns.some(
                  extractedCol => extractedCol.toLowerCase() === col.toLowerCase()
                )
              );
              
              if (missingColumns.length > 0) {
                toast.error(`File is missing required columns: ${missingColumns.join(', ')}`);
                setStatus("error");
                onFileChange(null);
                return;
              }
            }
            
            // Notify parent component about the extracted columns
            if (onColumnsExtracted) {
              onColumnsExtracted(extractedColumns);
            }
            
            setStatus("uploaded");
            onFileChange(selectedFile);
          } else {
            toast.error("No data found in the spreadsheet");
            setStatus("error");
            onFileChange(null);
          }
        } catch (error) {
          console.error("Error extracting columns:", error);
          toast.error("Failed to read columns from file");
          setStatus("error");
          onFileChange(null);
        }
      };
      
      reader.onerror = () => {
        toast.error("Failed to read file");
        setStatus("error");
        onFileChange(null);
      };
      
      reader.readAsArrayBuffer(selectedFile);
    } catch (error) {
      console.error("Error reading spreadsheet:", error);
      toast.error("Failed to read file");
      setStatus("error");
      onFileChange(null);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setStatus("pending");
    setProgress(0);
    onFileChange(null);
    
    // Reset the file input
    const fileInput = document.getElementById(id) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const handleSelectFeed = () => {
    if (onSelectFeed) {
      onSelectFeed("feed-id"); // This would be replaced with actual feed selection logic
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
        
        <div className="file-upload-area border rounded-md p-4 bg-white">
          {file ? (
            <FileStatus 
              file={file} 
              status={status} 
              onRemove={handleRemoveFile} 
              progress={progress}
            />
          ) : (
            <FileDropzone
              id={id}
              acceptedTypes={acceptedTypes}
              onFileChange={handleFileChange}
              selectedFile={file}
            />
          )}
        </div>
        
        {downloadTemplateLink && (
          <div className="text-center mt-2">
            <a 
              href={downloadTemplateLink} 
              className="text-xs text-primary hover:underline flex items-center justify-center gap-1"
            >
              <Download className="h-3 w-3" />
              <span>Download Template</span>
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
