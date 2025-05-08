
import React, { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Search, Settings, Globe } from "lucide-react";

const AnalyticsConfig: React.FC = () => {
  const [googleConnected, setGoogleConnected] = useState(false);
  const [cmsConnected, setCmsConnected] = useState<string | null>(null);
  
  const handleGoogleConnect = () => {
    // In a real implementation, this would authenticate with Google
    setGoogleConnected(!googleConnected);
  };
  
  const handleCMSConnect = (cmsType: string) => {
    // In a real implementation, this would authenticate with the CMS
    setCmsConnected(cmsType === cmsConnected ? null : cmsType);
  };
  
  return (
    <div className="analytics-config p-6">
      <h1 className="text-2xl font-bold mb-4">Analytics Configuration</h1>
      <p className="text-gray-600 mb-6">
        Connect your analytics and CMS platforms
      </p>
      
      {/* Google Search Console Connection */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-lg font-medium mb-4 flex items-center">
          <Search className="mr-2" size={24} /> Google Search Console
        </h2>
        <p className="text-gray-600 mb-4">
          Connect to Google Search Console to sync performance data
        </p>
        
        {googleConnected ? (
          <div className="p-4 bg-green-50 rounded-lg mb-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                  <span className="text-green-500 text-xl">✓</span>
                </div>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">Connected to Google Search Console</h3>
                <p className="mt-1 text-sm text-green-700">
                  Your account is successfully connected
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-4">
            <Input 
              placeholder="Enter Google Search Console property URL"
              className="mb-4"
            />
          </div>
        )}
        
        <Button 
          onClick={handleGoogleConnect}
          className={googleConnected ? "bg-gray-200 hover:bg-gray-300 text-gray-700" : "bg-autommerce-orange hover:bg-autommerce-orange/90 text-white"}
        >
          {googleConnected ? "Disconnect" : "Connect"}
        </Button>
      </div>
      
      {/* CMS Platform Connection */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-medium mb-4">CMS Platform</h2>
        <p className="text-gray-600 mb-4">
          Connect to your content management system
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* WordPress */}
          <div 
            className={`p-4 rounded-lg border cursor-pointer transition-all ${
              cmsConnected === "wordpress" ? "border-autommerce-orange bg-orange-50" : "border-gray-200 hover:border-autommerce-orange/50"
            }`}
            onClick={() => handleCMSConnect("wordpress")}
          >
            <div className="flex flex-col items-center text-center">
              <Globe size={32} className="mb-2" />
              <h3 className="font-medium">WordPress</h3>
              <p className="text-sm text-gray-600 mt-2">
                {cmsConnected === "wordpress" ? "Connected" : "Connect WordPress site"}
              </p>
            </div>
          </div>
          
          {/* Shopify */}
          <div 
            className={`p-4 rounded-lg border cursor-pointer transition-all ${
              cmsConnected === "shopify" ? "border-autommerce-orange bg-orange-50" : "border-gray-200 hover:border-autommerce-orange/50"
            }`}
            onClick={() => handleCMSConnect("shopify")}
          >
            <div className="flex flex-col items-center text-center">
              <Globe size={32} className="mb-2" />
              <h3 className="font-medium">Shopify</h3>
              <p className="text-sm text-gray-600 mt-2">
                {cmsConnected === "shopify" ? "Connected" : "Connect Shopify store"}
              </p>
            </div>
          </div>
          
          {/* Magento */}
          <div className="p-4 rounded-lg border border-gray-200 bg-gray-50">
            <div className="flex flex-col items-center text-center opacity-60">
              <svg className="w-8 h-8 mb-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0L1.75 6v12L12 24l10.25-6V6L12 0zm-1.75 15.75L8 13.5V7.5h1.5v5.25L11 14l-0.75 1.75zm5.5 0L14 14l1.5-1.25V7.5H17v6l-1.25 2.25z"/>
              </svg>
              <h3 className="font-medium">Magento</h3>
              <p className="text-sm text-gray-600 mt-2">
                Coming Soon
              </p>
              <span className="mt-2 px-2 py-0.5 text-xs bg-gray-200 rounded-full">Coming Soon</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsConfig;
