
import React from "react";
import { Button } from "@/components/ui/button";
import SaveToFeedButton from "./SaveToFeedButton";
import { toast } from "@/components/ui/sonner";

interface ModuleOutputActionsProps {
  moduleType: "ae" | "cb" | "ho" | "lhf" | "il" | "opb";
  outputType: "plp" | "product";
  onExportCSV?: () => void;
  onExportExcel?: () => void;
  onExportResults?: () => void; // For general results export
  onPushToCMS?: () => void;
}

const ModuleOutputActions: React.FC<ModuleOutputActionsProps> = ({
  moduleType,
  outputType,
  onExportCSV,
  onExportExcel,
  onExportResults,
  onPushToCMS
}) => {
  // Function to get the appropriate export button label based on the module type
  const getExportLabel = () => {
    switch (moduleType) {
      case "lhf":
        return `Export ${outputType === "plp" ? "PLP" : "Product"} Fruits (CSV)`;
      case "il":
        return "Export Results";
      case "opb":
        return `Export Results (CSV)`;
      default:
        return `Export ${outputType === "plp" ? "PLP" : "Product"} ${onExportResults ? " (CSV)" : ""}`;
    }
  };

  return (
    <div className="flex flex-wrap gap-2 justify-end items-center">
      {onExportCSV && (
        <Button variant="outline" size="sm" onClick={onExportCSV}>
          Export CSV
        </Button>
      )}
      
      {onExportExcel && (
        <Button variant="outline" size="sm" onClick={onExportExcel}>
          Export Excel
        </Button>
      )}

      {onExportResults && (
        <Button variant="outline" size="sm" onClick={onExportResults}>
          {getExportLabel()}
        </Button>
      )}
      
      <SaveToFeedButton 
        feedType={outputType}
        source={moduleType}
        size="sm"
        variant="outline"
      />
      
      {onPushToCMS && (
        <Button variant="default" size="sm" onClick={onPushToCMS} className="bg-orange-500 hover:bg-orange-600">
          Push to CMS
        </Button>
      )}
    </div>
  );
};

export default ModuleOutputActions;
