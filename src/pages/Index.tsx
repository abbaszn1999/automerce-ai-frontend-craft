import React from "react";
import AppLayout from "../components/AppLayout";
import { useAppContext } from "../context/AppContext";
import ProjectView from "../components/common/ProjectView";
import AttributeExtraction from "../components/solutions/ae/AttributeExtraction";
import CollectionBuilder from "../components/solutions/cb/CollectionBuilder";
import HeaderOptimization from "../components/solutions/ho/HeaderOptimization";
import LowHangingFruits from "../components/solutions/lhf/LowHangingFruits";
import InternalLinks from "../components/solutions/il/InternalLinks";
import OnPageBoosting from "../components/solutions/opb/OnPageBoosting";
import Settings from "../components/settings/Settings";

// Helper function to map solution IDs to friendly names
const getSolutionName = (id: string): string => {
  switch (id) {
    case "ae": return "AI Attribute Enrichment";
    case "cb": return "AI Collection Builder";
    case "ho": return "Website Restructure";
    case "lhf": return "Low-Hanging Fruits";
    case "il": return "Link Boosting";
    case "opb": return "On-Page Boosting";
    default: return id.toUpperCase();
  }
};

const Index: React.FC = () => {
  const { currentSolution, currentView, currentSettingsTab } = useAppContext();

  // Determine which view to show based on solution and view type
  const renderContent = () => {
    // Show Settings View if currentView is settings
    if (currentView === "settings") {
      return <Settings />;
    }
    
    // Otherwise, show Project View or Tool View based on currentView
    if (currentView === "project") {
      // Show Project View for the current solution
      switch (currentSolution) {
        case "ae":
          return (
            <ProjectView 
              solutionPrefix="ae" 
              solutionName="AI Attribute Enrichment"
              solutionDescription="Extract and organize product attributes using AI to enhance your product data quality and improve filtering options."
            />
          );
        case "cb":
          return (
            <ProjectView 
              solutionPrefix="cb" 
              solutionName="AI Collection Builder"
              solutionDescription="Create optimized product collections based on data analysis to improve navigation and conversion rates."
            />
          );
        case "ho":
          return (
            <ProjectView 
              solutionPrefix="ho" 
              solutionName="Website Restructure"
              solutionDescription="Optimize your site's navigation structure for improved user experience and SEO performance."
            />
          );
        case "lhf":
          return (
            <ProjectView 
              solutionPrefix="lhf" 
              solutionName="Low-Hanging Fruits"
              solutionDescription="Identify quick wins for SEO improvements based on your existing product and category pages."
            />
          );
        case "il":
          return (
            <ProjectView 
              solutionPrefix="il" 
              solutionName="Link Boosting"
              solutionDescription="Enhance your site's internal linking structure to improve SEO and user navigation between pages."
            />
          );
        case "opb":
          return (
            <ProjectView 
              solutionPrefix="opb" 
              solutionName="On-Page Boosting"
              solutionDescription="Optimize product and category page content for improved search visibility and conversion rates."
            />
          );
        default:
          return <div>Invalid solution selected</div>;
      }
    } else {
      // Show Tool View for the current solution
      switch (currentSolution) {
        case "ae":
          return <AttributeExtraction />;
        case "cb":
          return <CollectionBuilder />;
        case "ho":
          return <HeaderOptimization />;
        case "lhf":
          return <LowHangingFruits />;
        case "il":
          return <InternalLinks />;
        case "opb":
          return <OnPageBoosting />;
        default:
          return <div>Invalid solution selected</div>;
      }
    }
  };

  // Determine the page title based on current view
  const getPageTitle = () => {
    if (currentView === "settings") {
      switch (currentSettingsTab) {
        case "feed-mode": return "Feed Mode";
        case "feed-configuration": return "Feed Configuration";
        case "feed-list": return "Feed List";
        case "analytics-config": return "Analytics Configuration";
        case "javascript-manager": return "JavaScript Manager";
        default: return "Settings";
      }
    } else {
      return getSolutionName(currentSolution);
    }
  };

  return (
    <AppLayout>
      <h1 className="text-2xl font-bold mb-4">
        {getPageTitle()}
      </h1>
      {renderContent()}
    </AppLayout>
  );
};

export default Index;
