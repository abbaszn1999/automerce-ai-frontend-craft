
import React, { createContext, useContext } from "react";
import { useAuth } from "./AuthContext";
import { useWorkspaceData } from "@/hooks/useWorkspaceData";
import { WorkspaceContextType } from "@/types/workspace.types";

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const workspaceData = useWorkspaceData(user?.id);

  return (
    <WorkspaceContext.Provider value={workspaceData}>
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error("useWorkspace must be used within a WorkspaceProvider");
  }
  return context;
};
