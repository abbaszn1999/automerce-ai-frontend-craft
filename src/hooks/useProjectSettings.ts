
import { useState, useEffect } from "react";
import { useWorkspace } from "@/context/WorkspaceContext";
import { toast } from "sonner";
import { AEConfigType } from "./projectSettings/types";
import { getDefaultProjectSettings } from "./projectSettings/defaultSettings";
import { dataService } from "@/services/dataService";

// Re-export the type for backward compatibility
export type { AEConfigType } from "./projectSettings/types";

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
      const projectId = await dataService.getProjectId(
        currentWorkspace.id, 
        solutionPrefix, 
        projectName
      );

      if (!projectId) {
        toast.error("Project not found");
        setIsLoading(false);
        return;
      }

      // Then get the project settings
      const settingsData = await dataService.getProjectSettings(projectId);

      if (settingsData) {
        // We have settings
        setSettings(settingsData as AEConfigType);
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
      const projectId = await dataService.getProjectId(
        currentWorkspace.id, 
        solutionPrefix, 
        projectName
      );

      if (!projectId) {
        toast.error("Project not found");
        return false;
      }

      // Save the settings
      const success = await dataService.saveProjectSettings(projectId, updatedSettings);
      
      if (success) {
        // Update local state
        setSettings(updatedSettings);
        toast.success("Project settings saved successfully");
        return true;
      } else {
        toast.error("Failed to save project settings");
        return false;
      }
    } catch (error) {
      console.error("Error in saveProjectSettings:", error);
      toast.error("Failed to save project settings");
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
