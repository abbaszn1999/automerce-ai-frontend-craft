
import React, { useState, useEffect } from 'react';
import FileUpload from "@/components/ui/FileUpload";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { ArrowRight, Download, FileInput } from "lucide-react";
import * as XLSX from 'xlsx';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";

interface ProductInputSheetProps {
  onProcessComplete?: (data: any[]) => void;
}

const ProductInputSheet: React.FC<ProductInputSheetProps> = ({ onProcessComplete }) => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
  const [isReady, setIsReady] = useState<boolean>(false);
  const [sourceColumns, setSourceColumns] = useState<string[]>([]);
  
  // Define required columns
  const requiredColumns = [
    "product_id", 
    "product_title", 
    "url", 
    "image_url", 
    "product_description"
  ];

  // Display names for required columns
  const columnDisplayNames: Record<string, string> = {
    "product_id": "Product ID",
    "product_title": "Product Title",
    "url": "URL",
    "image_url": "Image URL",
    "product_description": "Product Description"
  };
  
  // Check if all required columns are mapped
  const areAllRequiredColumnsMapped = () => {
    return requiredColumns.every(col => columnMapping[col] && columnMapping[col].length > 0);
  };

  useEffect(() => {
    // Set isReady state based on whether all required columns are mapped
    setIsReady(areAllRequiredColumnsMapped());
  }, [columnMapping]);

  const handleFileChange = (file: File | null) => {
    console.log("File changed:", file?.name);
    setUploadedFile(file);
    setIsReady(false);
    
    // Reset columns and mapping when file changes
    if (!file) {
      setSourceColumns([]);
      setColumnMapping({});
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
        'URL': 'https://example.com/product1',
        'Image URL': 'https://example.com/images/product1.jpg',
        'Product Description': 'This is a sample product description.'
      },
      {
        'Product ID': 'PROD002',
        'Product Title': 'Example Product 2',
        'URL': 'https://example.com/product2',
        'Image URL': 'https://example.com/images/product2.jpg',
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
            <p>Upload your product data sheet containing the following information:</p>
            <ul className="list-disc pl-5 mt-2">
              {requiredColumns.map((col, index) => (
                <li key={index}>{columnDisplayNames[col]}</li>
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

          {sourceColumns.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-4">Column Mapping</h3>
              <p className="text-sm text-gray-600 mb-4">
                Match each required column to the corresponding column in your uploaded file:
              </p>
              
              <div className="space-y-4">
                {requiredColumns.map((requiredCol) => (
                  <div key={requiredCol} className="flex items-center gap-4">
                    <div className="w-1/3">
                      <label className="block text-sm font-medium">{columnDisplayNames[requiredCol]}</label>
                    </div>
                    <div className="w-2/3">
                      <Select 
                        value={columnMapping[requiredCol] || ""} 
                        onValueChange={(value) => handleColumnMappingChange(requiredCol, value)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select column from your file" />
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
            </div>
          )}

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
              disabled={!isReady}
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
                  {Object.entries(columnMapping).map(([required, source], index) => (
                    <tr key={index} className="border-t">
                      <td className="p-2">{columnDisplayNames[required]}</td>
                      <td className="p-2">{source}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProductInputSheet;
