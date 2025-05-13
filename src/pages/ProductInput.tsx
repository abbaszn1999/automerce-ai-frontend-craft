import React, { useState } from 'react';
import ProductInputSheet from '@/components/product/ProductInputSheet';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

const ProductInput: React.FC = () => {
  const [processedData, setProcessedData] = useState<any[] | null>(null);
  const navigate = useNavigate();

  const handleProcessComplete = (data: any[]) => {
    setProcessedData(data);
    toast.success(`Processed ${data.length} products successfully`);
    // In a real application, you would save this data to context or send it to the server
    console.log("Processed data:", data);
  };

  const handleGoToAttributeExtraction = () => {
    // In a real application, you would navigate to the attribute extraction page
    toast.info("Navigating to attribute extraction would happen here");
    // navigate('/attribute-extraction');
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

      <ProductInputSheet onProcessComplete={handleProcessComplete} />
      
      {processedData && processedData.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Preview of Processed Data</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  {Object.keys(processedData[0]).map((header, index) => (
                    <th key={index} className="border p-2 text-left">
                      {header.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {processedData.map((row, rowIndex) => (
                  <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    {Object.values(row).map((cell: any, cellIndex) => (
                      <td key={cellIndex} className="border p-2">{String(cell)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="flex justify-end mt-6">
            <Button onClick={handleGoToAttributeExtraction}>
              Proceed to Attribute Extraction
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductInput;
