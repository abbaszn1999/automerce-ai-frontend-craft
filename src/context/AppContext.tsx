
import React, { createContext, useState, useContext } from "react";

export type AppContextType = {
  currentSolution: string;
  setCurrentSolution: (solution: string) => void;
  currentView: string;
  setCurrentView: (view: string) => void;
  currentProject: { id: string; name: string } | null;
  setCurrentProject: (project: { id: string; name: string } | null) => void;
  
  // Settings related properties
  settingsCurrentTab: string;
  setSettingsCurrentTab: (tab: string) => void;
  
  // Feed related properties
  selectedFeedMode: "plp" | "product" | null;
  setSelectedFeedMode: (mode: "plp" | "product" | null) => void;
  feedMappingColumns: Array<{sourceColumn: string, targetColumn: string}>;
  setFeedMappingColumns: (columns: Array<{sourceColumn: string, targetColumn: string}>) => void;
  feedList: Array<any>;
  setFeedList: (feeds: Array<any>) => void;
  addFeedToList: (name: string, type: string) => void;
  
  // Project related properties
  selectedProjectName: string | null;
  setSelectedProjectName: (name: string | null) => void;
  
  // Solution-specific tabs
  cbCurrentStage: string;
  setCbCurrentStage: (stage: string) => void;
  ilCurrentSubTab: string;
  setIlCurrentSubTab: (tab: string) => void;
  opbCurrentSubTab: string;
  setOpbCurrentSubTab: (tab: string) => void;
};

const defaultContext: AppContextType = {
  currentSolution: "ae",
  setCurrentSolution: () => {},
  currentView: "project",
  setCurrentView: () => {},
  currentProject: null,
  setCurrentProject: () => {},
  
  // Settings defaults
  settingsCurrentTab: "feed-mode",
  setSettingsCurrentTab: () => {},
  
  // Feed defaults
  selectedFeedMode: null,
  setSelectedFeedMode: () => {},
  feedMappingColumns: [],
  setFeedMappingColumns: () => {},
  feedList: [],
  setFeedList: () => {},
  addFeedToList: () => {},
  
  // Project defaults
  selectedProjectName: null,
  setSelectedProjectName: () => {},
  
  // Solution-specific defaults
  cbCurrentStage: "input",
  setCbCurrentStage: () => {},
  ilCurrentSubTab: "upload",
  setIlCurrentSubTab: () => {},
  opbCurrentSubTab: "overview",
  setOpbCurrentSubTab: () => {},
};

const AppContext = createContext<AppContextType>(defaultContext);

export const AppContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentSolution, setCurrentSolution] = useState<string>("ae");
  const [currentView, setCurrentView] = useState<string>("project");
  const [currentProject, setCurrentProject] = useState<{ id: string; name: string } | null>(null);
  
  // Settings states
  const [settingsCurrentTab, setSettingsCurrentTab] = useState<string>("feed-mode");
  
  // Feed states
  const [selectedFeedMode, setSelectedFeedMode] = useState<"plp" | "product" | null>(null);
  const [feedMappingColumns, setFeedMappingColumns] = useState<Array<{sourceColumn: string, targetColumn: string}>>([]);
  const [feedList, setFeedList] = useState<Array<any>>([]);
  
  // Project states
  const [selectedProjectName, setSelectedProjectName] = useState<string | null>(null);
  
  // Solution-specific states
  const [cbCurrentStage, setCbCurrentStage] = useState<string>("input");
  const [ilCurrentSubTab, setIlCurrentSubTab] = useState<string>("upload");
  const [opbCurrentSubTab, setOpbCurrentSubTab] = useState<string>("overview");
  
  // Function to add a feed to the list
  const addFeedToList = (name: string, type: string) => {
    const newFeed = {
      id: `feed-${Date.now()}`,
      name,
      type,
      status: "Active",
      lastUpdated: new Date().toISOString(),
    };
    setFeedList(prev => [...prev, newFeed]);
  };

  return (
    <AppContext.Provider
      value={{
        currentSolution,
        setCurrentSolution,
        currentView,
        setCurrentView,
        currentProject,
        setCurrentProject,
        
        // Settings values
        settingsCurrentTab,
        setSettingsCurrentTab,
        
        // Feed values
        selectedFeedMode,
        setSelectedFeedMode,
        feedMappingColumns,
        setFeedMappingColumns,
        feedList,
        setFeedList,
        addFeedToList,
        
        // Project values
        selectedProjectName,
        setSelectedProjectName,
        
        // Solution-specific values
        cbCurrentStage,
        setCbCurrentStage,
        ilCurrentSubTab,
        setIlCurrentSubTab,
        opbCurrentSubTab,
        setOpbCurrentSubTab,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);

export default AppContext;
