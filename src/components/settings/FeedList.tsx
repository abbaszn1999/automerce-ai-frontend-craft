
import React from "react";
import { useAppContext } from "@/context/AppContext";
import { Button } from "../ui/button";
import { Edit, Trash2, Play, Pause } from "lucide-react";

const FeedList: React.FC = () => {
  const { feeds, deleteFeed, updateFeedStatus } = useAppContext();
  
  const handleToggleStatus = (feedId: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    updateFeedStatus(feedId, newStatus);
  };
  
  return (
    <div className="feed-list p-6">
      <h1 className="text-2xl font-bold mb-4">Feed List</h1>
      <p className="text-gray-600 mb-6">
        Manage your configured feeds
      </p>
      
      {feeds.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-6 text-center">
          <p className="text-gray-600 mb-4">No feeds configured yet</p>
          <Button 
            className="bg-autommerce-orange hover:bg-autommerce-orange/90 text-white"
            onClick={() => {
              // Navigate to feed configuration
            }}
          >
            Add Feed
          </Button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Date Added</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {feeds.map((feed) => (
                <tr key={feed.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{feed.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap capitalize">{feed.type}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(feed.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${feed.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}
                    >
                      {feed.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleToggleStatus(feed.id, feed.status)}
                      >
                        {feed.status === "active" ? 
                          <Pause size={16} /> : 
                          <Play size={16} />
                        }
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Edit size={16} />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => deleteFeed(feed.id)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default FeedList;
