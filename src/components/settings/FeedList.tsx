
import React from "react";
import { useAppContext } from "../../context/AppContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/utils/utils";
import { FileText, Rows3 } from "lucide-react";

const FeedList: React.FC = () => {
  const { feedList, setSettingsCurrentTab } = useAppContext();

  const handleAddNewFeed = () => {
    setSettingsCurrentTab("feed-mode");
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold mb-2">Feed List</h2>
          <p className="text-gray-600">
            Manage your configured feeds for the store
          </p>
        </div>
        <Button 
          onClick={handleAddNewFeed} 
          className="btn-primary"
        >
          Add New Feed
        </Button>
      </div>

      {feedList.length === 0 ? (
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
          {feedList.map((feed) => (
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
                      Last updated: {formatDate(feed.lastUpdated)}
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
