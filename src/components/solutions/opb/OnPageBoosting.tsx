import React from "react";
import ToolViewHeader from "../../common/ToolViewHeader";

interface OnPageBoostingProps {
  projectName: string;
}

const OnPageBoosting: React.FC<OnPageBoostingProps> = ({ projectName }) => {
  return (
    <div className="on-page-boosting">
      <ToolViewHeader solutionPrefix="opb" solutionName="On-Page Boosting" />
      <div className="mt-6">
        <h2>On-Page Boosting Tool for {projectName}</h2>
        {/* Add tool content here */}
      </div>
    </div>
  );
};

export default OnPageBoosting;
