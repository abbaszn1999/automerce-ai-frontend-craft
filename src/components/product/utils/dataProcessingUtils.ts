
import * as XLSX from 'xlsx';
import { ColumnMapping } from '@/hooks/api/useAttributeExtractionService';

// Create a download template function
export const createTemplateWorkbook = () => {
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
  
  return wb;
};

export const downloadTemplateExcel = () => {
  const wb = createTemplateWorkbook();
  XLSX.writeFile(wb, "product_template.xlsx");
};

export const processFileData = (fileData: ArrayBuffer, columnMapping: ColumnMapping): any[] => {
  const data = new Uint8Array(fileData);
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

  return processedData;
};

export const extractColumnsFromFile = (file: File): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Get the first worksheet
        const worksheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[worksheetName];
        
        // Convert to JSON to get the column headers
        const firstRow = XLSX.utils.sheet_to_json(worksheet, { header: 1 })[0] as string[];
        
        resolve(firstRow);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsArrayBuffer(file);
  });
};
