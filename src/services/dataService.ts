
import { supabase } from "@/integrations/supabase/client";

export interface Project {
  id: string;
  name: string;
  last_updated?: Date;
  workspace_id: string;
}

export const dataService = {
  async getProjects(workspaceId: string, solutionPrefix: string): Promise<Project[]> {
    const { data, error } = await supabase
      .from('solution_projects')
      .select('*')
      .eq('workspace_id', workspaceId)
      .eq('solution_prefix', solutionPrefix)
      .order('last_updated', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch projects: ${error.message}`);
    }

    return data.map((project: any) => ({
      ...project,
      last_updated: project.last_updated ? new Date(project.last_updated) : undefined
    }));
  },

  async createProject(name: string, workspaceId: string, solutionPrefix: string): Promise<Project> {
    const now = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('solution_projects')
      .insert({
        name: name.trim(),
        solution_prefix: solutionPrefix,
        workspace_id: workspaceId,
        description: "",
        last_updated: now,
        created_at: now
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create project: ${error.message}`);
    }

    return {
      ...data,
      last_updated: new Date(data.last_updated)
    };
  },

  async deleteProject(projectId: string, workspaceId: string): Promise<void> {
    const { error } = await supabase
      .from('solution_projects')
      .delete()
      .eq('id', projectId)
      .eq('workspace_id', workspaceId);

    if (error) {
      throw new Error(`Failed to delete project: ${error.message}`);
    }
  }
};
