
import React, { useEffect, useState } from "react";
import { useAppContext } from "../../context/AppContext";
import { useWorkspace } from "../../context/WorkspaceContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/utils/utils";
import { FileText, Rows3, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

const FeedList: React.FC = () => {
  const { setSettingsCurrentTab } = useAppContext();
  const { currentWorkspace } = useWorkspace();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [feeds, setFeeds] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeeds = async () => {
      if (!currentWorkspace) return;
      
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('feeds')
          .select('*')
          .eq('workspace_id', currentWorkspace.id)
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }

        setFeeds(data || []);
      } catch (err: any) {
        console.error('Error fetching feeds:', err);
        setError(err.message || 'Failed to load feeds');
        toast({
          title: "Error loading feeds",
          description: err.message || 'Failed to load feeds from the database',
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeeds();
  }, [toast, currentWorkspace]);

  const handleAddNewFeed = () => {
    setSettingsCurrentTab("feed-mode");
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold mb-2">Feed List</h2>
          <p className="text-gray-600">
            Manage your configured feeds for the {currentWorkspace?.name || 'workspace'}
          </p>
        </div>
        <Button 
          onClick={handleAddNewFeed} 
          className="btn-primary"
        >
          Add New Feed
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : error ? (
        <Card>
          <CardContent className="py-6 flex flex-col items-center justify-center">
            <div className="text-red-500 mb-3">
              <AlertCircle size={48} />
            </div>
            <h3 className="text-xl font-medium mb-2">Failed to load feeds</h3>
            <p className="text-gray-500 mb-4 text-center">{error}</p>
            <Button onClick={() => window.location.reload()} variant="outline">Retry</Button>
          </CardContent>
        </Card>
      ) : feeds.length === 0 ? (
        <Card>
          <CardContent className="py-12 flex flex-col items-center justify-center">
            <div className="text-gray-400 mb-3">
              <FileText size={48} />
            </div>
            <h3 className="text-xl font-medium mb-2">No feeds configured yet</h3>
            <p className="text-gray-500 mb-6 text-center max-w-md">
              Start by adding a new feed configuration to enhance your store's performance
            </p>
            <Button 
              onClick={handleAddNewFeed} 
              className="btn-primary"
            >
              Configure your first feed
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {feeds.map((feed) => (
            <Card key={feed.id} className="overflow-hidden">
              <div className="flex">
                <div className="bg-gray-100 p-4 flex items-center justify-center">
                  {feed.type === "plp" ? (
                    <Rows3 size={24} className="text-primary" />
                  ) : (
                    <FileText size={24} className="text-primary" />
                  )}
                </div>
                <CardContent className="p-4 flex-1">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">{feed.name}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      feed.status === "Active" ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"
                    }`}>
                      {feed.status}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      Type: {feed.type === "plp" ? "Product Listing Page" : "Product Feed"}
                    </span>
                    <span className="text-gray-500">
                      Last updated: {formatDate(feed.updated_at)}
                    </span>
                  </div>
                </CardContent>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default FeedList;
