
import { supabase } from "@/integrations/supabase/client";
import { Workspace, WorkspaceUser } from "@/types/workspace.types";
import { toast } from "sonner";

export const useWorkspaceApi = (userId: string | undefined) => {
  const fetchWorkspaces = async (): Promise<Workspace[]> => {
    if (!userId) {
      return [];
    }
    
    try {
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
        .eq('user_id', userId);

      if (error) throw error;

      // Transform data to extract workspace objects
      return data.map((item: any) => item.workspaces) as Workspace[];
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
      const { error: userWorkspaceError } = await supabase
        .from('workspace_users')
        .insert({
          workspace_id: newWorkspace.id,
          user_id: userId,
          role: 'owner'
        });

      if (userWorkspaceError) {
        // If there was an error adding the user to the workspace,
        // attempt to delete the workspace we just created to avoid orphaned workspaces
        await supabase.from('workspaces').delete().eq('id', newWorkspace.id);
        throw userWorkspaceError;
      }
      
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
