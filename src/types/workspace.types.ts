
export interface Workspace {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  owner_user_id?: string;
}

export interface WorkspaceUser {
  id?: string; // Made optional to fix errors
  workspace_id: string;
  user_id: string;
  role: string;
  created_at: string;
  email?: string; // Added to fix error
}

export interface WorkspaceContextType {
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  isLoading: boolean;
  workspaceUsers: WorkspaceUser[];
  fetchWorkspaces: () => Promise<void>;
  setCurrentWorkspace: (workspace: Workspace | null) => void;
  createWorkspace: (name: string, description: string) => Promise<Workspace | null>;
  updateWorkspace: (id: string, name: string, description: string) => Promise<boolean>;
  deleteWorkspace: (id: string) => Promise<boolean>;
  fetchWorkspaceUsers: (workspaceId: string) => Promise<void>;
  inviteUserToWorkspace: (workspaceId: string, email: string, role: string) => Promise<boolean>;
  removeUserFromWorkspace: (workspaceId: string, userIdToRemove: string) => Promise<boolean>;
}
