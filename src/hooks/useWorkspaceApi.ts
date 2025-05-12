
import { useWorkspaceManagement } from "./api/useWorkspaceManagement";
import { useWorkspaceMembersManagement } from "./api/useWorkspaceMembersManagement";

export const useWorkspaceApi = (userId: string | undefined) => {
  const workspaceManagement = useWorkspaceManagement(userId);
  const memberManagement = useWorkspaceMembersManagement(userId);

  return {
    // Workspace management methods
    fetchWorkspaces: workspaceManagement.fetchWorkspaces,
    createWorkspace: workspaceManagement.createWorkspace,
    updateWorkspace: workspaceManagement.updateWorkspace,
    deleteWorkspace: workspaceManagement.deleteWorkspace,

    // User management methods
    fetchWorkspaceUsers: memberManagement.fetchWorkspaceUsers,
    inviteUserToWorkspace: memberManagement.inviteUserToWorkspace
  };
};
