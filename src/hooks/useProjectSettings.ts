
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getDefaultProjectSettings } from './projectSettings/defaultSettings';
import { AEConfigType } from './projectSettings/types';
import { Json } from '@/integrations/supabase/types';

export { AEConfigType } from './projectSettings/types';

export const useProjectSettings = (solutionPrefix: string = "ae", projectName?: string) => {
  const [settings, setSettings] = useState<AEConfigType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load project settings
  useEffect(() => {
    const fetchSettings = async () => {
      if (!projectName) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        // First, find the project ID by name and solution prefix
        const { data: projectData, error: projectError } = await supabase
          .from('solution_projects')
          .select('id')
          .eq('solution_prefix', solutionPrefix)
          .eq('name', projectName)
          .single();

        if (projectError) {
          throw new Error(`Error fetching project: ${projectError.message}`);
        }

        if (!projectData) {
          throw new Error(`Project not found: ${projectName}`);
        }

        // Then, fetch settings for that project
        const { data: settingsData, error: settingsError } = await supabase
          .from('project_settings')
          .select('settings')
          .eq('project_id', projectData.id)
          .maybeSingle();

        if (settingsError) {
          throw new Error(`Error fetching settings: ${settingsError.message}`);
        }

        // Set settings or default values
        if (settingsData?.settings) {
          // Correctly cast JSON to our type with proper type assertion
          setSettings(settingsData.settings as unknown as AEConfigType);
        } else {
          // Initialize with default settings
          setSettings(getDefaultProjectSettings());
        }
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Unknown error');
        console.error('Error loading project settings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, [solutionPrefix, projectName]);

  // Save project settings
  const saveProjectSettings = async (updatedSettings: AEConfigType) => {
    if (!projectName) {
      return;
    }

    try {
      // Find the project ID
      const { data: projectData, error: projectError } = await supabase
        .from('solution_projects')
        .select('id')
        .eq('solution_prefix', solutionPrefix)
        .eq('name', projectName)
        .single();

      if (projectError) {
        throw new Error(`Error fetching project: ${projectError.message}`);
      }

      // Check if settings already exist for this project
      const { data: existingSettings, error: checkError } = await supabase
        .from('project_settings')
        .select('id')
        .eq('project_id', projectData.id)
        .maybeSingle();

      if (checkError) {
        throw new Error(`Error checking settings: ${checkError.message}`);
      }

      let result;
      
      if (existingSettings) {
        // Update existing settings with proper type casting
        result = await supabase
          .from('project_settings')
          .update({ settings: updatedSettings as unknown as Json })
          .eq('project_id', projectData.id);
      } else {
        // Insert new settings with proper type casting
        result = await supabase
          .from('project_settings')
          .insert({ 
            project_id: projectData.id, 
            settings: updatedSettings as unknown as Json 
          });
      }

      if (result.error) {
        throw new Error(`Error saving settings: ${result.error.message}`);
      }

      // Update local state
      setSettings(updatedSettings);
    } catch (error) {
      console.error('Error saving project settings:', error);
      throw error;
    }
  };

  return { settings, isLoading, error, saveProjectSettings };
};
