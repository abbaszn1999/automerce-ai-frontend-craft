import React, { useState, useEffect } from 'react';
import FileUpload from "@/components/ui/FileUpload";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { ArrowRight, Download } from "lucide-react";
import * as XLSX from 'xlsx';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import SaveToFeedButton from '../common/SaveToFeedButton';

interface ProductInputSheetProps {
  onProcessComplete?: (data: any[]) => void;
}

interface ColumnMapping {
  product_id: string;
  product_title: string;
  product_url: string;
  product_image_url: string;
  product_description: string;
}

const ProductInputSheet: React.FC<ProductInputSheetProps> = ({ onProcessComplete }) => {
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
          onProcessComplete(processedData);
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
