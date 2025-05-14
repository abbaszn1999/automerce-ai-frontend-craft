
import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/services/apiClient";
import { toast } from "sonner";
import { useWorkspace } from "./WorkspaceContext";

type SolutionType = "ae" | "cb" | "ho" | "lhf" | "il" | "opb";
type ViewType = "project" | "tool" | "settings";
type FeedModeType = "plp" | "product";
type FeedOutputType = "extraction" | "collection" | "structure" | "links" | "boosting" | "fruit";

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
  const { currentWorkspace } = useWorkspace();
  
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
  const [feedList, setFeedList] = useState<Feed[]>([
    {
      id: "feed-1",
      name: "Product Catalog",
      type: "product",
      status: "Active",
      lastUpdated: "2025-05-01T10:30:00Z",
      source: "import"
    },
    {
      id: "feed-2",
      name: "Category Feed",
      type: "plp",
      status: "Active",
      lastUpdated: "2025-05-02T14:15:00Z",
      source: "import"
    }
  ]);

  // Load workspace-specific data when current workspace changes
  useEffect(() => {
    if (currentWorkspace) {
      fetchWorkspaceFeeds();
    }
  }, [currentWorkspace]);

  // Fetch workspace-specific feeds
  const fetchWorkspaceFeeds = async () => {
    if (!currentWorkspace) return;
    
    try {
      const { data, error } = await supabase
        .from('feeds')
        .select('*')
        .eq('workspace_id', currentWorkspace.id);
        
      if (error) throw error;
      
      if (data && data.length > 0) {
        const formattedFeeds = data.map(feed => ({
          id: feed.id,
          name: feed.name,
          type: feed.type as FeedModeType,
          status: feed.status,
          lastUpdated: feed.updated_at,
          updated_at: feed.updated_at,
          source: 'import'
        }));
        
        setFeedList(formattedFeeds);
      }
    } catch (error: any) {
      console.error("Error fetching workspace feeds:", error);
      toast.error("Failed to load workspace feeds");
    }
  };

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
    
    let title = `Autommerce.ai - ${solutionNames[currentSolution]}`;
    if (currentWorkspace?.name) {
      title = `${currentWorkspace.name} | ${title}`;
    }
    
    document.title = title;
  }, [currentSolution, currentWorkspace]);

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
  
  // Feed list methods - updated to use Supabase and current workspace
  const addFeedToList = async (name: string, type: FeedModeType, source?: string) => {
    try {
      if (!currentWorkspace) {
        toast.error("No workspace selected. Please select or create a workspace first.");
        return;
      }
      
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
      
      // If successful, update the local state
      if (data && data[0]) {
        setFeedList(prev => [...prev, {
          id: data[0].id,
          name: data[0].name,
          type: data[0].type as FeedModeType,
          status: data[0].status,
          lastUpdated: data[0].updated_at,
          updated_at: data[0].updated_at,
          source: source || 'import'
        }]);
        
        // Show success message
        toast.success("Feed added successfully");
        
        // Navigate to feed list
        setSettingsCurrentTab("feed-list");
      }
    } catch (error: any) {
      console.error("Error adding feed:", error);
      toast.error("Failed to add feed: " + (error.message || error));
    }
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
