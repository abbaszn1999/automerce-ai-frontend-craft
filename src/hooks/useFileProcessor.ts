
import { useState } from 'react';
import XLSX from 'xlsx';

export const useFileProcessor = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Converts uploaded file data to JSON
   */
  const processFile = async (file: File): Promise<{ data: any[], fileName: string }> => {
    setIsProcessing(true);
    setError(null);
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      
      // Get the first worksheet
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      
      // Convert to JSON with header row
      const data = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
      
      // Extract headers from the first row
      const headers = data[0] as string[];
      
      // Map the rest of the rows to objects using headers
      const jsonData = data.slice(1).map((row: any) => {
        const obj: Record<string, any> = {};
        headers.forEach((header, index) => {
          if (header) { // Only add if header exists
            obj[header] = row[index];
          }
        });
        return obj;
      });
      
      return { data: jsonData, fileName: file.name };
    } catch (err) {
      console.error('Error processing file:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      throw new Error(`Failed to process file: ${errorMessage}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    processFile,
    isProcessing,
    error
  };
};
