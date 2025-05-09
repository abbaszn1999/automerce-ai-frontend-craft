
import { useCallback } from "react";
import { useSupabaseCore } from "./useSupabaseCore";

export const useSupabaseProjects = () => {
  const { callEdgeFunction } = useSupabaseCore();

  const getProjects = useCallback(async (workspaceId?: string, moduleType?: string) => {
    const query: Record<string, string> = {};
    if (workspaceId) query.workspaceId = workspaceId;
    if (moduleType) query.moduleType = moduleType;
    
    try {
      console.log(`Getting projects with query:`, query);
      const result = await callEdgeFunction("projects", { query });
      console.log("Projects result:", result);
      return result;
    } catch (error) {
      console.error("Error in getProjects:", error);
      return { error: "Failed to fetch projects", projects: [] };
    }
  }, [callEdgeFunction]);

  const getProject = useCallback(async (id: string) => {
    try {
      console.log(`Getting project with id: ${id}`);
      const result = await callEdgeFunction("projects", {
        query: { id }
      });
      
      if (!result.project && !result.error) {
        // If we got a response but no project and no error, the project likely doesn't exist
        console.log("Project not found in result:", result);
        return { error: "Project not found", project: null };
      }
      
      return result;
    } catch (error: any) {
      console.error("Error in getProject:", error);
      return { error: error.message || "Failed to fetch project", project: null };
    }
  }, [callEdgeFunction]);

  const createProject = useCallback(async (
    name: string, 
    workspace_id: string, 
    module_type: string
  ) => {
    try {
      console.log(`Creating project: ${name} in workspace: ${workspace_id} with type: ${module_type}`);
      const result = await callEdgeFunction("projects", {
        method: "POST",
        body: { name, workspace_id, module_type }
      });
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      return result;
    } catch (error: any) {
      console.error("Error in createProject:", error);
      return { error: error.message || "Failed to create project", project: null };
    }
  }, [callEdgeFunction]);

  const updateProject = useCallback(async (id: string, updates: any) => {
    try {
      console.log(`Updating project: ${id} with:`, updates);
      const result = await callEdgeFunction("projects", {
        method: "PUT",
        query: { id },
        body: updates
      });
      
      return result;
    } catch (error: any) {
      console.error("Error in updateProject:", error);
      return { error: error.message || "Failed to update project", project: null };
    }
  }, [callEdgeFunction]);

  const deleteProject = useCallback(async (id: string) => {
    try {
      console.log(`Deleting project: ${id}`);
      const result = await callEdgeFunction("projects", {
        method: "DELETE",
        query: { id }
      });
      
      return result;
    } catch (error: any) {
      console.error("Error in deleteProject:", error);
      return { error: error.message || "Failed to delete project" };
    }
  }, [callEdgeFunction]);

  return {
    getProjects,
    getProject,
    createProject,
    updateProject,
    deleteProject,
  };
};
