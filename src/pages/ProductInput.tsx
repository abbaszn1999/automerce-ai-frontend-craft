
import React, { useState } from 'react';
import ProductInputSheet from '@/components/product/ProductInputSheet';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

const ProductInput: React.FC = () => {
  const [processedData, setProcessedData] = useState<any[] | null>(null);
  const [savedRunId, setSavedRunId] = useState<string | null>(null);
  const [columnMapping, setColumnMapping] = useState<any | null>(null);
  const navigate = useNavigate();
  
  // Normally, this would come from a route param or context
  // For demo purposes, we're using a hardcoded project ID
  const projectId = "ae-demo-project-id"; // Replace with actual project ID in a real app

  // Define required columns with display names - all are required
  const requiredColumns = [
    { key: "product_id", display: "Product ID", required: true },
    { key: "product_title", display: "Product Title", required: true },
    { key: "product_url", display: "Product URL", required: true },
    { key: "product_image_url", display: "Product Image URL", required: true },
    { key: "product_description", display: "Product Description", required: true }
  ];

  const handleProcessComplete = (data: any[], mapping: any) => {
    setProcessedData(data);
    setColumnMapping(mapping);
    toast.success(`Processed ${data.length} products successfully`);
    // In a real application, you would save this data to context or send it to the server
    console.log("Processed data:", data);
    console.log("Column mapping:", mapping);
  };

  const handleSaveComplete = (runId: string) => {
    setSavedRunId(runId);
    toast.success(`Data saved with run ID: ${runId}`);
    console.log("Data saved with run ID:", runId);
  };

  const handleGoToAttributeExtraction = () => {
    if (!savedRunId) {
      toast.error("Please save the data to the database first");
      return;
    }
    
    // In a real application, you would navigate to the attribute extraction page with the run ID
    toast.info(`Navigating to attribute extraction with run ID: ${savedRunId}`);
    // navigate(`/attribute-extraction/${savedRunId}`);
  };

  // Generate mapped data for preview display (using required field names)
  const getMappedDataForDisplay = () => {
    if (!processedData || !columnMapping) return [];
    
    return processedData.map(row => {
      const mappedRow: Record<string, any> = {};
      
      // Map each required column to the corresponding source column
      requiredColumns.forEach(col => {
        const sourceColumn = columnMapping[col.key];
        mappedRow[col.key] = sourceColumn && row[sourceColumn] ? row[sourceColumn] : '';
      });
      
      return mappedRow;
    });
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Product Data Input</h1>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/')}
          className="flex items-center gap-1"
        >
          <ArrowLeft size={16} />
          <span>Back to Home</span>
        </Button>
      </div>

      <div className="mb-6 bg-blue-50 border-l-4 border-blue-500 p-4">
        <p className="text-blue-700">
          Upload your product data sheet. The system will guide you through mapping your columns to our required structure.
        </p>
      </div>

      <ProductInputSheet 
        onProcessComplete={handleProcessComplete} 
        onSaveComplete={handleSaveComplete}
        projectId={projectId}
      />
      
      {processedData && processedData.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Preview of Processed Data</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  {requiredColumns.map((col, index) => (
                    <th key={index} className="border p-2 text-left">
                      {col.display}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {getMappedDataForDisplay().map((row, rowIndex) => (
                  <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    {requiredColumns.map((col, colIndex) => (
                      <td key={colIndex} className="border p-2">{String(row[col.key] || '')}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="flex justify-end mt-6">
            <Button 
              onClick={handleGoToAttributeExtraction}
              disabled={!savedRunId}
              className="flex items-center gap-2"
            >
              <span>Proceed to Attribute Extraction</span>
              <ArrowRight size={16} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductInput;
