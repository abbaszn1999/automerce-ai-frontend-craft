
import { useCallback } from "react";
import { useSupabaseCore } from "./useSupabaseCore";

export const useSupabaseWorkspaces = () => {
  const { callEdgeFunction } = useSupabaseCore();

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

  return {
    getWorkspaces,
    getWorkspace,
    createWorkspace,
    updateWorkspace,
    deleteWorkspace,
  };
};
