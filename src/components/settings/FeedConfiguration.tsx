
import React, { useState } from "react";
import { useAppContext } from "../../context/AppContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import FileUpload from "@/components/ui/FileUpload";
import { FileText, ArrowDown, List } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import ChooseFromFeedDialog from "@/components/dialogs/ChooseFromFeedDialog";

interface ColumnMapping {
  sourceColumn: string;
  targetColumn: string;
}

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
      // Simulate reading column headers from the file
      const mockColumns = selectedFeedMode === "plp" 
        ? ["Category Name", "Category ID", "Parent Category", "URL", "Available Filters", "Products Count"]
        : ["Product Name", "SKU", "Price", "Description", "Image URLs", "Variants", "Attributes", "Categories"];
      
      setSampleColumns(mockColumns);
      setStep("mapping");
      setSelectedFeedId(null); // Reset selected feed when manually uploading
    }
  };

  const handleColumnMapping = (sourceColumn: string, targetColumn: string) => {
    // Update existing mapping or add new one
    const existingIndex = mappedColumns.findIndex(col => col.sourceColumn === sourceColumn);
    
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
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-6">
              <FileUpload
                id="feed-upload"
                acceptedTypes={[".csv", ".xlsx"]}
                onFileChange={handleFileUpload}
                label={`Upload your ${selectedFeedMode === "plp" ? "PLP" : "Product"} feed file`}
                requiredColumns={targetColumns}
                downloadTemplateLink="#"
              />
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or</span>
                </div>
              </div>
              
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={() => setChooseFeedDialogOpen(true)}
              >
                <List className="mr-2 h-4 w-4" />
                Choose from Feed List
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === "mapping" && (
        <div>
          <Card className="mb-6">
            <CardContent className="pt-6">
              <h3 className="font-medium mb-4">Map your columns</h3>
              <div className="space-y-4">
                {sampleColumns.map((column, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="w-1/3 p-2 bg-gray-100 rounded">{column}</div>
                    <ArrowDown className="text-gray-400" />
                    <select
                      className="w-1/3 p-2 border rounded"
                      onChange={(e) => handleColumnMapping(column, e.target.value)}
                      value={mappedColumns.find(c => c.sourceColumn === column)?.targetColumn || ""}
                    >
                      <option value="">-- Select target column --</option>
                      {targetColumns.map((target) => (
                        <option key={target} value={target}>
                          {target.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <div className="flex justify-end">
            <Button 
              onClick={handleSaveMapping} 
              disabled={mappedColumns.length < Math.min(3, sampleColumns.length)}
              className="btn-primary"
            >
              Save Column Mapping
            </Button>
          </div>
        </div>
      )}

      {step === "finalize" && (
        <div>
          <Card className="mb-6">
            <CardContent className="pt-6">
              <h3 className="font-medium mb-4">Finalize Feed Configuration</h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Feed Name
                </label>
                <input
                  type="text"
                  className="w-full p-2 border rounded"
                  placeholder="Enter a name for this feed"
                  value={feedName}
                  onChange={(e) => setFeedName(e.target.value)}
                />
              </div>
              
              <h4 className="font-medium mt-6 mb-2">Column Mapping Summary</h4>
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="text-left p-2">Source Column</th>
                    <th className="text-left p-2">Target Column</th>
                  </tr>
                </thead>
                <tbody>
                  {mappedColumns.map((mapping, index) => (
                    <tr key={index} className="border-t">
                      <td className="p-2">{mapping.sourceColumn}</td>
                      <td className="p-2">{mapping.targetColumn}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
          
          <div className="flex justify-end gap-3">
            <Button 
              onClick={() => setStep("mapping")} 
              variant="outline"
            >
              Back to Mapping
            </Button>
            <Button 
              onClick={handleFinalizeFeed} 
              disabled={!feedName.trim()}
              className="btn-primary"
            >
              Save Feed Configuration
            </Button>
          </div>
        </div>
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
