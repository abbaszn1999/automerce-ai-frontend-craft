
import { useSupabaseCore } from "./useSupabaseCore";
import { useSupabaseWorkspaces } from "./useSupabaseWorkspaces";
import { useSupabaseProjects } from "./useSupabaseProjects";
import { useSupabaseAESettings } from "./useSupabaseAESettings";
import { useSupabaseAEAttributes } from "./useSupabaseAEAttributes";
import { useSupabaseAEJobs } from "./useSupabaseAEJobs";

export const useSupabase = () => {
  const core = useSupabaseCore();
  const workspaces = useSupabaseWorkspaces();
  const projects = useSupabaseProjects();
  const aeSettings = useSupabaseAESettings();
  const aeAttributes = useSupabaseAEAttributes();
  const aeJobs = useSupabaseAEJobs();

  return {
    // Core Supabase functionality
    ...core,
    
    // Workspace functions
    ...workspaces,
    
    // Project functions
    ...projects,
    
    // AE project settings
    ...aeSettings,
    
    // AE attributes
    ...aeAttributes,
    
    // AE jobs
    ...aeJobs,
  };
};
