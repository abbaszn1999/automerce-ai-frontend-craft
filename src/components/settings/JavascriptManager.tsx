
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Code, Link, List } from "lucide-react";

const JavascriptManager: React.FC = () => {
  // State for the active tab
  const [activeTab, setActiveTab] = useState<string>("custom-js");
  
  // State for the different script types
  const [customJsCode, setCustomJsCode] = useState<string>(
`// Custom JavaScript to be injected into your store
// Example: Track Custom Events
document.addEventListener('DOMContentLoaded', function() {
  console.log('Custom JS loaded');
  
  // Track product clicks
  document.querySelectorAll('.product-item').forEach(function(item) {
    item.addEventListener('click', function(e) {
      const productId = e.currentTarget.getAttribute('data-product-id');
      const productName = e.currentTarget.getAttribute('data-product-name');
      
      console.log('Product clicked:', { productId, productName });
      // Add your tracking logic here
    });
  });
});`);

  const [linkBoostingCode, setLinkBoostingCode] = useState<string>(
`// Link Boosting JavaScript
// This script helps improve internal linking structure
document.addEventListener('DOMContentLoaded', function() {
  console.log('Link Boosting JS loaded');
  
  // Example: Add rel attributes to external links
  document.querySelectorAll('a[href^="http"]').forEach(function(link) {
    if (!link.hostname.includes(window.location.hostname)) {
      link.setAttribute('rel', 'noopener noreferrer');
    }
  });
  
  // Add your custom link boosting logic here
});`);

  const [collectionsClusterCode, setCollectionsClusterCode] = useState<string>(
`// Collections Cluster JavaScript
// This script helps organize and display product collections
document.addEventListener('DOMContentLoaded', function() {
  console.log('Collections Cluster JS loaded');
  
  // Example: Group related products
  const relatedProducts = document.querySelectorAll('.related-product');
  
  // Add your collection clustering logic here
});`);

  // State for tracking saved code per tab
  const [savedCustomCode, setSavedCustomCode] = useState<string>(customJsCode);
  const [savedLinkBoostingCode, setSavedLinkBoostingCode] = useState<string>(linkBoostingCode);
  const [savedCollectionsCode, setSavedCollectionsCode] = useState<string>(collectionsClusterCode);

  const handleSaveScript = () => {
    switch (activeTab) {
      case "custom-js":
        setSavedCustomCode(customJsCode);
        break;
      case "link-boosting":
        setSavedLinkBoostingCode(linkBoostingCode);
        break;
      case "collections-cluster":
        setSavedCollectionsCode(collectionsClusterCode);
        break;
    }
    toast.success("JavaScript code saved successfully!");
  };

  const handleResetScript = () => {
    switch (activeTab) {
      case "custom-js":
        setCustomJsCode(savedCustomCode);
        break;
      case "link-boosting":
        setLinkBoostingCode(savedLinkBoostingCode);
        break;
      case "collections-cluster":
        setCollectionsCode(savedCollectionsCode);
        break;
    }
    toast.info("Changes discarded");
  };

  const isChanged = () => {
    switch (activeTab) {
      case "custom-js":
        return customJsCode !== savedCustomCode;
      case "link-boosting":
        return linkBoostingCode !== savedLinkBoostingCode;
      case "collections-cluster":
        return collectionsClusterCode !== savedCollectionsCode;
      default:
        return false;
    }
  };

  const getCurrentCode = () => {
    switch (activeTab) {
      case "custom-js":
        return customJsCode;
      case "link-boosting":
        return linkBoostingCode;
      case "collections-cluster":
        return collectionsClusterCode;
      default:
        return "";
    }
  };

  const handleCodeChange = (value: string) => {
    switch (activeTab) {
      case "custom-js":
        setCustomJsCode(value);
        break;
      case "link-boosting":
        setLinkBoostingCode(value);
        break;
      case "collections-cluster":
        setCollectionsCode(value);
        break;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">JavaScript Manager</h2>
        <p className="text-gray-600">
          Add custom JavaScript to enhance your store's functionality
        </p>
      </div>

      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="mb-6"
      >
        <TabsList className="grid grid-cols-3 w-full mb-6">
          <TabsTrigger 
            value="custom-js"
            className="flex items-center gap-2 py-6"
          >
            <Code size={18} />
            <span>Custom JavaScript</span>
          </TabsTrigger>
          <TabsTrigger 
            value="link-boosting"
            className="flex items-center gap-2 py-6"
          >
            <Link size={18} />
            <span>Link Boosting</span>
          </TabsTrigger>
          <TabsTrigger 
            value="collections-cluster"
            className="flex items-center gap-2 py-6"
          >
            <List size={18} />
            <span>Collections Cluster</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-0">
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {activeTab === "custom-js" && "Custom JavaScript"}
                  {activeTab === "link-boosting" && "Link Boosting"}
                  {activeTab === "collections-cluster" && "Collections Cluster"}
                </label>
                <div className="border rounded overflow-hidden">
                  <div className="bg-gray-100 px-4 py-2 border-b flex justify-between items-center">
                    <span className="text-sm font-medium">Editor</span>
                    <div className="space-x-2">
                      <button className="text-xs px-2 py-1 rounded bg-gray-200 hover:bg-gray-300">
                        Format
                      </button>
                    </div>
                  </div>
                  <textarea 
                    className="w-full h-80 p-4 font-mono text-sm"
                    value={getCurrentCode()}
                    onChange={(e) => handleCodeChange(e.target.value)}
                    spellCheck="false"
                  />
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 p-3 rounded text-amber-700 text-sm mb-4">
                <p className="font-medium">Important Notes:</p>
                <ul className="list-disc pl-5 mt-1 space-y-1">
                  <li>Custom scripts will be executed on all pages of your store</li>
                  <li>Use this feature carefully as it can affect your site's performance</li>
                  <li>Avoid adding external dependencies that may cause conflicts</li>
                </ul>
              </div>
            </CardContent>
          </Card>
          
          <div className="flex justify-end gap-3">
            <Button 
              onClick={handleResetScript} 
              variant="outline"
              disabled={!isChanged()}
            >
              Discard Changes
            </Button>
            <Button 
              onClick={handleSaveScript} 
              className="btn-primary"
              disabled={!isChanged()}
            >
              Save Script
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default JavascriptManager;
