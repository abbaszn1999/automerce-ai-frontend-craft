
export interface Workspace {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

export interface WorkspaceUser {
  workspace_id: string;
  user_id: string;
  role: string;
  created_at: string;
}

export interface WorkspaceContextType {
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  isLoading: boolean;
  fetchWorkspaces: () => Promise<void>;
  setCurrentWorkspace: (workspace: Workspace | null) => void;
  createWorkspace: (name: string, description: string) => Promise<Workspace | null>;
  updateWorkspace: (id: string, name: string, description: string) => Promise<boolean>;
  deleteWorkspace: (id: string) => Promise<boolean>;
  workspaceUsers: WorkspaceUser[];
  fetchWorkspaceUsers: (workspaceId: string) => Promise<void>;
  inviteUserToWorkspace: (workspaceId: string, email: string, role: string) => Promise<boolean>;
}
