import React from "react";
import ToolViewHeader from "../../common/ToolViewHeader";

interface CollectionBuilderProps {
  projectName: string;
}

const CollectionBuilder: React.FC<CollectionBuilderProps> = ({ projectName }) => {
  return (
    <div className="collection-builder">
      <ToolViewHeader solutionPrefix="cb" solutionName="AI Collection Builder" />
      <div className="mt-6">
        <h2>Collection Builder Tool for {projectName}</h2>
        {/* Add tool content here */}
      </div>
    </div>
  );
};

export default CollectionBuilder;
