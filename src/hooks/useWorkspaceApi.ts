
import { storage } from "@/services/storageService";
import { Workspace, WorkspaceUser } from "@/types/workspace.types";
import { toast } from "sonner";

// Function to get all workspaces the user has access to
const fetchWorkspaces = async (): Promise<Workspace[]> => {
  try {
    const workspaces = storage.get<Workspace[]>('workspaces') || [];
    
    // Ensure all workspaces have a created_at field
    return workspaces.map(ws => ({
      ...ws,
      created_at: ws.created_at || new Date().toISOString()
    }));
  } catch (error) {
    console.error("Error fetching workspaces:", error);
    toast.error("Failed to load workspaces");
    return [];
  }
};

// Function to create a new workspace
const createWorkspace = async (name: string, description: string): Promise<Workspace | null> => {
  try {
    // Check if workspace with same name already exists
    const existingWorkspaces = storage.get<Workspace[]>('workspaces') || [];
    if (existingWorkspaces.some(ws => ws.name === name)) {
      toast.error(`A workspace named "${name}" already exists`);
      return null;
    }

    // Create new workspace
    const newWorkspace: Workspace = {
      id: `workspace-${Date.now()}`,
      name,
      description,
      owner_user_id: 'current-user', // In real implementation, use actual user id
      created_at: new Date().toISOString()
    };

    // Save to storage
    const updatedWorkspaces = [...existingWorkspaces, newWorkspace];
    storage.set('workspaces', updatedWorkspaces);

    toast.success(`Workspace "${name}" created successfully`);
    return newWorkspace;
  } catch (error: any) {
    console.error("Error creating workspace:", error);
    toast.error(`Failed to create workspace: ${error.message}`);
    return null;
  }
};

// Function to update an existing workspace
const updateWorkspace = async (id: string, name: string, description: string): Promise<boolean> => {
  try {
    const workspaces = storage.get<Workspace[]>('workspaces') || [];
    const updatedWorkspaces = workspaces.map(ws => 
      ws.id === id ? { ...ws, name, description } : ws
    );
    
    storage.set('workspaces', updatedWorkspaces);
    toast.success(`Workspace "${name}" updated successfully`);
    return true;
  } catch (error) {
    console.error("Error updating workspace:", error);
    toast.error(`Failed to update workspace: ${error.message}`);
    return false;
  }
};

// Function to delete a workspace
const deleteWorkspace = async (id: string): Promise<boolean> => {
  try {
    const workspaces = storage.get<Workspace[]>('workspaces') || [];
    const updatedWorkspaces = workspaces.filter(ws => ws.id !== id);
    
    storage.set('workspaces', updatedWorkspaces);
    toast.success("Workspace deleted successfully");
    return true;
  } catch (error) {
    console.error("Error deleting workspace:", error);
    toast.error(`Failed to delete workspace: ${error.message}`);
    return false;
  }
};

// Function to get users in a workspace
const fetchWorkspaceUsers = async (workspaceId: string): Promise<WorkspaceUser[]> => {
  try {
    const users = storage.get<WorkspaceUser[]>(`workspaceUsers:${workspaceId}`) || [];
    
    // Ensure all users have a created_at field
    return users.map(user => ({
      ...user,
      created_at: user.created_at || new Date().toISOString()
    }));
  } catch (error) {
    console.error("Error fetching workspace users:", error);
    toast.error("Failed to load workspace members");
    return [];
  }
};

// Function to invite a user to a workspace
const inviteUserToWorkspace = async (
  workspaceId: string,
  email: string,
  role: string
): Promise<boolean> => {
  try {
    // Check if user already exists in workspace
    const existingUsers = storage.get<WorkspaceUser[]>(`workspaceUsers:${workspaceId}`) || [];
    if (existingUsers.some(user => user.email === email)) {
      toast.error(`User ${email} is already a member of this workspace`);
      return false;
    }

    // In a real implementation, you'd check if the user exists in your system
    // For now, we'll simulate adding a new user
    const newUser: WorkspaceUser = {
      user_id: `user-${Date.now()}`,
      email, // Adding email for compatibility
      workspace_id: workspaceId,
      role,
      created_at: new Date().toISOString()
    };

    const updatedUsers = [...existingUsers, newUser];
    storage.set(`workspaceUsers:${workspaceId}`, updatedUsers);
    
    toast.success(`User ${email} invited to workspace successfully`);
    return true;
  } catch (error) {
    console.error("Error inviting user:", error);
    toast.error(`Failed to invite user: ${error.message}`);
    return false;
  }
};

// Function to remove a user from a workspace
const removeUserFromWorkspace = async (
  workspaceId: string,
  userIdToRemove: string
): Promise<boolean> => {
  try {
    const users = storage.get<WorkspaceUser[]>(`workspaceUsers:${workspaceId}`) || [];
    const updatedUsers = users.filter(user => user.user_id !== userIdToRemove);
    
    storage.set(`workspaceUsers:${workspaceId}`, updatedUsers);
    toast.success("User removed from workspace successfully");
    return true;
  } catch (error) {
    console.error("Error removing user:", error);
    toast.error(`Failed to remove user: ${error.message}`);
    return false;
  }
};

export const useWorkspaceApi = (userId: string | undefined) => {
  return {
    // Workspace management methods
    fetchWorkspaces,
    createWorkspace,
    updateWorkspace,
    deleteWorkspace,

    // User management methods
    fetchWorkspaceUsers,
    inviteUserToWorkspace,
    removeUserFromWorkspace
  };
};
