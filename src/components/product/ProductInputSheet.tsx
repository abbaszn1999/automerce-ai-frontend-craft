
import React, { useState, useEffect } from 'react';
import FileUpload from "@/components/ui/FileUpload";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { ArrowRight, Download, Save, Loader2 } from "lucide-react";
import * as XLSX from 'xlsx';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import { useAttributeExtractionService, ColumnMapping as ServiceColumnMapping } from '@/hooks/api/useAttributeExtractionService';

interface ProductInputSheetProps {
  onProcessComplete?: (data: any[], mapping: any) => void;
  onSaveComplete?: (runId: string) => void;
  projectId?: string;
}

// Use the ColumnMapping type from the service
type ColumnMapping = ServiceColumnMapping;

const ProductInputSheet: React.FC<ProductInputSheetProps> = ({ onProcessComplete, onSaveComplete, projectId }) => {
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
  
  // Define required columns with display names - all columns are required
  const requiredColumns = [
    { key: "product_id", display: "Product ID", required: true },
    { key: "product_title", display: "Product Title", required: true },
    { key: "product_url", display: "Product URL", required: true },
    { key: "product_image_url", display: "Product Image URL", required: true },
    { key: "product_description", display: "Product Description", required: true }
  ];
  
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
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Get the first worksheet
        const worksheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[worksheetName];
        
        // Convert to JSON
        const rawData = XLSX.utils.sheet_to_json(worksheet) as any[];
        
        // Map the data according to the column mapping
        const processedData = rawData.map(row => {
          const processedRow: Record<string, any> = {};
          
          // Map each required column to the corresponding source column
          Object.entries(columnMapping).forEach(([required, source]) => {
            if (source && source in row) {
              processedRow[required] = row[source];
            } else {
              processedRow[required] = ''; // Set empty string for unmapped columns
            }
          });
          
          return processedRow;
        });

        setProcessedData(processedData);

        if (onProcessComplete) {
          onProcessComplete(processedData, columnMapping);
        }
        
        toast.success("Product data processed successfully");
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

  // Create a download template function
  const handleDownloadTemplate = () => {
    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    
    // Create sample data using our required columns
    const sampleData = [
      {
        'Product ID': 'PROD001',
        'Product Title': 'Example Product 1',
        'Product URL': 'https://example.com/product1',
        'Product Image URL': 'https://example.com/images/product1.jpg',
        'Product Description': 'This is a sample product description.'
      },
      {
        'Product ID': 'PROD002',
        'Product Title': 'Example Product 2',
        'Product URL': 'https://example.com/product2',
        'Product Image URL': 'https://example.com/images/product2.jpg',
        'Product Description': 'Another sample product description.'
      }
    ];
    
    // Create the worksheet with sample data
    const ws = XLSX.utils.json_to_sheet(sampleData);
    
    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(wb, ws, "Products");
    
    // Generate xlsx file
    XLSX.writeFile(wb, "product_template.xlsx");
    
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
              {requiredColumns.map((col) => (
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
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-4">Column Mapping</h3>
            <p className="text-sm text-gray-600 mb-4">
              {sourceColumns.length > 0 
                ? "Match each required column to the corresponding column in your uploaded file:"
                : "Upload a file to map the columns from your sheet."}
            </p>
            
            <div className="space-y-4">
              {requiredColumns.map((col) => (
                <div key={col.key} className="flex items-center gap-4">
                  <div className="w-1/3">
                    <label className="block text-sm font-medium">{col.display}{col.required ? "*" : ""}</label>
                  </div>
                  <div className="w-2/3">
                    <Select 
                      value={columnMapping[col.key as keyof ColumnMapping] || ""} 
                      onValueChange={(value) => handleColumnMappingChange(col.key as keyof ColumnMapping, value)}
                      disabled={sourceColumns.length === 0}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={sourceColumns.length > 0 ? "-- Select column from your file --" : "Upload a file first"} />
                      </SelectTrigger>
                      <SelectContent>
                        {sourceColumns.map((sourceCol) => (
                          <SelectItem key={sourceCol} value={sourceCol}>{sourceCol}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">* Required fields</p>
          </div>

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
        <Card>
          <CardHeader>
            <CardTitle>Column Mapping Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="text-left p-2">Required Column</th>
                    <th className="text-left p-2">Your Sheet Column</th>
                  </tr>
                </thead>
                <tbody>
                  {requiredColumns.map((col) => (
                    <tr key={col.key} className="border-t">
                      <td className="p-2">{col.display}{col.required ? "*" : ""}</td>
                      <td className="p-2">{columnMapping[col.key as keyof ColumnMapping] || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Save to Database Button and Progress */}
      {processedData && processedData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Save to Database</span>
              {isSaved && <span className="text-sm text-green-600 font-normal">✓ Saved</span>}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Before proceeding to attribute extraction, you must first save the processed data to the database.
            </p>
            
            {saveProgress && (
              <div className="mb-4">
                <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-2 bg-blue-600 rounded-full transition-all duration-300" 
                    style={{ width: `${Math.round((saveProgress.processed / saveProgress.total) * 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1 text-right">
                  Saved {saveProgress.processed} of {saveProgress.total} records
                </p>
              </div>
            )}
            
            <div className="flex justify-center">
              <Button
                onClick={handleSaveToDatabase}
                disabled={isSaving || isSaved || !projectId || !processedData}
                className="flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    <span>Save Sheet to Database</span>
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProductInputSheet;
