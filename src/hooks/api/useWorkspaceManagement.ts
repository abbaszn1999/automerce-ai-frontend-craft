
import { supabase } from "@/integrations/supabase/client";
import { Workspace } from "@/types/workspace.types";
import { toast } from "sonner";

export const useWorkspaceManagement = (userId: string | undefined) => {
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
      
      // First check for existing workspaces with similar names to prevent errors
      const existingWorkspaces = await fetchWorkspaces();
      const alreadyExists = existingWorkspaces.some(ws => ws.name === name);
      
      if (alreadyExists) {
        toast.error(`A workspace named "${name}" already exists`);
        return null;
      }
      
      // Manual approach to create workspace and add user as owner to avoid conflicts
      // First, create the workspace
      const { data: newWorkspace, error: createError } = await supabase
        .from('workspaces')
        .insert({
          name,
          description
        })
        .select()
        .single();

      if (createError) {
        throw createError;
      }

      if (!newWorkspace) {
        toast.error("Failed to create workspace");
        return null;
      }

      // Then associate the user with the workspace
      const { error: userAssociationError } = await supabase
        .from('workspace_users')
        .insert({
          workspace_id: newWorkspace.id,
          user_id: userId,
          role: 'owner'
        });

      if (userAssociationError) {
        // If we fail to associate the user, clean up by deleting the workspace
        await supabase
          .from('workspaces')
          .delete()
          .eq('id', newWorkspace.id);
          
        // Check for duplicate user association
        if (userAssociationError.code === '23505') {
          console.error("Workspace user association conflict:", userAssociationError);
          toast.error("You already have access to a workspace with this name");
          return null;
        }
        
        throw userAssociationError;
      }
      
      toast.success(`Workspace "${name}" created successfully`);
      return newWorkspace as Workspace;
      
    } catch (error: any) {
      console.error("Error creating workspace:", error);
      toast.error(`Failed to create workspace: ${error.message}`);
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

  return {
    fetchWorkspaces,
    createWorkspace,
    updateWorkspace,
    deleteWorkspace
  };
};
