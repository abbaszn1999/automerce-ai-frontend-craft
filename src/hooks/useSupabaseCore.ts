
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import { useCallback } from "react";

export const useSupabaseCore = () => {
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
        const error = new Error("Authentication required");
        toast.error("Authentication required");
        throw error;
      }
      
      // Build query string
      const queryString = Object.entries(query)
        .filter(([_, value]) => value !== undefined && value !== null)
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
        .join("&");
      
      const url = queryString ? `${functionName}?${queryString}` : functionName;
      
      console.log(`Calling function ${functionName} with method ${method}`);
      const { data, error } = await supabase.functions.invoke(url, {
        method,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body,
      });
      
      if (error) {
        console.error(`Error calling ${functionName}:`, error);
        throw error;
      }
      
      return data;
    } catch (error: any) {
      console.error(`Error in callEdgeFunction ${functionName}:`, error);
      return { 
        error: error.message || `Failed to call ${functionName}`
      };
    }
  }, [getSupabaseAccessToken]);

  return {
    getSupabaseAccessToken,
    callEdgeFunction,
  };
};
