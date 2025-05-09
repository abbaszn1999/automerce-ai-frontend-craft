
import { useCallback } from "react";
import { useSupabaseCore } from "./useSupabaseCore";

export const useSupabaseAEAttributes = () => {
  const { callEdgeFunction } = useSupabaseCore();

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

  return {
    getAEAttributes,
    createAEAttribute,
    updateAEAttribute,
    deleteAEAttribute,
  };
};
