
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useWorkspace } from "@/context/WorkspaceContext";
import { dataService } from "@/services/dataService";

const FeedList = ({ projectId, onSelectFeed }: { projectId: string, onSelectFeed: (feedId: string) => void }) => {
  const [feeds, setFeeds] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { currentWorkspace } = useWorkspace();

  useEffect(() => {
    if (projectId) {
      fetchFeeds();
    }
  }, [projectId]);

  const fetchFeeds = async () => {
    try {
      setIsLoading(true);
      // Using dataService instead of direct Supabase call
      const feedsData = await dataService.getFeeds(projectId);
      // Fixed the promise issue by properly handling the promise
      setFeeds(feedsData || []);
    } catch (error) {
      console.error("Error fetching feeds:", error);
      toast.error("Failed to load feeds");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateFeed = async () => {
    try {
      const feedName = `Feed ${feeds.length + 1}`;
      const newFeed = await dataService.createFeed(projectId, feedName);
      
      if (newFeed) {
        setFeeds([...feeds, newFeed]);
        toast.success(`Feed "${feedName}" created successfully`);
        // Select newly created feed
        onSelectFeed(newFeed.id);
      }
    } catch (error) {
      console.error("Error creating feed:", error);
      toast.error("Failed to create feed");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Feeds</h2>
        <Button onClick={handleCreateFeed} size="sm" className="h-8">
          <Plus className="h-4 w-4 mr-1" />
          Add Feed
        </Button>
      </div>
      
      {isLoading ? (
        <div className="py-4 text-center">Loading feeds...</div>
      ) : feeds.length === 0 ? (
        <div className="py-4 text-center text-muted-foreground">
          No feeds created yet. Add your first feed to get started.
        </div>
      ) : (
        <div className="space-y-2">
          {feeds.map((feed) => (
            <div 
              key={feed.id}
              className="p-3 border rounded-md cursor-pointer hover:bg-gray-50"
              onClick={() => onSelectFeed(feed.id)}
            >
              <div className="font-medium">{feed.name}</div>
              <div className="text-sm text-muted-foreground">
                {feed.row_count || 0} products
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FeedList;
