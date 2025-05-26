
import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ExtractionRun {
  id: string;
  project_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  total_products: number;
  processed_products: number;
  created_at: string;
  completed_at?: string;
  error_message?: string;
}

export interface ProductData {
  id: string;
  extraction_run_id: string;
  product_name: string;
  product_url?: string;
  image_url?: string;
  extracted_attributes: Record<string, any>;
  confidence_score: number;
  created_at: string;
}

export const useAttributeExtractionService = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createExtractionRun = async (projectId: string, totalProducts: number): Promise<string> => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('ae_extraction_runs')
        .insert({
          project_id: projectId,
          status: 'pending',
          total_products: totalProducts,
          processed_products: 0
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Extraction run created successfully');
      return data.id;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to create extraction run';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateExtractionRunStatus = async (
    runId: string, 
    status: ExtractionRun['status'], 
    processedProducts?: number,
    errorMessage?: string
  ) => {
    try {
      const updateData: any = { status };
      if (processedProducts !== undefined) {
        updateData.processed_products = processedProducts;
      }
      if (status === 'completed' || status === 'failed') {
        updateData.completed_at = new Date().toISOString();
      }
      if (errorMessage) {
        updateData.error_message = errorMessage;
      }

      const { error } = await supabase
        .from('ae_extraction_runs')
        .update(updateData)
        .eq('id', runId);

      if (error) throw error;

      toast.success('Extraction run updated successfully');
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update extraction run';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    }
  };

  const saveProductData = async (productData: Omit<ProductData, 'id' | 'created_at'>[]): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      const { error } = await supabase
        .from('ae_product_data')
        .insert(productData);

      if (error) throw error;

      toast.success('Product data saved successfully');
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to save product data';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const simulateProcessing = async (
    runId: string,
    products: any[],
    onProgress: (progress: number) => void,
    onLog: (log: string) => void
  ) => {
    try {
      setIsLoading(true);
      setError(null);

      await updateExtractionRunStatus(runId, 'processing');
      onLog('Starting attribute extraction...');

      for (let i = 0; i < products.length; i++) {
        const product = products[i];
        
        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock extracted attributes
        const extractedAttributes = {
          brand: `Mock Brand ${i + 1}`,
          category: 'Electronics',
          color: ['Black', 'White', 'Silver'][i % 3],
          material: 'Plastic',
          features: ['Feature 1', 'Feature 2']
        };

        // Save product data
        await saveProductData([{
          extraction_run_id: runId,
          product_name: product.name || `Product ${i + 1}`,
          product_url: product.url,
          image_url: product.image_url,
          extracted_attributes: extractedAttributes,
          confidence_score: 0.85 + (Math.random() * 0.15)
        }]);

        const progress = ((i + 1) / products.length) * 100;
        onProgress(progress);
        onLog(`Processed product ${i + 1}/${products.length}: ${product.name || `Product ${i + 1}`}`);

        // Update run progress
        await updateExtractionRunStatus(runId, 'processing', i + 1);
      }

      await updateExtractionRunStatus(runId, 'completed', products.length);
      onLog('Extraction completed successfully!');
      toast.success('Attribute extraction completed');
      
    } catch (err: any) {
      const errorMessage = err.message || 'Processing failed';
      setError(errorMessage);
      await updateExtractionRunStatus(runId, 'failed', undefined, errorMessage);
      onLog(`Error: ${errorMessage}`);
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const getExtractionRuns = async (projectId: string): Promise<ExtractionRun[]> => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('ae_extraction_runs')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch extraction runs';
      setError(errorMessage);
      toast.error(errorMessage);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const getExtractionRunById = async (runId: string): Promise<ExtractionRun | null> => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('ae_extraction_runs')
        .select('*')
        .eq('id', runId)
        .single();

      if (error) throw error;

      return data;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch extraction run';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const getProductDataByRunId = async (runId: string): Promise<ProductData[]> => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('ae_product_data')
        .select('*')
        .eq('extraction_run_id', runId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      return data || [];
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch product data';
      setError(errorMessage);
      toast.error(errorMessage);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    createExtractionRun,
    updateExtractionRunStatus,
    saveProductData,
    simulateProcessing,
    getExtractionRuns,
    getExtractionRunById,
    getProductDataByRunId
  };
};
