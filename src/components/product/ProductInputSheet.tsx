
import React, { useState, useEffect } from 'react';
import FileUpload from "@/components/ui/FileUpload";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { ArrowRight, Download, FileInput } from "lucide-react";
import * as XLSX from 'xlsx';

interface ProductInputSheetProps {
  onProcessComplete?: (data: any[]) => void;
}

const ProductInputSheet: React.FC<ProductInputSheetProps> = ({ onProcessComplete }) => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
  const [isReady, setIsReady] = useState<boolean>(false);
  const [sourceColumns, setSourceColumns] = useState<string[]>([]);
  
  // Define foundation columns (your required structure)
  const foundationColumns = [
    "product_id*", 
    "product_title*", 
    "url", 
    "image_url*", 
    "product_description"
  ];

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

  const handleColumnMappingComplete = (mapping: Record<string, string>) => {
    console.log("Column mapping completed:", mapping);
    setColumnMapping(mapping);
    setIsReady(true);
    toast.success("Column mapping completed successfully");
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
          
          // Map each source column to the target column
          Object.entries(columnMapping).forEach(([source, target]) => {
            if (source in row) {
              processedRow[target] = row[source];
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
    
    // Create headers for the template
    const requiredColumns = foundationColumns.map(col => col.replace('*', ''));
    
    // Create sample data
    const sampleData = [
      {
        'product_id': 'PROD001',
        'product_title': 'Example Product 1',
        'url': 'https://example.com/product1',
        'image_url': 'https://example.com/images/product1.jpg',
        'product_description': 'This is a sample product description.'
      },
      {
        'product_id': 'PROD002',
        'product_title': 'Example Product 2',
        'url': 'https://example.com/product2',
        'image_url': 'https://example.com/images/product2.jpg',
        'product_description': 'Another sample product description.'
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
              {foundationColumns.map((col, index) => (
                <li key={index}>{col}</li>
              ))}
            </ul>
          </div>

          <FileUpload
            id="product-sheet-upload"
            acceptedTypes={[".csv", ".xlsx", ".xls"]}
            label="Upload Product Sheet"
            onFileChange={handleFileChange}
            requiredColumns={foundationColumns}
            foundationColumns={foundationColumns}
            onColumnMappingComplete={handleColumnMappingComplete}
            onColumnsExtracted={handleColumnsExtracted}
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
              disabled={!isReady}
              className="flex items-center gap-1"
            >
              <span>Process Sheet</span>
              <ArrowRight size={16} />
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {isReady && sourceColumns.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Column Mapping Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="text-left p-2">Your Sheet Column</th>
                    <th className="text-left p-2">System Column</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(columnMapping).map(([source, target], index) => (
                    <tr key={index} className="border-t">
                      <td className="p-2">{source}</td>
                      <td className="p-2">{target}</td>
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
