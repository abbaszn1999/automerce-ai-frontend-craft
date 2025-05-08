
import React from "react";
import { useAppContext } from "@/context/AppContext";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";

// Import settings components
import FeedMode from "./FeedMode";
import FeedConfiguration from "./FeedConfiguration";
import FeedList from "./FeedList";
import AnalyticsConfig from "./AnalyticsConfig";
import JavaScriptManager from "./JavaScriptManager";

const Settings: React.FC = () => {
  const { currentSettingsTab, setCurrentSettingsTab } = useAppContext();
  
  return (
    <div className="settings">
      {/* Feed Settings Title */}
      <div className="mb-4 px-6">
        <h2 className="text-sm font-medium text-gray-500">Feed Settings</h2>
      </div>

      <Tabs 
        value={currentSettingsTab} 
        onValueChange={(value) => setCurrentSettingsTab(value as any)}
      >
        <div className="border-b border-gray-200">
          <div className="px-6">
            <TabsList className="mt-1 bg-transparent space-x-8">
              <div className="flex space-x-6">
                <TabsTrigger 
                  value="feed-mode"
                  className="pb-4 text-sm font-medium border-b-2 border-transparent data-[state=active]:border-autommerce-orange data-[state=active]:text-autommerce-orange"
                >
                  Feed Mode
                </TabsTrigger>
                <TabsTrigger 
                  value="feed-configuration"
                  className="pb-4 text-sm font-medium border-b-2 border-transparent data-[state=active]:border-autommerce-orange data-[state=active]:text-autommerce-orange"
                >
                  Feed Configuration
                </TabsTrigger>
                <TabsTrigger 
                  value="feed-list"
                  className="pb-4 text-sm font-medium border-b-2 border-transparent data-[state=active]:border-autommerce-orange data-[state=active]:text-autommerce-orange"
                >
                  Feed List
                </TabsTrigger>
              </div>
            </TabsList>
          </div>
        </div>
        
        {/* Configuration Title */}
        <div className="mb-4 px-6 mt-8">
          <h2 className="text-sm font-medium text-gray-500">Configuration</h2>
        </div>
        
        <div className="border-b border-gray-200">
          <div className="px-6">
            <TabsList className="mt-1 bg-transparent space-x-8">
              <div className="flex space-x-6">
                <TabsTrigger 
                  value="analytics-config"
                  className="pb-4 text-sm font-medium border-b-2 border-transparent data-[state=active]:border-autommerce-orange data-[state=active]:text-autommerce-orange"
                >
                  Analytics Config
                </TabsTrigger>
                <TabsTrigger 
                  value="javascript-manager"
                  className="pb-4 text-sm font-medium border-b-2 border-transparent data-[state=active]:border-autommerce-orange data-[state=active]:text-autommerce-orange"
                >
                  Javascript Manager
                </TabsTrigger>
              </div>
            </TabsList>
          </div>
        </div>
        
        <TabsContent value="feed-mode">
          <FeedMode />
        </TabsContent>
        
        <TabsContent value="feed-configuration">
          <FeedConfiguration />
        </TabsContent>
        
        <TabsContent value="feed-list">
          <FeedList />
        </TabsContent>
        
        <TabsContent value="analytics-config">
          <AnalyticsConfig />
        </TabsContent>
        
        <TabsContent value="javascript-manager">
          <JavaScriptManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
