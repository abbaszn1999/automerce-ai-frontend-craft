
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useSupabase } from "@/hooks/useSupabase";
import { toast } from "@/components/ui/sonner";

// Define types for workspace and context
export interface Workspace {
  id: string;
  name: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

interface WorkspaceContextType {
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  isLoading: boolean;
  error: string | null;
  setCurrentWorkspace: (workspace: Workspace) => void;
  refreshWorkspaces: () => Promise<void>;
  createWorkspace: (name: string) => Promise<Workspace>;
  updateWorkspace: (id: string, name: string) => Promise<Workspace>;
  deleteWorkspace: (id: string) => Promise<boolean>;
}

// Create context
const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export const WorkspaceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const supabase = useSupabase();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load workspaces on mount
  const loadWorkspaces = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log("Loading workspaces...");
      const { workspaces = [], error } = await supabase.getWorkspaces();
      
      if (error) {
        throw new Error(error);
      }
      
      console.log("Loaded workspaces:", workspaces);
      setWorkspaces(workspaces);
      
      // If no workspaces exist, create a default one
      if (workspaces.length === 0) {
        console.log("No workspaces found, creating default workspace");
        try {
          const { workspace } = await supabase.createWorkspace("My Workspace");
          setWorkspaces([workspace]);
          setCurrentWorkspace(workspace);
          console.log("Created default workspace:", workspace);
        } catch (err) {
          console.error("Error creating default workspace:", err);
          toast.error("Failed to create default workspace");
        }
      } else {
        // Set current workspace to the first one if none is selected
        if (!currentWorkspace && workspaces.length > 0) {
          setCurrentWorkspace(workspaces[0]);
          console.log("Set current workspace to:", workspaces[0]);
        }
        
        // If the current workspace is no longer in the list, reset it
        if (currentWorkspace && !workspaces.find(w => w.id === currentWorkspace.id)) {
          setCurrentWorkspace(workspaces.length > 0 ? workspaces[0] : null);
          console.log("Reset current workspace to:", workspaces.length > 0 ? workspaces[0] : null);
        }
      }
      
    } catch (err) {
      console.error('Error loading workspaces:', err);
      setError('Failed to load workspaces');
      toast.error('Failed to load workspaces');
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadWorkspaces();
  }, []);

  // Create a new workspace
  const handleCreateWorkspace = async (name: string): Promise<Workspace> => {
    try {
      console.log("Creating workspace:", name);
      const { workspace, error } = await supabase.createWorkspace(name);
      
      if (error) {
        throw new Error(error);
      }
      
      await loadWorkspaces();
      toast.success(`Workspace "${name}" created`);
      return workspace;
    } catch (err: any) {
      console.error('Error creating workspace:', err);
      toast.error(err.message || 'Failed to create workspace');
      throw err;
    }
  };

  // Update a workspace
  const handleUpdateWorkspace = async (id: string, name: string): Promise<Workspace> => {
    try {
      console.log("Updating workspace:", id, name);
      const { workspace, error } = await supabase.updateWorkspace(id, name);
      
      if (error) {
        throw new Error(error);
      }
      
      // Update local state
      setWorkspaces(prev => prev.map(w => w.id === id ? workspace : w));
      if (currentWorkspace?.id === id) {
        setCurrentWorkspace(workspace);
      }
      
      toast.success(`Workspace updated to "${name}"`);
      return workspace;
    } catch (err: any) {
      console.error('Error updating workspace:', err);
      toast.error(err.message || 'Failed to update workspace');
      throw err;
    }
  };

  // Delete a workspace
  const handleDeleteWorkspace = async (id: string): Promise<boolean> => {
    try {
      console.log("Deleting workspace:", id);
      const { error } = await supabase.deleteWorkspace(id);
      
      if (error) {
        throw new Error(error);
      }
      
      // Update local state
      setWorkspaces(prev => prev.filter(w => w.id !== id));
      if (currentWorkspace?.id === id) {
        setCurrentWorkspace(workspaces.find(w => w.id !== id) || null);
      }
      
      toast.success('Workspace deleted');
      return true;
    } catch (err: any) {
      console.error('Error deleting workspace:', err);
      toast.error(err.message || 'Failed to delete workspace');
      throw err;
    }
  };

  const contextValue: WorkspaceContextType = {
    workspaces,
    currentWorkspace,
    isLoading,
    error,
    setCurrentWorkspace,
    refreshWorkspaces: loadWorkspaces,
    createWorkspace: handleCreateWorkspace,
    updateWorkspace: handleUpdateWorkspace,
    deleteWorkspace: handleDeleteWorkspace,
  };

  return (
    <WorkspaceContext.Provider value={contextValue}>
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
};
