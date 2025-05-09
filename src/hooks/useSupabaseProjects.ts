
import { useCallback } from "react";
import { useSupabaseCore } from "./useSupabaseCore";

export const useSupabaseProjects = () => {
  const { callEdgeFunction } = useSupabaseCore();

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

  return {
    getProjects,
    getProject,
    createProject,
    updateProject,
    deleteProject,
  };
};
