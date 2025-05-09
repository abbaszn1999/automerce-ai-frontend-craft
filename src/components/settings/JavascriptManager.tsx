
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

const JavascriptManager: React.FC = () => {
  // State for general custom JS
  const [jsCode, setJsCode] = useState<string>(
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

  // State for link boosting JS
  const [linkBoostingJsCode, setLinkBoostingJsCode] = useState<string>(
`// Link Boosting JavaScript
// This script helps optimize internal linking on your store
document.addEventListener('DOMContentLoaded', function() {
  console.log('Link Boosting JS loaded');
  
  // Track link clicks for analytics
  document.querySelectorAll('a').forEach(function(link) {
    link.addEventListener('click', function(e) {
      const href = e.currentTarget.getAttribute('href');
      const linkText = e.currentTarget.textContent;
      
      console.log('Link clicked:', { href, linkText });
      // Add your link tracking logic here
    });
  });
});`);

  // State for collections cluster JS
  const [collectionsClusterJsCode, setCollectionsClusterJsCode] = useState<string>(
`// Collections Cluster JavaScript
// This script enhances the collection navigation experience
document.addEventListener('DOMContentLoaded', function() {
  console.log('Collections Cluster JS loaded');
  
  // Track collection views
  document.querySelectorAll('.collection-item').forEach(function(item) {
    item.addEventListener('click', function(e) {
      const collectionId = e.currentTarget.getAttribute('data-collection-id');
      const collectionName = e.currentTarget.getAttribute('data-collection-name');
      
      console.log('Collection clicked:', { collectionId, collectionName });
      // Add your collection tracking logic here
    });
  });
});`);

  // State for saved versions
  const [savedJsCode, setSavedJsCode] = useState<string>(jsCode);
  const [savedLinkBoostingJsCode, setSavedLinkBoostingJsCode] = useState<string>(linkBoostingJsCode);
  const [savedCollectionsClusterJsCode, setSavedCollectionsClusterJsCode] = useState<string>(collectionsClusterJsCode);

  // Current active tab
  const [activeTab, setActiveTab] = useState<string>("custom");

  const handleSaveScript = () => {
    switch (activeTab) {
      case "custom":
        setSavedJsCode(jsCode);
        toast.success("Custom JavaScript code saved successfully!");
        break;
      case "link-boosting":
        setSavedLinkBoostingJsCode(linkBoostingJsCode);
        toast.success("Link Boosting JavaScript code saved successfully!");
        break;
      case "collections-cluster":
        setSavedCollectionsClusterJsCode(collectionsClusterJsCode);
        toast.success("Collections Cluster JavaScript code saved successfully!");
        break;
    }
  };

  const handleResetScript = () => {
    switch (activeTab) {
      case "custom":
        setJsCode(savedJsCode);
        toast.info("Custom JavaScript changes discarded");
        break;
      case "link-boosting":
        setLinkBoostingJsCode(savedLinkBoostingJsCode);
        toast.info("Link Boosting JavaScript changes discarded");
        break;
      case "collections-cluster":
        setCollectionsClusterJsCode(savedCollectionsClusterJsCode);
        toast.info("Collections Cluster JavaScript changes discarded");
        break;
    }
  };

  // Check if current code is different from saved code
  const hasChanges = () => {
    switch (activeTab) {
      case "custom":
        return jsCode !== savedJsCode;
      case "link-boosting":
        return linkBoostingJsCode !== savedLinkBoostingJsCode;
      case "collections-cluster":
        return collectionsClusterJsCode !== savedCollectionsClusterJsCode;
      default:
        return false;
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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="custom">Custom JavaScript</TabsTrigger>
          <TabsTrigger value="link-boosting">Link Boosting</TabsTrigger>
          <TabsTrigger value="collections-cluster">Collections Cluster</TabsTrigger>
        </TabsList>

        <TabsContent value="custom">
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Custom JavaScript
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
                  <Textarea 
                    className="w-full h-80 p-4 font-mono text-sm border-0 resize-none focus-visible:ring-0"
                    value={jsCode}
                    onChange={(e) => setJsCode(e.target.value)}
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
        </TabsContent>

        <TabsContent value="link-boosting">
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Link Boosting JavaScript
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
                  <Textarea 
                    className="w-full h-80 p-4 font-mono text-sm border-0 resize-none focus-visible:ring-0"
                    value={linkBoostingJsCode}
                    onChange={(e) => setLinkBoostingJsCode(e.target.value)}
                    spellCheck="false"
                  />
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 p-3 rounded text-amber-700 text-sm mb-4">
                <p className="font-medium">Link Boosting Notes:</p>
                <ul className="list-disc pl-5 mt-1 space-y-1">
                  <li>This script enhances internal linking and tracking</li>
                  <li>Custom link boosting scripts will run on all product and category pages</li>
                  <li>Use data attributes to target specific elements on your store</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="collections-cluster">
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Collections Cluster JavaScript
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
                  <Textarea 
                    className="w-full h-80 p-4 font-mono text-sm border-0 resize-none focus-visible:ring-0"
                    value={collectionsClusterJsCode}
                    onChange={(e) => setCollectionsClusterJsCode(e.target.value)}
                    spellCheck="false"
                  />
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 p-3 rounded text-amber-700 text-sm mb-4">
                <p className="font-medium">Collections Cluster Notes:</p>
                <ul className="list-disc pl-5 mt-1 space-y-1">
                  <li>This script optimizes collection navigation and discovery</li>
                  <li>Use these scripts to enhance user experience with collections</li>
                  <li>Collection scripts run on collection and product listing pages</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-end gap-3">
        <Button 
          onClick={handleResetScript} 
          variant="outline"
          disabled={!hasChanges()}
        >
          Discard Changes
        </Button>
        <Button 
          onClick={handleSaveScript} 
          className="btn-primary"
          disabled={!hasChanges()}
        >
          Save Script
        </Button>
      </div>
    </div>
  );
};

export default JavascriptManager;
