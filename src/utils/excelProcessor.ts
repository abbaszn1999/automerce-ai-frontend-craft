
// If this file exists, fix the XLSX import
import * as XLSX from 'xlsx';

// Function to read columns from XLSX file
export const getColumnsFromExcel = (file: File): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Get header row (first row)
        const headers: string[] = [];
        const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:Z1');
        
        for (let C = range.s.c; C <= range.e.c; ++C) {
          const cell = worksheet[XLSX.utils.encode_cell({ r: range.s.r, c: C })];
          if (cell && cell.t) {
            headers.push(cell.v.toString());
          }
        }
        
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

// Function to process XLSX file into JSON
export const processExcelFile = (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Convert sheet to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        resolve(jsonData);
      } catch (err) {
        console.error('Error processing Excel file:', err);
        reject(err);
      }
    };
    
    reader.onerror = (err) => {
      reject(err);
    };
    
    reader.readAsArrayBuffer(file);
  });
};

// Function to convert JSON data back to XLSX
export const convertJsonToExcel = (data: any[], fileName: string = 'download') => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
  
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
};
