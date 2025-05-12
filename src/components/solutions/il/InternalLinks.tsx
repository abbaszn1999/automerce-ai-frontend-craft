import React from "react";
import ToolViewHeader from "../../common/ToolViewHeader";

interface InternalLinksProps {
  projectName: string;
}

const InternalLinks: React.FC<InternalLinksProps> = ({ projectName }) => {
  return (
    <div className="internal-links">
      <ToolViewHeader solutionPrefix="il" solutionName="Link Boosting" />
      <div className="mt-6">
        <h2>Internal Links Tool for {projectName}</h2>
        {/* Add tool content here */}
      </div>
    </div>
  );
};

export default InternalLinks;
