
import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Json } from '@/integrations/supabase/types';

export type ProductColumnMapping = {
  [key: string]: string; // Maps source columns to required columns
};

export type ExtractionRunStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface ProductData {
  product_id: string;
  product_title: string;
  product_url: string;
  product_image_url: string;
  product_description: string;
  attributes?: Record<string, any>;
  processed?: boolean;
}

export interface ExtractionRun {
  id: string;
  project_id: string;
  status: ExtractionRunStatus;
  file_name?: string;
  column_mapping?: ProductColumnMapping;
  total_products: number;
  processed_products: number;
  created_at: string;
  updated_at: string;
}

export const useAttributeExtractionService = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  // Create a new extraction run
  const createExtractionRun = async (
    projectId: string, 
    fileName: string, 
    columnMapping: ProductColumnMapping
  ): Promise<string> => {
    const { data, error } = await supabase
      .from('ae_extraction_runs')
      .insert({
        project_id: projectId,
        status: 'pending',
        file_name: fileName,
        column_mapping: columnMapping,
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error creating extraction run:', error);
      throw new Error(`Failed to create extraction run: ${error.message}`);
    }

    return data.id;
  };

  // Process and save products to the database
  const saveProductsToDatabase = async (
    projectId: string,
    runId: string,
    products: ProductData[]
  ) => {
    setIsProcessing(true);
    setProgress(0);
    
    try {
      // Update run with total products count
      await supabase
        .from('ae_extraction_runs')
        .update({ 
          total_products: products.length,
          status: 'processing'
        })
        .eq('id', runId);

      // Process products in batches of 50 to avoid hitting limits
      const batchSize = 50;
      let processedCount = 0;

      for (let i = 0; i < products.length; i += batchSize) {
        const batch = products.slice(i, i + batchSize);
        
        // Prepare batch for insertion with project_id and run_id
        const productsToInsert = batch.map(product => ({
          ...product,
          project_id: projectId,
          run_id: runId,
        }));

        const { error } = await supabase
          .from('ae_product_data')
          .insert(productsToInsert);

        if (error) {
          console.error('Error inserting products:', error);
          throw new Error(`Failed to insert products: ${error.message}`);
        }

        // Update progress
        processedCount += batch.length;
        const newProgress = Math.round((processedCount / products.length) * 100);
        setProgress(newProgress);

        // Update run with processed products count
        await supabase
          .from('ae_extraction_runs')
          .update({ processed_products: processedCount })
          .eq('id', runId);
      }

      // Mark extraction run as completed
      await supabase
        .from('ae_extraction_runs')
        .update({ status: 'completed' })
        .eq('id', runId);

      return {
        success: true,
        message: `Successfully processed ${processedCount} products`,
        runId
      };
    } catch (error) {
      console.error('Error during product processing:', error);
      
      // Mark extraction run as failed
      await supabase
        .from('ae_extraction_runs')
        .update({ 
          status: 'failed',
          // Add error message if it's an Error object
          error_message: error instanceof Error ? error.message : 'Unknown error'
        })
        .eq('id', runId);
      
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  // Process uploaded data using the column mapping
  const processUploadedData = async (
    projectId: string,
    fileName: string,
    rawData: any[],
    columnMapping: ProductColumnMapping
  ) => {
    try {
      // Create a new extraction run
      const runId = await createExtractionRun(projectId, fileName, columnMapping);
      
      // Transform the raw data using the column mapping
      const processedProducts = rawData.map(row => {
        const product: Partial<ProductData> = {};
        
        // Map each required field based on the column mapping
        Object.entries(columnMapping).forEach(([targetField, sourceField]) => {
          if (sourceField && row[sourceField] !== undefined) {
            product[targetField as keyof ProductData] = row[sourceField];
          }
        });
        
        return product as ProductData;
      }).filter(product => {
        // Filter out products that don't have all required fields
        return (
          product.product_id &&
          product.product_title &&
          product.product_url &&
          product.product_image_url &&
          product.product_description
        );
      });
      
      // Save processed products to the database
      return await saveProductsToDatabase(projectId, runId, processedProducts);
    } catch (error) {
      console.error('Error processing data:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to process data');
      throw error;
    }
  };

  // Get all extraction runs for a project
  const getExtractionRuns = async (projectId: string): Promise<ExtractionRun[]> => {
    const { data, error } = await supabase
      .from('ae_extraction_runs')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching extraction runs:', error);
      throw new Error(`Failed to fetch extraction runs: ${error.message}`);
    }

    // Convert the string status to ExtractionRunStatus type
    return data.map(run => ({
      ...run,
      status: run.status as ExtractionRunStatus,
      column_mapping: run.column_mapping as ProductColumnMapping
    }));
  };

  // Get products for a specific run
  const getProductsForRun = async (runId: string): Promise<ProductData[]> => {
    const { data, error } = await supabase
      .from('ae_product_data')
      .select('*')
      .eq('run_id', runId);

    if (error) {
      console.error('Error fetching products:', error);
      throw new Error(`Failed to fetch products: ${error.message}`);
    }

    // Convert Json type to Record<string, any>
    return data.map(product => ({
      ...product,
      attributes: product.attributes as Record<string, any>
    }));
  };

  // Fetch extraction runs for a project using React Query
  const useExtractionRuns = (projectId: string | undefined) => {
    return useQuery({
      queryKey: ['extractionRuns', projectId],
      queryFn: () => projectId ? getExtractionRuns(projectId) : Promise.resolve([]),
      enabled: !!projectId,
    });
  };

  // Mutation for processing uploaded data
  const useProcessDataMutation = () => {
    return useMutation({
      mutationFn: ({ 
        projectId, 
        fileName, 
        rawData, 
        columnMapping 
      }: { 
        projectId: string; 
        fileName: string; 
        rawData: any[]; 
        columnMapping: ProductColumnMapping 
      }) => 
        processUploadedData(projectId, fileName, rawData, columnMapping),
    });
  };

  return {
    isProcessing,
    progress,
    processUploadedData,
    getExtractionRuns,
    getProductsForRun,
    useExtractionRuns,
    useProcessDataMutation,
  };
};
