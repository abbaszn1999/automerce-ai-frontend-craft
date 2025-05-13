
import { useState, useEffect } from "react";
import { useAppContext } from "@/context/AppContext";
import { useWorkspace } from "@/context/WorkspaceContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

// Define types for the project settings
export type AEConfigType = {
  aiSettings: {
    openAiApiKey?: string;
    embeddingModel?: string;
    embeddingDimensions?: number;
    maxResultsFilter?: number;
    model2?: string;
    maxTokens2?: number;
    prompt2?: string;
    batchSize?: number;
    model3?: string;
    maxTokens3?: number;
    prompt3?: string;
  };
  searchApiSettings: {
    searchApiKey?: string;
    results?: number;
  };
  scrapingSettings: {
    scrapingBeeApiKey?: string;
    maxConcurrentRequests1?: number;
    maxConcurrentRequests2?: number;
  };
  attributes: Array<{ id: string; name: string; values: string[] }>;
};

export const useProjectSettings = (solutionPrefix: string, projectName: string | null) => {
  const { currentWorkspace } = useWorkspace();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [settings, setSettings] = useState<AEConfigType | null>(null);

  // Load project settings when the component mounts or when projectName changes
  useEffect(() => {
    if (currentWorkspace && projectName) {
      loadProjectSettings();
    }
  }, [currentWorkspace, projectName, solutionPrefix]);

  const loadProjectSettings = async () => {
    if (!currentWorkspace || !projectName) return;

    setIsLoading(true);
    try {
      // First, get the project ID
      const { data: projectData, error: projectError } = await supabase
        .from('solution_projects')
        .select('id')
        .eq('workspace_id', currentWorkspace.id)
        .eq('solution_prefix', solutionPrefix)
        .eq('name', projectName)
        .single();

      if (projectError) {
        console.error("Error fetching project:", projectError);
        toast.error("Failed to load project settings");
        setIsLoading(false);
        return;
      }

      // Then get the project settings
      const { data: settingsData, error: settingsError } = await supabase
        .from('project_settings')
        .select('settings')
        .eq('project_id', projectData.id);

      if (settingsError) {
        console.error("Error fetching project settings:", settingsError);
        toast.error("Failed to load project settings");
        setIsLoading(false);
        return;
      }

      if (settingsData && settingsData.length > 0) {
        // We have settings
        setSettings(settingsData[0].settings as AEConfigType);
      } else {
        // No settings yet, create default settings
        const defaultSettings: AEConfigType = {
          aiSettings: {
            embeddingModel: "text-embedding-3-small",
            embeddingDimensions: 256,
            maxResultsFilter: 7,
            model2: "gpt-4o",
            maxTokens2: 8000,
            prompt2: "You are an AI assistant identifying product attributes.",
            batchSize: 100,
            model3: "gpt-4o",
            maxTokens3: 2000,
            prompt3: "Analyze and categorize the extracted product attributes into their respective attribute types."
          },
          searchApiSettings: {
            results: 10
          },
          scrapingSettings: {
            maxConcurrentRequests1: 5,
            maxConcurrentRequests2: 5
          },
          attributes: [
            { id: "attr1", name: "Material", values: ["Cotton", "Polyester", "Wool", "Silk"] },
            { id: "attr2", name: "Color", values: ["Red", "Blue", "Green", "Black", "White"] }
          ]
        };
        setSettings(defaultSettings);
      }
    } catch (error) {
      console.error("Error in loadProjectSettings:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const saveProjectSettings = async (updatedSettings: AEConfigType) => {
    if (!currentWorkspace || !projectName) {
      toast.error("No project selected");
      return false;
    }

    setIsSaving(true);
    try {
      // First, get the project ID
      const { data: projectData, error: projectError } = await supabase
        .from('solution_projects')
        .select('id')
        .eq('workspace_id', currentWorkspace.id)
        .eq('solution_prefix', solutionPrefix)
        .eq('name', projectName)
        .single();

      if (projectError) {
        console.error("Error fetching project:", projectError);
        toast.error("Failed to save project settings");
        return false;
      }

      // Check if settings already exist
      const { data: existingSettings, error: checkError } = await supabase
        .from('project_settings')
        .select('id')
        .eq('project_id', projectData.id);

      if (checkError) {
        console.error("Error checking existing settings:", checkError);
        toast.error("Failed to save project settings");
        return false;
      }

      let saveResult;
      if (existingSettings && existingSettings.length > 0) {
        // Update existing settings
        saveResult = await supabase
          .from('project_settings')
          .update({ settings: updatedSettings })
          .eq('project_id', projectData.id);
      } else {
        // Create new settings
        saveResult = await supabase
          .from('project_settings')
          .insert({ project_id: projectData.id, settings: updatedSettings });
      }

      if (saveResult.error) {
        console.error("Error saving project settings:", saveResult.error);
        toast.error("Failed to save project settings");
        return false;
      }

      // Update local state
      setSettings(updatedSettings);
      toast.success("Project settings saved successfully");
      
      // Update the last_updated timestamp for the project
      await supabase
        .from('solution_projects')
        .update({ last_updated: new Date().toISOString() })
        .eq('id', projectData.id);

      return true;
    } catch (error) {
      console.error("Error in saveProjectSettings:", error);
      toast.error("An unexpected error occurred");
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    settings,
    isLoading,
    isSaving,
    loadProjectSettings,
    saveProjectSettings
  };
};
