
import { useCallback } from "react";
import { useSupabaseCore } from "./useSupabaseCore";

export const useSupabaseAEJobs = () => {
  const { callEdgeFunction } = useSupabaseCore();

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
    getAEJobs,
    getAEJob,
    createAEJob,
    updateAEJobStatus
  };
};
