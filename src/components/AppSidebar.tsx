
import React, { useState } from "react";
import { useAppContext } from "../context/AppContext";
import AutommerceLogo from "./AutommerceLogo";
import { 
  ChevronDown, 
  LayoutDashboard, 
  Database, 
  LayoutGrid, 
  Leaf, 
  Link, 
  Rocket,
  Settings,
  ChevronRight
} from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem
} from "@/components/ui/dropdown-menu";

const AppSidebar: React.FC = () => {
  const { currentSolution, setCurrentSolution, setCurrentView, currentView, settingsCurrentTab, setSettingsCurrentTab } = useAppContext();
  const [showFeedSettings, setShowFeedSettings] = useState(false);
  const [showConfiguration, setShowConfiguration] = useState(false);
  
  // Map the old solution IDs to the new names
  const solutionMapping = {
    "dashboard": "dashboard",
    "ae": "ai-attribute-enrichment",
    "cb": "ai-collection-builder", 
    "ho": "website-restructure",
    "lhf": "low-hanging-fruits",
    "il": "link-boosting",
    "opb": "on-page-boosting"
  };
  
  const handleSolutionChange = (solutionId: string) => {
    // Map the new names back to the original solution IDs
    let originalId: "ae" | "cb" | "ho" | "lhf" | "il" | "opb" | undefined;
    
    switch (solutionId) {
      case "ai-attribute-enrichment":
        originalId = "ae";
        break;
      case "ai-collection-builder":
        originalId = "cb";
        break;
      case "website-restructure":
        originalId = "ho";
        break;
      case "low-hanging-fruits":
        originalId = "lhf";
        break;
      case "link-boosting":
        originalId = "il";
        break;
      case "on-page-boosting":
        originalId = "opb";
        break;
    }
    
    if (originalId) {
      setCurrentSolution(originalId);
      setCurrentView("project");
    }
  };

  const isActive = (solutionId: string) => {
    if (solutionId === "dashboard") return false; // Dashboard not implemented yet
    
    // Map current solution ID to new names for comparison
    const currentMapped = Object.entries(solutionMapping).find(([key, _]) => key === currentSolution)?.[1];
    return currentMapped === solutionId;
  };

  const handleFeedSettingsClick = (tabName: "feed-mode" | "feed-config" | "feed-list") => {
    setSettingsCurrentTab(tabName);
    setCurrentView("settings");
  };

  const handleConfigClick = (tabName: "analytics-config" | "js-manager") => {
    setSettingsCurrentTab(tabName);
    setCurrentView("settings");
  };

  return (
    <aside className="app-sidebar">
      {/* Workspace Selector */}
      <div className="sidebar-workspace-selector">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center justify-between w-full cursor-pointer">
              <span className="font-medium">Demo en-GB</span>
              <ChevronDown size={16} />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="workspace-dropdown">
            <DropdownMenuItem className="workspace-item">Demo en-GB</DropdownMenuItem>
            <DropdownMenuItem className="workspace-item">Demo en-US</DropdownMenuItem>
            <DropdownMenuItem className="workspace-item">+ Add Workspace</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      {/* Autommerce Logo */}
      <div className="p-4 flex justify-center">
        <AutommerceLogo variant="white" />
      </div>
      
      {/* Navigation Items */}
      <nav className="mt-6">
        <a 
          href="#" 
          className={`sidebar-nav-item ${isActive("dashboard") ? "active" : ""}`}
          onClick={() => handleSolutionChange("dashboard")}
        >
          <LayoutDashboard size={18} />
          <span>Dashboard</span>
        </a>
        
        <a 
          href="#" 
          className={`sidebar-nav-item ${isActive("ai-attribute-enrichment") ? "active" : ""}`}
          onClick={() => handleSolutionChange("ai-attribute-enrichment")}
        >
          <Database size={18} />
          <span>AI Attribute Enrichment</span>
        </a>
        
        <a 
          href="#" 
          className={`sidebar-nav-item ${isActive("ai-collection-builder") ? "active" : ""}`}
          onClick={() => handleSolutionChange("ai-collection-builder")}
        >
          <LayoutGrid size={18} />
          <span>AI Collection Builder</span>
        </a>
        
        <a 
          href="#" 
          className={`sidebar-nav-item ${isActive("website-restructure") ? "active" : ""}`}
          onClick={() => handleSolutionChange("website-restructure")}
        >
          <Rocket size={18} />
          <span>Website Restructure</span>
        </a>
        
        <a 
          href="#" 
          className={`sidebar-nav-item ${isActive("low-hanging-fruits") ? "active" : ""}`}
          onClick={() => handleSolutionChange("low-hanging-fruits")}
        >
          <Leaf size={18} />
          <span>Low-Hanging Fruits</span>
        </a>
        
        <a 
          href="#" 
          className={`sidebar-nav-item ${isActive("link-boosting") ? "active" : ""}`}
          onClick={() => handleSolutionChange("link-boosting")}
        >
          <Link size={18} />
          <span>Link Boosting</span>
        </a>
        
        <a 
          href="#" 
          className={`sidebar-nav-item ${isActive("on-page-boosting") ? "active" : ""}`}
          onClick={() => handleSolutionChange("on-page-boosting")}
        >
          <Rocket size={18} />
          <span>On-Page Boosting</span>
        </a>
        
        {/* Configuration Sections */}
        <div className="sidebar-section">
          <div 
            className="sidebar-dropdown-item"
            onClick={() => setShowFeedSettings(!showFeedSettings)}
          >
            <div className="flex items-center gap-2">
              <Database size={16} />
              <span>Feed Settings</span>
            </div>
            <ChevronRight 
              size={16} 
              className={`transition-transform ${showFeedSettings ? 'rotate-90' : ''}`} 
            />
          </div>
          
          {showFeedSettings && (
            <div className="ml-8 mt-1 flex flex-col space-y-2">
              <a 
                href="#" 
                className={`text-sidebar-foreground/80 hover:text-sidebar-foreground py-1 text-sm ${
                  currentView === "settings" && settingsCurrentTab === "feed-mode" ? "text-sidebar-primary" : ""
                }`}
                onClick={() => handleFeedSettingsClick("feed-mode")}
              >
                Feed Mode
              </a>
              <a 
                href="#" 
                className={`text-sidebar-foreground/80 hover:text-sidebar-foreground py-1 text-sm ${
                  currentView === "settings" && settingsCurrentTab === "feed-config" ? "text-sidebar-primary" : ""
                }`}
                onClick={() => handleFeedSettingsClick("feed-config")}
              >
                Feed Configuration
              </a>
              <a 
                href="#" 
                className={`text-sidebar-foreground/80 hover:text-sidebar-foreground py-1 text-sm ${
                  currentView === "settings" && settingsCurrentTab === "feed-list" ? "text-sidebar-primary" : ""
                }`}
                onClick={() => handleFeedSettingsClick("feed-list")}
              >
                Feed List
              </a>
            </div>
          )}
          
          <div 
            className="sidebar-dropdown-item mt-2"
            onClick={() => setShowConfiguration(!showConfiguration)}
          >
            <div className="flex items-center gap-2">
              <Settings size={16} />
              <span>Configuration</span>
            </div>
            <ChevronRight 
              size={16} 
              className={`transition-transform ${showConfiguration ? 'rotate-90' : ''}`} 
            />
          </div>
          
          {showConfiguration && (
            <div className="ml-8 mt-1 flex flex-col space-y-2">
              <a 
                href="#" 
                className={`text-sidebar-foreground/80 hover:text-sidebar-foreground py-1 text-sm ${
                  currentView === "settings" && settingsCurrentTab === "analytics-config" ? "text-sidebar-primary" : ""
                }`}
                onClick={() => handleConfigClick("analytics-config")}
              >
                Analytics Config
              </a>
              <a 
                href="#" 
                className={`text-sidebar-foreground/80 hover:text-sidebar-foreground py-1 text-sm ${
                  currentView === "settings" && settingsCurrentTab === "js-manager" ? "text-sidebar-primary" : ""
                }`}
                onClick={() => handleConfigClick("js-manager")}
              >
                Javascript Manager
              </a>
            </div>
          )}
        </div>
      </nav>
    </aside>
  );
};

export default AppSidebar;
