
import React, { useState } from "react";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";

const JavaScriptManager: React.FC = () => {
  const [jsCode, setJsCode] = useState<string>(`// Your custom JavaScript code here
// This code will be injected into your website

document.addEventListener('DOMContentLoaded', function() {
  console.log('Autommerce.ai JavaScript loaded');
  
  // Example: Track product views
  if (document.querySelector('.product')) {
    const productId = document.querySelector('.product-id')?.textContent;
    console.log('Product view:', productId);
  }
});`);
  
  const [saved, setSaved] = useState(false);
  
  const handleSave = () => {
    // In a real implementation, this would save the JS code
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
    }, 3000);
  };
  
  return (
    <div className="javascript-manager p-6">
      <h1 className="text-2xl font-bold mb-4">JavaScript Manager</h1>
      <p className="text-gray-600 mb-6">
        Add custom JavaScript that will be injected into your website
      </p>
      
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-medium mb-4">Custom JavaScript</h2>
        <p className="text-gray-600 mb-4">
          This code will be executed on all pages of your website. You can use it to track events, modify the DOM, or add custom functionality.
        </p>
        
        <div className="mb-4">
          <div className="bg-gray-800 text-gray-200 rounded-t-lg px-4 py-2 text-sm font-mono">
            custom-script.js
          </div>
          <Textarea
            value={jsCode}
            onChange={(e) => setJsCode(e.target.value)}
            className="min-h-[300px] font-mono rounded-t-none"
          />
        </div>
        
        <div className="flex justify-between items-center">
          <div>
            {saved && (
              <span className="text-green-500 text-sm">
                ✓ JavaScript saved successfully
              </span>
            )}
          </div>
          <Button 
            onClick={handleSave}
            className="bg-autommerce-orange hover:bg-autommerce-orange/90 text-white"
          >
            Save JavaScript
          </Button>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
        <h2 className="text-lg font-medium mb-4">JavaScript Variables</h2>
        <p className="text-gray-600 mb-4">
          You can use these variables in your custom JavaScript:
        </p>
        
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="py-2 px-4">Variable</th>
              <th className="py-2 px-4">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="py-2 px-4 font-mono">AUTOMMERCE_CONFIG</td>
              <td className="py-2 px-4">Global configuration object</td>
            </tr>
            <tr className="border-b">
              <td className="py-2 px-4 font-mono">AUTOMMERCE_USER</td>
              <td className="py-2 px-4">Current user information</td>
            </tr>
            <tr>
              <td className="py-2 px-4 font-mono">AUTOMMERCE_TRACKING</td>
              <td className="py-2 px-4">Tracking functions</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default JavaScriptManager;
