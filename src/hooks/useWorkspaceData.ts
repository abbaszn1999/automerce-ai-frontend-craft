
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { Workspace, WorkspaceUser } from "@/types/workspace.types";

export const useWorkspaceData = (userId: string | undefined) => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);
  const [workspaceUsers, setWorkspaceUsers] = useState<WorkspaceUser[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkspaces = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('workspaces')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setWorkspaces(data || []);
      
      // Set first workspace as current if none is selected
      if (data && data.length > 0 && !currentWorkspace) {
        setCurrentWorkspace(data[0]);
      }
      
    } catch (err: any) {
      setError(err.message || "Failed to fetch workspaces");
      toast.error("Failed to load workspaces");
    } finally {
      setLoading(false);
    }
  };

  const createWorkspace = async (name: string, description?: string): Promise<Workspace | null> => {
    if (!userId) return null;

    try {
      setLoading(true);
      
      const newWorkspace = {
        name,
        description: description || null
      };
      
      // Insert a new workspace
      const { data, error } = await supabase
        .from('workspaces')
        .insert([newWorkspace])
        .select();

      if (error) {
        console.error("Workspace creation error:", error);
        
        // Check if it's an RLS policy error
        if (error.message.includes("row-level security")) {
          // Try the approach of creating workspace_users entry first
          // Using any type to avoid TS error with custom RPC functions
          const { data: workspaceData, error: workspaceError } = await supabase.rpc(
            'create_workspace_with_owner' as any, {
              workspace_name: name,
              workspace_description: description || null,
              owner_id: userId
            }
          );
          
          if (workspaceError) {
            toast.error("Permission denied: Couldn't create workspace");
            console.error("RPC error:", workspaceError);
            return null;
          }
          
          if (workspaceData) {
            // Fetch the newly created workspace
            const { data: newWorkspaceData } = await supabase
              .from('workspaces')
              .select('*')
              .order('created_at', { ascending: false })
              .limit(1);
              
            if (newWorkspaceData && newWorkspaceData.length > 0) {
              setWorkspaces(prev => [newWorkspaceData[0], ...prev]);
              setCurrentWorkspace(newWorkspaceData[0]);
              toast.success("Workspace created successfully");
              return newWorkspaceData[0];
            }
          }
          
          return null;
        }
        
        toast.error(error.message || "Failed to create workspace");
        return null;
      }

      // Handle workspace user association - this should be handled by a database trigger
      // but we'll add a fallback here
      if (data && data.length > 0) {
        try {
          await supabase
            .from('workspace_users')
            .insert([{
              workspace_id: data[0].id,
              user_id: userId,
              role: 'owner'
            }]);
        } catch (userAssocError) {
          console.error("Failed to associate user with workspace:", userAssocError);
          // Don't block the flow, as the database trigger should handle this
        }
      }

      if (data && data.length > 0) {
        setWorkspaces(prev => [data[0], ...prev]);
        setCurrentWorkspace(data[0]);
        toast.success("Workspace created successfully");
        return data[0];
      }
      
      return null;
      
    } catch (err: any) {
      toast.error(err.message || "Failed to create workspace");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const setCurrentWorkspaceById = (id: string) => {
    const workspace = workspaces.find(w => w.id === id);
    if (workspace) {
      setCurrentWorkspace(workspace);
      localStorage.setItem("currentWorkspaceId", workspace.id);
    }
  };

  const updateWorkspace = async (id: string, data: Partial<Workspace>) => {
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('workspaces')
        .update(data)
        .eq('id', id);

      if (error) throw error;

      // Update local state
      setWorkspaces(prev => 
        prev.map(w => w.id === id ? { ...w, ...data } : w)
      );
      
      if (currentWorkspace?.id === id) {
        setCurrentWorkspace(prev => prev ? { ...prev, ...data } : null);
      }
      
      toast.success("Workspace updated successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to update workspace");
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkspaceUsers = async (workspaceId: string): Promise<WorkspaceUser[]> => {
    try {
      const { data, error } = await supabase
        .from('workspace_users')
        .select('*')
        .eq('workspace_id', workspaceId);

      if (error) throw error;
      setWorkspaceUsers(data || []);
      return data || [];
    } catch (err: any) {
      console.error("Error fetching workspace users:", err);
      return [];
    }
  };

  // Load workspaces when user changes
  useEffect(() => {
    if (userId) {
      fetchWorkspaces();
    } else {
      setWorkspaces([]);
      setCurrentWorkspace(null);
    }
  }, [userId]);

  // Try to restore current workspace from localStorage
  useEffect(() => {
    const savedWorkspaceId = localStorage.getItem("currentWorkspaceId");
    if (savedWorkspaceId && workspaces.length > 0) {
      const savedWorkspace = workspaces.find(w => w.id === savedWorkspaceId);
      if (savedWorkspace) {
        setCurrentWorkspace(savedWorkspace);
      }
    }
  }, [workspaces]);

  return {
    workspaces,
    currentWorkspace,
    workspaceUsers,
    loading,
    error,
    fetchWorkspaces,
    createWorkspace,
    setCurrentWorkspaceById,
    updateWorkspace,
    fetchWorkspaceUsers
  };
};
