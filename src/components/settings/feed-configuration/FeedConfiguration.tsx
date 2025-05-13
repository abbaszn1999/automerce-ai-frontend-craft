
import React, { useState } from "react";
import { useAppContext } from "../../../context/AppContext";
import { toast } from "@/hooks/use-toast";
import ChooseFromFeedDialog from "@/components/dialogs/ChooseFromFeedDialog";
import { ColumnMapping, FeedModeType } from "./types";
import UploadStep from "./UploadStep";
import MappingStep from "./MappingStep";
import FinalizeStep from "./FinalizeStep";

const FeedConfiguration: React.FC = () => {
  const { selectedFeedMode, setFeedMappingColumns, setSettingsCurrentTab, addFeedToList, feedList } = useAppContext();
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [sampleColumns, setSampleColumns] = useState<string[]>([]);
  const [mappedColumns, setMappedColumns] = useState<ColumnMapping[]>([]);
  const [feedName, setFeedName] = useState<string>("");
  const [step, setStep] = useState<"upload" | "mapping" | "finalize">("upload");
  const [chooseFeedDialogOpen, setChooseFeedDialogOpen] = useState(false);
  const [selectedFeedId, setSelectedFeedId] = useState<string | null>(null);

  // Target columns based on feed type
  const targetColumns = selectedFeedMode === "plp" 
    ? ["category_name", "category_id", "parent_category", "url_path", "filters"]
    : ["product_name", "product_id", "price", "description", "images", "variants", "attributes"];

  const handleFileUpload = (file: File | null) => {
    if (file) {
      setUploadedFile(file);
      setSelectedFeedId(null); // Reset selected feed when manually uploading
    }
  };

  // Handle columns extracted from the uploaded file
  const handleColumnsExtracted = (columns: string[]) => {
    setSampleColumns(columns);
    setStep("mapping");
    console.log("Extracted columns:", columns);
  };

  const handleColumnMapping = (sourceColumn: string, targetColumn: string) => {
    // Update existing mapping or add new one
    const existingIndex = mappedColumns.findIndex(col => col.targetColumn === targetColumn);
    
    if (existingIndex >= 0) {
      const updated = [...mappedColumns];
      updated[existingIndex] = { sourceColumn, targetColumn };
      setMappedColumns(updated);
    } else {
      setMappedColumns([...mappedColumns, { sourceColumn, targetColumn }]);
    }
  };

  const handleSaveMapping = () => {
    setFeedMappingColumns(mappedColumns);
    setStep("finalize");
  };

  const handleFinalizeFeed = () => {
    if (!feedName.trim()) {
      toast.error("Please enter a feed name");
      return;
    }
    
    addFeedToList(feedName, selectedFeedMode);
    toast.success("Feed configuration saved successfully!");
    setSettingsCurrentTab("feed-list");
  };

  const handleSelectFeed = (feedId: string) => {
    setSelectedFeedId(feedId);
    const selectedFeed = feedList.find(feed => feed.id === feedId);
    
    if (selectedFeed) {
      // Mock data: In a real app, you would load the actual columns from the feed
      const mockColumns = selectedFeed.type === "plp" 
        ? ["Category Name", "Category ID", "Parent Category", "URL", "Available Filters", "Products Count"]
        : ["Product Name", "SKU", "Price", "Description", "Image URLs", "Variants", "Attributes", "Categories"];
      
      setSampleColumns(mockColumns);
      setStep("mapping");
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">
          {selectedFeedMode === "plp" ? "PLP Feed Configuration" : "Product Feed Configuration"}
        </h2>
        <p className="text-gray-600">
          {step === "upload" && "Upload your feed file to begin the configuration process."}
          {step === "mapping" && "Map your feed columns to our system columns."}
          {step === "finalize" && "Review and finalize your feed configuration."}
        </p>
      </div>

      {step === "upload" && (
        <UploadStep 
          selectedFeedMode={selectedFeedMode} 
          targetColumns={targetColumns}
          onFileUpload={handleFileUpload}
          onColumnsExtracted={handleColumnsExtracted}
          onOpenChooseFeedDialog={() => setChooseFeedDialogOpen(true)}
        />
      )}

      {step === "mapping" && (
        <MappingStep
          targetColumns={targetColumns}
          sampleColumns={sampleColumns}
          mappedColumns={mappedColumns}
          onColumnMapping={handleColumnMapping}
          onSaveMapping={handleSaveMapping}
        />
      )}

      {step === "finalize" && (
        <FinalizeStep
          feedName={feedName}
          setFeedName={setFeedName}
          mappedColumns={mappedColumns}
          onGoBack={() => setStep("mapping")}
          onFinalize={handleFinalizeFeed}
        />
      )}
      
      <ChooseFromFeedDialog
        open={chooseFeedDialogOpen}
        onOpenChange={setChooseFeedDialogOpen}
        feedType={selectedFeedMode}
        onSelectFeed={handleSelectFeed}
      />
    </div>
  );
};

export default FeedConfiguration;
