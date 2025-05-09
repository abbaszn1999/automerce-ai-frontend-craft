import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import { useCallback, useState, useEffect } from "react";

export const useSupabaseCore = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [authErrorShown, setAuthErrorShown] = useState(false);

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsCheckingAuth(true);
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error checking auth status:", error);
          setIsAuthenticated(false);
          return;
        }
        
        const isAuthed = !!data.session?.access_token;
        setIsAuthenticated(isAuthed);
        
        if (!isAuthed && !authErrorShown) {
          // Don't show error toast anymore - we'll redirect to login
          // toast.error("Authentication required. Please sign in.", {
          //   id: "auth-required",
          //   duration: 5000
          // });
          setAuthErrorShown(true);
        }
      } catch (err) {
        console.error("Error in auth check:", err);
        setIsAuthenticated(false);
      } finally {
        setIsCheckingAuth(false);
      }
    };
    
    checkAuth();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
      
      if (event === 'SIGNED_IN') {
        setAuthErrorShown(false);
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const getSupabaseAccessToken = useCallback(async () => {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Error getting supabase session:", error);
        return null;
      }
      
      if (!data.session?.access_token) {
        console.warn("No access token found in session");
        return null;
      }
      
      return data.session.access_token;
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
      showErrors?: boolean;
      skipAuthCheck?: boolean;
    } = {}
  ) => {
    const { method = "GET", body, query = {}, showErrors = true, skipAuthCheck = false } = options;
    
    // Skip API call if we know we're not authenticated (unless specifically requested)
    if (!skipAuthCheck && isAuthenticated === false) {
      console.log(`Skipping API call to ${functionName} - not authenticated`);
      return { error: "Authentication required" };
    }
    
    try {
      const accessToken = await getSupabaseAccessToken();
      if (!accessToken) {
        const error = new Error("Authentication required");
        if (showErrors && !authErrorShown) {
          toast.error("Authentication required", {
            id: "auth-required",
            duration: 5000
          });
          setAuthErrorShown(true);
        }
        return { error: "Authentication required" };
      }
      
      // Reset auth error shown flag once we have a valid token
      setAuthErrorShown(false);
      
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
        if (showErrors) {
          const errorMessage = error.message || `Error calling ${functionName}`;
          toast.error(`API error: ${errorMessage}`, {
            id: `api-error-${functionName}`,
          });
        }
        return { error: error.message || `Failed to call ${functionName}` };
      }
      
      return data;
    } catch (error: any) {
      console.error(`Error in callEdgeFunction ${functionName}:`, error);
      if (showErrors && !authErrorShown) {
        const errorMessage = error.message || `Failed to call ${functionName}`;
        toast.error(`API error: ${errorMessage}`, {
          id: `api-error-${functionName}`,
        });
      }
      return { 
        error: error.message || `Failed to call ${functionName}`
      };
    }
  }, [getSupabaseAccessToken, isAuthenticated, authErrorShown]);

  return {
    isAuthenticated,
    isCheckingAuth,
    getSupabaseAccessToken,
    callEdgeFunction,
  };
};
