
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useWorkspaceApi } from "./useWorkspaceApi";
import { Workspace, WorkspaceUser } from "@/types/workspace.types";

export const useWorkspaceState = () => {
  const { user } = useAuth();
  const workspaceApi = useWorkspaceApi(user?.id);
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
      
      const userWorkspaces = await workspaceApi.fetchWorkspaces();
      
      setWorkspaces(userWorkspaces);
      
      // If there are workspaces and no current workspace is selected, set the first one
      if (userWorkspaces.length > 0 && !currentWorkspace) {
        setCurrentWorkspace(userWorkspaces[0]);
        
        // Store the selected workspace in localStorage
        localStorage.setItem('currentWorkspaceId', userWorkspaces[0].id);
      }
      
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateWorkspace = async (name: string, description: string): Promise<Workspace | null> => {
    const newWorkspace = await workspaceApi.createWorkspace(name, description);
    if (newWorkspace) {
      // Update local state
      setWorkspaces([...workspaces, newWorkspace]);
      setCurrentWorkspace(newWorkspace);
      
      // Store in localStorage
      localStorage.setItem('currentWorkspaceId', newWorkspace.id);
    }
    return newWorkspace;
  };

  const handleUpdateWorkspace = async (id: string, name: string, description: string): Promise<boolean> => {
    const success = await workspaceApi.updateWorkspace(id, name, description);
    
    if (success) {
      // Update local state
      const updatedWorkspaces = workspaces.map(ws => 
        ws.id === id ? { ...ws, name, description } : ws
      );
      setWorkspaces(updatedWorkspaces);
      
      // Update current workspace if it's the one being updated
      if (currentWorkspace?.id === id) {
        setCurrentWorkspace({ ...currentWorkspace, name, description });
      }
    }
    
    return success;
  };

  const handleDeleteWorkspace = async (id: string): Promise<boolean> => {
    const success = await workspaceApi.deleteWorkspace(id);
    
    if (success) {
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
    }
    
    return success;
  };

  const handleFetchWorkspaceUsers = async (workspaceId: string) => {
    const users = await workspaceApi.fetchWorkspaceUsers(workspaceId);
    setWorkspaceUsers(users);
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

  return {
    workspaces,
    currentWorkspace,
    isLoading,
    workspaceUsers,
    setCurrentWorkspace,
    fetchWorkspaces,
    createWorkspace: handleCreateWorkspace,
    updateWorkspace: handleUpdateWorkspace,
    deleteWorkspace: handleDeleteWorkspace,
    fetchWorkspaceUsers: handleFetchWorkspaceUsers,
    inviteUserToWorkspace: workspaceApi.inviteUserToWorkspace
  };
};
