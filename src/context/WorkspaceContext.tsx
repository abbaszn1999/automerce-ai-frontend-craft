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
  const { getWorkspaces, createWorkspace: createWorkspaceApi, updateWorkspace: updateWorkspaceApi, deleteWorkspace: deleteWorkspaceApi, isAuthenticated, isCheckingAuth } = useSupabase();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);
  const [hasTriedLoading, setHasTriedLoading] = useState(false);

  // Load workspaces when authenticated
  useEffect(() => {
    // Wait until auth check completes
    if (isCheckingAuth) return;
    
    // If we're not authenticated, don't try loading workspaces
    if (isAuthenticated === false) {
      setIsLoading(false);
      return;
    }
    
    // If authenticated, load workspaces
    if (isAuthenticated === true && !hasTriedLoading) {
      loadWorkspaces();
      setHasTriedLoading(true);
    }
  }, [isAuthenticated, isCheckingAuth, hasTriedLoading]);

  // Load workspaces function
  const loadWorkspaces = async () => {
    try {
      if (!isAuthenticated) {
        console.log("Not authenticated, skipping workspace load");
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      setError(null);

      console.log("Loading workspaces...");
      const { workspaces = [], error } = await getWorkspaces();
      
      if (error) {
        throw new Error(error);
      }
      
      console.log(`Loaded ${workspaces.length} workspaces:`, workspaces);
      setWorkspaces(workspaces);
      
      // If no workspaces exist, create a default one
      if (workspaces.length === 0) {
        console.log("No workspaces found, creating default workspace");
        try {
          const { workspace, error: createError } = await createWorkspaceApi("My Workspace");
          
          if (createError) {
            throw new Error(createError);
          }
          
          if (!workspace) {
            throw new Error("Failed to create workspace - no workspace returned");
          }
          
          console.log("Created default workspace:", workspace);
          setWorkspaces([workspace]);
          setCurrentWorkspace(workspace);
          
          // Save to localStorage
          localStorage.setItem('currentWorkspaceId', workspace.id);
        } catch (err: any) {
          console.error("Error creating default workspace:", err);
          toast.error("Failed to create default workspace");
          // Even if we fail to create a workspace, don't throw an error
          // We'll just have no current workspace until the user creates one
        }
      } else {
        // Set current workspace to the first one if none is selected
        if (!currentWorkspace && workspaces.length > 0) {
          // Check for saved workspace ID in localStorage
          const savedWorkspaceId = localStorage.getItem('currentWorkspaceId');
          
          if (savedWorkspaceId) {
            const savedWorkspace = workspaces.find(w => w.id === savedWorkspaceId);
            
            if (savedWorkspace) {
              console.log('Restored workspace from localStorage:', savedWorkspace);
              setCurrentWorkspace(savedWorkspace);
            } else {
              // If saved workspace not found, use the first one
              setCurrentWorkspace(workspaces[0]);
              localStorage.setItem('currentWorkspaceId', workspaces[0].id);
              console.log("Saved workspace not found in list, using first workspace:", workspaces[0]);
            }
          } else {
            setCurrentWorkspace(workspaces[0]);
            localStorage.setItem('currentWorkspaceId', workspaces[0].id);
            console.log("No saved workspace, using first workspace:", workspaces[0]);
          }
        }
        
        // If the current workspace is no longer in the list, reset it
        if (currentWorkspace && !workspaces.find(w => w.id === currentWorkspace.id)) {
          if (workspaces.length > 0) {
            const newWorkspace = workspaces[0];
            setCurrentWorkspace(newWorkspace);
            localStorage.setItem('currentWorkspaceId', newWorkspace.id);
            console.log("Reset current workspace to:", newWorkspace);
          } else {
            setCurrentWorkspace(null);
            localStorage.removeItem('currentWorkspaceId');
            console.log("Reset current workspace to null - no workspaces available");
          }
        }
      }
      
      setIsInitialized(true);
      
    } catch (err: any) {
      console.error('Error loading workspaces:', err);
      setError(err.message || 'Failed to load workspaces');
      
      // If we fail to load workspaces but have a current workspace, keep it
      if (!currentWorkspace && retryCount < 3 && isAuthenticated) {
        console.log(`Retrying workspace load (attempt ${retryCount + 1})...`);
        setRetryCount(prev => prev + 1);
        
        // Retry after a delay
        setTimeout(() => {
          loadWorkspaces();
        }, 1000 * (retryCount + 1)); 
      } else if (!currentWorkspace && isAuthenticated) {
        toast.error('Failed to load workspaces');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Save the current workspace ID to localStorage whenever it changes
  useEffect(() => {
    if (currentWorkspace) {
      localStorage.setItem('currentWorkspaceId', currentWorkspace.id);
      console.log(`Current workspace set to: ${currentWorkspace.name} (${currentWorkspace.id})`);
    }
  }, [currentWorkspace]);

  // Create a new workspace
  const handleCreateWorkspace = async (name: string): Promise<Workspace> => {
    try {
      console.log("Creating workspace:", name);
      const { workspace, error } = await createWorkspaceApi(name);
      
      if (error) {
        throw new Error(error);
      }
      
      if (!workspace) {
        throw new Error("No workspace returned from API");
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
      const { workspace, error } = await updateWorkspaceApi(id, name);
      
      if (error) {
        throw new Error(error);
      }
      
      if (!workspace) {
        throw new Error("No workspace returned from API");
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
      const { error } = await deleteWorkspaceApi(id);
      
      if (error) {
        throw new Error(error);
      }
      
      // Update local state
      setWorkspaces(prev => prev.filter(w => w.id !== id));
      if (currentWorkspace?.id === id) {
        const remainingWorkspace = workspaces.find(w => w.id !== id);
        if (remainingWorkspace) {
          setCurrentWorkspace(remainingWorkspace);
          localStorage.setItem('currentWorkspaceId', remainingWorkspace.id);
        } else {
          setCurrentWorkspace(null);
          localStorage.removeItem('currentWorkspaceId');
        }
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
