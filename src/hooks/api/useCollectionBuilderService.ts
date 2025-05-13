
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui/use-toast";

// Type definitions for stages
interface Stage {
  id: string;
  name: string;
  description?: string;
  index: number;
  projectId: string;
  created_at?: string;
  updated_at?: string;
}

interface StageCreate {
  name: string;
  description?: string;
  index: number;
  projectId: string;
}

export const useCollectionBuilderService = () => {
  const queryClient = useQueryClient();
  const [progress, setProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  // Get all stages for a project
  const useGetStages = (projectId?: string) => {
    return useQuery({
      queryKey: ["stages", projectId],
      queryFn: async () => {
        if (!projectId) return [];
        
        const { data, error } = await supabase
          .from("stages")
          .select("*")
          .eq("projectId", projectId)
          .order("index", { ascending: true });

        if (error) {
          throw new Error(`Error fetching stages: ${error.message}`);
        }

        return data as Stage[];
      },
      enabled: !!projectId,
    });
  };

  // Create a new stage
  const useCreateStageMutation = () => {
    return useMutation({
      mutationFn: async (newStage: StageCreate) => {
        const { data, error } = await supabase
          .from("stages")
          .insert({
            name: newStage.name,
            description: newStage.description,
            index: newStage.index,
            projectId: newStage.projectId,
          })
          .select()
          .single();

        if (error) {
          throw new Error(`Error creating stage: ${error.message}`);
        }

        return data as Stage;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["stages"] });
      },
    });
  };

  // Update an existing stage
  const useUpdateStageMutation = () => {
    return useMutation({
      mutationFn: async (updatedStage: Stage) => {
        const { data, error } = await supabase
          .from("stages")
          .update({
            name: updatedStage.name,
            description: updatedStage.description,
            index: updatedStage.index,
            updated_at: new Date().toISOString(),
          })
          .eq("id", updatedStage.id)
          .select()
          .single();

        if (error) {
          throw new Error(`Error updating stage: ${error.message}`);
        }

        return data as Stage;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["stages"] });
      },
    });
  };

  // Delete a stage
  const useDeleteStageMutation = () => {
    return useMutation({
      mutationFn: async (stageId: string) => {
        const { error } = await supabase.from("stages").delete().eq("id", stageId);

        if (error) {
          throw new Error(`Error deleting stage: ${error.message}`);
        }

        return stageId;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["stages"] });
      },
    });
  };

  // Run the collection builder process
  const useRunCollectionBuilderMutation = () => {
    return useMutation({
      mutationFn: async (projectId: string) => {
        // This is a mock implementation - in a real app, you would call your API
        setIsProcessing(true);
        setProgress(0);
        
        // Simulate a process with progress updates
        const intervalId = setInterval(() => {
          setProgress((prev) => {
            const newProgress = Math.min(prev + Math.floor(Math.random() * 10), 100);
            if (newProgress >= 100) {
              clearInterval(intervalId);
              setTimeout(() => {
                setIsProcessing(false);
              }, 500); // Reset processing state after a short delay
            }
            return newProgress;
          });
        }, 500);

        // In a real implementation, you would call your API endpoint
        // const { data, error } = await supabase.functions.invoke("run-collection-builder", {
        //   body: { projectId }
        // });
        
        return { success: true, projectId };
      },
    });
  };

  return {
    useGetStages,
    useCreateStageMutation,
    useUpdateStageMutation,
    useDeleteStageMutation,
    useRunCollectionBuilderMutation,
    progress,
    isProcessing,
  };
};
