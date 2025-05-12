
import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";
import { toast } from "@/components/ui/sonner";

interface Workspace {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

interface WorkspaceUser {
  workspace_id: string;
  user_id: string;
  role: string;
}

interface WorkspaceContextType {
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  workspaceUsers: WorkspaceUser[];
  loading: boolean;
  error: string | null;
  fetchWorkspaces: () => Promise<void>;
  createWorkspace: (name: string, description?: string) => Promise<Workspace | null>;
  setCurrentWorkspaceById: (id: string) => void;
  updateWorkspace: (id: string, data: Partial<Workspace>) => Promise<void>;
  fetchWorkspaceUsers: (workspaceId: string) => Promise<WorkspaceUser[]>;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);
  const [workspaceUsers, setWorkspaceUsers] = useState<WorkspaceUser[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchWorkspaces = async () => {
    if (!user) return;

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
    if (!user) return null;

    try {
      setLoading(true);
      
      const newWorkspace = {
        name,
        description: description || null
      };
      
      const { data, error } = await supabase
        .from('workspaces')
        .insert([newWorkspace])
        .select()
        .single();

      if (error) throw error;

      setWorkspaces(prev => [data, ...prev]);
      setCurrentWorkspace(data);
      toast.success("Workspace created successfully");
      return data;
      
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
    if (user) {
      fetchWorkspaces();
    } else {
      setWorkspaces([]);
      setCurrentWorkspace(null);
    }
  }, [user]);

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

  const value = {
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

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error("useWorkspace must be used within a WorkspaceProvider");
  }
  return context;
};
