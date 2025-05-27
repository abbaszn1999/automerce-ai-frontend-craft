
import React from "react";
import { useAppContext } from "../../context/AppContext";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import FeedMode from "./FeedMode";
import FeedConfiguration from "./FeedConfiguration";
import FeedList from "./FeedList";
import AnalyticsConfig from "./AnalyticsConfig";
import JavascriptManager from "./JavascriptManager";

const Settings: React.FC = () => {
  const { settingsCurrentTab, setSettingsCurrentTab, setCurrentView } = useAppContext();

  const handleGoBack = () => {
    setCurrentView("project");
  };

  return (
    <div className="settings-container">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-gray-500">Configure your workspace settings</p>
        </div>
        <button
          className="btn btn-outline flex items-center gap-2"
          onClick={handleGoBack}
        >
          Back to Projects
        </button>
      </div>

      <Tabs value={settingsCurrentTab} onValueChange={(value) => setSettingsCurrentTab(value as any)}>
        <TabsList className="mb-6 border-b w-full bg-transparent p-0">
          <TabsTrigger 
            value="feed-mode" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-2"
          >
            Feed Mode
          </TabsTrigger>
          <TabsTrigger 
            value="feed-config" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-2"
          >
            Feed Configuration
          </TabsTrigger>
          <TabsTrigger 
            value="feed-list" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-2"
          >
            Feed List
          </TabsTrigger>
          <TabsTrigger 
            value="analytics-config" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-2"
          >
            Analytics Config
          </TabsTrigger>
          <TabsTrigger 
            value="js-manager" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-2"
          >
            Javascript Manager
          </TabsTrigger>
        </TabsList>

        <TabsContent value="feed-mode" className="mt-0">
          <FeedMode />
        </TabsContent>
        
        <TabsContent value="feed-config" className="mt-0">
          <FeedConfiguration />
        </TabsContent>
        
        <TabsContent value="feed-list" className="mt-0">
          <FeedList />
        </TabsContent>
        
        <TabsContent value="analytics-config" className="mt-0">
          <AnalyticsConfig />
        </TabsContent>
        
        <TabsContent value="js-manager" className="mt-0">
          <JavascriptManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
