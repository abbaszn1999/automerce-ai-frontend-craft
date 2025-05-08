
import React, { useState } from "react";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAppContext } from "@/context/AppContext";

const FeedMode: React.FC = () => {
  const { feedMode, setFeedMode } = useAppContext();
  const [selectedMode, setSelectedMode] = useState(feedMode);
  
  const handleSaveMode = () => {
    setFeedMode(selectedMode);
  };

  return (
    <div className="feed-mode p-6">
      <h1 className="text-2xl font-bold mb-6">Feed Mode Selection</h1>
      <p className="text-gray-600 mb-6">
        Select the type of feed you want to configure. This will determine how your data is processed.
      </p>
      
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <RadioGroup value={selectedMode} onValueChange={setSelectedMode} className="space-y-4">
          <div className="flex items-center space-x-2 border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
            <RadioGroupItem value="plp" id="plp" />
            <Label htmlFor="plp" className="flex flex-col cursor-pointer">
              <span className="font-medium">Product Listing Page Feed (PLP)</span>
              <span className="text-sm text-gray-500">For category and listing pages optimization</span>
            </Label>
          </div>
          
          <div className="flex items-center space-x-2 border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
            <RadioGroupItem value="product" id="product" />
            <Label htmlFor="product" className="flex flex-col cursor-pointer">
              <span className="font-medium">Product Feed</span>
              <span className="text-sm text-gray-500">For individual product pages optimization</span>
            </Label>
          </div>
        </RadioGroup>
        
        <div className="mt-6">
          <Button onClick={handleSaveMode} className="bg-autommerce-orange hover:bg-autommerce-orange/90 text-white">
            Save Feed Mode
          </Button>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-medium mb-2">Feed Mode Information</h2>
        <p className="text-sm text-gray-600 mb-4">
          {selectedMode === "plp" 
            ? "PLP Feed allows optimization of category and listing pages, improving navigation structure and SEO."
            : "Product Feed enables optimization of individual product pages, improving content and conversion rates."}
        </p>
        <p className="text-sm text-gray-600">
          After selecting your feed mode, proceed to Feed Configuration to upload and map your data.
        </p>
      </div>
    </div>
  );
};

export default FeedMode;
