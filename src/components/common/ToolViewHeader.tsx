
import React from "react";
import { useAppContext } from "../../context/AppContext";
import { ArrowLeft } from "lucide-react";

interface ToolViewHeaderProps {
  solutionPrefix: string;
  solutionName: string;
}

// Function to map solution prefix to friendly name
const getSolutionFriendlyName = (prefix: string): string => {
  switch (prefix) {
    case "ae": return "AI Attribute Enrichment";
    case "cb": return "AI Collection Builder";
    case "ho": return "Website Restructure";
    case "lhf": return "Low-Hanging Fruits";
    case "il": return "Link Boosting";
    case "opb": return "On-Page Boosting";
    default: return prefix.toUpperCase();
  }
};

const ToolViewHeader: React.FC<ToolViewHeaderProps> = ({ solutionPrefix, solutionName }) => {
  const { selectedProjectName, setSelectedProjectName, setCurrentView } = useAppContext();

  const handleBack = () => {
    setSelectedProjectName(null);
    setCurrentView("project");
  };
  
  const friendlyName = getSolutionFriendlyName(solutionPrefix);

  return (
    <div className="tool-view-header">
      <div className="flex flex-col gap-2">
        <a 
          href="#" 
          className="back-link"
          onClick={(e) => {
            e.preventDefault();
            handleBack();
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to {friendlyName} Projects</span>
        </a>
        
        <h1 className="text-2xl font-bold">
          {solutionName} Project: <span id={`${solutionPrefix.toLowerCase()}-current-project-name`}>{selectedProjectName}</span>
        </h1>
      </div>
    </div>
  );
};

export default ToolViewHeader;
