
import React from "react";
import ToolViewHeader from "../../common/ToolViewHeader";

interface InternalLinksProps {
  projectName?: string;
}

const InternalLinks: React.FC<InternalLinksProps> = ({ projectName = "Default Project" }) => {
  return (
    <div className="internal-links">
      <ToolViewHeader solutionPrefix="il" solutionName="Link Boosting" />
      <div className="mt-6">
        <h2>Internal Links Tool for {projectName}</h2>
        <p className="mt-4 text-gray-600">
          This tool helps you optimize internal linking structure to improve SEO rankings
          and user navigation across your website.
        </p>
        
        <div className="mt-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium">Getting Started</h3>
          <p className="mt-2 text-gray-600">
            To use the Internal Links Boosting tool, you'll need to:
          </p>
          <ul className="mt-3 list-disc pl-5 space-y-2 text-gray-600">
            <li>Connect your website data source</li>
            <li>Configure page categories and URL structure</li>
            <li>Set up link rules and priorities</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default InternalLinks;
