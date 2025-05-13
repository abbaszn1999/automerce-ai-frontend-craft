
// Fix the XLSX import to use named exports instead of default export
import * as XLSX from 'xlsx';
import { useState } from 'react';

export const useFileProcessor = () => {
  const [columns, setColumns] = useState<string[]>([]);

  const extractColumnsFromFile = (file: File): Promise<string[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          
          // Get header row (first row)
          const headers = [];
          const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:Z1');
          
          for (let C = range.s.c; C <= range.e.c; ++C) {
            const cell = worksheet[XLSX.utils.encode_cell({ r: range.s.r, c: C })];
            if (cell && cell.t) {
              headers.push(cell.v);
            }
          }
          
          setColumns(headers);
          resolve(headers);
        } catch (err) {
          console.error('Error reading file:', err);
          reject(err);
        }
      };
      
      reader.onerror = (err) => {
        console.error('FileReader error:', err);
        reject(err);
      };
      
      reader.readAsArrayBuffer(file);
    });
  };

  return {
    columns,
    extractColumnsFromFile
  };
};

export default useFileProcessor;
