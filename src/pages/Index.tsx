
import React from "react";
import { useAppContext } from "../context/AppContext";
import AppLayout from "../components/AppLayout";
import SolutionSelector from "../components/SolutionSelector";
import ProjectView from "../components/common/ProjectView";
import Settings from "../components/settings/Settings";
import AttributeExtraction from "../components/solutions/ae/AttributeExtraction";
import CollectionBuilder from "../components/solutions/cb/CollectionBuilder";
import HeaderOptimization from "../components/solutions/ho/HeaderOptimization";
import LowHangingFruits from "../components/solutions/lhf/LowHangingFruits";
import InternalLinks from "../components/solutions/il/InternalLinks";
import OnPageBoosting from "../components/solutions/opb/OnPageBoosting";
import Dashboard from "./Dashboard";

const Index: React.FC = () => {
  const { currentSolution, currentView, selectedProjectName } = useAppContext();

  const renderContent = () => {
    if (currentView === "settings") {
      return <Settings />;
    }

    if (currentView === "project") {
      // Show dashboard if no solution is selected
      if (!currentSolution) {
        return <Dashboard />;
      }
      
      switch (currentSolution) {
        case "ae":
          return (
            <ProjectView
              solutionPrefix="ae"
              solutionName="AI Attribute Enrichment"
              solutionDescription="Extract and enhance product attributes using AI"
            />
          );
        case "cb":
          return (
            <ProjectView
              solutionPrefix="cb"
              solutionName="AI Collection Builder"
              solutionDescription="Create and optimize product collections using AI"
            />
          );
        case "ho":
          return (
            <ProjectView
              solutionPrefix="ho"
              solutionName="Website Restructure"
              solutionDescription="Optimize your website structure for better performance"
            />
          );
        case "lhf":
          return (
            <ProjectView
              solutionPrefix="lhf"
              solutionName="Low-Hanging Fruits"
              solutionDescription="Quick wins to improve your site's performance"
            />
          );
        case "il":
          return (
            <ProjectView
              solutionPrefix="il"
              solutionName="Link Boosting"
              solutionDescription="Enhance your internal linking structure"
            />
          );
        case "opb":
          return (
            <ProjectView
              solutionPrefix="opb"
              solutionName="On-Page Boosting"
              solutionDescription="Optimize individual pages for better performance"
            />
          );
        default:
          return <Dashboard />;
      }
    }

    if (currentView === "tool" && selectedProjectName) {
      switch (currentSolution) {
        case "ae":
          return <AttributeExtraction projectName={selectedProjectName} />;
        case "cb":
          return <CollectionBuilder projectName={selectedProjectName} />;
        case "ho":
          return <HeaderOptimization projectName={selectedProjectName} />;
        case "lhf":
          return <LowHangingFruits projectName={selectedProjectName} />;
        case "il":
          return <InternalLinks projectName={selectedProjectName} />;
        case "opb":
          return <OnPageBoosting projectName={selectedProjectName} />;
        default:
          return <div>Unknown solution</div>;
      }
    }

    // Default view is the dashboard
    return <Dashboard />;
  };

  return (
    <AppLayout>
      {currentView !== "settings" && currentSolution && <SolutionSelector />}
      <div className="main-content-area">{renderContent()}</div>
    </AppLayout>
  );
};

export default Index;
