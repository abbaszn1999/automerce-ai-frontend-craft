
import React, { useState, useEffect } from 'react';
import FileUpload from "@/components/ui/FileUpload";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { ArrowRight, Download } from "lucide-react";
import SaveToFeedButton from '../common/SaveToFeedButton';
import ColumnMapping from './ColumnMapping';
import MappingSummary from './MappingSummary';
import { 
  ColumnMapping as ColumnMappingType,
  ProductData, 
  requiredProductColumns, 
  processProductData,
  downloadProductTemplate
} from './productUtils';

interface ProductInputSheetProps {
  onProcessComplete?: (data: ProductData[]) => void;
}

const ProductInputSheet: React.FC<ProductInputSheetProps> = ({ onProcessComplete }) => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({
    product_id: '',
    product_title: '',
    product_url: '',
    product_image_url: '',
    product_description: ''
  });
  const [isReady, setIsReady] = useState<boolean>(false);
  const [sourceColumns, setSourceColumns] = useState<string[]>([]);
  const [processedData, setProcessedData] = useState<ProductData[] | null>(null);
  
  // Check if all required columns are mapped
  const areAllRequiredColumnsMapped = () => {
    return Object.values(columnMapping).every(value => value !== '');
  };

  useEffect(() => {
    // Set isReady state based on whether all required columns are mapped
    setIsReady(areAllRequiredColumnsMapped());
  }, [columnMapping]);

  const handleFileChange = (file: File | null) => {
    console.log("File changed:", file?.name);
    setUploadedFile(file);
    setIsReady(false);
    setProcessedData(null);
    
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

  const handleColumnMappingChange = (requiredColumn: string, sourceColumn: string) => {
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
      const processedData = await processProductData(uploadedFile, columnMapping);
      setProcessedData(processedData);
      
      if (onProcessComplete) {
        onProcessComplete(processedData);
      }
      
      toast.success("Product data processed successfully");
    } catch (error) {
      console.error("Error processing file:", error);
      toast.error("Failed to process product data");
    }
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
              {requiredProductColumns.map((col) => (
                <li key={col.key}>{col.display}{col.required ? "*" : ""}</li>
              ))}
            </ul>
          </div>

          <FileUpload
            id="product-sheet-upload"
            acceptedTypes={[".csv", ".xlsx", ".xls"]}
            label="Upload Product Sheet"
            onFileChange={handleFileChange}
            onColumnsExtracted={handleColumnsExtracted}
          />

          {/* Column mapping section */}
          <ColumnMapping 
            requiredColumns={requiredProductColumns}
            columnMapping={columnMapping}
            sourceColumns={sourceColumns}
            onColumnMappingChange={handleColumnMappingChange}
          />

          <div className="flex justify-between mt-6">
            <Button 
              variant="outline" 
              onClick={downloadProductTemplate}
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
      
      <MappingSummary 
        requiredColumns={requiredProductColumns} 
        columnMapping={columnMapping}
        isReady={isReady}
      />

      {processedData && processedData.length > 0 && (
        <div className="mt-4">
          <div className="flex justify-end">
            <SaveToFeedButton 
              data={processedData} 
              source="product" 
              feedType="product" 
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductInputSheet;
