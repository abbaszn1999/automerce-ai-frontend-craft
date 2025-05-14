
import React, { createContext, useContext, useState, useEffect } from "react";
import { storage } from "../services/storageService";
import { Workspace, WorkspaceUser } from "@/types/workspace.types";

interface WorkspaceContextType {
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  isLoading: boolean;
  workspaceUsers: WorkspaceUser[];
  setCurrentWorkspace: (workspace: Workspace) => void;
  fetchWorkspaces: () => Promise<void>;
  createWorkspace: (name: string, description: string) => Promise<Workspace | null>;
  updateWorkspace: (id: string, name: string, description: string) => Promise<boolean>;
  deleteWorkspace: (id: string) => Promise<boolean>;
  fetchWorkspaceUsers: (workspaceId: string) => Promise<void>;
  inviteUserToWorkspace: (workspaceId: string, email: string, role: string) => Promise<boolean>;
  removeUserFromWorkspace: (workspaceId: string, userIdToRemove: string) => Promise<boolean>;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [workspaceUsers, setWorkspaceUsers] = useState<WorkspaceUser[]>([]);

  // Load demo workspaces initially
  useEffect(() => {
    fetchWorkspaces();
  }, []);

  // When current workspace changes, save to localStorage
  useEffect(() => {
    if (currentWorkspace) {
      storage.set('currentWorkspaceId', currentWorkspace.id);
    }
  }, [currentWorkspace]);

  const fetchWorkspaces = async () => {
    setIsLoading(true);
    try {
      // Get workspaces from local storage or initialize with demo data if none exist
      let storedWorkspaces = storage.get<Workspace[]>('workspaces');
      
      if (!storedWorkspaces || storedWorkspaces.length === 0) {
        // Initialize with a demo workspace
        const demoWorkspace: Workspace = {
          id: 'demo-workspace-' + Date.now(),
          name: 'Demo Workspace',
          description: 'A demo workspace for testing',
          created_at: new Date().toISOString(),
          owner_user_id: 'demo-user'
        };
        storedWorkspaces = [demoWorkspace];
        storage.set('workspaces', storedWorkspaces);
      }

      // Ensure all workspaces have a created_at field
      storedWorkspaces = storedWorkspaces.map(ws => ({
        ...ws,
        created_at: ws.created_at || new Date().toISOString()
      }));
      
      setWorkspaces(storedWorkspaces);
      
      // Set current workspace from localStorage or use the first one
      const storedWorkspaceId = storage.get<string>('currentWorkspaceId');
      if (storedWorkspaceId) {
        const existingWorkspace = storedWorkspaces.find(w => w.id === storedWorkspaceId);
        if (existingWorkspace) {
          setCurrentWorkspace(existingWorkspace);
        } else {
          setCurrentWorkspace(storedWorkspaces[0]);
        }
      } else if (storedWorkspaces.length > 0) {
        setCurrentWorkspace(storedWorkspaces[0]);
      }
    } catch (error) {
      console.error('Error fetching workspaces:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createWorkspace = async (name: string, description: string): Promise<Workspace | null> => {
    try {
      const newWorkspace: Workspace = {
        id: 'workspace-' + Date.now(),
        name,
        description,
        created_at: new Date().toISOString(),
        owner_user_id: 'current-user'
      };
      
      const updatedWorkspaces = [...workspaces, newWorkspace];
      storage.set('workspaces', updatedWorkspaces);
      setWorkspaces(updatedWorkspaces);
      setCurrentWorkspace(newWorkspace);
      
      return newWorkspace;
    } catch (error) {
      console.error('Error creating workspace:', error);
      return null;
    }
  };

  const updateWorkspace = async (id: string, name: string, description: string): Promise<boolean> => {
    try {
      const updatedWorkspaces = workspaces.map(ws => 
        ws.id === id ? { ...ws, name, description } : ws
      );
      
      storage.set('workspaces', updatedWorkspaces);
      setWorkspaces(updatedWorkspaces);
      
      if (currentWorkspace?.id === id) {
        setCurrentWorkspace({ ...currentWorkspace, name, description });
      }
      
      return true;
    } catch (error) {
      console.error('Error updating workspace:', error);
      return false;
    }
  };

  const deleteWorkspace = async (id: string): Promise<boolean> => {
    try {
      const updatedWorkspaces = workspaces.filter(ws => ws.id !== id);
      storage.set('workspaces', updatedWorkspaces);
      setWorkspaces(updatedWorkspaces);
      
      if (currentWorkspace?.id === id) {
        setCurrentWorkspace(updatedWorkspaces.length > 0 ? updatedWorkspaces[0] : null);
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting workspace:', error);
      return false;
    }
  };

  const fetchWorkspaceUsers = async (workspaceId: string) => {
    // Implement with your own API or use local storage
    const users = storage.get<WorkspaceUser[]>(`workspaceUsers:${workspaceId}`) || [];
    setWorkspaceUsers(users);
  };

  const inviteUserToWorkspace = async (workspaceId: string, email: string, role: string): Promise<boolean> => {
    try {
      // In a real implementation, you would send an invitation email
      // For now, we'll simulate adding the user immediately
      const newUser: WorkspaceUser = {
        user_id: 'user-id-' + email,
        workspace_id: workspaceId,
        role,
        created_at: new Date().toISOString(),
        email: email
      };
      
      const currentUsers = storage.get<WorkspaceUser[]>(`workspaceUsers:${workspaceId}`) || [];
      const updatedUsers = [...currentUsers, newUser];
      storage.set(`workspaceUsers:${workspaceId}`, updatedUsers);
      
      if (workspaceId === currentWorkspace?.id) {
        setWorkspaceUsers(updatedUsers);
      }
      
      return true;
    } catch (error) {
      console.error('Error inviting user to workspace:', error);
      return false;
    }
  };

  const removeUserFromWorkspace = async (workspaceId: string, userIdToRemove: string): Promise<boolean> => {
    try {
      const currentUsers = storage.get<WorkspaceUser[]>(`workspaceUsers:${workspaceId}`) || [];
      const updatedUsers = currentUsers.filter(user => user.user_id !== userIdToRemove);
      storage.set(`workspaceUsers:${workspaceId}`, updatedUsers);
      
      if (workspaceId === currentWorkspace?.id) {
        setWorkspaceUsers(updatedUsers);
      }
      
      return true;
    } catch (error) {
      console.error('Error removing user from workspace:', error);
      return false;
    }
  };

  return (
    <WorkspaceContext.Provider 
      value={{
        workspaces,
        currentWorkspace,
        isLoading,
        workspaceUsers,
        setCurrentWorkspace,
        fetchWorkspaces,
        createWorkspace,
        updateWorkspace,
        deleteWorkspace,
        fetchWorkspaceUsers,
        inviteUserToWorkspace,
        removeUserFromWorkspace
      }}
    >
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
