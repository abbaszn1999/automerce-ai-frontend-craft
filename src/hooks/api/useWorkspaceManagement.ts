
import { storage } from "@/services/storageService";
import { Workspace } from "@/types/workspace.types";
import { toast } from "sonner";

export const useWorkspaceManagement = (userId: string | undefined) => {
  const fetchWorkspaces = async (): Promise<Workspace[]> => {
    if (!userId) {
      return [];
    }
    
    try {
      const workspaces = storage.get<Workspace[]>('workspaces') || [];
      return workspaces;
    } catch (error: any) {
      console.error("Error fetching workspaces:", error);
      toast.error("Failed to load workspaces");
      return [];
    }
  };

  const createWorkspace = async (name: string, description: string): Promise<Workspace | null> => {
    try {
      if (!userId) {
        toast.error("You must be logged in to create a workspace");
        return null;
      }
      
      // Check for existing workspaces with similar names
      const existingWorkspaces = storage.get<Workspace[]>('workspaces') || [];
      if (existingWorkspaces.some(ws => ws.name === name)) {
        toast.error(`A workspace named "${name}" already exists`);
        return null;
      }
      
      // Create a new workspace
      const newWorkspace: Workspace = {
        id: `workspace-${Date.now()}`,
        name,
        description,
        owner_user_id: userId,
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

  const updateWorkspace = async (id: string, name: string, description: string): Promise<boolean> => {
    try {
      const workspaces = storage.get<Workspace[]>('workspaces') || [];
      const updatedWorkspaces = workspaces.map(ws => 
        ws.id === id ? { ...ws, name, description } : ws
      );
      
      storage.set('workspaces', updatedWorkspaces);
      toast.success(`Workspace "${name}" updated successfully`);
      return true;
    } catch (error: any) {
      console.error("Error updating workspace:", error);
      toast.error(`Failed to update workspace: ${error.message}`);
      return false;
    }
  };

  const deleteWorkspace = async (id: string): Promise<boolean> => {
    try {
      const workspaces = storage.get<Workspace[]>('workspaces') || [];
      const updatedWorkspaces = workspaces.filter(ws => ws.id !== id);
      
      storage.set('workspaces', updatedWorkspaces);
      toast.success("Workspace deleted successfully");
      return true;
    } catch (error: any) {
      console.error("Error deleting workspace:", error);
      toast.error(`Failed to delete workspace: ${error.message}`);
      return false;
    }
  };

  return {
    fetchWorkspaces,
    createWorkspace,
    updateWorkspace,
    deleteWorkspace
  };
};
