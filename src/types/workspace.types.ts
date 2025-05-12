
export interface Workspace {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface WorkspaceUser {
  workspace_id: string;
  user_id: string;
  role: string;
}

export interface WorkspaceContextType {
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  workspaceUsers: WorkspaceUser[];
  loading: boolean;
  error: string | null;
  fetchWorkspaces: () => Promise<void>;
  createWorkspace: (name: string, description?: string) => Promise<Workspace | null>;
  setCurrentWorkspaceById: (id: string) => void;
  updateWorkspace: (id: string, data: Partial<Workspace>) => Promise<void>;
  fetchWorkspaceUsers: (workspaceId: string) => Promise<WorkspaceUser[]>;
}
