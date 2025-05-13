
import React, { createContext, useState, useContext } from "react";

export type AppContextType = {
  currentSolution: string;
  setCurrentSolution: (solution: string) => void;
  currentView: string;
  setCurrentView: (view: string) => void;
  currentProject: { id: string; name: string } | null;
  setCurrentProject: (project: { id: string; name: string } | null) => void;
};

const defaultContext: AppContextType = {
  currentSolution: "ae",
  setCurrentSolution: () => {},
  currentView: "project",
  setCurrentView: () => {},
  currentProject: null,
  setCurrentProject: () => {},
};

const AppContext = createContext<AppContextType>(defaultContext);

export const AppContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentSolution, setCurrentSolution] = useState<string>("ae");
  const [currentView, setCurrentView] = useState<string>("project");
  const [currentProject, setCurrentProject] = useState<{ id: string; name: string } | null>(null);

  return (
    <AppContext.Provider
      value={{
        currentSolution,
        setCurrentSolution,
        currentView,
        setCurrentView,
        currentProject,
        setCurrentProject,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);

export default AppContext;
