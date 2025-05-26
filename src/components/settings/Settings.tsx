
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import FeedConfiguration from './FeedConfiguration';
import FeedList from './FeedList';
import FeedMode from './FeedMode';
import AnalyticsConfig from './AnalyticsConfig';
import JavascriptManager from './JavascriptManager';
import { useWorkspace } from '@/context/WorkspaceContext';

const Settings: React.FC = () => {
  const { currentWorkspace } = useWorkspace();
  const [selectedFeedId, setSelectedFeedId] = useState<string>("");

  if (!currentWorkspace) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">No Workspace Selected</h2>
          <p className="text-gray-600">Please select a workspace to view settings.</p>
        </div>
      </div>
    );
  }

  const handleSelectFeed = (feedId: string) => {
    setSelectedFeedId(feedId);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your workspace settings and configurations
        </p>
      </div>

      <Separator />

      <Tabs defaultValue="feeds" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="feeds">Feeds</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="javascript">Javascript</TabsTrigger>
          <TabsTrigger value="general">General</TabsTrigger>
        </TabsList>

        <TabsContent value="feeds" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Feed Mode</CardTitle>
                <CardDescription>
                  Configure how feeds are handled in your workspace
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FeedMode />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Feed Configuration</CardTitle>
                <CardDescription>
                  Set up and configure your data feeds
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FeedConfiguration />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Feed Management</CardTitle>
              <CardDescription>
                View and manage all your configured feeds
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FeedList />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Analytics Configuration</CardTitle>
              <CardDescription>
                Configure Google Search Console and other analytics tools
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AnalyticsConfig />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="javascript" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Javascript Management</CardTitle>
              <CardDescription>
                Manage custom javascript code for your applications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <JavascriptManager />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Configure general workspace settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                General settings configuration will be available soon.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
