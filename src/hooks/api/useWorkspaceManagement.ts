
import { supabase } from "@/integrations/supabase/client";
import { Workspace } from "@/types/workspace.types";
import { toast } from "sonner";

export const useWorkspaceManagement = (userId: string | undefined) => {
  const fetchWorkspaces = async (): Promise<Workspace[]> => {
    if (!userId) {
      return [];
    }
    
    try {
      // With RLS in place, this will automatically return only the workspaces
      // the user has access to through the workspace_users table
      const { data, error } = await supabase
        .from('workspaces')
        .select('*');

      if (error) throw error;
      
      return data as Workspace[];
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
      const { data: existingWorkspaces, error: checkError } = await supabase
        .from('workspaces')
        .select('name')
        .eq('name', name)
        .limit(1);
      
      if (checkError) throw checkError;
      
      if (existingWorkspaces && existingWorkspaces.length > 0) {
        toast.error(`A workspace named "${name}" already exists`);
        return null;
      }
      
      // Insert the new workspace
      const { data: newWorkspace, error: createError } = await supabase
        .from('workspaces')
        .insert({
          name,
          description,
          owner_user_id: userId
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

      // Associate the user with the workspace as owner
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
      // RLS policies will ensure only workspace owners can update
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
      // RLS policies will ensure only workspace owners can delete
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
