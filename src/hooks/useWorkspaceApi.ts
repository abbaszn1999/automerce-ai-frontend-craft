import { supabase } from "@/integrations/supabase/client";
import { Workspace, WorkspaceUser } from "@/types/workspace.types";
import { toast } from "sonner";

export const useWorkspaceApi = (userId: string | undefined) => {
  const fetchWorkspaces = async (): Promise<Workspace[]> => {
    if (!userId) {
      return [];
    }
    
    try {
      // First get the workspace IDs this user has access to
      const { data: workspaceUsersData, error: workspaceUsersError } = await supabase
        .from('workspace_users')
        .select('workspace_id')
        .eq('user_id', userId);

      if (workspaceUsersError) throw workspaceUsersError;
      
      if (!workspaceUsersData || workspaceUsersData.length === 0) {
        return [];
      }
      
      const workspaceIds = workspaceUsersData.map(wu => wu.workspace_id);
      
      // Then fetch the actual workspace details
      const { data: workspacesData, error: workspacesError } = await supabase
        .from('workspaces')
        .select('*')
        .in('id', workspaceIds);
      
      if (workspacesError) throw workspacesError;
      
      return workspacesData as Workspace[];
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
      
      // Insert the workspace directly - the trigger we created will handle the workspace_user relationship
      const { data: workspaceData, error: workspaceError } = await supabase
        .from('workspaces')
        .insert({
          name,
          description
        })
        .select()
        .single();

      if (workspaceError) throw workspaceError;
      
      toast.success(`Workspace "${name}" created successfully`);
      return workspaceData as Workspace;
      
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
      const { error } = await supabase
        .from('workspaces')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast.success("Workspace deleted successfully");
      return true;
      
    } catch (error: any) {
      console.error("Error deleting workspace:", error);
      toast.error(`Failed to delete workspace: ${error.message}`);
      return false;
    }
  };

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
    fetchWorkspaces,
    createWorkspace,
    updateWorkspace,
    deleteWorkspace,
    fetchWorkspaceUsers,
    inviteUserToWorkspace
  };
};
