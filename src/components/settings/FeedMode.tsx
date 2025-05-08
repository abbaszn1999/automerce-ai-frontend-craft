
import React from "react";
import { useAppContext } from "../../context/AppContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Rows3 } from "lucide-react";

const FeedMode: React.FC = () => {
  const { selectedFeedMode, setSelectedFeedMode, setSettingsCurrentTab } = useAppContext();

  const handleSelectMode = (mode: "plp" | "product") => {
    setSelectedFeedMode(mode);
  };

  const handleContinue = () => {
    setSettingsCurrentTab("feed-config");
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">Select Feed Mode</h2>
        <p className="text-gray-600">
          Choose the type of feed you want to configure. Each feed type optimizes different aspects of your store.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className={`cursor-pointer transition-all ${selectedFeedMode === "plp" ? "border-primary ring-2 ring-primary/20" : ""}`} 
          onClick={() => handleSelectMode("plp")}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <Rows3 size={24} className="text-primary" />
              {selectedFeedMode === "plp" && (
                <div className="bg-primary text-white text-xs px-2 py-1 rounded-full">
                  Selected
                </div>
              )}
            </div>
            <CardTitle className="text-xl">Product Listing Page (PLP)</CardTitle>
            <CardDescription>
              Configure feed for category and listing pages
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              This feed type helps optimize category pages and product listings. It focuses on improving navigation, filters, and overall listing structure.
            </p>
          </CardContent>
          <CardFooter className="flex justify-between border-t pt-4">
            <div className="text-sm text-gray-500">Recommended for: Category pages</div>
          </CardFooter>
        </Card>

        <Card className={`cursor-pointer transition-all ${selectedFeedMode === "product" ? "border-primary ring-2 ring-primary/20" : ""}`} 
          onClick={() => handleSelectMode("product")}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <FileText size={24} className="text-primary" />
              {selectedFeedMode === "product" && (
                <div className="bg-primary text-white text-xs px-2 py-1 rounded-full">
                  Selected
                </div>
              )}
            </div>
            <CardTitle className="text-xl">Product Feed</CardTitle>
            <CardDescription>
              Configure feed for individual product pages
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              This feed type is optimized for product detail pages. It focuses on enhancing product information, specifications, and related products.
            </p>
          </CardContent>
          <CardFooter className="flex justify-between border-t pt-4">
            <div className="text-sm text-gray-500">Recommended for: Product pages</div>
          </CardFooter>
        </Card>
      </div>

      <div className="mt-8 flex justify-end">
        <Button 
          onClick={handleContinue} 
          disabled={!selectedFeedMode}
          className="btn-primary"
        >
          Continue to Feed Configuration
        </Button>
      </div>
    </div>
  );
};

export default FeedMode;
