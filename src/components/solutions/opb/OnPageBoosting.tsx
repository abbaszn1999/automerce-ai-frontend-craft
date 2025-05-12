
import React from "react";
import ToolViewHeader from "../../common/ToolViewHeader";

interface OnPageBoostingProps {
  projectName?: string;
}

const OnPageBoosting: React.FC<OnPageBoostingProps> = ({ projectName = "Default Project" }) => {
  return (
    <div className="on-page-boosting">
      <ToolViewHeader solutionPrefix="opb" solutionName="On-Page Boosting" />
      <div className="mt-6">
        <h2>On-Page Boosting Tool for {projectName}</h2>
        <p className="mt-4 text-gray-600">
          Optimize on-page elements to improve search engine visibility and ranking factors.
        </p>
        
        <div className="mt-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium">Getting Started</h3>
          <p className="mt-2 text-gray-600">
            To use the On-Page Boosting tool, you'll need to:
          </p>
          <ul className="mt-3 list-disc pl-5 space-y-2 text-gray-600">
            <li>Upload your current site structure</li>
            <li>Define target keywords for optimization</li>
            <li>Configure content improvement rules</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default OnPageBoosting;
