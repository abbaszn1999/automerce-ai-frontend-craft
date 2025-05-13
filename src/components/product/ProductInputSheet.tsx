
import React, { useState, useEffect } from 'react';
import FileUpload from "@/components/ui/FileUpload";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { ArrowRight, Download } from "lucide-react";
import { useAttributeExtractionService, ColumnMapping as ServiceColumnMapping } from '@/hooks/api/useAttributeExtractionService';
import ColumnMappingSection from './ColumnMappingSection';
import MappingSummary from './MappingSummary';
import SaveProgressCard from './SaveProgressCard';
import { processFileData, downloadTemplateExcel, extractColumnsFromFile } from './utils/dataProcessingUtils';

interface ProductInputSheetProps {
  onProcessComplete?: (data: any[], mapping: any) => void;
  onSaveComplete?: (runId: string) => void;
  projectId?: string;
}

// Use the ColumnMapping type from the service
type ColumnMapping = ServiceColumnMapping;

const ProductInputSheet: React.FC<ProductInputSheetProps> = ({ 
  onProcessComplete, 
  onSaveComplete, 
  projectId 
}) => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [columnMapping, setColumnMapping] = useState<ColumnMapping>({
    product_id: '',
    product_title: '',
    product_url: '',
    product_image_url: '',
    product_description: ''
  });
  const [isReady, setIsReady] = useState<boolean>(false);
  const [sourceColumns, setSourceColumns] = useState<string[]>([]);
  const [processedData, setProcessedData] = useState<any[] | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [saveProgress, setSaveProgress] = useState<{processed: number, total: number} | null>(null);
  const [extractionRunId, setExtractionRunId] = useState<string | null>(null);
  
  // Use the attribute extraction service
  const { 
    createExtractionRun, 
    saveProductData, 
    isLoading: isServiceLoading, 
    error: serviceError 
  } = useAttributeExtractionService();
  
  // Check if all required columns are mapped
  const areAllRequiredColumnsMapped = () => {
    return Object.values(columnMapping).every(value => value !== '');
  };

  useEffect(() => {
    // Set isReady state based on whether all required columns are mapped
    setIsReady(areAllRequiredColumnsMapped());
  }, [columnMapping]);

  // Reset saving state if file changes
  useEffect(() => {
    if (uploadedFile) {
      setIsSaved(false);
      setExtractionRunId(null);
      setSaveProgress(null);
    }
  }, [uploadedFile]);

  // Debug logging for projectId and processed data
  useEffect(() => {
    console.log("ProjectId provided:", projectId);
    console.log("Processed data available:", processedData ? processedData.length : 0);
  }, [projectId, processedData]);

  const handleFileChange = (file: File | null) => {
    console.log("File changed:", file?.name);
    setUploadedFile(file);
    setIsReady(false);
    setProcessedData(null);
    setIsSaved(false);
    setExtractionRunId(null);
    
    // Reset columns and mapping when file changes
    if (!file) {
      setSourceColumns([]);
      setColumnMapping({
        product_id: '',
        product_title: '',
        product_url: '',
        product_image_url: '',
        product_description: ''
      });
    }
  };

  const handleColumnsExtracted = (columns: string[]) => {
    console.log("Extracted columns:", columns);
    setSourceColumns(columns);
  };

  const handleColumnMappingChange = (requiredColumn: keyof ColumnMapping, sourceColumn: string) => {
    console.log(`Mapping ${requiredColumn} to ${sourceColumn}`);
    setColumnMapping(prev => ({
      ...prev,
      [requiredColumn]: sourceColumn
    }));
  };

  const handleProcess = async () => {
    if (!uploadedFile || !isReady) {
      toast.error("Please upload a file and complete column mapping first");
      return;
    }

    toast.info("Processing product data...");

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const processedData = processFileData(
            e.target?.result as ArrayBuffer, 
            columnMapping
          );
          
          setProcessedData(processedData);

          if (onProcessComplete) {
            onProcessComplete(processedData, columnMapping);
          }
          
          toast.success("Product data processed successfully");
        } catch (error) {
          console.error("Error processing data:", error);
          toast.error("Failed to process product data");
        }
      };
      
      reader.onerror = () => {
        toast.error("Failed to read file");
      };
      
      reader.readAsArrayBuffer(uploadedFile);
    } catch (error) {
      console.error("Error processing file:", error);
      toast.error("Failed to process product data");
    }
  };

  const handleSaveToDatabase = async () => {
    if (!processedData || !uploadedFile || !projectId) {
      toast.error("Please process your data first");
      console.error("Cannot save: processedData:", processedData ? "yes" : "no", 
                    "uploadedFile:", uploadedFile ? "yes" : "no", 
                    "projectId:", projectId);
      return;
    }

    setIsSaving(true);
    setSaveProgress({ processed: 0, total: processedData.length });

    try {
      // Create an extraction run
      const extractionRun = await createExtractionRun(
        projectId,
        uploadedFile.name,
        columnMapping
      );

      setExtractionRunId(extractionRun);

      // Save the product data
      await saveProductData(
        extractionRun,
        projectId,
        processedData,
        (processed, total) => {
          // Update progress
          setSaveProgress({ processed, total });
        }
      );

      toast.success("Data saved to database successfully");
      setIsSaved(true);
      
      if (onSaveComplete) {
        onSaveComplete(extractionRun);
      }
    } catch (error) {
      console.error("Error saving data to database:", error);
      toast.error(typeof error === 'string' ? error : "Failed to save data to database");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownloadTemplate = () => {
    downloadTemplateExcel();
    toast.success("Template downloaded");
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Product Input Sheet</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-600 mb-4">
            <p>Upload your product data sheet containing the following required columns:</p>
            <ul className="list-disc pl-5 mt-2">
              <li>Product ID*</li>
              <li>Product Title*</li>
              <li>Product URL*</li>
              <li>Product Image URL*</li>
              <li>Product Description*</li>
            </ul>
          </div>

          <FileUpload
            id="product-sheet-upload"
            acceptedTypes={[".csv", ".xlsx", ".xls"]}
            label="Upload Product Sheet"
            onFileChange={handleFileChange}
            onColumnsExtracted={handleColumnsExtracted}
          />

          <ColumnMappingSection 
            columnMapping={columnMapping}
            sourceColumns={sourceColumns}
            onColumnMappingChange={handleColumnMappingChange}
          />

          <div className="flex justify-between mt-6">
            <Button 
              variant="outline" 
              onClick={handleDownloadTemplate}
              className="flex items-center gap-1"
            >
              <Download size={16} />
              <span>Download Template</span>
            </Button>
            
            <Button 
              onClick={handleProcess}
              disabled={!isReady || !uploadedFile}
              className="flex items-center gap-1"
            >
              <span>Process Sheet</span>
              <ArrowRight size={16} />
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {isReady && (
        <MappingSummary columnMapping={columnMapping} />
      )}

      {/* Save to Database Button and Progress */}
      {processedData && processedData.length > 0 && (
        <SaveProgressCard
          isSaving={isSaving}
          isSaved={isSaved}
          saveProgress={saveProgress}
          onSaveToDatabase={handleSaveToDatabase}
          projectId={projectId}
          processedData={processedData}
        />
      )}
    </div>
  );
};

export default ProductInputSheet;
