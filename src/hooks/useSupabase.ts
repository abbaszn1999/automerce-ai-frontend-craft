
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import { useCallback } from "react";

export const useSupabase = () => {
  const getSupabaseAccessToken = useCallback(async () => {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        toast.error("Unable to get authentication token");
        throw error;
      }
      return data.session?.access_token;
    } catch (error) {
      console.error("Error getting supabase token:", error);
      return null;
    }
  }, []);
  
  const callEdgeFunction = useCallback(async (
    functionName: string, 
    options: { 
      method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"; 
      body?: any; 
      query?: Record<string, string>;
    } = {}
  ) => {
    const { method = "GET", body, query = {} } = options;
    
    try {
      const accessToken = await getSupabaseAccessToken();
      if (!accessToken) {
        toast.error("Authentication required");
        throw new Error("Authentication required");
      }
      
      // Build query string
      const queryString = Object.entries(query)
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
        .join("&");
      
      const url = queryString ? `${functionName}?${queryString}` : functionName;
      
      const { data, error } = await supabase.functions.invoke(url, {
        method,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body,
      });
      
      if (error) {
        console.error(`Error calling ${functionName}:`, error);
        toast.error(error.message || "An error occurred");
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error(`Error in callEdgeFunction ${functionName}:`, error);
      throw error;
    }
  }, [getSupabaseAccessToken]);

  // New workspace-related functions
  const getWorkspaces = useCallback(async () => {
    return callEdgeFunction("workspaces");
  }, [callEdgeFunction]);

  const getWorkspace = useCallback(async (id: string) => {
    return callEdgeFunction("workspaces", {
      query: { id }
    });
  }, [callEdgeFunction]);

  const createWorkspace = useCallback(async (name: string) => {
    return callEdgeFunction("workspaces", {
      method: "POST",
      body: { name }
    });
  }, [callEdgeFunction]);

  const updateWorkspace = useCallback(async (id: string, name: string) => {
    return callEdgeFunction("workspaces", {
      method: "PUT",
      query: { id },
      body: { name }
    });
  }, [callEdgeFunction]);

  const deleteWorkspace = useCallback(async (id: string) => {
    return callEdgeFunction("workspaces", {
      method: "DELETE",
      query: { id }
    });
  }, [callEdgeFunction]);

  // Project-related functions
  const getProjects = useCallback(async (workspaceId?: string, moduleType?: string) => {
    const query: Record<string, string> = {};
    if (workspaceId) query.workspaceId = workspaceId;
    if (moduleType) query.moduleType = moduleType;
    
    return callEdgeFunction("projects", { query });
  }, [callEdgeFunction]);

  const getProject = useCallback(async (id: string) => {
    return callEdgeFunction("projects", {
      query: { id }
    });
  }, [callEdgeFunction]);

  const createProject = useCallback(async (
    name: string, 
    workspace_id: string, 
    module_type: string
  ) => {
    return callEdgeFunction("projects", {
      method: "POST",
      body: { name, workspace_id, module_type }
    });
  }, [callEdgeFunction]);

  const updateProject = useCallback(async (id: string, updates: any) => {
    return callEdgeFunction("projects", {
      method: "PUT",
      query: { id },
      body: updates
    });
  }, [callEdgeFunction]);

  const deleteProject = useCallback(async (id: string) => {
    return callEdgeFunction("projects", {
      method: "DELETE",
      query: { id }
    });
  }, [callEdgeFunction]);

  // AE project settings
  const getAEProjectSettings = useCallback(async (projectId: string) => {
    return callEdgeFunction("ae-project-settings", {
      query: { projectId }
    });
  }, [callEdgeFunction]);

  const updateAEProjectSettings = useCallback(async (projectId: string, updates: any) => {
    return callEdgeFunction("ae-project-settings", {
      method: "PUT",
      query: { projectId },
      body: updates
    });
  }, [callEdgeFunction]);

  // AE attributes
  const getAEAttributes = useCallback(async (projectId: string) => {
    return callEdgeFunction("ae-attributes", {
      query: { projectId }
    });
  }, [callEdgeFunction]);

  const createAEAttribute = useCallback(async (
    projectId: string, 
    name: string, 
    description?: string, 
    values?: string[]
  ) => {
    return callEdgeFunction("ae-attributes", {
      method: "POST",
      query: { projectId },
      body: { name, description, values }
    });
  }, [callEdgeFunction]);

  const updateAEAttribute = useCallback(async (
    projectId: string, 
    attributeId: string, 
    name: string, 
    description?: string, 
    values?: string[]
  ) => {
    return callEdgeFunction("ae-attributes", {
      method: "PUT",
      query: { projectId, attributeId },
      body: { name, description, values }
    });
  }, [callEdgeFunction]);

  const deleteAEAttribute = useCallback(async (projectId: string, attributeId: string) => {
    return callEdgeFunction("ae-attributes", {
      method: "DELETE",
      query: { projectId, attributeId }
    });
  }, [callEdgeFunction]);

  // AE jobs
  const getAEJobs = useCallback(async (projectId: string) => {
    return callEdgeFunction("ae-jobs", {
      query: { projectId }
    });
  }, [callEdgeFunction]);

  const getAEJob = useCallback(async (jobId: string) => {
    return callEdgeFunction("ae-jobs", {
      query: { jobId }
    });
  }, [callEdgeFunction]);

  const createAEJob = useCallback(async (projectId: string, name: string, inputData: any) => {
    return callEdgeFunction("ae-jobs", {
      method: "POST",
      query: { projectId },
      body: { name, inputData }
    });
  }, [callEdgeFunction]);

  const updateAEJobStatus = useCallback(async (
    projectId: string, 
    jobId: string, 
    action: 'pause' | 'resume' | 'cancel'
  ) => {
    return callEdgeFunction("ae-jobs", {
      method: "PUT",
      query: { projectId, jobId },
      body: { action }
    });
  }, [callEdgeFunction]);
  
  return {
    getSupabaseAccessToken,
    callEdgeFunction,
    // Workspace functions
    getWorkspaces,
    getWorkspace,
    createWorkspace,
    updateWorkspace,
    deleteWorkspace,
    // Project functions
    getProjects,
    getProject,
    createProject,
    updateProject,
    deleteProject,
    // AE project settings
    getAEProjectSettings,
    updateAEProjectSettings,
    // AE attributes
    getAEAttributes,
    createAEAttribute,
    updateAEAttribute,
    deleteAEAttribute,
    // AE jobs
    getAEJobs,
    getAEJob,
    createAEJob,
    updateAEJobStatus
  };
};
