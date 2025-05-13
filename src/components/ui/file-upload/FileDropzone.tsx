
import React, { useState, useRef } from "react";
import { Upload, FileSpreadsheet, FileImage, FileText } from "lucide-react";
import ChooseFromFeedButton from "@/components/common/ChooseFromFeedButton";
import * as XLSX from 'xlsx';

interface FileDropzoneProps {
  id: string;
  acceptedTypes: string[];
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  showFeedListOption?: boolean;
  onSelectFeed?: (feedId: string) => void;
  selectedFile?: File | null;
}

const FileDropzone: React.FC<FileDropzoneProps> = ({
  id,
  acceptedTypes,
  onFileChange,
  showFeedListOption = true,
  onSelectFeed,
  selectedFile
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<any[] | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Generate preview when a file is selected
  React.useEffect(() => {
    if (!selectedFile) {
      setPreview(null);
      setPreviewData(null);
      return;
    }

    // Handle preview generation based on file type
    if (selectedFile.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
      setPreviewData(null);
    } else if (['.csv', '.xlsx', '.xls'].some(ext => 
      selectedFile.name.toLowerCase().endsWith(ext))) {
      // Preview spreadsheet data
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          
          // Get the first worksheet
          const worksheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[worksheetName];
          
          // Convert to JSON (limit to first 5 rows for preview)
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          setPreviewData(jsonData.slice(0, 6)); // Header + 5 rows of data
        } catch (error) {
          console.error("Error reading spreadsheet:", error);
        }
      };
      reader.readAsArrayBuffer(selectedFile);
      setPreview(null);
    } else {
      // For other file types
      setPreview(null);
      setPreviewData(null);
    }
  }, [selectedFile]);

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

  const renderFileIcon = () => {
    if (selectedFile) {
      if (selectedFile.type.startsWith('image/')) {
        return <FileImage className="h-8 w-8 text-blue-500" />;
      } else if (['.csv', '.xlsx', '.xls'].some(ext => 
        selectedFile.name.toLowerCase().endsWith(ext))) {
        return <FileSpreadsheet className="h-8 w-8 text-green-500" />;
      } else {
        return <FileText className="h-8 w-8 text-gray-500" />;
      }
    }
    return <Upload className="h-8 w-8 text-gray-400" />;
  };

  const renderPreview = () => {
    if (!selectedFile) return null;

    return (
      <div className="mt-4 w-full">
        <p className="text-sm font-medium text-gray-700 mb-2">File Preview</p>
        
        {preview && (
          <div className="rounded-md overflow-hidden border border-gray-200 max-h-36">
            <img 
              src={preview} 
              alt="File preview" 
              className="object-contain max-h-36 w-full" 
            />
          </div>
        )}
        
        {previewData && (
          <div className="overflow-x-auto border rounded-md border-gray-200">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                {previewData.length > 0 && (
                  <tr>
                    {previewData[0].map((header: any, index: number) => (
                      <th 
                        key={index} 
                        className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {header || `Column ${index + 1}`}
                      </th>
                    ))}
                  </tr>
                )}
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {previewData.slice(1).map((row: any[], rowIndex: number) => (
                  <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    {row.map((cell: any, cellIndex: number) => (
                      <td key={cellIndex} className="px-3 py-2 whitespace-nowrap text-xs">
                        {String(cell || '')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {previewData.length > 6 && (
              <div className="text-xs text-center py-1 text-gray-500 bg-gray-50 border-t border-gray-200">
                {selectedFile.name.split('.').pop()?.toUpperCase()} file contains {previewData.length - 1} rows (showing 5)
              </div>
            )}
          </div>
        )}
        
        {!preview && !previewData && (
          <div className="text-center py-4 border rounded-md border-gray-200">
            <p className="text-sm text-gray-500">
              No preview available for this file type
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full">
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
        {renderFileIcon()}
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
      </div>

      {renderPreview()}

      {showFeedListOption && onSelectFeed && !selectedFile && (
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
