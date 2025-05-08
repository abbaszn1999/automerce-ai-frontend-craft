
import React from "react";
import { useAppContext } from "../../context/AppContext";
import { ArrowLeft } from "lucide-react";

interface ToolViewHeaderProps {
  solutionPrefix: string;
  solutionName: string;
}

const ToolViewHeader: React.FC<ToolViewHeaderProps> = ({ solutionPrefix, solutionName }) => {
  const { selectedProjectName, setSelectedProjectName, setCurrentView } = useAppContext();

  const handleBack = () => {
    setSelectedProjectName(null);
    setCurrentView("project");
  };

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
          <span>Back to {solutionPrefix.toUpperCase()} Projects</span>
        </a>
        
        <h1 className="text-2xl font-bold">
          {solutionName} Project: <span id={`${solutionPrefix.toLowerCase()}-current-project-name`}>{selectedProjectName}</span>
        </h1>
      </div>
    </div>
  );
};

export default ToolViewHeader;
