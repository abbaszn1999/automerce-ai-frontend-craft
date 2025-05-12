
import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

interface Workspace {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

interface WorkspaceUser {
  workspace_id: string;
  user_id: string;
  role: string;
  created_at: string;
}

interface WorkspaceContextType {
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  isLoading: boolean;
  fetchWorkspaces: () => Promise<void>;
  setCurrentWorkspace: (workspace: Workspace | null) => void;
  createWorkspace: (name: string, description: string) => Promise<Workspace | null>;
  updateWorkspace: (id: string, name: string, description: string) => Promise<boolean>;
  deleteWorkspace: (id: string) => Promise<boolean>;
  workspaceUsers: WorkspaceUser[];
  fetchWorkspaceUsers: (workspaceId: string) => Promise<void>;
  inviteUserToWorkspace: (workspaceId: string, email: string, role: string) => Promise<boolean>;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [workspaceUsers, setWorkspaceUsers] = useState<WorkspaceUser[]>([]);

  // Fetch workspaces for the current user
  const fetchWorkspaces = async () => {
    try {
      setIsLoading(true);
      
      if (!user) {
        setWorkspaces([]);
        setCurrentWorkspace(null);
        return;
      }
      
      const { data, error } = await supabase
        .from('workspace_users')
        .select(`
          workspace_id,
          workspaces:workspace_id (
            id, 
            name, 
            description,
            created_at
          )
        `)
        .eq('user_id', user.id);

      if (error) throw error;

      // Transform data to extract workspace objects
      const userWorkspaces = data.map((item: any) => item.workspaces) as Workspace[];
      
      setWorkspaces(userWorkspaces);
      
      // If there are workspaces and no current workspace is selected, set the first one
      if (userWorkspaces.length > 0 && !currentWorkspace) {
        setCurrentWorkspace(userWorkspaces[0]);
        
        // Store the selected workspace in localStorage
        localStorage.setItem('currentWorkspaceId', userWorkspaces[0].id);
      }
      
    } catch (error: any) {
      console.error("Error fetching workspaces:", error);
      toast.error("Failed to load workspaces");
    } finally {
      setIsLoading(false);
    }
  };

  // Create a new workspace
  const createWorkspace = async (name: string, description: string): Promise<Workspace | null> => {
    try {
      if (!user) {
        toast.error("You must be logged in to create a workspace");
        return null;
      }
      
      // First, create the workspace
      const { data: workspaceData, error: workspaceError } = await supabase
        .from('workspaces')
        .insert({
          name,
          description
        })
        .select()
        .single();

      if (workspaceError) throw workspaceError;
      
      const newWorkspace = workspaceData as Workspace;

      // Then, create the workspace_user relationship with a separate query
      // This avoids using the composite function which seems to be causing the error
      const { error: userWorkspaceError } = await supabase
        .from('workspace_users')
        .insert({
          workspace_id: newWorkspace.id,
          user_id: user.id,
          role: 'owner'
        });

      if (userWorkspaceError) {
        // If there was an error adding the user to the workspace,
        // attempt to delete the workspace we just created to avoid orphaned workspaces
        await supabase.from('workspaces').delete().eq('id', newWorkspace.id);
        throw userWorkspaceError;
      }
      
      // Update local state
      setWorkspaces([...workspaces, newWorkspace]);
      setCurrentWorkspace(newWorkspace);
      
      // Store in localStorage
      localStorage.setItem('currentWorkspaceId', newWorkspace.id);
      
      toast.success(`Workspace "${name}" created successfully`);
      return newWorkspace;
      
    } catch (error: any) {
      console.error("Error creating workspace:", error);
      
      if (error.message.includes("workspace_users_pkey")) {
        toast.error("Failed to create workspace: You already have a role in this workspace");
      } else {
        toast.error(`Failed to create workspace: ${error.message}`);
      }
      
      return null;
    }
  };

  // Update a workspace
  const updateWorkspace = async (id: string, name: string, description: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('workspaces')
        .update({ 
          name, 
          description 
        })
        .eq('id', id);
      
      if (error) throw error;
      
      // Update local state
      const updatedWorkspaces = workspaces.map(ws => 
        ws.id === id ? { ...ws, name, description } : ws
      );
      setWorkspaces(updatedWorkspaces);
      
      // Update current workspace if it's the one being updated
      if (currentWorkspace?.id === id) {
        setCurrentWorkspace({ ...currentWorkspace, name, description });
      }
      
      toast.success(`Workspace "${name}" updated successfully`);
      return true;
      
    } catch (error: any) {
      console.error("Error updating workspace:", error);
      toast.error(`Failed to update workspace: ${error.message}`);
      return false;
    }
  };

  // Delete a workspace
  const deleteWorkspace = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('workspaces')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Update local state
      const updatedWorkspaces = workspaces.filter(ws => ws.id !== id);
      setWorkspaces(updatedWorkspaces);
      
      // If the deleted workspace was the current one, set the first available workspace as current
      if (currentWorkspace?.id === id) {
        const newCurrentWorkspace = updatedWorkspaces.length > 0 ? updatedWorkspaces[0] : null;
        setCurrentWorkspace(newCurrentWorkspace);
        
        if (newCurrentWorkspace) {
          localStorage.setItem('currentWorkspaceId', newCurrentWorkspace.id);
        } else {
          localStorage.removeItem('currentWorkspaceId');
        }
      }
      
      toast.success("Workspace deleted successfully");
      return true;
      
    } catch (error: any) {
      console.error("Error deleting workspace:", error);
      toast.error(`Failed to delete workspace: ${error.message}`);
      return false;
    }
  };

  // Fetch workspace users
  const fetchWorkspaceUsers = async (workspaceId: string) => {
    try {
      const { data, error } = await supabase
        .from('workspace_users')
        .select('*')
        .eq('workspace_id', workspaceId);
      
      if (error) throw error;
      
      setWorkspaceUsers(data);
      
    } catch (error: any) {
      console.error("Error fetching workspace users:", error);
      toast.error("Failed to load workspace members");
    }
  };

  // Invite a user to a workspace
  const inviteUserToWorkspace = async (
    workspaceId: string, 
    email: string, 
    role: string
  ): Promise<boolean> => {
    try {
      // First, we need to get the user ID from the email
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single();
      
      if (userError) {
        toast.error(`User with email ${email} not found`);
        return false;
      }
      
      // Add the user to the workspace
      const { error } = await supabase
        .from('workspace_users')
        .insert({
          workspace_id: workspaceId,
          user_id: userData.id,
          role
        });
      
      if (error) throw error;
      
      // Refresh the workspace users list
      await fetchWorkspaceUsers(workspaceId);
      
      toast.success(`User ${email} invited to workspace successfully`);
      return true;
      
    } catch (error: any) {
      console.error("Error inviting user:", error);
      toast.error(`Failed to invite user: ${error.message}`);
      return false;
    }
  };

  // Load the previously selected workspace from localStorage on initial mount
  useEffect(() => {
    if (user) {
      fetchWorkspaces();
      
      // Check if there's a stored workspace ID in localStorage
      const storedWorkspaceId = localStorage.getItem('currentWorkspaceId');
      
      if (storedWorkspaceId && workspaces.length > 0) {
        const storedWorkspace = workspaces.find(ws => ws.id === storedWorkspaceId);
        if (storedWorkspace) {
          setCurrentWorkspace(storedWorkspace);
        }
      }
    }
  }, [user]);

  const value = {
    workspaces,
    currentWorkspace,
    isLoading,
    fetchWorkspaces,
    setCurrentWorkspace,
    createWorkspace,
    updateWorkspace,
    deleteWorkspace,
    workspaceUsers,
    fetchWorkspaceUsers,
    inviteUserToWorkspace
  };

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
};

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error("useWorkspace must be used within a WorkspaceProvider");
  }
  return context;
};
