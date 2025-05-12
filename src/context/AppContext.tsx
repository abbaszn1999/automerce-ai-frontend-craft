
import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useWorkspace } from "./WorkspaceContext";

type SolutionType = "ae" | "cb" | "ho" | "lhf" | "il" | "opb";
type ViewType = "project" | "tool" | "settings";
type FeedModeType = "plp" | "product";

interface Feed {
  id: string;
  name: string;
  type: FeedModeType;
  status: string;
  lastUpdated: string;
  updated_at?: string;
  source?: string; // Module that generated the feed (e.g., "ae", "lhf")
}

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
  feedList: Feed[];
  
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
  addFeedToList: (name: string, type: FeedModeType, source?: string) => Promise<void>;
  
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
  // Feed list is no longer needed here as we fetch it directly from Supabase in the FeedList component
  const [feedList, setFeedList] = useState<Feed[]>([]);

  // Access the workspace context
  const { currentWorkspace } = useWorkspace();

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

  // Feed list methods - updated to use Supabase with workspace context
  const addFeedToList = async (name: string, type: FeedModeType, source?: string) => {
    if (!currentWorkspace) {
      toast.error("Please select a workspace first");
      return;
    }
    
    try {
      // Create the new feed in Supabase
      const { data, error } = await supabase
        .from('feeds')
        .insert([
          { 
            name, 
            type, 
            status: 'Active',
            workspace_id: currentWorkspace.id,
            configuration: {},
            column_mapping: {}
          }
        ])
        .select();

      if (error) throw error;
      
      toast.success("Feed added successfully");
      
      // Navigate to feed list
      setSettingsCurrentTab("feed-list");
    } catch (error: any) {
      console.error("Error adding feed:", error);
      toast.error("Failed to add feed: " + (error.message || error));
    }
  };

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
