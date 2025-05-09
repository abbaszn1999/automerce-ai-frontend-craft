
import { useCallback } from "react";
import { useSupabaseCore } from "./useSupabaseCore";

export const useSupabaseAESettings = () => {
  const { callEdgeFunction } = useSupabaseCore();

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

  return {
    getAEProjectSettings,
    updateAEProjectSettings,
  };
};
