import React from "react";
import ToolViewHeader from "../../common/ToolViewHeader";

interface LowHangingFruitsProps {
  projectName: string;
}

const LowHangingFruits: React.FC<LowHangingFruitsProps> = ({ projectName }) => {
  return (
    <div className="low-hanging-fruits">
      <ToolViewHeader solutionPrefix="lhf" solutionName="Low-Hanging Fruits" />
      <div className="mt-6">
        <h2>Low-Hanging Fruits Tool for {projectName}</h2>
        {/* Add tool content here */}
      </div>
    </div>
  );
};

export default LowHangingFruits;
