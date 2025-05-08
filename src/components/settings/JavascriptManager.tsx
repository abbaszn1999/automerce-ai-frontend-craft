
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";

const JavascriptManager: React.FC = () => {
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

  const [savedCode, setSavedCode] = useState<string>(jsCode);

  const handleSaveScript = () => {
    setSavedCode(jsCode);
    toast.success("JavaScript code saved successfully!");
  };

  const handleResetScript = () => {
    setJsCode(savedCode);
    toast.info("Changes discarded");
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">JavaScript Manager</h2>
        <p className="text-gray-600">
          Add custom JavaScript to enhance your store's functionality
        </p>
      </div>

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
              <textarea 
                className="w-full h-80 p-4 font-mono text-sm"
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
      
      <div className="flex justify-end gap-3">
        <Button 
          onClick={handleResetScript} 
          variant="outline"
          disabled={jsCode === savedCode}
        >
          Discard Changes
        </Button>
        <Button 
          onClick={handleSaveScript} 
          className="btn-primary"
          disabled={jsCode === savedCode}
        >
          Save Script
        </Button>
      </div>
    </div>
  );
};

export default JavascriptManager;
