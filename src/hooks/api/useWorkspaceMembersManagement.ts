
import { supabase } from "@/integrations/supabase/client";
import { WorkspaceUser } from "@/types/workspace.types";
import { toast } from "sonner";

export const useWorkspaceMembersManagement = (userId: string | undefined) => {
  const fetchWorkspaceUsers = async (workspaceId: string): Promise<WorkspaceUser[]> => {
    try {
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
      
      toast.success(`User ${email} invited to workspace successfully`);
      return true;
      
    } catch (error: any) {
      console.error("Error inviting user:", error);
      toast.error(`Failed to invite user: ${error.message}`);
      return false;
    }
  };

  return {
    fetchWorkspaceUsers,
    inviteUserToWorkspace
  };
};
