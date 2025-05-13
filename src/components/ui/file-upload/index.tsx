
import React, { useState } from "react";
import * as XLSX from 'xlsx';
import { validateFile } from "@/utils/utils";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Download } from "lucide-react";
import { FileUploadProps, FileUploadStatus } from "./types";
import FileDropzone from "./FileDropzone";
import FileStatus from "./FileStatus";
import ColumnMappingForm from "./ColumnMappingForm";

const FileUpload: React.FC<FileUploadProps> = ({
  id,
  statusId,
  acceptedTypes,
  label,
  requiredColumns,
  onFileChange,
  downloadTemplateLink,
  mapColumn,
  showFeedListOption = true,
  onSelectFeed = () => {},
  onColumnMappingComplete,
  foundationColumns,
  onColumnsExtracted
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<FileUploadStatus>("pending");
  const [selectedColumn, setSelectedColumn] = useState<string>("");
  const [sampleColumns, setSampleColumns] = useState<string[]>([]);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
  const [showColumnMapping, setShowColumnMapping] = useState<boolean>(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    
    if (selectedFile && validateFile(selectedFile, acceptedTypes)) {
      setFile(selectedFile);
      setStatus("uploaded");
      onFileChange(selectedFile);
      
      // Reset previous mapping data when a new file is uploaded
      setSampleColumns([]);
      setColumnMapping({});
      
      // Extract columns from the file
      await extractColumnsFromFile(selectedFile);
    } else if (selectedFile) {
      setStatus("error");
      setFile(null);
      onFileChange(null);
      toast.error(`Invalid file type. Please upload ${acceptedTypes.join(", ")}`);
    }
  };

  const extractColumnsFromFile = async (selectedFile: File) => {
    try {
      setStatus("mapping");
      
      // Read the spreadsheet file to extract column headers
      const reader = new FileReader();
      reader.onload = async (e) => {
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
          console.log("Extracted columns from file:", extractedColumns);
          setSampleColumns(extractedColumns);
          
          // Notify parent component about the extracted columns
          if (onColumnsExtracted) {
            onColumnsExtracted(extractedColumns);
          }
          
          // Show column mapping if foundationColumns is provided
          setShowColumnMapping(!!foundationColumns?.length);
        } else {
          toast.error("No data found in the spreadsheet");
          setStatus("error");
        }
      };
      
      reader.onerror = () => {
        toast.error("Failed to read file");
        setStatus("error");
      };
      
      reader.readAsArrayBuffer(selectedFile);
    } catch (error) {
      console.error("Error reading spreadsheet:", error);
      toast.error("Failed to read columns from file");
      setStatus("error");
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setStatus("pending");
    setShowColumnMapping(false);
    setSampleColumns([]);
    setColumnMapping({});
    onFileChange(null);
    
    // Reset the file input
    const fileInput = document.getElementById(id) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const handleColumnMappingChange = (sourceColumn: string, targetColumn: string) => {
    setColumnMapping(prev => ({
      ...prev,
      [sourceColumn]: targetColumn
    }));
  };

  const handleColumnMappingComplete = () => {
    if (onColumnMappingComplete) {
      onColumnMappingComplete(columnMapping);
    }
    setStatus("uploaded");
    setShowColumnMapping(false);
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
                  {col}
                </span>
              ))}
            </div>
          </div>
        )}
        
        <div className="file-upload-area">
          {file && !showColumnMapping ? (
            <FileStatus file={file} status={status} onRemove={handleRemoveFile}>
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
                    {sampleColumns.map((col, index) => (
                      <option key={index} value={col}>{col}</option>
                    ))}
                  </select>
                </div>
              )}
            </FileStatus>
          ) : showColumnMapping ? (
            <ColumnMappingForm
              sourceColumns={sampleColumns}
              targetColumns={foundationColumns || []}
              columnMapping={columnMapping}
              onColumnMappingChange={handleColumnMappingChange}
              onComplete={handleColumnMappingComplete}
              onCancel={handleRemoveFile}
              requiredColumns={foundationColumns}
            />
          ) : (
            <FileDropzone
              id={id}
              acceptedTypes={acceptedTypes}
              onFileChange={handleFileChange}
              showFeedListOption={showFeedListOption}
              onSelectFeed={onSelectFeed}
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
