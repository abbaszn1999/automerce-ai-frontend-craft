
import { supabase } from "@/services/apiClient";
import { AEConfigType } from './types';
import { toast } from "@/hooks/use-toast";

export const fetchProjectId = async (
  workspaceId: string, 
  solutionPrefix: string, 
  projectName: string
) => {
  const { data, error } = await supabase
    .from('solution_projects')
    .select('id')
    .eq('workspace_id', workspaceId)
    .eq('solution_prefix', solutionPrefix)
    .eq('name', projectName)
    .single();

  if (error) {
    console.error("Error fetching project:", error);
    throw new Error("Failed to load project settings");
  }

  return data;
};

export const fetchProjectSettings = async (projectId: string) => {
  const { data, error } = await supabase
    .from('project_settings')
    .select('settings')
    .eq('project_id', projectId);

  if (error) {
    console.error("Error fetching project settings:", error);
    throw new Error("Failed to load project settings");
  }

  return data;
};

export const saveProjectSettingsToDb = async (
  projectId: string,
  settings: AEConfigType
) => {
  try {
    // Check if settings already exist
    const { data: existingSettings, error: checkError } = await supabase
      .from('project_settings')
      .select('id')
      .eq('project_id', projectId);

    if (checkError) {
      console.error("Error checking existing settings:", checkError);
      toast.error("Failed to save project settings");
      throw new Error("Failed to save project settings");
    }

    let saveResult;
    if (existingSettings && existingSettings.length > 0) {
      // Update existing settings
      saveResult = await supabase
        .from('project_settings')
        .update({ settings })
        .eq('project_id', projectId);
    } else {
      // Create new settings
      saveResult = await supabase
        .from('project_settings')
        .insert({ project_id: projectId, settings });
    }

    if (saveResult.error) {
      console.error("Error saving project settings:", saveResult.error);
      toast.error("Failed to save project settings: " + saveResult.error.message);
      throw new Error("Failed to save project settings");
    }

    // Update the last_updated timestamp for the project
    const updateResult = await supabase
      .from('solution_projects')
      .update({ last_updated: new Date().toISOString() })
      .eq('id', projectId);
    
    if (updateResult.error) {
      console.warn("Could not update last_updated timestamp:", updateResult.error);
    }

    toast.success("Project settings saved successfully");
    return true;
  } catch (error: any) {
    console.error("Error in saveProjectSettingsToDb:", error);
    toast.error("Failed to save project settings");
    throw error;
  }
};
