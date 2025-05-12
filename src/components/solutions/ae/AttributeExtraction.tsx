import React from "react";
import ToolViewHeader from "../../common/ToolViewHeader";

interface AttributeExtractionProps {
  projectName: string;
}

const AttributeExtraction: React.FC<AttributeExtractionProps> = ({ projectName }) => {
  return (
    <div className="attribute-extraction">
      <ToolViewHeader solutionPrefix="ae" solutionName="AI Attribute Enrichment" />
      <div className="mt-6">
        <h2>Attribute Extraction Tool for {projectName}</h2>
        {/* Add tool content here */}
      </div>
    </div>
  );
};

export default AttributeExtraction;
