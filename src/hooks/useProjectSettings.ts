
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui/use-toast";

// Export type keyword for isolated modules
export type AEConfigType = {
  columnMappings: Record<string, string>;
  attributeDefinitions: any[];
  feeds?: any[];
  [key: string]: any;
};

export interface ProjectSettings {
  id?: string;
  project_id?: string;
  settings: AEConfigType;
  created_at?: string;
  updated_at?: string;
}

export const useProjectSettings = (
  solutionPrefix?: string,
  projectName?: string
) => {
  const [settings, setSettings] = useState<AEConfigType | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const queryClient = useQueryClient();

  // Generate a unique cache key based on solution prefix and project name
  const cacheKey = [`projectSettings`, solutionPrefix, projectName];

  // Get default settings based on solution prefix
  const getDefaultSettings = (prefix: string): AEConfigType => {
    switch (prefix) {
      case 'cb':
        return {
          columnMappings: {},
          attributeDefinitions: [],
          feeds: []
        };
      case 'ae':
        return {
          columnMappings: {},
          attributeDefinitions: [],
          feeds: []
        };
      default:
        return {
          columnMappings: {},
          attributeDefinitions: [],
          feeds: []
        };
    }
  };

  // Fetch project settings
  const fetchProjectSettings = useCallback(async () => {
    if (!projectName) {
      return null;
    }

    try {
      const { data, error } = await supabase
        .from("project_settings")
        .select("*")
        .eq("project_id", projectName)
        .maybeSingle();

      if (error) {
        throw new Error(`Error fetching project settings: ${error.message}`);
      }

      // If no settings found, create default settings
      if (!data) {
        // Get default settings from the getDefaultSettings function
        const initialSettings = getDefaultSettings(solutionPrefix || "default");
        
        // Create new settings
        const { data: newData, error: createError } = await supabase
          .from("project_settings")
          .insert({
            project_id: projectName,
            settings: initialSettings as unknown as any,
          })
          .select()
          .single();

        if (createError) {
          throw new Error(`Error creating project settings: ${createError.message}`);
        }

        return initialSettings;
      }

      // Cast the JSON data to our AEConfigType
      return data.settings as unknown as AEConfigType;
    } catch (err) {
      console.error("Error in fetchProjectSettings:", err);
      throw err;
    }
  }, [solutionPrefix, projectName]);

  // Use React Query to fetch and cache the settings
  const query = useQuery({
    queryKey: cacheKey,
    queryFn: fetchProjectSettings,
    enabled: !!projectName,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Update settings function using React Query mutation
  const saveProjectSettingsMutation = useMutation({
    mutationFn: async (newSettings: AEConfigType) => {
      if (!projectName) {
        throw new Error("Project name is required to save settings");
      }

      const { data, error } = await supabase
        .from("project_settings")
        .update({
          settings: newSettings as unknown as any,
          updated_at: new Date().toISOString(),
        })
        .eq("project_id", projectName)
        .select()
        .single();

      if (error) {
        throw new Error(`Error updating project settings: ${error.message}`);
      }

      return data;
    },
    onSuccess: () => {
      // Invalidate the query to refetch the updated settings
      queryClient.invalidateQueries({ queryKey: cacheKey });
      toast({
        title: "Success",
        description: "Settings saved successfully",
      });
    },
    onError: (error) => {
      console.error("Error saving settings:", error);
      toast({
        title: "Error",
        description: `Failed to save settings: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      });
    },
  });

  // Update local state when the query data changes
  useEffect(() => {
    setIsLoading(query.isLoading);
    setError(query.error instanceof Error ? query.error : null);
    setSettings(query.data || null);
  }, [query.data, query.isLoading, query.error]);

  return {
    settings,
    isLoading,
    error,
    saveProjectSettings: saveProjectSettingsMutation.mutate,
    isSaving: saveProjectSettingsMutation.isPending,
  };
};
