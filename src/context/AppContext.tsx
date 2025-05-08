
import React, { createContext, useContext, useState, useEffect } from "react";

type SolutionType = "ae" | "cb" | "ho" | "lhf" | "il" | "opb";
type ViewType = "project" | "tool" | "settings";
type FeedModeType = "plp" | "product";

interface AppContextType {
  // Global state
  currentSolution: SolutionType;
  currentView: ViewType;
  selectedProjectName: string | null;
  
  // AE specific state
  aeCurrentTab: string;
  aeAttributes: Array<{ id: string; name: string; values: string[] }>;
  
  // CB specific state
  cbCurrentStage: number;
  
  // IL specific state 
  ilCurrentSubTab: "plp" | "product";
  
  // OPB specific state
  opbCurrentSubTab: "pop" | "plop";
  
  // Settings state
  settingsCurrentTab: "feed-mode" | "feed-config" | "feed-list" | "analytics-config" | "js-manager";
  
  // Feed settings state
  selectedFeedMode: FeedModeType;
  feedMappingColumns: Array<{sourceColumn: string; targetColumn: string}>;
  feedList: Array<{id: string; name: string; type: FeedModeType; status: string; lastUpdated: string}>;
  
  // Methods
  setCurrentSolution: (solution: SolutionType) => void;
  setCurrentView: (view: ViewType) => void;
  setSelectedProjectName: (name: string | null) => void;
  setAeCurrentTab: (tab: string) => void;
  setCbCurrentStage: (stage: number) => void;
  setIlCurrentSubTab: (tab: "plp" | "product") => void;
  setOpbCurrentSubTab: (tab: "pop" | "plop") => void;
  setSettingsCurrentTab: (tab: "feed-mode" | "feed-config" | "feed-list" | "analytics-config" | "js-manager") => void;
  
  // Feed settings methods
  setSelectedFeedMode: (mode: FeedModeType) => void;
  setFeedMappingColumns: (columns: Array<{sourceColumn: string; targetColumn: string}>) => void;
  addFeedToList: (name: string, type: FeedModeType) => void;
  
  // AE methods
  addAttribute: (name: string, values: string[]) => void;
  updateAttribute: (id: string, name: string, values: string[]) => void;
  deleteAttribute: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Global state
  const [currentSolution, setCurrentSolution] = useState<SolutionType>("ae");
  const [currentView, setCurrentView] = useState<ViewType>("project");
  const [selectedProjectName, setSelectedProjectName] = useState<string | null>(null);
  
  // AE specific state
  const [aeCurrentTab, setAeCurrentTab] = useState("attr-setup-content");
  const [aeAttributes, setAeAttributes] = useState<Array<{ id: string; name: string; values: string[] }>>([
    { id: "attr1", name: "Material", values: ["Cotton", "Polyester", "Wool", "Silk"] },
    { id: "attr2", name: "Color", values: ["Red", "Blue", "Green", "Black", "White"] }
  ]);
  
  // CB specific state
  const [cbCurrentStage, setCbCurrentStage] = useState(1);
  
  // IL specific state
  const [ilCurrentSubTab, setIlCurrentSubTab] = useState<"plp" | "product">("plp");
  
  // OPB specific state
  const [opbCurrentSubTab, setOpbCurrentSubTab] = useState<"pop" | "plop">("pop");
  
  // Settings state
  const [settingsCurrentTab, setSettingsCurrentTab] = useState<"feed-mode" | "feed-config" | "feed-list" | "analytics-config" | "js-manager">("feed-mode");
  
  // Feed settings state
  const [selectedFeedMode, setSelectedFeedMode] = useState<FeedModeType>("plp");
  const [feedMappingColumns, setFeedMappingColumns] = useState<Array<{sourceColumn: string; targetColumn: string}>>([]);
  const [feedList, setFeedList] = useState<Array<{id: string; name: string; type: FeedModeType; status: string; lastUpdated: string}>>([]);

  // Update document title when solution changes
  useEffect(() => {
    const solutionNames = {
      ae: "Attribute Extraction",
      cb: "Collection Builder",
      ho: "Header Optimization",
      lhf: "Low Hanging Fruits",
      il: "Internal Links",
      opb: "On-Page Boosting"
    };
    
    document.title = `Autommerce.ai - ${solutionNames[currentSolution]}`;
  }, [currentSolution]);

  // AE methods
  const addAttribute = (name: string, values: string[]) => {
    const newAttribute = {
      id: `attr${Date.now()}`,
      name,
      values
    };
    
    setAeAttributes(prev => [...prev, newAttribute]);
  };
  
  const updateAttribute = (id: string, name: string, values: string[]) => {
    setAeAttributes(prev => 
      prev.map(attr => attr.id === id ? { ...attr, name, values } : attr)
    );
  };
  
  const deleteAttribute = (id: string) => {
    setAeAttributes(prev => prev.filter(attr => attr.id !== id));
  };
  
  // Feed list methods
  const addFeedToList = (name: string, type: FeedModeType) => {
    const newFeed = {
      id: `feed-${Date.now()}`,
      name,
      type,
      status: "Active",
      lastUpdated: new Date().toISOString()
    };
    
    setFeedList(prev => [...prev, newFeed]);
  };

  const value = {
    currentSolution,
    currentView,
    selectedProjectName,
    aeCurrentTab,
    aeAttributes,
    cbCurrentStage,
    ilCurrentSubTab,
    opbCurrentSubTab,
    settingsCurrentTab,
    selectedFeedMode,
    feedMappingColumns,
    feedList,
    setCurrentSolution,
    setCurrentView,
    setSelectedProjectName,
    setAeCurrentTab,
    setCbCurrentStage,
    setIlCurrentSubTab,
    setOpbCurrentSubTab,
    setSettingsCurrentTab,
    setSelectedFeedMode,
    setFeedMappingColumns,
    addFeedToList,
    addAttribute,
    updateAttribute,
    deleteAttribute
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};
