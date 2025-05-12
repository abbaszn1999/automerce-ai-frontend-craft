
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
      
      // First, get workspace IDs the user belongs to
      const { data: membershipData, error: membershipError } = await supabase
        .from('workspace_users')
        .select('workspace_id')
        .eq('user_id', userId);

      if (membershipError) throw membershipError;
      
      if (!membershipData || membershipData.length === 0) {
        setWorkspaces([]);
        setCurrentWorkspace(null);
        setLoading(false);
        return;
      }
      
      // Then fetch the actual workspace data for those IDs
      const workspaceIds = membershipData.map(item => item.workspace_id);
      const { data, error } = await supabase
        .from('workspaces')
        .select('*')
        .in('id', workspaceIds)
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
      
      // First create the workspace
      const { data: workspaceData, error: workspaceError } = await supabase
        .from('workspaces')
        .insert([
          { name, description }
        ])
        .select()
        .single();
      
      if (workspaceError) {
        toast.error("Failed to create workspace: " + workspaceError.message);
        return null;
      }

      // Then create the workspace user association
      // This approach avoids the duplicate key error as we're handling each step separately
      if (workspaceData) {
        const { error: userError } = await supabase
          .from('workspace_users')
          .insert([
            { workspace_id: workspaceData.id, user_id: userId, role: 'owner' }
          ]);
        
        if (userError) {
          // If there's an error adding the user, cleanup by deleting the workspace
          await supabase.from('workspaces').delete().eq('id', workspaceData.id);
          toast.error("Failed to associate user with workspace: " + userError.message);
          return null;
        }
        
        // Update local state
        setWorkspaces(prev => [workspaceData, ...prev]);
        setCurrentWorkspace(workspaceData);
        toast.success("Workspace created successfully");
        
        return workspaceData;
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
