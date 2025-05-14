
import { dataService } from "@/services/dataService";
import { AEConfigType } from './types';
import { toast } from "sonner";

export const fetchProjectId = async (
  workspaceId: string, 
  solutionPrefix: string, 
  projectName: string
) => {
  try {
    return await dataService.getProjectId(workspaceId, solutionPrefix, projectName);
  } catch (error) {
    console.error("Error fetching project:", error);
    throw new Error("Failed to load project settings");
  }
};

export const fetchProjectSettings = async (projectId: string) => {
  try {
    return await dataService.getProjectSettings(projectId);
  } catch (error) {
    console.error("Error fetching project settings:", error);
    throw new Error("Failed to load project settings");
  }
};

export const saveProjectSettingsToDb = async (
  projectId: string,
  settings: AEConfigType
) => {
  try {
    const success = await dataService.saveProjectSettings(projectId, settings);
    
    if (success) {
      toast.success("Project settings saved successfully");
      return true;
    } else {
      toast.error("Failed to save project settings");
      throw new Error("Failed to save project settings");
    }
  } catch (error: any) {
    console.error("Error in saveProjectSettingsToDb:", error);
    toast.error("Failed to save project settings");
    throw error;
  }
};
