
import { useState, useEffect } from "react";
import { useWorkspace } from "@/context/WorkspaceContext";
import { toast } from "@/components/ui/use-toast";
import { AEConfigType } from "./projectSettings/types";
import { getDefaultProjectSettings } from "./projectSettings/defaultSettings";
import { 
  fetchProjectId, 
  fetchProjectSettings, 
  saveProjectSettingsToDb 
} from "./projectSettings/projectSettingsService";

// Re-export the types for backward compatibility
export type { AEConfigType } from "./projectSettings/types";

// Extend the AEConfigType to include feeds (if it doesn't already)
declare module "./projectSettings/types" {
  interface AEConfigType {
    feeds?: Array<{
      name: string;
      type: string;
      source: string;
      data: any[];
      createdAt: string;
    }>;
  }
}

export const useProjectSettings = (solutionPrefix?: string, projectName?: string | null) => {
  const { currentWorkspace } = useWorkspace();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [settings, setSettings] = useState<AEConfigType | null>(null);

  // Load project settings when the component mounts or when projectName changes
  useEffect(() => {
    if (currentWorkspace && projectName && solutionPrefix) {
      loadProjectSettings();
    }
  }, [currentWorkspace, projectName, solutionPrefix]);

  const loadProjectSettings = async () => {
    if (!currentWorkspace || !projectName || !solutionPrefix) return;

    setIsLoading(true);
    try {
      // First, get the project ID
      const projectData = await fetchProjectId(
        currentWorkspace.id, 
        solutionPrefix, 
        projectName
      );

      if (!projectData) {
        toast.error("Project not found");
        setIsLoading(false);
        return;
      }

      // Then get the project settings
      const settingsData = await fetchProjectSettings(projectData.id);

      if (settingsData && settingsData.length > 0) {
        // We have settings
        setSettings(settingsData[0].settings as AEConfigType);
      } else {
        // No settings yet, create default settings
        const defaultSettings = getDefaultProjectSettings();
        // Ensure feeds array exists
        defaultSettings.feeds = [];
        setSettings(defaultSettings);
      }
    } catch (error) {
      console.error("Error in loadProjectSettings:", error);
      toast.error("Failed to load project settings");
    } finally {
      setIsLoading(false);
    }
  };

  const saveProjectSettings = async (updatedSettings: AEConfigType) => {
    if (!currentWorkspace || !projectName || !solutionPrefix) {
      toast.error("No project selected");
      return false;
    }

    setIsSaving(true);
    try {
      // Get the project ID
      const projectData = await fetchProjectId(
        currentWorkspace.id, 
        solutionPrefix, 
        projectName
      );

      if (!projectData) {
        toast.error("Project not found");
        return false;
      }

      // Save the settings
      await saveProjectSettingsToDb(projectData.id, updatedSettings);
      
      // Update local state
      setSettings(updatedSettings);
      
      return true;
    } catch (error) {
      console.error("Error in saveProjectSettings:", error);
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
