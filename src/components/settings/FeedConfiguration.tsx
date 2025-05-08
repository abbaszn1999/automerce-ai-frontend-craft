
import React, { useState } from "react";
import FileUpload from "../ui/FileUpload";
import { Button } from "../ui/button";
import { useAppContext } from "@/context/AppContext";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import ProgressBar from "../ui/ProgressBar";

const FeedConfiguration: React.FC = () => {
  const { feedMode, addFeed } = useAppContext();
  const [file, setFile] = useState<File | null>(null);
  const [mappingComplete, setMappingComplete] = useState(false);
  const [step, setStep] = useState<"upload" | "mapping" | "complete">("upload");
  
  const handleFileChange = (uploadedFile: File | null) => {
    setFile(uploadedFile);
  };
  
  const handleContinue = () => {
    if (step === "upload" && file) {
      setStep("mapping");
    } else if (step === "mapping") {
      setMappingComplete(true);
      setStep("complete");
      
      // Add feed to the list
      if (file) {
        addFeed({
          id: `feed-${Date.now()}`,
          name: file.name,
          type: feedMode,
          date: new Date().toISOString(),
          status: "active"
        });
      }
    }
  };
  
  const getProgressPercentage = () => {
    switch (step) {
      case "upload": return 33;
      case "mapping": return 66;
      case "complete": return 100;
      default: return 0;
    }
  };
  
  const requiredColumns = feedMode === "plp" 
    ? ["category_url", "category_name", "products_count"] 
    : ["product_id", "product_url", "product_name", "price"];
  
  return (
    <div className="feed-configuration p-6">
      <h1 className="text-2xl font-bold mb-2">Feed Configuration</h1>
      <p className="text-gray-600 mb-6">
        Configure your {feedMode === "plp" ? "Product Listing Page" : "Product"} feed
      </p>
      
      <div className="mb-6">
        <ProgressBar progress={getProgressPercentage()} height="h-2" />
        <div className="flex justify-between mt-2 text-sm text-gray-500">
          <span>Upload Feed</span>
          <span>Column Mapping</span>
          <span>Complete</span>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-6">
        {step === "upload" && (
          <>
            <h2 className="text-lg font-medium mb-4">Upload Feed File</h2>
            <FileUpload
              id="feed-upload"
              statusId="feed-upload-status"
              acceptedTypes={[".csv", ".xlsx", ".xls"]}
              label={`Upload ${feedMode === "plp" ? "PLP" : "Product"} Feed`}
              requiredColumns={requiredColumns}
              onFileChange={handleFileChange}
              downloadTemplateLink={`/templates/${feedMode}-template.csv`}
            />
          </>
        )}
        
        {step === "mapping" && (
          <>
            <h2 className="text-lg font-medium mb-4">Column Mapping</h2>
            <p className="text-gray-600 mb-4">
              Map the columns in your feed to the required fields
            </p>
            
            <div className="space-y-4">
              {requiredColumns.map((column, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <div className="w-1/3">
                    <span className="font-medium">{column}</span>
                  </div>
                  <div className="w-2/3">
                    <select 
                      className="w-full p-2 border border-gray-300 rounded-md"
                      defaultValue={column}
                    >
                      <option value={column}>{column}</option>
                      <option value="column_1">column_1</option>
                      <option value="column_2">column_2</option>
                      <option value="column_3">column_3</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
        
        {step === "complete" && (
          <div className="text-center py-6">
            <div className="text-green-500 text-5xl mb-4">✓</div>
            <h3 className="text-xl font-medium mb-2">Configuration Complete</h3>
            <p className="text-gray-600 mb-6">
              Your feed has been successfully configured and is now available in the Feed List.
            </p>
            <Button 
              onClick={() => {
                setStep("upload");
                setFile(null);
                setMappingComplete(false);
              }}
              variant="outline"
            >
              Configure Another Feed
            </Button>
          </div>
        )}
        
        {step !== "complete" && (
          <div className="mt-6 flex justify-end">
            <Button
              onClick={handleContinue}
              className="bg-autommerce-orange hover:bg-autommerce-orange/90 text-white"
              disabled={(step === "upload" && !file)}
            >
              {step === "mapping" ? "Complete" : "Continue"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedConfiguration;
