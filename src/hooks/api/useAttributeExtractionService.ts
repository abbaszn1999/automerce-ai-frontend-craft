
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/hooks/use-toast";
import * as XLSX from 'xlsx';

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
  project_id: string;
  file_name: string | null;
  column_mapping: ColumnMapping | null;
  status: string;
  total_products: number | null;
  processed_products: number | null;
  created_at: string | null;
  updated_at: string | null;
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
      const { data, error: insertError } = await supabase
        .from('ae_extraction_runs')
        .insert({
          project_id: projectId,
          file_name: fileName,
          column_mapping: columnMapping,
          status: 'pending'
        })
        .select()
        .single();

      if (insertError) {
        throw new Error(`Failed to create extraction run: ${insertError.message}`);
      }

      return data.id;
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
      const updateData: any = { status };
      
      if (processedProducts !== undefined) {
        updateData.processed_products = processedProducts;
      }
      
      if (totalProducts !== undefined) {
        updateData.total_products = totalProducts;
      }
      
      const { error: updateError } = await supabase
        .from('ae_extraction_runs')
        .update(updateData)
        .eq('id', runId);

      if (updateError) {
        throw new Error(`Failed to update extraction run: ${updateError.message}`);
      }
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
      // Update run with total products count
      await updateExtractionRunStatus(runId, 'processing', 0, products.length);
      
      // Process in batches of 100 to avoid payload size limitations
      const batchSize = 100;
      const totalProducts = products.length;
      let processedCount = 0;
      
      for (let i = 0; i < totalProducts; i += batchSize) {
        const batch = products.slice(i, i + batchSize);
        
        // Transform the data to match our database schema
        const productsToInsert = batch.map(product => ({
          run_id: runId,
          project_id: projectId,
          product_id: product.product_id,
          product_title: product.product_title,
          product_url: product.product_url,
          product_image_url: product.product_image_url,
          product_description: product.product_description
        }));
        
        const { error: insertError } = await supabase
          .from('ae_product_data')
          .insert(productsToInsert);

        if (insertError) {
          throw new Error(`Failed to save product data (batch ${i}): ${insertError.message}`);
        }
        
        processedCount += batch.length;
        
        // Update progress
        if (onProgress) {
          onProgress(processedCount, totalProducts);
        }
        
        // Update the processed count in the run
        await updateExtractionRunStatus(runId, 'processing', processedCount);
      }
      
      // Mark run as complete when all products are processed
      await updateExtractionRunStatus(runId, 'completed', totalProducts, totalProducts);
      
      toast.success('Product data saved successfully');
      return true;
    } catch (err: any) {
      setError(err.message);
      // Mark run as failed
      await updateExtractionRunStatus(runId, 'failed');
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
      const { data, error } = await supabase
        .from('ae_extraction_runs')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch extraction runs: ${error.message}`);
      }

      return data as ExtractionRun[];
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
      const { data, error } = await supabase
        .from('ae_extraction_runs')
        .select('*')
        .eq('id', runId)
        .single();

      if (error) {
        throw new Error(`Failed to fetch extraction run: ${error.message}`);
      }

      return data as ExtractionRun;
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
      const { data, error } = await supabase
        .from('ae_product_data')
        .select('*')
        .eq('run_id', runId);

      if (error) {
        throw new Error(`Failed to fetch product data: ${error.message}`);
      }

      return data;
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
