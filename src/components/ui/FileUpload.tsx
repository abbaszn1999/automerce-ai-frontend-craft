import React, { useState } from "react";
import { Upload, Check, X, FileInput, ArrowDown } from "lucide-react";
import { validateFile } from "../../utils/utils";
import ChooseFromFeedButton from "@/components/common/ChooseFromFeedButton";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import * as XLSX from 'xlsx';

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
  onColumnMappingComplete?: (columnMapping: Record<string, string>) => void;
  foundationColumns?: string[];
  onColumnsExtracted?: (columns: string[]) => void;
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
  showFeedListOption = true,
  onSelectFeed = () => {},
  onColumnMappingComplete,
  foundationColumns,
  onColumnsExtracted
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"pending" | "uploaded" | "error" | "mapping">("pending");
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
      
      // Always try to extract columns
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
    } else if (selectedFile) {
      setStatus("error");
      setFile(null);
      onFileChange(null);
      toast.error(`Invalid file type. Please upload ${acceptedTypes.join(", ")}`);
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

  const handleSelectFeed = (feedId: string) => {
    if (onSelectFeed) {
      onSelectFeed(feedId);
    }
  };

  const handleColumnMappingChange = (sourceColumn: string, targetColumn: string) => {
    setColumnMapping(prev => ({
      ...prev,
      [sourceColumn]: targetColumn
    }));
  };

  const handleColumnMappingComplete = () => {
    // Check if all required columns are mapped
    if (foundationColumns) {
      const requiredMapped = foundationColumns
        .filter(col => col.endsWith('*'))
        .map(col => col.replace('*', ''))
        .every(col => 
          Object.values(columnMapping).includes(col)
        );
      
      if (!requiredMapped) {
        toast.error("Not all required columns have been mapped");
        return;
      }
    }
    
    if (onColumnMappingComplete) {
      onColumnMappingComplete(columnMapping);
    }
    setStatus("uploaded");
    setShowColumnMapping(false);
  };

  // Helper function to check if a column is required
  const isRequired = (column: string) => {
    return foundationColumns?.some(col => col === column || col === `${column}*`);
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
                    {sampleColumns.map((col, index) => (
                      <option key={index} value={col}>{col}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          ) : showColumnMapping ? (
            <div className="w-full">
              <h3 className="font-medium mb-4">Map Your Sheet Columns</h3>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {sampleColumns.length > 0 ? (
                  sampleColumns.map((sourceColumn, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <div className="w-1/3 p-2 bg-gray-100 rounded">
                        <span className="text-sm font-medium">{sourceColumn}</span>
                      </div>
                      <ArrowDown className="text-gray-400" />
                      <select
                        className="w-1/3 p-2 border rounded"
                        value={columnMapping[sourceColumn] || ""}
                        onChange={(e) => handleColumnMappingChange(sourceColumn, e.target.value)}
                      >
                        <option value="">-- Select target column --</option>
                        {foundationColumns?.map((col) => {
                          const cleanCol = col.endsWith('*') ? col.replace('*', '') : col;
                          return (
                            <option key={col} value={cleanCol}>
                              {cleanCol}{col.endsWith('*') ? '*' : ''}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    No columns found in the uploaded file.
                  </div>
                )}
              </div>
              <div className="flex justify-end mt-4 gap-2">
                <Button variant="outline" onClick={handleRemoveFile}>
                  Cancel
                </Button>
                <Button onClick={handleColumnMappingComplete}>
                  Complete Mapping
                </Button>
              </div>
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
                accept={acceptedTypes.join(",")}
              />
              <p className="mt-2 text-xs text-gray-500">
                {acceptedTypes.join(", ")} files up to 10MB
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
