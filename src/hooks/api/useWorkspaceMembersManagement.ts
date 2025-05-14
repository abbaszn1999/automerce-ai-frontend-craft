
import { storage } from "@/services/storageService";
import { WorkspaceUser } from "@/types/workspace.types";
import { toast } from "sonner";

export const useWorkspaceMembersManagement = (userId: string | undefined) => {
  const fetchWorkspaceUsers = async (workspaceId: string): Promise<WorkspaceUser[]> => {
    try {
      const users = storage.get<WorkspaceUser[]>(`workspaceUsers:${workspaceId}`) || [];
      return users;
    } catch (error: any) {
      console.error("Error fetching workspace users:", error);
      toast.error("Failed to load workspace members");
      return [];
    }
  };

  const inviteUserToWorkspace = async (
    workspaceId: string, 
    email: string, 
    role: string
  ): Promise<boolean> => {
    try {
      // Check if user is already in the workspace
      const existingUsers = storage.get<WorkspaceUser[]>(`workspaceUsers:${workspaceId}`) || [];
      if (existingUsers.some(user => user.email === email)) {
        toast.error(`User ${email} is already a member of this workspace`);
        return false;
      }
      
      // Add the user to the workspace
      const newUser: WorkspaceUser = {
        user_id: `user-${Date.now()}`,
        workspace_id: workspaceId,
        email, // Adding email for compatibility
        role,
        created_at: new Date().toISOString()
      };
      
      const updatedUsers = [...existingUsers, newUser];
      storage.set(`workspaceUsers:${workspaceId}`, updatedUsers);
      
      toast.success(`User ${email} invited to workspace successfully`);
      return true;
    } catch (error: any) {
      console.error("Error inviting user:", error);
      toast.error(`Failed to invite user: ${error.message}`);
      return false;
    }
  };

  const removeUserFromWorkspace = async (
    workspaceId: string,
    userIdToRemove: string
  ): Promise<boolean> => {
    try {
      // Prevent removing yourself as owner
      if (userIdToRemove === userId) {
        toast.error("You cannot remove yourself as the workspace owner");
        return false;
      }
      
      // Remove the user from the workspace
      const existingUsers = storage.get<WorkspaceUser[]>(`workspaceUsers:${workspaceId}`) || [];
      const updatedUsers = existingUsers.filter(user => user.user_id !== userIdToRemove);
      
      storage.set(`workspaceUsers:${workspaceId}`, updatedUsers);
      
      toast.success("User removed from workspace successfully");
      return true;
    } catch (error: any) {
      console.error("Error removing user:", error);
      toast.error(`Failed to remove user: ${error.message}`);
      return false;
    }
  };

  return {
    fetchWorkspaceUsers,
    inviteUserToWorkspace,
    removeUserFromWorkspace
  };
};
