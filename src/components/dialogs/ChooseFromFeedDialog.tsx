
import React, { useState } from "react";
import { useAppContext } from "@/context/AppContext";
import { toast } from "@/components/ui/sonner";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, FileText, Rows3 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ChooseFromFeedDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feedType?: "plp" | "product";
  onSelectFeed: (feedId: string) => void;
}

const ChooseFromFeedDialog: React.FC<ChooseFromFeedDialogProps> = ({ 
  open, 
  onOpenChange, 
  feedType,
  onSelectFeed 
}) => {
  const { feedList = [] } = useAppContext();
  const [selectedFeedId, setSelectedFeedId] = useState<string | null>(null);

  // Filter feeds by type if specified and feedList exists
  const availableFeeds = feedType && feedList 
    ? feedList.filter(feed => feed.type === feedType)
    : feedList || [];

  const handleSelect = () => {
    if (!selectedFeedId) {
      toast.error("Please select a feed");
      return;
    }

    onSelectFeed(selectedFeedId);
    toast.success("Feed selected successfully");
    setSelectedFeedId(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Choose from Feed List</DialogTitle>
          <DialogDescription>
            Select a {feedType ? (feedType === "plp" ? "PLP" : "Product") : ""} feed from your list.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {availableFeeds.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No feeds available</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]"></TableHead>
                  <TableHead>Feed Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Last Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {availableFeeds.map((feed) => (
                  <TableRow 
                    key={feed.id} 
                    className={`cursor-pointer ${selectedFeedId === feed.id ? 'bg-muted' : ''}`}
                    onClick={() => setSelectedFeedId(feed.id)}
                  >
                    <TableCell>
                      {selectedFeedId === feed.id && (
                        <Check className="h-4 w-4 text-primary" />
                      )}
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {feed.type === "plp" ? (
                          <Rows3 size={16} className="text-primary" />
                        ) : (
                          <FileText size={16} className="text-primary" />
                        )}
                        {feed.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      {feed.type === "plp" ? "Product Listing Page" : "Product Feed"}
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        feed.status === "Active" ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"
                      }`}>
                        {feed.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      {new Date(feed.lastUpdated).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSelect} disabled={!selectedFeedId}>
            Select Feed
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ChooseFromFeedDialog;
