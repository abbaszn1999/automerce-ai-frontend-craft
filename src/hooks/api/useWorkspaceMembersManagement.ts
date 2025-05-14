
import { supabase } from "@/integrations/supabase/client";
import { WorkspaceUser } from "@/types/workspace.types";
import { toast } from "sonner";

export const useWorkspaceMembersManagement = (userId: string | undefined) => {
  const fetchWorkspaceUsers = async (workspaceId: string): Promise<WorkspaceUser[]> => {
    try {
      // This will only succeed if the user has access to this workspace due to RLS
      const { data, error } = await supabase
        .from('workspace_users')
        .select('*')
        .eq('workspace_id', workspaceId);
      
      if (error) throw error;
      
      return data as WorkspaceUser[];
      
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
      // Get the user ID from the email
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single();
      
      if (userError) {
        toast.error(`User with email ${email} not found`);
        return false;
      }
      
      // Check if user is already in the workspace
      const { data: existingUser, error: existingUserError } = await supabase
        .from('workspace_users')
        .select('*')
        .eq('workspace_id', workspaceId)
        .eq('user_id', userData.id)
        .single();
        
      if (existingUser) {
        toast.error(`User ${email} is already a member of this workspace`);
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
      const { error } = await supabase
        .from('workspace_users')
        .delete()
        .eq('workspace_id', workspaceId)
        .eq('user_id', userIdToRemove);
      
      if (error) throw error;
      
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
