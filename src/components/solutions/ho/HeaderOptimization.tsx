import React from "react";
import ToolViewHeader from "../../common/ToolViewHeader";

interface HeaderOptimizationProps {
  projectName: string;
}

const HeaderOptimization: React.FC<HeaderOptimizationProps> = ({ projectName }) => {
  return (
    <div className="header-optimization">
      <ToolViewHeader solutionPrefix="ho" solutionName="Website Restructure" />
      <div className="mt-6">
        <h2>Header Optimization Tool for {projectName}</h2>
        {/* Add tool content here */}
      </div>
    </div>
  );
};

export default HeaderOptimization;
