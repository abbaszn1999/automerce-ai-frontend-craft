
import { useState } from 'react';
import { toast } from "@/components/ui/use-toast";
import * as XLSX from 'xlsx';
import { dataService } from '@/services/dataService';

export type ColumnMapping = {
  product_id: string;
  product_title: string;
  product_url: string;
  product_image_url: string;
  product_description: string;
  [key: string]: string;
};

export type ProductData = {
  product_id: string;
  product_title: string;
  product_url: string;
  product_image_url: string;
  product_description: string;
  [key: string]: any;
};

export type ExtractionRun = {
  id: string;
  projectId: string;
  fileName: string | null;
  columnMapping: ColumnMapping | null;
  status: string;
  totalProducts: number | null;
  processedProducts: number | null;
  createdAt: string | null;
  updatedAt: string | null;
};

export const useAttributeExtractionService = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createExtractionRun = async (
    projectId: string,
    fileName: string,
    columnMapping: ColumnMapping
  ): Promise<string> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const runId = await dataService.createExtractionRun(
        projectId,
        fileName,
        columnMapping
      );
      
      return runId;
    } catch (err: any) {
      setError(err.message);
      toast.error(`Error creating extraction run: ${err.message}`);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateExtractionRunStatus = async (
    runId: string, 
    status: string, 
    processedProducts?: number,
    totalProducts?: number
  ) => {
    try {
      await dataService.updateExtractionRunStatus(
        runId,
        status,
        processedProducts,
        totalProducts
      );
    } catch (err: any) {
      console.error('Error updating extraction run status:', err);
      toast.error(`Error updating extraction run: ${err.message}`);
    }
  };

  const saveProductData = async (
    runId: string,
    projectId: string,
    products: ProductData[],
    onProgress?: (processed: number, total: number) => void
  ) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const success = await dataService.saveProductData(
        runId,
        projectId,
        products,
        onProgress
      );
      
      if (success) {
        toast.success('Product data saved successfully');
      } else {
        throw new Error('Failed to save product data');
      }
      
      return success;
    } catch (err: any) {
      setError(err.message);
      toast.error(`Error saving product data: ${err.message}`);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const processExcelFile = async (
    file: File, 
    columnMapping: ColumnMapping
  ): Promise<ProductData[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          
          // Convert sheet to JSON
          const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet);
          
          // Map the columns based on user's mapping
          const products: ProductData[] = jsonData.map(row => {
            const product: any = {};
            
            // Map each required field
            for (const [key, sourceColumn] of Object.entries(columnMapping)) {
              if (!sourceColumn) {
                throw new Error(`Missing mapping for required field: ${key}`);
              }
              product[key] = row[sourceColumn] || '';
            }
            
            return product as ProductData;
          });
          
          // Validate required fields
          const invalidProducts = products.filter(p => 
            !p.product_id || 
            !p.product_title || 
            !p.product_url || 
            !p.product_image_url ||
            !p.product_description
          );
          
          if (invalidProducts.length > 0) {
            throw new Error(`${invalidProducts.length} products are missing required fields`);
          }
          
          resolve(products);
        } catch (err: any) {
          reject(err);
        }
      };
      
      reader.onerror = (err) => {
        reject(err);
      };
      
      reader.readAsArrayBuffer(file);
    });
  };

  const getExtractionRuns = async (projectId: string): Promise<ExtractionRun[]> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const runs = await dataService.getExtractionRuns(projectId);
      return runs;
    } catch (err: any) {
      setError(err.message);
      toast.error(`Error fetching extraction runs: ${err.message}`);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const getExtractionRunById = async (runId: string): Promise<ExtractionRun | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const run = await dataService.getExtractionRunById(runId);
      return run;
    } catch (err: any) {
      setError(err.message);
      toast.error(`Error fetching extraction run: ${err.message}`);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const getProductDataByRunId = async (runId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const products = await dataService.getProductDataByRunId(runId);
      return products;
    } catch (err: any) {
      setError(err.message);
      toast.error(`Error fetching product data: ${err.message}`);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    createExtractionRun,
    saveProductData,
    updateExtractionRunStatus,
    processExcelFile,
    getExtractionRuns,
    getExtractionRunById,
    getProductDataByRunId
  };
};
