
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
      method?: string; 
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
  
  return {
    getSupabaseAccessToken,
    callEdgeFunction,
  };
};
