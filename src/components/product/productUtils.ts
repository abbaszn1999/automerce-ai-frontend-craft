
import * as XLSX from 'xlsx';
import { toast } from "@/hooks/use-toast";

export interface ProductData {
  product_id: string;
  product_title: string;
  product_url: string;
  product_image_url: string;
  product_description: string;
  [key: string]: any;
}

export interface ColumnMapping {
  product_id: string;
  product_title: string;
  product_url: string;
  product_image_url: string;
  product_description: string;
}

// Define required columns with display names - all columns are required
export const requiredProductColumns = [
  { key: "product_id", display: "Product ID", required: true },
  { key: "product_title", display: "Product Title", required: true },
  { key: "product_url", display: "Product URL", required: true },
  { key: "product_image_url", display: "Product Image URL", required: true },
  { key: "product_description", display: "Product Description", required: true }
];

export const processProductData = async (
  file: File, 
  columnMapping: ColumnMapping
): Promise<ProductData[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
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
          
          return processedRow as ProductData;
        });
        
        resolve(processedData);
      } catch (error) {
        console.error("Error processing file:", error);
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };
    
    reader.readAsArrayBuffer(file);
  });
};

export const downloadProductTemplate = () => {
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
