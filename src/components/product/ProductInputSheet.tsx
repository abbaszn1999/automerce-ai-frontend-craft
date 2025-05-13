
import React, { useState } from 'react';
import FileUpload from "@/components/ui/FileUpload";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { ArrowRight, Download, FileInput } from "lucide-react";

interface ProductInputSheetProps {
  onProcessComplete?: (data: any[]) => void;
}

const ProductInputSheet: React.FC<ProductInputSheetProps> = ({ onProcessComplete }) => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
  const [isReady, setIsReady] = useState<boolean>(false);
  
  // Define foundation columns (your required structure)
  const foundationColumns = [
    "product_id", 
    "product_title", 
    "url", 
    "image_url", 
    "product_description"
  ];

  const handleFileChange = (file: File | null) => {
    setUploadedFile(file);
    setIsReady(false);
  };

  const handleColumnMappingComplete = (mapping: Record<string, string>) => {
    setColumnMapping(mapping);
    setIsReady(true);
    toast.success("Column mapping completed successfully");
  };

  const handleProcess = () => {
    if (!uploadedFile || !isReady) {
      toast.error("Please upload a file and complete column mapping first");
      return;
    }

    // In a real application, we would process the file here
    // For now, we'll simulate this with a timeout
    toast.info("Processing product data...");

    setTimeout(() => {
      // Simulate processing the file and create sample processed data
      const processedData = generateSampleProcessedData(columnMapping);
      
      if (onProcessComplete) {
        onProcessComplete(processedData);
      }
      
      toast.success("Product data processed successfully");
    }, 1500);
  };

  // Generate sample data based on column mapping
  const generateSampleProcessedData = (mapping: Record<string, string>) => {
    // Create a reverse mapping (from foundation column to source column)
    const reverseMapping: Record<string, string> = {};
    Object.entries(mapping).forEach(([source, target]) => {
      reverseMapping[target] = source;
    });

    // Generate 5 sample products
    return Array.from({ length: 5 }).map((_, idx) => {
      const product: Record<string, string> = {};
      
      foundationColumns.forEach(col => {
        const sourceCol = reverseMapping[col];
        if (sourceCol) {
          // Generate sample value based on column type
          switch (col) {
            case "product_id":
              product[col] = `PROD-${1000 + idx}`;
              break;
            case "product_title":
              product[col] = `Sample Product ${idx + 1}`;
              break;
            case "url":
              product[col] = `https://example.com/products/sample-${idx + 1}`;
              break;
            case "image_url":
              product[col] = `https://example.com/images/product-${idx + 1}.jpg`;
              break;
            case "product_description":
              product[col] = `This is a sample description for product ${idx + 1}. It contains details about the product features and specifications.`;
              break;
            default:
              product[col] = `Sample value for ${col}`;
          }
        }
      });
      
      return product;
    });
  };

  // Create a download template function
  const handleDownloadTemplate = () => {
    // In a real application, this would generate a CSV file
    // For now, we'll just show a toast
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
            downloadTemplateLink="#"
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
