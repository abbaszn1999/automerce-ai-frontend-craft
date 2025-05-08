
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

const Index: React.FC = () => {
  const { currentSolution, currentView } = useAppContext();

  // Determine which view to show based on solution and view type
  const renderContent = () => {
    if (currentView === "project") {
      // Show Project View for the current solution
      switch (currentSolution) {
        case "ae":
          return (
            <ProjectView 
              solutionPrefix="ae" 
              solutionName="Attribute Extraction"
              solutionDescription="Extract and organize product attributes using AI to enhance your product data quality and improve filtering options."
            />
          );
        case "cb":
          return (
            <ProjectView 
              solutionPrefix="cb" 
              solutionName="Collection Builder"
              solutionDescription="Create optimized product collections based on data analysis to improve navigation and conversion rates."
            />
          );
        case "ho":
          return (
            <ProjectView 
              solutionPrefix="ho" 
              solutionName="Header Optimization"
              solutionDescription="Optimize your site's navigation structure for improved user experience and SEO performance."
            />
          );
        case "lhf":
          return (
            <ProjectView 
              solutionPrefix="lhf" 
              solutionName="Low Hanging Fruits"
              solutionDescription="Identify quick wins for SEO improvements based on your existing product and category pages."
            />
          );
        case "il":
          return (
            <ProjectView 
              solutionPrefix="il" 
              solutionName="Internal Links"
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

  return (
    <AppLayout>
      {renderContent()}
    </AppLayout>
  );
};

export default Index;
